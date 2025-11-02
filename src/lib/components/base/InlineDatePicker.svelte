<script lang="ts">
  import { cn } from '$lib/utils'
  import { Calendar } from 'lucide-svelte'
  import { Datepicker } from 'flowbite-svelte'

  interface Props {
    value: string
    editable?: boolean
    onSave: (value: string) => Promise<void>
    placeholder?: string
    class?: string
  }

  let { value = $bindable(''), editable = true, onSave, placeholder = 'Select date', class: className }: Props = $props()

  let isSaving = $state(false)
  let error = $state<string | null>(null)
  let lastSavedValue = $state(value)
  let datepickerValue = $state<Date | undefined>(undefined)

  // Convert string value to Date for Datepicker
  $effect(() => {
    if (value) {
      try {
        // Parse YYYY-MM-DD format
        const [year, month, day] = value.split('-').map(Number)
        const newDate = new Date(year, month - 1, day)
        if (!isNaN(newDate.getTime()) && datepickerValue?.getTime() !== newDate.getTime()) {
          datepickerValue = newDate
        }
      } catch {
        datepickerValue = undefined
      }
    } else {
      datepickerValue = undefined
    }
  })

  // Watch for datepicker value changes and trigger save
  $effect(() => {
    if (datepickerValue && editable && !isSaving) {
      const newValue = dateToString(datepickerValue)
      if (newValue && newValue !== lastSavedValue && newValue !== value) {
        // Small delay to avoid rapid firing during date selection
        const timeout = setTimeout(() => {
          handleDateChange()
        }, 300)
        return () => clearTimeout(timeout)
      }
    }
  })

  // Convert Date back to string format (YYYY-MM-DD)
  function dateToString(date: Date | undefined | null): string {
    if (!date || isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  async function handleDateChange() {
    if (!editable || isSaving) return
    
    const newValue = dateToString(datepickerValue)
    
    // Don't save if value hasn't changed
    if (newValue === lastSavedValue || !newValue) {
      if (newValue !== value) value = newValue
      return
    }

    // Update value immediately for UI
    value = newValue
    lastSavedValue = newValue
    isSaving = true
    error = null
    
    try {
      await onSave(newValue)
    } catch (err: any) {
      value = lastSavedValue
      datepickerValue = lastSavedValue ? (() => {
        const [year, month, day] = lastSavedValue.split('-').map(Number)
        return new Date(year, month - 1, day)
      })() : undefined
      error = err?.message || 'Save failed'
    } finally {
      isSaving = false
    }
  }

  function formatDisplayDate(dateString: string | null | undefined): string {
    if (!dateString) return ''
    try {
      const [year, month, day] = dateString.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateString
    }
  }

  const displayValue = $derived(formatDisplayDate(value))
</script>

<div class={cn('relative inline-flex items-center', className)}>
  {#if !editable}
    <!-- Read-only display -->
    <div class="flex items-center gap-2 text-[var(--theme-foreground)]">
      {#if value}
        <span>{displayValue}</span>
      {:else}
        <span class="text-[var(--theme-muted-foreground)]">{placeholder}</span>
      {/if}
    </div>
  {:else}
    <!-- Editable date picker with popup calendar -->
    <div class="relative inline-flex items-center gap-2">
      <Calendar class="size-4 text-[var(--theme-muted-foreground)] shrink-0" />
      <div class="relative">
        <Datepicker
          bind:value={datepickerValue}
          onselect={handleDateChange}
          placeholder={placeholder}
          firstDayOfWeek={0}
          autohide={true}
          disabled={isSaving}
          inputClass={cn(
            'min-w-[140px] border-[var(--theme-border)] bg-[var(--theme-input-bg)] text-[var(--theme-foreground)]',
            'placeholder:text-[var(--theme-muted-foreground)]',
            isSaving && 'opacity-70 pointer-events-none',
            error && 'border-[var(--theme-error)]'
          )}
          class={className}
        />
      </div>
    </div>
    {#if isSaving}
      <span class="ml-2 text-xs text-[var(--theme-muted-foreground)]">Saving...</span>
    {/if}
    {#if error}
      <span class="ml-2 text-xs text-[var(--theme-error)]">{error}</span>
    {/if}
  {/if}
</div>

