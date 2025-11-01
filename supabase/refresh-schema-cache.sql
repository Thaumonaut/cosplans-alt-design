-- This SQL script can be run in Supabase SQL Editor to refresh the schema cache
-- Supabase uses this to rebuild PostgREST's schema cache

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Alternative: You can also just run this in the SQL editor:
-- SELECT notify_pgrst();

