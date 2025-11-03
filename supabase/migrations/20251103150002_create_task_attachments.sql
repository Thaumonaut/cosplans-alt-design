-- ================================================================
-- Modern Task UI: Task Attachments Table
-- Feature: 003-modern-task-ui
-- Purpose: File attachments linked to tasks
-- ================================================================

-- Create task_attachments table
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- Size in bytes
  mime_type TEXT NOT NULL,
  storage_url TEXT NOT NULL, -- Cloudflare R2 URL
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_attachments_file_size_check CHECK (file_size > 0 AND file_size <= 26214400) -- Max 25MB
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON public.task_attachments(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_attachments_uploaded_by ON public.task_attachments(uploaded_by);

-- Add comments for documentation
COMMENT ON TABLE public.task_attachments IS 'File attachments (documents, images, archives) linked to tasks';
COMMENT ON COLUMN public.task_attachments.storage_url IS 'Cloudflare R2 URL (signed URLs generated on-demand)';
COMMENT ON COLUMN public.task_attachments.file_size IS 'File size in bytes (max 25MB = 26214400 bytes)';

-- Enable Row Level Security
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Users can view attachments for tasks in their teams
CREATE POLICY task_attachments_select ON public.task_attachments FOR SELECT USING (
  task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: INSERT - Users must be team member to upload attachments
CREATE POLICY task_attachments_insert ON public.task_attachments FOR INSERT WITH CHECK (
  uploaded_by = (SELECT auth.uid())
  AND task_id IN (
    SELECT id FROM public.tasks
    WHERE team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = (SELECT auth.uid())
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- RLS Policy: DELETE - Only uploader or task assignee can delete attachments
CREATE POLICY task_attachments_delete ON public.task_attachments FOR DELETE USING (
  uploaded_by = (SELECT auth.uid())
  OR task_id IN (
    SELECT id FROM public.tasks
    WHERE assigned_to = (SELECT auth.uid())
  )
);

