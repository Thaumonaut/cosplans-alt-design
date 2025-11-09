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
    
    // Apply theme background and border (classes prop handles most styling)
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-background')?.trim() || 
                    getComputedStyle(document.documentElement).getPropertyValue('--theme-section-bg')?.trim() ||
                    'rgba(255, 255, 255, 0.9)'
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-border')?.trim() || 'rgba(120, 113, 108, 0.2)'
    
    calendar.style.backgroundColor = bgColor
    calendar.style.border = `1px solid ${borderColor}`
    calendar.style.borderRadius = '0.5rem'
    
    // Apply theme to selected dates - use inline styles to override Flowbite's defaults
    const allDayButtons = calendar.querySelectorAll('button[data-datepicker-day]')
    allDayButtons.forEach((btn) => {
      const button = btn as HTMLButtonElement
      const bgColor = button.style.backgroundColor || ''
      const isSelected = button.getAttribute('aria-selected') === 'true' || 
                        bgColor.includes('rgb(59') || 
                        bgColor.includes('rgb(37') ||
                        button.classList.contains('selected') ||
                        button.classList.contains('active')
      
      if (isSelected) {
        // Force apply theme colors using inline styles (highest priority)
        button.style.setProperty('background-color', 'var(--theme-primary)', 'important')
        button.style.setProperty('color', 'var(--theme-card-bg)', 'important')
        button.style.setProperty('font-weight', '600', 'important')
        button.style.setProperty('border-radius', '0.375rem', 'important')
        // Also ensure any child elements have contrasting text
        const children = button.querySelectorAll('*')
        children.forEach((child) => {
          if (child instanceof HTMLElement) {
            child.style.setProperty('color', 'var(--theme-card-bg)', 'important')
          }
        })
      } else {
        // Clear any blue backgrounds from Flowbite's default styling
        if (bgColor.includes('rgb(59') || bgColor.includes('rgb(37')) {
          button.style.removeProperty('background-color')
          button.style.removeProperty('color')
        }
      }
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
        attributeFilter: ['style', 'class', 'aria-selected']
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
      color="primary"
      inputClass={cn(
        'w-full min-w-[80px] text-sm',
        'rounded-md outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'focus:outline-none focus:ring-0',
        'px-0 py-0 border-0 bg-transparent',
        'hover:underline cursor-pointer',
        'transition-all',
        'text-[var(--theme-text-muted)]',
        disabled && 'opacity-50 cursor-not-allowed hover:no-underline'
      )}
      classes={{
        polite: 'text-[var(--theme-primary)] bg-[var(--theme-background)] hover:bg-[var(--theme-hover)] hover:text-[var(--theme-background)]',
        columnHeader: 'text-[var(--theme-secondary)]',
        input: 'text-[var(--theme-text-muted)]',
        monthButton: 'text-[var(--theme-primary)] font-semibold bg-[var(--theme-card-bg)] hover:bg-[var(--theme-hover)]',
        dayButton: 'text-[var(--theme-text-muted)] hover:bg-[var(--theme-hover)] hover:text-[var(--theme-background)]'
      }}
      monthBtnSelected="bg-[var(--theme-primary)]"
    />
  </div>
  {#if name}
    <input type="hidden" {name} {value} {required} />
  {/if}
</div>

<style>
  /* Flowbite Datepicker calendar dropdown - ONLY target the actual calendar popup */
  /* Be very specific to avoid affecting document flow */
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day])) {
    z-index: 99999 !important;
    position: fixed !important;
    pointer-events: auto !important;
    margin: 0 !important;
    /* Don't use transform as it can cause layout shifts */
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
    color: var(--theme-text-muted) !important;
  }
  
  /* ============================================
     CALENDAR DROPDOWN - MAIN CONTAINER
     Only target the actual calendar popup (fixed position div with table and datepicker buttons)
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
    background-color: var(--theme-section-bg) !important;
    border: 1px solid var(--theme-border) !important;
    border-radius: 0.5rem !important;
    box-shadow: var(--theme-shadow-lg) !important;
    color: var(--theme-foreground) !important;
    position: fixed !important;
  }
  
  /* Force all text in fixed calendar to use theme colors */
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) *),
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) span),
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) button:not([style*="background"][style*="blue"])) {
    color: var(--theme-foreground) !important;
  }
  
  /* Force all table elements to use theme */
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) table),
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) table *) {
    background-color: transparent !important;
    color: var(--theme-foreground) !important;
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
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) > div:first-child),
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) > div:first-child *) {
    color: var(--theme-foreground) !important;
    background-color: transparent !important;
  }
  
  /* Navigation buttons (prev/next arrows) */
  :global(.datepicker-header button:not([data-datepicker-month])),
  :global([data-datepicker-header] button:not([data-datepicker-month])),
  :global(button[class*="datepicker"][class*="prev"]),
  :global(button[class*="datepicker"][class*="next"]),
  :global(.datepicker-prev),
  :global(.datepicker-next),
  :global([data-datepicker-prev]),
  :global([data-datepicker-next]),
  :global(div:has(table[class*="datepicker"]) button:not([data-datepicker-day]):not([data-datepicker-month])),
  :global(div:has(button[data-datepicker-day]) button:not([data-datepicker-day]):not([data-datepicker-month])),
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) button:not([data-datepicker-day]):not([data-datepicker-month])) {
    color: var(--theme-primary) !important;
    background-color: var(--theme-card-bg) !important;
    border: none !important;
    border-radius: 0.375rem !important;
  }
  
  :global(.datepicker-header button:not([data-datepicker-month]):hover),
  :global([data-datepicker-header] button:not([data-datepicker-month]):hover),
  :global(button[class*="datepicker"][class*="prev"]:hover),
  :global(button[class*="datepicker"][class*="next"]:hover),
  :global(.datepicker-prev:hover),
  :global(.datepicker-next:hover),
  :global([data-datepicker-prev]:hover),
  :global([data-datepicker-next]:hover),
  :global(div:has(table[class*="datepicker"]) button:not([data-datepicker-day]):not([data-datepicker-month]):hover),
  :global(div:has(button[data-datepicker-day]) button:not([data-datepicker-day]):not([data-datepicker-month]):hover) {
    background-color: var(--theme-hover) !important;
    color: var(--theme-primary) !important;
    border-radius: 0.375rem !important;
  }
  
  /* Month/Year text in header - target all text elements */
  :global(.datepicker-header span),
  :global([data-datepicker-header] span),
  :global(div[class*="datepicker"][class*="header"] span),
  :global(div:has(table[class*="datepicker"]) > div:first-child span),
  :global(div:has(button[data-datepicker-day]) > div:first-child span),
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) > div:first-child span),
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) > div:first-child > span),
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) > div:first-child > button + span),
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) > div:first-child > span + button) {
    color: var(--theme-primary) !important;
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
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) th),
  :global(table[class*="datepicker"] th),
  :global(table th:has(button)),
  :global(table:has(button[data-datepicker-day]) th) {
    color: var(--theme-text-muted) !important;
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
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) button),
  :global(table[class*="datepicker"] button),
  :global(table:has(button[data-datepicker-day]) button),
  :global(table button:not([disabled])) {
    color: var(--theme-text-muted) !important;
    background-color: transparent !important;
    border: none !important;
  }
  
  :global(.datepicker-day:hover:not([aria-selected="true"])),
  :global([data-datepicker-day]:hover:not([aria-selected="true"])),
  :global(button[data-datepicker-day]:hover:not([aria-selected="true"])),
  :global(button[class*="datepicker"][class*="day"]:hover:not([aria-selected="true"])),
  :global(div:has(table[class*="datepicker"]) button:hover:not([aria-selected="true"])),
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) button:hover:not([aria-selected="true"])),
  :global(table button:not([disabled]):hover:not([aria-selected="true"])) {
    background-color: var(--theme-hover) !important;
    color: var(--theme-foreground) !important;
    border-radius: 0.375rem !important;
  }
  
  /* ============================================
     OVERRIDE FLOWBITE COLOR PROP CLASSES
     Override Tailwind color classes applied by the color prop
     ============================================ */
  :global(button[class*="bg-primary"]),
  :global(button[class*="bg-primary-"]),
  :global(button.bg-primary-500),
  :global(button.bg-primary-600),
  :global(button.bg-primary-700),
  :global([data-datepicker-day][class*="bg-primary"]),
  :global([data-datepicker-day][class*="bg-primary-"]),
  :global([data-datepicker-day].bg-primary-500),
  :global([data-datepicker-day].bg-primary-600),
  :global([data-datepicker-day].bg-primary-700) {
    background-color: var(--theme-primary) !important;
    color: var(--theme-card-bg) !important;
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
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) button[style*="background"][style*="blue"]),
  :global(div[style*="position: fixed"]:has(table):has(button[data-datepicker-day]) button[style*="background-color: rgb(59"]),
  :global(table button[style*="background"][style*="blue"]),
  :global(button[data-datepicker-day][aria-selected="true"]),
  :global(button[data-datepicker-day].selected) {
    background-color: var(--theme-primary) !important;
    color: var(--theme-card-bg) !important;
    font-weight: 600 !important;
    border-radius: 0.375rem !important;
  }
  
  /* Selected date using Tailwind classes via Flowbite classes prop */
  :global(button[data-datepicker-day][aria-selected="true"] *) {
    color: var(--theme-card-bg) !important;
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
    color: var(--theme-card-bg) !important;
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
    background-color: var(--theme-primary-hover) !important;
    color: var(--theme-card-bg) !important;
  }
  
  /* ============================================
     TODAY INDICATOR
     ============================================ */
  :global(.datepicker-day.today),
  :global([data-datepicker-day].today),
  :global(button[data-datepicker-day].today),
  :global(button[class*="datepicker"][class*="day"].today) {
    border: 2px solid var(--theme-primary) !important;
    color: var(--theme-foreground) !important;
    background-color: transparent !important;
  }
  
  /* Today + Selected */
  :global(.datepicker-day.today.selected),
  :global(.datepicker-day.today[aria-selected="true"]),
  :global(.datepicker-day.today.active),
  :global(button[data-datepicker-day].today.selected),
  :global(button[data-datepicker-day].today[aria-selected="true"]) {
    background-color: var(--theme-primary) !important;
    color: var(--theme-card-bg) !important;
    border-color: var(--theme-primary) !important;
  }
  
  /* ============================================
     DISABLED DATES
     ============================================ */
  :global(.datepicker-day.disabled),
  :global([data-datepicker-day].disabled),
  :global(button[data-datepicker-day].disabled),
  :global(button[class*="datepicker"][class*="day"].disabled) {
    color: var(--theme-text-muted) !important;
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
    color: var(--theme-text-muted) !important;
    opacity: 0.6 !important;
  }
</style>
