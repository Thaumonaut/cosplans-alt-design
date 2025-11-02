<script lang="ts">
  import { onMount } from 'svelte'
  import { cn } from '$lib/utils'
  import { Plus, Search, X } from 'lucide-svelte'
  import { resourceService } from '$lib/api/services/resourceService'
  import type { Resource } from '$lib/types/domain/resource'
  
  interface Props {
    value?: string | string[] // Support both single string and array
    onSave: (value: string | string[] | undefined) => void | Promise<void>
    placeholder?: string
    editable?: boolean
    multiple?: boolean // Allow multiple selections
  }
  
  let { value, onSave, placeholder = 'Select or create material...', editable = true, multiple = true }: Props = $props()
  
  // Normalize value to array format for easier handling
  const materialsArray = $derived(
    value === undefined || value === null || value === '' 
      ? [] 
      : Array.isArray(value) 
        ? value.filter(m => m && m.trim())
        : [value].filter(m => m && m.trim())
  )
  
  let isOpen = $state(false)
  let searchValue = $state('')
  let selectorRef: HTMLDivElement
  let inputRef = $state<HTMLInputElement | null>(null)
  let availableMaterials = $state<string[]>([])
  let loading = $state(false)
  
  // Store recent materials in localStorage
  const RECENT_MATERIALS_KEY = 'cosplay-tracker-recent-materials'
  
  function getRecentMaterials(): string[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(RECENT_MATERIALS_KEY)
    return stored ? JSON.parse(stored) : []
  }
  
  function saveRecentMaterial(material: string) {
    if (typeof window === 'undefined') return
    const recent = getRecentMaterials()
    const updated = [material, ...recent.filter(m => m !== material)].slice(0, 20) // Keep 20 most recent
    localStorage.setItem(RECENT_MATERIALS_KEY, JSON.stringify(updated))
  }
  
  async function loadMaterials() {
    try {
      loading = true
      const resources = await resourceService.list()
      
      // Extract materials from all resources
      const materials = new Set<string>()
      
      resources.forEach((resource: Resource) => {
        const metadata = resource.metadata as any
        
        // Check material field (for props, costume-pieces, accessories)
        if (metadata?.material) {
          if (typeof metadata.material === 'string') {
            materials.add(metadata.material.trim())
          } else if (Array.isArray(metadata.material)) {
            metadata.material.forEach((m: string) => {
              if (m && typeof m === 'string') materials.add(m.trim())
            })
          }
        }
        
        // Check materialType field (for material category resources)
        if (metadata?.materialType) {
          if (typeof metadata.materialType === 'string') {
            materials.add(metadata.materialType.trim())
          } else if (Array.isArray(metadata.materialType)) {
            metadata.materialType.forEach((m: string) => {
              if (m && typeof m === 'string') materials.add(m.trim())
            })
          }
        }
      })
      
      availableMaterials = Array.from(materials).sort()
    } catch (err) {
      console.error('Failed to load materials:', err)
      availableMaterials = []
    } finally {
      loading = false
    }
  }
  
  onMount(() => {
    loadMaterials()
  })
  
  let recentMaterials = $state(getRecentMaterials())
  
  const allMaterials = $derived([...new Set([...availableMaterials, ...recentMaterials])].sort())
  
  // Filter out already selected materials from the dropdown
  const filteredMaterials = $derived(
    searchValue
      ? allMaterials.filter(material => 
          material.toLowerCase().includes(searchValue.toLowerCase()) &&
          !materialsArray.some(m => m.toLowerCase() === material.toLowerCase())
        )
      : allMaterials.filter(material =>
          !materialsArray.some(m => m.toLowerCase() === material.toLowerCase())
        )
  )
  
  function toggleOpen() {
    if (!editable) return
    isOpen = !isOpen
    if (isOpen) {
      recentMaterials = getRecentMaterials()
      loadMaterials()
      setTimeout(() => inputRef?.focus(), 50)
    } else {
      searchValue = ''
    }
  }
  
  async function handleAddMaterial(material: string) {
    if (!material.trim()) return
    
    const trimmed = material.trim()
    const lowerTrimmed = trimmed.toLowerCase()
    
    // Don't add if already in the list
    if (materialsArray.some(m => m.toLowerCase() === lowerTrimmed)) {
      return
    }
    
    if (multiple) {
      // Add to array
      const updated = [...materialsArray, trimmed]
      await onSave(updated)
    } else {
      // Single selection
      await onSave(trimmed)
      isOpen = false
    }
    
    saveRecentMaterial(trimmed)
    recentMaterials = getRecentMaterials()
    searchValue = ''
    
    if (!multiple) {
      isOpen = false
    }
  }
  
  async function handleRemoveMaterial(material: string) {
    if (!multiple) {
      await onSave(undefined)
      return
    }
    
    const updated = materialsArray.filter(m => m !== material)
    await onSave(updated.length > 0 ? updated : undefined)
  }
  
  async function handleCreateNew() {
    if (!searchValue.trim()) return
    await handleAddMaterial(searchValue)
  }
  
  async function handleClear() {
    await onSave(undefined)
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && searchValue.trim()) {
      e.preventDefault()
      handleCreateNew()
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

<div bind:this={selectorRef} class="relative w-full">
  {#if materialsArray.length > 0}
    <!-- Display selected materials as badges -->
    <div class="flex flex-wrap items-center gap-2">
      {#each materialsArray as material}
        <div class="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
          <span>{material}</span>
          {#if editable}
            <button
              type="button"
              onclick={(e) => {
                e.stopPropagation()
                handleRemoveMaterial(material)
              }}
              class="rounded p-0.5 hover:bg-interactive-hover"
              aria-label="Remove {material}"
            >
              <X class="size-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          {/if}
        </div>
      {/each}
      {#if editable}
        <button
          type="button"
          onclick={toggleOpen}
          class="inline-flex items-center gap-1.5 rounded-md border border-dashed border-muted-foreground/30 bg-transparent px-2 py-2 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
        >
          <Plus class="size-3.5" />
          <span>{multiple ? 'Add material' : 'Change'}</span>
        </button>
      {/if}
    </div>
  {:else}
    <!-- Empty state - show selector button -->
    <button
      type="button"
      onclick={toggleOpen}
      class="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-muted-foreground/30 bg-transparent px-3 py-2 text-sm text-muted-foreground transition-all hover:border-primary/50 hover:text-primary {editable ? 'cursor-pointer' : 'cursor-default'}"
      disabled={!editable}
    >
      <Plus class="size-4" />
      <span>{placeholder}</span>
    </button>
  {/if}
  
  {#if isOpen}
    <div
      class="absolute top-full left-0 z-50 mt-1 w-full min-w-[280px] rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
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
            placeholder="Search or create material..."
            class="w-full rounded-sm border-0 bg-transparent py-2 pl-8 pr-2 text-sm outline-none focus:ring-0"
          />
        </div>
      </div>
      
      <!-- Material List -->
      <div class="max-h-64 overflow-y-auto p-1">
        {#if loading}
          <div class="px-3 py-4 text-center text-xs text-muted-foreground">
            Loading materials...
          </div>
        {:else if searchValue && !filteredMaterials.some(m => m.toLowerCase() === searchValue.toLowerCase())}
          <!-- Create new material option -->
          <button
            type="button"
            onclick={handleCreateNew}
            class="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-interactive-hover hover:text-foreground"
          >
            <Plus class="size-3.5" />
            <span>Create "<span class="font-medium">{searchValue}</span>"</span>
          </button>
        {/if}
        
        {#if filteredMaterials.length > 0}
          {#if searchValue}
            <div class="px-3 py-1 text-xs font-medium text-muted-foreground">
              {#if availableMaterials.some(m => m.toLowerCase().includes(searchValue.toLowerCase()))}
                Available materials
              {:else}
                Recent materials
              {/if}
            </div>
          {:else}
            <div class="px-3 py-1 text-xs font-medium text-muted-foreground">
              Materials
            </div>
          {/if}
          {#each filteredMaterials as material}
            <button
              type="button"
              onclick={() => handleAddMaterial(material)}
              class="flex w-full items-center rounded-sm px-3 py-2 text-sm transition-colors hover:bg-interactive-hover hover:text-foreground"
            >
              {material}
            </button>
          {/each}
        {:else if !searchValue && !loading && materialsArray.length === 0}
          <div class="px-3 py-8 text-center text-xs text-muted-foreground">
            No materials found.<br />Start typing to create one.
          </div>
        {:else if !searchValue && !loading && materialsArray.length > 0}
          <div class="px-3 py-8 text-center text-xs text-muted-foreground">
            All materials selected.<br />Start typing to create a new one.
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
