-- Create task_stages table for team-specific workflow stage configurations

CREATE TABLE IF NOT EXISTS public.task_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_completion_stage BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_stages_team_name_unique UNIQUE (team_id, name),
  CONSTRAINT task_stages_display_order_check CHECK (display_order >= 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_stages_team ON public.task_stages(team_id, display_order);
CREATE INDEX IF NOT EXISTS idx_task_stages_team_name ON public.task_stages(team_id, name);

-- Enable RLS
ALTER TABLE public.task_stages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_stages

-- SELECT: Users can see stages from teams they are members of
CREATE POLICY task_stages_select ON public.task_stages FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = (SELECT auth.uid()) 
    AND COALESCE(status, 'active') = 'active'
  )
);

-- INSERT: Users must be owner/editor to create stages
CREATE POLICY task_stages_insert ON public.task_stages FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = (SELECT auth.uid()) 
    AND role IN ('owner', 'editor')
    AND COALESCE(status, 'active') = 'active'
  )
);

-- UPDATE: Users must be owner/editor to modify stages
CREATE POLICY task_stages_update ON public.task_stages FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = (SELECT auth.uid()) 
    AND role IN ('owner', 'editor')
    AND COALESCE(status, 'active') = 'active'
  )
);

-- DELETE: Users must be owner/editor to delete stages
CREATE POLICY task_stages_delete ON public.task_stages FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = (SELECT auth.uid()) 
    AND role IN ('owner', 'editor')
    AND COALESCE(status, 'active') = 'active'
  )
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_task_stages_updated_at
  BEFORE UPDATE ON public.task_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Now add the foreign key constraint to tasks.stage_id
-- This must be done after task_stages table is created
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_stage_id_fkey 
FOREIGN KEY (stage_id) REFERENCES public.task_stages(id) ON DELETE SET NULL;

