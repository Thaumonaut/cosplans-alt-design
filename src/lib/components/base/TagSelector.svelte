<script lang="ts">
  import { cn } from '$lib/utils'
  import { Plus, Search } from 'lucide-svelte'
  import { writable } from 'svelte/store'
  
  interface Props {
    onAddTag: (tag: string) => void
  }
  
  let { onAddTag }: Props = $props()
  
  let isOpen = $state(false)
  let searchValue = $state('')
  let selectorRef: HTMLDivElement
  let inputRef = $state<HTMLInputElement | null>(null)
  
  // Store recent tags in localStorage
  const RECENT_TAGS_KEY = 'cosplay-tracker-recent-tags'
  
  function getRecentTags(): string[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(RECENT_TAGS_KEY)
    return stored ? JSON.parse(stored) : []
  }
  
  function saveRecentTag(tag: string) {
    if (typeof window === 'undefined') return
    const recent = getRecentTags()
    const updated = [tag, ...recent.filter(t => t !== tag)].slice(0, 10) // Keep 10 most recent
    localStorage.setItem(RECENT_TAGS_KEY, JSON.stringify(updated))
  }
  
  let recentTags = $state(getRecentTags())
  
  const filteredTags = $derived(
    searchValue
      ? recentTags.filter(tag => tag.toLowerCase().includes(searchValue.toLowerCase()))
      : recentTags
  )
  
  function toggleOpen() {
    isOpen = !isOpen
    if (isOpen) {
      recentTags = getRecentTags()
      setTimeout(() => inputRef?.focus(), 50)
    } else {
      searchValue = ''
    }
  }
  
  function handleAddTag(tag: string) {
    if (!tag.trim()) return
    onAddTag(tag.trim())
    saveRecentTag(tag.trim())
    recentTags = getRecentTags()
    searchValue = ''
    isOpen = false
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && searchValue.trim()) {
      e.preventDefault()
      handleAddTag(searchValue)
    } else if (e.key === 'Escape') {
      isOpen = false
      searchValue = ''
    }
  }
  
  function handleClickOutside(event: MouseEvent) {
    if (selectorRef && !selectorRef.contains(event.target as Node)) {
      isOpen = false
      searchValue = ''
    }
  }
  
  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  })
</script>

<div bind:this={selectorRef} class="relative inline-block">
  <!-- Plus Button -->
  <button
    type="button"
    onclick={toggleOpen}
    class="inline-flex items-center gap-1.5 rounded-md border border-dashed border-muted-foreground/30 bg-transparent px-2 py-1 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
  >
    <Plus class="size-3.5" />
    <span>Add tag</span>
  </button>
  
  {#if isOpen}
    <div
      class="absolute top-full left-0 z-50 mt-1 w-64 rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
    >
      <!-- Search Input -->
      <div class="border-b p-2">
        <div class="relative">
          <Search class="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            bind:this={inputRef}
            bind:value={searchValue}
            onkeydown={handleKeydown}
            type="text"
            placeholder="Search or create tag..."
            class="w-full rounded-sm border-0 bg-transparent py-2 pl-8 pr-2 text-sm outline-none focus:ring-0"
          />
        </div>
      </div>
      
      <!-- Tag List -->
      <div class="max-h-48 overflow-y-auto p-1">
        {#if searchValue && !filteredTags.some(t => t.toLowerCase() === searchValue.toLowerCase())}
          <!-- Create new tag option -->
          <button
            type="button"
            onclick={() => handleAddTag(searchValue)}
            class="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-interactive-hover hover:text-foreground"
          >
            <Plus class="size-3.5" />
            <span>Create "<span class="font-medium">{searchValue}</span>"</span>
          </button>
        {/if}
        
        {#if filteredTags.length > 0}
          {#if searchValue}
            <div class="px-3 py-1 text-xs font-medium text-muted-foreground">Recent tags</div>
          {/if}
          {#each filteredTags as tag}
            <button
              type="button"
              onclick={() => handleAddTag(tag)}
              class="flex w-full items-center rounded-sm px-3 py-2 text-sm transition-colors hover:bg-interactive-hover hover:text-foreground"
            >
              {tag}
            </button>
          {/each}
        {:else if !searchValue}
          <div class="px-3 py-8 text-center text-xs text-muted-foreground">
            No recent tags.<br />Start typing to create one.
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

