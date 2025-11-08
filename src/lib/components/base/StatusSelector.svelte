<script lang="ts">
  import { cn } from '$lib/utils'
  import { ChevronDown, Check } from 'lucide-svelte'
  import { DropdownMenu, DropdownMenuItem } from '$lib/components/ui'
  import type { ProjectStatus } from '$lib/types/domain/project'
  
  interface Props {
    value: ProjectStatus
    editable?: boolean
    onSave: (value: ProjectStatus) => Promise<void>
  }
  
  let { value = $bindable('planning'), editable = true, onSave }: Props = $props()
  
  const options: Array<{ value: ProjectStatus; label: string }> = [
    { value: 'planning', label: 'Planning' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ]
  
  // Color coding for different statuses
  const colorMap: Record<ProjectStatus, string> = {
    planning: 'bg-blue-500 text-white border-transparent',
    'in-progress': 'bg-[var(--theme-warning)] text-white border-transparent',
    completed: 'bg-[var(--theme-success)] text-white border-transparent',
    archived: 'bg-muted text-muted-foreground border-transparent',
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
          {options.find(o => o.value === value)?.label || value}
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
      {options.find(o => o.value === value)?.label || value}
    </div>
  {/if}
</div>

