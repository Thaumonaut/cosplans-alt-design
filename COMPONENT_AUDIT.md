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

