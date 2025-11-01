import { browser } from "$app/environment";
import { writable } from "svelte/store";

import type { ThemeState, ThemeVariant } from "$lib/types/theme";
import { DEFAULT_THEME_ID, THEME_VARIANTS, getThemeVariantById } from "$lib/utils/theme-variants";

const THEME_STORAGE_KEY = "cosplans:theme-id";
const CUSTOM_THEME_STORAGE_KEY = "cosplans:theme-custom";

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

function loadCustomTheme(): ThemeVariant | undefined {
  if (!browser) return undefined;

  const raw = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as ThemeVariant;
    if (parsed && parsed.cssVars) {
      return { ...parsed, source: "custom" };
    }
  } catch (error) {
    console.warn("Failed to parse custom theme configuration", error);
  }

  return undefined;
}

function persistThemeId(id: string) {
  if (!browser) return;
  localStorage.setItem(THEME_STORAGE_KEY, id);
}

function persistCustomTheme(variant?: ThemeVariant) {
  if (!browser) return;
  if (!variant) {
    localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
    return;
  }
  localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(variant));
}

const defaultVariant = getThemeVariantById(DEFAULT_THEME_ID) ?? THEME_VARIANTS[0];

const initialState: ThemeState = {
  activeId: defaultVariant.id,
  resolvedMode: defaultVariant.mode,
  variants: THEME_VARIANTS,
  custom: undefined,
};

function resolveVariant(id: string, custom?: ThemeVariant): ThemeVariant {
  if (id === "custom" && custom) {
    return custom;
  }
  return getThemeVariantById(id) ?? custom ?? defaultVariant;
}

function createThemeStore() {
  const { subscribe, update, set } = writable<ThemeState>(initialState);

  function setTheme(id: string) {
    update((state) => {
      const variant = resolveVariant(id, state.custom);
      const effectiveId = variant.source === "custom" ? "custom" : variant.id;

      applyTheme(variant);
      persistThemeId(effectiveId);

      return {
        ...state,
        activeId: effectiveId,
        resolvedMode: variant.mode,
      };
    });
  }

  function setCustomTheme(variant: ThemeVariant | undefined) {
    update((state) => {
      const nextCustom = variant
        ? { ...variant, id: "custom", source: "custom" as const }
        : undefined;

      persistCustomTheme(nextCustom);

      const targetId = nextCustom ? "custom" : state.activeId;
      const resolvedVariant = resolveVariant(targetId, nextCustom);
      const activeId = resolvedVariant.source === "custom" ? "custom" : resolvedVariant.id;

      applyTheme(resolvedVariant);
      persistThemeId(activeId);

      return {
        ...state,
        custom: nextCustom,
        activeId,
        resolvedMode: resolvedVariant.mode,
      };
    });
  }

  function initialize() {
    const custom = loadCustomTheme();
    const storedId = browser
      ? (localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID)
      : DEFAULT_THEME_ID;
    const variant = resolveVariant(storedId, custom);
    const activeId = variant.source === "custom" ? "custom" : variant.id;

    set({ activeId, resolvedMode: variant.mode, variants: THEME_VARIANTS, custom });
    persistThemeId(activeId);
    applyTheme(variant);
  }

  function reset() {
    persistThemeId(DEFAULT_THEME_ID);
    persistCustomTheme(undefined);
    set(initialState);
    applyTheme(defaultVariant);
  }

  return {
    subscribe,
    setTheme,
    setCustomTheme,
    initialize,
    reset,
  };
}

export const theme = createThemeStore();
