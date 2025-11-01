# Fixing Supabase Schema Cache Issues

If you're seeing `PGRST204` errors about `created_by` column not being found in the schema cache, here's how to fix it:

## Option 1: Run the SQL Migration (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the migration file: `supabase/migrations/20250000000010_create_team_function.sql`
4. This creates a workaround function that bypasses the schema cache

The code will automatically use this function when it detects schema cache issues.

## Option 2: Contact Supabase Support

For hosted Supabase instances, schema cache refresh typically requires:
- Opening a support ticket, OR
- Waiting for automatic cache refresh (can take hours)

## Option 3: Force Schema Refresh via API

Try making a simple query that triggers a schema refresh:

```sql
-- Run this in SQL Editor
SELECT pg_notify('pgrst', 'reload schema');
```

Note: This may not work on hosted instances, but it's worth trying.

## RLS Warnings

The RLS warnings about system tables (`service_connection_heartbeats`, etc.) are from Supabase's internal diagnostic tables. They don't affect your application functionality, but you can:

1. Ignore them (they're just warnings)
2. Run `supabase/migrations/20250000000011_fix_rls_and_refresh_schema.sql` to enable RLS on those tables

## Current Status

The code now automatically:
- ✅ Tries normal insert first
- ✅ Falls back to SQL function if schema cache error detected
- ✅ Provides clear error messages if both fail

