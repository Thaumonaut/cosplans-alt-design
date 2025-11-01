<script lang="ts">
  import type { Resource } from '$lib/types/domain/resource'
  import { Badge } from 'flowbite-svelte'
  import { DollarSign, Package, Link as LinkIcon } from 'lucide-svelte'
  import { cn, formatCurrencyFromCents } from '$lib/utils'

  interface Props {
    resource: Resource
    onclick?: () => void
    projectCount?: number // Number of projects using this resource
  }

  let { resource, onclick, projectCount }: Props = $props()

  const categoryLabels: Record<string, string> = {
    prop: 'Prop',
    fabric: 'Fabric',
    wig: 'Wig',
    pattern: 'Pattern',
    'costume-piece': 'Costume Piece',
    accessory: 'Accessory',
    material: 'Material',
  }

  const categoryColors: Record<string, string> = {
    prop: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    fabric: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20',
    wig: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    pattern: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
    'costume-piece': 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
    accessory: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
    material: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20',
  }


  const category = resource.metadata?.category || 'prop'
</script>

<div
  role="button"
  tabindex="0"
  onclick={onclick}
  onkeydown={(e) => e.key === 'Enter' && onclick?.()}
  class="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
>
  <!-- Cover Image -->
  {#if resource.images && resource.images.length > 0}
    <div class="aspect-video w-full overflow-hidden bg-muted">
      <img
        src={resource.images[0]}
        alt={resource.name}
        class="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
    </div>
  {:else}
    <div class="aspect-video w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
      <Package class="size-12 text-muted-foreground/30" />
    </div>
  {/if}

  <!-- Content -->
  <div class="p-4">
    <!-- Header -->
    <div class="mb-3">
      <h3 class="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
        {resource.name}
      </h3>
      {#if resource.description}
        <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>
      {/if}
    </div>

    <!-- Category Badge -->
    <div class="mb-3">
      <Badge class="border px-3 py-1 {categoryColors[category] || categoryColors.prop}">
        {categoryLabels[category] || category}
      </Badge>
    </div>

    <!-- Meta Info -->
    <div class="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {#if resource.cost}
        <div class="flex items-center gap-1">
          <DollarSign class="size-3" />
          <span>{formatCurrencyFromCents(resource.cost)}</span>
        </div>
      {/if}

      {#if projectCount !== undefined && projectCount > 0}
        <div class="flex items-center gap-1">
          <LinkIcon class="size-3" />
          <span>Used in {projectCount} {projectCount === 1 ? 'project' : 'projects'}</span>
        </div>
      {/if}
    </div>

    <!-- Tags -->
    {#if resource.tags && resource.tags.length > 0}
      <div class="mt-3 flex flex-wrap gap-1">
        {#each resource.tags.slice(0, 3) as tag}
          <span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {tag}
          </span>
        {/each}
        {#if resource.tags.length > 3}
          <span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            +{resource.tags.length - 3}
          </span>
        {/if}
      </div>
    {/if}
  </div>
</div>







