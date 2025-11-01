# Non-MVP Routes Backup

This folder contains routes that have been moved out of the main application to focus on MVP Core features.

## Moved Routes

### Phase 2/3 Features (Not MVP Core)
- **`marketplace/`** - Phase 3 feature for service marketplace
- **`messages/`** - Phase 2 feature for messaging system
- **`profile/`** - Phase 2 feature for portfolio/profile showcase (note: `/settings/profile` remains for user account settings)

### Resource Sub-Category Routes (Removed - Replaced by Unified `/resources`)
These individual routes have been **removed** and are now handled entirely by the unified `/resources` route which supports category filtering. All resource types can be accessed via `/resources` with category query parameters:
- **`accessories/`** - Now: `/resources?category=accessory`
- **`props/`** - Now: `/resources?category=prop`
- **`materials/`** - Now: `/resources?category=material`
- **`outfits/`** - Now: `/resources?category=costume-piece`
- **`equipment/`** - Handled via `/tools` route (tools are separate from resources)

**Note**: The unified `/resources` route provides a better UX with filtering, search, and category management all in one place.

## Restoration

To restore these routes, simply move them back to `src/routes/(auth)/` and:
1. Update `src/lib/config/preload.ts` to include them in `LAZY_ROUTES`
2. Update any navigation components that reference them
3. Update tests in `tests/e2e/navigation.spec.ts`

## Date Moved
2025-10-31

