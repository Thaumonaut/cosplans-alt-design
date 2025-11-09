<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import { Loader2 } from 'lucide-svelte';
  import type { ColorisConfiguration, ColorisTheme, ColorisThemeMode, ColorisFormat } from '$lib/types/coloris';
  import {
    loadColoris,
    initializeColoris,
    createColorisInstance,
    cleanupColorisInstance,
    injectColorisStyles,
    getActiveColorisElement,
    openColorisPicker,
    setColorisValue,
  } from '$lib/utils/coloris';
  import { parseColorToHex } from '$lib/utils/color-formats';

  interface ColorisWrapperProps {
    /** Current color value (hex format) */
    value?: string | null;
    /** Whether the picker is disabled */
    disabled?: boolean;
    /** Unique ID for the input element */
    id?: string;
    /** Coloris theme */
    theme?: ColorisTheme;
    /** Theme mode */
    themeMode?: ColorisThemeMode;
    /** Color format */
    format?: ColorisFormat;
    /** Enable format toggle */
    formatToggle?: boolean;
    /** Enable alpha channel */
    alpha?: boolean;
    /** Array of color swatches */
    swatches?: string[];
    /** Show clear button */
    clearButton?: boolean;
    /** Clear button label */
    clearLabel?: string;
    /** Z-index for picker popover */
    zIndex?: number;
    /** Change callback (optional if using bind:value) */
    onchange?: (value: string | null) => void;
  }

  interface ColorisWrapperEvents {
    change: string | null;
  }

  let {
    value = $bindable(),
    disabled = false,
    id,
    theme = 'default',
    themeMode = 'light',
    format = 'hex',
    formatToggle = false,
    alpha = false,
    swatches = [
      '#ff0000', // Red
      '#ff8000', // Orange
      '#ffff00', // Yellow
      '#80ff00', // Yellow-green
      '#00ff00', // Green
      '#00ff80', // Green-cyan
      '#00ffff', // Cyan
      '#0080ff', // Light blue
      '#0000ff', // Blue
      '#8000ff', // Blue-purple
      '#ff00ff', // Magenta
      '#ff0080', // Pink
      '#ffffff', // White
      '#c0c0c0', // Silver
      '#808080', // Gray
      '#000000', // Black
    ],
    clearButton = true,
    clearLabel = 'Reset',
    zIndex = 99999,
    onchange,
  }: ColorisWrapperProps = $props();

  const dispatch = createEventDispatcher<ColorisWrapperEvents>();

  // Generate stable unique ID
  let uniqueId = $state(id || `coloris-${Math.random().toString(36).substr(2, 9)}`);
  
  // Update uniqueId when id prop changes
  $effect(() => {
    if (id) {
      uniqueId = id;
    }
  });

  // Input element reference
  let inputElement = $state<HTMLInputElement | null>(null);
  
  // Track initialization state
  let isInitialized = $state(false);
  let colorisInstance = $state<any>(null);

  // Internal value state - syncs with prop but tracks user changes
  let internalValue = $state<string | null>(value ?? null);
  let isUserChanging = $state(false);

  // Sync internal value with prop changes (but not during user changes)
  $effect(() => {
    const currentValue = value ?? null;
    if (!isUserChanging && currentValue !== internalValue) {
      internalValue = currentValue;
      // Update Coloris instance if initialized
      if (isInitialized && inputElement) {
        updateColorisValue(internalValue);
      }
    }
  });

  // Initialize Coloris when element is available
  $effect(() => {
    if (!browser || disabled) {
      // Reset initialization state if disabled
      if (disabled) {
        isInitialized = false;
      }
      return;
    }

    // Wait for inputElement to be available (effect will re-run when it's set)
    if (!inputElement) {
      return;
    }

    let cleanup: (() => void) | null = null;
    let isMounted = true;

    async function setup() {
      try {
        // Inject styles
        injectColorisStyles();

        // Ensure global initialization
        const globalInitSuccess = await initializeColoris();
        if (!globalInitSuccess) {
          console.warn('[ColorisWrapper] Failed to initialize Coloris globally');
          if (isMounted) {
            isInitialized = false;
          }
          return;
        }

        // Wait for element to be fully in DOM and have correct ID
        // Use requestAnimationFrame to ensure DOM is ready
        await new Promise((resolve) => requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        }));

        if (!inputElement || !isMounted) return;

        // Double-check element is in DOM
        if (!inputElement.isConnected) {
          console.warn(`[ColorisWrapper] Element #${uniqueId} is not connected to DOM`);
          if (isMounted) {
            isInitialized = false;
          }
          return;
        }

        // Ensure element has correct ID
        if (inputElement.id !== uniqueId) {
          inputElement.id = uniqueId;
        }

        // Capture current values for the onChange callback
        const currentId = uniqueId;
        const currentOnChange = onchange;

        // Determine format - use 'rgb' or 'mixed' if alpha is enabled
        const colorisFormat = alpha ? (format === 'hex' ? 'rgb' : format) : format;
        
        // Create Coloris instance
        const instance = await createColorisInstance(`#${currentId}`, {
          theme,
          themeMode,
          format: colorisFormat,
          formatToggle,
          alpha,
          swatches,
          clearButton,
          clearLabel,
          zIndex,
          onChange: async (color: string) => {
            // Handle Coloris quirk: onChange is called for ALL instances
            // Check if this change is actually for our element
            const activeElement = await getActiveColorisElement();
            const ourElement = document.getElementById(currentId);

            if (activeElement && activeElement !== ourElement) {
              // This change is for a different instance, ignore it
              return;
            }

            // Normalize color value
            const normalizedColor = color || null;

            // Update internal state and bindable prop
            isUserChanging = true;
            internalValue = normalizedColor;
            value = normalizedColor; // Update bindable prop
            
            // Dispatch event
            dispatch('change', normalizedColor);
            
            // Call callback if provided
            if (currentOnChange) {
              currentOnChange(normalizedColor);
            }

            // Reset user changing flag after a delay
            setTimeout(() => {
              isUserChanging = false;
            }, 100);
          },
        });

        if (!isMounted) return;

        if (instance) {
          colorisInstance = instance;
          isInitialized = true;

          // Set initial value - normalize it for Coloris
          if (internalValue) {
            // Normalize the color before setting it
            const normalizedInitial = normalizeColorForColoris(internalValue, alpha);
            if (normalizedInitial && inputElement) {
              inputElement.value = normalizedInitial;
              await setColorisValue(`#${currentId}`, normalizedInitial);
            }
          }

          // Also listen to native input events as fallback
          const handleInputChange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.id === currentId && target.value !== internalValue) {
              const newColor = target.value || null;
              isUserChanging = true;
              internalValue = newColor;
              value = newColor; // Update bindable prop
              dispatch('change', newColor);
              if (currentOnChange) {
                currentOnChange(newColor);
              }
              setTimeout(() => {
                isUserChanging = false;
              }, 100);
            }
          };

          inputElement.addEventListener('input', handleInputChange);
          inputElement.addEventListener('change', handleInputChange);

          cleanup = () => {
            inputElement?.removeEventListener('input', handleInputChange);
            inputElement?.removeEventListener('change', handleInputChange);
            cleanupColorisInstance(`#${currentId}`);
            isInitialized = false;
            colorisInstance = null;
          };
        } else {
          console.warn(`[ColorisWrapper] Failed to create Coloris instance for #${currentId}`);
          isInitialized = false;
        }
      } catch (error) {
        console.error('[ColorisWrapper] Error during setup:', error);
        if (isMounted) {
          isInitialized = false;
        }
      }
    }

    setup();

    return () => {
      isMounted = false;
      if (cleanup) {
        cleanup();
      }
    };
  });

  // Re-initialize when key props change
  $effect(() => {
    if (isInitialized && inputElement) {
      // If theme, format, or other config changes, we need to re-initialize
      // This is handled by the main effect above, but we trigger it by
      // resetting the initialization state
      const needsReinit = true; // Could check specific props here
      if (needsReinit && inputElement) {
        // The main effect will handle cleanup and re-initialization
      }
    }
  });

  /**
   * Parse rgba/hsla color and extract alpha value
   */
  function parseAlphaFromColor(color: string): number | null {
    if (!color) return null;
    
    const trimmed = color.trim();
    
    // RGBA: rgba(255, 0, 0, 0.5)
    const rgbaMatch = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (rgbaMatch && rgbaMatch[4] !== undefined) {
      return parseFloat(rgbaMatch[4]);
    }
    
    // HSLA: hsla(0, 100%, 50%, 0.5)
    const hslaMatch = trimmed.match(/^hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)$/);
    if (hslaMatch && hslaMatch[4] !== undefined) {
      return parseFloat(hslaMatch[4]);
    }
    
    return null;
  }

  /**
   * Convert color to rgba format if alpha is enabled, otherwise keep as-is
   */
  function normalizeColorForColoris(color: string | null, hasAlpha: boolean): string {
    if (!color) return '';
    
    const trimmed = color.trim();
    
    // If alpha is enabled and color is rgba/hsla, keep it as rgba
    if (hasAlpha) {
      // Already rgba - Coloris can handle this directly
      if (trimmed.match(/^rgba?\(/i)) {
        return trimmed;
      }
      
      // HSLA - convert to RGBA for Coloris
      const hslaMatch = trimmed.match(/^hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)$/i);
      if (hslaMatch) {
        const h = parseInt(hslaMatch[1], 10) / 360;
        const s = parseInt(hslaMatch[2], 10) / 100;
        const l = parseInt(hslaMatch[3], 10) / 100;
        const alpha = hslaMatch[4] !== undefined ? parseFloat(hslaMatch[4]) : 1;
        
        // Convert HSL to RGB
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
        const m = l - c / 2;
        
        let r = 0, g = 0, b = 0;
        if (h * 6 < 1) {
          r = c; g = x; b = 0;
        } else if (h * 6 < 2) {
          r = x; g = c; b = 0;
        } else if (h * 6 < 3) {
          r = 0; g = c; b = x;
        } else if (h * 6 < 4) {
          r = 0; g = x; b = c;
        } else if (h * 6 < 5) {
          r = x; g = 0; b = c;
        } else {
          r = c; g = 0; b = x;
        }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      
      // Convert hex to rgba (preserve existing alpha if any)
      const hex = parseColorToHex(trimmed);
      if (hex) {
        // Check if original had alpha (shouldn't happen with hex, but check anyway)
        const existingAlpha = parseAlphaFromColor(trimmed) ?? 1;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${existingAlpha})`;
      }
    } else {
      // Alpha disabled - convert to hex
      const hex = parseColorToHex(trimmed);
      return hex || trimmed;
    }
    
    return trimmed;
  }

  // Update Coloris value programmatically
  async function updateColorisValue(color: string | null): Promise<void> {
    if (!browser || !isInitialized || !inputElement) return;

    // Normalize color for Coloris (convert to rgba if alpha enabled, hex otherwise)
    const normalizedColor = normalizeColorForColoris(color, alpha);
    
    // Update input element value with normalized color
    if (inputElement.value !== normalizedColor) {
      inputElement.value = normalizedColor;
    }

    // Update Coloris instance
    await setColorisValue(`#${uniqueId}`, normalizedColor);
  }

  // Open the color picker programmatically
  async function openPicker(): Promise<void> {
    if (disabled || !isInitialized || !inputElement) {
      return;
    }

    // Wait for initialization if not ready
    if (!isInitialized) {
      await new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 20;
        const checkInit = () => {
          attempts++;
          if (isInitialized || attempts >= maxAttempts) {
            resolve(undefined);
          } else {
            setTimeout(checkInit, 50);
          }
        };
        checkInit();
      });
    }

    if (!inputElement || !isInitialized) {
      return;
    }

    // Try to use Coloris's open method
    const opened = await openColorisPicker(`#${uniqueId}`);
    
    if (!opened) {
      // Fallback: trigger click on input
      setTimeout(() => {
        if (inputElement) {
          const originalStyle = inputElement.style.cssText;
          inputElement.style.position = 'absolute';
          inputElement.style.opacity = '0';
          inputElement.style.width = '1px';
          inputElement.style.height = '1px';
          inputElement.style.pointerEvents = 'auto';
          inputElement.style.zIndex = '99999';
          
          inputElement.focus();
          inputElement.click();
          
          setTimeout(() => {
            if (inputElement) {
              inputElement.style.cssText = originalStyle;
            }
          }, 200);
        }
      }, 10);
    }
  }

  // Expose openPicker method (can be called from parent)
  export { openPicker };
</script>

<div class="relative inline-block p-3">
  <input
    bind:this={inputElement}
    {id}
    type="text"
    data-coloris
    value={internalValue || ''}
    {disabled}
    class="sr-only"
    aria-label="Color picker"
    style="position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0;"
  />
  <button
    type="button"
    disabled={disabled || !isInitialized}
    onclick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      if (isInitialized) {
        openPicker();
      }
    }}
    onmousedown={(e) => {
      e.stopPropagation();
      e.preventDefault();
    }}
    class="relative inline-flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed {internalValue ? 'border-gray-300 dark:border-gray-600 shadow-sm' : 'border-dashed border-muted-foreground/30'}"
    style={internalValue ? `background-color: ${internalValue};` : 'background-color: transparent;'}
    aria-label={internalValue ? `Color: ${internalValue}` : !isInitialized ? 'Initializing color picker...' : 'Pick a color'}
  >
    {#if !isInitialized && !disabled}
      <!-- Loading state -->
      <Loader2 class="size-3 text-muted-foreground animate-spin" />
    {/if}
  </button>
</div>

