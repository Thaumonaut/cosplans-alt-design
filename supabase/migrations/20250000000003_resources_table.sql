-- Resources table (polymorphic via JSONB metadata)

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  cost DECIMAL(10,2),
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT resources_category_valid CHECK ((metadata->>'category') IN ('prop','fabric','wig','pattern','costume-piece','accessory','material'))
);

CREATE INDEX IF NOT EXISTS idx_resources_team ON public.resources(team_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(team_id, (metadata->>'category'));
CREATE INDEX IF NOT EXISTS idx_resources_tags ON public.resources USING GIN(tags);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;


