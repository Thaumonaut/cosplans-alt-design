<script lang="ts">
  import { CheckCircle2, Circle } from 'lucide-svelte'
  import { cn } from '$lib/utils'

  interface Props {
    progress: number // 0-100
    taskProgress?: number // 0-100
    resourceProgress?: number // 0-100
    showBreakdown?: boolean
  }

  let { progress, taskProgress, resourceProgress, showBreakdown = false }: Props = $props()

  const progressColor = $derived(
    progress === 100
      ? 'bg-green-500'
      : progress >= 75
        ? 'bg-blue-500'
        : progress >= 50
          ? 'bg-yellow-500'
          : 'bg-gray-500'
  )

  const progressLabel = $derived(
    progress === 100
      ? 'Complete'
      : progress >= 75
        ? 'Nearly There'
        : progress >= 50
          ? 'Halfway'
          : 'Getting Started'
  )
</script>

<div class="space-y-4">
  <!-- Overall Progress -->
  <div>
    <div class="mb-2 flex items-center justify-between">
      <div class="flex items-center gap-2">
        {#if progress === 100}
          <CheckCircle2 class="size-5 text-green-500" />
        {:else}
          <Circle class="size-5 text-muted-foreground" />
        {/if}
        <span class="text-sm font-medium text-foreground">Overall Progress</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground">{progressLabel}</span>
        <span class="text-lg font-bold text-foreground">{progress}%</span>
      </div>
    </div>
    <div class="h-3 w-full overflow-hidden rounded-full bg-muted">
      <div
        class={cn('h-full rounded-full transition-all duration-500', progressColor)}
        style="width: {progress}%"
      ></div>
    </div>
  </div>

  <!-- Breakdown -->
  {#if showBreakdown && (taskProgress !== undefined || resourceProgress !== undefined)}
    <div class="space-y-3 rounded-lg border bg-muted/30 p-4">
      <h4 class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Progress Breakdown
      </h4>

      {#if taskProgress !== undefined}
        <div>
          <div class="mb-1 flex items-center justify-between text-xs">
            <span class="text-muted-foreground">Project Tasks</span>
            <span class="font-medium text-foreground">{taskProgress}%</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full bg-blue-500 transition-all"
              style="width: {taskProgress}%"
            ></div>
          </div>
        </div>
      {/if}

      {#if resourceProgress !== undefined}
        <div>
          <div class="mb-1 flex items-center justify-between text-xs">
            <span class="text-muted-foreground">Resources & Tasks</span>
            <span class="font-medium text-foreground">{resourceProgress}%</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full bg-purple-500 transition-all"
              style="width: {resourceProgress}%"
            ></div>
          </div>
        </div>
      {/if}

      <p class="text-xs text-muted-foreground">
        Progress is calculated using a hybrid approach: combining project-level tasks with resource
        status and resource-specific tasks.
      </p>
    </div>
  {/if}
</div>


