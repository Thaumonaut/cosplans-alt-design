# Apply Required Migrations

**For comprehensive database structure documentation, see:**
- `/docs/DATABASE_STRUCTURE_PLAN.md` - Complete database structure, naming conventions, and relationships
- `/docs/MIGRATION_APPLICATION_GUIDE.md` - Step-by-step migration application guide

---

## Quick Fix: Two Critical Migrations

You need to apply these two migrations to fix resource viewing and linking issues:

### Migration 1: Fix Resources RLS Policy
**File:** `supabase/migrations/20251101160000_fix_resources_rls_policy.sql`

This fixes the RLS policy preventing you from viewing your own resources:
- Allows team owners to access resources even if not in `team_members`
- Better handling of the `status` column (handles NULL values)

### Migration 2: Create Link Resource Safe Function
**File:** `supabase/migrations/20251101150000_create_link_resource_safe.sql`

This creates an RPC function that bypasses schema cache issues when linking resources.

---

## How to Apply (Quick Steps)

1. Go to https://supabase.com/dashboard
2. Select your project (zbotvtowbdtvfbnpwnkx)
3. Navigate to **SQL Editor**
4. **Run Migration 1 first:**
   ```bash
   cat supabase/migrations/20251101160000_fix_resources_rls_policy.sql
   ```
   Copy the entire output and paste into SQL Editor, then click "Run"

5. **Then run Migration 2:**
   ```bash
   cat supabase/migrations/20251101150000_create_link_resource_safe.sql
   ```
   Copy the entire output and paste into SQL Editor, then click "Run"

6. **Refresh Schema Cache:**
   - Still in SQL Editor, run this command:
     ```sql
     NOTIFY pgrst, 'reload schema';
     ```
   - Click "Run" - you should see "Success. No rows returned"
   - Wait 1-2 minutes for cache to update (may take up to 5-10 minutes)

7. **Test the fixes:**
   - Try creating a resource
   - Try linking it to a project
   - Check browser console for 404/406 errors (should be resolved)

---

## Detailed Instructions

See `/docs/MIGRATION_APPLICATION_GUIDE.md` for:
- Detailed step-by-step instructions
- Verification queries
- Troubleshooting guide
- Verification checklist

---

## Database Structure Reference

See `/docs/DATABASE_STRUCTURE_PLAN.md` for:
- Complete table structure and relationships
- Naming conventions
- Migration order and dependencies
- RLS policy patterns
- Safe RPC functions documentation

