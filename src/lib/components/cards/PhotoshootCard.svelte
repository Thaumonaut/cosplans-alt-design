<script lang="ts">
  import type { Photoshoot } from '$lib/types/domain/photoshoot'
  import { Badge } from 'flowbite-svelte'
  import { Calendar, MapPin, Camera } from 'lucide-svelte'
  import { cn } from '$lib/utils'

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
    planning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
    scheduled: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    completed: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
  }

  function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'No date set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
</script>

<div
  role="button"
  tabindex="0"
  onclick={onclick}
  onkeydown={(e) => e.key === 'Enter' && onclick?.()}
  class="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
>
  <!-- Content -->
  <div class="p-4">
    <!-- Header -->
    <div class="mb-3">
      <h3 class="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
        {photoshoot.title}
      </h3>
      {#if photoshoot.description}
        <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">{photoshoot.description}</p>
      {/if}
    </div>

    <!-- Status Badge -->
    <div class="mb-3">
      <Badge class="border px-3 py-1 {statusColors[photoshoot.status] || statusColors.planning}">
        {statusLabels[photoshoot.status] || photoshoot.status}
      </Badge>
    </div>

    <!-- Meta Info -->
    <div class="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {#if photoshoot.date}
        <div class="flex items-center gap-1">
          <Calendar class="size-3" />
          <span>{formatDate(photoshoot.date)}</span>
        </div>
      {/if}

      {#if photoshoot.location}
        <div class="flex items-center gap-1">
          <MapPin class="size-3" />
          <span class="truncate max-w-[150px]">{photoshoot.location}</span>
        </div>
      {/if}

      {#if linkedProjects !== undefined && linkedProjects > 0}
        <div class="flex items-center gap-1">
          <Camera class="size-3" />
          <span>{linkedProjects} {linkedProjects === 1 ? 'project' : 'projects'}</span>
        </div>
      {/if}
    </div>
  </div>
</div>

