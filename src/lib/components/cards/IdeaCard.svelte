<script lang="ts">
  import { Card, Button } from 'flowbite-svelte'
  import { Badge } from '$lib/components/ui'
  import { Calendar, DollarSign, Clock, ArrowRight, Star } from 'lucide-svelte'
  import type { Idea } from '$lib/types/domain/idea'
  import { formatCurrencyFromCents } from '$lib/utils'

  interface Props {
    idea: Idea
    variant?: 'grid' | 'list'
    onclick?: () => void
  }

  let { idea, variant = 'grid', onclick }: Props = $props()

  const character = $derived(idea.character)
  const series = $derived(idea.series)
  const image = $derived(idea.images?.[0] || '')
  const difficulty = $derived(idea.difficulty === 'beginner' ? 'easy' : idea.difficulty === 'intermediate' ? 'medium' : 'hard')
  const isFavorite = $derived(false) // TODO: Add favorite field to Idea type when implementing favorite functionality
  
  async function handleFavoriteToggle(e: MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    // TODO: Implement favorite toggle when favorite field is added to Idea type
    // For now, this prevents the flyout from opening
    console.log('Favorite toggle - to be implemented')
  }
  
  // Track image loading state
  let imageError = $state(false)
  let imageLoaded = $state(false)
  
  // Reset state when image changes
  $effect(() => {
    if (image) {
      imageError = false
      imageLoaded = false
    }
  })
  
  // Helper to check if URL is a blob URL (these are temporary and may become invalid)
  const isBlobUrl = $derived(() => {
    return image && image.startsWith('blob:')
  })
  const estimatedCost = $derived(idea.estimatedCost || 0)
  const estimatedTime = $derived('') // Not in Idea type
  const tags = $derived(idea.tags || [])
  const notes = $derived(idea.description || idea.notes || '')
  const dateAdded = $derived(idea.createdAt)

  const difficultyColors = {
    easy: '!bg-[var(--theme-success)] !text-white shadow-lg border-transparent',
    medium: '!bg-[var(--theme-warning)] !text-white shadow-lg border-transparent',
    hard: '!bg-[var(--theme-error)] !text-white shadow-lg border-transparent',
  }

  const difficultyStyle = $derived((d: string) => {
    const colorVar = d === 'easy' ? '--theme-success' : d === 'medium' ? '--theme-warning' : '--theme-error'
    return `background-color: var(${colorVar}) !important; color: white !important;`
  })
  
  const difficultyBadgeClass = $derived((d: string) => {
    const baseClasses = difficultyColors[d as keyof typeof difficultyColors] || difficultyColors.easy
    const bgClass = d === 'easy' ? '!bg-[var(--theme-success)]' : d === 'medium' ? '!bg-[var(--theme-warning)]' : '!bg-[var(--theme-error)]'
    return `${baseClasses} ${bgClass}`
  })
</script>

{#if variant === 'list'}
  <Card 
    class="group overflow-hidden transition-all hover:shadow-md cursor-pointer bg-[var(--theme-card-bg)]" 
    onclick={onclick}
    role="button"
    tabindex={0}
    onkeydown={(e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onclick?.()
      }
    }}
  >
    <div class="flex gap-4 p-4">
      <div class="relative size-32 shrink-0 overflow-hidden rounded-lg bg-[var(--theme-section-bg)]">
        {#if image && !imageError}
          <img 
            src={image} 
            alt={character} 
            class="size-full object-cover"
            onload={() => {
              imageLoaded = true
              imageError = false
            }}
            onerror={(e) => {
              imageError = true
              imageLoaded = false
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
            }}
          />
        {/if}
        {#if (!image || imageError)}
          <div class="absolute inset-0 size-full bg-[var(--theme-input-bg)] flex flex-col items-center justify-center">
            {#if isBlobUrl()}
              <svg class="mb-1 size-8 text-[var(--theme-muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span class="text-xs text-[var(--theme-muted-foreground)] text-center px-1">Unavailable</span>
            {:else}
              <span class="text-[var(--theme-muted-foreground)] text-xs">No image</span>
            {/if}
          </div>
        {/if}
      </div>
      <div class="flex flex-1 flex-col justify-between">
        <div>
          <div class="mb-2 flex items-start justify-between">
            <div>
              <h3 class="text-balance font-semibold leading-tight text-[var(--theme-foreground)]">{character}</h3>
              <p class="text-sm text-[var(--theme-muted-foreground)]">{series}</p>
            </div>
            <Badge variant="default" class={difficultyBadgeClass(difficulty)} style={difficultyStyle(difficulty)}>{difficulty}</Badge>
          </div>
          <p class="mb-3 line-clamp-2 text-sm text-[var(--theme-muted-foreground)]">{notes}</p>
          <div class="flex flex-wrap gap-1.5">
            {#each tags.slice(0, 3) as tag}
              <Badge variant="outline" class="text-xs">{tag}</Badge>
            {/each}
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <div class="flex gap-4 text-sm text-[var(--theme-muted-foreground)]">
            <div class="flex items-center gap-1.5">
              <DollarSign class="size-4" />
              <span>{formatCurrencyFromCents(estimatedCost)}</span>
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
            <Button 
              color="light" 
              size="sm" 
              class="!p-2"
              onclick={handleFavoriteToggle}
              onkeydown={(e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  handleFavoriteToggle(e as any)
                }
              }}
            >
              <Star class="size-4 transition-colors {isFavorite ? 'fill text-[var(--theme-primary)]' : ''}" />
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
  <Card 
    class="group overflow-hidden transition-all hover:shadow-lg cursor-pointer bg-[var(--theme-card-bg)]" 
    onclick={onclick}
    role="button"
    tabindex={0}
    onkeydown={(e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onclick?.()
      }
    }}
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-[var(--theme-input-bg)] rounded-t-lg">
      {#if image && !imageError}
        <img
          src={image}
          alt={character}
          class="size-full object-cover transition-transform group-hover:scale-105"
          onload={() => {
            imageLoaded = true
            imageError = false
          }}
          onerror={(e) => {
            // If image fails to load (e.g., invalid blob URL), mark as error
            imageError = true
            imageLoaded = false
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
          }}
        />
      {/if}
      {#if (!image || imageError)}
        <div class="absolute inset-0 size-full bg-[var(--theme-input-bg)] flex flex-col items-center justify-center">
          {#if isBlobUrl()}
            <svg class="mb-2 size-12 text-[var(--theme-muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span class="text-xs text-[var(--theme-muted-foreground)] text-center px-2">Image unavailable</span>
            <span class="text-xs text-[var(--theme-muted-foreground)] text-center px-2 mt-1">Please re-upload</span>
          {:else}
            <span class="text-[var(--theme-muted-foreground)] text-sm">No image</span>
          {/if}
        </div>
      {/if}
      <div class="absolute right-3 top-3 flex gap-2 z-10">
        <Badge variant="default" class={difficultyBadgeClass(difficulty)} style={difficultyStyle(difficulty)}>{difficulty}</Badge>
      </div>
      <Button
        color="light"
        size="sm"
        class="absolute left-3 top-3 bg-[var(--theme-card-bg)]/80 backdrop-blur hover:bg-[var(--theme-card-bg)] !p-2 z-10"
        onclick={handleFavoriteToggle}
        onkeydown={(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
            handleFavoriteToggle(e as any)
          }
        }}
      >
        <Star class="size-4 transition-colors {isFavorite ? 'fill text-[var(--theme-primary)]' : ''}" />
      </Button>
    </div>
    <div class="p-4 bg-[var(--theme-card-bg)]">
      <div class="space-y-3">
        <div>
          <h3 class="text-balance font-semibold leading-tight text-[var(--theme-foreground)]">{character}</h3>
          <p class="text-sm text-[var(--theme-muted-foreground)]">{series}</p>
        </div>

        <p class="line-clamp-2 text-sm text-[var(--theme-muted-foreground)]">{notes}</p>

        <div class="flex flex-wrap gap-1.5">
          {#each tags.slice(0, 3) as tag}
            <Badge variant="outline" class="text-xs">{tag}</Badge>
          {/each}
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-3 border-t bg-[var(--theme-section-bg)] p-4">
      <div class="flex w-full items-center justify-between text-sm text-[var(--theme-muted-foreground)]">
        <div class="flex items-center gap-1.5">
          <DollarSign class="size-4" />
          <span>${estimatedCost}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <Clock class="size-4" />
          <span>{estimatedTime}</span>
        </div>
      </div>
            <Button 
        class="w-full" 
        size="sm"
        onclick={(e: MouseEvent) => {
          e.stopPropagation()
          onclick?.()
        }}
      >
        Start Planning
        <ArrowRight class="ml-2 size-4" />
      </Button>
    </div>
  </Card>
{/if}
