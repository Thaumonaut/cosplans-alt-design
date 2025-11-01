# PostgREST Schema Cache Issues

## Problem
PostgREST (Supabase's API layer) maintains a schema cache that doesn't automatically refresh when new tables are created. This causes `404` errors like:
- `Could not find the table 'public.projects' in the schema cache`
- `Could not find a relationship between 'team_members' and 'users' in the schema cache`

## Solution
PostgREST's schema cache refreshes automatically, but it can take a few minutes. To force a refresh:

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Click **"Refresh Schema Cache"** button (if available)

### Option 2: Wait
The cache typically refreshes within 2-5 minutes after table creation.

### Option 3: Restart PostgREST (Not recommended for production)
This requires Supabase support and shouldn't be done in production.

## Workarounds Implemented

### 1. SQL Functions
For critical operations (like team creation), we use SQL functions that bypass PostgREST:
- `create_team_safe()` - Creates teams directly via SQL
- `list_user_teams_safe()` - Lists teams directly via SQL

### 2. Separate Queries
Instead of using foreign key joins (which require schema cache), we:
- Query `team_members` separately
- Query `users` separately
- Combine the results in JavaScript

Example: `teamService.getMembers()` now fetches users separately instead of using `user:users!team_members_user_id_fkey`.

## Current Status
✅ All tables created: `projects`, `tasks`, `resources`, `ideas`, `teams`, `team_members`, `users`
✅ RLS policies configured
⚠️ PostgREST schema cache may need a few minutes to refresh

## If Issues Persist
1. Wait 2-5 minutes after table creation
2. Try refreshing the browser (hard refresh: Ctrl+Shift+R)
3. Clear browser cache
4. Check Supabase dashboard for schema cache refresh option

