<script lang="ts">
  import { onMount } from 'svelte'
  import { Card, CardContent } from '$lib/components/ui'
  import { Button, Input } from '$lib/components/ui'
  import { Search, Plus, X, Link as LinkIcon } from 'lucide-svelte'
  import { resourceService } from '$lib/api/services/resourceService'
  import { projectService } from '$lib/api/services/projectService'
  import ResourceDetail from '$lib/components/resources/ResourceDetail.svelte'
  import CreationFlyout from '$lib/components/ui/CreationFlyout.svelte'
  import Fuse from 'fuse.js'
  import type { Resource, ResourceCategory } from '$lib/types/domain/resource'
  import Select from '$lib/components/ui/select.svelte'

  interface Props {
    projectId: string
    onSuccess?: () => void
    onCancel?: () => void
  }

  let { projectId, onSuccess, onCancel }: Props = $props()

  let availableResources = $state<Resource[]>([])
  let searchQuery = $state('')
  let selectedResourceId = $state<string | null>(null)
  let quantity = $state(1)
  let status = $state<'needed' | 'acquired' | 'in-progress' | 'completed'>('needed')
  let loading = $state(false)
  let saving = $state(false)
  let error = $state<string | null>(null)
  let showCreateForm = $state(false)
  let resourceDetailRef: any = $state(null)

  const statusOptions = [
    { value: 'needed', label: 'Needed' },
    { value: 'acquired', label: 'Acquired' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ]

  // Determine if quantity should be shown for a resource category
  function shouldShowQuantity(category: ResourceCategory | string | undefined): boolean {
    if (!category) return false
    // Unique items that don't need quantity (always 1)
    const uniqueCategories: ResourceCategory[] = ['prop', 'wig', 'pattern', 'costume-piece']
    return !uniqueCategories.includes(category as ResourceCategory)
  }

  // Get selected resource's category
  const selectedResourceCategory = $derived.by(() => {
    if (!selectedResourceId) return undefined
    const resource = availableResources.find(r => r.id === selectedResourceId)
    return resource?.metadata?.category
  })

  // Show quantity field only for multi-quantity resources
  const showQuantityField = $derived.by(() => {
    return shouldShowQuantity(selectedResourceCategory)
  })

  onMount(async () => {
    await loadResources()
  })

  async function loadResources() {
    try {
      loading = true
      error = null
      const allResources = await resourceService.list()
      // Get already linked resources (handle schema cache errors gracefully)
      let linked: any[] = []
      try {
        linked = await projectService.getLinkedResources(projectId)
      } catch (err: any) {
        // If schema cache error, just use empty array so resources still show
        if (err?.message?.includes('schema cache') || err?.code === 'PGRST205' || err?.code === 'PGRST204') {
          console.warn('[InlineResourceLinker] Schema cache issue, showing all resources')
          linked = []
        } else {
          // For other errors, still use empty array to show resources
          // Better to show resources that might be linked than to hide everything
          console.warn('[InlineResourceLinker] Error loading linked resources, showing all resources:', err)
          linked = []
        }
      }
      const linkedIds = new Set(linked.map((r: any) => r.resource_id || r.resource?.id || r.id))
      // Filter out already linked resources
      // Keep track of currently selected resource to ensure it doesn't disappear
      const currentlySelected = selectedResourceId
      availableResources = allResources.filter(r => !linkedIds.has(r.id))
      
      // If a resource was selected but got filtered out, check if it's actually linked
      // If not linked (but filtered out due to error), keep it visible
      if (currentlySelected && !availableResources.find(r => r.id === currentlySelected)) {
        // Check if it's actually in the linked list
        const isActuallyLinked = linked.some((l: any) => {
          const linkResourceId = l.resource_id || l.resource?.id || l.id
          return linkResourceId === currentlySelected
        })
        
        // If not actually linked but was filtered, it's likely a schema cache issue
        // Re-add it to the list so user can still see and link it
        if (!isActuallyLinked && allResources.find(r => r.id === currentlySelected)) {
          console.log('[InlineResourceLinker] Resource was filtered out but not actually linked, keeping it visible')
          availableResources.push(allResources.find(r => r.id === currentlySelected)!)
        }
      }
    } catch (err: any) {
      error = err?.message || 'Failed to load resources'
    } finally {
      loading = false
    }
  }

  // Fuzzy search filtered resources
  const filteredResources = $derived.by(() => {
    if (!searchQuery.trim()) {
      return availableResources
    }

    const fuse = new Fuse(availableResources, {
      keys: ['name', 'tags', 'description'],
      threshold: 0.3,
    })
    const results = fuse.search(searchQuery)
    return results.map((r: { item: Resource }) => r.item)
  })

  function handleSelectResource(resourceId: string) {
    selectedResourceId = resourceId
    // Reset quantity to 1 when selecting a new resource
    // If it's a unique resource, quantity will always be 1
    const resource = availableResources.find(r => r.id === resourceId)
    if (resource && !shouldShowQuantity(resource.metadata?.category)) {
      quantity = 1
    }
  }

  async function handleLink() {
    if (!selectedResourceId) {
      error = 'Please select a resource'
      return
    }

    if (quantity < 1) {
      error = 'Quantity must be at least 1'
      return
    }

    saving = true
    error = null

    try {
      // For unique resources, always use quantity 1
      const resource = availableResources.find(r => r.id === selectedResourceId)
      const finalQuantity = resource && !shouldShowQuantity(resource.metadata?.category) ? 1 : quantity
      
      await projectService.linkResource(projectId, selectedResourceId, finalQuantity, status)
      onSuccess?.()
      // Reset state
      selectedResourceId = null
      quantity = 1
      status = 'needed'
      searchQuery = ''
      await loadResources()
    } catch (err: any) {
      error = err?.message || 'Failed to link resource'
    } finally {
      saving = false
    }
  }

  function handleCreateNew() {
    showCreateForm = true
  }

  async function handleResourceCreated(resourceId: string) {
    showCreateForm = false
    error = null // Clear any previous errors
    
    // Small delay to ensure the resource is committed to the database
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Force reload resources to include the newly created one
    await loadResources()
    
    // Verify the resource is actually in the available list
    let retries = 0
    while (retries < 3 && !availableResources.find(r => r.id === resourceId)) {
      console.log(`[InlineResourceLinker] Resource ${resourceId} not found in list, retrying... (attempt ${retries + 1})`)
      await new Promise(resolve => setTimeout(resolve, 300))
      await loadResources()
      retries++
    }
    
    // Select the newly created resource automatically so it's visible
    selectedResourceId = resourceId
    quantity = 1
    status = 'needed'
    
    // Automatically link the newly created resource to this project
    try {
      await projectService.linkResource(projectId, resourceId, 1, 'needed')
      // Linking succeeded - reload and close linker
      await loadResources()
      onSuccess?.()
      // Reset state
      selectedResourceId = null
      quantity = 1
      status = 'needed'
      searchQuery = ''
    } catch (err: any) {
      console.error('Failed to link new resource to project:', err)
      // Resource was created but linking failed - keep linker open
      // The resource should still be visible and selected
      
      // Reload one more time to ensure state is correct
      await new Promise(resolve => setTimeout(resolve, 300))
      await loadResources()
      
      // Re-select the resource to ensure it stays visible (it might have been filtered out)
      selectedResourceId = resourceId
      
      // Show helpful error message - DON'T call onSuccess() so linker stays open
      error = 'Resource created successfully! However, automatic linking failed due to schema cache. The resource is selected below - click "Link Resource" to link it manually.'
    }
  }

  function handleCancel() {
    selectedResourceId = null
    quantity = 1
    status = 'needed'
    searchQuery = ''
    onCancel?.()
  }
</script>

<div class="space-y-4">
  <!-- Search and Create New Button -->
  <div class="flex gap-2">
    <div class="relative flex-1">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--theme-muted-foreground)]" />
      <Input
        type="text"
        placeholder="Search resources..."
        bind:value={searchQuery}
        class="pl-10 bg-[var(--theme-input-bg)] border-[var(--theme-border)] text-[var(--theme-foreground)]"
      />
    </div>
    <Button variant="default" size="sm" onclick={handleCreateNew}>
      <Plus class="mr-2 size-4" />
      Create New
    </Button>
  </div>

  {#if error}
    <div class="rounded-md bg-[var(--theme-error)]/10 border border-[var(--theme-error)]/20 p-3 text-sm text-[var(--theme-error)]">
      {error}
    </div>
  {/if}

  <!-- Resource List -->
  {#if loading}
    <div class="flex items-center justify-center py-8">
      <div class="text-center">
        <div class="mb-4 inline-block size-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p class="text-sm text-[var(--theme-muted-foreground)]">Loading resources...</p>
      </div>
    </div>
  {:else if availableResources.length === 0 && !searchQuery}
    <Card class="bg-[var(--theme-card-bg)] border border-[var(--theme-border)]">
      <CardContent class="flex flex-col items-center justify-center py-8 px-6">
        <p class="mb-4 text-center text-sm text-[var(--theme-muted-foreground)]">
          No available resources to link. Create a new resource to get started.
        </p>
        <Button variant="default" size="sm" onclick={handleCreateNew}>
          <Plus class="mr-2 size-4" />
          Create New Resource
        </Button>
      </CardContent>
    </Card>
  {:else if filteredResources.length === 0 && searchQuery}
    <Card class="bg-[var(--theme-card-bg)] border border-[var(--theme-border)]">
      <CardContent class="flex flex-col items-center justify-center py-8 px-6">
        <p class="mb-4 text-center text-sm text-[var(--theme-muted-foreground)]">
          No resources found matching "{searchQuery}"
        </p>
        <Button variant="default" size="sm" onclick={handleCreateNew}>
          <Plus class="mr-2 size-4" />
          Create New Resource
        </Button>
      </CardContent>
    </Card>
  {:else}
    <div class="space-y-2 max-h-96 overflow-y-auto">
      {#each filteredResources as resource (resource.id)}
        <button
          type="button"
          onclick={() => handleSelectResource(resource.id)}
          class="w-full rounded-lg border p-3 text-left transition-colors hover:bg-[var(--theme-sidebar-hover)] {selectedResourceId === resource.id ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10' : 'border-[var(--theme-border)] bg-[var(--theme-card-bg)]'}"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-[var(--theme-foreground)] truncate">{resource.name}</h4>
              {#if resource.description}
                <p class="mt-1 text-sm text-[var(--theme-muted-foreground)] line-clamp-2">{resource.description}</p>
              {/if}
              {#if resource.tags && resource.tags.length > 0}
                <div class="mt-2 flex flex-wrap gap-1">
                  {#each resource.tags.slice(0, 3) as tag}
                    <span class="rounded-full bg-[var(--theme-section-bg)] px-2 py-0.5 text-xs text-[var(--theme-muted-foreground)]">
                      {tag}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>
            {#if selectedResourceId === resource.id}
              <div class="ml-2 shrink-0">
                <div class="flex size-6 items-center justify-center rounded-full bg-[var(--theme-primary)] text-white">
                  <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  {/if}

  <!-- Selection Details (Quantity and Status) -->
  {#if selectedResourceId}
    <Card class="bg-[var(--theme-card-bg)] border border-[var(--theme-border)]">
      <CardContent class="space-y-4 p-4">
        <div class="flex items-center gap-2 text-sm font-medium text-[var(--theme-foreground)]">
          <LinkIcon class="size-4" />
          <span>Link Details</span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          {#if showQuantityField}
            <div class="space-y-2">
              <label for="quantity-input" class="text-sm font-medium text-[var(--theme-foreground)]">Quantity</label>
              <Input
                id="quantity-input"
                type="number"
                bind:value={quantity}
                class="bg-[var(--theme-input-bg)] border-[var(--theme-border)] text-[var(--theme-foreground)]"
              />
            </div>
          {/if}

          <div class="space-y-2" class:col-span-2={!showQuantityField}>
            <label for="status-select" class="text-sm font-medium text-[var(--theme-foreground)]">Status</label>
            <Select
              id="status-select"
              bind:value={status}
              options={statusOptions}
              class="w-full"
            />
          </div>
        </div>

        <div class="flex gap-2">
          <Button variant="outline" size="sm" class="flex-1" onclick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button variant="default" size="sm" class="flex-1" onclick={handleLink} disabled={saving}>
            {saving ? 'Linking...' : 'Link Resource'}
          </Button>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>

<!-- Create New Resource Flyout -->
<CreationFlyout 
  bind:open={showCreateForm} 
  title="Create New Resource"
>
  <ResourceDetail
    bind:this={resourceDetailRef}
    mode="create"
    isFlyout={true}
    onSuccess={handleResourceCreated}
  />
</CreationFlyout>

