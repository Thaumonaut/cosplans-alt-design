<script lang="ts">
  import { cn } from '$lib/utils'
  import { ChevronDown, Check } from 'lucide-svelte'
  import { DropdownMenu, DropdownMenuItem } from '$lib/components/ui'
  
  interface Props {
    value: 'beginner' | 'intermediate' | 'advanced'
    editable?: boolean
    onSave: (value: 'beginner' | 'intermediate' | 'advanced') => Promise<void>
  }
  
  let { value = $bindable('beginner'), editable = true, onSave }: Props = $props()
  
  const options: Array<{ value: 'beginner' | 'intermediate' | 'advanced'; label: string }> = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ]
  
  // Use opaque theme colors instead of transparent
  const colorMap = {
    beginner: 'bg-[var(--theme-success)] text-white border-transparent',
    intermediate: 'bg-[var(--theme-warning)] text-white border-transparent',
    advanced: 'bg-[var(--theme-error)] text-white border-transparent',
  }
  
  async function selectOption(option: typeof options[0]) {
    if (!editable) return
    value = option.value
    await onSave(option.value)
  }
</script>

<div class="relative inline-block">
  {#if editable}
    <DropdownMenu placement="bottom-start">
      {#snippet trigger()}
        <button
          type="button"
          class={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-medium transition-all cursor-pointer hover:opacity-90',
            colorMap[value]
          )}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
          <ChevronDown class="size-3 opacity-80" />
        </button>
      {/snippet}
      
      {#snippet children()}
        <div class="py-1.5">
          {#each options as option}
            <DropdownMenuItem onclick={() => selectOption(option)}>
              <div class="flex w-full items-center justify-between gap-3 text-left">
                <span class="text-sm font-medium text-left">{option.label}</span>
                {#if value === option.value}
                  <Check class="size-4 text-[var(--theme-primary)] shrink-0" />
                {/if}
              </div>
            </DropdownMenuItem>
          {/each}
        </div>
      {/snippet}
    </DropdownMenu>
  {:else}
    <div
      class={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-medium',
        colorMap[value],
        'cursor-default'
      )}
    >
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </div>
  {/if}
</div>

