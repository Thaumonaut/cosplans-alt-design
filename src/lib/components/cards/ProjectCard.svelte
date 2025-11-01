<script lang="ts">
  import type { Project } from '$lib/types/domain/project'
  import { Badge } from 'flowbite-svelte'
  import { Calendar, DollarSign, Target } from 'lucide-svelte'
  import { cn, formatCurrencyFromCents } from '$lib/utils'

  interface Props {
    project: Project
    onclick?: () => void
  }

  let { project, onclick }: Props = $props()

  const statusColors = {
    planning: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    'in-progress': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
    completed: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
    archived: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20',
  }

  const statusLabels = {
    planning: 'Planning',
    'in-progress': 'In Progress',
    completed: 'Completed',
    archived: 'Archived',
  }


  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isOverBudget = $derived(
    project.estimatedBudget && project.spentBudget > project.estimatedBudget
  )
</script>

<div
  role="button"
  tabindex="0"
  onclick={onclick}
  onkeydown={(e) => e.key === 'Enter' && onclick?.()}
  class="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
>
  <!-- Cover Image -->
  {#if project.coverImage}
    <div class="aspect-video w-full overflow-hidden bg-muted">
      <img
        src={project.coverImage}
        alt={`${project.character} from ${project.series}`}
        class="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
    </div>
  {:else}
    <div class="aspect-video w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
      <Target class="size-12 text-muted-foreground/30" />
    </div>
  {/if}

  <!-- Content -->
  <div class="p-4">
    <!-- Header -->
    <div class="mb-3">
      <h3 class="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
        {project.character}
      </h3>
      <p class="text-sm text-muted-foreground">{project.series}</p>
    </div>

    <!-- Status Badge -->
    <div class="mb-3">
      <Badge class="border px-3 py-1 {statusColors[project.status]}">
        {statusLabels[project.status]}
      </Badge>
    </div>

    <!-- Progress Bar -->
    <div class="mb-3">
      <div class="mb-1 flex items-center justify-between text-xs">
        <span class="text-muted-foreground">Progress</span>
        <span class="font-medium text-foreground">{project.progress}%</span>
      </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          class={cn(
            'h-full rounded-full transition-all',
            project.progress === 100
              ? 'bg-green-500'
              : project.progress >= 75
                ? 'bg-blue-500'
                : project.progress >= 50
                  ? 'bg-yellow-500'
                  : 'bg-gray-500'
          )}
          style="width: {project.progress}%"
        ></div>
      </div>
    </div>

    <!-- Meta Info -->
    <div class="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {#if project.deadline}
        <div class="flex items-center gap-1">
          <Calendar class="size-3" />
          <span>{formatDate(project.deadline)}</span>
        </div>
      {/if}

      {#if project.estimatedBudget}
        <div class="flex items-center gap-1" class:text-red-600={isOverBudget}>
          <DollarSign class="size-3" />
          <span>
            {formatCurrencyFromCents(project.spentBudget)} / {formatCurrencyFromCents(project.estimatedBudget)}
          </span>
        </div>
      {/if}
    </div>

    <!-- Tags -->
    {#if project.tags.length > 0}
      <div class="mt-3 flex flex-wrap gap-1">
        {#each project.tags.slice(0, 3) as tag}
          <span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {tag}
          </span>
        {/each}
        {#if project.tags.length > 3}
          <span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            +{project.tags.length - 3}
          </span>
        {/if}
      </div>
    {/if}
  </div>
</div>


