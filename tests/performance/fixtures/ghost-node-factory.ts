import { faker } from '@faker-js/faker';

export interface SeedContext {
  moodboardId: string;
  ideaId: string;
}

export interface MoodboardNodeSeed {
  id: string;
  idea_id: string;
  moodboard_id: string;
  node_type: string;
  container_type?: string | null;
  linked_moodboard_id?: string | null;
  title?: string | null;
  content_url?: string | null;
  thumbnail_url?: string | null;
  metadata?: Record<string, unknown>;
  tags?: string[];
  short_comment?: string | null;
  long_note?: string | null;
  position_x?: number;
  position_y?: number;
  width?: number | null;
  height?: number | null;
  z_index?: number | null;
  parent_id?: string | null;
  is_expanded?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export interface MoodboardEdgeSeed {
  id?: string;
  idea_id: string;
  moodboard_id?: string | null;
  source_node_id: string;
  target_node_id: string;
  edge_type: string;
  label?: string | null;
  created_at?: string;
}

interface MoodboardSeedResult {
  containers: MoodboardNodeSeed[];
  nodes: MoodboardNodeSeed[];
}

function ensureContext(context?: SeedContext): SeedContext {
  return (
    context || {
      moodboardId: faker.string.uuid(),
      ideaId: faker.string.uuid(),
    }
  );
}

function createBaseNode(
  params: Partial<MoodboardNodeSeed> & Pick<MoodboardNodeSeed, 'node_type' | 'idea_id' | 'moodboard_id'>
): MoodboardNodeSeed {
  const createdAt = faker.date.recent({ days: 30 }).toISOString();
  const updatedAt = faker.date.recent({ days: 7 }).toISOString();

  return {
    id: faker.string.uuid(),
    content_url: faker.internet.url(),
    thumbnail_url: faker.image.urlPicsumPhotos({ width: 320, height: 240 }),
    metadata: {
      source: faker.company.name(),
      note: faker.lorem.sentence(),
    },
    tags: faker.helpers.uniqueArray(() => faker.word.sample(), faker.number.int({ min: 1, max: 4 })),
    short_comment: faker.lorem.sentence(),
    long_note: faker.lorem.paragraph(),
    position_x: faker.number.int({ min: 0, max: 1200 }),
    position_y: faker.number.int({ min: 0, max: 900 }),
    width: faker.number.int({ min: 220, max: 360 }),
    height: faker.number.int({ min: 180, max: 420 }),
    z_index: faker.number.int({ min: 0, max: 5 }),
    is_expanded: true,
    created_at: createdAt,
    updated_at: updatedAt,
    ...params,
  };
}

function createContainerNode(context: SeedContext, parentId?: string | null): MoodboardNodeSeed {
  return createBaseNode({
    idea_id: context.ideaId,
    moodboard_id: context.moodboardId,
    node_type: 'container',
    container_type: faker.helpers.arrayElement(['group', 'character']),
    title: faker.commerce.productName(),
    content_url: null,
    thumbnail_url: null,
    parent_id: parentId ?? null,
  });
}

function createReferenceNode(context: SeedContext, parentId?: string | null): MoodboardNodeSeed {
  return createBaseNode({
    idea_id: context.ideaId,
    moodboard_id: context.moodboardId,
    node_type: faker.helpers.arrayElement(['note', 'image', 'link', 'social_media']),
    title: faker.lorem.words({ min: 2, max: 4 }),
    parent_id: parentId ?? null,
  });
}

export function createMoodboardWithContainers(
  containerCount: number,
  nodesPerContainer: number,
  context?: SeedContext
): MoodboardSeedResult {
  const resolvedContext = ensureContext(context);
  const containers: MoodboardNodeSeed[] = [];
  const nodes: MoodboardNodeSeed[] = [];

  for (let i = 0; i < containerCount; i += 1) {
    const container = createContainerNode(resolvedContext);
    containers.push(container);

    for (let j = 0; j < nodesPerContainer; j += 1) {
      nodes.push(createReferenceNode(resolvedContext, container.id));
    }
  }

  return { containers, nodes };
}

export function createGhostEdges(
  sourceNodes: Array<{ id: string }>,
  targetContainers: Array<{ id: string }>,
  edgeCount: number,
  context?: SeedContext
): MoodboardEdgeSeed[] {
  const resolvedContext = ensureContext(context);
  const edges: MoodboardEdgeSeed[] = [];
  const usedPairs = new Set<string>();

  for (let i = 0; i < edgeCount; i += 1) {
    const source = faker.helpers.arrayElement(sourceNodes);
    const target = faker.helpers.arrayElement(targetContainers);
    const pairKey = `${source.id}:${target.id}`;

    if (usedPairs.has(pairKey)) {
      i -= 1;
      continue;
    }

    usedPairs.add(pairKey);
    edges.push({
      idea_id: resolvedContext.ideaId,
      moodboard_id: resolvedContext.moodboardId,
      source_node_id: source.id,
      target_node_id: target.id,
      edge_type: faker.helpers.arrayElement([
        'reference',
        'connection',
        'alternative',
        'shared_resource',
        'supplier_option',
      ]),
      label: faker.lorem.words({ min: 1, max: 3 }),
      created_at: faker.date.recent({ days: 10 }).toISOString(),
    });
  }

  return edges;
}

export function createDeepHierarchy(
  levels: number,
  nodesPerLevel: number,
  context?: SeedContext
): {
  containers: MoodboardNodeSeed[];
  nodes: MoodboardNodeSeed[];
  deepestContainerId: string;
} {
  const resolvedContext = ensureContext(context);
  const containers: MoodboardNodeSeed[] = [];
  const nodes: MoodboardNodeSeed[] = [];

  let parentId: string | null = null;
  let deepestContainerId = '';

  for (let level = 0; level < levels; level += 1) {
    const container = createContainerNode(resolvedContext, parentId);
    containers.push(container);
    parentId = container.id;
    deepestContainerId = container.id;

    for (let i = 0; i < nodesPerLevel; i += 1) {
      nodes.push(createReferenceNode(resolvedContext, container.id));
    }
  }

  return { containers, nodes, deepestContainerId };
}

export function seedPerformanceData(moodboardId: string): {
  ideaId: string;
  moodboardId: string;
  containers: MoodboardNodeSeed[];
  nodes: MoodboardNodeSeed[];
  edges: MoodboardEdgeSeed[];
} {
  const ideaId = faker.string.uuid();
  const context: SeedContext = { moodboardId, ideaId };

  const containerCount = 10;
  const totalNodeTarget = 200;
  const nodesPerContainer = Math.floor((totalNodeTarget - containerCount) / containerCount);

  const { containers, nodes } = createMoodboardWithContainers(
    containerCount,
    nodesPerContainer,
    context
  );

  const primaryContainer = containers[0];
  const primarySources = nodes.filter((node) => node.parent_id !== primaryContainer.id);
  const primaryEdges = createGhostEdges(primarySources, [primaryContainer], 20, context);
  const remainingEdges = createGhostEdges(nodes, containers.slice(1), 30, context);

  return {
    ideaId,
    moodboardId,
    containers,
    nodes,
    edges: [...primaryEdges, ...remainingEdges],
  };
}
