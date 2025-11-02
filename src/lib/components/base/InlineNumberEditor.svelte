<script lang="ts">
  import { cn } from '$lib/utils'

  interface Props {
    value?: number // stored in cents as integer
    editable?: boolean
    onSave: (value: number) => Promise<void>
    onchange?: (value: number) => void
    placeholder?: string
    min?: number
    max?: number
    class?: string
    formatCurrency?: boolean
  }

  let { 
    value = $bindable(0), 
    editable = true, 
    onSave, 
    onchange, 
    placeholder = '$0.00', 
    min, 
    max, 
    class: className = '',
    formatCurrency = true
  }: Props = $props()

  let isSaving = $state(false)
  let error = $state<string | null>(null)
  let lastSavedValue = $state(value)
  let inputValue = $state('')
  let isFocused = $state(false)
  let inputElement: HTMLInputElement | null = $state(null)
  
  // Convert cents to formatted dollar display
  function centsToDisplay(cents: number | undefined): string {
    if (cents === undefined || cents === null || isNaN(cents) || cents === 0) return ''
    const dollars = cents / 100
    return formatCurrency 
      ? `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : dollars.toFixed(2)
  }

  // Convert raw input string to cents (integer)
  function inputToCents(str: string): number {
    // Remove all non-numeric characters except decimal point
    const cleaned = str.replace(/[^0-9]/g, '')
    if (cleaned === '') return 0
    
    // Parse as integer (cents)
    const parsed = parseInt(cleaned, 10)
    return isNaN(parsed) ? 0 : parsed
  }

  // Format input string as user types: "599" -> "$5.99"
  function formatAsYouType(str: string): string {
    const cents = inputToCents(str)
    if (cents === 0) return ''
    
    const dollars = cents / 100
    return formatCurrency 
      ? `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : dollars.toFixed(2)
  }

  // Initialize display value
  $effect(() => {
    if (!isFocused) {
      inputValue = centsToDisplay(value)
      lastSavedValue = value
    }
  })

  // Focus and select when becoming editable
  $effect(() => {
    if (isFocused && inputElement && editable) {
      inputElement.focus()
      inputElement.select()
    }
  })

  async function handleBlur() {
    if (!editable || isSaving) {
      isFocused = false
      return
    }
    
    const centsValue = inputToCents(inputValue)
    
    // Allow empty (sets to 0)
    if (inputValue.trim() === '') {
      if (lastSavedValue === 0) {
        inputValue = ''
        isFocused = false
        return
      }
      value = 0
      inputValue = ''
      lastSavedValue = 0
      isFocused = false
      try {
        await onSave(0)
      } catch (err: any) {
        error = err?.message || 'Save failed'
        inputValue = centsToDisplay(lastSavedValue)
      }
      return
    }

    // Validate range
    if (min !== undefined && centsValue < min) {
      error = `Value must be at least ${min}`
      inputValue = centsToDisplay(lastSavedValue)
      isFocused = false
      return
    }
    
    if (max !== undefined && centsValue > max) {
      error = `Value must be at most ${max}`
      inputValue = centsToDisplay(lastSavedValue)
      isFocused = false
      return
    }

    if (centsValue === lastSavedValue) {
      inputValue = centsToDisplay(centsValue)
      isFocused = false
      return
    }

    const previousValue = value
    value = centsValue
    lastSavedValue = centsValue
    isSaving = true
    error = null
    
    try {
      await onSave(centsValue)
      if (onchange) {
        onchange(centsValue)
      }
      inputValue = centsToDisplay(centsValue)
    } catch (err: any) {
      value = previousValue
      lastSavedValue = previousValue
      inputValue = centsToDisplay(previousValue)
      error = err?.message || 'Save failed'
    } finally {
      isSaving = false
      isFocused = false
    }
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement
    const rawValue = target.value
    
    // Format as user types
    inputValue = formatAsYouType(rawValue)
    
    // Move cursor to end after formatting
    setTimeout(() => {
      if (inputElement) {
        inputElement.setSelectionRange(inputValue.length, inputValue.length)
      }
    }, 0)
    
    error = null
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      ;(e.target as HTMLInputElement).blur()
      return
    }
    
    if (e.key === 'Escape') {
      inputValue = centsToDisplay(lastSavedValue)
      ;(e.target as HTMLInputElement).blur()
      return
    }
    
    // Allow: backspace, delete, tab, escape, enter, home, end, left, right
    if ([8, 9, 27, 13, 35, 36, 37, 39, 46].indexOf(e.keyCode) !== -1 ||
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey) ||
      (e.keyCode === 67 && e.ctrlKey) ||
      (e.keyCode === 86 && e.ctrlKey) ||
      (e.keyCode === 88 && e.ctrlKey)) {
      return
    }
    
    // Only allow numeric characters (0-9)
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault()
    }
  }

  function handleFocus() {
    if (!editable) return
    isFocused = true
    // Clear formatting when focused for easier editing
    const cents = inputToCents(inputValue)
    if (cents > 0) {
      // Show just the numeric cents value
      inputValue = cents.toString()
    } else {
      inputValue = ''
    }
  }
</script>

<div class={cn('group relative', className)}>
  <input
    bind:this={inputElement}
    type="text"
    inputmode="numeric"
    bind:value={inputValue}
    onfocus={handleFocus}
    onblur={handleBlur}
    oninput={handleInput}
    onkeydown={handleKeydown}
    disabled={!editable || isSaving}
    {placeholder}
    class={cn(
      'w-full border-none bg-transparent p-0 outline-none',
      'text-3xl font-bold tracking-tight',
      'placeholder:text-muted-foreground/30',
      'transition-all duration-200',
      editable && 'cursor-text hover:text-primary/90',
      !editable && 'cursor-not-allowed opacity-60',
      isSaving && 'opacity-60',
      isFocused && 'text-primary',
      error && 'text-destructive'
    )}
  />
  
  {#if isSaving}
    <div class="absolute -right-16 top-1/2 -translate-y-1/2">
      <span class="text-xs text-muted-foreground">Saving...</span>
    </div>
  {/if}
  
  {#if editable && !isFocused && !isSaving}
    <div class="pointer-events-none absolute inset-0 -inset-x-2 -inset-y-1 rounded-md opacity-0 transition-opacity group-hover:bg-interactive-hover group-hover:opacity-100"></div>
  {/if}
</div>

{#if error}
  <p class="mt-1.5 text-xs text-destructive">{error}</p>
{/if}
