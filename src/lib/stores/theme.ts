import { browser } from "$app/environment";
import { writable, get } from "svelte/store";

import type { ThemeState, ThemeVariant } from "$lib/types/theme";
import { DEFAULT_THEME_ID, THEME_VARIANTS, getThemeVariantById } from "$lib/utils/theme-variants";

const THEME_STORAGE_KEY = "cosplans:theme-id";
const CUSTOM_THEMES_STORAGE_KEY = "cosplans:custom-themes";
const MAX_CUSTOM_THEMES = 10;

function applyTheme(variant: ThemeVariant) {
  if (!browser) return;

  const root = document.documentElement;
  
  // Clear optional background properties that may not exist in new theme
  const optionalProps = [
    '--theme-background-size',
    '--theme-background-position',
    '--theme-background-repeat',
    '--theme-background-blend',
    '--theme-background-pattern-opacity'
  ];
  
  optionalProps.forEach(prop => {
    if (!(prop in variant.cssVars)) {
      root.style.removeProperty(prop);
    }
  });
  
  // Apply all theme variables
  Object.entries(variant.cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  root.dataset.theme = variant.id;
  root.dataset.themeMode = variant.mode;
}

function loadCustomThemes(): ThemeVariant[] {
  if (!browser) return [];

  const raw = localStorage.getItem(CUSTOM_THEMES_STORAGE_KEY);
  if (!raw) {
    // Migration: Check for old single custom theme
    const oldRaw = localStorage.getItem("cosplans:theme-custom");
    if (oldRaw) {
      try {
        const oldTheme = JSON.parse(oldRaw) as ThemeVariant;
        if (oldTheme && oldTheme.cssVars) {
          const migrated = { ...oldTheme, id: oldTheme.id || `custom-${Date.now()}`, source: "custom" as const };
          const themes = [migrated];
          persistCustomThemes(themes);
          localStorage.removeItem("cosplans:theme-custom");
          return themes;
        }
      } catch (error) {
        console.warn("Failed to migrate old custom theme", error);
      }
    }
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ThemeVariant[];
    if (Array.isArray(parsed)) {
      return parsed.filter(theme => theme && theme.cssVars && theme.id).map(theme => ({
        ...theme,
        source: "custom" as const
      }));
    }
  } catch (error) {
    console.warn("Failed to parse custom themes configuration", error);
  }

  return [];
}

function persistThemeId(id: string) {
  if (!browser) return;
  localStorage.setItem(THEME_STORAGE_KEY, id);
}

function persistCustomThemes(themes: ThemeVariant[]) {
  if (!browser) return;
  if (themes.length === 0) {
    localStorage.removeItem(CUSTOM_THEMES_STORAGE_KEY);
    return;
  }
  localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(themes));
}

const defaultVariant = getThemeVariantById(DEFAULT_THEME_ID) ?? THEME_VARIANTS[0];

const initialState: ThemeState = {
  activeId: defaultVariant.id,
  resolvedMode: defaultVariant.mode,
  variants: THEME_VARIANTS,
  customThemes: [],
};

function resolveVariant(id: string, customThemes: ThemeVariant[]): ThemeVariant {
  // Check if it's a custom theme ID
  const customTheme = customThemes.find(t => t.id === id);
  if (customTheme) {
    return customTheme;
  }
  // Fallback to built-in theme
  return getThemeVariantById(id) ?? defaultVariant;
}

function createThemeStore() {
  const { subscribe, update, set } = writable<ThemeState>(initialState);

  function setTheme(id: string) {
    update((state) => {
      const variant = resolveVariant(id, state.customThemes);

      applyTheme(variant);
      persistThemeId(variant.id);

      return {
        ...state,
        activeId: variant.id,
        resolvedMode: variant.mode,
      };
    });
  }

  function addCustomTheme(variant: ThemeVariant): void {
    update((state) => {
      if (state.customThemes.length >= MAX_CUSTOM_THEMES) {
        console.warn(`Maximum of ${MAX_CUSTOM_THEMES} custom themes allowed`);
        return state;
      }

      const customTheme: ThemeVariant = {
        ...variant,
        id: variant.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: "custom" as const,
      };

      const newThemes = [...state.customThemes, customTheme];
      persistCustomThemes(newThemes);

      return {
        ...state,
        customThemes: newThemes,
      };
    });
  }

  function updateCustomTheme(id: string, variant: ThemeVariant): void {
    update((state) => {
      const index = state.customThemes.findIndex(t => t.id === id);
      if (index === -1) {
        console.warn(`Custom theme with id ${id} not found`);
        return state;
      }

      const updatedTheme: ThemeVariant = {
        ...variant,
        id, // Preserve the ID
        source: "custom" as const,
      };

      const newThemes = [...state.customThemes];
      newThemes[index] = updatedTheme;
      persistCustomThemes(newThemes);

      // If this is the active theme, reapply it
      if (state.activeId === id) {
        applyTheme(updatedTheme);
      }

      return {
        ...state,
        customThemes: newThemes,
      };
    });
  }

  function deleteCustomTheme(id: string): void {
    update((state) => {
      const newThemes = state.customThemes.filter(t => t.id !== id);
      persistCustomThemes(newThemes);

      // If deleted theme was active, switch to default
      if (state.activeId === id) {
        applyTheme(defaultVariant);
        persistThemeId(DEFAULT_THEME_ID);
        return {
          ...state,
          customThemes: newThemes,
          activeId: DEFAULT_THEME_ID,
          resolvedMode: defaultVariant.mode,
        };
      }

      return {
        ...state,
        customThemes: newThemes,
      };
    });
  }

  function getCustomTheme(id: string): ThemeVariant | undefined {
    const state = get(theme);
    return state.customThemes.find(t => t.id === id);
  }

  // Legacy function for backward compatibility
  function setCustomTheme(variant: ThemeVariant | undefined) {
    if (!variant) {
      // If variant is undefined, this was used to clear custom theme
      // In new system, we just don't set it as active
      return;
    }
    // If variant has an ID and exists, update it; otherwise add it
    const existing = getCustomTheme(variant.id);
    if (existing) {
      updateCustomTheme(variant.id, variant);
      setTheme(variant.id);
    } else {
      addCustomTheme(variant);
      setTheme(variant.id);
    }
  }

  function initialize() {
    const customThemes = loadCustomThemes();
    const storedId = browser
      ? (localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID)
      : DEFAULT_THEME_ID;
    const variant = resolveVariant(storedId, customThemes);

    set({ activeId: variant.id, resolvedMode: variant.mode, variants: THEME_VARIANTS, customThemes });
    persistThemeId(variant.id);
    applyTheme(variant);
  }

  function reset() {
    persistThemeId(DEFAULT_THEME_ID);
    persistCustomThemes([]);
    set(initialState);
    applyTheme(defaultVariant);
  }

  return {
    subscribe,
    setTheme,
    setCustomTheme, // Legacy compatibility
    addCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    getCustomTheme,
    initialize,
    reset,
  };
}

export const theme = createThemeStore();

/**
 * Helper function to toggle between light and dark themes
 * Cycles between light-default and dark-default
 */
export function toggleTheme() {
  const currentState = get(theme);
  const nextThemeId = currentState.resolvedMode === 'light' ? 'dark-default' : 'light-default';
  theme.setTheme(nextThemeId);
}

/**
 * Helper function to set a specific theme
 * @param id Theme ID (e.g., 'light-default', 'dark-cozy')
 */
export function setTheme(id: string) {
  theme.setTheme(id);
}
