-- Tools table (polymorphic via JSONB metadata)

CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tools_category_valid CHECK ((metadata->>'category') IN ('crafting-tool','shoot-equipment'))
);

CREATE INDEX IF NOT EXISTS idx_tools_team ON public.tools(team_id);
CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools(team_id, (metadata->>'category'));
CREATE INDEX IF NOT EXISTS idx_tools_tags ON public.tools USING GIN(tags);

ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;


