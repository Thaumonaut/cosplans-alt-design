-- Add team_id column to tasks table for standalone task scoping
-- For project-scoped tasks, team_id is derived from projects.team_id (query via JOIN)
-- For standalone tasks, team_id must be set directly

-- Add team_id column (nullable initially, will be made required after migration)
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;

-- Create index for team-based queries
CREATE INDEX IF NOT EXISTS idx_tasks_team ON public.tasks(team_id);

-- For existing project-scoped tasks, populate team_id from projects table
UPDATE public.tasks t
SET team_id = p.team_id
FROM public.projects p
WHERE t.project_id = p.id
  AND t.team_id IS NULL;

-- Note: Standalone tasks (project_id IS NULL) will need team_id set via application logic
-- This migration just adds the column; application will handle setting team_id for new standalone tasks

