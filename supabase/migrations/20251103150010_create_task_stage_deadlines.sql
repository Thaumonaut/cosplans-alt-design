-- ================================================================
-- Modern Task UI: Task Stage Deadlines Table
-- Feature: 003-modern-task-ui
-- Purpose: Per-stage deadlines for ADHD-friendly task management
-- ================================================================

-- Create task_stage_deadlines table
CREATE TABLE IF NOT EXISTS public.task_stage_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.task_stages(id) ON DELETE CASCADE,
  deadline_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_stage_deadlines_task_stage_unique UNIQUE (task_id, stage_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_stage_deadlines_task_id ON public.task_stage_deadlines(task_id);
CREATE INDEX IF NOT EXISTS idx_task_stage_deadlines_stage_id ON public.task_stage_deadlines(stage_id);
CREATE INDEX IF NOT EXISTS idx_task_stage_deadlines_deadline ON public.task_stage_deadlines(deadline_date);

-- Add comments for documentation
COMMENT ON TABLE public.task_stage_deadlines IS 'Per-stage deadlines for ADHD-friendly task management (e.g., "Design by Jan 15", "Build by Jan 20")';
COMMENT ON COLUMN public.task_stage_deadlines.deadline_date IS 'Deadline date for this stage of the task';

-- Enable Row Level Security
ALTER TABLE public.task_stage_deadlines ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Users can view deadlines for tasks in their teams
CREATE POLICY task_stage_deadlines_select ON public.task_stage_deadlines FOR SELECT USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: INSERT - Users can create deadlines for tasks in their teams
CREATE POLICY task_stage_deadlines_insert ON public.task_stage_deadlines FOR INSERT WITH CHECK (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: UPDATE - Users can update deadlines for tasks in their teams
CREATE POLICY task_stage_deadlines_update ON public.task_stage_deadlines FOR UPDATE USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: DELETE - Users can delete deadlines for tasks in their teams
CREATE POLICY task_stage_deadlines_delete ON public.task_stage_deadlines FOR DELETE USING (
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
CREATE OR REPLACE FUNCTION public.update_task_stage_deadlines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_stage_deadlines_updated_at_trigger
  BEFORE UPDATE ON public.task_stage_deadlines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_task_stage_deadlines_updated_at();


