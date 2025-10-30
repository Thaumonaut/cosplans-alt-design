-- Join tables: project_resources, photoshoot_projects

CREATE TABLE IF NOT EXISTS public.project_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'needed' CHECK (status IN ('needed','acquired','in-progress','completed')),
  notes TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT project_resources_unique UNIQUE (project_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_project_resources_project ON public.project_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_project_resources_resource ON public.project_resources(resource_id);

ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.photoshoot_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photoshoot_id UUID NOT NULL REFERENCES public.photoshoots(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT photoshoot_projects_unique UNIQUE (photoshoot_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_photoshoot_projects_photoshoot ON public.photoshoot_projects(photoshoot_id);
CREATE INDEX IF NOT EXISTS idx_photoshoot_projects_project ON public.photoshoot_projects(project_id);

ALTER TABLE public.photoshoot_projects ENABLE ROW LEVEL SECURITY;


