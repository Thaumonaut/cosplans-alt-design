-- Add stage_id column to tasks table
-- Stage determines completion status (tasks in completion stages are done)
-- NOTE: Foreign key constraint will be added in next migration after task_stages table is created

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS stage_id UUID;

-- Create index for stage filtering
CREATE INDEX IF NOT EXISTS idx_tasks_stage ON public.tasks(stage_id);

-- Create compound index for kanban queries (team + stage)
CREATE INDEX IF NOT EXISTS idx_tasks_team_stage ON public.tasks(team_id, stage_id);

-- Note: stage_id will be populated in migration 20251102140004_migrate_tasks_to_stages.sql
-- after default stages are created for all teams

