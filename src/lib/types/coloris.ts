/**
 * Type definitions for @melloware/coloris
 * 
 * These types are based on the Coloris API and usage patterns in the codebase.
 */

export type ColorisTheme = 'default' | 'large' | 'polaroid';
export type ColorisThemeMode = 'light' | 'dark' | 'auto';
export type ColorisFormat = 'hex' | 'rgb' | 'hsl' | 'mixed';

export interface ColorisConfiguration {
  /** CSS selector or element to attach the color picker to */
  el?: string | HTMLElement;
  /** Color picker theme */
  theme?: ColorisTheme;
  /** Theme mode (light/dark/auto) */
  themeMode?: ColorisThemeMode;
  /** Color format */
  format?: ColorisFormat;
  /** Enable format toggle */
  formatToggle?: boolean;
  /** Enable alpha channel */
  alpha?: boolean;
  /** Array of color swatches to display */
  swatches?: string[];
  /** Show clear button */
  clearButton?: boolean;
  /** Clear button label */
  clearLabel?: string;
  /** Z-index for the picker popover */
  zIndex?: number;
  /** Callback when color changes */
  onChange?: (color: string, instanceOrElement?: any) => void;
  /** Callback when color is selected */
  onSelect?: (color: string) => void;
  /** Callback when picker is opened */
  onOpen?: () => void;
  /** Callback when picker is closed */
  onClose?: () => void;
}

export interface ColorisInstance {
  /** Update the color value */
  set?: (color: string) => void;
  /** Get the current color value */
  get?: () => string;
  /** Remove the color picker instance */
  remove?: () => void;
}

export interface ColorisStatic {
  /** Initialize Coloris globally */
  init: (options?: Partial<ColorisConfiguration>) => void;
  /** Create a new Coloris instance */
  (config: ColorisConfiguration): ColorisInstance;
  /** Set color for a specific element */
  set?: (selector: string, color: string) => void;
  /** Get color from a specific element */
  get?: (selector: string) => string;
  /** Remove Coloris from a specific element */
  remove?: (selector: string) => void;
  /** Open the color picker for a specific element */
  open?: (selector: string) => void;
  /** Close any open color picker */
  close?: () => void;
  /** Update the default configuration */
  update?: (options: Partial<ColorisConfiguration>) => void;
  /** Internal reference to active element (used for onChange handling) */
  _activeEl?: HTMLElement | null;
}

declare module '@melloware/coloris' {
  const Coloris: ColorisStatic;
  export default Coloris;
}

