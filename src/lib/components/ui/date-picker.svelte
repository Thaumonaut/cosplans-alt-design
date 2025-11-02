<script lang="ts">
  import { cn } from '$lib/utils'
  import { Datepicker } from 'flowbite-svelte'

  interface DatePickerProps {
    value?: string | null
    placeholder?: string
    disabled?: boolean
    required?: boolean
    class?: string
    id?: string
    name?: string
    onchange?: (value: string | null) => void
  }

  let {
    value = $bindable(''),
    placeholder = 'Select date',
    disabled = false,
    required = false,
    class: className = '',
    id,
    name,
    onchange
  }: DatePickerProps = $props()

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

  // Convert Date back to string format (YYYY-MM-DD)
  function dateToString(date: Date | undefined | null): string {
    if (!date || isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function handleDateChange() {
    const newValue = dateToString(datepickerValue)
    if (value !== newValue) {
      value = newValue
      onchange?.(newValue || null)
    }
  }
</script>

<div class={cn('relative inline-flex items-center gap-2 w-full', className)}>
  <div class="flex-1">
    <Datepicker
      bind:value={datepickerValue}
      onselect={handleDateChange}
      {placeholder}
      firstDayOfWeek={0}
      autohide={true}
      {disabled}
      {required}
      {id}
      {name}
      inputClass={cn(
        'w-full min-w-[140px] border-[var(--theme-border)] bg-[var(--theme-input-bg)] text-[var(--theme-foreground)]',
        'placeholder:text-[var(--theme-muted-foreground)]',
        'focus:border-[var(--theme-focus)] focus:ring-[var(--theme-focus)]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    />
  </div>
  {#if name}
    <input type="hidden" {name} {value} {required} />
  {/if}
</div>
