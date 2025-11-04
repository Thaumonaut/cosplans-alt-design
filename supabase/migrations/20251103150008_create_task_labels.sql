-- ================================================================
-- Modern Task UI: Task Labels Table
-- Feature: 003-modern-task-ui
-- Purpose: Team-defined labels for categorizing tasks
-- ================================================================

-- Create task_labels table
CREATE TABLE IF NOT EXISTS public.task_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280', -- Hex color code
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_labels_team_name_unique UNIQUE (team_id, name),
  CONSTRAINT task_labels_color_format_check CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_labels_team_id ON public.task_labels(team_id);

-- Add comments for documentation
COMMENT ON TABLE public.task_labels IS 'Team-defined labels for categorizing tasks (e.g., "urgent", "blocked", "design")';
COMMENT ON COLUMN public.task_labels.color IS 'Hex color code for label display (e.g., #6B7280)';

-- Enable Row Level Security
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Team members can view team labels
CREATE POLICY task_labels_select ON public.task_labels FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: INSERT - Team editors/owners can create labels
CREATE POLICY task_labels_insert ON public.task_labels FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('owner', 'editor')
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: UPDATE - Team editors/owners can update labels
CREATE POLICY task_labels_update ON public.task_labels FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('owner', 'editor')
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: DELETE - Team owners can delete labels
CREATE POLICY task_labels_delete ON public.task_labels FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND role = 'owner'
    AND COALESCE(status, 'active') = 'active'
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_task_labels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_labels_updated_at_trigger
  BEFORE UPDATE ON public.task_labels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_task_labels_updated_at();


