<script lang="ts">
  import { Card, Badge, Button } from 'flowbite-svelte'
  import { Calendar, DollarSign, Clock, ArrowRight, Star } from 'lucide-svelte'

  interface Props {
    character: string
    series: string
    image: string
    difficulty: 'easy' | 'medium' | 'hard'
    estimatedCost: number
    estimatedTime: string
    tags: string[]
    notes: string
    dateAdded: string
    variant?: 'grid' | 'list'
  }

  let {
    character,
    series,
    image,
    difficulty,
    estimatedCost,
    estimatedTime,
    tags,
    notes,
    dateAdded,
    variant = 'grid',
  }: Props = $props()

  const difficultyColors = {
    easy: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    hard: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  }
</script>

{#if variant === 'list'}
  <Card class="group overflow-hidden transition-all hover:shadow-md">
    <div class="flex gap-4 p-4">
      <div class="relative size-32 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        {#if image}
          <img src={image} alt={character} class="size-full object-cover" />
        {:else}
          <div class="size-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <span class="text-gray-400 dark:text-gray-500 text-xs">No image</span>
          </div>
        {/if}
      </div>
      <div class="flex flex-1 flex-col justify-between">
        <div>
          <div class="mb-2 flex items-start justify-between">
            <div>
              <h3 class="text-balance font-semibold leading-tight">{character}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{series}</p>
            </div>
            <Badge class={difficultyColors[difficulty]}>{difficulty}</Badge>
          </div>
          <p class="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{notes}</p>
          <div class="flex flex-wrap gap-1.5">
            {#each tags.slice(0, 3) as tag}
              <Badge variant="outline" class="text-xs">{tag}</Badge>
            {/each}
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <div class="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center gap-1.5">
              <DollarSign class="size-4" />
              <span>${estimatedCost}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Clock class="size-4" />
              <span>{estimatedTime}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Calendar class="size-4" />
              <span>{new Date(dateAdded).toLocaleDateString()}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <Button color="light" size="sm" class="!p-2">
              <Star class="size-4" />
            </Button>
            <Button size="sm">
              Start Planning
              <ArrowRight class="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Card>
{:else}
  <Card class="group overflow-hidden transition-all hover:shadow-lg">
    <div class="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-t-lg">
      {#if image}
        <img
          src={image}
          alt={character}
          class="size-full object-cover transition-transform group-hover:scale-105"
        />
      {:else}
        <div class="size-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span class="text-gray-400 dark:text-gray-500 text-sm">No image</span>
        </div>
      {/if}
      <div class="absolute right-3 top-3 flex gap-2">
        <Badge class={difficultyColors[difficulty]}>{difficulty}</Badge>
      </div>
      <Button
        color="light"
        size="sm"
        class="absolute left-3 top-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:bg-white dark:hover:bg-gray-800 !p-2"
      >
        <Star class="size-4" />
      </Button>
    </div>
    <div class="p-4">
      <div class="space-y-3">
        <div>
          <h3 class="text-balance font-semibold leading-tight">{character}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">{series}</p>
        </div>

        <p class="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{notes}</p>

        <div class="flex flex-wrap gap-1.5">
          {#each tags.slice(0, 3) as tag}
            <Badge variant="outline" class="text-xs">{tag}</Badge>
          {/each}
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-3 border-t bg-gray-50 dark:bg-gray-900 p-4">
      <div class="flex w-full items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-center gap-1.5">
          <DollarSign class="size-4" />
          <span>${estimatedCost}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <Clock class="size-4" />
          <span>{estimatedTime}</span>
        </div>
      </div>
      <Button class="w-full" size="sm">
        Start Planning
        <ArrowRight class="ml-2 size-4" />
      </Button>
    </div>
  </Card>
{/if}
