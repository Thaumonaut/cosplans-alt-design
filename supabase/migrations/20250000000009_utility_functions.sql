-- Utility functions, triggers, and baseline RLS policies

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach update triggers
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
    'users','teams','team_members','ideas','projects','resources','tools','tasks','photoshoots','comments'
  )
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%s', r.tablename, r.tablename);
    EXECUTE format(
      'CREATE TRIGGER update_%1$s_updated_at BEFORE UPDATE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()',
      r.tablename
    );
  END LOOP;
END$$;

-- Progress calculation function
CREATE OR REPLACE FUNCTION public.calculate_project_progress(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  project_task_completion DECIMAL;
  resource_completion DECIMAL;
  total_resources INTEGER;
  result INTEGER;
BEGIN
  SELECT COALESCE((COUNT(*) FILTER (WHERE completed = TRUE)::DECIMAL / NULLIF(COUNT(*), 0)), 0)
    INTO project_task_completion
  FROM public.tasks
  WHERE project_id = project_uuid AND resource_id IS NULL;

  SELECT COUNT(*) INTO total_resources
  FROM public.project_resources
  WHERE project_id = project_uuid;

  IF total_resources > 0 THEN
    SELECT AVG((
      CASE pr.status
        WHEN 'needed' THEN 0
        WHEN 'acquired' THEN 0.25
        WHEN 'in-progress' THEN 0.5
        WHEN 'completed' THEN 1.0
      END + COALESCE((
        SELECT COUNT(*) FILTER (WHERE completed = TRUE)::DECIMAL / NULLIF(COUNT(*), 0)
        FROM public.tasks t
        WHERE t.resource_id = pr.resource_id
      ), 0)) / 2)
    INTO resource_completion
    FROM public.project_resources pr
    WHERE pr.project_id = project_uuid;
  ELSE
    resource_completion := 0;
  END IF;

  IF total_resources = 0 THEN
    result := ROUND(project_task_completion * 100);
  ELSIF NOT EXISTS (SELECT 1 FROM public.tasks WHERE project_id = project_uuid AND resource_id IS NULL) THEN
    result := ROUND(resource_completion * 100);
  ELSE
    result := ROUND(((project_task_completion + resource_completion) / 2) * 100);
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Helper: get user role in team
CREATE OR REPLACE FUNCTION public.get_user_team_role(team_uuid UUID, user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.team_members
  WHERE team_id = team_uuid AND user_id = user_uuid AND status = 'active'
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Baseline RLS policies
-- users: own profile
DROP POLICY IF EXISTS users_select ON public.users;
CREATE POLICY users_select ON public.users FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS users_update ON public.users;
CREATE POLICY users_update ON public.users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- teams: membership-based access
DROP POLICY IF EXISTS teams_select ON public.teams;
CREATE POLICY teams_select ON public.teams FOR SELECT USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND status = 'active')
);

DROP POLICY IF EXISTS teams_update ON public.teams;
CREATE POLICY teams_update ON public.teams FOR UPDATE USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active')
);

DROP POLICY IF EXISTS teams_delete ON public.teams;
CREATE POLICY teams_delete ON public.teams FOR DELETE USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active')
);

-- team_members: view members of own teams; manage by owners
DROP POLICY IF EXISTS team_members_select ON public.team_members;
-- Break circular dependency by checking via teams table
CREATE POLICY team_members_select ON public.team_members FOR SELECT USING (
  -- User created the team (team owner via teams.created_by) - can see all members
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
  OR
  -- User can see their own membership record
  user_id = auth.uid()
);

DROP POLICY IF EXISTS team_members_insert ON public.team_members;
CREATE POLICY team_members_insert ON public.team_members FOR INSERT WITH CHECK (
  -- User created the team (can always add members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
  OR
  -- User is an existing owner member
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'owner' AND COALESCE(status, 'active') = 'active')
);

DROP POLICY IF EXISTS team_members_update ON public.team_members;
CREATE POLICY team_members_update ON public.team_members FOR UPDATE USING (
  -- User created the team (can always update members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
  OR
  -- User is an existing owner member
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'owner' AND COALESCE(status, 'active') = 'active')
);

DROP POLICY IF EXISTS team_members_delete ON public.team_members;
CREATE POLICY team_members_delete ON public.team_members FOR DELETE USING (
  -- User created the team (can always remove members)
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
  OR
  -- User is an existing owner member
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'owner' AND COALESCE(status, 'active') = 'active')
);

-- Content tables generic policies: viewers read; editors/owners write
-- projects
DROP POLICY IF EXISTS projects_select ON public.projects;
CREATE POLICY projects_select ON public.projects FOR SELECT USING (
  public.get_user_team_role(team_id, auth.uid()) IN ('owner','editor','viewer')
);
DROP POLICY IF EXISTS projects_insert ON public.projects;
CREATE POLICY projects_insert ON public.projects FOR INSERT WITH CHECK (
  public.get_user_team_role(team_id, auth.uid()) IN ('owner','editor')
);
DROP POLICY IF EXISTS projects_update ON public.projects;
CREATE POLICY projects_update ON public.projects FOR UPDATE USING (
  public.get_user_team_role(team_id, auth.uid()) IN ('owner','editor')
);
DROP POLICY IF EXISTS projects_delete ON public.projects;
CREATE POLICY projects_delete ON public.projects FOR DELETE USING (
  public.get_user_team_role(team_id, auth.uid()) IN ('owner','editor')
);

-- ideas
DROP POLICY IF EXISTS ideas_select ON public.ideas;
CREATE POLICY ideas_select ON public.ideas FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND status = 'active')
);
-- ideas: separate policies per command
DROP POLICY IF EXISTS ideas_insert ON public.ideas;
CREATE POLICY ideas_insert ON public.ideas FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS ideas_update ON public.ideas;
CREATE POLICY ideas_update ON public.ideas FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS ideas_delete ON public.ideas;
CREATE POLICY ideas_delete ON public.ideas FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
  )
);

-- resources
DROP POLICY IF EXISTS resources_select ON public.resources;
CREATE POLICY resources_select ON public.resources FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND status = 'active')
);
DROP POLICY IF EXISTS resources_insert ON public.resources;
CREATE POLICY resources_insert ON public.resources FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS resources_update ON public.resources;
CREATE POLICY resources_update ON public.resources FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS resources_delete ON public.resources;
CREATE POLICY resources_delete ON public.resources FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
  )
);

-- tools
DROP POLICY IF EXISTS tools_select ON public.tools;
CREATE POLICY tools_select ON public.tools FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND status = 'active')
);
DROP POLICY IF EXISTS tools_insert ON public.tools;
CREATE POLICY tools_insert ON public.tools FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS tools_update ON public.tools;
CREATE POLICY tools_update ON public.tools FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS tools_delete ON public.tools;
CREATE POLICY tools_delete ON public.tools FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
  )
);

-- tasks
DROP POLICY IF EXISTS tasks_select ON public.tasks;
CREATE POLICY tasks_select ON public.tasks FOR SELECT USING (
  project_id IN (
    SELECT id FROM public.projects WHERE team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);
DROP POLICY IF EXISTS tasks_insert ON public.tasks;
CREATE POLICY tasks_insert ON public.tasks FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
    )
  )
);

DROP POLICY IF EXISTS tasks_update ON public.tasks;
CREATE POLICY tasks_update ON public.tasks FOR UPDATE USING (
  project_id IN (
    SELECT id FROM public.projects WHERE team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
    )
  )
);

DROP POLICY IF EXISTS tasks_delete ON public.tasks;
CREATE POLICY tasks_delete ON public.tasks FOR DELETE USING (
  project_id IN (
    SELECT id FROM public.projects WHERE team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
    )
  )
);

-- photoshoots
DROP POLICY IF EXISTS photoshoots_select ON public.photoshoots;
CREATE POLICY photoshoots_select ON public.photoshoots FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND status = 'active')
);
DROP POLICY IF EXISTS photoshoots_insert ON public.photoshoots;
CREATE POLICY photoshoots_insert ON public.photoshoots FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS photoshoots_update ON public.photoshoots;
CREATE POLICY photoshoots_update ON public.photoshoots FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
  )
);

DROP POLICY IF EXISTS photoshoots_delete ON public.photoshoots;
CREATE POLICY photoshoots_delete ON public.photoshoots FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner','editor') AND status = 'active'
  )
);

-- comments: read if have access; insert allowed to any role
DROP POLICY IF EXISTS comments_select ON public.comments;
CREATE POLICY comments_select ON public.comments FOR SELECT USING (
  CASE entity_type
    WHEN 'project' THEN entity_id IN (SELECT id FROM public.projects WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
    WHEN 'resource' THEN entity_id IN (SELECT id FROM public.resources WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
    WHEN 'idea' THEN entity_id IN (SELECT id FROM public.ideas WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
    WHEN 'tool' THEN entity_id IN (SELECT id FROM public.tools WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
    WHEN 'photoshoot' THEN entity_id IN (SELECT id FROM public.photoshoots WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
    ELSE false
  END
);

DROP POLICY IF EXISTS comments_insert ON public.comments;
CREATE POLICY comments_insert ON public.comments FOR INSERT WITH CHECK (
  CASE entity_type
    WHEN 'project' THEN entity_id IN (SELECT id FROM public.projects WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
    WHEN 'resource' THEN entity_id IN (SELECT id FROM public.resources WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
    WHEN 'idea' THEN entity_id IN (SELECT id FROM public.ideas WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
    WHEN 'tool' THEN entity_id IN (SELECT id FROM public.tools WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
    WHEN 'photoshoot' THEN entity_id IN (SELECT id FROM public.photoshoots WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()))
    ELSE false
  END
);


