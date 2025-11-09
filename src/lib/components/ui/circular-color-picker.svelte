<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { ChevronDown } from 'lucide-svelte'
  import ColorisWrapper from './coloris-wrapper.svelte'
  import { convertColorFormat, parseColorToHex, type ColorFormat } from '$lib/utils/color-formats'
  import { openColorisPicker } from '$lib/utils/coloris'
  
  interface Props {
    value?: string | null
    disabled?: boolean
    onchange?: (detail: string | null) => void
  }

  let { value = $bindable(), disabled = false, onchange }: Props = $props()
  
  const dispatch = createEventDispatcher<{ change: string | null }>()
  
  // Normalize value
  if (value === undefined) {
    value = null
  }
  
  function handleChange(newValue: string | null) {
    value = newValue
    dispatch('change', newValue)
    onchange?.(newValue)
  }
  
  // Format selection state
  const formats: ColorFormat[] = ['hex', 'rgb', 'rgba', 'hsl', 'hsla']
  let selectedFormat = $state<ColorFormat>('hex')
  
  // Display value in selected format
  const displayValue = $derived(
    value ? convertColorFormat(value, selectedFormat) : ''
  )
  
  let colorisInputId = $state(`circular-color-picker-${Math.random().toString(36).substr(2, 9)}`)
  let showFormatDropdown = $state(false)
  
  function cycleFormat() {
    const currentIndex = formats.indexOf(selectedFormat)
    const nextIndex = (currentIndex + 1) % formats.length
    selectedFormat = formats[nextIndex]
  }
  
  function toggleFormatDropdown() {
    showFormatDropdown = !showFormatDropdown
  }
  
  function handleTextInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const newValue = input.value.trim()
    const hexValue = parseColorToHex(newValue)
    if (hexValue) {
      handleChange(hexValue)
    }
  }
  
  async function openColorPicker() {
    await openColorisPicker(`#${colorisInputId}`)
  }
  
  // Close dropdown when clicking outside
  $effect(() => {
    if (!showFormatDropdown) return
    
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!target.closest('.relative.group')) {
        showFormatDropdown = false
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  })
</script>

<div class="relative inline-flex items-center gap-2">
  <!-- Color Swatch Box -->
  <ColorisWrapper
    id={colorisInputId}
    bind:value={value}
    {disabled}
    onchange={handleChange}
  />
  
  <!-- Text Input for Color Value with Format Selector -->
  <div class="relative group">
    <input
      type="text"
      value={displayValue}
      {disabled}
      class="h-10 w-32 rounded-md border border-input bg-background pl-3 pr-10 text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed"
      style="border-color: var(--theme-border); background-color: var(--theme-input-bg); color: var(--theme-foreground);"
      placeholder="No color"
      onfocus={openColorPicker}
      oninput={handleTextInput}
      aria-label="Color value"
    />
    <!-- Format Selector Button (inside input) -->
    <button
      type="button"
      {disabled}
      onclick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        toggleFormatDropdown()
      }}
      class="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded border-0 bg-transparent hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="Select color format"
      title="Current format: {selectedFormat.toUpperCase()}"
    >
      <ChevronDown class="size-3.5 rotate-90" style="color: var(--theme-foreground);" />
    </button>
    <!-- Format Dropdown (appears on click) -->
    {#if showFormatDropdown}
      <div
        class="absolute right-0 top-full mt-1 z-50 rounded-md border bg-background shadow-lg py-1 min-w-[120px]"
        style="border-color: var(--theme-border); background-color: var(--theme-card-bg);"
        onclick={(e) => e.stopPropagation()}
      >
        {#each formats as format}
          <button
            type="button"
            onclick={() => {
              selectedFormat = format
              showFormatDropdown = false
            }}
            class="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors {selectedFormat === format ? 'bg-muted font-medium' : ''}"
            style="color: var(--theme-foreground);"
          >
            {format.toUpperCase()}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>
