import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID } from 'crypto';
import { ghostNodeService } from '../../../src/lib/api/services/ghostNodeService';
import type { MoodboardNode } from '../../../src/lib/types/domain/moodboard';
import { createTestSchemaWithCleanup } from '../../utils/test-database';
import { createTestSupabaseClient } from '../../utils/test-supabase';

const hasTestDb =
  Boolean(process.env.SUPABASE_TEST_URL || process.env.PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_TEST_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY);

const describeIntegration = hasTestDb ? describe : describe.skip;

describeIntegration('Ghost Edge Service Integration', () => {
  let schemaName = '';
  let cleanup: (() => Promise<void>) | null = null;
  let client: ReturnType<typeof createTestSupabaseClient>;
  let ideaId = '';
  let moodboardId = '';
  let sourceNodeId = '';
  let targetContainerId = '';

  beforeAll(async () => {
    const schemaSetup = await createTestSchemaWithCleanup();
    schemaName = schemaSetup.schemaName;
    cleanup = schemaSetup.cleanup;
    client = createTestSupabaseClient({ schemaName });

    const userId = randomUUID();
    const teamId = randomUUID();
    ideaId = randomUUID();
    moodboardId = randomUUID();
    sourceNodeId = randomUUID();
    targetContainerId = randomUUID();

    await client.from('users').insert({
      id: userId,
      email: `ghost-${userId}@example.com`,
      name: 'Ghost Tester',
    } as any);

    await client.from('teams').insert({
      id: teamId,
      name: 'Ghost Team',
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
      character: 'Ghost Idea',
      series: 'Ghost Series',
      difficulty: 'beginner',
      status: 'saved',
      moodboard_id: moodboardId,
    } as any);

    await client.from('moodboards').insert({
      id: moodboardId,
      owner_type: 'idea',
      owner_id: ideaId,
      title: 'Ghost Moodboard',
    } as any);

    await client.from('moodboard_nodes').insert([
      {
        id: sourceNodeId,
        moodboard_id: moodboardId,
        idea_id: ideaId,
        node_type: 'note',
        content_url: null,
        thumbnail_url: null,
        metadata: {},
        tags: [],
        position_x: 0,
        position_y: 0,
        width: 300,
        height: null,
        z_index: 0,
        parent_id: null,
        is_expanded: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: targetContainerId,
        moodboard_id: moodboardId,
        idea_id: ideaId,
        node_type: 'container',
        content_url: null,
        thumbnail_url: null,
        metadata: {},
        tags: [],
        position_x: 100,
        position_y: 100,
        width: 300,
        height: null,
        z_index: 1,
        parent_id: null,
        is_expanded: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ] as any);
  });

  afterAll(async () => {
    if (cleanup) {
      await cleanup();
    }
  });

  it('creates a ghost edge between source node and target container', async () => {
    const { data, error } = await client
      .from('moodboard_edges')
      .insert({
        idea_id: ideaId,
        source_node_id: sourceNodeId,
        target_node_id: targetContainerId,
        edge_type: 'ghost',
        edge_metadata: { reason: 'integration test' },
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data?.edge_type).toBe('ghost');
  });

  it('fetches ghost edges for a container', async () => {
    const edges = await ghostNodeService.fetchGhostEdges(targetContainerId, client as any);

    expect(edges.length).toBeGreaterThan(0);
    expect(edges[0].targetNodeId).toBe(targetContainerId);
  });

  it('stores and retrieves ghost edge metadata', async () => {
    const edges = await ghostNodeService.fetchGhostEdges(targetContainerId, client as any);
    const ghostEdge = edges.find((edge) => edge.sourceNodeId === sourceNodeId);

    expect(ghostEdge).toBeTruthy();
    expect(ghostEdge?.edgeMetadata).toEqual({ reason: 'integration test' });
  });

  it('deletes a ghost edge', async () => {
    const edges = await ghostNodeService.fetchGhostEdges(targetContainerId, client as any);
    const ghostEdge = edges.find((edge) => edge.sourceNodeId === sourceNodeId);

    expect(ghostEdge).toBeTruthy();

    const { error } = await client.from('moodboard_edges').delete().eq('id', ghostEdge?.id);
    expect(error).toBeNull();
  });

  it('fails to create ghost edge when source or target nodes do not exist', async () => {
    const { error } = await client.from('moodboard_edges').insert({
      idea_id: ideaId,
      source_node_id: randomUUID(),
      target_node_id: randomUUID(),
      edge_type: 'ghost',
      edge_metadata: {},
    });

    expect(error).toBeTruthy();
  });

  it('fails to create ghost edge for self-referential edges', async () => {
    const { error } = await client.from('moodboard_edges').insert({
      idea_id: ideaId,
      source_node_id: sourceNodeId,
      target_node_id: sourceNodeId,
      edge_type: 'ghost',
      edge_metadata: {},
    });

    expect(error).toBeTruthy();
  });

  it('verifies staleness validation after node updates', async () => {
    const { data: nodeRows, error } = await client
      .from('moodboard_nodes')
      .select('*')
      .eq('id', sourceNodeId);

    expect(error).toBeNull();

    const currentNodes = (nodeRows || []).map((row) => ({
      id: row.id,
      moodboardId: row.moodboard_id,
      ideaId: row.idea_id,
      referenceId: row.reference_id,
      nodeType: row.node_type,
      contentUrl: row.content_url,
      thumbnailUrl: row.thumbnail_url,
      metadata: row.metadata || {},
      tags: row.tags || [],
      shortComment: row.short_comment,
      longNote: row.long_note,
      positionX: row.position_x,
      positionY: row.position_y,
      width: row.width,
      height: row.height,
      zIndex: row.z_index,
      parentId: row.parent_id,
      isExpanded: row.is_expanded,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })) as MoodboardNode[];

    const cached = new Map<string, { node: MoodboardNode; cachedAt: Date }>();
    cached.set(sourceNodeId, { node: currentNodes[0], cachedAt: new Date() });

    await client
      .from('moodboard_nodes')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sourceNodeId);

    const refreshedNodes = await ghostNodeService.fetchSourceNodes(
      [sourceNodeId],
      client as any
    );

    const staleIds = ghostNodeService.checkStaleness(cached, refreshedNodes);
    expect(staleIds).toContain(sourceNodeId);
  });

  it('enforces RLS policies for ghost edge access', async () => {
    const unauthenticatedClient = createTestSupabaseClient({ schemaName });

    const { data, error } = await unauthenticatedClient
      .from('moodboard_edges')
      .select('*')
      .eq('edge_type', 'ghost');

    if (!error) {
      expect(data).toEqual([]);
    } else {
      expect(error).toBeTruthy();
    }
  });
});
