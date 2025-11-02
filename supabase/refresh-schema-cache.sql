-- Refresh PostgREST Schema Cache
-- Run this in Supabase SQL Editor after applying migrations

-- This command notifies PostgREST to reload its schema cache
-- After running, wait 1-2 minutes (may take up to 5-10 minutes) for cache to update

NOTIFY pgrst, 'reload schema';

-- Alternative: You can also just run this in the SQL editor:
-- SELECT notify_pgrst();

