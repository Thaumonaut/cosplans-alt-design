-- ================================================================
-- Modern Task UI: Saved Task Views Table
-- Feature: 003-modern-task-ui
-- Purpose: User-saved filter combinations for quick access
-- ================================================================

-- Create saved_task_views table
CREATE TABLE IF NOT EXISTS public.saved_task_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::JSONB, -- TaskFilters object
  grouping TEXT NOT NULL DEFAULT 'stage',
  view_mode TEXT NOT NULL DEFAULT 'list',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT saved_task_views_grouping_check CHECK (
    grouping IN ('stage', 'priority', 'project', 'assignee', 'dueDate')
  ),
  CONSTRAINT saved_task_views_view_mode_check CHECK (
    view_mode IN ('list', 'board', 'calendar', 'timeline')
  ),
  CONSTRAINT saved_task_views_user_team_name_unique UNIQUE (user_id, team_id, name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_task_views_user_team ON public.saved_task_views(user_id, team_id);

-- Add comments for documentation
COMMENT ON TABLE public.saved_task_views IS 'User-saved filter combinations for quick access to custom task views';
COMMENT ON COLUMN public.saved_task_views.filters IS 'JSONB TaskFilters object: { stages, priorities, assignees, projects, dateRange, tags, includeArchived }';
COMMENT ON COLUMN public.saved_task_views.grouping IS 'Grouping option: stage, priority, project, assignee, dueDate';
COMMENT ON COLUMN public.saved_task_views.view_mode IS 'View mode: list, board, calendar, timeline';

-- Enable Row Level Security
ALTER TABLE public.saved_task_views ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Users can only view their own saved views
CREATE POLICY saved_task_views_select ON public.saved_task_views FOR SELECT USING (
  user_id = (SELECT auth.uid())
);

-- RLS Policy: INSERT - Users can create their own saved views (must be team member)
CREATE POLICY saved_task_views_insert ON public.saved_task_views FOR INSERT WITH CHECK (
  user_id = (SELECT auth.uid())
  AND team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: UPDATE - Users can only update their own saved views
CREATE POLICY saved_task_views_update ON public.saved_task_views FOR UPDATE USING (
  user_id = (SELECT auth.uid())
) WITH CHECK (
  user_id = (SELECT auth.uid())
);

-- RLS Policy: DELETE - Users can only delete their own saved views
CREATE POLICY saved_task_views_delete ON public.saved_task_views FOR DELETE USING (
  user_id = (SELECT auth.uid())
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_saved_task_views_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saved_task_views_updated_at_trigger
  BEFORE UPDATE ON public.saved_task_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_saved_task_views_updated_at();

