# Theme Variables Audit

## Date: 2025-01-XX

This document audits the current theme variable implementation, identifying all existing variables, missing variables, and inconsistencies across themes.

## Existing Variables (All Themes)

### Core Hierarchy Variablesl
- ✅ `--theme-background` - Present in all themes
- ✅ `--theme-section-bg` - Present in all themes
- ✅ `--theme-card-bg` - Present in all themes
- ✅ `--theme-card-nested` - Present in all themes
- ✅ `--theme-content-bg` - Present in all themes
- ✅ `--theme-input-bg` - Present in all themes

### Background Pattern (Optional)
- ✅ `--theme-background-pattern` - Present in all themes
- ⚠️ `--theme-background-size` - Only in `light-cool`, `dark-cosmic`
- ⚠️ `--theme-background-position` - Only in `light-cool`, `dark-cosmic`
- ⚠️ `--theme-background-repeat` - Only in `light-cool`, `dark-cosmic`
- ⚠️ `--theme-background-blend` - Only in `light-cool`, `dark-cosmic`
- ⚠️ `--theme-background-pattern-opacity` - Only in `light-cool`, `dark-cosmic`

### Text Colors
- ✅ `--theme-foreground` - Present in all themes
- ✅ `--theme-text-muted` - Present in all themes
- ❌ `--theme-text-disabled` - **MISSING** in all themes

### Interactive States
- ✅ `--theme-hover` - Present in all themes
- ✅ `--theme-active` - Present in all themes
- ✅ `--theme-focus` - Present in all themes
- ✅ `--theme-interactive-hover` - Present in all themes
- ✅ `--theme-interactive-active` - Present in all themes

### Borders
- ✅ `--theme-border` - Present in all themes
- ✅ `--theme-border-subtle` - Present in all themes
- ✅ `--theme-border-strong` - Present in all themes
- ❌ `--theme-border-focus` - **MISSING** in all themes

### Semantic Colors
- ✅ `--theme-success` - Present in all themes
- ❌ `--theme-success-bg` - **MISSING** in all themes (only in theme-builder.ts)
- ✅ `--theme-error` - Present in all themes
- ❌ `--theme-error-bg` - **MISSING** in all themes (only in theme-builder.ts)
- ✅ `--theme-warning` - Present in all themes
- ❌ `--theme-warning-bg` - **MISSING** in all themes (only in theme-builder.ts)
- ✅ `--theme-info` - Present in all themes
- ❌ `--theme-info-bg` - **MISSING** in all themes (only in theme-builder.ts)

### Overlays & Modals
- ❌ `--theme-overlay-bg` - **MISSING** in all themes
- ❌ `--theme-modal-bg` - **MISSING** in all themes

### Shadows
- ❌ `--theme-shadow-color` - **MISSING** in all themes
- ❌ `--theme-shadow-sm` - **MISSING** in all themes
- ❌ `--theme-shadow-md` - **MISSING** in all themes
- ❌ `--theme-shadow-lg` - **MISSING** in all themes

### Opacity & Blur
- ❌ `--theme-section-opacity` - **MISSING** in all themes
- ❌ `--theme-card-opacity` - **MISSING** in all themes
- ❌ `--theme-overlay-opacity` - **MISSING** in all themes
- ❌ `--theme-blur-amount` - **MISSING** in all themes

### Component-Specific Variables

#### Sidebar
- ✅ `--theme-sidebar-bg` - Present in all themes
- ✅ `--theme-sidebar-text` - Present in all themes
- ✅ `--theme-sidebar-muted` - Present in all themes
- ✅ `--theme-sidebar-accent` - Present in all themes
- ✅ `--theme-sidebar-hover` - Present in all themes
- ✅ `--theme-sidebar-active` - Present in all themes
- ✅ `--theme-sidebar-border` - Present in all themes
- ✅ `--theme-sidebar-shadow` - Present in all themes

#### Header
- ✅ `--theme-header-bg` - Present in all themes
- ✅ `--theme-header-text` - Present in all themes
- ✅ `--theme-header-muted` - Present in all themes
- ✅ `--theme-header-hover` - Present in all themes
- ✅ `--theme-header-active` - Present in all themes
- ✅ `--theme-header-shadow` - Present in all themes

#### Primary & Accent
- ✅ `--theme-primary` - Present in all themes
- ✅ `--theme-primary-hover` - Present in all themes
- ✅ `--theme-accent` - Present in all themes
- ✅ `--theme-accent-hover` - Present in all themes

#### Priority Badges
- ✅ `--theme-priority-low-bg` - Present in all themes
- ✅ `--theme-priority-low-text` - Present in all themes
- ✅ `--theme-priority-low-border` - Present in all themes
- ✅ `--theme-priority-low-dot` - Present in all themes
- ✅ `--theme-priority-medium-bg` - Present in all themes
- ✅ `--theme-priority-medium-text` - Present in all themes
- ✅ `--theme-priority-medium-border` - Present in all themes
- ✅ `--theme-priority-medium-dot` - Present in all themes
- ✅ `--theme-priority-high-bg` - Present in all themes
- ✅ `--theme-priority-high-text` - Present in all themes
- ✅ `--theme-priority-high-border` - Present in all themes
- ✅ `--theme-priority-high-dot` - Present in all themes

## Critical Issues Found

### 1. Dark Mode Hover States (CRITICAL)

**Problem**: Dark themes use bright colors (like `#22d3ee` cyan) for `--theme-hover`, which makes text unreadable when used as background.

**Affected Themes**:
- `dark-default`: `--theme-hover: '#22d3ee'` ❌
- `dark-cozy`: `--theme-hover: '#a3e635'` ❌
- `dark-cosmic`: `--theme-hover: '#5eead4'` ❌
- `dark-fantasy`: `--theme-hover: '#fbbf24'` ❌

**Fix Required**: Change to background color with opacity (e.g., `rgba(255, 255, 255, 0.1)`)

### 2. Pure Black Backgrounds (CRITICAL)

**Problem**: Dark themes use pure black or near-black backgrounds instead of neutral dark grays.

**Affected Themes**:
- `dark-default`: `--theme-background: '#09090b'` ❌ (should be `#1a1a1a` or similar)
- `dark-cosmic`: `--theme-background: '#0a0514'` ❌ (should be `#1a1a1a` or similar)
- `dark-fantasy`: `--theme-background: '#0a0806'` ❌ (should be `#1a1a1a` or similar)

**Fix Required**: Replace with neutral dark grays (`#1a1a1a` to `#2a2a2a`)

### 3. Missing Required Variables

The following variables are required by the ruleset but missing from all themes:

- `--theme-text-disabled`
- `--theme-border-focus`
- `--theme-success-bg`
- `--theme-error-bg`
- `--theme-warning-bg`
- `--theme-info-bg`
- `--theme-overlay-bg`
- `--theme-modal-bg`
- `--theme-shadow-color`
- `--theme-shadow-sm`
- `--theme-shadow-md`
- `--theme-shadow-lg`
- `--theme-section-opacity`
- `--theme-card-opacity`
- `--theme-overlay-opacity`
- `--theme-blur-amount`

### 4. Theme Builder Inconsistencies

**Problem**: `theme-builder.ts` generates variables that don't exist in built-in themes:

- `--theme-text-primary` (generated, but not in variants)
- `--theme-text-secondary` (generated, but not in variants)
- `--theme-secondary` (generated, but not in variants)
- `--theme-secondary-hover` (generated, but not in variants)
- `--theme-code-bg` (generated, but not in variants)
- `--theme-code-text` (generated, but not in variants)

**Also**: Theme builder sets `--theme-hover` and `--theme-active` to color values (shades[600], shades[700]) instead of background colors with opacity.

### 5. Inconsistent Variable Usage

**Problem**: Some themes have variables that others don't:

- `light-cool` and `dark-cosmic` have optional background pattern variables that others don't
- This is acceptable for optional variables, but should be documented

### 6. Light Mode Issues

**Problem**: `light-warm` theme has incorrect hover/active values:

- `--theme-hover: '#f97316'` - This is a bright orange color, not a background with opacity
- `--theme-active: '#ea580c'` - This is a bright orange color, not a background with opacity

**Fix Required**: Change to background colors with opacity

## Summary

### Total Variables in Use: ~50 per theme
### Missing Required Variables: 16
### Critical Issues: 2 (dark mode hover states, pure black backgrounds)
### Themes Affected by Critical Issues: 4 dark themes + 1 light theme

## Action Items

1. **Priority 1 (Critical)**:
   - Fix dark mode hover states (4 themes)
   - Replace pure black backgrounds (3 themes)
   - Fix light-warm hover/active states (1 theme)

2. **Priority 2 (Required Variables)**:
   - Add all missing required variables to all themes
   - Update theme-builder.ts to generate missing variables

3. **Priority 3 (Consistency)**:
   - Align theme-builder.ts with built-in themes
   - Document optional variables

