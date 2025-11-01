<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { resourceService } from '$lib/api/services/resourceService'
  import { currentTeam } from '$lib/stores/teams'
  import { Button, Input } from '$lib/components/ui'
  import { Plus, Search, Package } from 'lucide-svelte'
  import ResourceCard from '$lib/components/cards/ResourceCard.svelte'
  import CreationFlyout from '$lib/components/ui/CreationFlyout.svelte'
  import ResourceDetail from '$lib/components/resources/ResourceDetail.svelte'
  import Fuse from 'fuse.js'
  import type { Resource, ResourceCategory } from '$lib/types/domain/resource'

  let resources = $state<Resource[]>([])
  let loading = $state(true)
  let searchQuery = $state('')
  let categoryFilter = $state<ResourceCategory | 'all'>('all')
  let showNewResourceFlyout = $state(false)
  let selectedResourceId = $state<string | null>(null)
  let showResourceDetailFlyout = $state(false)

  const categoryOptions: { value: ResourceCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'prop', label: 'Props' },
    { value: 'fabric', label: 'Fabric' },
    { value: 'wig', label: 'Wigs' },
    { value: 'pattern', label: 'Patterns' },
    { value: 'costume-piece', label: 'Costume Pieces' },
    { value: 'accessory', label: 'Accessories' },
    { value: 'material', label: 'Materials' },
  ]

  // Load resources on mount
  onMount(async () => {
    await loadResources()
  })

  async function loadResources() {
    try {
      loading = true
      const filters = categoryFilter !== 'all' ? { category: categoryFilter } : undefined
      resources = await resourceService.list(filters)
    } catch (err: any) {
      console.error('Failed to load resources:', err)
    } finally {
      loading = false
    }
  }

  // Reload when category filter changes
  $effect(() => {
    if ($currentTeam) {
      loadResources()
    }
  })

  // Reactive filtered resources
  const filtered = $derived.by(() => {
    let items = resources

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

  function handleNewResource() {
    selectedResourceId = null
    showNewResourceFlyout = true
  }

  function handleResourceClick(resourceId: string) {
    selectedResourceId = resourceId
    showResourceDetailFlyout = true
  }

  function handleResourceSuccess(resourceId: string) {
    showNewResourceFlyout = false
    loadResources()
    goto(`/resources/${resourceId}`)
  }

  function handleDetailClose() {
    showResourceDetailFlyout = false
    selectedResourceId = null
    loadResources()
  }

  const categoryCounts = $derived({
    all: resources.length,
    prop: resources.filter((r) => r.metadata?.category === 'prop').length,
    fabric: resources.filter((r) => r.metadata?.category === 'fabric').length,
    wig: resources.filter((r) => r.metadata?.category === 'wig').length,
    pattern: resources.filter((r) => r.metadata?.category === 'pattern').length,
    'costume-piece': resources.filter((r) => r.metadata?.category === 'costume-piece').length,
    accessory: resources.filter((r) => r.metadata?.category === 'accessory').length,
    material: resources.filter((r) => r.metadata?.category === 'material').length,
  })
</script>

<svelte:head>
  <title>Resources - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">Resource Library</h1>
    <p class="text-pretty text-gray-600 dark:text-gray-400">
      Manage reusable resources for your projects • {categoryCounts.all} total
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

      <Button onclick={handleNewResource}>
        <Plus class="mr-2 size-4" />
        New Resource
      </Button>
    </div>

    <!-- Search -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        bind:value={searchQuery}
        placeholder="Search resources by name, tags, or description..."
        class="w-full pl-9"
      />
    </div>
  </div>

  <!-- Resources Grid -->
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p class="text-sm text-muted-foreground">Loading resources...</p>
      </div>
    </div>
  {:else if filtered.length === 0}
    <div class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16">
      <Package class="mb-4 size-12 text-muted-foreground opacity-50" />
      <h3 class="mb-2 text-lg font-semibold">No resources found</h3>
      <p class="mb-6 text-center text-sm text-muted-foreground max-w-md">
        {#if searchQuery.trim() || categoryFilter !== 'all'}
          Try adjusting your search or filters to find what you're looking for.
        {:else}
          Get started by creating your first resource. Resources can be reused across multiple projects.
        {/if}
      </p>
      <Button onclick={handleNewResource}>
        <Plus class="mr-2 size-4" />
        Create First Resource
      </Button>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each filtered as resource (resource.id)}
        <ResourceCard
          {resource}
          onclick={() => handleResourceClick(resource.id)}
        />
      {/each}
    </div>
  {/if}
</div>

<!-- New Resource Flyout -->
<CreationFlyout bind:open={showNewResourceFlyout} title="New Resource">
  <ResourceDetail
    mode="create"
    isFlyout={true}
    onSuccess={handleResourceSuccess}
  />
</CreationFlyout>

<!-- Resource Detail Flyout -->
{#if showResourceDetailFlyout && selectedResourceId}
  <CreationFlyout bind:open={showResourceDetailFlyout} title="Resource Details">
    <ResourceDetail
      resourceId={selectedResourceId}
      mode="edit"
      isFlyout={true}
      onSuccess={() => handleDetailClose()}
    />
  </CreationFlyout>
{/if}

