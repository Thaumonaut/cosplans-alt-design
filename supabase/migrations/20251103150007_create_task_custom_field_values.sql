-- ================================================================
-- Modern Task UI: Task Custom Field Values Table
-- Feature: 003-modern-task-ui
-- Purpose: Values for custom fields on specific tasks
-- ================================================================

-- Create task_custom_field_values table
CREATE TABLE IF NOT EXISTS public.task_custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  field_definition_id UUID NOT NULL REFERENCES public.custom_field_definitions(id) ON DELETE CASCADE,
  value JSONB NOT NULL, -- Type-specific value (text, number, currency object, date string, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_custom_field_values_task_field_unique UNIQUE (task_id, field_definition_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_custom_field_values_task_id ON public.task_custom_field_values(task_id);
CREATE INDEX IF NOT EXISTS idx_task_custom_field_values_field_id ON public.task_custom_field_values(field_definition_id);

-- Add comments for documentation
COMMENT ON TABLE public.task_custom_field_values IS 'Values for custom fields on specific tasks';
COMMENT ON COLUMN public.task_custom_field_values.value IS 'Type-specific value stored as JSONB (text, number, currency object, date string, etc.)';

-- Enable Row Level Security
ALTER TABLE public.task_custom_field_values ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Users can view values for tasks in their teams
CREATE POLICY task_custom_field_values_select ON public.task_custom_field_values FOR SELECT USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: INSERT - Users can create values for tasks in their teams
CREATE POLICY task_custom_field_values_insert ON public.task_custom_field_values FOR INSERT WITH CHECK (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: UPDATE - Users can update values for tasks in their teams
CREATE POLICY task_custom_field_values_update ON public.task_custom_field_values FOR UPDATE USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: DELETE - Users can delete values for tasks in their teams
CREATE POLICY task_custom_field_values_delete ON public.task_custom_field_values FOR DELETE USING (
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
CREATE OR REPLACE FUNCTION public.update_task_custom_field_values_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_custom_field_values_updated_at_trigger
  BEFORE UPDATE ON public.task_custom_field_values
  FOR EACH ROW
  EXECUTE FUNCTION public.update_task_custom_field_values_updated_at();


