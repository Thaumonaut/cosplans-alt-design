import { lighten, darken, mix } from 'color2k';

/**
 * Theme Builder - Complete theme generation system
 * Generates professional themes with proper visual hierarchy and color theory
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  mode: 'light' | 'dark';
  customBackground?: string; // Optional custom background color (overrides generated)
  backgroundPattern?: string; // Optional SVG pattern
}

/**
 * Generate a complete shade palette (50-900) from a base color
 * Uses perceptual lightness for better visual results
 */
export function generateShades(baseColor: string, mode: 'light' | 'dark' = 'light') {
  if (mode === 'light') {
    return {
      50: lighten(baseColor, 0.48),   // Lightest
      100: lighten(baseColor, 0.42),
      200: lighten(baseColor, 0.35),
      300: lighten(baseColor, 0.25),
      400: lighten(baseColor, 0.12),
      500: baseColor,                  // Base color
      600: darken(baseColor, 0.12),
      700: darken(baseColor, 0.25),
      800: darken(baseColor, 0.35),
      900: darken(baseColor, 0.45),   // Darkest
    };
  } else {
    // Dark mode: don't go too dark - preserve some color
    return {
      50: darken(baseColor, 0.35),    // Dark but not black
      100: darken(baseColor, 0.28),
      200: darken(baseColor, 0.20),
      300: darken(baseColor, 0.12),
      400: darken(baseColor, 0.05),
      500: baseColor,
      600: lighten(baseColor, 0.10),
      700: lighten(baseColor, 0.20),
      800: lighten(baseColor, 0.35),
      900: lighten(baseColor, 0.45),
    };
  }
}

/**
 * Generate harmonious neutral grays based on the primary color
 * Mixes the primary color with gray for visual cohesion
 */
export function generateNeutrals(primaryColor: string, mode: 'light' | 'dark' = 'light') {
  const baseGray = mode === 'light' ? '#64748b' : '#94a3b8';
  const tintedGray = mix(primaryColor, baseGray, 0.85); // 85% gray, 15% primary
  
  if (mode === 'light') {
    return {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: tintedGray,
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    };
  } else {
    return {
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: tintedGray,
      600: '#94a3b8',
      700: '#cbd5e1',
      800: '#e2e8f0',
      900: '#f8fafc',
    };
  }
}

/**
 * Build complete theme CSS variables from colors
 * Implements 4-level visual hierarchy: background → sections → cards → content
 */
export function buildTheme(config: ThemeConfig): Record<string, string> {
  const { colors, mode, customBackground, backgroundPattern } = config;
  
  // Generate shades for all three main colors
  const primaryShades = generateShades(colors.primary, mode);
  const secondaryShades = generateShades(colors.secondary, mode);
  const accentShades = generateShades(colors.accent, mode);
  const neutrals = generateNeutrals(colors.primary, mode);
  
  // 4-Level Hierarchy Mapping
  const hierarchy = mode === 'light' ? {
    // Light mode: background lightest, sections slightly darker
    background: customBackground || lighten(primaryShades[50], 0.05),  // Level 1: Lightest (page)
    section: primaryShades[50],                                         // Level 2: Light tint (sections)
    card: lighten(primaryShades[50], 0.12),                             // Level 3: Very light (cards)
    content: '#ffffff',                                                 // Level 4: Pure white (inputs)
  } : {
    // Dark mode: custom background OR generated, with subtle color blending
    background: customBackground || primaryShades[50],                  // Level 1: Custom or darkest primary
    section: mix(primaryShades[100], secondaryShades[100], 0.9),        // Level 2: 90% primary, 10% secondary (subtle!)
    card: mix(primaryShades[200], secondaryShades[200], 0.85),          // Level 3: 85% primary, 15% secondary
    content: mix(primaryShades[100], accentShades[100], 0.95),          // Level 4: 95% primary, 5% accent (very subtle!)
  };
  
  return {
    // === 4-LEVEL HIERARCHY ===
    '--theme-background': hierarchy.background,
    '--theme-section-bg': hierarchy.section,
    '--theme-card-bg': hierarchy.card,
    '--theme-card-nested': hierarchy.content,
    '--theme-content-bg': hierarchy.content,
    '--theme-input-bg': hierarchy.content,
    
    // Background pattern (optional)
    ...(backgroundPattern && {
      '--theme-background-pattern': backgroundPattern,
      '--theme-background-size': 'auto',
      '--theme-background-position': '0 0',
      '--theme-background-repeat': 'no-repeat',
    }),
    
    // === TEXT COLORS ===
    '--theme-foreground': neutrals[900],
    '--theme-text-primary': neutrals[900],
    '--theme-text-secondary': neutrals[700],
    '--theme-text-muted': neutrals[500],
    
    // === BORDERS ===
    '--theme-border': primaryShades[200],
    '--theme-border-subtle': primaryShades[100],
    '--theme-border-strong': primaryShades[300],
    
    // === INTERACTIVE STATES ===
    '--theme-hover': primaryShades[600],
    '--theme-active': primaryShades[700],
    '--theme-focus': accentShades[500],
    
    // === ACCENT COLORS ===
    '--theme-primary': primaryShades[500],
    '--theme-primary-hover': primaryShades[600],
    '--theme-secondary': secondaryShades[500],
    '--theme-secondary-hover': secondaryShades[600],
    '--theme-accent': accentShades[500],
    '--theme-accent-hover': accentShades[600],
    
    // === CODE BLOCKS ===
    '--theme-code-bg': primaryShades[200],
    '--theme-code-text': neutrals[900],
    
    // === SEMANTIC COLORS (fixed for consistency) ===
    '--theme-success': '#10b981',
    '--theme-success-bg': mode === 'light' ? '#d1fae5' : '#065f46',
    '--theme-error': '#ef4444',
    '--theme-error-bg': mode === 'light' ? '#fee2e2' : '#7f1d1d',
    '--theme-warning': '#f59e0b',
    '--theme-warning-bg': mode === 'light' ? '#fef3c7' : '#78350f',
    '--theme-info': '#3b82f6',
    '--theme-info-bg': mode === 'light' ? '#dbeafe' : '#1e3a8a',
    
    // === SIDEBAR (uses neutrals for clarity) ===
    '--theme-sidebar-bg': mode === 'light' ? '#ffffff' : neutrals[50],
    '--theme-sidebar-text': neutrals[900],
    '--theme-sidebar-muted': neutrals[500],
    '--theme-sidebar-accent': primaryShades[600],
    '--theme-sidebar-hover': mode === 'light' ? neutrals[50] : neutrals[100],
    '--theme-sidebar-active': primaryShades[100],
    '--theme-sidebar-border': neutrals[200],
    '--theme-sidebar-shadow': mode === 'light'
      ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
      : '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.2)',
    
    // === HEADER ===
    '--theme-header-bg': hierarchy.section,
    '--theme-header-text': neutrals[900],
    '--theme-header-muted': neutrals[600],
    '--theme-header-hover': hierarchy.card,
    '--theme-header-active': primaryShades[200],
    '--theme-header-shadow': mode === 'light'
      ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
      : '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.2)',
  };
}

/**
 * Quick theme builder - just provide 3 colors and mode
 */
export function createTheme(
  primary: string,
  secondary: string,
  accent: string,
  mode: 'light' | 'dark' = 'light',
  backgroundPattern?: string
): Record<string, string> {
  return buildTheme({
    colors: { primary, secondary, accent },
    mode,
    backgroundPattern,
  });
}
