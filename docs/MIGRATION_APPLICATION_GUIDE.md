# Migration Application Guide

**Purpose**: Step-by-step guide to apply database migrations that fix resource linking and RLS policies

## Critical Migrations to Apply

These three migrations are **REQUIRED** to fix resource linking issues:

1. ✅ `20250000000007_join_tables.sql` - Creates `project_resources` table (should already be applied)
2. ⚠️ `20251101150000_create_link_resource_safe.sql` - Creates `link_resource_safe()` RPC function
3. ⚠️ `20251101160000_fix_resources_rls_policy.sql` - Fixes resources RLS to allow team owners

---

## Step-by-Step Application

### Option 1: Supabase Dashboard SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Apply Migration 1: Create Link Resource Safe Function**

   Copy the entire contents of:
   ```
   supabase/migrations/20251101150000_create_link_resource_safe.sql
   ```

   Paste into SQL Editor and click "Run"

   **Expected Result**: Success message with "CREATE FUNCTION"

4. **Apply Migration 2: Fix Resources RLS Policy**

   Copy the entire contents of:
   ```
   supabase/migrations/20251101160000_fix_resources_rls_policy.sql
   ```

   Paste into SQL Editor and click "Run"

   **Expected Result**: Success messages for each DROP/CREATE POLICY

5. **Verify Migrations Applied**

   Run this query:
   ```sql
   -- Check if function exists
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name = 'link_resource_safe';
   
   -- Check RLS policies on resources
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename = 'resources';
   ```

   You should see:
   - `link_resource_safe` function
   - `resources_select`, `resources_insert`, `resources_update`, `resources_delete` policies

6. **Refresh Schema Cache** (Important!)

   In the SQL Editor, run this command:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
   
   Click "Run" - you should see "Success. No rows returned"
   
   **Note**: The cache may still take 1-2 minutes to fully update. If errors persist, wait 5-10 minutes and try again.

---

### Option 2: Supabase CLI (If Available)

```bash
# Link project (if not already linked)
bunx supabase link --project-ref YOUR_PROJECT_REF

# Apply specific migrations
bunx supabase db push

# Or apply individual migration files
bunx supabase migration up
```

**Note**: CLI may have schema cache issues. Dashboard SQL Editor is more reliable.

---

## Verification Checklist

After applying migrations, verify:

- [ ] `link_resource_safe()` function exists
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'link_resource_safe';
   ```

- [ ] `project_resources` table exists
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name = 'project_resources';
   ```

- [ ] Resources RLS policies allow team owners
   ```sql
   SELECT policyname FROM pg_policies 
   WHERE tablename = 'resources';
   ```
   Should show: `resources_select`, `resources_insert`, `resources_update`, `resources_delete`

- [ ] Schema cache refreshed:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
   (Wait 5-10 minutes after running this command)

---

## Troubleshooting

### "Function already exists"

If you see "function already exists", it means the migration was already applied. Skip that migration.

### "Table project_resources does not exist"

Apply migration `20250000000007_join_tables.sql` first (creates the table).

### "Permission denied" after applying migrations

1. Check user is team owner or active editor:
   ```sql
   SELECT role, status FROM team_members 
   WHERE team_id = 'YOUR_TEAM_ID' AND user_id = auth.uid();
   ```

2. Verify RLS policies are correct:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'resources';
   ```

### Still getting 404/406 errors

1. **Refresh schema cache via SQL**: In SQL Editor, run:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
2. **Wait 5-10 minutes** for PostgREST to pick up changes (cache refresh can take time)
3. **Use RPC functions**: The client code should use `link_resource_safe()` instead of direct inserts
4. **Alternative**: Wait for automatic refresh (can take up to 15 minutes)

---

## Next Steps After Applying Migrations

1. **Test Resource Creation**
   - Create a new resource
   - Verify it appears in the resources list

2. **Test Resource Linking**
   - Open a project
   - Go to Resources tab
   - Link an existing resource
   - Verify link appears in linked resources list

3. **Check Console for Errors**
   - Open browser DevTools
   - Look for 404/406 errors when fetching resources
   - Should be resolved after schema cache refresh

---

## Related Documentation

- `/docs/DATABASE_STRUCTURE_PLAN.md` - Complete database structure and naming conventions
- `/specs/002-mvp-redesign/data-model.md` - Data model specification
- `/supabase/migrations/` - All migration files

