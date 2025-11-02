-- Function to create resources safely, bypassing schema cache issues
-- Similar to create_team_safe, this uses SECURITY DEFINER to bypass RLS during creation

CREATE OR REPLACE FUNCTION public.create_resource_safe(
  p_team_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_images TEXT[] DEFAULT '{}',
  p_cost DECIMAL(10,2) DEFAULT NULL,
  p_tags TEXT[] DEFAULT '{}',
  p_notes TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{"category":"prop"}'::jsonb
)
RETURNS TABLE (
  id UUID,
  team_id UUID,
  name TEXT,
  description TEXT,
  images TEXT[],
  cost DECIMAL(10,2),
  tags TEXT[],
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_resource_id UUID;
  current_user_id UUID;
  has_permission BOOLEAN := FALSE;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Verify user has permission (owner or editor)
  -- Check if user is team owner first
  SELECT EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = p_team_id AND t.created_by = current_user_id
  ) INTO has_permission;
  
  -- If not owner, check if user has owner/editor role in team_members
  IF NOT has_permission THEN
    -- Try checking with status column first (if it exists)
    BEGIN
      SELECT EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = p_team_id 
          AND tm.user_id = current_user_id 
          AND tm.role IN ('owner', 'editor')
          AND tm.status = 'active'
      ) INTO has_permission;
    EXCEPTION WHEN OTHERS THEN
      -- Status column doesn't exist or error - just check role
      SELECT EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = p_team_id 
          AND tm.user_id = current_user_id 
          AND tm.role IN ('owner', 'editor')
      ) INTO has_permission;
    END;
  END IF;
  
  IF NOT has_permission THEN
    RAISE EXCEPTION 'Permission denied: You must be an owner or editor of this team to create resources.';
  END IF;
  
  -- Insert resource directly using SQL
  INSERT INTO public.resources (
    team_id,
    name,
    description,
    images,
    cost,
    tags,
    notes,
    metadata
  )
  VALUES (
    p_team_id,
    p_name,
    p_description,
    p_images,
    p_cost,
    p_tags,
    p_notes,
    p_metadata
  )
  RETURNING resources.id INTO new_resource_id;
  
  -- Return the created resource
  RETURN QUERY
  SELECT 
    r.id,
    r.team_id,
    r.name,
    r.description,
    r.images,
    r.cost,
    r.tags,
    r.notes,
    r.metadata,
    r.created_at,
    r.updated_at
  FROM public.resources r
  WHERE r.id = new_resource_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_resource_safe TO authenticated;

