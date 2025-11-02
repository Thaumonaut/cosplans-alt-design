-- Add RLS policies for project_resources table
-- This table links projects to resources, so access control is based on project access
-- Users can access project_resources if they have access to the associated project

-- project_resources SELECT: Allow if user has access to the project
-- Access is granted if user is team owner OR active team member
DROP POLICY IF EXISTS project_resources_select ON public.project_resources;
CREATE POLICY project_resources_select ON public.project_resources FOR SELECT USING (
  -- Check if user has access to the project
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_resources.project_id
    AND (
      -- User is team owner (always allowed)
      p.team_id IN (SELECT id FROM public.teams WHERE owner_id = (select auth.uid()))
      OR
      -- User is active team member (any role for viewing)
      EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = p.team_id
        AND tm.user_id = (select auth.uid())
        AND COALESCE(tm.status, 'active') = 'active'
      )
    )
  )
);

-- project_resources INSERT: Allow if user is project team owner OR active editor/owner member
DROP POLICY IF EXISTS project_resources_insert ON public.project_resources;
CREATE POLICY project_resources_insert ON public.project_resources FOR INSERT WITH CHECK (
  -- Check if user has write access to the project
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_resources.project_id
    AND (
      -- User is team owner (always allowed)
      p.team_id IN (SELECT id FROM public.teams WHERE owner_id = (select auth.uid()))
      OR
      -- User is owner/editor member
      EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = p.team_id
        AND tm.user_id = (select auth.uid())
        AND tm.role IN ('owner', 'editor')
        AND COALESCE(tm.status, 'active') = 'active'
      )
    )
  )
);

-- project_resources UPDATE: Allow if user is project team owner OR active editor/owner member
DROP POLICY IF EXISTS project_resources_update ON public.project_resources;
CREATE POLICY project_resources_update ON public.project_resources FOR UPDATE USING (
  -- Check if user has write access to the project
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_resources.project_id
    AND (
      -- User is team owner (always allowed)
      p.team_id IN (SELECT id FROM public.teams WHERE owner_id = (select auth.uid()))
      OR
      -- User is owner/editor member
      EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = p.team_id
        AND tm.user_id = (select auth.uid())
        AND tm.role IN ('owner', 'editor')
        AND COALESCE(tm.status, 'active') = 'active'
      )
    )
  )
);

-- project_resources DELETE: Allow if user is project team owner OR active editor/owner member
DROP POLICY IF EXISTS project_resources_delete ON public.project_resources;
CREATE POLICY project_resources_delete ON public.project_resources FOR DELETE USING (
  -- Check if user has write access to the project
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_resources.project_id
    AND (
      -- User is team owner (always allowed)
      p.team_id IN (SELECT id FROM public.teams WHERE owner_id = (select auth.uid()))
      OR
      -- User is owner/editor member
      EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = p.team_id
        AND tm.user_id = (select auth.uid())
        AND tm.role IN ('owner', 'editor')
        AND COALESCE(tm.status, 'active') = 'active'
      )
    )
  )
);

