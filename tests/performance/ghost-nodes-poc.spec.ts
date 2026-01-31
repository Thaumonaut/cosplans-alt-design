import { faker } from '@faker-js/faker';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

import { ghostNodeService } from '../../src/lib/api/services/ghostNodeService';
import { mapMoodboardNodeFromDb, type MoodboardNode } from '../../src/lib/types/domain/moodboard';
import type { Database } from '../../src/lib/types/supabase';

import {
  createDeepHierarchy,
  createGhostEdges,
  seedPerformanceData,
  type MoodboardEdgeSeed,
  type MoodboardNodeSeed,
} from './fixtures/ghost-node-factory';
import {
  assertPerformance,
  measureMemoryUsage,
  measureQueryTime,
  runBenchmark,
} from './utils/performance-helpers';
import { createTestSchemaWithCleanup } from '../utils/test-database';
import { createTestSupabaseClient } from '../utils/test-supabase';

const FACTORY_SEED = 90210;

async function insertInChunks<T>(
  client: SupabaseClient<Database>,
  table: string,
  records: T[],
  chunkSize: number = 100
): Promise<void> {
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { error } = await client.from(table).insert(chunk as any);
    if (error) throw error;
  }
}

describe('Ghost nodes POC performance', () => {
  let schemaName = '';
  let cleanup: (() => Promise<void>) | null = null;
  let client: SupabaseClient<Database>;
  let moodboardId = '';
  let ideaId = '';
  let containers: MoodboardNodeSeed[] = [];
  let nodes: MoodboardNodeSeed[] = [];
  let edges: MoodboardEdgeSeed[] = [];
  let deepestContainerId = '';
  let baselineDuration = 0;

  beforeAll(async () => {
    faker.seed(FACTORY_SEED);

    const schemaSetup = await createTestSchemaWithCleanup();
    schemaName = schemaSetup.schemaName;
    cleanup = schemaSetup.cleanup;
    client = createTestSupabaseClient({ schemaName });

    const userId = faker.string.uuid();
    const teamId = faker.string.uuid();
    moodboardId = faker.string.uuid();

    const seed = seedPerformanceData(moodboardId);
    ideaId = seed.ideaId;
    containers = seed.containers;
    nodes = seed.nodes;
    edges = seed.edges;

    await client.from('users').insert({
      id: userId,
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
    } as any);

    await client.from('teams').insert({
      id: teamId,
      name: faker.company.name(),
      type: 'personal',
      created_by: userId,
    } as any);

    await client.from('team_members').insert({
      team_id: teamId,
      user_id: userId,
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString(),
    } as any);

    await client.from('ideas').insert({
      id: ideaId,
      team_id: teamId,
      character: faker.person.firstName(),
      series: faker.lorem.words({ min: 1, max: 2 }),
      difficulty: 'beginner',
      status: 'saved',
      moodboard_id: moodboardId,
    } as any);

    await client.from('moodboards').insert({
      id: moodboardId,
      owner_type: 'idea',
      owner_id: ideaId,
      title: faker.company.catchPhrase(),
    } as any);

    await insertInChunks(client, 'moodboard_nodes', [...containers, ...nodes]);
    await insertInChunks(client, 'moodboard_edges', edges);

    const deepHierarchy = createDeepHierarchy(3, 8, { moodboardId, ideaId });
    deepestContainerId = deepHierarchy.deepestContainerId;
    await insertInChunks(client, 'moodboard_nodes', [...deepHierarchy.containers, ...deepHierarchy.nodes]);

    const deepEdges = createGhostEdges(deepHierarchy.nodes, [{ id: deepHierarchy.deepestContainerId }], 12, {
      moodboardId,
      ideaId,
    });
    await insertInChunks(client, 'moodboard_edges', deepEdges);
  });

  afterAll(async () => {
    if (cleanup) {
      await cleanup();
    }
  });

  it('Scenario 1: Baseline Performance', async () => {
    const targetContainerId = containers[0]?.id;
    expect(targetContainerId).toBeTruthy();

    let ghostNodes: MoodboardNode[] = [];
    baselineDuration = await measureQueryTime(async () => {
      const result = await ghostNodeService.loadContainerWithGhosts(
        targetContainerId,
        undefined,
        client
      );
      ghostNodes = result.nodes;
    });

    assertPerformance(baselineDuration, 100, 'Ghost query should complete under 100ms');
    expect(ghostNodes.length).toBe(20);

    const uniqueIds = new Set(ghostNodes.map((node) => node.id));
    expect(uniqueIds.size).toBe(ghostNodes.length);
  });

  it('Scenario 2: Deep Nesting', async () => {
    expect(deepestContainerId).toBeTruthy();
    if (baselineDuration === 0) {
      const targetContainerId = containers[0]?.id;
      baselineDuration = await measureQueryTime(async () => {
        await ghostNodeService.loadContainerWithGhosts(targetContainerId, undefined, client);
      });
    }
    let duration = 0;

    duration = await measureQueryTime(async () => {
      await ghostNodeService.loadContainerWithGhosts(deepestContainerId, undefined, client);
    });

    assertPerformance(duration, 100, 'Deep nesting query should complete under 100ms');
    expect(duration).toBeLessThanOrEqual(baselineDuration * 1.5 + 1);
  });

  it('Scenario 3: Staleness Validation', async () => {
    const targetContainerId = containers[0]?.id;
    const initial = await ghostNodeService.loadContainerWithGhosts(
      targetContainerId,
      undefined,
      client
    );

    const cachedGhosts = new Map<string, { node: MoodboardNode; cachedAt: Date }>();
    const cachedAt = new Date();
    for (const node of initial.nodes) {
      cachedGhosts.set(node.id, { node, cachedAt });
    }

    const updatedNodeId = initial.nodes[0]?.id;
    await client
      .from('moodboard_nodes')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', updatedNodeId);

    const currentNodes = await ghostNodeService.fetchSourceNodes(
      initial.nodes.map((node) => node.id),
      client
    );

    let stalenessDuration = 0;
    let staleNodeIds: string[] = [];

    stalenessDuration = await measureQueryTime(async () => {
      staleNodeIds = ghostNodeService.checkStaleness(cachedGhosts, currentNodes);
    });

    assertPerformance(stalenessDuration, 10, 'Staleness check should complete under 10ms');
    expect(staleNodeIds).toContain(updatedNodeId);
  });

  it('Scenario 4: Storage Pattern Comparison', async () => {
    const { data, error } = await client
      .from('moodboard_nodes')
      .select('*')
      .eq('moodboard_id', moodboardId);

    if (error) throw error;

    const mappedNodes = (data || []).map(mapMoodboardNodeFromDb);
    const targetContainerId = containers[1]?.id;
    expect(targetContainerId).toBeTruthy();

    const nodesByContainer = new Map<string, MoodboardNode[]>();
    for (const node of mappedNodes) {
      if (!node.parentId) continue;
      const bucket = nodesByContainer.get(node.parentId) ?? [];
      bucket.push(node);
      nodesByContainer.set(node.parentId, bucket);
    }

    const mapBenchmark = await runBenchmark('map-lookup', async () => {
      nodesByContainer.get(targetContainerId);
    }, 300);

    const arrayBenchmark = await runBenchmark('array-filter', async () => {
      mappedNodes.filter((node) => node.parentId === targetContainerId);
    }, 100);

    expect(mapBenchmark.avg).toBeLessThan(arrayBenchmark.avg);
  });

  it('Scenario 5: Memory Usage', async () => {
    const { deltaBytes } = await measureMemoryUsage(() => {
      const nodesByContainer = new Map<string, MoodboardNode[]>();
      for (const node of nodes) {
        if (!node.parent_id) continue;
        const bucket = nodesByContainer.get(node.parent_id) ?? [];
        bucket.push(node as any);
        nodesByContainer.set(node.parent_id, bucket);
      }

      const ghostCache = new Map<string, Map<string, { node: MoodboardNodeSeed; cachedAt: Date }>>();
      const containerCache = new Map<string, { node: MoodboardNodeSeed; cachedAt: Date }>();
      const cachedAt = new Date();
      for (const node of nodes.slice(0, 50)) {
        containerCache.set(node.id, { node, cachedAt });
      }
      ghostCache.set(containers[0].id, containerCache);

      return { nodesByContainer, ghostCache };
    });

    const deltaMb = deltaBytes / (1024 * 1024);
    expect(deltaMb).toBeLessThan(50);
  });
});
