-- Repair Supabase Migration History
-- Run this in Supabase Dashboard → SQL Editor to fix migration history mismatch
-- This removes orphaned remote migrations and ensures local migrations are tracked

-- Step 1: Delete orphaned remote migrations (these don't exist locally)
DELETE FROM supabase_migrations.schema_migrations
WHERE version IN (
  '20251017000000', '20251018023856', '20251018093000', '20251020153000', '20251020160000',
  '20251020161000', '20251020162000', '20251020163000', '20251020170000', '20251020180000',
  '20251020210000', '20251020211000', '20251020213000', '20251020214000', '20251021021500',
  '20251021021600', '20251021021700', '20251021021800', '20251021023000', '20251021023100',
  '20251021030800', '20251021223023', '20251022000000', '20251022210000', '20251022220000',
  '20251023000000', '20251024000000', '20251024163735', '20251025000000', '20251025163735',
  '20251025164735', '20251025165735'
);

-- Step 2: Ensure local migrations are marked as applied (if they don't already exist)
-- Note: Adjust names if needed based on your actual migration file names
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES
  ('20240000000000', 'test_schema_functions', '{}'),
  ('20250000000000', 'initial_schema', '{}'),
  ('20250000000001', 'ideas_table', '{}'),
  ('20250000000002', 'projects_table', '{}'),
  ('20250000000003', 'resources_table', '{}'),
  ('20250000000004', 'tools_table', '{}'),
  ('20250000000005', 'tasks_table', '{}'),
  ('20250000000006', 'photoshoots_table', '{}'),
  ('20250000000007', 'join_tables', '{}'),
  ('20250000000008', 'comments_table', '{}'),
  ('20250000000009', 'utility_functions', '{}'),
  ('20250000000010', 'create_team_function', '{}'),
  ('20250000000011', 'fix_rls_and_refresh_schema', '{}'),
  ('20250000000012', 'optimize_rls_policies', '{}'),
  ('20250000000013', 'fix_performance_warnings', '{}'),
  ('20250000000014', 'fix_team_members_status', '{}'),
  ('20250000000015', 'ensure_team_members_status', '{}'),
  ('20250000000016', 'create_resource_safe', '{}')
ON CONFLICT (version) DO NOTHING;

-- Step 3: Verify the repair
SELECT version, name FROM supabase_migrations.schema_migrations 
WHERE version LIKE '20250000%' 
ORDER BY version;

