-- Feature: 006-brainstorming-moodboard
-- Migration: Ensure index on moodboard_edges(target_node_id) for ghost node lookup

CREATE INDEX IF NOT EXISTS idx_moodboard_edges_target
  ON public.moodboard_edges(target_node_id);
