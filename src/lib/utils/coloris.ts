/**
 * Utility functions for Coloris color picker integration
 */

import type { ColorisStatic, ColorisConfiguration, ColorisInstance } from '$lib/types/coloris';
import { browser } from '$app/environment';

let ColorisModule: ColorisStatic | null = null;
let cssImported = false;
let globalInitialized = false;

/**
 * Dynamically import Coloris and its CSS
 * This ensures we only load it on the client side
 */
export async function loadColoris(): Promise<ColorisStatic | null> {
  if (!browser) return null;
  
  if (ColorisModule) {
    return ColorisModule;
  }

  try {
    // Import Coloris module
    const colorisModule = await import('@melloware/coloris');
    ColorisModule = colorisModule.default as ColorisStatic;

    // Import CSS only once
    if (!cssImported) {
      await import('@melloware/coloris/dist/coloris.css');
      cssImported = true;
    }

    return ColorisModule;
  } catch (error) {
    console.error('Failed to load Coloris:', error);
    return null;
  }
}

/**
 * Initialize Coloris globally (only needs to be done once)
 */
export async function initializeColoris(
  options?: Partial<ColorisConfiguration>
): Promise<boolean> {
  if (!browser || globalInitialized) {
    return globalInitialized;
  }

  const Coloris = await loadColoris();
  if (!Coloris) {
    return false;
  }

  try {
    Coloris.init(options);
    globalInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize Coloris:', error);
    return false;
  }
}

/**
 * Create a Coloris instance for a specific element
 */
export async function createColorisInstance(
  selector: string,
  config: ColorisConfiguration
): Promise<ColorisInstance | null> {
  if (!browser) {
    console.warn('[createColorisInstance] Not in browser environment');
    return null;
  }

  const Coloris = await loadColoris();
  if (!Coloris) {
    console.warn('[createColorisInstance] Failed to load Coloris module');
    return null;
  }

  // Ensure global initialization
  if (!globalInitialized) {
    const initSuccess = await initializeColoris();
    if (!initSuccess) {
      console.warn('[createColorisInstance] Failed to initialize Coloris globally');
      return null;
    }
  }

  try {
    // Check if element exists
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`[createColorisInstance] Element not found: ${selector}`);
      return null;
    }

    // Remove any existing instance first
    if (Coloris.remove && typeof Coloris.remove === 'function') {
      try {
        Coloris.remove(selector);
      } catch (e) {
        // Ignore errors if element wasn't initialized
      }
    }

    // Create new instance
    const instance = Coloris({
      ...config,
      el: selector,
    });

    // Coloris might not return an instance, but that's okay - it attaches to the element
    // Check if the element has the data-coloris attribute as a sign of success
    if (element && !(element as HTMLElement).hasAttribute('data-coloris')) {
      // Try to add the attribute manually if Coloris didn't
      (element as HTMLElement).setAttribute('data-coloris', '');
    }

    // Return a minimal instance object even if Coloris doesn't return one
    return instance || {
      set: (color: string) => {
        if (Coloris.set) {
          Coloris.set(selector, color);
        }
      },
      get: () => {
        if (Coloris.get) {
          return Coloris.get(selector) || '';
        }
        return (element as HTMLInputElement).value || '';
      },
      remove: () => {
        if (Coloris.remove) {
          Coloris.remove(selector);
        }
      }
    };
  } catch (error) {
    console.error(`[createColorisInstance] Error creating instance for ${selector}:`, error);
    return null;
  }
}

/**
 * Remove a Coloris instance from an element
 */
export async function cleanupColorisInstance(selector: string): Promise<void> {
  if (!browser) return;

  const Coloris = await loadColoris();
  if (!Coloris || !Coloris.remove) {
    return;
  }

  try {
    Coloris.remove(selector);
  } catch (error) {
    // Ignore errors during cleanup
  }
}

/**
 * Inject CSS styles to ensure Coloris popover appears above dialogs
 * This is a one-time operation that adds styles to the document head
 */
export function injectColorisStyles(): void {
  if (!browser) return;

  const styleId = 'coloris-z-index-fix';
  
  // Check if styles are already injected
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .clr-picker {
      z-index: 99999 !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Check if an element is the active Coloris picker target
 * This helps handle the quirk where onChange is called for all instances
 */
export function isActiveColorisElement(element: HTMLElement | null): boolean {
  if (!browser || !element) return false;

  // Check if there's an active picker in the DOM
  const activePicker = document.querySelector('.clr-picker') as HTMLElement | null;
  if (!activePicker) return false;

  // Try to find which input is associated with this picker
  // Coloris typically positions the picker near the input
  const allInputs = document.querySelectorAll('input[data-coloris]') as NodeListOf<HTMLInputElement>;
  let closestInput: HTMLInputElement | null = null;
  let closestDistance = Infinity;

  for (const input of allInputs) {
    if (input === element) {
      const inputRect = input.getBoundingClientRect();
      const pickerRect = activePicker.getBoundingClientRect();
      const distance =
        Math.abs(inputRect.bottom - pickerRect.top) + Math.abs(inputRect.left - pickerRect.left);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestInput = input;
      }
    }
  }

  // Consider it active if it's within 200px of the picker
  return closestInput === element && closestDistance < 200;
}

/**
 * Get the active Coloris element from Coloris's internal state
 */
export async function getActiveColorisElement(): Promise<HTMLElement | null> {
  if (!browser) return null;

  const Coloris = await loadColoris();
  if (!Coloris) return null;

  // Check Coloris's internal state
  if ((Coloris as any)._activeEl) {
    return (Coloris as any)._activeEl as HTMLElement;
  }

  // Fallback: find the closest input to the active picker
  const activePicker = document.querySelector('.clr-picker') as HTMLElement | null;
  if (!activePicker) return null;

  const allInputs = document.querySelectorAll('input[data-coloris]') as NodeListOf<HTMLInputElement>;
  let closestInput: HTMLInputElement | null = null;
  let closestDistance = Infinity;

  for (const input of allInputs) {
    const inputRect = input.getBoundingClientRect();
    const pickerRect = activePicker.getBoundingClientRect();
    const distance =
      Math.abs(inputRect.bottom - pickerRect.top) + Math.abs(inputRect.left - pickerRect.left);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestInput = input;
    }
  }

  return closestInput && closestDistance < 200 ? closestInput : null;
}

/**
 * Open the color picker for a specific element
 */
export async function openColorisPicker(selector: string): Promise<boolean> {
  if (!browser) return false;

  const Coloris = await loadColoris();
  if (!Coloris || !Coloris.open) {
    return false;
  }

  try {
    Coloris.open(selector);
    return true;
  } catch (error) {
    console.error('Failed to open Coloris picker:', error);
    return false;
  }
}

/**
 * Set the color value for a Coloris instance
 */
export async function setColorisValue(selector: string, color: string): Promise<boolean> {
  if (!browser) return false;

  const Coloris = await loadColoris();
  if (!Coloris || !Coloris.set) {
    return false;
  }

  try {
    Coloris.set(selector, color);
    return true;
  } catch (error) {
    console.error('Failed to set Coloris value:', error);
    return false;
  }
}

/**
 * Close any open Coloris picker
 */
export async function closeColorisPicker(): Promise<boolean> {
  if (!browser) return false;

  const Coloris = await loadColoris();
  if (!Coloris || !Coloris.close) {
    return false;
  }

  try {
    Coloris.close();
    return true;
  } catch (error) {
    console.error('Failed to close Coloris picker:', error);
    return false;
  }
}

