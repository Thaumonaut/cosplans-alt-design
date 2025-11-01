<script lang="ts">
  import { onMount } from 'svelte'
  import { Card } from 'flowbite-svelte'
  import { Button } from '$lib/components/ui'
  import { Plus, Package, X } from 'lucide-svelte'
  import { goto } from '$app/navigation'
  import { projectService } from '$lib/api/services/projectService'
  import ResourceLinkModal from '../ResourceLinkModal.svelte'
  import ResourceDetail from '$lib/components/resources/ResourceDetail.svelte'
  import CreationFlyout from '$lib/components/ui/CreationFlyout.svelte'
  import type { Resource } from '$lib/types/domain/resource'

  interface Props {
    projectId: string
    onResourceChange?: () => void
  }

  let { projectId, onResourceChange }: Props = $props()

  let linkedResources = $state<any[]>([])
  let loading = $state(true)
  let error = $state<string | null>(null)
  let showLinkModal = $state(false)
  let showNewResourceFlyout = $state(false)
  let resourceDetailRef: any = $state(null)

  onMount(async () => {
    await loadResources()
  })

  async function loadResources() {
    try {
      loading = true
      error = null
      linkedResources = await projectService.getLinkedResources(projectId)
    } catch (err: any) {
      console.error('Failed to load linked resources:', err)
      // Only show error if it's not a schema cache issue (which we handle gracefully)
      if (!err?.message?.includes('schema cache') && err?.code !== 'PGRST205') {
        error = err?.message || 'Failed to load resources'
      } else {
        // Schema cache error - just show empty state
        linkedResources = []
      }
    } finally {
      loading = false
    }
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
  }
  
  // Expose loadResources to parent if needed
  export { loadResources }

  async function handleCreateNew() {
    showNewResourceFlyout = true
  }

  async function handleResourceCreated(resourceId: string) {
    showNewResourceFlyout = false
    // Automatically link the newly created resource to this project
    try {
      await projectService.linkResource(projectId, resourceId, 1, 'needed')
      await loadResources()
      onResourceChange?.()
    } catch (err: any) {
      console.error('Failed to link new resource to project:', err)
      // Resource was created but linking failed - still reload to show it exists
      await loadResources()
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">Linked Resources</h2>
    <div class="flex gap-2">
      <Button variant="outline" size="sm" onclick={() => (showLinkModal = true)}>
        <Plus class="mr-2 size-4" />
        Link Existing
      </Button>
      <Button variant="default" size="sm" onclick={handleCreateNew}>
        <Plus class="mr-2 size-4" />
        Create New
      </Button>
    </div>
  </div>

  <ResourceLinkModal
    bind:open={showLinkModal}
    {projectId}
    onClose={() => (showLinkModal = false)}
    onSuccess={handleLinkSuccess}
  />

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p class="text-sm text-muted-foreground">Loading resources...</p>
      </div>
    </div>
  {:else if error}
    <Card class="p-6 shadow-none border-0">
      <p class="text-sm text-red-600">{error}</p>
    </Card>
  {:else if linkedResources.length === 0}
    <Card class="flex flex-col items-center justify-center py-12 shadow-none border-0">
      <Package class="mb-4 size-12 text-muted-foreground opacity-50" />
      <p class="mb-2 text-sm font-medium">No resources linked yet</p>
      <p class="mb-4 text-sm text-muted-foreground">
        Link existing resources or create new ones for this project
      </p>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" onclick={() => (showLinkModal = true)}>
          <Plus class="mr-2 size-4" />
          Link Existing
        </Button>
        <Button variant="default" size="sm" onclick={handleCreateNew}>
          <Plus class="mr-2 size-4" />
          Create New
        </Button>
      </div>
    </Card>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each linkedResources as link (link.id)}
        {@const resource = link.resource || link}
        {@const resourceId = resource?.id || link.resource_id || link.id}
        <Card class="p-4 shadow-none border-0">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-medium">{resource?.name || 'Unknown Resource'}</h3>
            <Button
              variant="outline"
              size="icon-sm"
              class="!p-1"
              onclick={() => unlinkResource(resourceId)}
            >
              <X class="size-4" />
            </Button>
          </div>
          {#if resource?.description}
            <p class="text-sm text-muted-foreground">{resource.description}</p>
          {/if}
          <div class="mt-3 flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Quantity: {link.quantity || 1}</span>
            <span class="capitalize text-muted-foreground">
              {link.status || 'needed'}
            </span>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<!-- New Resource Creation Flyout -->
<CreationFlyout 
  bind:open={showNewResourceFlyout} 
  title="Create New Resource"
>
  <ResourceDetail
    bind:this={resourceDetailRef}
    mode="create"
    isFlyout={true}
    onSuccess={handleResourceCreated}
  />
</CreationFlyout>

