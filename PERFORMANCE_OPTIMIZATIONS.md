# Performance Optimizations

## ✅ Completed

### Duplicate Indexes Removed
Successfully removed duplicate indexes that were causing performance warnings:
- `idx_character_wigs_character_id` (duplicate of `character_wigs_character_id_idx`)
- `idx_character_wigs_wig_id` (duplicate of `character_wigs_wig_id_idx`)
- `idx_characters_team_id` (duplicate of `characters_team_id_idx`)
- `idx_team_invitations_token` (duplicate of `team_invitations_token_key`)
- `idx_team_members_unique` (duplicate of `team_members_team_id_user_id_key`)
- `idx_wigs_team_id` (duplicate of `wigs_team_id_idx`)

## ⚠️ Pending (Requires Schema Cache Refresh)

### RLS Policy Optimizations
The RLS performance warnings require updating policies to wrap `auth.uid()` in `(select auth.uid())`. This couldn't be completed due to PostgREST schema cache issues - the `status` and `created_by` columns aren't visible to PostgREST even though they exist in the database.

**To fix after schema cache refreshes:**
1. Run the migration: `supabase/migrations/20250000000013_fix_performance_warnings.sql`
2. Or manually update each policy that uses `auth.uid()` to use `(select auth.uid())` instead

**Impact:** 
- Currently: `auth.uid()` is evaluated once per row in queries (slow at scale)
- After fix: `auth.uid()` will be evaluated once per query (much faster)

### Policy Consolidation
Some tables have duplicate policies that could be consolidated, but this is lower priority:
- `character_wigs` has both named and generic policies
- `characters` has both named and generic policies  
- `wigs` has both named and generic policies
- `resource_photos` has multiple overlapping policies

## How to Apply Remaining Fixes

Once Supabase refreshes the schema cache:

1. **Option 1: Run the migration directly**
   ```bash
   bunx supabase db push
   # Or manually in SQL Editor
   ```

2. **Option 2: Fix policies one at a time**
   - Open Supabase Dashboard → SQL Editor
   - For each policy warning, update the policy to wrap `auth.uid()` in `(select auth.uid())`
   - Example:
     ```sql
     -- Before
     CREATE POLICY ... USING (user_id = auth.uid())
     
     -- After  
     CREATE POLICY ... USING (user_id = (select auth.uid()))
     ```

## Current Status

- ✅ Duplicate indexes: **Fixed**
- ⚠️ RLS auth.uid() optimization: **Pending schema cache refresh**
- ⚠️ Policy consolidation: **Lower priority, can be done later**

The app will work fine with current warnings - they're performance optimizations, not breaking issues. Query performance may be slightly slower at scale until the RLS policies are optimized.

