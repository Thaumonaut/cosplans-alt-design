-- Fix RLS on system tables (optional - these are Supabase internal tables)
-- Enable RLS on system tables to fix dashboard warnings
ALTER TABLE IF EXISTS public.service_connection_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.service_connection_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diagnostic_test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.error_events ENABLE ROW LEVEL SECURITY;

-- Add deny-all policies for system tables (they should only be accessible internally)
DO $$
BEGIN
  -- Only create policies if tables exist and RLS was just enabled
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'service_connection_heartbeats') THEN
    DROP POLICY IF EXISTS deny_all_service_connection_heartbeats ON public.service_connection_heartbeats;
    CREATE POLICY deny_all_service_connection_heartbeats ON public.service_connection_heartbeats
      AS RESTRICTIVE FOR ALL USING (false);
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'service_connection_profiles') THEN
    DROP POLICY IF EXISTS deny_all_service_connection_profiles ON public.service_connection_profiles;
    CREATE POLICY deny_all_service_connection_profiles ON public.service_connection_profiles
      AS RESTRICTIVE FOR ALL USING (false);
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'diagnostic_test_runs') THEN
    DROP POLICY IF EXISTS deny_all_diagnostic_test_runs ON public.diagnostic_test_runs;
    CREATE POLICY deny_all_diagnostic_test_runs ON public.diagnostic_test_runs
      AS RESTRICTIVE FOR ALL USING (false);
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'error_events') THEN
    DROP POLICY IF EXISTS deny_all_error_events ON public.error_events;
    CREATE POLICY deny_all_error_events ON public.error_events
      AS RESTRICTIVE FOR ALL USING (false);
  END IF;
END $$;

