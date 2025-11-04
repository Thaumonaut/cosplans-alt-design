-- ================================================================
-- Modern Task UI: User Task Stats Table
-- Feature: 003-modern-task-ui
-- Purpose: Daily/weekly task completion statistics for streak tracking
-- ================================================================

-- Create user_task_stats table
CREATE TABLE IF NOT EXISTS public.user_task_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tasks_created INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_task_stats_user_team_date_unique UNIQUE (user_id, team_id, date),
  CONSTRAINT user_task_stats_tasks_completed_check CHECK (tasks_completed >= 0),
  CONSTRAINT user_task_stats_tasks_created_check CHECK (tasks_created >= 0),
  CONSTRAINT user_task_stats_current_streak_check CHECK (current_streak >= 0),
  CONSTRAINT user_task_stats_longest_streak_check CHECK (longest_streak >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_task_stats_user_team ON public.user_task_stats(user_id, team_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_user_task_stats_date ON public.user_task_stats(date);

-- Add comments for documentation
COMMENT ON TABLE public.user_task_stats IS 'Daily/weekly task completion statistics for streak tracking and progress visibility';
COMMENT ON COLUMN public.user_task_stats.date IS 'Date for this statistics record';
COMMENT ON COLUMN public.user_task_stats.current_streak IS 'Current consecutive days with task completions';
COMMENT ON COLUMN public.user_task_stats.longest_streak IS 'Longest consecutive days with task completions (all-time)';

-- Enable Row Level Security
ALTER TABLE public.user_task_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Users can view their own stats
CREATE POLICY user_task_stats_select ON public.user_task_stats FOR SELECT USING (
  user_id = (SELECT auth.uid())
  OR team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: INSERT - System can create stats (via triggers/functions)
CREATE POLICY user_task_stats_insert ON public.user_task_stats FOR INSERT WITH CHECK (
  user_id = (SELECT auth.uid())
  AND team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: UPDATE - System can update stats (via triggers/functions)
CREATE POLICY user_task_stats_update ON public.user_task_stats FOR UPDATE USING (
  user_id = (SELECT auth.uid())
  AND team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND COALESCE(status, 'active') = 'active'
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_task_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_task_stats_updated_at_trigger
  BEFORE UPDATE ON public.user_task_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_task_stats_updated_at();


