<script lang="ts">
  import { cn } from '$lib/utils.js'
  import { ChevronDown } from 'lucide-svelte'

  interface SelectOption {
    value: string
    label: string
    disabled?: boolean
  }

  interface SelectProps {
    value?: string
    options: SelectOption[]
    placeholder?: string
    disabled?: boolean
    required?: boolean
    size?: 'sm' | 'default'
    class?: string
    id?: string
    name?: string
  }

  let {
    value = $bindable(''),
    options = [],
    placeholder = 'Select an option...',
    disabled = false,
    required = false,
    size = 'default',
    class: className = '',
    id,
    name,
    ...restProps
  }: SelectProps = $props()

  let isOpen = $state(false)
  let selectRef: HTMLDivElement

  function toggleOpen() {
    if (!disabled) {
      isOpen = !isOpen
    }
  }

  function selectOption(option: SelectOption) {
    if (!option.disabled) {
      value = option.value
      isOpen = false
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isOpen = false
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (selectRef && !selectRef.contains(event.target as Node)) {
      isOpen = false
    }
  }

  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeydown)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeydown)
    }
  })

  const selectedOption = $derived(options.find(opt => opt.value === value) || null)
</script>

<div
  bind:this={selectRef}
  data-slot="select"
  class="relative"
  {...restProps}
>
  <button
    type="button"
    {disabled}
    {id}
    data-slot="select-trigger"
    data-size={size}
    class={cn(
      "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8",
      className,
    )}
    onclick={toggleOpen}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    <span class={selectedOption ? '' : 'text-muted-foreground'}>
      {selectedOption?.label || placeholder}
    </span>
    <ChevronDown class="size-4 opacity-50" />
  </button>

  {#if isOpen}
    <div
      data-slot="select-content"
      class="bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 max-h-60 min-w-full overflow-auto rounded-lg border shadow-lg animate-in fade-in-0 zoom-in-95"
    >
      <div class="p-1.5 list-none">
        {#each options as option (option.value)}
          <button
            type="button"
            data-slot="select-item"
            class={cn(
              "hover:bg-interactive-hover focus:bg-interactive-hover focus:text-foreground relative flex w-full cursor-default items-center gap-3 rounded-md py-2.5 pr-10 pl-3 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors",
              'list-none', // Remove list decorations
              option.disabled && 'pointer-events-none opacity-50',
              value === option.value && 'bg-interactive-active text-foreground'
            )}
            onclick={() => selectOption(option)}
            disabled={option.disabled}
          >
            {option.label}
            {#if value === option.value}
              <span class="absolute right-3 flex size-4 items-center justify-center text-primary font-medium">
                ✓
              </span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  {#if name}
    <input type="hidden" {name} {value} {required} />
  {/if}
</div>