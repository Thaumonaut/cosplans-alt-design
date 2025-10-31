<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { Button } from '$lib/components/ui'
  import { Grid3x3, List, Plus, Upload } from 'lucide-svelte'
  import IdeaCard from '$lib/components/cards/IdeaCard.svelte'
  import NewIdeaDrawer from '$lib/components/ideas/NewIdeaDrawer.svelte'

  let activeTab = $state<'grid' | 'list'>('grid')
  let showNewIdeaDrawer = $state(false)

  // Mock data matching React app exactly
  const ideas = [
    {
      id: 1,
      character: 'Malenia, Blade of Miquella',
      series: 'Elden Ring',
      image: '/fantasy-warrior-armor-red-hair.jpg',
      difficulty: 'hard' as const,
      estimatedCost: 800,
      estimatedTime: '3-4 months',
      tags: ['armor', 'fantasy', 'prosthetic'],
      notes: 'Complex armor build with prosthetic arm. Need to research EVA foam techniques.',
      inspiration: ['Pinterest board', 'Cosplay tutorial by XYZ'],
      dateAdded: '2025-01-15',
    },
    {
      id: 2,
      character: 'Raiden Shogun',
      series: 'Genshin Impact',
      image: '/anime-character-purple-kimono.jpg',
      difficulty: 'medium' as const,
      estimatedCost: 600,
      estimatedTime: '2-3 months',
      tags: ['kimono', 'anime', 'wig styling'],
      notes: 'Beautiful kimono design. Focus on fabric choice and embroidery details.',
      inspiration: ['Official art', 'Cosplay reference photos'],
      dateAdded: '2025-01-20',
    },
    {
      id: 3,
      character: 'V (Female)',
      series: 'Cyberpunk 2077',
      image: '/cyberpunk-character-neon-jacket.jpg',
      difficulty: 'easy' as const,
      estimatedCost: 500,
      estimatedTime: '1-2 months',
      tags: ['cyberpunk', 'modern', 'LED'],
      notes: 'Mostly clothing-based. Could add LED accents for extra flair.',
      inspiration: ['Game screenshots', 'Cyberpunk fashion'],
      dateAdded: '2025-02-01',
    },
    {
      id: 4,
      character: 'Jinx',
      series: 'Arcane / League of Legends',
      image: '/jinx-arcane-blue-hair-twin-braids.jpg',
      difficulty: 'medium' as const,
      estimatedCost: 450,
      estimatedTime: '2 months',
      tags: ['anime', 'wig styling', 'props'],
      notes: 'Love the character development in Arcane. Need to make Pow-Pow and Fishbones.',
      inspiration: ['Arcane series', 'LoL splash art'],
      dateAdded: '2025-02-10',
    },
  ]
</script>

<svelte:head>
  <title>Ideas - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">Cosplay Ideas</h1>
    <p class="text-pretty text-gray-600 dark:text-gray-400">
      Your inspiration board with {ideas.length} ideas waiting to come to life
    </p>
  </div>

  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <Button variant="outline" size="sm">All Ideas</Button>
        <Button variant="ghost" size="sm">Easy</Button>
        <Button variant="ghost" size="sm">Medium</Button>
        <Button variant="ghost" size="sm">Hard</Button>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" class="!p-2">
          <Upload class="size-5" />
        </Button>
        <Button size="sm" onclick={() => (showNewIdeaDrawer = true)} class="!p-2">
          <Plus class="size-5" />
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

    {#if activeTab === 'grid'}
      <div class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {#each ideas as idea}
            <IdeaCard {...idea} />
          {/each}
        </div>
      </div>
    {:else}
      <div class="space-y-4">
        {#each ideas as idea}
          <IdeaCard {...idea} variant="list" />
        {/each}
      </div>
    {/if}
  </div>
</div>

<NewIdeaDrawer
  bind:open={showNewIdeaDrawer}
  onClose={() => (showNewIdeaDrawer = false)}
  onSuccess={(ideaId: string) => {
    showNewIdeaDrawer = false
    goto(`/ideas/${ideaId}`)
  }}
/>
