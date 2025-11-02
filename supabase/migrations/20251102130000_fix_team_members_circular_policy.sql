-- Fix circular dependency in team_members RLS policies
-- The previous policies were checking team_members to access team_members, causing infinite recursion
-- This migration fixes by checking via teams.created_by instead

-- Fix SELECT policy: Break circular dependency by checking via teams table
DROP POLICY IF EXISTS team_members_select ON public.team_members;
DROP POLICY IF EXISTS "Team members can view each other" ON public.team_members;

CREATE POLICY team_members_select ON public.team_members FOR SELECT USING (
  -- User created the team (team owner via teams.created_by) - can see all members
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User can see their own membership record
  user_id = (select auth.uid())
);

CREATE POLICY "Team members can view each other" ON public.team_members FOR SELECT USING (
  -- User created the team (team owner via teams.created_by) - can see all members
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User can see their own membership record
  user_id = (select auth.uid())
);

-- Fix INSERT policy: Allow team creators OR existing owners to add members
DROP POLICY IF EXISTS team_members_insert ON public.team_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.team_members;

CREATE POLICY team_members_insert ON public.team_members FOR INSERT WITH CHECK (
  -- User created the team (can always add members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is an existing owner member
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND COALESCE(status, 'active') = 'active')
);

CREATE POLICY "Owners and admins can add members" ON public.team_members FOR INSERT WITH CHECK (
  -- User created the team (can always add members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is an existing owner member
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND COALESCE(status, 'active') = 'active')
);

-- Fix UPDATE policy: Allow team creators OR existing owners to update members
DROP POLICY IF EXISTS team_members_update ON public.team_members;
DROP POLICY IF EXISTS "Owners and admins can update members" ON public.team_members;

CREATE POLICY team_members_update ON public.team_members FOR UPDATE USING (
  -- User created the team (can always update members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is an existing owner member
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND COALESCE(status, 'active') = 'active')
);

CREATE POLICY "Owners and admins can update members" ON public.team_members FOR UPDATE USING (
  -- User created the team (can always update members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is an existing owner member
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND COALESCE(status, 'active') = 'active')
);

-- Fix DELETE policy: Allow team creators OR existing owners to remove members
DROP POLICY IF EXISTS team_members_delete ON public.team_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.team_members;

CREATE POLICY team_members_delete ON public.team_members FOR DELETE USING (
  -- User created the team (can always remove members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is an existing owner member
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND COALESCE(status, 'active') = 'active')
);

CREATE POLICY "Owners and admins can remove members" ON public.team_members FOR DELETE USING (
  -- User created the team (can always remove members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is an existing owner member
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND COALESCE(status, 'active') = 'active')
);

