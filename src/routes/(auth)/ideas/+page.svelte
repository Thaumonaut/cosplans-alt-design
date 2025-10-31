<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { ideas } from '$lib/stores/ideas'
  import { currentTeam } from '$lib/stores/teams'
  import { Button, Input } from '$lib/components/ui'
  import { Grid3x3, List, Plus, Search, Sparkles } from 'lucide-svelte'
  import IdeaCard from '$lib/components/cards/IdeaCard.svelte'
  import NewIdeaDrawer from '$lib/components/ideas/NewIdeaDrawer.svelte'
  import Fuse from 'fuse.js'
  import type { Idea } from '$lib/types/domain/idea'
  import { get } from 'svelte/store'

  let activeTab = $state<'grid' | 'list'>('grid')
  let showNewIdeaDrawer = $state(false)
  let searchQuery = $state('')
  let difficultyFilter = $state<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  // Load ideas on mount
  onMount(async () => {
    const team = get(currentTeam)
    if (team) {
      await ideas.load(team.id)
    }
  })

  // Reload when team changes
  $effect(() => {
    const team = get(currentTeam)
    if (team) {
      ideas.load(team.id)
    }
  })

  // Reactive filtered ideas with fuzzy search
  const filtered = $derived.by(() => {
    let items = $ideas.items

    // Filter by difficulty
    if (difficultyFilter !== 'all') {
      items = items.filter((i) => i.difficulty === difficultyFilter)
    }

    // Fuzzy search if query present
    if (searchQuery.trim()) {
      const fuse = new Fuse(items, {
        keys: ['character', 'series', 'tags'],
        threshold: 0.3, // Allows for typos
      })
      const results = fuse.search(searchQuery)
      return results.map((r: { item: typeof items[0] }) => r.item)
    }

    return items
  })

  const difficultyCounts = $derived({
    all: $ideas.items.length,
    beginner: $ideas.items.filter((i) => i.difficulty === 'beginner').length,
    intermediate: $ideas.items.filter((i) => i.difficulty === 'intermediate').length,
    advanced: $ideas.items.filter((i) => i.difficulty === 'advanced').length,
  })
</script>

<svelte:head>
  <title>Ideas - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">Cosplay Ideas</h1>
    <p class="text-pretty text-gray-600 dark:text-gray-400">
      Your inspiration board with {difficultyCounts.all} ideas waiting to come to life
    </p>
  </div>

  <!-- Filters & Actions -->
  <div class="mb-6 space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <Button
          variant={difficultyFilter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onclick={() => (difficultyFilter = 'all')}
        >
          All Ideas
          {#if difficultyCounts.all > 0}
            <span class="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
              {difficultyCounts.all}
            </span>
          {/if}
        </Button>
        <Button
          variant={difficultyFilter === 'beginner' ? 'default' : 'ghost'}
          size="sm"
          onclick={() => (difficultyFilter = 'beginner')}
        >
          Beginner
          {#if difficultyCounts.beginner > 0}
            <span class="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
              {difficultyCounts.beginner}
            </span>
          {/if}
        </Button>
        <Button
          variant={difficultyFilter === 'intermediate' ? 'default' : 'ghost'}
          size="sm"
          onclick={() => (difficultyFilter = 'intermediate')}
        >
          Intermediate
          {#if difficultyCounts.intermediate > 0}
            <span class="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
              {difficultyCounts.intermediate}
            </span>
          {/if}
        </Button>
        <Button
          variant={difficultyFilter === 'advanced' ? 'default' : 'ghost'}
          size="sm"
          onclick={() => (difficultyFilter = 'advanced')}
        >
          Advanced
          {#if difficultyCounts.advanced > 0}
            <span class="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
              {difficultyCounts.advanced}
            </span>
          {/if}
        </Button>
      </div>
      <div class="flex items-center gap-2">
        <Button size="sm" onclick={() => (showNewIdeaDrawer = true)}>
          <Plus class="mr-2 size-4" />
          New Idea
        </Button>
        <div class="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-[3px]">
          <button
            onclick={() => (activeTab = 'grid')}
            class="inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium transition-all {activeTab ===
              'grid'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm border-gray-200 dark:border-gray-600'
                : 'text-gray-700 dark:text-gray-400'}"
          >
            <Grid3x3 class="size-4" />
          </button>
          <button
            onclick={() => (activeTab = 'list')}
            class="inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium transition-all {activeTab ===
              'list'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm border-gray-200 dark:border-gray-600'
                : 'text-gray-700 dark:text-gray-400'}"
          >
            <List class="size-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        bind:value={searchQuery}
        placeholder="Search ideas by character, series, or tags..."
        class="w-full pl-9"
      />
    </div>
  </div>

  <!-- Ideas Grid/List -->
  {#if $ideas.loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p class="text-sm text-muted-foreground">Loading ideas...</p>
      </div>
    </div>
  {:else if $ideas.error}
    <div class="rounded-lg border border-destructive bg-destructive/10 p-4">
      <p class="text-sm text-destructive">{$ideas.error}</p>
    </div>
  {:else if filtered.length === 0}
    <div class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16">
      <Sparkles class="mb-4 size-12 text-muted-foreground opacity-50" />
      <h3 class="mb-2 text-lg font-semibold">No ideas found</h3>
      <p class="mb-6 text-center text-sm text-muted-foreground max-w-md">
        {#if searchQuery.trim() || difficultyFilter !== 'all'}
          Try adjusting your search or filters to find what you're looking for.
        {:else}
          Get started by creating your first idea. Capture inspiration and convert to projects when ready.
        {/if}
      </p>
      <Button onclick={() => (showNewIdeaDrawer = true)}>
        <Plus class="mr-2 size-4" />
        Create First Idea
      </Button>
    </div>
  {:else}
    {#if activeTab === 'grid'}
      <div class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {#each filtered as idea (idea.id)}
            <IdeaCard idea={idea} onclick={() => goto(`/ideas/${idea.id}`)} />
          {/each}
        </div>
      </div>
    {:else}
      <div class="space-y-4">
        {#each filtered as idea (idea.id)}
          <IdeaCard idea={idea} variant="list" onclick={() => goto(`/ideas/${idea.id}`)} />
        {/each}
      </div>
    {/if}
  {/if}
</div>

<NewIdeaDrawer
  bind:open={showNewIdeaDrawer}
  onClose={() => (showNewIdeaDrawer = false)}
  onSuccess={async (ideaId: string) => {
    showNewIdeaDrawer = false
    // Reload ideas to show the new one
    const team = get(currentTeam)
    if (team) {
      await ideas.load(team.id)
    }
    goto(`/ideas/${ideaId}`)
  }}
/>
