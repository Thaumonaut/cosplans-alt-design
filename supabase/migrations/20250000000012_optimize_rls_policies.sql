-- Optimize RLS policies for performance
-- Replace auth.uid() with (select auth.uid()) to evaluate once per query instead of per row
-- This fixes the "auth_rls_initplan" warnings from Supabase linter

-- users: update own profile
DROP POLICY IF EXISTS users_update ON public.users;
CREATE POLICY users_update ON public.users FOR UPDATE 
  USING (id = (select auth.uid())) 
  WITH CHECK (id = (select auth.uid()));

-- teams: membership-based access
DROP POLICY IF EXISTS teams_select ON public.teams;
CREATE POLICY teams_select ON public.teams FOR SELECT USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
CREATE POLICY "Users can create teams" ON public.teams FOR INSERT WITH CHECK (
  created_by = (select auth.uid())
);

DROP POLICY IF EXISTS teams_update ON public.teams;
CREATE POLICY teams_update ON public.teams FOR UPDATE USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

DROP POLICY IF EXISTS teams_delete ON public.teams;
CREATE POLICY teams_delete ON public.teams FOR DELETE USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

DROP POLICY IF EXISTS "Users can view their teams" ON public.teams;
CREATE POLICY "Users can view their teams" ON public.teams FOR SELECT USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS "Owners can update their teams" ON public.teams;
CREATE POLICY "Owners can update their teams" ON public.teams FOR UPDATE USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

DROP POLICY IF EXISTS "Owners can delete their teams" ON public.teams;
CREATE POLICY "Owners can delete their teams" ON public.teams FOR DELETE USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- team_members: view members of own teams; manage by owners
-- Break circular dependency by checking via teams table only
-- Note: Team creators should be automatically added as team_members when team is created
DROP POLICY IF EXISTS team_members_select ON public.team_members;
CREATE POLICY team_members_select ON public.team_members FOR SELECT USING (
  -- User created the team (team owner via teams.created_by) - can see all members
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User can see their own membership record
  user_id = (select auth.uid())
);

DROP POLICY IF EXISTS team_members_insert ON public.team_members;
CREATE POLICY team_members_insert ON public.team_members FOR INSERT WITH CHECK (
  -- User created the team (can always add members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is an existing owner member
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND COALESCE(status, 'active') = 'active')
);

DROP POLICY IF EXISTS team_members_update ON public.team_members;
CREATE POLICY team_members_update ON public.team_members FOR UPDATE USING (
  -- User created the team (can always update members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is an existing owner member
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND COALESCE(status, 'active') = 'active')
);

DROP POLICY IF EXISTS team_members_delete ON public.team_members;
CREATE POLICY team_members_delete ON public.team_members FOR DELETE USING (
  -- User created the team (can always remove members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is an existing owner member
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND COALESCE(status, 'active') = 'active')
);

DROP POLICY IF EXISTS "Team members can view each other" ON public.team_members;
CREATE POLICY "Team members can view each other" ON public.team_members FOR SELECT USING (
  -- User created the team (team owner via teams.created_by) - can see all members
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User can see their own membership record
  user_id = (select auth.uid())
);

DROP POLICY IF EXISTS "Owners and admins can add members" ON public.team_members;
CREATE POLICY "Owners and admins can add members" ON public.team_members FOR INSERT WITH CHECK (
  -- User created the team (can always add members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = (select auth.uid()))
  OR
  -- User is an existing owner member
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND COALESCE(status, 'active') = 'active')
);

DROP POLICY IF EXISTS "Owners and admins can update members" ON public.team_members;
CREATE POLICY "Owners and admins can update members" ON public.team_members FOR UPDATE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.team_members;
CREATE POLICY "Owners and admins can remove members" ON public.team_members FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- Note: "Users can add themselves via active join link" policy is created in 20251102120000_create_team_join_links.sql
-- after the team_join_links table is created, to avoid dependency issues.
-- This policy is commented out here to prevent errors when running migrations in order.
-- DROP POLICY IF EXISTS "Users can add themselves via active join link" ON public.team_members;
-- CREATE POLICY "Users can add themselves via active join link" ON public.team_members FOR INSERT WITH CHECK (
--   EXISTS (
--     SELECT 1 FROM public.team_join_links tjl
--     WHERE tjl.team_id = team_members.team_id
--       AND tjl.code = current_setting('app.join_code', true)
--       AND tjl.is_active = true
--       AND tjl.expires_at > NOW()
--   )
-- );

-- projects
DROP POLICY IF EXISTS projects_select ON public.projects;
CREATE POLICY projects_select ON public.projects FOR SELECT USING (
  public.get_user_team_role(team_id, (select auth.uid())) IN ('owner','editor','viewer')
);

DROP POLICY IF EXISTS projects_insert ON public.projects;
CREATE POLICY projects_insert ON public.projects FOR INSERT WITH CHECK (
  public.get_user_team_role(team_id, (select auth.uid())) IN ('owner','editor')
);

DROP POLICY IF EXISTS projects_update ON public.projects;
CREATE POLICY projects_update ON public.projects FOR UPDATE USING (
  public.get_user_team_role(team_id, (select auth.uid())) IN ('owner','editor')
);

DROP POLICY IF EXISTS projects_delete ON public.projects;
CREATE POLICY projects_delete ON public.projects FOR DELETE USING (
  public.get_user_team_role(team_id, (select auth.uid())) IN ('owner','editor')
);

-- ideas
DROP POLICY IF EXISTS ideas_select ON public.ideas;
CREATE POLICY ideas_select ON public.ideas FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS ideas_insert ON public.ideas;
CREATE POLICY ideas_insert ON public.ideas FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS ideas_update ON public.ideas;
CREATE POLICY ideas_update ON public.ideas FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS ideas_delete ON public.ideas;
CREATE POLICY ideas_delete ON public.ideas FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
  )
);

-- resources
DROP POLICY IF EXISTS resources_select ON public.resources;
CREATE POLICY resources_select ON public.resources FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS resources_insert ON public.resources;
CREATE POLICY resources_insert ON public.resources FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS resources_update ON public.resources;
CREATE POLICY resources_update ON public.resources FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS resources_delete ON public.resources;
CREATE POLICY resources_delete ON public.resources FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
  )
);

-- tools
DROP POLICY IF EXISTS tools_select ON public.tools;
CREATE POLICY tools_select ON public.tools FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS tools_insert ON public.tools;
CREATE POLICY tools_insert ON public.tools FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS tools_update ON public.tools;
CREATE POLICY tools_update ON public.tools FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS tools_delete ON public.tools;
CREATE POLICY tools_delete ON public.tools FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
  )
);

-- tasks
DROP POLICY IF EXISTS tasks_select ON public.tasks;
CREATE POLICY tasks_select ON public.tasks FOR SELECT USING (
  project_id IN (
    SELECT id FROM public.projects WHERE team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active'
    )
  )
);

DROP POLICY IF EXISTS tasks_insert ON public.tasks;
CREATE POLICY tasks_insert ON public.tasks FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
    )
  )
);

DROP POLICY IF EXISTS tasks_update ON public.tasks;
CREATE POLICY tasks_update ON public.tasks FOR UPDATE USING (
  project_id IN (
    SELECT id FROM public.projects WHERE team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
    )
  )
);

DROP POLICY IF EXISTS tasks_delete ON public.tasks;
CREATE POLICY tasks_delete ON public.tasks FOR DELETE USING (
  project_id IN (
    SELECT id FROM public.projects WHERE team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
    )
  )
);

-- photoshoots
DROP POLICY IF EXISTS photoshoots_select ON public.photoshoots;
CREATE POLICY photoshoots_select ON public.photoshoots FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS photoshoots_insert ON public.photoshoots;
CREATE POLICY photoshoots_insert ON public.photoshoots FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS photoshoots_update ON public.photoshoots;
CREATE POLICY photoshoots_update ON public.photoshoots FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS photoshoots_delete ON public.photoshoots;
CREATE POLICY photoshoots_delete ON public.photoshoots FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner','editor') AND status = 'active'
  )
);

-- comments: read if have access; insert allowed to any role
DROP POLICY IF EXISTS comments_select ON public.comments;
CREATE POLICY comments_select ON public.comments FOR SELECT USING (
  CASE entity_type
    WHEN 'project' THEN entity_id IN (SELECT id FROM public.projects WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid())))
    WHEN 'resource' THEN entity_id IN (SELECT id FROM public.resources WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid())))
    WHEN 'idea' THEN entity_id IN (SELECT id FROM public.ideas WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid())))
    WHEN 'tool' THEN entity_id IN (SELECT id FROM public.tools WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid())))
    WHEN 'photoshoot' THEN entity_id IN (SELECT id FROM public.photoshoots WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid())))
    ELSE false
  END
);

DROP POLICY IF EXISTS comments_insert ON public.comments;
CREATE POLICY comments_insert ON public.comments FOR INSERT WITH CHECK (
  CASE entity_type
    WHEN 'project' THEN entity_id IN (SELECT id FROM public.projects WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid())))
    WHEN 'resource' THEN entity_id IN (SELECT id FROM public.resources WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid())))
    WHEN 'idea' THEN entity_id IN (SELECT id FROM public.ideas WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid())))
    WHEN 'tool' THEN entity_id IN (SELECT id FROM public.tools WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid())))
    WHEN 'photoshoot' THEN entity_id IN (SELECT id FROM public.photoshoots WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid())))
    ELSE false
  END
);

