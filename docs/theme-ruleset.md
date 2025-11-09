# Theme System Ruleset

## Overview

This document defines the comprehensive ruleset for the theme system, including variable naming conventions, color hierarchy, interactive state rules, and guidelines for both light and dark modes.

## Variable Naming Conventions

### Pattern
All theme variables follow the pattern: `--theme-{category}-{specificity}`

### Categories

1. **Background Hierarchy**: `background`, `section-bg`, `card-bg`, `content-bg`, `input-bg`
2. **Text Colors**: `foreground`, `text-muted`, `text-disabled`
3. **Interactive States**: `hover`, `active`, `focus`, `interactive-hover`, `interactive-active`
4. **Borders**: `border`, `border-subtle`, `border-strong`, `border-focus`
5. **Semantic Colors**: `success`, `error`, `warning`, `info` (with `-bg` variants)
6. **Overlays & Modals**: `overlay-bg`, `modal-bg`
7. **Shadows**: `shadow-color`, `shadow-sm`, `shadow-md`, `shadow-lg`
8. **Opacity & Blur**: `section-opacity`, `card-opacity`, `overlay-opacity`, `blur-amount`
9. **Component-Specific**: `sidebar-*`, `header-*`, `priority-*-*`

## Color Hierarchy (4 Levels)

The theme system implements a 4-level visual hierarchy to ensure consistent depth and contrast:

1. **Level 1 - Background** (`--theme-background`): Page background (lightest in light mode, darkest in dark mode)
2. **Level 2 - Section** (`--theme-section-bg`): Section/container backgrounds
3. **Level 3 - Card** (`--theme-card-bg`): Card/panel backgrounds
4. **Level 4 - Content** (`--theme-content-bg`, `--theme-input-bg`): Input fields and content areas

### Hierarchy Rules

- Each level must be visually distinct from adjacent levels
- Light mode: Progressively lighter (background → section → card → content)
- Dark mode: Progressively lighter (background → section → card → content), but never pure black
- Minimum contrast between levels: 5% lightness difference

## Interactive State Rules

### Hover States

- **Purpose**: Subtle visual feedback on interactive elements
- **Implementation**: Background color with low opacity (10-20%)
- **Color Source**: Use background color, NOT text/primary color
- **Contrast Requirement**: Must maintain WCAG AA contrast (4.5:1) with text
- **Variables**: `--theme-hover`, `--theme-interactive-hover`

### Active States

- **Purpose**: Indicate pressed/selected state
- **Implementation**: Background color with medium opacity (20-30%)
- **Color Source**: Use background color, slightly darker than hover
- **Contrast Requirement**: Must maintain WCAG AA contrast with text
- **Variables**: `--theme-active`, `--theme-interactive-active`

### Focus States

- **Purpose**: Keyboard navigation indicator
- **Implementation**: Ring/border with primary or accent color
- **Visibility**: Must be clearly visible in all themes
- **Variables**: `--theme-focus`, `--theme-border-focus`

### Critical Rule

**NEVER use bright text colors (like cyan, yellow) as hover/active backgrounds in dark mode.** This makes text unreadable. Always use background colors with opacity.

## Dark Mode Rules

### Backgrounds

1. **Never use pure black** (`#000000` or `#09090b`)
2. **Use neutral dark grays**: `#1a1a1a` to `#2a2a2a` for base backgrounds
3. **Maintain hierarchy**: Each level should be slightly lighter than the previous
4. **Preserve color hints**: Subtle tinting with primary color is acceptable

### Hover States

1. **Use background color with opacity**: `rgba(255, 255, 255, 0.1)` or `rgba(255, 255, 255, 0.15)`
2. **Never use bright colors**: Avoid `#22d3ee`, `#a3e635`, etc. as hover backgrounds
3. **Maintain contrast**: Text must remain readable (WCAG AA minimum)

### Text Colors

1. **Primary text**: Light grays or off-white (`#fafafa`, `#e5e5e5`)
2. **Muted text**: Medium grays with opacity (`rgba(168, 162, 158, 0.8)`)
3. **Disabled text**: Lower opacity (50-60%)

### Borders

1. **Subtle borders**: Low opacity (10-30%)
2. **Use neutral colors**: Avoid bright accent colors for borders
3. **Consistent opacity**: All borders should use similar opacity levels

### Shadows

1. **Dark shadows with opacity**: `rgba(0, 0, 0, 0.3)` to `rgba(0, 0, 0, 0.5)`
2. **Never pure black**: Always include opacity
3. **Theme-aware**: Shadows should complement the theme's color palette

## Light Mode Rules

### Backgrounds

1. **Use off-white/light grays**: Avoid pure white (`#ffffff`) for backgrounds
2. **Maintain hierarchy**: Each level progressively lighter
3. **Subtle tinting**: Light tinting with primary color is acceptable

### Hover States

1. **Subtle tinted backgrounds**: Use primary color with very low opacity (5-10%)
2. **Maintain contrast**: Text must remain readable

### Text Colors

1. **Primary text**: Dark grays (`#1c1917`, `#0f172a`), not pure black
2. **Muted text**: Medium grays (`#78716c`, `#64748b`)
3. **Disabled text**: Lower opacity (50-60%)

### Borders

1. **Light borders with opacity**: `rgba(120, 113, 108, 0.2)`
2. **Consistent opacity**: All borders should use similar opacity levels

## Opacity and Glassmorphism Rules

### Opacity Thresholds

1. **Opaque (>80% opacity)**: No blur needed, content fully readable
2. **Semi-transparent (50-80% opacity)**: Add backdrop blur (4-8px) for readability
3. **Transparent (<50% opacity)**: Add stronger backdrop blur (8-12px) or increase opacity

### Consistent Opacity Values

- **Section backgrounds**: 90-100% opacity (or 85% with blur)
- **Card backgrounds**: 60-90% opacity (or 70% with blur)
- **Overlay backgrounds**: 50-80% opacity with blur
- **Hover states**: 10-20% opacity (no blur needed, subtle effect)

### Backdrop Blur Usage

1. **When to use**: When opacity < 85%
2. **Blur amounts**:
   - 4px for 70-85% opacity
   - 8px for 50-70% opacity
   - 12px for <50% opacity
3. **Always pair**: Blur with sufficient opacity to maintain readability
4. **Fallback**: Use higher opacity (85-90%) when `backdrop-filter` not supported

### Theme Variables for Opacity

- `--theme-section-opacity`: Default 0.9 (or 0.85 with blur)
- `--theme-card-opacity`: Default 0.6-0.9 (or 0.7 with blur)
- `--theme-overlay-opacity`: Default 0.5-0.8 (with blur)
- `--theme-blur-amount`: Default blur amount (4px, 8px, 12px based on opacity)

## Semantic Color Usage

### Success, Error, Warning, Info

- **Fixed colors**: These should be consistent across all themes for recognition
- **Background variants**: Each semantic color should have a `-bg` variant for backgrounds
- **Theme-aware**: Background variants should adapt to light/dark mode

### Priority Badges

- **Low**: Blue tones
- **Medium**: Amber/yellow tones
- **High**: Rose/red tones
- **Theme-aware**: Background and text colors should adapt to light/dark mode

## Required Variables

Every theme must include all of the following variables:

### Core Hierarchy
- `--theme-background`
- `--theme-section-bg`
- `--theme-card-bg`
- `--theme-card-nested`
- `--theme-content-bg`
- `--theme-input-bg`

### Text Colors
- `--theme-foreground`
- `--theme-text-muted`
- `--theme-text-disabled` (optional but recommended)

### Interactive States
- `--theme-hover`
- `--theme-active`
- `--theme-focus`
- `--theme-interactive-hover`
- `--theme-interactive-active`

### Borders
- `--theme-border`
- `--theme-border-subtle`
- `--theme-border-strong`
- `--theme-border-focus`

### Semantic Colors
- `--theme-success`, `--theme-success-bg`
- `--theme-error`, `--theme-error-bg`
- `--theme-warning`, `--theme-warning-bg`
- `--theme-info`, `--theme-info-bg`

### Overlays & Modals
- `--theme-overlay-bg`
- `--theme-modal-bg`

### Shadows
- `--theme-shadow-color`
- `--theme-shadow-sm`, `--theme-shadow-md`, `--theme-shadow-lg` (optional)

### Opacity & Blur
- `--theme-section-opacity`
- `--theme-card-opacity`
- `--theme-overlay-opacity`
- `--theme-blur-amount`

### Component-Specific
- `--theme-sidebar-*` (bg, text, muted, accent, hover, active, border, shadow)
- `--theme-header-*` (bg, text, muted, hover, active, shadow)
- `--theme-primary`, `--theme-primary-hover`
- `--theme-accent`, `--theme-accent-hover`
- `--theme-priority-*-*` (low, medium, high with bg, text, border, dot)

## Contrast Requirements

### WCAG AA Compliance

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Must meet contrast requirements in all states (default, hover, active, focus)

### Testing

- Use browser DevTools contrast checker
- Test all text/background combinations
- Verify hover and active states maintain contrast

## Best Practices

1. **No hardcoded colors**: Always use theme variables
2. **No fallback colors**: Components should rely entirely on theme system
3. **Consistent opacity**: Use similar opacity levels for similar elements
4. **Test in both modes**: Every theme must work in both light and dark modes
5. **Professional appearance**: All themes should maintain a polished, professional look
6. **Accessibility first**: Contrast and readability are non-negotiable

## Migration Guidelines

When adding new variables:

1. Add to all existing themes
2. Update theme builder to generate new variables
3. Update validation utility
4. Document in this ruleset
5. Test all themes after changes

