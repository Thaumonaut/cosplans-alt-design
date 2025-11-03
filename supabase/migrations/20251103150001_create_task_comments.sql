-- ================================================================
-- Modern Task UI: Task Comments Table
-- Feature: 003-modern-task-ui
-- Purpose: Comments and discussion on tasks with @mentions
-- ================================================================

-- Create task_comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT ARRAY[]::UUID[], -- Array of user IDs mentioned
  deleted BOOLEAN NOT NULL DEFAULT FALSE, -- Soft delete flag
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_comments_user_id ON public.task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_mentions ON public.task_comments USING GIN(mentions);

-- Add comments for documentation
COMMENT ON TABLE public.task_comments IS 'Comments and discussion on tasks with @mentions for collaboration';
COMMENT ON COLUMN public.task_comments.mentions IS 'Array of user IDs mentioned in comment (for notifications)';
COMMENT ON COLUMN public.task_comments.deleted IS 'Soft delete flag - deleted comments show placeholder';

-- Enable Row Level Security
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Users can view comments on tasks in their teams (including deleted for context)
CREATE POLICY task_comments_select ON public.task_comments FOR SELECT USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: INSERT - Users must be team member to comment
CREATE POLICY task_comments_insert ON public.task_comments FOR INSERT WITH CHECK (
  user_id = (SELECT auth.uid())
  AND task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: UPDATE - Only comment author can edit
CREATE POLICY task_comments_update ON public.task_comments FOR UPDATE USING (
  user_id = (SELECT auth.uid())
) WITH CHECK (
  user_id = (SELECT auth.uid())
);

-- RLS Policy: DELETE - Only comment author can delete (soft delete - sets deleted flag)
CREATE POLICY task_comments_delete ON public.task_comments FOR DELETE USING (
  user_id = (SELECT auth.uid())
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_task_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_comments_updated_at_trigger
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_task_comments_updated_at();

