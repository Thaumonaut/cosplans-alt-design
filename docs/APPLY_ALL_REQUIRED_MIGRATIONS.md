# Apply All Required Migrations

**Error**: `relation "public.project_resources" does not exist`

This means the `project_resources` table hasn't been created yet. You need to apply **3 migrations** in order:

---

## Migration Order (Apply in this exact order)

### 1. Create `project_resources` Table (REQUIRED FIRST)
**File**: `supabase/migrations/20250000000007_join_tables.sql`

This creates the `project_resources` table that links projects to resources.

### 2. Create `link_resource_safe()` Function
**File**: `supabase/migrations/20251101150000_create_link_resource_safe.sql`

This creates the RPC function to safely link resources (bypasses schema cache).

### 3. Fix Resources RLS Policy
**File**: `supabase/migrations/20251101160000_fix_resources_rls_policy.sql`

This fixes the RLS policy so you can view your own resources.

---

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Apply Migration 1 - Create `project_resources` Table

**Copy and paste this entire SQL** into the SQL Editor:

```sql
-- Join tables: project_resources, photoshoot_projects

CREATE TABLE IF NOT EXISTS public.project_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'needed' CHECK (status IN ('needed','acquired','in-progress','completed')),
  notes TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT project_resources_unique UNIQUE (project_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_project_resources_project ON public.project_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_project_resources_resource ON public.project_resources(resource_id);

ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;
```

Click **"Run"** - you should see success messages.

### Step 3: Apply Migration 2 - Create `link_resource_safe()` Function

**Copy and paste this entire SQL** (or use the file):

```bash
cat supabase/migrations/20251101150000_create_link_resource_safe.sql
```

Copy the output and paste into SQL Editor, then click **"Run"**.

### Step 4: Apply Migration 3 - Fix Resources RLS Policy

**Copy and paste this entire SQL** (or use the file):

```bash
cat supabase/migrations/20251101160000_fix_resources_rls_policy.sql
```

Copy the output and paste into SQL Editor, then click **"Run"**.

### Step 5: Refresh Schema Cache

**Still in SQL Editor**, run:

```sql
NOTIFY pgrst, 'reload schema';
```

Click **"Run"** - you should see "Success. No rows returned"

Wait 1-2 minutes (may take up to 5-10 minutes) for cache to update.

### Step 6: Verify Everything Works

Run these verification queries:

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

-- Check RLS policies on resources
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'resources';
```

You should see:
- ✅ `project_resources` table
- ✅ `link_resource_safe` function
- ✅ `resources_select`, `resources_insert`, `resources_update`, `resources_delete` policies

---

## Quick Reference: All 3 Migrations

If you want to apply all 3 at once, you can copy all three migration files sequentially into the SQL Editor and run them together (they're designed to be idempotent with `IF NOT EXISTS` and `CREATE OR REPLACE`).

**Order matters!** Apply them in this sequence:
1. `20250000000007_join_tables.sql` (creates table)
2. `20251101150000_create_link_resource_safe.sql` (creates function)
3. `20251101160000_fix_resources_rls_policy.sql` (fixes policies)

---

## Troubleshooting

### "relation 'projects' does not exist"
- You need to apply `20250000000002_projects_table.sql` first

### "relation 'resources' does not exist"
- You need to apply `20250000000003_resources_table.sql` first

### "permission denied" after applying
- Make sure you applied Migration 3 (RLS policy fix)
- Check that your user is a team owner or active member

### Still getting 404/406 errors
- Wait longer for schema cache (can take 5-10 minutes)
- Try running `NOTIFY pgrst, 'reload schema';` again
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

---

## Next Steps

After all migrations are applied:
1. Try creating a resource
2. Try linking it to a project
3. Check browser console - should have no 404/406 errors

