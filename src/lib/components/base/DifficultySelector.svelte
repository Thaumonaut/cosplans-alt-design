<script lang="ts">
  import { cn } from '$lib/utils'
  import { ChevronDown } from 'lucide-svelte'
  
  interface Props {
    value: 'beginner' | 'intermediate' | 'advanced'
    editable?: boolean
    onSave: (value: 'beginner' | 'intermediate' | 'advanced') => Promise<void>
  }
  
  let { value = $bindable('beginner'), editable = true, onSave }: Props = $props()
  
  let isOpen = $state(false)
  let selectorRef: HTMLDivElement
  
  const options: Array<{ value: 'beginner' | 'intermediate' | 'advanced'; label: string }> = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ]
  
  const colorMap = {
    beginner: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
    intermediate: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
    advanced: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',
  }
  
  function toggleOpen() {
    if (!editable) return
    isOpen = !isOpen
  }
  
  async function selectOption(option: typeof options[0]) {
    value = option.value
    isOpen = false
    await onSave(option.value)
  }
  
  function handleClickOutside(event: MouseEvent) {
    if (selectorRef && !selectorRef.contains(event.target as Node)) {
      isOpen = false
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
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
</script>

<div bind:this={selectorRef} class="relative inline-block">
  <button
    type="button"
    disabled={!editable}
    onclick={toggleOpen}
    class={cn(
      'inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-medium transition-all',
      colorMap[value],
      editable && 'cursor-pointer hover:opacity-80',
      !editable && 'cursor-default'
    )}
  >
    {value.charAt(0).toUpperCase() + value.slice(1)}
    {#if editable}
      <ChevronDown class="size-3 opacity-60" />
    {/if}
  </button>
  
  {#if isOpen}
    <div
      class="absolute top-full left-0 z-50 mt-1 w-40 rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
    >
      <div class="p-1">
        {#each options as option}
          <button
            type="button"
            onclick={() => selectOption(option)}
            class={cn(
              'flex w-full items-center rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
              value === option.value && 'bg-accent/50'
            )}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

