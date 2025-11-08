-- ================================================================
-- Modern Task UI: Custom Field Definitions Table
-- Feature: 003-modern-task-ui
-- Purpose: Team-defined custom fields for tasks (e.g., cost, measurements)
-- ================================================================

-- Create custom_field_definitions table
CREATE TABLE IF NOT EXISTS public.custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT FALSE,
  options JSONB, -- For 'select' type: [{ value, label }]
  default_value JSONB, -- Type-specific default value
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT custom_field_definitions_field_type_check CHECK (
    field_type IN ('text', 'number', 'currency', 'date', 'select', 'checkbox')
  ),
  CONSTRAINT custom_field_definitions_team_name_unique UNIQUE (team_id, name),
  CONSTRAINT custom_field_definitions_display_order_check CHECK (display_order >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_team_id ON public.custom_field_definitions(team_id, display_order);

-- Add comments for documentation
COMMENT ON TABLE public.custom_field_definitions IS 'Team-defined custom fields for tasks (e.g., cost, measurements, custom attributes)';
COMMENT ON COLUMN public.custom_field_definitions.field_type IS 'Field type: text, number, currency, date, select, checkbox';
COMMENT ON COLUMN public.custom_field_definitions.options IS 'For select type: JSONB array [{ value, label }]';
COMMENT ON COLUMN public.custom_field_definitions.default_value IS 'Type-specific default value (JSONB)';

-- Enable Row Level Security
ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Team members can view team field definitions
CREATE POLICY custom_field_definitions_select ON public.custom_field_definitions FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: INSERT - Team editors/owners can create field definitions
CREATE POLICY custom_field_definitions_insert ON public.custom_field_definitions FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('owner', 'editor')
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: UPDATE - Team editors/owners can update field definitions
CREATE POLICY custom_field_definitions_update ON public.custom_field_definitions FOR UPDATE USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND role IN ('owner', 'editor')
    AND COALESCE(status, 'active') = 'active'
  )
);

-- RLS Policy: DELETE - Team owners can delete field definitions
CREATE POLICY custom_field_definitions_delete ON public.custom_field_definitions FOR DELETE USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = (SELECT auth.uid())
    AND role = 'owner'
    AND COALESCE(status, 'active') = 'active'
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_custom_field_definitions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER custom_field_definitions_updated_at_trigger
  BEFORE UPDATE ON public.custom_field_definitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_custom_field_definitions_updated_at();


