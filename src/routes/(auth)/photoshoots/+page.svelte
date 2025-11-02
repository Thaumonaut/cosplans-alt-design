<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { photoshootService } from '$lib/api/services/photoshootService'
  import { currentTeam } from '$lib/stores/teams'
  import { Button, Input } from '$lib/components/ui'
  import { Plus, Search, Camera, Filter } from 'lucide-svelte'
  import PhotoshootCard from '$lib/components/cards/PhotoshootCard.svelte'
  import PhotoshootDetail from '$lib/components/photoshoots/PhotoshootDetail.svelte'
  import CreationFlyout from '$lib/components/ui/CreationFlyout.svelte'
  import Fuse from 'fuse.js'
  import type { Photoshoot, PhotoshootStatus } from '$lib/types/domain/photoshoot'

  let photoshoots = $state<Photoshoot[]>([])
  let loading = $state(true)
  let searchQuery = $state('')
  let statusFilter = $state<PhotoshootStatus | 'all'>('all')
  let showNewPhotoshootFlyout = $state(false)
  let showPhotoshootDetailFlyout = $state(false)
  let selectedPhotoshootId = $state<string | null>(null)

  const statusOptions: { value: PhotoshootStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'planning', label: 'Planning' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
  ]

  // Load photoshoots on mount
  onMount(async () => {
    await loadPhotoshoots()
  })

  async function loadPhotoshoots() {
    try {
      loading = true
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined
      photoshoots = await photoshootService.list(filters)
    } catch (err: any) {
      console.error('Failed to load photoshoots:', err)
    } finally {
      loading = false
    }
  }

  // Reload when filter changes
  $effect(() => {
    if ($currentTeam) {
      loadPhotoshoots()
    }
  })

  // Reactive filtered photoshoots
  const filtered = $derived.by(() => {
    let items = photoshoots

    // Fuzzy search if query present
    if (searchQuery.trim()) {
      const fuse = new Fuse(items, {
        keys: ['title', 'location', 'description'],
        threshold: 0.3,
      })
      const results = fuse.search(searchQuery)
      return results.map((r: { item: typeof items[0] }) => r.item)
    }

    return items
  })

  // Sort by date (most recent first, null dates last)
  const sorted = $derived(() => {
    return [...filtered].sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  })

  function handleNewPhotoshoot() {
    selectedPhotoshootId = null
    showNewPhotoshootFlyout = true
  }

  function handlePhotoshootClick(photoshootId: string) {
    selectedPhotoshootId = photoshootId
    showPhotoshootDetailFlyout = true
  }

  async function handlePhotoshootSuccess(id: string) {
    // Reload photoshoots after create/update
    await loadPhotoshoots()
    // If creating, switch to detail view
    if (!selectedPhotoshootId && id) {
      selectedPhotoshootId = id
      showNewPhotoshootFlyout = false
      showPhotoshootDetailFlyout = true
    }
  }

  const statusCounts = $derived({
    all: photoshoots.length,
    planning: photoshoots.filter((p) => p.status === 'planning').length,
    scheduled: photoshoots.filter((p) => p.status === 'scheduled').length,
    completed: photoshoots.filter((p) => p.status === 'completed').length,
  })
</script>

<svelte:head>
  <title>Photoshoots - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">Photoshoots</h1>
    <p class="text-pretty text-[var(--theme-muted-foreground)]">
      Plan and track your cosplay photoshoots • {statusCounts.all} total
    </p>
  </div>

  <!-- Filters & Actions -->
  <div class="mb-6 space-y-4">
    <!-- Status Filter & Actions -->
    <div class="flex items-center justify-between">
      <div class="flex gap-2 overflow-x-auto pb-2">
        {#each statusOptions as option}
          <Button
            variant={statusFilter === option.value ? 'default' : 'ghost'}
            size="sm"
            onclick={() => {
              statusFilter = option.value
            }}
          >
            {option.label}
            {#if statusCounts[option.value as keyof typeof statusCounts] > 0}
              <span class="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
                {statusCounts[option.value as keyof typeof statusCounts]}
              </span>
            {/if}
          </Button>
        {/each}
      </div>

      <Button onclick={handleNewPhotoshoot}>
        <Plus class="mr-2 size-4" />
        New Photoshoot
      </Button>
    </div>

    <!-- Search -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        bind:value={searchQuery}
        placeholder="Search photoshoots by title, location, or description..."
        class="w-full pl-9"
      />
    </div>
  </div>

  <!-- Photoshoots List -->
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p class="text-sm text-[var(--theme-muted-foreground)]">Loading photoshoots...</p>
      </div>
    </div>
  {:else if sorted.length === 0}
    <div class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-[var(--theme-section-bg)] py-16">
      <Camera class="mb-4 size-12 text-[var(--theme-muted-foreground)] opacity-50" />
      <h3 class="mb-2 text-lg font-semibold text-[var(--theme-foreground)]">No photoshoots found</h3>
      <p class="mb-6 text-center text-sm text-[var(--theme-muted-foreground)] max-w-md">
        {#if searchQuery.trim() || statusFilter !== 'all'}
          Try adjusting your search or filters to find what you're looking for.
        {:else}
          Get started by creating your first photoshoot. Plan shots, manage crew, and track your cosplay photography.
        {/if}
      </p>
      <Button onclick={handleNewPhotoshoot}>
        <Plus class="mr-2 size-4" />
        Create First Photoshoot
      </Button>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each sorted() as photoshoot (photoshoot.id)}
        <PhotoshootCard
          photoshoot={photoshoot}
          onclick={() => handlePhotoshootClick(photoshoot.id)}
        />
      {/each}
    </div>
  {/if}
</div>

<!-- New Photoshoot Flyout -->
{#if showNewPhotoshootFlyout}
  <CreationFlyout 
    bind:open={showNewPhotoshootFlyout} 
    title="New Photoshoot"
    onFullScreen={() => {
      goto('/photoshoots/new')
      showNewPhotoshootFlyout = false
    }}
  >
    <PhotoshootDetail
      mode="create"
      isFlyout={true}
      onSuccess={handlePhotoshootSuccess}
    />
  </CreationFlyout>
{/if}

<!-- Photoshoot Detail Flyout -->
{#if showPhotoshootDetailFlyout && selectedPhotoshootId}
  <CreationFlyout 
    bind:open={showPhotoshootDetailFlyout} 
    title="Photoshoot"
    onFullScreen={() => {
      goto(`/photoshoots/${selectedPhotoshootId}`)
      showPhotoshootDetailFlyout = false
    }}
  >
    <PhotoshootDetail
      photoshootId={selectedPhotoshootId}
      mode="edit"
      isFlyout={true}
      onSuccess={handlePhotoshootSuccess}
    />
  </CreationFlyout>
{/if}
