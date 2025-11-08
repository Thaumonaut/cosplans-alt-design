-- ================================================================
-- Modern Task UI: Task Breakdown Patterns Table
-- Feature: 003-modern-task-ui
-- Purpose: AI-suggested task breakdown patterns for ADHD users
-- ================================================================

-- Create task_breakdown_patterns table
CREATE TABLE IF NOT EXISTS public.task_breakdown_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  pattern_name TEXT NOT NULL,
  pattern_description TEXT,
  suggested_subtasks JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array of subtask objects: [{ title, order, estimated_time }]
  trigger_keywords TEXT[] DEFAULT ARRAY[]::TEXT[], -- Keywords that trigger this pattern
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_breakdown_patterns_team_name_unique UNIQUE (team_id, pattern_name),
  CONSTRAINT task_breakdown_patterns_usage_count_check CHECK (usage_count >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_breakdown_patterns_team_id ON public.task_breakdown_patterns(team_id);
CREATE INDEX IF NOT EXISTS idx_task_breakdown_patterns_keywords ON public.task_breakdown_patterns USING GIN(trigger_keywords);

-- Add comments for documentation
COMMENT ON TABLE public.task_breakdown_patterns IS 'AI-suggested task breakdown patterns for ADHD users (e.g., "Create Costume" → [Design, Materials, Construction, Fittings])';
COMMENT ON COLUMN public.task_breakdown_patterns.suggested_subtasks IS 'JSONB array of subtask objects: [{ title, order, estimated_time }]';
COMMENT ON COLUMN public.task_breakdown_patterns.trigger_keywords IS 'Array of keywords that trigger this pattern suggestion';
COMMENT ON COLUMN public.task_breakdown_patterns.usage_count IS 'Number of times this pattern has been used (for ranking)';

-- Enable Row Level Security
ALTER TABLE public.task_breakdown_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Team members can view team patterns
CREATE POLICY task_breakdown_patterns_select ON public.task_breakdown_patterns FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: INSERT - Team editors/owners can create patterns
CREATE POLICY task_breakdown_patterns_insert ON public.task_breakdown_patterns FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('owner', 'editor')
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: UPDATE - Team editors/owners can update patterns
CREATE POLICY task_breakdown_patterns_update ON public.task_breakdown_patterns FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('owner', 'editor')
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: DELETE - Team owners can delete patterns
CREATE POLICY task_breakdown_patterns_delete ON public.task_breakdown_patterns FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND role = 'owner'
    AND COALESCE(status, 'active') = 'active'
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_task_breakdown_patterns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_breakdown_patterns_updated_at_trigger
  BEFORE UPDATE ON public.task_breakdown_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_task_breakdown_patterns_updated_at();


