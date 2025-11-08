export type ThemeMode = "light" | "dark";

export interface ThemeVariantPreview {
  primary: string;
  accent: string;
  muted: string;
  background: string;
}

export interface ThemeVariant {
  id: string;
  label: string;
  description?: string;
  mode: ThemeMode;
  preview: ThemeVariantPreview;
  cssVars: Record<string, string>;
  source?: "built-in" | "custom";
}

export interface ThemeState {
  activeId: string;
  resolvedMode: ThemeMode;
  variants: ThemeVariant[];
  custom?: ThemeVariant;
}

export interface CustomThemeConfig {
  id: string;
  label: string;
  mode: ThemeMode;
  cssVars: Record<string, string>;
}
