# AI Reference Archive

This file consolidates archived AI-generated markdown documents previously stored at the project root. Each section retains the original filename as a heading for quick navigation.

## APPLY_MIGRATIONS.md

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



## CLOUDFLARE_PAGES_SETUP.md

# Cloudflare Pages Deployment Configuration

## Correct Build Settings

When setting up Cloudflare Pages in the dashboard, use these settings:

- **Build command**: `pnpm run build` (or `bun run build` if using bun)
- **Build output directory**: `.svelte-kit/cloudflare` ⚠️ **NOT `build`**
- **Root directory**: `/` (leave empty or use `/`)
- **Node.js version**: `22` (set via environment variable `NODE_VERSION`)

## Environment Variables

Add these in Cloudflare Pages dashboard under Settings → Environment Variables:

- `PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NODE_VERSION`: `22` (if not set globally)

## Important Notes

1. The SvelteKit Cloudflare adapter outputs to `.svelte-kit/cloudflare/`, not `build/`
2. The `wrangler.jsonc` file is primarily for Cloudflare Workers, but also documents configuration
3. For Pages, environment variables are set in the dashboard (Settings → Environment Variables)
4. For Workers, use `wrangler secret put` command to set sensitive variables

## Using Wrangler for Local Development

If you want to test locally with Wrangler:

1. **Create `.dev.vars` file** (copy from `.dev.vars.example`):
   ```bash
   cp .dev.vars.example .dev.vars
   # Edit .dev.vars with your Supabase credentials
   ```

2. **Run locally with Wrangler**:
   ```bash
   pnpm run build
   wrangler pages dev .svelte-kit/cloudflare
   ```

3. **Set secrets for production** (Workers only):
   ```bash
   wrangler secret put PUBLIC_SUPABASE_URL
   wrangler secret put PUBLIC_SUPABASE_ANON_KEY
   ```

## Troubleshooting

If deployment fails:
- Check that build output directory is `.svelte-kit/cloudflare`
- Verify Node.js version is 22 or later
- Check build logs in Cloudflare dashboard for specific errors
- Ensure all environment variables are set



## COMPONENT_AUDIT.md

# Component Audit & Refactoring Plan

## Overview
This document tracks the audit and refactoring of hard-coded components to use reusable base components throughout the app.

## Created Base Components

### DetailCard Component (`src/lib/components/base/DetailCard.svelte`)
A reusable card component that:
- Extends `ClickableCard` for consistent click handling
- Integrates with `CreationFlyout` for detail drawers
- Supports drag-and-drop, selection, and disabled states
- Can be used for photoshoots, projects, resources, tasks, and other entities

**Usage Pattern:**
```svelte
<DetailCard
  id={item.id}
  detailTitle="Item Details"
  openDetailId={selectedItemId}
  onDetailOpen={(id) => selectedItemId = id}
  onDetailClose={(id) => selectedItemId = null}
  onFullScreen={(id) => goto(`/items/${id}`)}
>
  <!-- Card content -->
</DetailCard>
```

## Components to Refactor

### Cards
- [x] `TaskCard` - ✅ Refactored to use ClickableCard
- [x] `ProjectCard` - ✅ Refactored to use ClickableCard
- [x] `ResourceCard` - ✅ Refactored to use ClickableCard
- [x] `PhotoshootCard` - ✅ Refactored to use ClickableCard
- [x] `IdeaCard` - ✅ Refactored to use ClickableCard, replaced Flowbite Button with UI Button
- [x] `ToolCard` - ✅ Refactored to use ClickableCard

### Buttons
- [x] `tasks/+page.svelte` - ✅ Replaced hard-coded buttons with Button component
- [x] `TaskBoardView.svelte` - ✅ Replaced hard-coded button with Button component

### Hard-Coded UI Patterns Found

#### Buttons
Files with hard-coded button styles:
- [x] `src/routes/(auth)/tasks/+page.svelte` - ✅ Replaced with Button component
- [x] `src/lib/components/tasks/TaskBoardView.svelte` - ✅ Replaced with Button component
- [ ] `src/lib/components/tasks/WhatToDoNow.svelte` - Still needs review
- [ ] `src/lib/components/tasks/CommentInput.svelte` - Still needs review
- [ ] `src/lib/components/photoshoots/PhotoshootDetail.svelte` - Still needs review
- [ ] `src/routes/(auth)/dashboard/+page.svelte` - Still needs review
- [ ] `src/lib/components/tasks/TaskFilterPanel.svelte` - Still needs review

**Action**: Replace with `<Button>` component from `$lib/components/ui`

#### Inputs
Files with hard-coded input styles:
- [ ] `src/lib/components/base/InlineUserSelector.svelte` - Uses inline editing pattern (may be intentional)
- [ ] `src/lib/components/base/InlineImageUpload.svelte` - Uses inline editing pattern (may be intentional)
- [ ] `src/lib/components/projects/InlineResourceLinker.svelte` - Still needs review

**Action**: Review inline editing components - they may intentionally use custom inputs for UX. Replace with `<Input>` component where appropriate.

#### Cards
- [x] All card components refactored to use `ClickableCard` ✅

## Audit Commands

To find hard-coded patterns:
```bash
# Find hard-coded buttons
grep -r 'class=".*button\|<button' src --include="*.svelte" | grep -v "Button\|@click"

# Find hard-coded inputs
grep -r 'class=".*input\|<input' src --include="*.svelte" | grep -v "Input\|type="

# Find hard-coded cards
grep -r 'class=".*card\|role="button"' src --include="*.svelte" | grep -v "Card\|ClickableCard"
```

## Refactoring Priority

1. **High Priority**: Cards that open detail drawers (TaskCard, ProjectCard, ResourceCard, PhotoshootCard)
2. **Medium Priority**: Buttons that should use Button component
3. **Low Priority**: Inputs and other form elements

## Notes

- Always check for existing components before creating new ones
- Use `$lib/components/ui` for base UI components
- Use `$lib/components/base` for reusable domain-agnostic components
- Never hard-code component styles - always use or extend existing components



## COMPONENT_PATTERNS.md

# Reusable Component Patterns

This document describes the reusable component patterns used throughout the app. Always check for existing components before creating new ones.

## Base Components

### ClickableCard (`$lib/components/ui/clickable-card.svelte`)
A reusable card component that handles click interactions properly.

**Features:**
- Prevents card click when clicking on interactive elements (buttons, inputs, dropdowns, etc.)
- Supports keyboard navigation (Enter/Space)
- Supports selection state
- Supports drag-and-drop
- Supports disabled state

**Usage:**
```svelte
<script>
  import ClickableCard from '$lib/components/ui/clickable-card.svelte'
</script>

<ClickableCard
  onclick={() => handleCardClick()}
  selected={isSelected}
  disabled={isDisabled}
  draggable={isDraggable}
  class="custom-card-styles"
>
  <!-- Card content -->
  <div class="p-4">
    <h3>Card Title</h3>
    <p>Card content</p>
  </div>
</ClickableCard>
```

### DetailCard (`$lib/components/base/DetailCard.svelte`)
Extends ClickableCard with detail drawer integration using CreationFlyout.

**Features:**
- All ClickableCard features
- Automatic detail drawer integration
- Controlled open/close state
- Full-screen navigation support

**Usage:**
```svelte
<script>
  import DetailCard from '$lib/components/base/DetailCard.svelte'
  
  let selectedItemId = $state<string | null>(null)
</script>

<DetailCard
  id={item.id}
  detailTitle="Item Details"
  openDetailId={selectedItemId}
  onDetailOpen={(id) => selectedItemId = id}
  onDetailClose={(id) => selectedItemId = null}
  onFullScreen={(id) => goto(`/items/${id}`)}
>
  {#snippet children()}
    <!-- Card content -->
    <div class="p-4">
      <h3>{item.name}</h3>
    </div>
  {/snippet}
  
  {#snippet detailContent()}
    <!-- Detail drawer content -->
    <div class="p-6">
      <h2>{item.name}</h2>
      <p>{item.description}</p>
    </div>
  {/snippet}
</DetailCard>
```

### TagSelector (`$lib/components/base/TagSelector.svelte`)
Base component for tag-style dropdowns (used by PrioritySelector, StageSelector, etc.).

**Features:**
- Uses existing DropdownMenu component
- Supports color coding
- Supports dot indicators
- Supports badges
- Customizable color functions

**Usage:**
```svelte
<script>
  import TagSelector from '$lib/components/base/TagSelector.svelte'
  
  const options = [
    {
      value: 'option1',
      label: 'Option 1',
      color: 'bg-blue-500/10 text-blue-700',
      dotColor: 'bg-blue-500',
      badge: '✓'
    }
  ]
</script>

<TagSelector
  options={options}
  currentValue={selectedValue}
  onChange={(value) => handleChange(value)}
/>
```

### PrioritySelector (`$lib/components/base/PrioritySelector.svelte`)
Tag-style dropdown for priority selection. Built on TagSelector.

**Usage:**
```svelte
<script>
  import PrioritySelector from '$lib/components/base/PrioritySelector.svelte'
</script>

<PrioritySelector
  currentPriority="high"
  editable={true}
  onPriorityChange={(priority) => handleChange(priority)}
/>
```

### StageSelector (`$lib/components/base/StageSelector.svelte`)
Tag-style dropdown for stage/status selection. Built on TagSelector.

**Usage:**
```svelte
<script>
  import StageSelector from '$lib/components/base/StageSelector.svelte'
</script>

<StageSelector
  stages={availableStages}
  currentStageId={selectedStageId}
  editable={true}
  onStageChange={(stageId) => handleChange(stageId)}
  showNextStage={true}
/>
```

## UI Components

### Button (`$lib/components/ui/button.svelte`)
Standard button component with variants and sizes.

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes:** `default`, `sm`, `lg`, `icon`, `icon-sm`, `icon-lg`

**Usage:**
```svelte
<script>
  import { Button } from '$lib/components/ui'
</script>

<Button variant="default" size="sm" onclick={handleClick}>
  Click Me
</Button>
```

### DatePicker (`$lib/components/ui/date-picker.svelte`)
Standard date picker using Flowbite Datepicker.

**Usage:**
```svelte
<script>
  import { DatePicker } from '$lib/components/ui'
  
  let dateValue = $state('')
</script>

<DatePicker
  bind:value={dateValue}
  placeholder="Select date"
  onchange={(value) => handleChange(value)}
/>
```

## Component Hierarchy

```
Base Components (Reusable, Domain-Agnostic)
├── TagSelector (base for all tag dropdowns)
│   ├── PrioritySelector
│   └── StageSelector
├── ClickableCard (base for all clickable cards)
│   └── DetailCard (extends ClickableCard with drawer)
│       └── Used by: TaskCard, ProjectCard, ResourceCard, etc.
└── UI Components
    ├── Button
    ├── DatePicker
    ├── Input
    ├── Select
    └── DropdownMenu (used by TagSelector)
```

## Best Practices

1. **Always check for existing components first**
   - Check `$lib/components/ui/` for base UI components
   - Check `$lib/components/base/` for reusable domain-agnostic components
   - Check existing domain components for patterns

2. **Never hard-code component styles**
   - Use existing components and extend them
   - Use component props for customization
   - Use `class` prop for additional styling

3. **Build reusable, extensible components**
   - Accept props for customization
   - Use snippets for flexible content
   - Support multiple use cases

4. **Use ClickableCard for all clickable cards**
   - Consistent click handling
   - Proper keyboard navigation
   - Interactive element detection

5. **Use Button component for all buttons**
   - Consistent styling and behavior
   - Proper variants and sizes
   - Accessibility built-in

6. **Use TagSelector pattern for tag-style dropdowns**
   - Consistent UX across priorities, stages, tags
   - Built on existing DropdownMenu
   - Supports color coding and indicators



## CONVERSION_PLAN.md

# React to Svelte Conversion Plan

Rebuilding everything from scratch to match `cosplay-tracker-react` exactly.

## Priority Order

### Phase 1: Core UI Components (Match React UI exactly)
1. ✅ InlineTextEditor - DONE
2. ✅ CreationFlyout - DONE  
3. ✅ CharacterCreationForm - DONE
4. ⏳ Tabs component (need to create)
5. ⏳ AppSidebar (need to rebuild)
6. ⏳ PageHeader (need to rebuild)
7. ⏳ IdeaCard - DONE

### Phase 2: Ideas Page
1. ⏳ Ideas page with exact React structure
2. ⏳ Integration with CreationFlyout

### Phase 3: All Other Pages
- Convert all app/*/page.tsx files systematically
- Match layout structure exactly

### Phase 4: All Feature Components
- Convert all components/*.tsx files
- Match styling exactly

## Notes
- Use Flowbite Svelte where possible, but match React styling exactly
- All Tailwind classes must match
- Component structure must match
- State management should use Svelte 5 runes



## IMPLEMENTATION_STATUS.md

# Implementation Status Report
**Date**: Generated automatically
**Feature**: 002-mvp-redesign
**Branch**: 002-mvp-redesign

## Overall Status

- **Total Tasks**: 186
- **Completed (Marked)**: 134 tasks
- **Completed (Unmarked)**: ~8 tasks (T143-T148, T151-T155, T159-T160, T164)
- **Actually Complete**: ~142 tasks (76%)
- **Actually Missing**: ~44 tasks (24%)

## Critical Missing Features (Priority Order)

### High Priority - Core Functionality
1. **T149-T150**: Calendar event click handler with preview modal
2. **T156-T157**: Theme toggle and persistence
3. **T158**: Notification preferences
4. **T141**: Personal team auto-creation on signup
5. **T132**: Invitation acceptance flow

### Medium Priority - Enhancements
6. **T161-T162**: Consistent loading spinners and empty states
7. **T136**: Task assignment notifications
8. **T142**: RLS policies comprehensive verification
9. **T174**: Consistent confirmation dialogs
10. **T179-T180**: Enhanced form validation

### Low Priority - Polish
11. **T163**: Error boundaries
12. **T165-T170**: Image lazy loading, keyboard shortcuts, breadcrumbs, pagination, sorting
13. **T171-T172**: Custom error pages
14. **T173**: Optimistic UI updates
15. **T175-T178**: Edge case handling
16. **T181-T186**: Network handling, accessibility audit, Flowbite customization, documentation

## Implementation Plan

### Phase 1: Critical Features (Next)
1. Calendar preview modal (T149-T150)
2. Theme toggle (T156-T157)
3. Notification preferences (T158)
4. Personal team auto-creation (T141)

### Phase 2: Core Enhancements
5. Consistent loading/empty states (T161-T162)
6. Enhanced validation (T179-T180)
7. Confirmation dialogs (T174)

### Phase 3: Polish
8. All remaining polish tasks

## Notes

- Manual tasks (T008, T020) require Supabase project access
- Some tasks marked incomplete are actually partially done (noted in tasks.md)
- MVP core (US1-US2) is complete
- Most P2 features (US3-US6) are complete
- P3 features (US7-US8) are partially complete




## PERFORMANCE_OPTIMIZATIONS.md

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



## PR_MERGE_CHECKLIST.md

# Pull Request Merge Checklist

## Branch: `002-mvp-redesign` → `main`

## Required Status Checks

Based on branch protection rules, the following status checks must pass before merging:

### ✅ Test Workflows (Must Pass)

1. **Run Unit Tests** (`test-unit.yml`)
   - Runs: `bun test:unit`
   - Status: ⚠️ **Needs to pass in CI**
   - Note: These run on all pushes, so should be passing

2. **Run Integration Tests** (`test-integration.yml`)
   - Runs: `bun test:integration`
   - Requires: `SUPABASE_TEST_URL` and `SUPABASE_TEST_KEY` secrets
   - Status: ⚠️ **Needs to pass in CI**
   - Note: Requires test environment secrets to be configured

3. **Run E2E Tests** (`test-e2e.yml`)
   - Runs: `bunx playwright test`
   - Requires: `SUPABASE_TEST_URL` and `SUPABASE_TEST_KEY` secrets
   - Environment: `cosplans-test`
   - Status: ⚠️ **Needs to pass in CI**
   - Note: Fixed Playwright config to use `bun run dev` in CI

### 📋 Additional Requirements

Based on branch protection configuration:

- [ ] **Require status checks to pass before merging** ✅ (Configured)
- [ ] **Require branches to be up to date before merging** ✅ (Configured)
- [ ] **All three test workflows must pass** ⚠️ (Check GitHub PR page)
- [ ] **Code review approval** (if required)
- [ ] **No merge conflicts** ✅ (Check locally)

## Current Status

### ✅ Completed Fixes

1. **E2E Test Configuration** ✅
   - Fixed Playwright webServer to use `bun run dev` in CI
   - Updated to run full test suite (not just smoke tests)
   - Added proper environment variable handling

2. **Cloudflare Deployment** ✅
   - Created comprehensive `wrangler.jsonc` configuration
   - Added `CLOUDFLARE_PAGES_SETUP.md` documentation
   - Documented correct build output directory: `.svelte-kit/cloudflare`

3. **Unit Tests** ✅
   - All 30 unit tests passing locally
   - Should pass in CI

### ⚠️ Items to Verify

1. **GitHub Secrets Configuration**
   - Verify `SUPABASE_TEST_URL` is set in repository secrets
   - Verify `SUPABASE_TEST_KEY` is set in repository secrets
   - Verify `cosplans-test` environment exists with proper secrets

2. **CI/CD Workflow Status**
   - Check GitHub Actions runs for the PR
   - Verify all three workflows complete successfully
   - Check for any workflow failures or errors

3. **Merge Conflicts**
   - Run: `git fetch origin main && git merge-base origin/main HEAD`
   - Check if branch is up to date with main

## How to Check Status

### 1. Check GitHub PR Page

Visit the PR page on GitHub and check:
- [ ] All required status checks are listed
- [ ] All checks show ✅ green (passing)
- [ ] No ❌ red checks (failing)
- [ ] No ⏳ pending checks

### 2. Verify Secrets Are Configured

Go to: **Repository → Settings → Secrets and variables → Actions**

Verify these secrets exist:
- ✅ `SUPABASE_TEST_URL`
- ✅ `SUPABASE_TEST_KEY`

Go to: **Repository → Settings → Environments → cosplans-test**

Verify environment exists and has:
- ✅ `SUPABASE_TEST_URL`
- ✅ `SUPABASE_TEST_KEY`

### 3. Test Locally Before Merging

```bash
# Ensure you're on the branch
git checkout 002-mvp-redesign
git pull origin 002-mvp-redesign

# Run all tests locally
pnpm test:unit
pnpm test:integration
pnpm test:e2e --project=chromium --grep="smoke"

# Check for merge conflicts
git fetch origin main
git merge-base origin/main HEAD
git diff origin/main...HEAD --name-only
```

## Common Issues & Solutions

### Issue: E2E Tests Failing in CI

**Possible Causes:**
- Missing or incorrect `SUPABASE_TEST_URL` / `SUPABASE_TEST_KEY`
- Playwright browsers not installed in CI
- Dev server not starting properly

**Solutions:**
- Verify secrets are set correctly
- Check `.github/workflows/test-e2e.yml` uses `bunx playwright install --with-deps`
- Ensure Playwright config uses `bun run dev` (already fixed)

### Issue: Integration Tests Failing

**Possible Causes:**
- Missing Supabase test secrets
- Test database not accessible
- Migration issues

**Solutions:**
- Verify `SUPABASE_TEST_URL` and `SUPABASE_TEST_KEY` secrets
- Check test database is accessible
- Run `bun run test:verify` locally

### Issue: Unit Tests Failing

**Possible Causes:**
- Test environment issues
- Dependency problems

**Solutions:**
- Run `pnpm test:unit` locally
- Check for TypeScript errors: `pnpm check`
- Verify dependencies: `pnpm install`

### Issue: "Required status checks are expected"

**Cause:** Branch protection rules expect specific check names

**Solution:** Ensure workflow job names match:
- `Run Unit Tests / test`
- `Run Integration Tests / test`  
- `Run E2E Tests / test`

## Next Steps

1. **Check GitHub PR Page** for current status of all checks
2. **Verify Secrets** are configured in GitHub repository settings
3. **Run Tests Locally** to catch issues before CI runs
4. **Review PR** - ensure all changes are approved
5. **Merge When Ready** - all checks must be ✅ green

## Deployment After Merge

After successfully merging to `main`:

1. **Cloudflare Pages will auto-deploy** (if configured)
2. **Verify deployment** at your Cloudflare Pages URL
3. **Check environment variables** are set in Cloudflare dashboard
4. **Test production deployment** to ensure everything works

---

**Last Updated:** Based on current branch state and workflow configurations



## SCHEMA_CACHE_FIX.md

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



## SUPABASE_SCHEMA_CACHE_FIX.md

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



## TESTING.md

# Quickstart: Running Tests

**Last Updated**: 2025-10-26  
**Feature**: 001-comprehensive-testing

This guide explains how to run tests locally and in CI/CD for the Cosplay Tracker application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running Tests Locally](#running-tests-locally)
4. [Test Types](#test-types)
5. [Writing Tests](#writing-tests)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Prerequisites

Before running tests, ensure you have:

- **Bun** 1.0.0+ installed ([installation guide](https://bun.sh))
- **Node.js** 18+ (for Playwright)
- **Test Supabase Project** configured (see [Environment Setup](#environment-setup))
- **Git** installed (for pre-commit hooks)

---

## Installation

### 1. Install Dependencies

```bash
# Install all dependencies including test frameworks
bun install
```

This installs:
- `playwright` - E2E testing framework
- `@playwright/test` - Playwright test runner
- `vitest` - Unit/integration testing framework
- `@testing-library/svelte` - Svelte component testing utilities
- `@faker-js/faker` - Test data generation

### 2. Install Playwright Browsers

```bash
# Download Chromium, Firefox, and WebKit browsers
bunx playwright install --with-deps
```

This downloads browser binaries needed for E2E tests (~500MB total).

### 3. Environment Setup

Create a `.env.test` file in the project root:

```bash
# .env.test
SUPABASE_TEST_URL=https://your-test-project.supabase.co
SUPABASE_TEST_KEY=your-test-anon-key
TEST_BASE_URL=http://localhost:5173
```

**Where to get these values**:
1. Create a test Supabase project at [supabase.com](https://supabase.com)
2. Copy Project URL and anon key from Settings → API
3. Run database migrations on test project: `bun run db:migrate:test`

### 4. Database Setup

Run SQL migrations on your test Supabase project to create the schema isolation functions:

```bash
# Apply test-specific migrations (schema functions)
bun run db:migrate:test
```

This creates the following database functions:
- `create_test_schema(schema_name)` - Create isolated test schema
- `clone_schema_structure(source, target)` - Copy table structure
- `drop_test_schema(schema_name)` - Cleanup test schema
- `list_test_schemas()` - List all test schemas

---

## Running Tests Locally

### Quick Commands

```bash
# Run all tests (unit + integration + E2E)
bun test

# Run unit tests only (fastest - <30s)
bun test:unit

# Run integration tests only (~2 min)
bun test:integration

# Run E2E tests only (~10 min)
bun test:e2e

# Run tests in watch mode (auto-rerun on file changes)
bun test:watch

# Run tests with coverage report
bun test:coverage

# Run specific test file
bun test tests/unit/components/Button.test.ts

# Run tests matching a pattern
bun test --grep "login"
```

### Detailed Test Commands

#### Unit Tests

```bash
# Run all unit tests
bun test:unit

# Run specific component test
bun test tests/unit/components/ui/Button.test.ts

# Run tests in watch mode (auto-rerun on changes)
bun test:unit --watch

# Run with coverage
bun test:unit --coverage

# Run with UI (browser-based test runner)
bun test:unit --ui
```

#### Integration Tests

```bash
# Run all integration tests
bun test:integration

# Run specific service tests
bun test tests/integration/services/projectService.test.ts

# Run RLS policy tests
bun test tests/integration/rls/

# Skip cleanup (for debugging)
TEST_SKIP_CLEANUP=1 bun test:integration
```

#### E2E Tests

```bash
# Run all E2E tests (all browsers)
bun test:e2e

# Run E2E tests in headed mode (see browser)
bun test:e2e --headed

# Run E2E tests in debug mode (step through)
bun test:e2e --debug

# Run specific browser only
bun test:e2e --project=chromium
bun test:e2e --project=firefox
bun test:e2e --project=webkit

# Run specific test file
bun test:e2e tests/e2e/auth/login.spec.ts

# Run with visual regression update (update baseline screenshots)
bun test:e2e --update-snapshots
```

### Test Output

#### Unit Tests (Vitest)

```
✓ tests/unit/components/Button.test.ts (4)
  ✓ Button component (4)
    ✓ renders with default props
    ✓ handles click events
    ✓ applies variant styles
    ✓ shows loading state

Test Files  1 passed (1)
Tests  4 passed (4)
Duration  234ms
```

#### E2E Tests (Playwright)

```
Running 12 tests using 4 workers

  ✓ [chromium] › auth/login.spec.ts:5:1 › user can login (2.3s)
  ✓ [firefox] › auth/login.spec.ts:5:1 › user can login (2.5s)
  ✓ [webkit] › auth/login.spec.ts:5:1 › user can login (2.8s)
  ✓ [chromium] › projects/create-project.spec.ts:8:1 › user can create project (3.1s)

12 passed (45s)
```

---

## Test Types

### 1. Unit Tests (`tests/unit/`)

**Purpose**: Test individual components, functions, and stores in isolation.

**Characteristics**:
- Fast (<30s for full suite)
- No database interaction
- No network requests
- Uses mocks for external dependencies

**Example**: Testing a Button component

```typescript
// tests/unit/components/ui/Button.test.ts
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Button from '$lib/components/ui/Button.svelte';

describe('Button component', () => {
  it('renders with text', () => {
    const { getByText } = render(Button, { props: { label: 'Click me' } });
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    let clicked = false;
    const { getByRole } = render(Button, { 
      props: { 
        label: 'Click',
        onclick: () => { clicked = true; }
      }
    });
    
    await fireEvent.click(getByRole('button'));
    expect(clicked).toBe(true);
  });
});
```

### 2. Integration Tests (`tests/integration/`)

**Purpose**: Test service layer, database interactions, and RLS policies.

**Characteristics**:
- Medium speed (~2 min for full suite)
- Real database interaction (test Supabase)
- Schema isolation per test file
- Tests data transformers and service layer

**Example**: Testing ProjectService

```typescript
// tests/integration/services/projectService.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestSchema } from '../fixtures/test-schema';
import { projectService } from '$lib/api/services/projectService';
import { createTestProject } from '../../utils/factory';

describe('ProjectService', () => {
  let context;

  beforeAll(async () => {
    context = await setupTestSchema();
  });

  afterAll(async () => {
    await context.cleanup();
  });

  it('creates a project', async () => {
    const projectData = createTestProject();
    const project = await projectService.create(projectData, context.schemaName);
    
    expect(project).toBeDefined();
    expect(project.title).toBe(projectData.title);
    expect(project.id).toBeDefined();
  });

  it('enforces RLS policies', async () => {
    // Test that user can only see their own team's projects
    const user1Project = await projectService.create(
      createTestProject({ /* team_id: context.teams[0].id */ }),
      context.schemaName
    );
    
    // Attempt to fetch with different user context
    const projects = await projectService.getAll({ userId: context.users[1].id }, context.schemaName);
    
    expect(projects).not.toContainEqual(expect.objectContaining({ id: user1Project.id }));
  });
});
```

### 3. E2E Tests (`tests/e2e/`)

**Purpose**: Test complete user journeys from UI to database.

**Characteristics**:
- Slowest (~10 min for full suite)
- Real browser interaction
- Tests entire stack (UI + API + DB)
- Multi-browser testing (Chromium, Firefox, WebKit)
- Visual regression testing

**Example**: Testing login flow

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/page-objects/LoginPage';
import { DashboardPage } from '../support/page-objects/DashboardPage';
import { FIXED_TEST_USERS } from '../fixtures/test-users';

test.describe('Authentication', () => {
  test('user can login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      FIXED_TEST_USERS.alice.email,
      FIXED_TEST_USERS.alice.password
    );
    
    // Verify redirect to dashboard
    const dashboardPage = new DashboardPage(page);
    await expect(page).toHaveURL('/dashboard');
    await expect(dashboardPage.welcomeMessage).toContainText('Welcome, Alice');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('invalid@test.com', 'wrongpassword');
    
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid credentials');
  });
});
```

---

## Writing Tests

### Unit Test Template

```typescript
// tests/unit/components/YourComponent.test.ts
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import YourComponent from '$lib/components/YourComponent.svelte';

describe('YourComponent', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(YourComponent, { 
      props: { /* your props */ } 
    });
    
    expect(getByTestId('your-element')).toBeInTheDocument();
  });
});
```

### Integration Test Template

```typescript
// tests/integration/services/yourService.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestSchema } from '../fixtures/test-schema';

describe('YourService', () => {
  let context;

  beforeAll(async () => {
    context = await setupTestSchema();
  });

  afterAll(async () => {
    await context.cleanup();
  });

  it('does something', async () => {
    // Your test here
  });
});
```

### E2E Test Template

```typescript
// tests/e2e/your-feature/your-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Your Feature', () => {
  test('does something', async ({ page }) => {
    await page.goto('/your-page');
    // Your test here
  });
});
```

### Page Object Template

```typescript
// tests/e2e/support/page-objects/YourPage.ts
import type { Page, Locator } from '@playwright/test';

export class YourPage {
  readonly page: Page;
  readonly yourElement: Locator;

  constructor(page: Page) {
    this.page = page;
    this.yourElement = page.locator('[data-testid="your-element"]');
  }

  async goto() {
    await this.page.goto('/your-page');
  }

  async yourAction() {
    await this.yourElement.click();
  }
}
```

---

## CI/CD Integration

### GitHub Actions Workflows

Tests run automatically on GitHub Actions:

#### On Every Commit (Push)

```yaml
# .github/workflows/test-unit.yml
name: Unit Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test:unit
      - run: bun test:coverage
```

**Triggered by**: Every commit to any branch  
**Duration**: ~1-2 minutes  
**Cost**: Free (GitHub Actions free tier)

#### On Pull Requests

```yaml
# .github/workflows/test-e2e.yml
name: E2E Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bunx playwright install --with-deps
      - run: bun test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

**Triggered by**: Pull requests to main/develop  
**Duration**: ~10-15 minutes  
**Cost**: Free (GitHub Actions free tier)

### Viewing Test Results

#### Locally

- **Unit tests**: Terminal output
- **Unit tests (UI)**: `bun test:unit --ui` opens browser UI at http://localhost:51204
- **E2E tests**: HTML report at `playwright-report/index.html`
- **Coverage**: HTML report at `coverage/index.html`

#### CI/CD

- **GitHub Actions**: View logs in "Actions" tab
- **Coverage**: Uploaded to Codecov (if configured)
- **E2E artifacts**: Download from Actions → Artifacts (screenshots, videos)

---

## Troubleshooting

### Common Issues

#### 1. Playwright browsers not found

**Error**: `browserType.launch: Executable doesn't exist`

**Solution**:
```bash
bunx playwright install --with-deps
```

#### 2. Test database connection fails

**Error**: `Failed to connect to Supabase`

**Solution**: Check `.env.test` file:
```bash
# Verify environment variables
cat .env.test

# Test connection manually
bun run test:connection
```

#### 3. Test schemas not cleaned up

**Error**: `schema "test_..." already exists`

**Solution**: Run manual cleanup:
```bash
bun run test:cleanup
```

This removes orphaned test schemas older than 1 hour.

#### 4. Tests timeout

**Error**: `Test timeout of 5000ms exceeded`

**Solution**: Increase timeout for slow tests:
```typescript
// For a specific test
test('slow operation', async () => {
  // Your test
}, { timeout: 10000 }); // 10 seconds

// For all tests in a file
test.setTimeout(10000);
```

#### 5. Visual regression failures

**Error**: `Screenshot comparison failed`

**Solution**: Review screenshots and update baselines if intentional:
```bash
# View diff in HTML report
open playwright-report/index.html

# Update baselines if change is intentional
bun test:e2e --update-snapshots
```

### Debug Mode

#### Unit Tests

```bash
# Run with verbose output
bun test:unit --reporter=verbose

# Run with debug logging
DEBUG=* bun test:unit
```

#### E2E Tests

```bash
# Run in headed mode (see browser)
bun test:e2e --headed

# Run in debug mode (pause at each step)
bun test:e2e --debug

# Run with Playwright Inspector
PWDEBUG=1 bun test:e2e

# Generate trace for debugging
bun test:e2e --trace on
```

### Getting Help

1. **Check logs**: Review test output for error messages
2. **Check artifacts**: View screenshots/videos in `playwright-report/`
3. **Run in debug mode**: Use `--debug` flag for step-by-step execution
4. **Check environment**: Verify `.env.test` configuration
5. **Cleanup state**: Run `bun run test:cleanup` to clear old data

---

## Best Practices

### 1. Test Naming

```typescript
// ✅ Good: Descriptive test names
test('user can create a project with valid data', async () => {});

// ❌ Bad: Vague test names
test('test1', async () => {});
```

### 2. Test Independence

```typescript
// ✅ Good: Each test is self-contained
test('creates project', async () => {
  const project = createTestProject();
  // Test uses its own data
});

// ❌ Bad: Tests depend on each other
let sharedProject;
test('creates project', async () => {
  sharedProject = createTestProject();
});
test('updates project', async () => {
  // Depends on previous test
});
```

### 3. Use Page Objects (E2E)

```typescript
// ✅ Good: Use page objects
const loginPage = new LoginPage(page);
await loginPage.login(email, password);

// ❌ Bad: Direct selectors
await page.fill('#email', email);
await page.fill('#password', password);
await page.click('button[type="submit"]');
```

### 4. Use Factories for Test Data

```typescript
// ✅ Good: Use factories
const project = createTestProject({ title: 'Custom Title' });

// ❌ Bad: Hardcoded data
const project = {
  id: 123,
  title: 'Custom Title',
  character: 'Character',
  series: 'Series',
  // ... many more fields
};
```

### 5. Clean Up Resources

```typescript
// ✅ Good: Always clean up
afterAll(async () => {
  await context.cleanup();
});

// ❌ Bad: No cleanup (leaks test data)
```

### 6. Use Meaningful Assertions

```typescript
// ✅ Good: Clear assertion
expect(project.title).toBe('Expected Title');

// ❌ Bad: Vague assertion
expect(project).toBeTruthy();
```

### 7. Test Error Cases

```typescript
// ✅ Good: Test both success and failure
test('creates project with valid data', async () => {});
test('shows error for invalid data', async () => {});

// ❌ Bad: Only test happy path
test('creates project', async () => {});
```

---

## Performance Tips

### 1. Run Tests in Parallel

Unit and integration tests run in parallel by default. Adjust worker count:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    maxWorkers: 8, // Adjust based on CPU cores
  }
});
```

### 2. Use Test Filters

Run only affected tests during development:

```bash
# Run tests for specific feature
bun test --grep "project"

# Run tests in specific directory
bun test tests/unit/components/

# Run single test file
bun test tests/unit/components/Button.test.ts
```

### 3. Skip Slow Tests During Development

```typescript
// Skip E2E tests during rapid iteration
test.skip('slow E2E test', async () => {});

// Run only specific tests
test.only('test I'm working on', async () => {});
```

### 4. Cache Dependencies in CI/CD

GitHub Actions caches are configured automatically in workflows.

---

## Next Steps

1. ✅ Read this quickstart guide
2. ✅ Set up test environment (`.env.test`)
3. ✅ Run `bun test:unit` to verify setup
4. ✅ Run `bun test:e2e --headed` to see E2E tests in action
5. ⏭️ Write your first test (see [Writing Tests](#writing-tests))
6. ⏭️ Review test coverage: `bun test:coverage`
7. ⏭️ Create a PR and watch tests run in CI/CD

---

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/docs/svelte-testing-library/intro/)
- [Project Constitution](.specify/memory/constitution.md) - Test-first development principle
- [Feature Spec](./spec.md) - Comprehensive testing requirements
- [Data Model](./data-model.md) - Test fixtures and factories
- [Test Configuration Contract](./contracts/test-config.yaml) - Configuration reference




## VALIDATION_REPORT.md

# Implementation Validation Report
**Generated**: $(date)
**Feature**: 002-mvp-redesign
**Tasks File**: specs/002-mvp-redesign/tasks.md

## Summary

- **Total Tasks**: 186
- **Marked Complete in tasks.md**: 134
- **Marked Incomplete in tasks.md**: 52
- **Actually Implemented (but not marked)**: ~15-20 tasks
- **Actually Missing**: ~32-37 tasks

## Tasks Implemented But Not Marked ✅

### User Story 7 (Calendar) - Partially Complete
- [X] T144 ✅ Calendar page EXISTS at `src/routes/(auth)/calendar/+page.svelte`
- [X] T145 ✅ Project data integration implemented (loads projects with deadlines)
- [X] T146 ✅ Photoshoot data integration implemented (loads photoshoots)
- [X] T147 ✅ Task deadlines included in calendar events
- [X] T148 ✅ Calendar view switching (month/week/list) implemented
- [ ] T149 ⚠️ Event click handler/preview modal - NEEDS VERIFICATION
- [ ] T150 ⚠️ "Open Full Page" link - NEEDS VERIFICATION  
- [X] T151 ✅ Calendar events styled with color coding by status

**Status**: Calendar is mostly complete (7/9 tasks done), needs verification for T149-T150

### User Story 8 (Settings) - Partially Complete
- [X] T152 ✅ userService EXISTS with getProfile() and updateProfile() methods
- [X] T153 ✅ Settings store EXISTS at `src/lib/stores/settings.ts`
- [X] T154 ✅ Settings page EXISTS at `src/routes/(auth)/settings/+page.svelte` (layout with navigation)
- [X] T155 ✅ Profile tab implemented with name, bio, avatar (partial - avatar upload disabled)
- [ ] T156 ❌ Theme toggle NOT implemented in Preferences tab
- [ ] T157 ❌ Theme persistence in localStorage - store exists but not applied
- [ ] T158 ❌ Notification preferences toggles NOT implemented
- [X] T159 ✅ Account tab shows email (read-only) - password change mentioned as "coming soon"
- [X] T160 ✅ Profile picture display in sidebar (Avatar component with initials)

**Status**: Settings is partially complete (6/9 tasks done), missing theme toggle and notification preferences

### Polish Tasks - Partially Complete
- [X] T164 ✅ Toast notifications implemented (`src/lib/stores/toast.ts` and `src/lib/components/ui/toast.svelte`)
- [ ] T161 ⚠️ Loading spinners - Partial (some pages have custom loading, not consistent Flowbite Spinner)
- [ ] T162 ⚠️ Empty states - Partial (some components have empty states, not all list pages)
- [ ] T163 ❌ Error boundaries - NOT implemented
- [ ] T165 ❌ Image lazy loading - NOT implemented
- [ ] T166 ❌ Keyboard shortcuts - NOT implemented
- [ ] T167 ❌ Breadcrumb navigation - NOT implemented
- [ ] T168 ❌ Search result highlighting - NOT implemented
- [ ] T169 ❌ Pagination - NOT implemented
- [ ] T170 ❌ Sorting options - NOT implemented
- [ ] T171 ❌ 404 page - NOT implemented (SvelteKit default only)
- [ ] T172 ❌ Error page - NOT implemented (SvelteKit default only)
- [ ] T173 ❌ Optimistic UI updates - NOT implemented
- [ ] T174 ❌ Confirmation dialogs - NOT consistently implemented
- [ ] T175-T178 ❌ Edge case handling - NOT fully implemented
- [ ] T179 ❌ Comprehensive form validation with Zod - Partial (basic validation exists)
- [ ] T180 ⚠️ Image size validation - NEEDS VERIFICATION (10MB limit may be enforced)
- [ ] T181 ❌ Network connectivity loss handling - NOT implemented
- [ ] T182 ⚠️ Accessibility - Partial (some ARIA labels, not comprehensive)
- [ ] T183 ❌ Flowbite customization audit - NOT done
- [ ] T184 ❌ Documentation links - NOT implemented
- [ ] T185 ❌ Comprehensive manual testing - NOT documented
- [ ] T186 ❌ Constitution compliance review - NOT done

## Tasks Actually Missing ❌

### Manual Tasks (Cannot Auto-Complete)
- [ ] T008 Link Supabase project (requires project ref)
- [ ] T020 Apply all migrations (requires Supabase connection)

### Schema/Validation Tasks
- [ ] T031 Create polymorphic field schemas (validation handled inline, could be enhanced)
- [ ] T095 Enhanced validation for category-specific required fields (basic exists, needs enhancement)

### Team Collaboration (US6)
- [ ] T132 Invitation acceptance flow (Supabase handles email, acceptance flow needed)
- [ ] T136 Task assignment notifications (realtime or email)
- [ ] T141 Personal team auto-creation on signup (needs verification)
- [ ] T142 RLS policies verification (needs comprehensive audit)

### Settings (US8) - Missing Features
- [ ] T156 Theme toggle in Preferences tab
- [ ] T157 Theme persistence and application
- [ ] T158 Notification preferences

### Calendar (US7) - Missing Features
- [ ] T143 Install calendar library (using custom implementation, may need library)
- [ ] T149 Event click handler with preview modal
- [ ] T150 "Open Full Page" link in preview

### Polish - Missing Features
- [ ] T161-T162 Consistent loading spinners and empty states
- [ ] T163 Error boundaries
- [ ] T165 Image lazy loading
- [ ] T166 Keyboard shortcuts
- [ ] T167 Breadcrumb navigation
- [ ] T168 Search result highlighting
- [ ] T169-T170 Pagination and sorting
- [ ] T171-T172 Custom 404/error pages
- [ ] T173 Optimistic UI updates
- [ ] T174 Consistent confirmation dialogs
- [ ] T175-T178 Edge case handling
- [ ] T179-T180 Enhanced validation
- [ ] T181 Network connectivity handling
- [ ] T182 Comprehensive accessibility
- [ ] T183 Flowbite customization audit
- [ ] T184 Documentation links
- [ ] T185 Manual testing documentation
- [ ] T186 Constitution compliance review

## Recommendations

1. **Update tasks.md** to mark implemented features (T144-T148, T151-T155, T159-T160, T164)
2. **Priority fixes**:
   - Complete calendar preview modal (T149-T150)
   - Add theme toggle and persistence (T156-T157)
   - Add notification preferences (T158)
   - Verify/enhance personal team auto-creation (T141)
3. **Polish phase**: Focus on critical polish tasks first (T161-T162, T171-T172, T174)

## Next Steps

1. Update tasks.md with actual completion status
2. Implement missing critical features (Settings theme, Calendar preview)
3. Complete polish tasks in priority order
4. Run comprehensive testing




## WRANGLER_SETUP.md

# Wrangler Configuration Guide

This guide explains how to use the `wrangler.jsonc` configuration file for Cloudflare Workers/Pages deployment.

## Configuration Files

- **`wrangler.jsonc`** - Main Cloudflare configuration (committed to git)
- **`.dev.vars.example`** - Template for local development variables
- **`.dev.vars`** - Your local development variables (gitignored)

## Setting Up Environment Variables

### For Cloudflare Pages (Dashboard)

1. Go to your Cloudflare Pages project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add these variables:
   - `PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
   - `PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`
   - `NODE_VERSION` = `22` (optional, for build environment)

### For Cloudflare Workers (Command Line)

Use the `wrangler secret put` command to securely store sensitive values:

```bash
# Set Supabase URL
wrangler secret put PUBLIC_SUPABASE_URL
# (wrangler will prompt you to enter the value)

# Set Supabase anonymous key
wrangler secret put PUBLIC_SUPABASE_ANON_KEY
# (wrangler will prompt you to enter the value)
```

**Note:** Secrets are encrypted and stored securely. They won't appear in your `wrangler.jsonc` file.

### For Local Development

1. **Copy the example file:**
   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. **Edit `.dev.vars` with your credentials:**
   ```bash
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Run locally:**
   ```bash
   pnpm run build
   wrangler pages dev .svelte-kit/cloudflare
   ```

## Environment-Specific Configuration

The `wrangler.jsonc` file includes environment-specific settings:

- **`production`** - Production environment settings
- **`staging`** - Staging environment settings

To deploy to a specific environment:

```bash
# Deploy to production
wrangler pages deploy .svelte-kit/cloudflare --env production

# Deploy to staging  
wrangler pages deploy .svelte-kit/cloudflare --env staging
```

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

**Note:** The `PUBLIC_` prefix is required for SvelteKit to expose these variables to the client-side code.

## Optional Configuration

### Cloudflare KV (Key-Value Storage)

If you need to use Cloudflare KV, uncomment and configure in `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  { "binding": "CACHE", "id": "your-kv-namespace-id" }
]
```

Then create the namespace:
```bash
wrangler kv:namespace create "CACHE"
```

## Verification

To verify your configuration:

```bash
# Check wrangler can parse the config
wrangler pages project list

# Validate environment variables are set (for Workers)
wrangler secret list
```

## Security Notes

1. **Never commit secrets** - `.dev.vars` is gitignored
2. **Use `wrangler secret put`** for production secrets (Workers)
3. **Use Cloudflare Dashboard** for Pages environment variables
4. **Rotate keys regularly** - Update secrets if compromised

## Troubleshooting

### "Missing environment variable" error

- Ensure variables are set in Cloudflare Dashboard (Pages) or via `wrangler secret put` (Workers)
- For local development, verify `.dev.vars` exists and contains required variables
- Restart your dev server after adding/changing environment variables

### Wrangler can't find the config

- Ensure `wrangler.jsonc` is in the project root
- Verify the JSONC syntax is correct (comments are allowed)

### Build output not found

- Run `pnpm run build` first to generate `.svelte-kit/cloudflare/`
- Verify build output directory is `.svelte-kit/cloudflare` (not `build`)



