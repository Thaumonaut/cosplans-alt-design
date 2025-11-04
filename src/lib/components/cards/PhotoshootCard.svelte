<script lang="ts">
  import type { Photoshoot } from '$lib/types/domain/photoshoot'
  import ClickableCard from '$lib/components/ui/clickable-card.svelte'
  import { Badge } from '$lib/components/ui'
  import { Calendar, MapPin, Camera, Clapperboard } from 'lucide-svelte'

  interface Props {
    photoshoot: Photoshoot
    onclick?: () => void
    linkedProjects?: number
  }

  let { photoshoot, onclick, linkedProjects }: Props = $props()

  const statusLabels: Record<string, string> = {
    planning: 'Planning',
    scheduled: 'Scheduled',
    completed: 'Completed',
  }

  const statusColors: Record<string, string> = {
    planning: 'bg-[color-mix(in_srgb,var(--theme-warning)_20%,transparent)] backdrop-blur-sm text-[var(--theme-warning)] border-[color-mix(in_srgb,var(--theme-warning)_30%,transparent)]',
    scheduled: 'bg-[color-mix(in_srgb,var(--theme-info)_20%,transparent)] backdrop-blur-sm text-[var(--theme-info)] border-[color-mix(in_srgb,var(--theme-info)_30%,transparent)]',
    completed: 'bg-[color-mix(in_srgb,var(--theme-success)_20%,transparent)] backdrop-blur-sm text-[var(--theme-success)] border-[color-mix(in_srgb,var(--theme-success)_30%,transparent)]',
  }

  function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'No date set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
</script>

<ClickableCard
  {onclick}
  class="group relative overflow-hidden"
>
  <!-- Hero Image Area - Placeholder with gradient background -->
  <div class="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[var(--theme-primary)]/20 via-[var(--theme-accent)]/20 to-[var(--theme-info)]/20 flex items-center justify-center">
    <Clapperboard class="size-12 text-[var(--theme-muted-foreground)] opacity-50" />
    <div class="absolute right-3 top-3">
      <Badge class={statusColors[photoshoot.status] || statusColors.planning} variant="secondary">
        {statusLabels[photoshoot.status] || photoshoot.status}
      </Badge>
    </div>
  </div>

  <!-- Content -->
  <div class="p-4 bg-[var(--theme-card-bg)]">
    <!-- Header -->
    <div class="mb-3">
      <h3 class="text-lg font-semibold text-[var(--theme-foreground)] group-hover:text-[var(--theme-primary)] transition-colors line-clamp-1">
        {photoshoot.title}
      </h3>
      {#if photoshoot.description}
        <p class="mt-1.5 line-clamp-2 text-sm text-[var(--theme-muted-foreground)]">{photoshoot.description}</p>
      {/if}
    </div>

    <!-- Meta Info -->
    <div class="flex flex-wrap items-center gap-3 text-xs text-[var(--theme-muted-foreground)]">
      {#if photoshoot.date}
        <div class="flex items-center gap-1.5">
          <Calendar class="size-3.5 shrink-0" />
          <span>{formatDate(photoshoot.date)}</span>
        </div>
      {/if}

      {#if photoshoot.location}
        <div class="flex items-center gap-1.5">
          <MapPin class="size-3.5 shrink-0" />
          <span class="truncate max-w-[150px]">{photoshoot.location}</span>
        </div>
      {/if}

      {#if linkedProjects !== undefined && linkedProjects > 0}
        <div class="flex items-center gap-1.5">
          <Camera class="size-3.5 shrink-0" />
          <span>{linkedProjects} {linkedProjects === 1 ? 'project' : 'projects'}</span>
        </div>
      {/if}
    </div>
  </div>
</ClickableCard>
