-- Fix circular dependency in teams RLS policies
-- The teams SELECT policy queries team_members, which causes recursion when team_members queries teams
-- Fix by checking created_by FIRST (no subquery), then allowing if user can see their own team_members record

-- Create a SECURITY DEFINER function to check team membership without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.user_is_team_member(p_team_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- This function bypasses RLS to check if user has a team_members record
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id
    AND user_id = p_user_id
    AND COALESCE(status, 'active') = 'active'
  );
END;
$$;

-- Fix teams SELECT policy: Break circular dependency
DROP POLICY IF EXISTS teams_select ON public.teams;
DROP POLICY IF EXISTS "Users can view their teams" ON public.teams;

CREATE POLICY teams_select ON public.teams FOR SELECT USING (
  -- User created the team (can always see it - no subquery needed, direct column comparison)
  created_by = (select auth.uid())
  OR
  -- User is a team member (using function that bypasses RLS to avoid recursion)
  public.user_is_team_member(id, (select auth.uid()))
);

CREATE POLICY "Users can view their teams" ON public.teams FOR SELECT USING (
  -- User created the team (can always see it)
  created_by = (select auth.uid())
  OR
  -- User is a team member (using function that bypasses RLS to avoid recursion)
  public.user_is_team_member(id, (select auth.uid()))
);

