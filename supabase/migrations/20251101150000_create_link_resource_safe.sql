-- Function to link resources to projects safely, bypassing schema cache issues
-- This uses SECURITY DEFINER to bypass RLS during creation

CREATE OR REPLACE FUNCTION public.link_resource_safe(
  p_project_id UUID,
  p_resource_id UUID,
  p_quantity INTEGER DEFAULT 1,
  p_status TEXT DEFAULT 'needed',
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  resource_id UUID,
  quantity INTEGER,
  status TEXT,
  notes TEXT,
  added_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  has_permission BOOLEAN := FALSE;
  project_team_id UUID;
  resource_team_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get project team_id
  SELECT team_id INTO project_team_id
  FROM public.projects p
  WHERE p.id = p_project_id;
  
  IF project_team_id IS NULL THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  -- Get resource team_id
  SELECT team_id INTO resource_team_id
  FROM public.resources r
  WHERE r.id = p_resource_id;
  
  IF resource_team_id IS NULL THEN
    RAISE EXCEPTION 'Resource not found';
  END IF;
  
  -- Verify both project and resource belong to the same team
  IF project_team_id != resource_team_id THEN
    RAISE EXCEPTION 'Project and resource must belong to the same team';
  END IF;
  
  -- Verify user has permission (owner or editor)
  -- Check if user is team owner first
  SELECT EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = project_team_id AND t.owner_id = current_user_id
  ) INTO has_permission;
  
  -- If not owner, check if user has owner/editor role in team_members
  IF NOT has_permission THEN
    -- Try checking with status column first (if it exists)
    BEGIN
      SELECT EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = project_team_id 
          AND tm.user_id = current_user_id 
          AND tm.role IN ('owner', 'editor')
          AND tm.status = 'active'
      ) INTO has_permission;
    EXCEPTION WHEN OTHERS THEN
      -- Status column doesn't exist or error - just check role
      SELECT EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = project_team_id 
          AND tm.user_id = current_user_id 
          AND tm.role IN ('owner', 'editor')
      ) INTO has_permission;
    END;
  END IF;
  
  IF NOT has_permission THEN
    RAISE EXCEPTION 'Permission denied: You must be an owner or editor of this team to link resources.';
  END IF;
  
  -- Insert link directly using SQL (on conflict, update quantity and status)
  -- Reference constraint name to avoid column ambiguity
  INSERT INTO public.project_resources (
    project_id,
    resource_id,
    quantity,
    status,
    notes
  )
  VALUES (
    p_project_id,
    p_resource_id,
    p_quantity,
    p_status,
    p_notes
  )
  ON CONFLICT ON CONSTRAINT project_resources_unique
  DO UPDATE SET
    quantity = EXCLUDED.quantity,
    status = EXCLUDED.status,
    notes = COALESCE(EXCLUDED.notes, public.project_resources.notes);
  
  -- Return the created/updated link
  RETURN QUERY
  SELECT 
    pr.id,
    pr.project_id,
    pr.resource_id,
    pr.quantity,
    pr.status,
    pr.notes,
    pr.added_at
  FROM public.project_resources pr
  WHERE pr.project_id = p_project_id AND pr.resource_id = p_resource_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.link_resource_safe TO authenticated;

