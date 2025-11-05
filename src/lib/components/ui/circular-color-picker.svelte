<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { ChevronDown, RotateCcw, Plus } from 'lucide-svelte'
  
  interface Props {
    value?: string | null
    disabled?: boolean
    onchange?: (detail: string | null) => void
  }

  let { value = null, disabled = false, onchange }: Props = $props()
  
  const dispatch = createEventDispatcher<{ change: string | null }>()
  
  function handleChange(newValue: string | null) {
    value = newValue
    dispatch('change', newValue)
    onchange?.(newValue)
  }
  
  let showPicker = $state(false)
  let pickerElement = $state<HTMLDivElement | null>(null)
  let showCustomInput = $state(false)
  let customColorInput = $state('')
  
  // Theme colors - common colors that work well
  const themeColors = [
    '#000000', // Black
    '#ffffff', // White
    '#8b5cf6', // Purple (theme primary)
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#f59e0b', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#06b6d4', // Cyan
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#78716c', // Gray
  ]
  
  // Custom colors (stored in localStorage for persistence)
  let customColors = $state<string[]>([])
  
  // Load custom colors from localStorage on mount
  $effect(() => {
    try {
      const stored = localStorage.getItem('custom-stage-colors')
      if (stored) {
        customColors = JSON.parse(stored)
      }
    } catch (e) {
      // Ignore errors
    }
  })
  
  function saveCustomColor(color: string) {
    if (!color.match(/^#[0-9A-Fa-f]{6}$/)) return
    if (customColors.includes(color) || themeColors.includes(color)) return
    
    customColors = [...customColors, color]
    try {
      localStorage.setItem('custom-stage-colors', JSON.stringify(customColors))
    } catch (e) {
      // Ignore errors
    }
  }
  
  function addCustomColor() {
    const color = customColorInput.trim()
    if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
      saveCustomColor(color)
      handleChange(color)
      customColorInput = ''
      showCustomInput = false
    }
  }
  
  function handleColorSelect(color: string) {
    handleChange(color)
    showPicker = false
  }
  
  function handleReset() {
    handleChange(null)
    showPicker = false
  }
  
  // Close picker when clicking outside
  $effect(() => {
    if (!showPicker) return
    
    function handleClickOutside(event: MouseEvent) {
      if (pickerElement && !pickerElement.contains(event.target as Node)) {
        showPicker = false
        showCustomInput = false
        customColorInput = ''
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  })
  
  // Check if a color is light (for contrast)
  function isLightColor(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128
  }
</script>

<div class="relative inline-block">
  <!-- Trigger Button -->
  <button
    type="button"
    disabled={disabled}
    onclick={() => showPicker = !showPicker}
    class="relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-background transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
    style={value ? `background-color: ${value}; border-color: ${value};` : ''}
    aria-label={value ? `Color: ${value}` : 'Pick a color'}
  >
    {#if !value}
      <div class="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/30"></div>
    {/if}
    <ChevronDown class="size-4 {value && isLightColor(value) ? 'text-gray-900 opacity-80' : 'text-white opacity-80'}" />
  </button>
  
  <!-- Color Picker Popover -->
  {#if showPicker}
    <div
      bind:this={pickerElement}
      class="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border bg-background p-4 shadow-lg"
      role="dialog"
      tabindex={0}
      aria-label="Color picker"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => {
        if (e.key === 'Escape') {
          showPicker = false
          showCustomInput = false
          customColorInput = ''
        }
      }}
    >
      <!-- Header with Reset button -->
      <div class="mb-3 flex items-center justify-between">
        <span class="text-sm font-medium">Theme</span>
        <button
          type="button"
          onclick={handleReset}
          class="rounded-md p-1 hover:bg-muted transition-colors"
          aria-label="Reset color"
          title="Reset"
        >
          <RotateCcw class="size-4 text-muted-foreground" />
        </button>
      </div>
      
      <!-- Theme Colors Grid -->
      <div class="mb-4 grid grid-cols-6 gap-2">
        {#each themeColors as color}
          <button
            type="button"
            onclick={() => handleColorSelect(color)}
            class="relative h-8 w-8 rounded-full border-2 transition-all hover:scale-110 {color === '#ffffff' ? 'border-border' : ''} {value === color ? 'ring-2 ring-primary ring-offset-2' : ''}"
            style="background-color: {color}; border-color: {color === '#ffffff' ? 'var(--theme-border, #e5e7eb)' : color};"
            aria-label="Select color {color}"
          >
            {#if value === color}
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="size-4 {isLightColor(color) ? 'text-gray-900' : 'text-white'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            {/if}
          </button>
        {/each}
      </div>
      
      <!-- Custom Colors Section -->
      {#if customColors.length > 0}
        <div class="mb-3">
          <span class="text-sm font-medium">Custom</span>
        </div>
        <div class="mb-4 grid grid-cols-6 gap-2">
          {#each customColors as color}
            <button
              type="button"
              onclick={() => handleColorSelect(color)}
              class="relative h-8 w-8 rounded-full border-2 transition-all hover:scale-110 {value === color ? 'ring-2 ring-primary ring-offset-2' : 'border-border'}"
              style="background-color: {color};"
              aria-label="Select custom color {color}"
            >
              {#if value === color}
                <div class="absolute inset-0 flex items-center justify-center">
                  <svg class="size-4 {isLightColor(color) ? 'text-gray-900' : 'text-white'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              {/if}
            </button>
          {/each}
          <!-- Add Custom Color Button -->
          <button
            type="button"
            onclick={() => showCustomInput = !showCustomInput}
            class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors"
            aria-label="Add custom color"
          >
            <Plus class="size-4 text-muted-foreground" />
          </button>
        </div>
      {:else}
        <!-- Add Custom Color Button (when no custom colors exist) -->
        <div class="mb-4">
          <button
            type="button"
            onclick={() => showCustomInput = !showCustomInput}
            class="flex h-8 w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/50 hover:bg-muted transition-colors text-sm text-muted-foreground"
            aria-label="Add custom color"
          >
            <Plus class="size-4" />
            <span>Add Custom Color</span>
          </button>
        </div>
      {/if}
      
      <!-- Custom Color Input -->
      {#if showCustomInput}
        <div class="space-y-2 rounded-md border border-border bg-muted/30 p-2">
          <div class="flex items-center gap-2">
            <input
              type="text"
              bind:value={customColorInput}
              placeholder="#000000"
              class="h-8 flex-1 rounded border border-input bg-background px-2 text-xs"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  addCustomColor()
                } else if (e.key === 'Escape') {
                  showCustomInput = false
                  customColorInput = ''
                }
              }}
            />
            <input
              type="color"
              bind:value={customColorInput}
              class="h-8 w-12 rounded border border-input cursor-pointer"
            />
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              onclick={addCustomColor}
              disabled={!customColorInput.match(/^#[0-9A-Fa-f]{6}$/)}
              class="flex-1 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onclick={() => {
                showCustomInput = false
                customColorInput = ''
              }}
              class="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
