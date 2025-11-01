-- Functions to bypass schema cache issues
-- These use direct SQL to avoid PostgREST schema cache problems
-- Updated to match actual schema: owner_id (not created_by), is_personal (not type)

-- Function to create teams
CREATE OR REPLACE FUNCTION public.create_team_safe(
  team_name TEXT,
  creator_id UUID,
  team_type TEXT DEFAULT 'private'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  owner_id UUID,
  is_personal BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_team_id UUID;
  is_personal_val BOOLEAN;
BEGIN
  -- Convert type string to is_personal boolean
  is_personal_val := (team_type = 'personal');
  
  -- Insert team directly using SQL to bypass schema cache
  INSERT INTO public.teams (name, owner_id, is_personal)
  VALUES (team_name, creator_id, is_personal_val)
  RETURNING teams.id INTO new_team_id;

  -- Add creator as owner in team_members
  -- Try with status column first, fall back to without it if column doesn't exist
  BEGIN
    INSERT INTO public.team_members (team_id, user_id, role, status, joined_at)
    VALUES (new_team_id, creator_id, 'owner', 'active', NOW())
    ON CONFLICT (team_id, user_id) DO UPDATE SET status = 'active', role = 'owner';
  EXCEPTION WHEN OTHERS THEN
    -- Status column doesn't exist, insert without it
    INSERT INTO public.team_members (team_id, user_id, role, joined_at)
    VALUES (new_team_id, creator_id, 'owner', NOW())
    ON CONFLICT (team_id, user_id) DO UPDATE SET role = 'owner';
  END;

  -- Return the created team (only columns that exist)
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.owner_id,
    t.is_personal,
    t.created_at,
    t.updated_at
  FROM public.teams t
  WHERE t.id = new_team_id;
END;
$$;

-- Function to list teams for a user (bypasses schema cache)
CREATE OR REPLACE FUNCTION public.list_user_teams_safe(
  user_uuid UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  owner_id UUID,
  is_personal BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Get teams where user is a member (actual schema has no status column)
  RETURN QUERY
  SELECT DISTINCT
    t.id,
    t.name,
    t.owner_id,
    t.is_personal,
    t.created_at,
    t.updated_at
  FROM public.teams t
  INNER JOIN public.team_members tm ON tm.team_id = t.id
  WHERE tm.user_id = user_uuid
  ORDER BY t.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_team_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_user_teams_safe TO authenticated;

