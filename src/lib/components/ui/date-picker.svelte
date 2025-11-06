<script lang="ts">
  import { cn } from '$lib/utils'
  import { Datepicker } from 'flowbite-svelte'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'

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

  // Apply theme styles directly to calendar DOM when it appears
  function applyThemeToCalendar() {
    if (!browser) return
    
    // Find the calendar dropdown - look for fixed position divs with tables
    const allFixedDivs = Array.from(document.querySelectorAll('div[style*="position: fixed"]'))
    const calendar = allFixedDivs.find(div => {
      const table = div.querySelector('table')
      const buttons = div.querySelectorAll('button[data-datepicker-day], button[style*="background"]')
      return table && buttons.length > 0
    }) as HTMLElement | undefined
    
    if (!calendar) return

    // CRITICAL: Fix positioning to prevent layout shifts
    calendar.style.position = 'fixed'
    calendar.style.zIndex = '99999'
    calendar.style.margin = '0'
    calendar.style.padding = '1rem'
    
    // Apply theme background and border
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-card-bg') || 
                    getComputedStyle(document.documentElement).getPropertyValue('--theme-section-bg') ||
                    'rgba(255, 255, 255, 0.9)'
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-border') || 'rgba(120, 113, 108, 0.2)'
    const fgColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-foreground') || '#1c1917'
    const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-text-muted') || '#78716c'
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary') || '#8b5cf6'
    
    calendar.style.backgroundColor = bgColor
    calendar.style.color = fgColor
    calendar.style.border = `1px solid ${borderColor}`
    calendar.style.borderRadius = '0.5rem'
    
    // Apply theme to weekday headers (th elements)
    const weekdayHeaders = calendar.querySelectorAll('th')
    weekdayHeaders.forEach((th) => {
      (th as HTMLElement).style.color = mutedColor
      (th as HTMLElement).style.fontWeight = '600'
    })
    
    // Apply theme to ALL buttons in the calendar
    const allButtons = calendar.querySelectorAll('button')
    allButtons.forEach((btn) => {
      const button = btn as HTMLElement
      const bgColor = button.style.backgroundColor || ''
      
      // Check if this is a selected date (has blue background from Flowbite)
      const isSelected = bgColor.includes('rgb(59') || 
                        bgColor.includes('rgb(37') ||
                        button.getAttribute('aria-selected') === 'true'
      
      if (isSelected) {
        // Selected date - use primary color with white text
        button.style.backgroundColor = primaryColor
        button.style.color = 'white'
        button.style.fontWeight = '600'
        // Force all children to white
        button.querySelectorAll('*').forEach(child => {
          (child as HTMLElement).style.color = 'white'
        })
      } else if (!button.disabled) {
        // Regular date button - use theme foreground color
        button.style.color = fgColor
        button.style.backgroundColor = 'transparent'
        // Apply to children too
        button.querySelectorAll('*').forEach(child => {
          (child as HTMLElement).style.color = fgColor
        })
      } else {
        // Disabled date (different month) - use muted color
        button.style.color = mutedColor
        button.style.opacity = '0.5'
      }
    })
    
    // Apply theme to all span elements (month/year text)
    const allSpans = calendar.querySelectorAll('span')
    allSpans.forEach((span) => {
      const element = span as HTMLElement
      // Skip if inside a button (already handled)
      if (element.closest('button')) return
      element.style.color = fgColor
      element.style.fontWeight = '600'
    })
  }

  // Watch for calendar appearance and apply theme
  if (browser) {
    onMount(() => {
      const observer = new MutationObserver(() => {
        applyThemeToCalendar()
      })
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      })

      // Also check periodically in case observer misses it
      const interval = setInterval(() => {
        applyThemeToCalendar()
      }, 100)

      return () => {
        observer.disconnect()
        clearInterval(interval)
      }
    })
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
      inputClass={cn(
        'w-full min-w-[80px] text-sm',
        'rounded-md outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'focus:outline-none focus:ring-0',
        'px-0 py-0 border-0 bg-transparent',
        'hover:underline cursor-pointer',
        'transition-all',
        disabled && 'opacity-50 cursor-not-allowed hover:no-underline'
      )}
      style="color: var(--theme-foreground, #1c1917);"
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
    margin: 0 !important;
  }
  
  /* CRITICAL: Prevent calendar from affecting document flow */
  :global(div[style*="position: fixed"]:has(table)) {
    position: fixed !important;
    z-index: 99999 !important;
    margin: 0 !important;
    isolation: isolate !important; /* Create new stacking context */
  }
  
  /* Ensure parent containers don't clip or shift */
  :global(.task-card),
  :global(.task-card *),
  :global([class*="overflow"]:has(#datepicker-dropdown)) {
    overflow: visible !important;
  }
  
  /* Hide the date picker calendar icon button */
  :global(.datepicker-wrapper button[aria-label]),
  :global(.datepicker-wrapper button[aria-label="Open date picker"]),
  :global(.datepicker-wrapper .absolute.inset-y-0.right-0),
  :global(button[aria-label="Open date picker"]),
  :global(.datepicker-wrapper > button),
  :global(input[type="text"] + button) {
    display: none !important;
  }
  
  /* Style placeholder text to use theme colors */
  :global(input::placeholder) {
    color: var(--theme-text-muted, #78716c) !important;
  }
  
  /* ============================================
     CALENDAR DROPDOWN - MAIN CONTAINER
     Target ALL possible Flowbite datepicker containers
     ============================================ */
  :global(.datepicker-dropdown),
  :global([data-datepicker-calendar]),
  :global(.datepicker-calendar),
  :global(.datepicker-wrapper .datepicker-dropdown),
  :global(div[class*="datepicker"][class*="dropdown"]),
  :global(div[class*="datepicker"][class*="calendar"]),
  :global([id*="datepicker"]),
  :global([class*="datepicker-dropdown"]),
  :global(div[style*="position: fixed"]:has(table)),
  :global(div[style*="z-index"]:has([class*="datepicker"])),
  :global(div:has(table[class*="datepicker"])),
  :global(div:has(button[data-datepicker-day])) {
    background-color: var(--theme-card-bg, var(--theme-section-bg, rgba(255, 255, 255, 0.9))) !important;
    border: 1px solid var(--theme-border, rgba(120, 113, 108, 0.2)) !important;
    border-radius: 0.5rem !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    color: var(--theme-foreground, #1c1917) !important;
  }
  
  /* Target any white background divs that are likely the calendar */
  :global(div[style*="background"][style*="white"]:has(table)),
  :global(div[style*="background-color: white"]:has(button)),
  :global(div[style*="background-color: rgb(255"]:has(table)),
  :global(div[style*="background-color: rgb(255, 255, 255)"]),
  :global(div[style*="background-color:#ffffff"]),
  :global(div[style*="background-color: #ffffff"]) {
    background-color: var(--theme-card-bg, var(--theme-section-bg, rgba(255, 255, 255, 0.9))) !important;
    color: var(--theme-foreground, #1c1917) !important;
  }
  
  /* NUCLEAR OPTION: Target ANY fixed position div with a table inside it */
  :global(div[style*="position: fixed"]:has(table)) {
    background-color: var(--theme-card-bg, var(--theme-section-bg, rgba(255, 255, 255, 0.9))) !important;
    border: 1px solid var(--theme-border, rgba(120, 113, 108, 0.2)) !important;
    border-radius: 0.5rem !important;
    color: var(--theme-foreground, #1c1917) !important;
  }
  
  /* Force all text in fixed calendar to use theme colors */
  :global(div[style*="position: fixed"]:has(table) *),
  :global(div[style*="position: fixed"]:has(table) span),
  :global(div[style*="position: fixed"]:has(table) button:not([style*="background"][style*="blue"])) {
    color: var(--theme-foreground, #1c1917) !important;
  }
  
  /* Force all table elements to use theme */
  :global(div[style*="position: fixed"]:has(table) table),
  :global(div[style*="position: fixed"]:has(table) table *) {
    background-color: transparent !important;
    color: var(--theme-foreground, #1c1917) !important;
  }
  
  /* ============================================
     CALENDAR HEADER (Month/Year Navigation)
     Target all header elements and text
     ============================================ */
  :global(.datepicker-header),
  :global([data-datepicker-header]),
  :global(div[class*="datepicker"][class*="header"]),
  :global(.datepicker-header *),
  :global([data-datepicker-header] *),
  :global(div:has(table[class*="datepicker"]) > div:first-child),
  :global(div:has(button[data-datepicker-day]) > div:first-child),
  :global(div:has(table) > div:first-child > *),
  :global(div[style*="position: fixed"]:has(table) > div:first-child),
  :global(div[style*="position: fixed"]:has(table) > div:first-child *) {
    color: var(--theme-foreground, #1c1917) !important;
    background-color: transparent !important;
  }
  
  :global(.datepicker-header button),
  :global([data-datepicker-header] button),
  :global(button[class*="datepicker"][class*="prev"]),
  :global(button[class*="datepicker"][class*="next"]),
  :global(.datepicker-prev),
  :global(.datepicker-next),
  :global([data-datepicker-prev]),
  :global([data-datepicker-next]),
  :global(div:has(table[class*="datepicker"]) button),
  :global(div:has(button[data-datepicker-day]) button:not([data-datepicker-day])),
  :global(div[style*="position: fixed"]:has(table) button:not([data-datepicker-day])) {
    color: var(--theme-foreground, #1c1917) !important;
    background-color: transparent !important;
    border: none !important;
  }
  
  :global(.datepicker-header button:hover),
  :global([data-datepicker-header] button:hover),
  :global(button[class*="datepicker"][class*="prev"]:hover),
  :global(button[class*="datepicker"][class*="next"]:hover),
  :global(.datepicker-prev:hover),
  :global(.datepicker-next:hover),
  :global([data-datepicker-prev]:hover),
  :global([data-datepicker-next]:hover),
  :global(div:has(table[class*="datepicker"]) button:hover),
  :global(div:has(button[data-datepicker-day]) button:not([data-datepicker-day]):hover) {
    background-color: var(--theme-hover, rgba(237, 233, 254, 0.6)) !important;
    color: var(--theme-primary, #8b5cf6) !important;
    border-radius: 0.375rem !important;
  }
  
  /* Month/Year text in header - target all text elements */
  :global(.datepicker-header span),
  :global([data-datepicker-header] span),
  :global(div[class*="datepicker"][class*="header"] span),
  :global(div:has(table[class*="datepicker"]) > div:first-child span),
  :global(div:has(button[data-datepicker-day]) > div:first-child span),
  :global(div[style*="position: fixed"]:has(table) > div:first-child span),
  :global(div[style*="position: fixed"]:has(table) > div:first-child > span),
  :global(div[style*="position: fixed"]:has(table) > div:first-child > button + span),
  :global(div[style*="position: fixed"]:has(table) > div:first-child > span + button) {
    color: var(--theme-foreground, #1c1917) !important;
    font-weight: 600 !important;
  }
  
  /* ============================================
     WEEKDAY LABELS (Sun, Mon, Tue, etc.)
     Target all table headers
     ============================================ */
  :global(.datepicker-weekday),
  :global([data-datepicker-weekday]),
  :global(div[class*="datepicker"][class*="weekday"]),
  :global(th[class*="datepicker"]),
  :global(th[class*="weekday"]),
  :global(div:has(table[class*="datepicker"]) th),
  :global(div:has(button[data-datepicker-day]) th),
  :global(div[style*="position: fixed"]:has(table) th),
  :global(table[class*="datepicker"] th),
  :global(table th:has(button)),
  :global(table:has(button[data-datepicker-day]) th) {
    color: var(--theme-text-muted, #78716c) !important;
    font-weight: 600 !important;
    background-color: transparent !important;
  }
  
  /* ============================================
     CALENDAR DAY BUTTONS - DEFAULT STATE
     Target ALL buttons in calendar tables
     ============================================ */
  :global(.datepicker-day),
  :global([data-datepicker-day]),
  :global(button[data-datepicker-day]),
  :global(button[class*="datepicker"][class*="day"]),
  :global(td button),
  :global(td[class*="datepicker"] button),
  :global(div:has(table[class*="datepicker"]) button),
  :global(div:has(button[data-datepicker-day]) button[data-datepicker-day]),
  :global(div[style*="position: fixed"]:has(table) button),
  :global(table[class*="datepicker"] button),
  :global(table:has(button[data-datepicker-day]) button),
  :global(table button:not([disabled])) {
    color: var(--theme-foreground, #1c1917) !important;
    background-color: transparent !important;
    border: none !important;
  }
  
  :global(.datepicker-day:hover),
  :global([data-datepicker-day]:hover),
  :global(button[data-datepicker-day]:hover),
  :global(button[class*="datepicker"][class*="day"]:hover),
  :global(div:has(table[class*="datepicker"]) button:hover),
  :global(div[style*="position: fixed"]:has(table) button:hover),
  :global(table button:not([disabled]):hover) {
    background-color: var(--theme-hover, rgba(237, 233, 254, 0.6)) !important;
    color: var(--theme-foreground, #1c1917) !important;
    border-radius: 0.375rem !important;
  }
  
  /* ============================================
     SELECTED DATE - CRITICAL FIX
     Target selected/active dates with multiple strategies
     ============================================ */
  :global(.datepicker-day.selected),
  :global(.datepicker-day[aria-selected="true"]),
  :global(.datepicker-day.active),
  :global([data-datepicker-day].selected),
  :global([data-datepicker-day][aria-selected="true"]),
  :global([data-datepicker-day].active),
  :global(button[data-datepicker-day].selected),
  :global(button[data-datepicker-day][aria-selected="true"]),
  :global(button[data-datepicker-day].active),
  :global(button[class*="datepicker"][class*="day"].selected),
  :global(button[class*="datepicker"][class*="day"][aria-selected="true"]),
  :global(button[class*="datepicker"][class*="day"].active),
  :global(td button.selected),
  :global(td button[aria-selected="true"]),
  :global(td button.active),
  :global(button[style*="background"][style*="blue"]),
  :global(button[style*="background-color: rgb(59, 130, 246)"]),
  :global(button[style*="background-color: rgb(37, 99, 235)"]),
  :global(div[style*="position: fixed"]:has(table) button[style*="background"][style*="blue"]),
  :global(div[style*="position: fixed"]:has(table) button[style*="background-color: rgb(59"]),
  :global(table button[style*="background"][style*="blue"]) {
    background-color: var(--theme-primary, #8b5cf6) !important;
    color: white !important;
    font-weight: 600 !important;
    border-radius: 0.375rem !important;
  }
  
  /* Selected date text/span inside button - force white text */
  :global(.datepicker-day.selected *),
  :global(.datepicker-day[aria-selected="true"] *),
  :global(.datepicker-day.active *),
  :global([data-datepicker-day].selected *),
  :global([data-datepicker-day][aria-selected="true"] *),
  :global([data-datepicker-day].active *),
  :global(button[data-datepicker-day].selected *),
  :global(button[data-datepicker-day][aria-selected="true"] *),
  :global(button[data-datepicker-day].active *),
  :global(button[style*="background"][style*="blue"] *),
  :global(button[style*="background-color: rgb(59"] *) {
    color: white !important;
  }
  
  :global(.datepicker-day.selected:hover),
  :global(.datepicker-day[aria-selected="true"]:hover),
  :global(.datepicker-day.active:hover),
  :global([data-datepicker-day].selected:hover),
  :global([data-datepicker-day][aria-selected="true"]:hover),
  :global([data-datepicker-day].active:hover),
  :global(button[data-datepicker-day].selected:hover),
  :global(button[data-datepicker-day][aria-selected="true"]:hover),
  :global(button[data-datepicker-day].active:hover),
  :global(button[style*="background"][style*="blue"]:hover) {
    background-color: var(--theme-primary-hover, #7c3aed) !important;
    color: white !important;
  }
  
  /* ============================================
     TODAY INDICATOR
     ============================================ */
  :global(.datepicker-day.today),
  :global([data-datepicker-day].today),
  :global(button[data-datepicker-day].today),
  :global(button[class*="datepicker"][class*="day"].today) {
    border: 2px solid var(--theme-primary, #8b5cf6) !important;
    color: var(--theme-foreground, #1c1917) !important;
    background-color: transparent !important;
  }
  
  /* Today + Selected */
  :global(.datepicker-day.today.selected),
  :global(.datepicker-day.today[aria-selected="true"]),
  :global(.datepicker-day.today.active),
  :global(button[data-datepicker-day].today.selected),
  :global(button[data-datepicker-day].today[aria-selected="true"]) {
    background-color: var(--theme-primary, #8b5cf6) !important;
    color: white !important;
    border-color: var(--theme-primary, #8b5cf6) !important;
  }
  
  /* ============================================
     DISABLED DATES
     ============================================ */
  :global(.datepicker-day.disabled),
  :global([data-datepicker-day].disabled),
  :global(button[data-datepicker-day].disabled),
  :global(button[class*="datepicker"][class*="day"].disabled) {
    color: var(--theme-text-muted, #78716c) !important;
    opacity: 0.5 !important;
    cursor: not-allowed !important;
  }
  
  /* ============================================
     OTHER MONTH DATES (Previous/Next Month)
     ============================================ */
  :global(.datepicker-day.other-month),
  :global([data-datepicker-day].other-month),
  :global(button[data-datepicker-day].other-month),
  :global(button[class*="datepicker"][class*="day"].other-month) {
    color: var(--theme-text-muted, #78716c) !important;
    opacity: 0.6 !important;
  }
</style>
