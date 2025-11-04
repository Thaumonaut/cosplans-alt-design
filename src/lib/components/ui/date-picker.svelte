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

  // Convert Date back to string format - ISO 8601 datetime format (YYYY-MM-DDTHH:mm:ss.sssZ)
  // The schema expects datetime format, not just date
  function dateToString(date: Date | undefined | null): string {
    if (!date || isNaN(date.getTime())) return ''
    // Return ISO datetime string (UTC midnight for the selected date)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    // Return as ISO datetime (00:00:00 UTC for the date)
    return `${year}-${month}-${day}T00:00:00.000Z`
  }

  function handleDateChange() {
    const newValue = dateToString(datepickerValue)
    if (value !== newValue) {
      value = newValue
      onchange?.(newValue || null)
    }
  }
</script>

<div class={cn('relative inline-flex items-center gap-2 w-full', className)} style="overflow: visible;">
  <div class="flex-1" style="overflow: visible;">
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
        'w-full min-w-[80px] text-sm',
        'border-0 bg-transparent',
        'text-gray-700 dark:text-gray-300',
        'placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:italic',
        'focus:outline-none focus:ring-0',
        'px-0 py-0',
        'hover:underline cursor-pointer',
        'transition-all',
        disabled && 'opacity-50 cursor-not-allowed hover:no-underline'
      )}
    />
  </div>
  {#if name}
    <input type="hidden" {name} {value} {required} />
  {/if}
</div>

<style>
  /* Flowbite Datepicker calendar dropdown - render outside card boundaries */
  /* Use !important to override any parent styles */
  :global(#datepicker-dropdown),
  :global([id="datepicker-dropdown"]),
  :global(.datepicker-dropdown),
  :global([data-datepicker-calendar]),
  :global(.datepicker-calendar),
  :global([class*="datepicker"]) {
    z-index: 99999 !important;
    position: fixed !important;
    pointer-events: auto !important;
    transform: translateZ(0) !important; /* Force GPU acceleration and new stacking context */
  }
  
  /* Ensure parent containers don't clip */
  :global(.task-card),
  :global(.task-card *),
  :global([class*="overflow"]:has(#datepicker-dropdown)) {
    overflow: visible !important;
  }
  
  /* Fix selected date color in calendar - use theme primary color */
  /* Flowbite datepicker uses different class names */
  :global(.datepicker-day.selected),
  :global(.datepicker-day[aria-selected="true"]),
  :global(.datepicker-day.active),
  :global([data-datepicker-day].selected),
  :global([data-datepicker-day][aria-selected="true"]),
  :global([data-datepicker-day].active),
  :global(button[data-datepicker-day].selected),
  :global(button[data-datepicker-day][aria-selected="true"]),
  :global(button[data-datepicker-day].active),
  :global(.datepicker-day.selected > *),
  :global(.datepicker-day[aria-selected="true"] > *),
  :global(.datepicker-day.active > *) {
    background-color: var(--theme-primary, #8b5cf6) !important;
    color: white !important;
    font-weight: 600 !important;
  }
  
  :global(.datepicker-day.selected:hover),
  :global(.datepicker-day[aria-selected="true"]:hover),
  :global(.datepicker-day.active:hover),
  :global([data-datepicker-day].selected:hover),
  :global([data-datepicker-day][aria-selected="true"]:hover),
  :global([data-datepicker-day].active:hover),
  :global(button[data-datepicker-day].selected:hover),
  :global(button[data-datepicker-day][aria-selected="true"]:hover),
  :global(button[data-datepicker-day].active:hover) {
    background-color: var(--theme-primary-hover, #7c3aed) !important;
  }
</style>
