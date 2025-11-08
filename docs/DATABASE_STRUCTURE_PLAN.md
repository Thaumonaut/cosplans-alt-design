# Database Structure & Migration Plan

**Last Updated**: 2025-11-01  
**Purpose**: Comprehensive plan for database structure, naming conventions, relationships, and migration application order

## Overview

This document defines the complete database structure, relationships, and migration strategy for the Cosplay Tracker application. All migrations must follow this plan to ensure consistency and avoid errors.

---

## Core Principles

### 1. Naming Conventions

- **Table Names**: Use `snake_case`, plural (e.g., `project_resources`, `team_members`)
- **Column Names**: Use `snake_case` (e.g., `project_id`, `resource_id`, `created_at`)
- **Foreign Keys**: Always named as `{referenced_table}_id` (e.g., `project_id`, `team_id`)
- **Join Tables**: Named as `{entity1}_{entity2}` (e.g., `project_resources`, `photoshoot_projects`)
- **RPC Functions**: Use `{action}_{entity}_safe` for schema-cache-bypassing functions (e.g., `create_resource_safe`, `link_resource_safe`)
- **Migration Files**: Format: `YYYYMMDDHHMMSS_{descriptive_name}.sql`

### 2. Relationship Patterns

#### One-to-Many (1:N)
- Entity belongs to one parent
- Foreign key in child table: `{parent}_id`
- Example: `projects.team_id` → `teams.id`

#### Many-to-Many (N:M)
- Use join table with composite unique constraint
- Join table name: `{entity1}_{entity2}`
- Columns: `{entity1}_id`, `{entity2}_id`, plus relationship metadata
- Always include `UNIQUE ({entity1}_id, {entity2}_id)` constraint
- Example: `project_resources` links `projects` ↔ `resources`

#### Polymorphic Relationships
- Use `entity_type` + `entity_id` columns
- Example: `comments.entity_type` + `comments.entity_id`

### 3. Required Fields

All tables MUST include:
- `id`: UUID PRIMARY KEY DEFAULT `uuid_generate_v4()`
- `created_at`: TIMESTAMPTZ DEFAULT `NOW()`
- `updated_at`: TIMESTAMPTZ (updated via trigger)

All team-scoped tables MUST include:
- `team_id`: UUID NOT NULL REFERENCES `teams(id) ON DELETE CASCADE`

---

## Table Structure & Relationships

### Core Tables (Foundation)

```
users (Supabase Auth managed)
├── id (UUID, PRIMARY KEY)
├── email, name, avatar_url, etc.
└── [Managed by Supabase Auth]

teams
├── id (UUID, PRIMARY KEY)
├── name (TEXT, NOT NULL)
├── type ('personal' | 'private')
├── owner_id (UUID, REFERENCES users.id) - Note: Also tracked in team_members
├── created_at, updated_at
└── [1:N to: projects, resources, tools, ideas, photoshoots]

team_members
├── id (UUID, PRIMARY KEY)
├── team_id (UUID, REFERENCES teams.id ON DELETE CASCADE)
├── user_id (UUID, REFERENCES users.id ON DELETE CASCADE)
├── role ('owner' | 'editor' | 'viewer')
├── status ('invited' | 'active' | 'inactive') - DEFAULT 'active'
├── UNIQUE (team_id, user_id)
└── [Join table: teams ↔ users]
```

### Content Tables (Team-Scoped)

```
ideas
├── id (UUID, PRIMARY KEY)
├── team_id (UUID, REFERENCES teams.id ON DELETE CASCADE)
├── character, series, description, difficulty, etc.
├── converted_project_id (UUID, REFERENCES projects.id)
└── [1:N from teams, 0..1:N to projects]

projects
├── id (UUID, PRIMARY KEY)
├── team_id (UUID, REFERENCES teams.id ON DELETE CASCADE)
├── character, series, status, progress, budget, etc.
├── from_idea_id (UUID, REFERENCES ideas.id)
└── [1:N from teams, N:M to resources via project_resources, N:M to photoshoots via photoshoot_projects]

resources
├── id (UUID, PRIMARY KEY)
├── team_id (UUID, REFERENCES teams.id ON DELETE CASCADE)
├── name, description, images, cost, tags, metadata (JSONB)
└── [1:N from teams, N:M to projects via project_resources]

tools
├── id (UUID, PRIMARY KEY)
├── team_id (UUID, REFERENCES teams.id ON DELETE CASCADE)
├── name, description, images, tags, metadata (JSONB)
└── [1:N from teams]

photoshoots
├── id (UUID, PRIMARY KEY)
├── team_id (UUID, REFERENCES teams.id ON DELETE CASCADE)
├── title, date, location, status, etc.
└── [1:N from teams, N:M to projects via photoshoot_projects, 1:N to shots, 1:N to crew_members]
```

### Join Tables (N:M Relationships)

```
project_resources
├── id (UUID, PRIMARY KEY)
├── project_id (UUID, REFERENCES projects.id ON DELETE CASCADE)
├── resource_id (UUID, REFERENCES resources.id ON DELETE CASCADE)
├── quantity (INTEGER, DEFAULT 1, CHECK > 0)
├── status ('needed' | 'acquired' | 'in-progress' | 'completed')
├── notes (TEXT)
├── added_at (TIMESTAMPTZ, DEFAULT NOW())
├── UNIQUE (project_id, resource_id)
└── [Join table: projects ↔ resources]

photoshoot_projects
├── id (UUID, PRIMARY KEY)
├── photoshoot_id (UUID, REFERENCES photoshoots.id ON DELETE CASCADE)
├── project_id (UUID, REFERENCES projects.id ON DELETE CASCADE)
├── added_at (TIMESTAMPTZ, DEFAULT NOW())
├── UNIQUE (photoshoot_id, project_id)
└── [Join table: photoshoots ↔ projects]
```

### Supporting Tables

```
tasks
├── id (UUID, PRIMARY KEY)
├── project_id (UUID, REFERENCES projects.id ON DELETE CASCADE)
├── resource_id (UUID, REFERENCES resources.id ON DELETE CASCADE, NULLABLE)
├── title, description, completed, due_date, priority, assigned_to
└── [1:N from projects, 0..1:N to resources (resource-level tasks)]

shots
├── id (UUID, PRIMARY KEY)
├── photoshoot_id (UUID, REFERENCES photoshoots.id ON DELETE CASCADE)
├── description, pose, reference_image, completed, final_photos, order_index
└── [1:N from photoshoots]

crew_members
├── id (UUID, PRIMARY KEY)
├── photoshoot_id (UUID, REFERENCES photoshoots.id ON DELETE CASCADE)
├── name, role, contact
└── [1:N from photoshoots]

comments
├── id (UUID, PRIMARY KEY)
├── user_id (UUID, REFERENCES users.id ON DELETE CASCADE)
├── entity_type ('idea' | 'project' | 'resource' | 'tool' | 'photoshoot')
├── entity_id (UUID, polymorphic reference)
├── content, created_at, updated_at
└── [Polymorphic: references multiple entity types]
```

---

## Migration Order & Dependencies

Migrations MUST be applied in this exact order to avoid dependency errors:

### Phase 1: Foundation (Must be first)
1. `20250000000000_initial_schema.sql`
   - Creates: `users` (if needed), `teams`, `team_members`
   - Enables: Basic team structure

### Phase 2: Content Tables (Independent, can be parallelized)
2. `20250000000001_ideas_table.sql` - `ideas` table
3. `20250000000002_projects_table.sql` - `projects` table
4. `20250000000003_resources_table.sql` - `resources` table
5. `20250000000004_tools_table.sql` - `tools` table
6. `20250000000005_tasks_table.sql` - `tasks` table
7. `20250000000006_photoshoots_table.sql` - `photoshoots`, `shots`, `crew_members` tables

### Phase 3: Join Tables (Requires content tables)
8. `20250000000007_join_tables.sql`
   - Creates: `project_resources`, `photoshoot_projects`
   - **CRITICAL**: This migration creates the `project_resources` table that enables resource linking

### Phase 4: Supporting Tables
9. `20250000000008_comments_table.sql` - `comments` table

### Phase 5: Utilities & Functions
10. `20250000000009_utility_functions.sql`
    - `update_updated_at_column()` trigger function
    - `calculate_project_progress()` RPC function
    - Triggers for `updated_at` on all tables

### Phase 6: RLS Policies (Requires all tables)
11. `20250000000011_fix_rls_and_refresh_schema.sql` - Base RLS policies
12. `20250000000012_optimize_rls_policies.sql` - Optimized RLS policies
13. `20251101160000_fix_resources_rls_policy.sql` - Fixed resources RLS (includes team owner access)

### Phase 7: Safe RPC Functions (Bypasses schema cache issues)
14. `20250000000016_create_resource_safe.sql` - `create_resource_safe()` function
15. `20251101150000_create_link_resource_safe.sql` - `link_resource_safe()` function

### Phase 8: Optimizations & Fixes (Can be applied anytime)
16. All other migrations (fixes, optimizations, storage buckets, etc.)

---

## Critical Join Tables

### `project_resources` (Projects ↔ Resources)

**Purpose**: Links resources to projects with project-specific metadata (quantity, status, notes)

**Columns**:
- `id`: UUID PRIMARY KEY
- `project_id`: UUID → `projects.id` (CASCADE DELETE)
- `resource_id`: UUID → `resources.id` (CASCADE DELETE)
- `quantity`: INTEGER (DEFAULT 1, CHECK > 0)
- `status`: TEXT ('needed' | 'acquired' | 'in-progress' | 'completed')
- `notes`: TEXT (project-specific notes about this resource)
- `added_at`: TIMESTAMPTZ (DEFAULT NOW())

**Constraints**:
- `UNIQUE (project_id, resource_id)` - Prevents duplicate links
- `CHECK (quantity > 0)` - Must have positive quantity
- `CHECK (status IN (...))` - Valid status values

**RLS Policy**: Users can access links if they have access to both the project AND the resource (via team membership)

**RPC Function**: `link_resource_safe()` - Bypasses schema cache issues when linking

---

## RLS Policy Pattern

All tables follow this RLS pattern:

```sql
-- SELECT: Allow if user is team member (any role) OR team owner
CREATE POLICY {table}_select ON {table}
  FOR SELECT
  USING (
    -- User is team owner (always allowed)
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    OR
    -- User is active team member
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = {table}.team_id
      AND tm.user_id = auth.uid()
      AND (tm.status = 'active' OR tm.status IS NULL)  -- Handle missing status column
    )
  );

-- INSERT/UPDATE/DELETE: Allow if user is team owner OR active editor/owner member
CREATE POLICY {table}_insert ON {table}
  FOR INSERT
  WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = {table}.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'editor')
      AND (tm.status = 'active' OR tm.status IS NULL)
    )
  );
```

**Special Cases**:
- `team_members`: Only owners can INSERT/UPDATE/DELETE
- `teams`: Only owners can UPDATE/DELETE
- `comments`: Viewers can INSERT (comment), authors can UPDATE/DELETE own comments
- `project_resources`: Requires access to both project AND resource

---

## Safe RPC Functions (Schema Cache Bypass)

Due to Supabase PostgREST schema cache issues, we use `SECURITY DEFINER` RPC functions for critical operations:

### `create_resource_safe()`
- Creates resources, bypassing RLS and schema cache
- Validates team membership before insert
- Returns created resource

### `link_resource_safe()`
- Links resources to projects, bypassing schema cache
- Validates both project and resource belong to same team
- Handles conflicts (updates quantity/status if already linked)
- Returns link record

**Always use these functions first, fall back to direct queries if function doesn't exist**

---

## Migration Application Checklist

Before applying migrations, verify:

- [ ] Supabase project is linked (`bunx supabase link`)
- [ ] All previous migrations are applied (check Supabase Dashboard → Database → Migrations)
- [ ] No schema cache refresh needed (if unsure, run `NOTIFY pgrst, 'reload schema';` in SQL Editor)
- [ ] RLS is enabled on all tables (`ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;`)

**Critical Migrations** (must be applied manually if automated fails):
1. `20250000000007_join_tables.sql` - Creates `project_resources` table
2. `20251101150000_create_link_resource_safe.sql` - Creates `link_resource_safe()` function
3. `20251101160000_fix_resources_rls_policy.sql` - Fixes resources RLS to allow team owners

---

## Troubleshooting

### "Table is not available" / 404 Errors

**Cause**: PostgREST schema cache not updated

**Solutions**:
1. **Refresh schema cache via SQL**: In SQL Editor, run:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
   Wait 1-2 minutes for cache to update (may take up to 5-10 minutes)
2. Use RPC functions (`_safe` functions) instead of direct queries
3. Wait 5-10 minutes for cache to auto-refresh

### "Column reference is ambiguous"

**Cause**: JOIN queries without table aliases

**Fix**: Always use table aliases in RPC functions:
```sql
-- BAD
SELECT id FROM resources WHERE id = ...

-- GOOD
SELECT r.id FROM resources r WHERE r.id = ...
```

### "Permission denied" / RLS Policy Errors

**Cause**: RLS policy too restrictive or team membership missing

**Fix**: 
1. Check `team_members` record exists with `status = 'active'`
2. Check user is team owner (in `teams.owner_id`)
3. Apply `20251101160000_fix_resources_rls_policy.sql` migration

---

## Quick Reference: Linking Resources to Projects

**Correct Flow**:
1. Resource exists in `resources` table (team-scoped)
2. Project exists in `projects` table (same team)
3. Create link in `project_resources` table:
   ```sql
   INSERT INTO project_resources (project_id, resource_id, quantity, status)
   VALUES ('{project_id}', '{resource_id}', 1, 'needed')
   ON CONFLICT (project_id, resource_id) DO UPDATE SET ...;
   ```
4. Use `link_resource_safe()` RPC function (recommended, bypasses schema cache)

**Client Code** (TypeScript):
```typescript
// Try RPC function first
const { data, error } = await supabase.rpc('link_resource_safe', {
  p_project_id: projectId,
  p_resource_id: resourceId,
  p_quantity: 1,
  p_status: 'needed'
});

// Fallback to direct insert if RPC doesn't exist
if (error && error.message?.includes('function')) {
  const { data, error } = await supabase
    .from('project_resources')
    .insert({ project_id: projectId, resource_id: resourceId, quantity: 1, status: 'needed' });
}
```

---

## Maintenance

- **Update this document** when adding new tables or relationships
- **Follow naming conventions** strictly
- **Test migrations** in development before applying to production
- **Document breaking changes** in migration files

---

## Related Documents

- `/specs/002-mvp-redesign/data-model.md` - Complete data model specification
- `/specs/002-mvp-redesign/plan.md` - Implementation plan
- `/APPLY_MIGRATIONS.md` - Manual migration application instructions

