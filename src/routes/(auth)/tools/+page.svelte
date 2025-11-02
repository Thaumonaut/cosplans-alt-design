<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { toolService } from '$lib/api/services/toolService'
  import { currentTeam } from '$lib/stores/teams'
  import { Button, Input } from '$lib/components/ui'
  import { Plus, Search, Wrench } from 'lucide-svelte'
  import ToolCard from '$lib/components/cards/ToolCard.svelte'
  import LoadingState from '$lib/components/base/LoadingState.svelte'
  import Fuse from 'fuse.js'
  import type { Tool, ToolCategory } from '$lib/types/domain/tool'

  let tools = $state<Tool[]>([])
  let loading = $state(true)
  let searchQuery = $state('')
  let categoryFilter = $state<ToolCategory | 'all'>('all')

  const categoryOptions: { value: ToolCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Tools' },
    { value: 'crafting-tool', label: 'Crafting Tools' },
    { value: 'shoot-equipment', label: 'Shoot Equipment' },
  ]

  // Load tools on mount
  onMount(async () => {
    await loadTools()
  })

  async function loadTools() {
    try {
      loading = true
      const filters = categoryFilter !== 'all' ? { category: categoryFilter } : undefined
      tools = await toolService.list(filters)
    } catch (err: any) {
      console.error('Failed to load tools:', err)
    } finally {
      loading = false
    }
  }

  // Reload when category filter changes
  $effect(() => {
    if ($currentTeam) {
      loadTools()
    }
  })

  // Reactive filtered tools
  const filtered = $derived.by(() => {
    let items = tools

    // Fuzzy search if query present
    if (searchQuery.trim()) {
      const fuse = new Fuse(items, {
        keys: ['name', 'tags', 'description'],
        threshold: 0.3, // Allows for typos
      })
      const results = fuse.search(searchQuery)
      return results.map((r: { item: typeof items[0] }) => r.item)
    }

    return items
  })

  function handleNewTool() {
    goto('/tools/new')
  }

  function handleToolClick(toolId: string) {
    goto(`/tools/${toolId}`)
  }

  const emptyMessage = $derived(
    searchQuery.trim() || categoryFilter !== 'all'
      ? "Try adjusting your search or filters to find what you're looking for."
      : 'Get started by creating your first tool. Track crafting tools and photoshoot equipment.'
  )

  const categoryCounts = $derived({
    all: tools.length,
    'crafting-tool': tools.filter((t) => t.metadata?.category === 'crafting-tool').length,
    'shoot-equipment': tools.filter((t) => t.metadata?.category === 'shoot-equipment').length,
  })
</script>

<svelte:head>
  <title>Tools - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">Tools & Equipment</h1>
    <p class="text-pretty text-gray-600 dark:text-gray-400">
      Manage crafting tools and photoshoot equipment • {categoryCounts.all} total
    </p>
  </div>

  <!-- Filters & Actions -->
  <div class="mb-6 space-y-4">
    <!-- Category Filter Tabs -->
    <div class="flex items-center justify-between">
      <div class="flex gap-2 overflow-x-auto pb-2">
        {#each categoryOptions as option}
          <Button
            variant={categoryFilter === option.value ? 'default' : 'ghost'}
            size="sm"
            onclick={() => {
              categoryFilter = option.value
            }}
          >
            {option.label}
            {#if categoryCounts[option.value as keyof typeof categoryCounts] > 0}
              <span class="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
                {categoryCounts[option.value as keyof typeof categoryCounts]}
              </span>
            {/if}
          </Button>
        {/each}
      </div>

      <Button onclick={handleNewTool}>
        <Plus class="mr-2 size-4" />
        New Tool
      </Button>
    </div>

    <!-- Search -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        bind:value={searchQuery}
        placeholder="Search tools by name, tags, or description..."
        class="w-full pl-9"
      />
    </div>
  </div>

  <!-- Tools Grid -->
  {#if loading}
    <LoadingState loading={true} />
  {:else if filtered.length === 0}
    <LoadingState
      empty={true}
      emptyIcon={Wrench}
      {emptyMessage}
      emptyAction={{
        label: 'Create First Tool',
        onclick: handleNewTool
      }}
    />
  {:else}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each filtered as tool (tool.id)}
        <ToolCard
          {tool}
          onclick={() => handleToolClick(tool.id)}
        />
      {/each}
    </div>
  {/if}
</div>
