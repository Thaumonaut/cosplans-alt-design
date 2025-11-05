-- Add color column to task_stages table

ALTER TABLE public.task_stages
ADD COLUMN IF NOT EXISTS color TEXT;

-- Add comment
COMMENT ON COLUMN public.task_stages.color IS 'Custom color for the stage (hex color code, e.g., #8b5cf6)';

