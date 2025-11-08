<script lang="ts">
  import TagSelector, { type TagOption } from './TagSelector.svelte'
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
  
  // Convert stages to TagOptions
  const stageOptions = $derived(
    Array.isArray(stages) && stages.length > 0
      ? stages.map(stage => {
          // Use custom color if provided, otherwise use default based on completion status
          if (stage.color) {
            return {
              value: stage.id,
              label: stage.name,
              style: `background-color: ${stage.color}20; color: ${stage.color}; border-color: ${stage.color}40;`,
              dotStyle: `background-color: ${stage.color};`,
              badge: stage.isCompletionStage ? '✓' : undefined
            }
          }
          return {
          value: stage.id,
          label: stage.name,
          color: stage.isCompletionStage
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          dotColor: stage.isCompletionStage ? 'bg-emerald-500' : 'bg-blue-500',
          badge: stage.isCompletionStage ? '✓' : undefined
          }
        })
      : []
  )
  
  // Custom getTagColor for stages
  function getStageTagColor(option: { value: string; label: string; color?: string; dotColor?: string; badge?: string } | null): string {
    if (!option) return 'bg-muted text-muted-foreground border-transparent'
    return option.color || 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  }
  
  function getStageDotColor(option: { value: string; label: string; color?: string; dotColor?: string; badge?: string } | null): string {
    if (!option) return 'bg-gray-500'
    return option.dotColor || 'bg-blue-500'
  }
  
  async function handleStageChange(stageId: string) {
    if (!editable || stageId === currentStageId) return
    await onStageChange(stageId)
  }
  
  async function selectNextStage() {
    const next = nextStage()
    if (next && editable) {
      await onStageChange(next.id)
    }
  }
</script>

<div class="relative inline-block">
  {#if stageOptions.length > 0}
    <TagSelector
      options={stageOptions}
      currentValue={currentStageId}
      {editable}
      onChange={handleStageChange}
      getTagColor={getStageTagColor}
      getDotColor={getStageDotColor}
      class={className}
    />
  {/if}
  
  {#if showNextStage && nextStage() && editable}
    <div class="mt-1">
      <button
        type="button"
        onclick={selectNextStage}
        class="text-xs text-[var(--theme-primary)] hover:underline"
      >
        → Move to {nextStage()!.name}
      </button>
    </div>
  {/if}
</div>
