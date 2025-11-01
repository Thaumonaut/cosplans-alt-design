<script lang="ts">
  import { projectService } from '$lib/api/services/projectService'
  import type { Resource } from '$lib/types/domain/resource'
  import type { ProjectResource } from '$lib/types/domain/resource'
  import { Badge } from 'flowbite-svelte'
  import { Package, Link as LinkIcon } from 'lucide-svelte'
  import { cn, formatCurrencyFromCents } from '$lib/utils'

  interface Props {
    projectId: string
    editable?: boolean
  }

  let { projectId, editable = true }: Props = $props()

  interface LinkedResource {
    id: string
    projectId: string
    resourceId: string
    quantity: number
    status: 'needed' | 'acquired' | 'in-progress' | 'completed'
    notes?: string
    addedAt: string
    resource: Resource
  }

  let linkedResources = $state<LinkedResource[]>([])
  let loading = $state(true)
  let error = $state<string | null>(null)

  async function loadResources() {
    loading = true
    error = null
    try {
      const data = await projectService.getLinkedResources(projectId)
      linkedResources = data as any[]
    } catch (err: any) {
      error = err?.message || 'Failed to load resources'
    } finally {
      loading = false
    }
  }

  // Load resources on mount
  $effect(() => {
    loadResources()
  })

  const statusColors = {
    needed: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20',
    acquired: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    'in-progress': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
    completed: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
  }

  const statusLabels = {
    needed: 'Needed',
    acquired: 'Acquired',
    'in-progress': 'In Progress',
    completed: 'Completed',
  }

  const categoryLabels: Record<string, string> = {
    prop: 'Prop',
    fabric: 'Fabric',
    wig: 'Wig',
    pattern: 'Pattern',
    'costume-piece': 'Costume Piece',
    accessory: 'Accessory',
    material: 'Material',
  }
</script>

<div class="space-y-4">
  {#if loading}
    <p class="text-center text-sm text-muted-foreground py-8">Loading resources...</p>
  {:else if error}
    <p class="text-center text-sm text-red-600 py-8">{error}</p>
  {:else if linkedResources.length === 0}
    <div class="text-center py-12">
      <Package class="size-12 text-muted-foreground/30 mx-auto mb-4" />
      <p class="text-sm text-muted-foreground">No resources linked yet.</p>
      {#if editable}
        <p class="text-xs text-muted-foreground mt-2">
          Link existing resources or create new ones to track materials and items for this project.
        </p>
      {/if}
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2">
      {#each linkedResources as link (link.id)}
        <div class="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md">
          <!-- Resource Image -->
          {#if link.resource.images.length > 0}
            <div class="aspect-video w-full overflow-hidden bg-muted">
              <img
                src={link.resource.images[0]}
                alt={link.resource.name}
                class="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
          {:else}
            <div class="aspect-video w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Package class="size-8 text-muted-foreground/30" />
            </div>
          {/if}

          <!-- Content -->
          <div class="p-4">
            <!-- Header -->
            <div class="mb-2">
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-sm font-semibold text-foreground">{link.resource.name}</h4>
                <LinkIcon class="size-3 text-muted-foreground flex-shrink-0 mt-0.5" />
              </div>
              <p class="text-xs text-muted-foreground">
                {categoryLabels[link.resource.metadata.category]}
              </p>
            </div>

            <!-- Status & Quantity -->
            <div class="mb-3 flex items-center gap-2">
              <Badge class="border px-2 py-0.5 text-xs {statusColors[link.status]}">
                {statusLabels[link.status]}
              </Badge>
              <span class="text-xs text-muted-foreground">Qty: {link.quantity}</span>
            </div>

            <!-- Cost -->
            {#if link.resource.cost}
              <div class="text-xs text-muted-foreground">
                Cost: {formatCurrencyFromCents((link.resource.cost || 0) * link.quantity)}
                {#if link.quantity > 1}
                  <span class="opacity-60">({formatCurrencyFromCents(link.resource.cost)} each)</span>
                {/if}
              </div>
            {/if}

            <!-- Notes -->
            {#if link.notes}
              <p class="mt-2 text-xs text-muted-foreground italic">{link.notes}</p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>


