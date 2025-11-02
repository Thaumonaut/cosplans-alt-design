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
    planning: 'bg-[color-mix(in_srgb,var(--theme-info)_20%,transparent)] backdrop-blur-sm text-[var(--theme-info)] border-[color-mix(in_srgb,var(--theme-info)_30%,transparent)]',
    'in-progress': 'bg-[color-mix(in_srgb,var(--theme-warning)_20%,transparent)] backdrop-blur-sm text-[var(--theme-warning)] border-[color-mix(in_srgb,var(--theme-warning)_30%,transparent)]',
    completed: 'bg-[color-mix(in_srgb,var(--theme-success)_20%,transparent)] backdrop-blur-sm text-[var(--theme-success)] border-[color-mix(in_srgb,var(--theme-success)_30%,transparent)]',
    archived: 'bg-[color-mix(in_srgb,var(--theme-muted)_20%,transparent)] backdrop-blur-sm text-[var(--theme-sidebar-muted)] border-[color-mix(in_srgb,var(--theme-border)_30%,transparent)]',
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
      <div class="h-2 w-full overflow-hidden rounded-full bg-[var(--theme-section-bg)]">
        <div
          class={cn(
            'h-full rounded-full transition-all',
            project.progress === 100
              ? 'bg-[var(--theme-success)]'
              : project.progress >= 75
                ? 'bg-[var(--theme-info)]'
                : project.progress >= 50
                  ? 'bg-[var(--theme-warning)]'
                  : 'bg-[var(--theme-sidebar-muted)]'
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


