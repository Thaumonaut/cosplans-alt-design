-- ================================================================
-- Modern Task UI: Task Templates Table
-- Feature: 003-modern-task-ui
-- Purpose: Reusable task patterns for common workflows
-- ================================================================

-- Create task_templates table
CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  default_stage_id UUID REFERENCES public.task_stages(id) ON DELETE SET NULL,
  default_priority TEXT DEFAULT 'medium',
  subtasks JSONB DEFAULT '[]'::JSONB, -- Array of subtask objects: [{ title, order }, ...]
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_templates_priority_check CHECK (
    default_priority IN ('low', 'medium', 'high')
  ),
  CONSTRAINT task_templates_team_name_unique UNIQUE (team_id, name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_templates_team_id ON public.task_templates(team_id, name);
CREATE INDEX IF NOT EXISTS idx_task_templates_created_by ON public.task_templates(created_by);

-- Add comments for documentation
COMMENT ON TABLE public.task_templates IS 'Reusable task patterns for common workflows (e.g., Convention Packing List)';
COMMENT ON COLUMN public.task_templates.subtasks IS 'JSONB array of subtask objects: [{ title, order }, ...]';
COMMENT ON COLUMN public.task_templates.default_priority IS 'Default priority when applying template: low, medium, high';

-- Enable Row Level Security
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Team members can view team templates
CREATE POLICY task_templates_select ON public.task_templates FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: INSERT - Team members can create templates
CREATE POLICY task_templates_insert ON public.task_templates FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: UPDATE - Template creator or team owner/editor can update
CREATE POLICY task_templates_update ON public.task_templates FOR UPDATE USING (
  created_by = (SELECT auth.uid())
  OR team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('owner', 'editor')
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: DELETE - Template creator or team owner can delete
CREATE POLICY task_templates_delete ON public.task_templates FOR DELETE USING (
  created_by = (SELECT auth.uid())
  OR team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND role = 'owner'
    AND COALESCE(status, 'active') = 'active'
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_task_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_templates_updated_at_trigger
  BEFORE UPDATE ON public.task_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_task_templates_updated_at();

