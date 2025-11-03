-- Create default task stages for all existing teams
-- Default stages: "Todo" (order 0), "In Progress" (order 1), "Done" (order 2, completion)

-- Function to create default stages for a team (idempotent)
CREATE OR REPLACE FUNCTION public.create_default_task_stages_for_team(p_team_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create "Todo" stage if it doesn't exist
  INSERT INTO public.task_stages (team_id, name, display_order, is_completion_stage)
  VALUES (p_team_id, 'Todo', 0, FALSE)
  ON CONFLICT (team_id, name) DO NOTHING;

  -- Create "In Progress" stage if it doesn't exist
  INSERT INTO public.task_stages (team_id, name, display_order, is_completion_stage)
  VALUES (p_team_id, 'In Progress', 1, FALSE)
  ON CONFLICT (team_id, name) DO NOTHING;

  -- Create "Done" stage (completion stage) if it doesn't exist
  INSERT INTO public.task_stages (team_id, name, display_order, is_completion_stage)
  VALUES (p_team_id, 'Done', 2, TRUE)
  ON CONFLICT (team_id, name) DO NOTHING;
END;
$$;

-- Create default stages for all existing teams
DO $$
DECLARE
  team_record RECORD;
BEGIN
  FOR team_record IN SELECT id FROM public.teams
  LOOP
    PERFORM public.create_default_task_stages_for_team(team_record.id);
  END LOOP;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_default_task_stages_for_team(UUID) TO authenticated;

