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
    prop: 'bg-[color-mix(in_srgb,var(--theme-primary)_20%,transparent)] text-[var(--theme-primary)] border-[color-mix(in_srgb,var(--theme-primary)_30%,transparent)]',
    fabric: 'bg-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)] text-[var(--theme-accent)] border-[color-mix(in_srgb,var(--theme-accent)_30%,transparent)]',
    wig: 'bg-[color-mix(in_srgb,var(--theme-info)_20%,transparent)] text-[var(--theme-info)] border-[color-mix(in_srgb,var(--theme-info)_30%,transparent)]',
    pattern: 'bg-[color-mix(in_srgb,var(--theme-warning)_20%,transparent)] text-[var(--theme-warning)] border-[color-mix(in_srgb,var(--theme-warning)_30%,transparent)]',
    'costume-piece': 'bg-[color-mix(in_srgb,var(--theme-success)_20%,transparent)] text-[var(--theme-success)] border-[color-mix(in_srgb,var(--theme-success)_30%,transparent)]',
    accessory: 'bg-[color-mix(in_srgb,var(--theme-warning)_20%,transparent)] text-[var(--theme-warning)] border-[color-mix(in_srgb,var(--theme-warning)_30%,transparent)]',
    material: 'bg-[color-mix(in_srgb,var(--theme-sidebar-muted)_20%,transparent)] text-[var(--theme-sidebar-muted)] border-[color-mix(in_srgb,var(--theme-border)_30%,transparent)]',
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







