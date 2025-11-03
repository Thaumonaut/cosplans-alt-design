<script lang="ts">
  import { cn } from '$lib/utils'
  import { ChevronDown, Check, ChevronRight } from 'lucide-svelte'
  import { DropdownMenu, DropdownMenuItem } from '$lib/components/ui'
  import type { TaskStage } from '$lib/types/domain/task'
  
  interface Props {
    stages: TaskStage[]
    currentStageId: string
    editable?: boolean
    onStageChange: (stageId: string) => Promise<void>
    showNextStage?: boolean
    class?: string
  }
  
  let { 
    stages, 
    currentStageId, 
    editable = true, 
    onStageChange, 
    showNextStage = false,
    class: className = ''
  }: Props = $props()
  
  const currentStage = $derived(() => {
    return stages.find(s => s.id === currentStageId) || null
  })
  
  const nextStage = $derived(() => {
    if (!currentStage() || !showNextStage) return null
    const currentIndex = stages.findIndex(s => s.id === currentStageId)
    if (currentIndex >= 0 && currentIndex < stages.length - 1) {
      return stages[currentIndex + 1]
    }
    return null
  })
  
  // Color coding for stages
  const getStageColor = (stage: TaskStage | null): string => {
    if (!stage) return 'bg-muted text-muted-foreground border-transparent'
    if (stage.isCompletionStage) {
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    }
    return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  }
  
  async function selectStage(stage: TaskStage) {
    if (!editable || stage.id === currentStageId) return
    await onStageChange(stage.id)
  }
  
  async function selectNextStage() {
    const next = nextStage()
    if (next && editable) {
      await onStageChange(next.id)
    }
  }
</script>

<div class={cn('relative inline-block', className)}>
  {#if editable}
    <DropdownMenu placement="bottom-start">
      {#snippet trigger()}
        <button
          type="button"
          class={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-all cursor-pointer hover:opacity-90 hover:shadow-sm',
            currentStage() ? getStageColor(currentStage()) : 'bg-muted text-muted-foreground border-transparent'
          )}
        >
          {currentStage()?.name || 'Unknown Stage'}
          {#if currentStage()?.isCompletionStage}
            <span class="ml-0.5 text-xs">✓</span>
          {/if}
          <ChevronDown class="size-3 opacity-80" />
        </button>
      {/snippet}
      
      {#snippet children()}
        <div class="py-1.5 min-w-[180px]">
          <!-- Next Stage Option (if available) -->
          {#if showNextStage && nextStage()}
            <DropdownMenuItem onclick={() => selectNextStage()}>
              <div class="flex w-full items-center justify-between gap-3 text-left">
                <div class="flex items-center gap-2">
                  <ChevronRight class="size-4 text-[var(--theme-primary)]" />
                  <span class="text-sm font-medium text-left">Next Stage</span>
                </div>
                <span class="text-xs text-muted-foreground">{nextStage()!.name}</span>
              </div>
            </DropdownMenuItem>
            <div class="my-1 border-t border-border"></div>
          {/if}
          
          <!-- All Stages -->
          {#each stages as stage}
            <DropdownMenuItem onclick={() => selectStage(stage)}>
              <div class="flex w-full items-center justify-between gap-3 text-left">
                <div class="flex items-center gap-2">
                  <div class={cn('size-2 rounded-full', stage.isCompletionStage ? 'bg-emerald-500' : 'bg-blue-500')}></div>
                  <span class="text-sm font-medium text-left">{stage.name}</span>
                  {#if stage.isCompletionStage}
                    <span class="text-xs text-emerald-600 dark:text-emerald-400">(Completed)</span>
                  {/if}
                </div>
                {#if currentStageId === stage.id}
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
        'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium',
        currentStage() ? getStageColor(currentStage()) : 'bg-muted text-muted-foreground border-transparent',
        'cursor-default'
      )}
    >
      {currentStage()?.name || 'Unknown Stage'}
      {#if currentStage()?.isCompletionStage}
        <span class="ml-0.5 text-xs">✓</span>
      {/if}
    </div>
  {/if}
</div>


