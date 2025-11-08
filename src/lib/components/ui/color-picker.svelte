<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { browser } from '$app/environment'
  
  interface Props {
    value?: string | null
    disabled?: boolean
    id?: string
    onchange?: (detail: string | null) => void
    dataStageId?: string // Optional: store stage ID for debugging/fixing closure issues
  }

  let { value = null, disabled = false, id, onchange, dataStageId }: Props = $props()
  
  const dispatch = createEventDispatcher<{ change: string | null }>()
  
  let inputElement = $state<HTMLInputElement | null>(null)
  let _generatedId = $state<string | null>(null)
  // Generate stable ID if not provided, update when id prop changes
  let uniqueId = $state(id || `color-picker-${Math.random().toString(36).substr(2, 9)}`)
  
  // Update uniqueId when id prop changes
  $effect(() => {
    if (id) {
      uniqueId = id
    }
  })
  
  let isInitialized = $state(false)
  let Coloris: any = null
  
  // Internal state for the color value - initialize from prop
  let internalValue = $state<string | null>(value)
  
  // Sync internal value with prop changes, but only if it's different and we're not in the middle of a user change
  let isUserChanging = $state(false)
  let lastUserValue = $state<string | null>(null)
  
  // Store the onchange callback that was captured during Coloris initialization
  // This ensures we always use the correct callback for this specific ColorPicker instance
  let capturedOnChangeCallback = $state<((detail: string | null) => void) | undefined>(undefined)
  
  $effect(() => {
    // Only sync if:
    // 1. We're not in the middle of a user change
    // 2. The prop value actually changed
    // 3. The new prop value is different from what the user just set (to avoid overwriting user changes)
    if (!isUserChanging && value !== internalValue) {
      // If the user just set a value and the prop is reverting to an old value, ignore it
      // if (lastUserValue !== null && value === lastUserValue) {
      internalValue = value
      lastUserValue = null // Clear the flag after syncing
    }
  })
  
  function handleChange(newValue: string | null) {
    const color = newValue || null
    const previousValue = internalValue
    isUserChanging = true
    lastUserValue = color // Remember what the user set
    internalValue = color
    dispatch('change', color)
    
    // CRITICAL: Use the captured callback from initialization, not the current prop
    // This ensures we use the correct handler for this specific ColorPicker instance
    const callbackToUse = capturedOnChangeCallback || onchange
    
    if (callbackToUse) {
      callbackToUse(color)
    }
    
    // Reset flag after a delay, but only if prop matches what we set
    // This prevents stale prop updates from overwriting user changes
    setTimeout(() => {
      if (value === color) {
        // Prop matches what user set - update is complete
        isUserChanging = false
        lastUserValue = null
      } else if (value === previousValue && color !== previousValue) {
        // Prop reverted to old value - this is a stale update, block it
        // Keep blocking for longer to prevent stale updates
        setTimeout(() => {
          isUserChanging = false
          lastUserValue = null
        }, 1000)
      } else {
        // Prop doesn't match but it's not a revert - might be a different update
        // Allow syncing after a delay
        setTimeout(() => {
          isUserChanging = false
          lastUserValue = null
        }, 500)
      }
    }, 300)
  }
  
  async function openPicker() {
    if (disabled || !inputElement) {
      return
    }
    
    // Wait for initialization if not ready
    if (!isInitialized) {
      await new Promise(resolve => {
        let attempts = 0
        const maxAttempts = 20 // 1 second max wait
        const checkInit = () => {
          attempts++
          if (isInitialized || attempts >= maxAttempts) {
            resolve(undefined)
          } else {
            setTimeout(checkInit, 50)
          }
        }
        checkInit()
      })
    }
    
    if (!inputElement || !isInitialized) {
      return
    }
    
    // Use Coloris's open method if available, otherwise trigger click
    if (Coloris && typeof (Coloris as any).open === 'function') {
      try {
        ;(Coloris as any).open(`#${uniqueId}`)
        return
      } catch (e) {
        // Fallback to click if open fails
      }
    }
    
    // Fallback: trigger click on the input
    setTimeout(() => {
      if (inputElement) {
        // Make input temporarily accessible for click
        const originalStyle = inputElement.style.cssText
        inputElement.style.position = 'absolute'
        inputElement.style.opacity = '0'
        inputElement.style.width = '1px'
        inputElement.style.height = '1px'
        inputElement.style.pointerEvents = 'auto'
        inputElement.style.zIndex = '99999'
        
        // Focus and click
        inputElement.focus()
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        })
        inputElement.dispatchEvent(clickEvent)
        
        // Also try direct click
        inputElement.click()
        
        // Restore original style
        setTimeout(() => {
          if (inputElement) {
            inputElement.style.cssText = originalStyle
          }
        }, 200)
      }
    }, 10)
  }
  
  onMount(async () => {
    if (!browser) return
    
    // Wait for input element to be available
    const checkInput = () => {
      if (!inputElement) {
        setTimeout(checkInput, 10)
        return
      }
      initializeColoris()
      
      // CRITICAL: Also listen to the native input event as a fallback
      // This ensures we catch changes even if Coloris onChange doesn't work correctly
      // Capture the current uniqueId and dataStageId at this point
      const currentInputId = uniqueId
      const currentStageId = dataStageId
      
      const handleInputChange = (e: Event) => {
        const target = e.target as HTMLInputElement
        if (target.id === currentInputId && target.value !== internalValue) {
          const newColor = target.value || null
          
          // Update internal state
          isUserChanging = true
          lastUserValue = newColor
          internalValue = newColor
          dispatch('change', newColor)
          
          // Call the captured callback if available
          if (capturedOnChangeCallback) {
            capturedOnChangeCallback(newColor)
          } else if (onchange) {
            onchange(newColor)
          }
          
          // Reset flag after delay
          setTimeout(() => {
            isUserChanging = false
            lastUserValue = null
          }, 300)
        }
      }
      
      if (inputElement) {
        inputElement.addEventListener('input', handleInputChange)
        inputElement.addEventListener('change', handleInputChange)
        
        // Store cleanup function
        ;(inputElement as any).__colorPickerCleanup = () => {
          inputElement?.removeEventListener('input', handleInputChange)
          inputElement?.removeEventListener('change', handleInputChange)
        }
      }
    }
    
    checkInput()
  })
  
  onDestroy(() => {
    // Clean up Coloris instance when component is destroyed
    if (browser && Coloris && inputElement && typeof (Coloris as any).remove === 'function') {
      try {
        ;(Coloris as any).remove(`#${uniqueId}`)
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
  })
  
  async function initializeColoris() {
    if (!inputElement) return
    
    try {
      // Dynamically import Coloris only on the client side
      const colorisModule = await import('@melloware/coloris')
      Coloris = colorisModule.default
      
      // Import CSS
      await import('@melloware/coloris/dist/coloris.css')
      
      // Check if inputElement still exists after async operations
      // (it might have been destroyed during column drag)
      if (!inputElement) {
        return
      }
      
      // Initialize Coloris globally if not already done
      if (!(window as any).__colorisInitialized) {
        Coloris.init()
        ;(window as any).__colorisInitialized = true
      }
      
      // Configure Coloris for this specific input
      // Use a unique selector to avoid conflicts
      const currentId = uniqueId
      const selector = `#${currentId}`
      
      // Ensure the input element has the correct ID
      if (inputElement && inputElement.id !== currentId) {
        inputElement.id = currentId
      }
      
      // Remove any existing Coloris instance for this element
      if (Coloris && typeof (Coloris as any).remove === 'function') {
        try {
          ;(Coloris as any).remove(selector)
        } catch (e) {
          // Ignore errors if element wasn't initialized
        }
      }
      
      // Store a reference to update the onChange callback when it changes
      let colorisInstance: any = null
      
      // CRITICAL: Capture dataStageId and onchange at initialization time
      // This prevents all ColorPicker instances from using the same stage ID
      const capturedStageId = dataStageId
      const capturedInputId = currentId
      const capturedOnChange = onchange
      
      // Store the captured callback so handleChange can use it
      capturedOnChangeCallback = capturedOnChange
      
      colorisInstance = Coloris({
        el: selector,
        theme: 'default',
        themeMode: 'light',
        format: 'hex',
        formatToggle: false,
        alpha: false,
        swatches: [
          '#000000',
          '#ffffff',
          '#8b5cf6',
          '#3b82f6',
          '#ef4444',
          '#f59e0b',
          '#eab308',
          '#22c55e',
          '#06b6d4',
          '#6366f1',
          '#ec4899',
          '#78716c',
        ],
        onChange: (color: string, instanceOrElement?: any) => {
          // CRITICAL: Coloris calls onChange for ALL instances when ANY picker changes
          // We can't rely on input.value because Coloris updates it AFTER calling onChange
          // Instead, we'll use a different approach: ignore Coloris onChange and use input event
          // But for now, let's try to find which element Coloris is actually targeting
          
          const ourInputElement = document.getElementById(capturedInputId) as HTMLInputElement | null
          if (!ourInputElement) {
            return
          }
          
          // Check if Coloris has a reference to the active element
          // Coloris might store this in a global variable or on the instance
          const normalizedColor = color || null
          const previousValue = internalValue
          
          // Try to get the active element from Coloris's internal state
          let activeElement: HTMLElement | null = null
          if (Coloris && (Coloris as any)._activeEl) {
            activeElement = (Coloris as any)._activeEl
          }
          
          // Also check if there's an active picker in the DOM
          const activePicker = document.querySelector('.clr-picker') as HTMLElement | null
          if (activePicker && !activeElement) {
            // Try to find which input is associated with this picker
            // Coloris typically positions the picker near the input
            const allInputs = document.querySelectorAll('input[data-coloris]') as NodeListOf<HTMLInputElement>
            let closestInput: HTMLInputElement | null = null
            let closestDistance = Infinity
            
            for (const input of allInputs) {
              const inputRect = input.getBoundingClientRect()
              const pickerRect = activePicker.getBoundingClientRect()
              const distance = Math.abs(inputRect.bottom - pickerRect.top) + Math.abs(inputRect.left - pickerRect.left)
              if (distance < closestDistance) {
                closestDistance = distance
                closestInput = input
              }
            }
            
            if (closestInput && closestDistance < 200) { // Within 200px
              activeElement = closestInput
            }
          }
          
          const isOurElement = activeElement?.id === capturedInputId
          
          // CRITICAL: Only process if the active element is OUR input
          if (activeElement && !isOurElement) {
            return // Don't process this change - it's for a different instance
          }
          
          // If we couldn't determine the active element, we need another strategy
          // For now, we'll ignore ALL onChange calls and rely on the input's native change event instead
          if (!activeElement) {
            return // Don't process - we'll handle it via the input event listener
          }
          
          // CRITICAL: Call the captured callback directly, not handleChange
          // This ensures we use the exact handler that was bound to this specific ColorPicker instance
          if (capturedOnChange) {
            // Update internal state and user change tracking
            isUserChanging = true
            lastUserValue = normalizedColor
            internalValue = normalizedColor
            dispatch('change', normalizedColor)
            
            // Call the captured callback
            capturedOnChange(normalizedColor)
            
            // Reset user changing flag after a delay
            setTimeout(() => {
              if (value === normalizedColor) {
                isUserChanging = false
                lastUserValue = null
              } else {
                setTimeout(() => {
                  isUserChanging = false
                  lastUserValue = null
                }, 500)
              }
            }, 300)
          } else {
            // Fallback to handleChange if no captured callback
            handleChange(normalizedColor)
          }
        },
        clearButton: true,
        clearLabel: 'Reset',
        // Ensure Coloris popover appears above dialogs
        zIndex: 99999,
      })
      
      // Store instance for potential updates (only if element exists)
      if (inputElement) {
        ;(inputElement as any).__colorisInstance = colorisInstance
      }
      
      // Add custom CSS to ensure Coloris popover appears above dialogs
      if (typeof window !== 'undefined') {
        const style = document.createElement('style')
        style.id = 'coloris-z-index-fix'
        style.textContent = `
          .clr-picker {
            z-index: 99999 !important;
          }
        `
        if (!document.getElementById('coloris-z-index-fix')) {
          document.head.appendChild(style)
        }
      }
      
      isInitialized = true
      
      // Set initial value (check inputElement is still available)
      if (value && inputElement) {
        inputElement.value = value
      }
    } catch (error) {
      console.error('Failed to initialize Coloris:', error)
    }
  }
  
  // Update value when prop changes
  $effect(() => {
    if (inputElement && isInitialized && internalValue !== inputElement.value) {
      inputElement.value = internalValue || ''
      // Also update Coloris if it's initialized
      if (Coloris && typeof (Coloris as any).set !== 'undefined') {
        try {
          ;(Coloris as any).set(`#${uniqueId}`, internalValue || '')
        } catch (e) {
          // Ignore errors
        }
      }
    }
  })
  
  // Track previous onchange to detect changes
  let previousOnChange = $state(onchange)
  
  // Update onChange callback when it changes (to avoid stale closures)
  $effect(() => {
    if (inputElement && isInitialized && previousOnChange !== onchange) {
      previousOnChange = onchange
      // Re-initialize Coloris to update the onChange callback
      // Only do this if we're actually initialized to avoid loops
      if (isInitialized && inputElement && (inputElement as any).__colorisInstance) {
        const wasInitialized = isInitialized
        isInitialized = false
        // Remove old instance
        if (Coloris && typeof (Coloris as any).remove === 'function') {
          try {
            ;(Coloris as any).remove(`#${uniqueId}`)
          } catch (e) {
            // Ignore errors
          }
        }
        // Clear the stored instance
        if (inputElement) {
          delete (inputElement as any).__colorisInstance
        }
        // Re-initialize with new callback
        setTimeout(() => {
          if (inputElement && wasInitialized) {
            initializeColoris()
          }
        }, 0)
      }
    }
  })
  
  // Re-initialize if id changes
  $effect(() => {
    if (id && inputElement && isInitialized && inputElement.id !== id) {
      // ID changed, need to reinitialize
      isInitialized = false
      if (inputElement) {
        initializeColoris()
      }
    }
  })
</script>

<div class="relative inline-block">
  <input
    bind:this={inputElement}
    id={uniqueId}
    type="text"
    data-coloris
    data-stage-id={dataStageId}
    value={internalValue || ''}
    disabled={disabled}
    class="sr-only"
    aria-label="Color picker"
    style="position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0;"
  />
  <button
    type="button"
    disabled={disabled || !isInitialized}
    onclick={(e) => {
      e.stopPropagation()
      e.preventDefault()
      if (isInitialized) {
        openPicker()
      }
    }}
    onmousedown={(e) => {
      // Prevent drag events from interfering
      e.stopPropagation()
      e.preventDefault()
    }}
    class="relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-background transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
    style={internalValue ? `background-color: ${internalValue}; border-color: ${internalValue};` : ''}
    aria-label={internalValue ? `Color: ${internalValue}` : 'Pick a color'}
  >
    {#if !internalValue}
      <div class="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/30"></div>
    {/if}
    <svg
      class="size-4 {internalValue ? 'opacity-80' : 'text-muted-foreground'}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      style={internalValue ? 'color: white; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));' : ''}
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      />
    </svg>
  </button>
</div>

