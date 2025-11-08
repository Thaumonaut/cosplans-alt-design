<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { ideas } from '$lib/stores/ideas'
  import { currentTeam } from '$lib/stores/teams'
  import { Button, Input } from '$lib/components/ui'
  import { Grid3x3, List, Plus, Search, Sparkles } from 'lucide-svelte'
  import IdeaCard from '$lib/components/cards/IdeaCard.svelte'
  import NewIdeaDrawer from '$lib/components/ideas/NewIdeaDrawer.svelte'
  import IdeaDetail from '$lib/components/ideas/IdeaDetail.svelte'
  import CreationFlyout from '$lib/components/ui/CreationFlyout.svelte'
  import LoadingState from '$lib/components/base/LoadingState.svelte'
  import Fuse from 'fuse.js'
  import type { Idea } from '$lib/types/domain/idea'
  import { get } from 'svelte/store'

  let activeTab = $state<'grid' | 'list'>('grid')
  let showNewIdeaDrawer = $state(false)
  let showIdeaDetailFlyout = $state(false)
  let selectedIdeaId = $state<string | null>(null)
  let searchQuery = $state('')
  let difficultyFilter = $state<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  import type { PageData } from './$types'
  let { data }: { data: PageData } = $props()

  // Use data from +page.ts if available
  $effect(() => {
    if (data?.ideas && data.ideas.length > 0) {
      // Ideas were loaded in +page.ts, ensure store has them
      const currentIdeas = get(ideas)
      if (currentIdeas.items.length === 0) {
        const team = get(currentTeam)
        if (team) {
          ideas.load(team.id)
        }
      }
    }
  })

  // Load ideas on mount as fallback if not loaded from +page.ts
  onMount(async () => {
    // Only load if we don't already have data from load function
    if (!data?.ideas || data.ideas.length === 0) {
      const team = get(currentTeam)
      if (team) {
        await ideas.load(team.id)
      }
    }
  })

  // Reload when team changes
  $effect(() => {
    const team = get(currentTeam)
    if (team && (!data?.ideas || data.ideas.length === 0)) {
      ideas.load(team.id)
    }
  })

  // Computed empty message for LoadingState
  const emptyMessageText = $derived.by(() => {
    if (searchQuery.trim() || difficultyFilter !== 'all') {
      return "Try adjusting your search or filters to find what you're looking for."
    }
    return "Get started by creating your first idea. Capture inspiration and convert to projects when ready."
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
    <LoadingState loading={true} />
  {:else if $ideas.error}
    <LoadingState error={$ideas.error} onRetry={() => {
      const team = get(currentTeam)
      if (team) ideas.load(team.id)
    }} />
  {:else if filtered.length === 0}
    <LoadingState
      empty={true}
      emptyIcon={Sparkles}
      emptyMessage={emptyMessageText}
      emptyAction={{
        label: 'Create First Idea',
        onclick: () => (showNewIdeaDrawer = true)
      }}
    />
  {:else}
    {#if activeTab === 'grid'}
      <div class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {#each filtered as idea (idea.id)}
            <IdeaCard idea={idea} searchQuery={searchQuery.trim()} onclick={() => {
              selectedIdeaId = idea.id
              showIdeaDetailFlyout = true
            }} />
          {/each}
        </div>
      </div>
    {:else}
      <div class="space-y-4">
        {#each filtered as idea (idea.id)}
          <IdeaCard idea={idea} variant="list" searchQuery={searchQuery.trim()} onclick={() => {
            selectedIdeaId = idea.id
            showIdeaDetailFlyout = true
          }} />
        {/each}
      </div>
    {/if}
  {/if}
</div>

<!-- Idea Detail Flyout -->
{#if showIdeaDetailFlyout && selectedIdeaId}
  <CreationFlyout 
    bind:open={showIdeaDetailFlyout} 
    title="Idea Details"
    onFullScreen={() => {
      goto(`/ideas/${selectedIdeaId}`)
      showIdeaDetailFlyout = false
    }}
  >
    <IdeaDetail 
      ideaId={selectedIdeaId} 
      mode="edit" 
      isFlyout={true}
      onSuccess={(id: string) => {
        // If id is empty, idea was deleted - close flyout
        if (!id || id === '') {
          showIdeaDetailFlyout = false
          selectedIdeaId = null
          // Reload ideas list
          const team = get(currentTeam)
          if (team) {
            ideas.load(team.id)
          }
          return
        }
        
        showIdeaDetailFlyout = false
        
        // Check if this ID is a project (from conversion) by checking if it exists in projects
        // For now, assume if we're passed an ID and the flyout closes, it might be a conversion
        // The handleConvertToProject function passes the projectId directly
        // We'll check: if id !== selectedIdeaId, then it's likely a project ID from conversion
        const wasConversion = id !== selectedIdeaId
        
        if (wasConversion) {
          // This is a project ID from conversion, redirect to project page
          setTimeout(() => {
            goto(`/projects/${id}`)
          }, 100)
        } else {
          // This is an idea ID (from creation/update), reload ideas list
          const team = get(currentTeam)
          if (team) {
            ideas.load(team.id)
          }
        }
      }}
    />
  </CreationFlyout>
{/if}

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
