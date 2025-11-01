-- Projects table

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  from_idea_id UUID REFERENCES public.ideas(id),
  character TEXT NOT NULL,
  series TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  estimated_budget DECIMAL(10,2),
  spent_budget DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (spent_budget >= 0),
  deadline DATE,
  description TEXT,
  cover_image TEXT,
  reference_images TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT projects_status_valid CHECK (status IN ('planning','in-progress','completed','archived'))
);

CREATE INDEX IF NOT EXISTS idx_projects_team ON public.projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(team_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON public.projects(team_id, deadline);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON public.projects USING GIN(tags);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Back-reference for ideas.converted_project_id now that projects exists
ALTER TABLE public.ideas
  ADD CONSTRAINT ideas_converted_project_fk
  FOREIGN KEY (converted_project_id)
  REFERENCES public.projects(id) ON DELETE SET NULL;


