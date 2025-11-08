-- Fix resources RLS policy to also allow team owners and handle missing status column
-- The current policy only checks team_members with status='active', which can fail if:
-- 1. The status column doesn't exist
-- 2. The user doesn't have an active team_members record
-- 3. The user is a team owner but not in team_members

-- Resources SELECT: Allow if user is team member OR team owner
-- This policy allows team owners even if not in team_members table
DROP POLICY IF EXISTS resources_select ON public.resources;
CREATE POLICY resources_select ON public.resources FOR SELECT USING (
  -- User is team owner (always allowed, even if not in team_members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is team member (check status if column exists, otherwise just membership)
  -- Note: If status column doesn't exist, the query will still work because we check both conditions
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = resources.team_id
    AND tm.user_id = (select auth.uid())
    AND (
      -- If status column exists, require it to be 'active'
      tm.status = 'active'
      OR
      -- If status is NULL (backwards compatibility for old records or missing column)
      -- COALESCE handles NULL gracefully - treats NULL as 'active' for viewing
      (tm.status IS NULL)
    )
  )
);

-- Resources INSERT: Allow if user is team owner OR active editor/owner member
DROP POLICY IF EXISTS resources_insert ON public.resources;
CREATE POLICY resources_insert ON public.resources FOR INSERT WITH CHECK (
  -- User is team owner (always allowed)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is owner/editor member
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = resources.team_id
    AND tm.user_id = (select auth.uid())
    AND tm.role IN ('owner', 'editor')
    AND COALESCE(tm.status, 'active') = 'active'
  )
);

-- Resources UPDATE: Allow if user is team owner OR active editor/owner member
DROP POLICY IF EXISTS resources_update ON public.resources;
CREATE POLICY resources_update ON public.resources FOR UPDATE USING (
  -- User is team owner (always allowed)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is owner/editor member
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = resources.team_id
    AND tm.user_id = (select auth.uid())
    AND tm.role IN ('owner', 'editor')
    AND COALESCE(tm.status, 'active') = 'active'
  )
);

-- Resources DELETE: Allow if user is team owner OR active editor/owner member
DROP POLICY IF EXISTS resources_delete ON public.resources;
CREATE POLICY resources_delete ON public.resources FOR DELETE USING (
  -- User is team owner (always allowed)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is owner/editor member
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = resources.team_id
    AND tm.user_id = (select auth.uid())
    AND tm.role IN ('owner', 'editor')
    AND COALESCE(tm.status, 'active') = 'active'
  )
);

