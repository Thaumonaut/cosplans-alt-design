# Verify and Fix All Required Functions

**Issues**:
- `calculate_project_progress` returns 404
- Resource linking still failing

## Quick Fix: Verify All Required Functions Exist

Run this in Supabase SQL Editor to check what's missing:

```sql
-- Check if all required functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'link_resource_safe',
  'calculate_project_progress',
  'create_resource_safe',
  'update_updated_at_column'
)
ORDER BY routine_name;
```

**Expected**: Should see all 4 functions listed.

---

## If Functions Are Missing

### Step 1: Apply Migration for `calculate_project_progress`

This function is in `20250000000009_utility_functions.sql`. Run this in SQL Editor:

```sql
-- Progress calculation function
CREATE OR REPLACE FUNCTION public.calculate_project_progress(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  project_task_completion DECIMAL;
  resource_completion DECIMAL;
  total_resources INTEGER;
  result INTEGER;
BEGIN
  SELECT COALESCE((COUNT(*) FILTER (WHERE completed = TRUE)::DECIMAL / NULLIF(COUNT(*), 0)), 0)
    INTO project_task_completion
  FROM public.tasks
  WHERE project_id = project_uuid AND resource_id IS NULL;

  SELECT COUNT(*) INTO total_resources
  FROM public.project_resources
  WHERE project_id = project_uuid;

  IF total_resources > 0 THEN
    SELECT AVG((
      CASE pr.status
        WHEN 'needed' THEN 0
        WHEN 'acquired' THEN 0.25
        WHEN 'in-progress' THEN 0.5
        WHEN 'completed' THEN 1.0
      END + COALESCE((
        SELECT COUNT(*) FILTER (WHERE completed = TRUE)::DECIMAL / NULLIF(COUNT(*), 0)
        FROM public.tasks t
        WHERE t.resource_id = pr.resource_id
      ), 0)) / 2)
    INTO resource_completion
    FROM public.project_resources pr
    WHERE pr.project_id = project_uuid;
  ELSE
    resource_completion := 0;
  END IF;

  IF total_resources = 0 THEN
    result := ROUND(project_task_completion * 100);
  ELSIF NOT EXISTS (SELECT 1 FROM public.tasks WHERE project_id = project_uuid AND resource_id IS NULL) THEN
    result := ROUND(resource_completion * 100);
  ELSE
    result := ROUND(((project_task_completion + resource_completion) / 2) * 100);
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.calculate_project_progress TO authenticated;
```

### Step 2: Verify `link_resource_safe` Function

Make sure you've applied the fixed version:

```bash
cat supabase/migrations/20251101150000_create_link_resource_safe.sql
```

Copy and run in SQL Editor.

### Step 3: Refresh Schema Cache

After applying any functions:

```sql
NOTIFY pgrst, 'reload schema';
```

Wait 5-10 minutes for cache to update.

---

## Debug Resource Linking

If linking still fails, run this diagnostic query:

```sql
-- Check if project_resources table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'project_resources';

-- Check if link_resource_safe function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'link_resource_safe';

-- Test link_resource_safe function (replace with your actual IDs)
-- SELECT * FROM link_resource_safe(
--   'YOUR_PROJECT_ID_HERE'::UUID,
--   'YOUR_RESOURCE_ID_HERE'::UUID,
--   1,
--   'needed'
-- );
```

---

## Complete Migration Checklist

Make sure ALL these migrations have been applied:

1. ✅ `20250000000007_join_tables.sql` - Creates `project_resources` table
2. ✅ `20250000000009_utility_functions.sql` - Creates `calculate_project_progress`
3. ✅ `20251101150000_create_link_resource_safe.sql` - Creates `link_resource_safe` (fixed version)
4. ✅ `20251101160000_fix_resources_rls_policy.sql` - Fixes resources RLS

After all are applied, run:
```sql
NOTIFY pgrst, 'reload schema';
```

Wait 5-10 minutes, then test again.

---

## Common Issues

### "Function already exists"
- That's fine - `CREATE OR REPLACE` will update it
- Continue with next step

### "Table does not exist"
- Apply `20250000000007_join_tables.sql` first

### "Permission denied"
- Apply `20251101160000_fix_resources_rls_policy.sql`
- Check your user is team owner or active editor

### Still getting 404 after applying functions
- Wait longer (can take 10-15 minutes for schema cache)
- Run `NOTIFY pgrst, 'reload schema';` again
- Hard refresh browser (Ctrl+Shift+R)


