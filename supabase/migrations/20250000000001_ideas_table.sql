-- Ideas table

CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  character TEXT NOT NULL,
  series TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL,
  estimated_cost DECIMAL(10,2),
  images TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'saved',
  converted_project_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ideas_difficulty_valid CHECK (difficulty IN ('beginner','intermediate','advanced')),
  CONSTRAINT ideas_status_valid CHECK (status IN ('saved','converted'))
);

CREATE INDEX IF NOT EXISTS idx_ideas_team ON public.ideas(team_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON public.ideas(team_id, status);
CREATE INDEX IF NOT EXISTS idx_ideas_difficulty ON public.ideas(team_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_ideas_tags ON public.ideas USING GIN(tags);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;


