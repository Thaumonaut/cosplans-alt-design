-- Make project_id optional for tasks (allow standalone tasks)

-- Drop the NOT NULL constraint on project_id
ALTER TABLE public.tasks 
  ALTER COLUMN project_id DROP NOT NULL;

-- Update the foreign key constraint to allow NULL
-- First, drop the existing constraint
ALTER TABLE public.tasks 
  DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;

-- Recreate with ON DELETE SET NULL to handle project deletion gracefully
ALTER TABLE public.tasks 
  ADD CONSTRAINT tasks_project_id_fkey 
  FOREIGN KEY (project_id) 
  REFERENCES public.projects(id) 
  ON DELETE SET NULL;

-- Update index to include NULL values (create partial index if needed)
-- The existing index will work fine with NULLs

-- Update RLS policies to allow tasks without projects
-- Tasks should be accessible if:
-- 1. They belong to a project the user can access, OR
-- 2. They don't have a project_id (standalone tasks) and belong to the user's team

-- Update SELECT policy to allow standalone tasks
DROP POLICY IF EXISTS tasks_select ON public.tasks;
CREATE POLICY tasks_select ON public.tasks FOR SELECT USING (
  -- Tasks with a project: user must have access to the project's team
  (
    project_id IS NOT NULL AND
    project_id IN (
      SELECT id FROM public.projects WHERE team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND COALESCE(status, 'active') = 'active'
      )
    )
  )
  OR
  -- Standalone tasks (no project): user must be a member of at least one team
  (
    project_id IS NULL AND
    EXISTS (
      SELECT 1 FROM public.team_members WHERE user_id = (select auth.uid()) AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- Update INSERT policy to allow standalone tasks
DROP POLICY IF EXISTS tasks_insert ON public.tasks;
CREATE POLICY tasks_insert ON public.tasks FOR INSERT WITH CHECK (
  -- Tasks with a project: user must be owner/editor of the project's team
  (
    project_id IS NOT NULL AND
    project_id IN (
      SELECT id FROM public.projects WHERE team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND COALESCE(status, 'active') = 'active'
      )
    )
  )
  OR
  -- Standalone tasks: user must be owner/editor of at least one team
  (
    project_id IS NULL AND
    EXISTS (
      SELECT 1 FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- Update UPDATE policy to allow standalone tasks
DROP POLICY IF EXISTS tasks_update ON public.tasks;
CREATE POLICY tasks_update ON public.tasks FOR UPDATE USING (
  -- Tasks with a project: user must be owner/editor of the project's team
  (
    project_id IS NOT NULL AND
    project_id IN (
      SELECT id FROM public.projects WHERE team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND COALESCE(status, 'active') = 'active'
      )
    )
  )
  OR
  -- Standalone tasks: user must be owner/editor of at least one team
  (
    project_id IS NULL AND
    EXISTS (
      SELECT 1 FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- Update DELETE policy to allow standalone tasks
DROP POLICY IF EXISTS tasks_delete ON public.tasks;
CREATE POLICY tasks_delete ON public.tasks FOR DELETE USING (
  -- Tasks with a project: user must be owner/editor of the project's team
  (
    project_id IS NOT NULL AND
    project_id IN (
      SELECT id FROM public.projects WHERE team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND COALESCE(status, 'active') = 'active'
      )
    )
  )
  OR
  -- Standalone tasks: user must be owner/editor of at least one team
  (
    project_id IS NULL AND
    EXISTS (
      SELECT 1 FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND COALESCE(status, 'active') = 'active'
    )
  )
);
