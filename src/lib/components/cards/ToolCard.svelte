<script lang="ts">
  import type { Tool } from '$lib/types/domain/tool'
  import { Badge } from 'flowbite-svelte'
  import { Wrench, Camera } from 'lucide-svelte'
  import { cn } from '$lib/utils'

  interface Props {
    tool: Tool
    onclick?: () => void
  }

  let { tool, onclick }: Props = $props()

  const categoryLabels: Record<string, string> = {
    'crafting-tool': 'Crafting Tool',
    'shoot-equipment': 'Shoot Equipment',
  }

  const categoryColors: Record<string, string> = {
    'crafting-tool': 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    'shoot-equipment': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
  }

  const categoryIcon: Record<string, any> = {
    'crafting-tool': Wrench,
    'shoot-equipment': Camera,
  }

  const category = tool.metadata?.category || 'crafting-tool'
  const Icon = categoryIcon[category] || Wrench
</script>

<div
  role="button"
  tabindex="0"
  onclick={onclick}
  onkeydown={(e) => e.key === 'Enter' && onclick?.()}
  class="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
>
  <!-- Cover Image -->
  {#if tool.images && tool.images.length > 0}
    <div class="aspect-video w-full overflow-hidden bg-muted">
      <img
        src={tool.images[0]}
        alt={tool.name}
        class="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
    </div>
  {:else}
    <div class="aspect-video w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
      <Icon class="size-12 text-muted-foreground/30" />
    </div>
  {/if}

  <!-- Content -->
  <div class="p-4">
    <!-- Header -->
    <div class="mb-3">
      <h3 class="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
        {tool.name}
      </h3>
      {#if tool.description}
        <p class="mt-1 line-clamp-2 text-sm text-muted-foreground">{tool.description}</p>
      {/if}
    </div>

    <!-- Category Badge -->
    <div class="mb-3">
      <Badge class="border px-3 py-1 {categoryColors[category] || categoryColors['crafting-tool']}">
        {categoryLabels[category] || category}
      </Badge>
    </div>

    <!-- Meta Info -->
    <div class="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {#if tool.metadata.category === 'crafting-tool' && tool.metadata.brand}
        <div class="flex items-center gap-1">
          <span>Brand: {tool.metadata.brand}</span>
        </div>
      {/if}
      
      {#if tool.metadata.category === 'shoot-equipment'}
        <div class="flex items-center gap-1">
          <span>{tool.metadata.owned ? 'Owned' : 'Rental'}</span>
        </div>
      {/if}
    </div>

    <!-- Tags -->
    {#if tool.tags && tool.tags.length > 0}
      <div class="mt-3 flex flex-wrap gap-1">
        {#each tool.tags.slice(0, 3) as tag}
          <span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {tag}
          </span>
        {/each}
        {#if tool.tags.length > 3}
          <span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            +{tool.tags.length - 3}
          </span>
        {/if}
      </div>
    {/if}
  </div>
</div>


