-- Migrate existing tasks to default stages based on completed boolean
-- Completed tasks → "Done" stage
-- Not completed tasks → "Todo" stage

DO $$
DECLARE
  task_record RECORD;
  done_stage_id UUID;
  todo_stage_id UUID;
BEGIN
  FOR task_record IN 
    SELECT t.id, t.completed, 
           CASE 
             WHEN t.project_id IS NOT NULL THEN p.team_id
             ELSE t.team_id
           END AS effective_team_id
    FROM public.tasks t
    LEFT JOIN public.projects p ON t.project_id = p.id
    WHERE t.stage_id IS NULL
  LOOP
    -- Get "Done" stage for this team
    SELECT id INTO done_stage_id
    FROM public.task_stages
    WHERE team_id = task_record.effective_team_id
      AND name = 'Done'
      AND is_completion_stage = TRUE
    LIMIT 1;

    -- Get "Todo" stage for this team
    SELECT id INTO todo_stage_id
    FROM public.task_stages
    WHERE team_id = task_record.effective_team_id
      AND name = 'Todo'
      AND is_completion_stage = FALSE
    LIMIT 1;

    -- Assign stage based on completed status
    IF task_record.completed = TRUE AND done_stage_id IS NOT NULL THEN
      UPDATE public.tasks
      SET stage_id = done_stage_id
      WHERE id = task_record.id;
    ELSIF task_record.completed = FALSE AND todo_stage_id IS NOT NULL THEN
      UPDATE public.tasks
      SET stage_id = todo_stage_id
      WHERE id = task_record.id;
    END IF;
  END LOOP;
END;
$$;

-- Set stage_id for any remaining tasks that don't have a stage
-- (fallback to first non-completion stage if "Todo" doesn't exist)
UPDATE public.tasks t
SET stage_id = (
  SELECT ts.id
  FROM public.task_stages ts
  WHERE ts.team_id = COALESCE(
    (SELECT team_id FROM public.projects WHERE id = t.project_id),
    t.team_id
  )
  AND ts.is_completion_stage = FALSE
  ORDER BY ts.display_order ASC
  LIMIT 1
)
WHERE t.stage_id IS NULL;

