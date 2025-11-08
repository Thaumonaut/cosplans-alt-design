-- ================================================================
-- Modern Task UI: Task Notifications Table
-- Feature: 003-modern-task-ui
-- Purpose: In-app notification events for task updates
-- ================================================================

-- Create task_notifications table
CREATE TABLE IF NOT EXISTS public.task_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'assignment', 'mention', 'comment', 'status_change'
  message TEXT NOT NULL, -- Human-readable notification text
  read BOOLEAN NOT NULL DEFAULT FALSE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who triggered the notification
  metadata JSONB DEFAULT '{}'::JSONB, -- Additional context (e.g., old/new values)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_notifications_event_type_check CHECK (
    event_type IN ('assignment', 'mention', 'comment', 'status_change')
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_notifications_user_id ON public.task_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_notifications_user_read ON public.task_notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_notifications_task_id ON public.task_notifications(task_id);

-- Add comments for documentation
COMMENT ON TABLE public.task_notifications IS 'In-app notification events for task assignments, mentions, comments, status changes';
COMMENT ON COLUMN public.task_notifications.event_type IS 'Type of event: assignment, mention, comment, status_change';
COMMENT ON COLUMN public.task_notifications.metadata IS 'Additional context as JSONB (e.g., old/new status values)';

-- Enable Row Level Security
ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Users can only view their own notifications
CREATE POLICY task_notifications_select ON public.task_notifications FOR SELECT USING (
  user_id = (SELECT auth.uid())
);

-- RLS Policy: UPDATE - Users can only mark their own notifications as read
CREATE POLICY task_notifications_update ON public.task_notifications FOR UPDATE USING (
  user_id = (SELECT auth.uid())
) WITH CHECK (
  user_id = (SELECT auth.uid())
);

-- RLS Policy: DELETE - Users can delete their own notifications (dismiss)
CREATE POLICY task_notifications_delete ON public.task_notifications FOR DELETE USING (
  user_id = (SELECT auth.uid())
);

-- Note: INSERT policy not needed as notifications are created by system/application code

