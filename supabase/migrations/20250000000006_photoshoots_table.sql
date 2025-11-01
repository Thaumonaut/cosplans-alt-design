-- Photoshoots, shots, crew_members

CREATE TABLE IF NOT EXISTS public.photoshoots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE,
  location TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT photoshoots_status_valid CHECK (status IN ('planning','scheduled','completed'))
);

CREATE INDEX IF NOT EXISTS idx_photoshoots_team ON public.photoshoots(team_id);
CREATE INDEX IF NOT EXISTS idx_photoshoots_date ON public.photoshoots(team_id, date);
CREATE INDEX IF NOT EXISTS idx_photoshoots_status ON public.photoshoots(team_id, status);

ALTER TABLE public.photoshoots ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.shots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photoshoot_id UUID NOT NULL REFERENCES public.photoshoots(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  pose TEXT,
  reference_image TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  final_photos TEXT[] NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shots_photoshoot ON public.shots(photoshoot_id, order_index);

ALTER TABLE public.shots ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photoshoot_id UUID NOT NULL REFERENCES public.photoshoots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT crew_members_role_valid CHECK (role IN ('photographer','assistant','makeup','other'))
);

CREATE INDEX IF NOT EXISTS idx_crew_members_photoshoot ON public.crew_members(photoshoot_id);

ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;


