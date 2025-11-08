-- Fix RLS policies for team-based task scoping
-- Ensures tasks are only visible to team members

-- Drop existing policies
DROP POLICY IF EXISTS tasks_select ON public.tasks;
DROP POLICY IF EXISTS tasks_insert ON public.tasks;
DROP POLICY IF EXISTS tasks_update ON public.tasks;
DROP POLICY IF EXISTS tasks_delete ON public.tasks;

-- SELECT Policy: Users can see tasks from teams they are active members of
CREATE POLICY tasks_select ON public.tasks FOR SELECT USING (
  -- Project-scoped tasks: user must be member of project's team
  (
    project_id IS NOT NULL AND
    project_id IN (
      SELECT id FROM public.projects WHERE team_id IN (
        SELECT team_id FROM public.team_members 
        WHERE user_id = (SELECT auth.uid()) 
        AND COALESCE(status, 'active') = 'active'
      )
    )
  )
  OR
  -- Standalone tasks: user must be member of task's team
  (
    project_id IS NULL AND
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = (SELECT auth.uid()) 
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- INSERT Policy: Users must be owner/editor of target team
CREATE POLICY tasks_insert ON public.tasks FOR INSERT WITH CHECK (
  -- Project-scoped tasks: user must be owner/editor of project's team
  (
    project_id IS NOT NULL AND
    project_id IN (
      SELECT id FROM public.projects WHERE team_id IN (
        SELECT team_id FROM public.team_members 
        WHERE user_id = (SELECT auth.uid()) 
        AND role IN ('owner', 'editor')
        AND COALESCE(status, 'active') = 'active'
      )
    )
  )
  OR
  -- Standalone tasks: user must be owner/editor of task's team
  (
    project_id IS NULL AND
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = (SELECT auth.uid()) 
      AND role IN ('owner', 'editor')
      AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- UPDATE Policy: Users must be owner/editor of task's team
CREATE POLICY tasks_update ON public.tasks FOR UPDATE USING (
  -- Same visibility check as SELECT
  (
    project_id IS NOT NULL AND
    project_id IN (
      SELECT id FROM public.projects WHERE team_id IN (
        SELECT team_id FROM public.team_members 
        WHERE user_id = (SELECT auth.uid()) 
        AND COALESCE(status, 'active') = 'active'
      )
    )
  )
  OR
  (
    project_id IS NULL AND
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = (SELECT auth.uid()) 
      AND COALESCE(status, 'active') = 'active'
    )
  )
) WITH CHECK (
  -- Additional check: user must be owner/editor
  (
    project_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE p.id = tasks.project_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.role IN ('owner', 'editor')
        AND COALESCE(tm.status, 'active') = 'active'
    )
  )
  OR
  (
    project_id IS NULL AND
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = tasks.team_id
        AND user_id = (SELECT auth.uid())
        AND role IN ('owner', 'editor')
        AND COALESCE(status, 'active') = 'active'
    )
  )
);

-- DELETE Policy: Users must be owner/editor of task's team
CREATE POLICY tasks_delete ON public.tasks FOR DELETE USING (
  -- Same as UPDATE policy
  (
    project_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE p.id = tasks.project_id
        AND tm.user_id = (SELECT auth.uid())
        AND tm.role IN ('owner', 'editor')
        AND COALESCE(tm.status, 'active') = 'active'
    )
  )
  OR
  (
    project_id IS NULL AND
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = tasks.team_id
        AND user_id = (SELECT auth.uid())
        AND role IN ('owner', 'editor')
        AND COALESCE(status, 'active') = 'active'
    )
  )
);

