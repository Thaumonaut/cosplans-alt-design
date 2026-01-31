-- Feature: 006-brainstorming-moodboard
-- Migration: Add ghost node support (edge metadata + RLS)
-- Technical Spec: ghost node architecture (lines 13-87)

-- ============================================================================
-- Up Migration
-- ============================================================================

ALTER TABLE moodboard_edges
  ADD COLUMN IF NOT EXISTS edge_metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS moodboard_id UUID;

-- Update edge_type constraint to include ghost edges
ALTER TABLE moodboard_edges
  DROP CONSTRAINT IF EXISTS moodboard_edges_edge_type_check;

ALTER TABLE moodboard_edges
  ADD CONSTRAINT moodboard_edges_edge_type_check CHECK (edge_type IN (
    'connection', 'reference', 'alternative', 'shared_resource', 'supplier_option', 'ghost'
  ));

-- Create index for metadata queries
CREATE INDEX IF NOT EXISTS idx_moodboard_edges_metadata
  ON moodboard_edges USING GIN(edge_metadata);

-- Ghost Edge RLS Policies
DROP POLICY IF EXISTS ghost_edge_select_policy ON moodboard_edges;
CREATE POLICY ghost_edge_select_policy ON moodboard_edges
FOR SELECT USING (
  edge_type = 'ghost'
  AND source_node_id IN (
    SELECT id FROM moodboard_nodes WHERE idea_id IN (
      SELECT id FROM ideas WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  )
  AND target_node_id IN (
    SELECT id FROM moodboard_nodes WHERE idea_id IN (
      SELECT id FROM ideas WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  )
);

DROP POLICY IF EXISTS ghost_edge_insert_policy ON moodboard_edges;
CREATE POLICY ghost_edge_insert_policy ON moodboard_edges
FOR INSERT WITH CHECK (
  edge_type = 'ghost'
  AND source_node_id != target_node_id
  AND source_node_id IN (
    SELECT id FROM moodboard_nodes WHERE idea_id IN (
      SELECT id FROM ideas WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  )
  AND target_node_id IN (
    SELECT id FROM moodboard_nodes WHERE idea_id IN (
      SELECT id FROM ideas WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  )
);

DROP POLICY IF EXISTS ghost_edge_delete_policy ON moodboard_edges;
CREATE POLICY ghost_edge_delete_policy ON moodboard_edges
FOR DELETE USING (
  idea_id IN (
    SELECT id FROM ideas WHERE team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  )
);

-- ============================================================================
-- Down Migration (manual rollback)
-- ============================================================================

-- Drop ghost edge policies
DROP POLICY IF EXISTS ghost_edge_select_policy ON moodboard_edges;
DROP POLICY IF EXISTS ghost_edge_insert_policy ON moodboard_edges;
DROP POLICY IF EXISTS ghost_edge_delete_policy ON moodboard_edges;

-- Drop metadata index and columns
DROP INDEX IF EXISTS idx_moodboard_edges_metadata;
ALTER TABLE moodboard_edges
  DROP COLUMN IF EXISTS edge_metadata,
  DROP COLUMN IF EXISTS moodboard_id;

-- Restore original edge_type constraint
ALTER TABLE moodboard_edges
  DROP CONSTRAINT IF EXISTS moodboard_edges_edge_type_check;

ALTER TABLE moodboard_edges
  ADD CONSTRAINT moodboard_edges_edge_type_check CHECK (edge_type IN (
    'connection', 'reference', 'alternative', 'shared_resource', 'supplier_option'
  ));
