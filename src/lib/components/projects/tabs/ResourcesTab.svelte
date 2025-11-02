<script lang="ts">
  import { onMount } from 'svelte'
  import { Card, CardContent } from '$lib/components/ui'
  import { Button } from '$lib/components/ui'
  import { Plus, Box, X } from 'lucide-svelte'
  import { projectService } from '$lib/api/services/projectService'
  import { taskService } from '$lib/api/services/taskService'
  import InlineResourceLinker from '../InlineResourceLinker.svelte'
  import ResourceCard from '$lib/components/cards/ResourceCard.svelte'
  import type { Resource, ResourceCategory } from '$lib/types/domain/resource'

  interface Props {
    projectId: string
    onResourceChange?: () => void
    onResourceClick?: (resourceId: string) => void
  }

  let { projectId, onResourceChange, onResourceClick }: Props = $props()

  let linkedResources = $state<any[]>([])
  let resourceTasks = $state<Record<string, number>>({}) // Map of resourceId -> task count
  let loading = $state(true)
  let error = $state<string | null>(null)
  let showLinker = $state(false)

  // Determine if quantity should be shown for a resource category
  function shouldShowQuantity(category: ResourceCategory | string | undefined): boolean {
    if (!category) return false
    // Unique items that don't need quantity (always 1)
    const uniqueCategories: ResourceCategory[] = ['prop', 'wig', 'pattern', 'costume-piece']
    return !uniqueCategories.includes(category as ResourceCategory)
  }

  onMount(async () => {
    await loadResources()
  })

  async function loadResources() {
    try {
      loading = true
      error = null
      linkedResources = await projectService.getLinkedResources(projectId)
      
      // Load task counts for each resource
      await loadResourceTasks()
    } catch (err: any) {
      console.error('Failed to load linked resources:', err)
      // Only show error if it's not a schema cache issue (which we handle gracefully)
      if (!err?.message?.includes('schema cache') && err?.code !== 'PGRST205' && err?.code !== 'PGRST204') {
        error = err?.message || 'Failed to load resources'
      } else {
        // Schema cache error - just show empty state
        linkedResources = []
        // If we have the RPC function, resources might still be linked even if query fails
        // So we don't show an error, just empty state
      }
    } finally {
      loading = false
    }
  }

  async function loadResourceTasks() {
    const taskCounts: Record<string, number> = {}
    
    // Load tasks for each linked resource
    for (const link of linkedResources) {
      const resourceId = link.resource?.id || link.resource_id
      if (resourceId) {
        try {
          const tasks = await taskService.list({ projectId, resourceId })
          taskCounts[resourceId] = tasks.length
        } catch (err) {
          console.error(`Failed to load tasks for resource ${resourceId}:`, err)
          taskCounts[resourceId] = 0
        }
      }
    }
    
    resourceTasks = taskCounts
  }

  async function unlinkResource(resourceId: string) {
    try {
      await projectService.unlinkResource(projectId, resourceId)
      await loadResources()
      onResourceChange?.()
    } catch (err: any) {
      console.error('Failed to unlink resource:', err)
    }
  }

  async function handleLinkSuccess() {
    await loadResources()
    onResourceChange?.()
    showLinker = false
  }

  function handleLinkerCancel() {
    showLinker = false
  }

  function handleResourceClickInternal(resourceId: string) {
    // If parent wants to handle resource clicks (for flyout switching), let them
    if (onResourceClick) {
      onResourceClick(resourceId)
    }
    // Otherwise, navigation could be handled here if needed
  }
  
  // Expose loadResources to parent if needed
  export { loadResources }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold text-[var(--theme-foreground)]">Linked Resources</h2>
    {#if !showLinker}
      <Button variant="default" size="sm" onclick={() => (showLinker = true)}>
        <Plus class="mr-2 size-4" />
        Link Resource
      </Button>
    {/if}
  </div>

  {#if showLinker}
    <Card class="bg-[var(--theme-card-bg)] border border-[var(--theme-border)]">
      <CardContent class="p-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-[var(--theme-foreground)]">Link Resource</h3>
          <Button
            variant="ghost"
            size="icon"
            class="size-8"
            onclick={handleLinkerCancel}
          >
            <X class="size-4" />
          </Button>
        </div>
        <InlineResourceLinker
          {projectId}
          onSuccess={handleLinkSuccess}
          onCancel={handleLinkerCancel}
        />
      </CardContent>
    </Card>
  {/if}

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p class="text-sm text-[var(--theme-muted-foreground)]">Loading resources...</p>
      </div>
    </div>
  {:else if error}
    <Card class="bg-[var(--theme-card-bg)]">
      <CardContent class="p-6">
        <p class="text-sm text-[var(--theme-error)]">{error}</p>
      </CardContent>
    </Card>
  {:else if linkedResources.length === 0}
    <Card class="bg-[var(--theme-card-bg)] border border-[var(--theme-border)]">
      <CardContent class="flex flex-col items-center justify-center py-16 px-6">
        <div class="mb-6 size-16 flex items-center justify-center rounded-lg bg-[var(--theme-section-bg)]">
          <Box class="size-8 text-[var(--theme-muted-foreground)] opacity-50" />
        </div>
        <h3 class="mb-2 text-lg font-semibold text-[var(--theme-foreground)]">No resources linked yet</h3>
        <p class="mb-8 text-center text-sm text-[var(--theme-muted-foreground)] max-w-md">
          Link existing resources or create new ones for this project
        </p>
        <Button variant="default" size="sm" onclick={() => (showLinker = true)}>
          <Plus class="mr-2 size-4" />
          Link Resource
        </Button>
      </CardContent>
    </Card>
  {:else}
    <div class="space-y-4">
      {#each linkedResources as link (link.id)}
        {@const resourceData = link.resource || link}
        {@const resourceId = resourceData?.id || link.resource_id || link.id}
        {@const category = resourceData?.metadata?.category || 'prop'}
        {@const showQty = shouldShowQuantity(category)}
        {@const quantity = link.quantity || 1}
        {@const status = link.status || 'needed'}
        {@const taskCount = resourceTasks[resourceId] || 0}
        
        {#if resourceData && resourceData.name}
          <ResourceCard
            resource={resourceData as Resource}
            taskCount={taskCount}
            linkStatus={status}
            linkQuantity={quantity}
            showQuantity={showQty && quantity > 1}
            showUnlink={true}
            onUnlink={() => unlinkResource(resourceId)}
            onclick={() => handleResourceClickInternal(resourceId)}
          />
        {/if}
      {/each}
    </div>
  {/if}
</div>

