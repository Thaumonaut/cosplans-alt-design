-- ================================================================
-- Modern Task UI: Task Label Assignments Table
-- Feature: 003-modern-task-ui
-- Purpose: Many-to-many relationship between tasks and labels
-- ================================================================

-- Create task_label_assignments table
CREATE TABLE IF NOT EXISTS public.task_label_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.task_labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_label_assignments_task_label_unique UNIQUE (task_id, label_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_label_assignments_task_id ON public.task_label_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_label_assignments_label_id ON public.task_label_assignments(label_id);

-- Add comments for documentation
COMMENT ON TABLE public.task_label_assignments IS 'Many-to-many relationship between tasks and labels';
COMMENT ON COLUMN public.task_label_assignments.task_id IS 'Task reference (CASCADE delete)';
COMMENT ON COLUMN public.task_label_assignments.label_id IS 'Label reference (CASCADE delete)';

-- Enable Row Level Security
ALTER TABLE public.task_label_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Users can view assignments for tasks in their teams
CREATE POLICY task_label_assignments_select ON public.task_label_assignments FOR SELECT USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: INSERT - Users can assign labels to tasks in their teams
CREATE POLICY task_label_assignments_insert ON public.task_label_assignments FOR INSERT WITH CHECK (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: DELETE - Users can remove label assignments from tasks in their teams
CREATE POLICY task_label_assignments_delete ON public.task_label_assignments FOR DELETE USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);


