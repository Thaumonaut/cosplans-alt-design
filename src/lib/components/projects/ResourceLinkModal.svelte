<script lang="ts">
  import { onMount } from 'svelte'
  import { Modal, Button, Input, Select as FlowbiteSelect } from 'flowbite-svelte'
  import { X } from 'lucide-svelte'
  import { resourceService } from '$lib/api/services/resourceService'
  import { projectService } from '$lib/api/services/projectService'
  import Select from '$lib/components/ui/select.svelte'
  import type { Resource, ResourceCategory } from '$lib/types/domain/resource'

  interface Props {
    open?: boolean
    projectId: string
    onClose: () => void
    onSuccess?: () => void
  }

  let { open = $bindable(false), projectId, onClose, onSuccess }: Props = $props()

  let availableResources = $state<Resource[]>([])
  let selectedResourceId = $state('')
  let quantity = $state(1)
  let status = $state<'needed' | 'acquired' | 'in-progress' | 'completed'>('needed')
  let loading = $state(false)
  let saving = $state(false)
  let error = $state<string | null>(null)

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

  // Update quantity to 1 when selecting a unique resource
  $effect(() => {
    if (selectedResourceId && !showQuantityField) {
      quantity = 1
    }
  })

  $effect(() => {
    if (open) {
      loadResources()
    }
  })

  async function loadResources() {
    try {
      loading = true
      const allResources = await resourceService.list()
      // Get already linked resources
      const linked = await projectService.getLinkedResources(projectId)
      const linkedIds = new Set(linked.map((r: any) => r.resource_id || r.resource?.id))
      // Filter out already linked resources
      availableResources = allResources.filter(r => !linkedIds.has(r.id))
    } catch (err: any) {
      error = err?.message || 'Failed to load resources'
    } finally {
      loading = false
    }
  }

  async function handleLink() {
    if (!selectedResourceId) {
      error = 'Please select a resource'
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
      handleClose()
    } catch (err: any) {
      error = err?.message || 'Failed to link resource'
    } finally {
      saving = false
    }
  }

  function handleClose() {
    selectedResourceId = ''
    quantity = 1
    status = 'needed'
    error = null
    open = false
    onClose()
  }
</script>

<Modal bind:open size="md">
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <h3 class="text-xl font-semibold">Link Resource</h3>
      <button
        onclick={handleClose}
        class="rounded-md p-1 text-muted-foreground hover:bg-muted"
      >
        <X class="size-5" />
      </button>
    </div>

    {#if error}
      <div class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
    {/if}

    <div class="space-y-4">
      <!-- Resource Selection -->
      <div class="space-y-2">
        <div class="text-sm font-medium">Resource</div>
        {#if loading}
          <p class="text-sm text-muted-foreground">Loading resources...</p>
        {:else if availableResources.length === 0}
          <p class="text-sm text-muted-foreground">No available resources to link</p>
        {:else}
          <Select
            bind:value={selectedResourceId}
            options={availableResources.map(r => ({
              value: r.id,
              label: r.name
            }))}
            placeholder="Select a resource..."
          />
        {/if}
      </div>

      <!-- Quantity (only show for multi-quantity resources) -->
      {#if showQuantityField}
        <div class="space-y-2">
          <div class="text-sm font-medium">Quantity</div>
          <Input
            type="number"
            bind:value={quantity}
            placeholder="1"
          />
        </div>
      {/if}

      <!-- Status -->
      <div class="space-y-2">
        <div class="text-sm font-medium">Status</div>
        <Select
          bind:value={status}
          options={statusOptions}
          placeholder="Select status..."
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 flex gap-3">
      <Button
        color="light"
        class="flex-1"
        onclick={handleClose}
        disabled={saving}
      >
        Cancel
      </Button>
      <Button
        color="primary"
        class="flex-1"
        onclick={handleLink}
        disabled={saving || !selectedResourceId || availableResources.length === 0}
      >
        {saving ? 'Linking...' : 'Link Resource'}
      </Button>
    </div>
  </div>
</Modal>

