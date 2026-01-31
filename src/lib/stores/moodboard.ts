/**
 * Moodboard Store
 * Feature: 006-brainstorming-moodboard
 *
 * Reactive store for moodboard nodes and edges state management.
 */

import { writable } from 'svelte/store';
import { ghostNodeService, type GhostCacheEntry } from '$lib/api/services/ghostNodeService';
import { moodboardService } from '$lib/api/services/moodboardService';
import { supabase } from '$lib/supabase';
import type {
  MoodboardNode,
  MoodboardNodeCreate,
  MoodboardNodeUpdate,
  MoodboardEdge,
  MoodboardEdgeCreate,
  MoodboardProjectReferenceCreate,
} from '$lib/types/domain/moodboard';
import { mapMoodboardNodeFromDb } from '$lib/types/domain/moodboard';

interface MoodboardState {
  nodes: MoodboardNode[];
  edges: MoodboardEdge[];
  loading: boolean;
  error: string | null;
  currentIdeaId: string | null;
  currentProjectId: string | null;
  nodesByContainer: Map<string, MoodboardNode[]>;
  loadedContainers: Map<string, Date>;
  ghostCache: Map<string, Map<string, GhostCacheEntry>>;
}

const CONTAINER_CACHE_TTL_MS = 5 * 60 * 1000;
const ROOT_CONTAINER_ID = '__root__';

function buildNodesByContainer(nodes: MoodboardNode[]): Map<string, MoodboardNode[]> {
  const map = new Map<string, MoodboardNode[]>();

  for (const node of nodes) {
    const key = node.parentId ?? ROOT_CONTAINER_ID;
    const bucket = map.get(key) ?? [];
    bucket.push(node);
    map.set(key, bucket);
  }

  return map;
}

function mergeNodes(existing: MoodboardNode[], incoming: MoodboardNode[]): MoodboardNode[] {
  const byId = new Map<string, MoodboardNode>(existing.map((node) => [node.id, node]));
  for (const node of incoming) {
    byId.set(node.id, node);
  }
  return Array.from(byId.values());
}

function createMoodboardStore() {
  const { subscribe, set, update } = writable<MoodboardState>({
    nodes: [],
    edges: [],
    loading: false,
    error: null,
    currentIdeaId: null,
    currentProjectId: null,
    nodesByContainer: new Map(),
    loadedContainers: new Map(),
    ghostCache: new Map(),
  });

  const loadContainer = async (containerId: string): Promise<MoodboardNode[]> => {
    const now = new Date();
    let cachedNodes: MoodboardNode[] | null = null;
    let cacheFresh = false;

    update((state) => {
      const loadedAt = state.loadedContainers.get(containerId);
      if (loadedAt && now.getTime() - loadedAt.getTime() < CONTAINER_CACHE_TTL_MS) {
        cachedNodes = state.nodesByContainer.get(containerId) ?? [];
        cacheFresh = true;
      }
      return state;
    });

    if (cacheFresh && cachedNodes) {
      return cachedNodes;
    }

    update((state) => ({ ...state, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('moodboard_nodes')
        .select('*')
        .eq('parent_id', containerId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const nodes = (data || []).map(mapMoodboardNodeFromDb);

      update((state) => ({
        ...state,
        nodes: mergeNodes(state.nodes, nodes),
        nodesByContainer: (() => {
          const nodesByContainer = new Map(state.nodesByContainer);
          nodesByContainer.set(containerId, nodes);
          return nodesByContainer;
        })(),
        loadedContainers: (() => {
          const loadedContainers = new Map(state.loadedContainers);
          loadedContainers.set(containerId, new Date());
          return loadedContainers;
        })(),
        loading: false,
        error: null,
      }));

      return nodes;
    } catch (err: any) {
      update((state) => ({
        ...state,
        loading: false,
        error: err?.message || 'Failed to load container nodes',
      }));
      throw err;
    }
  };

  const updateGhostCache = (containerId: string, ghosts: MoodboardNode[]): void => {
    update((state) => ({
      ...state,
      ghostCache: (() => {
        const ghostCache = new Map(state.ghostCache);
        const containerCache = new Map<string, GhostCacheEntry>();
        const cachedAt = new Date();
        for (const node of ghosts) {
          containerCache.set(node.id, { node, cachedAt });
        }
        ghostCache.set(containerId, containerCache);
        return ghostCache;
      })(),
    }));
  };

  const loadContainerWithGhosts = async (
    containerId: string
  ): Promise<{
    nodes: MoodboardNode[];
    ghostNodes: MoodboardNode[];
    ghostEdges: MoodboardEdge[];
    staleNodeIds: string[];
  }> => {
    const nodes = await loadContainer(containerId);

    let cachedGhosts: Map<string, GhostCacheEntry> | undefined;
    update((state) => {
      cachedGhosts = state.ghostCache.get(containerId);
      return state;
    });

    const { nodes: ghostNodes, staleNodeIds, edges: ghostEdges } =
      await ghostNodeService.loadContainerWithGhosts(containerId, cachedGhosts);

    update((state) => ({
      ...state,
      nodes: mergeNodes(state.nodes, ghostNodes),
      nodesByContainer: (() => {
        const nodesByContainer = new Map(state.nodesByContainer);
        const existing = nodesByContainer.get(containerId) ?? [];
        nodesByContainer.set(containerId, mergeNodes(existing, ghostNodes));
        return nodesByContainer;
      })(),
      edges: (() => {
        const edgesById = new Map(state.edges.map((edge) => [edge.id, edge]));
        for (const edge of ghostEdges) {
          edgesById.set(edge.id, edge);
        }
        return Array.from(edgesById.values());
      })(),
      ghostCache: (() => {
        const ghostCache = new Map(state.ghostCache);
        const containerCache = new Map<string, GhostCacheEntry>();
        const cachedAt = new Date();
        for (const node of ghostNodes) {
          containerCache.set(node.id, { node, cachedAt });
        }
        ghostCache.set(containerId, containerCache);
        return ghostCache;
      })(),
    }));

    return { nodes, ghostNodes, ghostEdges, staleNodeIds };
  };

  return {
    subscribe,

    /**
     * Reset the store to initial state
     */
    reset: () =>
      set({
        nodes: [],
        edges: [],
        loading: false,
        error: null,
        currentIdeaId: null,
        currentProjectId: null,
        nodesByContainer: new Map(),
        loadedContainers: new Map(),
        ghostCache: new Map(),
      }),

    /**
     * Load all nodes and edges for an idea
     */
    load: async (ideaId: string) => {
      update((state) => ({
        ...state,
        loading: true,
        error: null,
        currentIdeaId: ideaId,
        currentProjectId: null,
      }));
      try {
        const { nodes, edges } = await moodboardService.getMoodboardData(ideaId);
        set({
          nodes,
          edges,
          loading: false,
          error: null,
          currentIdeaId: ideaId,
          currentProjectId: null,
          nodesByContainer: buildNodesByContainer(nodes),
          loadedContainers: new Map(),
          ghostCache: new Map(),
        });
      } catch (err: any) {
        set({
          nodes: [],
          edges: [],
          loading: false,
          error: err?.message || 'Failed to load moodboard',
          currentIdeaId: ideaId,
          currentProjectId: null,
          nodesByContainer: new Map(),
          loadedContainers: new Map(),
          ghostCache: new Map(),
        });
      }
    },

    /**
     * Load references for a project (project-scoped)
     */
    loadProjectReferences: async (projectId: string) => {
      update((state) => ({
        ...state,
        loading: true,
        error: null,
        currentIdeaId: null,
        currentProjectId: projectId,
      }));
      try {
        const nodes = await moodboardService.listProjectReferences(projectId);
        set({
          nodes,
          edges: [],
          loading: false,
          error: null,
          currentIdeaId: null,
          currentProjectId: projectId,
          nodesByContainer: buildNodesByContainer(nodes),
          loadedContainers: new Map(),
          ghostCache: new Map(),
        });
      } catch (err: any) {
        set({
          nodes: [],
          edges: [],
          loading: false,
          error: err?.message || 'Failed to load references',
          currentIdeaId: null,
          currentProjectId: projectId,
          nodesByContainer: new Map(),
          loadedContainers: new Map(),
          ghostCache: new Map(),
        });
      }
    },

    /**
     * Load only nodes for an idea
     */
    loadNodes: async (ideaId: string) => {
      update((state) => ({ ...state, loading: true, error: null, currentIdeaId: ideaId }));
      try {
        const nodes = await moodboardService.listNodes(ideaId);
        update((state) => ({
          ...state,
          nodes,
          nodesByContainer: buildNodesByContainer(nodes),
          loading: false,
          error: null,
        }));
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to load nodes',
        }));
      }
    },

    /**
     * Create a new node
     */
    createNode: async (node: MoodboardNodeCreate): Promise<MoodboardNode> => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const created = await moodboardService.createNode(node);
        update((state) => ({
          ...state,
          nodes: [...state.nodes, created],
          nodesByContainer: (() => {
            const nodesByContainer = new Map(state.nodesByContainer);
            const key = created.parentId ?? ROOT_CONTAINER_ID;
            const bucket = nodesByContainer.get(key) ?? [];
            nodesByContainer.set(key, [...bucket, created]);
            return nodesByContainer;
          })(),
          loading: false,
          error: null,
        }));
        return created;
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to create node',
        }));
        throw err;
      }
    },

    createProjectReference: async (
      node: MoodboardProjectReferenceCreate
    ): Promise<MoodboardNode> => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const created = await moodboardService.createProjectReference(node);
        update((state) => ({
          ...state,
          nodes: [...state.nodes, created],
          loading: false,
          error: null,
        }));
        return created;
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to create reference',
        }));
        throw err;
      }
    },

    /**
     * Update a node
     */
    updateNode: async (id: string, updates: MoodboardNodeUpdate) => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const updated = await moodboardService.updateNode(id, updates);
        if (updated) {
          update((state) => ({
            ...state,
            nodes: state.nodes.map((node) => (node.id === id ? updated : node)),
            nodesByContainer: (() => {
              const nodesByContainer = new Map(state.nodesByContainer);
              const previous = state.nodes.find((node) => node.id === id);
              if (previous) {
                const previousKey = previous.parentId ?? ROOT_CONTAINER_ID;
                const previousBucket = nodesByContainer.get(previousKey) ?? [];
                nodesByContainer.set(
                  previousKey,
                  previousBucket.filter((node) => node.id !== id)
                );
              }
              const nextKey = updated.parentId ?? ROOT_CONTAINER_ID;
              const nextBucket = nodesByContainer.get(nextKey) ?? [];
              nodesByContainer.set(nextKey, [...nextBucket, updated]);
              return nodesByContainer;
            })(),
            loading: false,
            error: null,
          }));
        }
        return updated;
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to update node',
        }));
        throw err;
      }
    },

    /**
     * Delete a node
     */
    deleteNode: async (id: string) => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        let projectId: string | null = null;
        update((state) => {
          projectId = state.currentProjectId;
          return state;
        });

        if (projectId) {
          await moodboardService.deleteProjectReference(id, projectId);
        } else {
          await moodboardService.deleteNode(id);
        }

        update((state) => ({
          ...state,
          nodes: state.nodes.filter((node) => node.id !== id),
          edges: state.edges.filter((edge) => edge.sourceNodeId !== id && edge.targetNodeId !== id),
          nodesByContainer: (() => {
            const nodesByContainer = new Map(state.nodesByContainer);
            for (const [key, bucket] of nodesByContainer.entries()) {
              nodesByContainer.set(
                key,
                bucket.filter((node) => node.id !== id)
              );
            }
            return nodesByContainer;
          })(),
          loading: false,
          error: null,
        }));
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to delete node',
        }));
        throw err;
      }
    },

    /**
     * Create a new edge
     */
    createEdge: async (edge: MoodboardEdgeCreate): Promise<MoodboardEdge> => {
      try {
        const created = await moodboardService.createEdge(edge);
        update((state) => ({
          ...state,
          edges: [...state.edges, created],
        }));
        return created;
      } catch (err: any) {
        update((state) => ({
          ...state,
          error: err?.message || 'Failed to create edge',
        }));
        throw err;
      }
    },

    /**
     * Delete an edge
     */
    deleteEdge: async (id: string) => {
      try {
        await moodboardService.deleteEdge(id);
        update((state) => ({
          ...state,
          edges: state.edges.filter((edge) => edge.id !== id),
        }));
      } catch (err: any) {
        update((state) => ({
          ...state,
          error: err?.message || 'Failed to delete edge',
        }));
        throw err;
      }
    },

    /**
     * Get node count for current idea
     */
    getNodeCount: (): number => {
      let count = 0;
      update((state) => {
        count = state.nodes.length;
        return state;
      });
      return count;
    },

    /**
     * Lazy load nodes for a container with TTL caching
     */
    loadContainer,

    /**
     * Load container nodes with ghost nodes and staleness validation
     */
    loadContainerWithGhosts,

    /**
     * Update ghost cache entries for a container
     */
    updateGhostCache,
  };
}

export const moodboard = createMoodboardStore();
