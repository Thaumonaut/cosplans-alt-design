/**
 * Ghost Node Service
 * Feature: 006-brainstorming-moodboard
 *
 * POC utilities for loading ghost edges and validating staleness.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '$lib/supabase';
import {
  mapMoodboardEdgeFromDb,
  mapMoodboardNodeFromDb,
  type GhostCacheEntry,
  type MoodboardEdge,
  type MoodboardNode,
} from '$lib/types/domain/moodboard';
import type { Database } from '$lib/types/supabase';

function getClient(client?: SupabaseClient<Database>) {
  return client ?? supabase;
}

export const ghostNodeService = {
  async fetchGhostEdges(
    containerId: string,
    client?: SupabaseClient<Database>
  ): Promise<MoodboardEdge[]> {
    const { data, error } = await getClient(client)
      .from('moodboard_edges')
      .select('*')
      .eq('target_node_id', containerId)
      .eq('edge_type', 'ghost');

    if (error) throw error;

    return (data || []).map(mapMoodboardEdgeFromDb);
  },

  async fetchSourceNodes(
    nodeIds: string[],
    client?: SupabaseClient<Database>
  ): Promise<MoodboardNode[]> {
    if (nodeIds.length === 0) return [];

    const { data, error } = await getClient(client)
      .from('moodboard_nodes')
      .select('*')
      .in('id', nodeIds);

    if (error) throw error;

    return (data || []).map(mapMoodboardNodeFromDb);
  },

  checkStaleness(
    cachedGhosts: Map<string, GhostCacheEntry>,
    currentNodes: MoodboardNode[]
  ): string[] {
    const staleNodeIds: string[] = [];

    for (const node of currentNodes) {
      const cached = cachedGhosts.get(node.id);
      if (!cached) continue;

      const cachedUpdatedAtRaw = cached.node.updatedAt ?? new Date(0).toISOString();
      const currentUpdatedAtRaw = node.updatedAt ?? new Date(0).toISOString();
      const cachedUpdatedAt = new Date(cachedUpdatedAtRaw).getTime();
      const currentUpdatedAt = new Date(currentUpdatedAtRaw).getTime();

      if (Number.isNaN(cachedUpdatedAt) || Number.isNaN(currentUpdatedAt)) {
        staleNodeIds.push(node.id);
        continue;
      }

      if (currentUpdatedAt > cachedUpdatedAt) {
        staleNodeIds.push(node.id);
      }
    }

    return staleNodeIds;
  },

  async loadContainerWithGhosts(
    containerId: string,
    cachedGhosts?: Map<string, GhostCacheEntry>,
    client?: SupabaseClient<Database>
  ): Promise<{ edges: MoodboardEdge[]; nodes: MoodboardNode[]; staleNodeIds: string[] }> {
    const edges = await this.fetchGhostEdges(containerId, client);
    const sourceNodeIds = edges.map((edge) => edge.sourceNodeId);
    const nodes = await this.fetchSourceNodes(sourceNodeIds, client);

    const staleNodeIds = cachedGhosts ? this.checkStaleness(cachedGhosts, nodes) : [];

    return { edges, nodes, staleNodeIds };
  },
};
