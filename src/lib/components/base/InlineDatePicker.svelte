<script lang="ts">
  /**
   * InlineDatePicker Component
   * 
   * Provides inline date editing for "living document" UX.
   * Click to edit, save on selection, cancel on Escape.
   */
//   import { DatePicker } from '$lib/components/ui/date-picker'
  import { Datepicker } from 'flowbite-svelte'
  import { cn } from '$lib/utils'

  interface Props {
    value?: string | null
    placeholder?: string
    disabled?: boolean
    editable?: boolean
    onSave?: (value: string | null) => Promise<void> | void
    className?: string
  }

  let {
    value = $bindable<string | null>(null),
    placeholder = 'Select date...',
    disabled = false,
    editable = true,
    onSave,
    className = ''
  }: Props = $props()

  let isEditing = $state(false)
  let isSaving = $state(false)
  let error = $state<string | null>(null)
  let tempValue = $state<string | null>(value)

  // Format date for display
  function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return placeholder
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return placeholder
    }
  }

  function handleClick() {
    if (!editable || disabled || isSaving) return
    isEditing = true
    tempValue = value
    error = null
  }

  async function handleSave(newValue: string | null) {
    if (isSaving) return
    
    // Check if value actually changed
    if (newValue === value) {
      isEditing = false
      return
    }

    isSaving = true
    error = null

    try {
      if (onSave) {
        await onSave(newValue)
      }
      value = newValue
      isEditing = false
    } catch (err: any) {
      error = err.message || 'Failed to save date'
      tempValue = value // Revert to original value
    } finally {
      isSaving = false
    }
  }

  function handleCancel() {
    tempValue = value
    isEditing = false
    error = null
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleCancel()
    }
  }
</script>

<div 
  class={cn('inline-block', className)}
  onkeydown={handleKeydown}
  role="button"
  tabindex={editable && !disabled ? 0 : -1}
>
  {#if isEditing && editable && !disabled}
    <div class="relative">
      <DatePicker
        bind:value={tempValue}
        {placeholder}
        disabled={isSaving}
        onchange={async (v) => {
          await handleSave(v)
        }}
        class="min-w-[150px]"
      />
      {#if error}
        <p class="mt-1 text-xs" style="color: var(--theme-error);">{error}</p>
      {/if}
    </div>
  {:else}
    <div
      class={cn(
        'cursor-pointer rounded px-2 py-1 transition-colors',
        editable && !disabled && 'hover:bg-[var(--theme-hover)]',
        disabled && 'opacity-50 cursor-not-allowed',
        isSaving && 'opacity-50'
      )}
      onclick={handleClick}
      style="color: var(--theme-text-muted, #78716c);"
    >
      {#if isSaving}
        <span class="text-xs">Saving...</span>
      {:else}
        {formatDate(value)}
      {/if}
    </div>
  {/if}
</div>

