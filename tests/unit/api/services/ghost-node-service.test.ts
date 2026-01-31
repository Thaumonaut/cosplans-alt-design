import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ghostNodeService } from '$lib/api/services/ghostNodeService';
import type { MoodboardNode } from '$lib/types/domain/moodboard';
import { createMockSupabaseClient } from '../../mocks/supabase';

function createQueryBuilder(response: { data: any; error: any }) {
  const chain: any = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    in: vi.fn(() => chain),
    then: vi.fn((resolve) => resolve(response)),
  };

  return chain;
}

describe('ghostNodeService', () => {
  const containerId = 'container-1';
  const nodeId = 'node-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchGhostEdges() returns edges for given container ID', async () => {
    const mockSupabase = createMockSupabaseClient();
    const edgeRows = [
      {
        id: 'edge-1',
        idea_id: 'idea-1',
        source_node_id: 'node-1',
        target_node_id: containerId,
        edge_type: 'ghost',
        label: null,
        edge_metadata: { reason: 'unit test' },
        created_at: new Date().toISOString(),
      },
    ];

    mockSupabase.from.mockReturnValueOnce(
      createQueryBuilder({ data: edgeRows, error: null })
    );

    const edges = await ghostNodeService.fetchGhostEdges(containerId, mockSupabase);

    expect(edges).toHaveLength(1);
    expect(edges[0].targetNodeId).toBe(containerId);
    expect(edges[0].edgeMetadata).toEqual({ reason: 'unit test' });
  });

  it('fetchGhostEdges() returns empty array when no edges exist', async () => {
    const mockSupabase = createMockSupabaseClient();
    mockSupabase.from.mockReturnValueOnce(
      createQueryBuilder({ data: [], error: null })
    );

    const edges = await ghostNodeService.fetchGhostEdges(containerId, mockSupabase);

    expect(edges).toEqual([]);
  });

  it('fetchSourceNodes() returns nodes for given node IDs', async () => {
    const mockSupabase = createMockSupabaseClient();
    const nodeRows = [
      {
        id: nodeId,
        moodboard_id: 'moodboard-1',
        idea_id: 'idea-1',
        reference_id: null,
        node_type: 'note',
        container_type: null,
        linked_moodboard_id: null,
        title: null,
        content_url: null,
        thumbnail_url: null,
        metadata: {},
        tags: [],
        short_comment: null,
        long_note: null,
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
    ];

    mockSupabase.from.mockReturnValueOnce(
      createQueryBuilder({ data: nodeRows, error: null })
    );

    const nodes = await ghostNodeService.fetchSourceNodes([nodeId], mockSupabase);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe(nodeId);
  });

  it('fetchSourceNodes() handles empty input array', async () => {
    const mockSupabase = createMockSupabaseClient();

    const nodes = await ghostNodeService.fetchSourceNodes([], mockSupabase);

    expect(nodes).toEqual([]);
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('checkStaleness() identifies stale nodes by comparing timestamps', () => {
    const cachedNodes = new Map<string, { node: MoodboardNode; cachedAt: Date }>();
    const cachedAt = new Date();

    const cachedNode: MoodboardNode = {
      id: nodeId,
      moodboardId: 'moodboard-1',
      ideaId: 'idea-1',
      referenceId: null,
      nodeType: 'note',
      contentUrl: null,
      thumbnailUrl: null,
      metadata: {},
      tags: [],
      shortComment: null,
      longNote: null,
      positionX: 0,
      positionY: 0,
      width: 300,
      height: null,
      zIndex: 0,
      parentId: null,
      isExpanded: true,
      createdAt: new Date().toISOString(),
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    cachedNodes.set(nodeId, { node: cachedNode, cachedAt });

    const currentNodes: MoodboardNode[] = [
      {
        ...cachedNode,
        updatedAt: '2024-02-01T00:00:00.000Z',
      },
    ];

    const stale = ghostNodeService.checkStaleness(cachedNodes, currentNodes);

    expect(stale).toEqual([nodeId]);
  });

  it('checkStaleness() handles invalid timestamps gracefully', () => {
    const cachedNodes = new Map<string, { node: MoodboardNode; cachedAt: Date }>();
    const cachedAt = new Date();

    const cachedNode: MoodboardNode = {
      id: nodeId,
      moodboardId: 'moodboard-1',
      ideaId: 'idea-1',
      referenceId: null,
      nodeType: 'note',
      contentUrl: null,
      thumbnailUrl: null,
      metadata: {},
      tags: [],
      shortComment: null,
      longNote: null,
      positionX: 0,
      positionY: 0,
      width: 300,
      height: null,
      zIndex: 0,
      parentId: null,
      isExpanded: true,
      createdAt: new Date().toISOString(),
      updatedAt: 'not-a-date',
    };

    cachedNodes.set(nodeId, { node: cachedNode, cachedAt });

    const currentNodes: MoodboardNode[] = [
      {
        ...cachedNode,
        updatedAt: '2024-02-01T00:00:00.000Z',
      },
    ];

    const stale = ghostNodeService.checkStaleness(cachedNodes, currentNodes);

    expect(stale).toEqual([nodeId]);
  });

  it('checkStaleness() returns empty array when all nodes are fresh', () => {
    const cachedNodes = new Map<string, { node: MoodboardNode; cachedAt: Date }>();
    const cachedAt = new Date();

    const cachedNode: MoodboardNode = {
      id: nodeId,
      moodboardId: 'moodboard-1',
      ideaId: 'idea-1',
      referenceId: null,
      nodeType: 'note',
      contentUrl: null,
      thumbnailUrl: null,
      metadata: {},
      tags: [],
      shortComment: null,
      longNote: null,
      positionX: 0,
      positionY: 0,
      width: 300,
      height: null,
      zIndex: 0,
      parentId: null,
      isExpanded: true,
      createdAt: new Date().toISOString(),
      updatedAt: '2024-02-01T00:00:00.000Z',
    };

    cachedNodes.set(nodeId, { node: cachedNode, cachedAt });

    const currentNodes: MoodboardNode[] = [
      {
        ...cachedNode,
        updatedAt: '2024-02-01T00:00:00.000Z',
      },
    ];

    const stale = ghostNodeService.checkStaleness(cachedNodes, currentNodes);

    expect(stale).toEqual([]);
  });

  it('loadContainerWithGhosts() orchestrates full ghost loading flow', async () => {
    const mockSupabase = createMockSupabaseClient();
    const edgeRows = [
      {
        id: 'edge-1',
        idea_id: 'idea-1',
        source_node_id: nodeId,
        target_node_id: containerId,
        edge_type: 'ghost',
        label: null,
        edge_metadata: {},
        created_at: new Date().toISOString(),
      },
    ];

    const nodeRows = [
      {
        id: nodeId,
        moodboard_id: 'moodboard-1',
        idea_id: 'idea-1',
        reference_id: null,
        node_type: 'note',
        container_type: null,
        linked_moodboard_id: null,
        title: null,
        content_url: null,
        thumbnail_url: null,
        metadata: {},
        tags: [],
        short_comment: null,
        long_note: null,
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
    ];

    mockSupabase.from
      .mockReturnValueOnce(createQueryBuilder({ data: edgeRows, error: null }))
      .mockReturnValueOnce(createQueryBuilder({ data: nodeRows, error: null }));

    const result = await ghostNodeService.loadContainerWithGhosts(
      containerId,
      undefined,
      mockSupabase
    );

    expect(result.edges).toHaveLength(1);
    expect(result.nodes).toHaveLength(1);
    expect(result.staleNodeIds).toEqual([]);
  });

  it('loadContainerWithGhosts() returns stale node IDs when cache provided', async () => {
    const mockSupabase = createMockSupabaseClient();
    const edgeRows = [
      {
        id: 'edge-1',
        idea_id: 'idea-1',
        source_node_id: nodeId,
        target_node_id: containerId,
        edge_type: 'ghost',
        label: null,
        edge_metadata: {},
        created_at: new Date().toISOString(),
      },
    ];

    const nodeRows = [
      {
        id: nodeId,
        moodboard_id: 'moodboard-1',
        idea_id: 'idea-1',
        reference_id: null,
        node_type: 'note',
        container_type: null,
        linked_moodboard_id: null,
        title: null,
        content_url: null,
        thumbnail_url: null,
        metadata: {},
        tags: [],
        short_comment: null,
        long_note: null,
        position_x: 0,
        position_y: 0,
        width: 300,
        height: null,
        z_index: 0,
        parent_id: null,
        is_expanded: true,
        created_at: new Date().toISOString(),
        updated_at: '2024-02-01T00:00:00.000Z',
      },
    ];

    mockSupabase.from
      .mockReturnValueOnce(createQueryBuilder({ data: edgeRows, error: null }))
      .mockReturnValueOnce(createQueryBuilder({ data: nodeRows, error: null }));

    const cachedGhosts = new Map<string, { node: MoodboardNode; cachedAt: Date }>();
    cachedGhosts.set(nodeId, {
      node: {
        id: nodeId,
        moodboardId: 'moodboard-1',
        ideaId: 'idea-1',
        referenceId: null,
        nodeType: 'note',
        contentUrl: null,
        thumbnailUrl: null,
        metadata: {},
        tags: [],
        shortComment: null,
        longNote: null,
        positionX: 0,
        positionY: 0,
        width: 300,
        height: null,
        zIndex: 0,
        parentId: null,
        isExpanded: true,
        createdAt: new Date().toISOString(),
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      cachedAt: new Date(),
    });

    const result = await ghostNodeService.loadContainerWithGhosts(
      containerId,
      cachedGhosts,
      mockSupabase
    );

    expect(result.staleNodeIds).toEqual([nodeId]);
  });
});
