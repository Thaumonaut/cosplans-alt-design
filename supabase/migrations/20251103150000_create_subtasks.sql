-- ================================================================
-- Modern Task UI: Subtasks Table
-- Feature: 003-modern-task-ui
-- Purpose: Child checklist items under parent tasks
-- ================================================================

-- Create subtasks table
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subtasks_display_order_check CHECK (display_order >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON public.subtasks(task_id, display_order);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_completed ON public.subtasks(task_id, completed);

-- Add comments for documentation
COMMENT ON TABLE public.subtasks IS 'Child checklist items under parent tasks for breaking down work';
COMMENT ON COLUMN public.subtasks.task_id IS 'Parent task reference (CASCADE delete)';
COMMENT ON COLUMN public.subtasks.display_order IS 'Order of subtask within parent task (0-indexed)';

-- Enable Row Level Security
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Users can view subtasks for tasks in their teams
CREATE POLICY subtasks_select ON public.subtasks FOR SELECT USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: INSERT - Users must be team member to create subtasks
CREATE POLICY subtasks_insert ON public.subtasks FOR INSERT WITH CHECK (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: UPDATE - Users must be team member to update subtasks
CREATE POLICY subtasks_update ON public.subtasks FOR UPDATE USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: DELETE - Users must be team member to delete subtasks
CREATE POLICY subtasks_delete ON public.subtasks FOR DELETE USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_subtasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subtasks_updated_at_trigger
  BEFORE UPDATE ON public.subtasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subtasks_updated_at();

