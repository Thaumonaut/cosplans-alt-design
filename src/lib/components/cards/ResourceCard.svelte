<script lang="ts">
  import type { Resource, ResourceStatus } from '$lib/types/domain/resource'
  import { Badge } from 'flowbite-svelte'
  import { DollarSign, Package, Link as LinkIcon, CheckSquare, X } from 'lucide-svelte'
  import { cn, formatCurrencyFromCents } from '$lib/utils'

  interface Props {
    resource: Resource
    onclick?: () => void
    projectCount?: number // Number of projects using this resource
    taskCount?: number // Number of tasks for this resource
    // Project-specific link info (only shown in project context)
    linkStatus?: ResourceStatus
    linkQuantity?: number
    showQuantity?: boolean // Whether to show quantity field
    onUnlink?: () => void // Unlink handler for project context
    showUnlink?: boolean // Whether to show unlink button
  }

  let { 
    resource, 
    onclick, 
    projectCount,
    taskCount,
    linkStatus,
    linkQuantity,
    showQuantity = false,
    onUnlink,
    showUnlink = false
  }: Props = $props()

  const categoryLabels: Record<string, string> = {
    prop: 'Prop',
    fabric: 'Fabric',
    wig: 'Wig',
    pattern: 'Pattern',
    'costume-piece': 'Costume Piece',
    accessory: 'Accessory',
    material: 'Material',
  }

  const categoryColors: Record<string, string> = {
    prop: 'bg-[color-mix(in_srgb,var(--theme-primary)_20%,transparent)] backdrop-blur-sm text-[var(--theme-primary)] border-[color-mix(in_srgb,var(--theme-primary)_30%,transparent)]',
    fabric: 'bg-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)] backdrop-blur-sm text-[var(--theme-accent)] border-[color-mix(in_srgb,var(--theme-accent)_30%,transparent)]',
    wig: 'bg-[color-mix(in_srgb,var(--theme-info)_20%,transparent)] backdrop-blur-sm text-[var(--theme-info)] border-[color-mix(in_srgb,var(--theme-info)_30%,transparent)]',
    pattern: 'bg-[color-mix(in_srgb,var(--theme-warning)_20%,transparent)] backdrop-blur-sm text-[var(--theme-warning)] border-[color-mix(in_srgb,var(--theme-warning)_30%,transparent)]',
    'costume-piece': 'bg-[color-mix(in_srgb,var(--theme-success)_20%,transparent)] backdrop-blur-sm text-[var(--theme-success)] border-[color-mix(in_srgb,var(--theme-success)_30%,transparent)]',
    accessory: 'bg-[color-mix(in_srgb,var(--theme-warning)_20%,transparent)] backdrop-blur-sm text-[var(--theme-warning)] border-[color-mix(in_srgb,var(--theme-warning)_30%,transparent)]',
    material: 'bg-[color-mix(in_srgb,var(--theme-sidebar-muted)_20%,transparent)] backdrop-blur-sm text-[var(--theme-sidebar-muted)] border-[color-mix(in_srgb,var(--theme-border)_30%,transparent)]',
  }

  const statusColors: Record<string, string> = {
    needed: 'bg-[color-mix(in_srgb,var(--theme-muted)_20%,transparent)] backdrop-blur-sm text-[var(--theme-sidebar-muted)] border-[color-mix(in_srgb,var(--theme-border)_30%,transparent)]',
    acquired: 'bg-[color-mix(in_srgb,var(--theme-info)_20%,transparent)] backdrop-blur-sm text-[var(--theme-info)] border-[color-mix(in_srgb,var(--theme-info)_30%,transparent)]',
    'in-progress': 'bg-[color-mix(in_srgb,var(--theme-warning)_20%,transparent)] backdrop-blur-sm text-[var(--theme-warning)] border-[color-mix(in_srgb,var(--theme-warning)_30%,transparent)]',
    completed: 'bg-[color-mix(in_srgb,var(--theme-success)_20%,transparent)] backdrop-blur-sm text-[var(--theme-success)] border-[color-mix(in_srgb,var(--theme-success)_30%,transparent)]',
  }

  const statusLabels: Record<string, string> = {
    needed: 'Needed',
    acquired: 'Acquired',
    'in-progress': 'In Progress',
    completed: 'Completed',
  }

  const category = resource.metadata?.category || 'prop'
  
  // Helper to get metadata field values based on category
  function getMetadataFields() {
    const metadata = resource.metadata
    if (!metadata) return []
    
    const fields: Array<{ label: string; value: string }> = []
    
    switch (metadata.category) {
      case 'prop':
        if (metadata.dimensions) fields.push({ label: 'Dimensions', value: metadata.dimensions })
        if (metadata.material) {
          const materialValue = Array.isArray(metadata.material) 
            ? metadata.material.join(', ')
            : metadata.material
          fields.push({ label: 'Material', value: materialValue })
        }
        if (metadata.weight) fields.push({ label: 'Weight', value: metadata.weight })
        if (metadata.fragile !== undefined) fields.push({ label: 'Fragile', value: metadata.fragile ? 'Yes' : 'No' })
        if (metadata.requiresAssembly !== undefined) fields.push({ label: 'Assembly', value: metadata.requiresAssembly ? 'Required' : 'No' })
        if (metadata.storageLocation) fields.push({ label: 'Storage', value: metadata.storageLocation })
        break
      case 'fabric':
        if (metadata.fabricType) fields.push({ label: 'Type', value: metadata.fabricType })
        if (metadata.color) fields.push({ label: 'Color', value: metadata.color })
        if (metadata.quantity !== undefined) fields.push({ label: 'Quantity', value: `${metadata.quantity} ${metadata.unit || 'yards'}` })
        if (metadata.width) fields.push({ label: 'Width', value: `${metadata.width}"` })
        if (metadata.stretch !== undefined) fields.push({ label: 'Stretch', value: metadata.stretch ? 'Yes' : 'No' })
        if (metadata.washable !== undefined) fields.push({ label: 'Washable', value: metadata.washable ? 'Yes' : 'No' })
        break
      case 'wig':
        if (metadata.color) fields.push({ label: 'Color', value: metadata.color })
        if (metadata.length) fields.push({ label: 'Length', value: metadata.length })
        if (metadata.style) fields.push({ label: 'Style', value: metadata.style })
        if (metadata.needsStyling !== undefined) fields.push({ label: 'Styling', value: metadata.needsStyling ? 'Required' : 'No' })
        if (metadata.laceType) fields.push({ label: 'Lace', value: metadata.laceType })
        if (metadata.heatResistant !== undefined) fields.push({ label: 'Heat Resistant', value: metadata.heatResistant ? 'Yes' : 'No' })
        break
      case 'pattern':
        if (metadata.patternCompany) fields.push({ label: 'Company', value: metadata.patternCompany })
        if (metadata.patternNumber) fields.push({ label: 'Pattern #', value: metadata.patternNumber })
        if (metadata.size) fields.push({ label: 'Size', value: metadata.size })
        if (metadata.difficulty) fields.push({ label: 'Difficulty', value: metadata.difficulty })
        if (metadata.physicalPattern !== undefined) fields.push({ label: 'Type', value: metadata.physicalPattern ? 'Physical' : 'Digital' })
        break
      case 'costume-piece':
        if (metadata.pieceType) fields.push({ label: 'Type', value: metadata.pieceType })
        if (metadata.size) fields.push({ label: 'Size', value: metadata.size })
        if (metadata.material) {
          const materialValue = Array.isArray(metadata.material) 
            ? metadata.material.join(', ')
            : metadata.material
          fields.push({ label: 'Material', value: materialValue })
        }
        if (metadata.color) fields.push({ label: 'Color', value: metadata.color })
        if (metadata.needsAlterations !== undefined) fields.push({ label: 'Alterations', value: metadata.needsAlterations ? 'Needed' : 'No' })
        break
      case 'accessory':
        if (metadata.accessoryType) fields.push({ label: 'Type', value: metadata.accessoryType })
        if (metadata.material) {
          const materialValue = Array.isArray(metadata.material) 
            ? metadata.material.join(', ')
            : metadata.material
          fields.push({ label: 'Material', value: materialValue })
        }
        if (metadata.color) fields.push({ label: 'Color', value: metadata.color })
        if (metadata.quantity !== undefined) fields.push({ label: 'Quantity', value: metadata.quantity.toString() })
        break
      case 'material':
        if (metadata.materialType) {
          const materialTypeValue = Array.isArray(metadata.materialType) 
            ? metadata.materialType.join(', ')
            : metadata.materialType
          fields.push({ label: 'Type', value: materialTypeValue })
        }
        if (metadata.brand) fields.push({ label: 'Brand', value: metadata.brand })
        if (metadata.colorVariant) fields.push({ label: 'Color', value: metadata.colorVariant })
        if (metadata.quantity !== undefined) fields.push({ label: 'Quantity', value: `${metadata.quantity} ${metadata.unit || ''}`.trim() })
        break
    }
    
    return fields.slice(0, 3) // Limit to first 3 fields
  }

  const metadataFields = $derived(getMetadataFields())
</script>

<div
  role="button"
  tabindex="0"
  onclick={onclick}
  onkeydown={(e) => e.key === 'Enter' && onclick?.()}
  class="group relative flex min-h-[200px] overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg cursor-pointer"
>
  <!-- Cover Image (Left side) -->
  <div class="relative h-full w-56 shrink-0 overflow-hidden bg-muted">
    {#if resource.images && resource.images.length > 0}
      <img
        src={resource.images[0]}
        alt={resource.name}
        class="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
    {:else}
      <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
        <Package class="size-16 text-muted-foreground/30" />
      </div>
    {/if}

    <!-- Unlink Button (only in project context) -->
    {#if showUnlink && onUnlink}
      <button
        type="button"
        onclick={(e) => {
          e.stopPropagation()
          onUnlink()
        }}
        class="absolute right-2 top-2 z-10 size-8 rounded-md bg-[var(--theme-card-bg)]/80 backdrop-blur hover:bg-[var(--theme-card-bg)] flex items-center justify-center transition-colors"
        aria-label="Unlink resource"
      >
        <X class="size-4 text-[var(--theme-muted-foreground)]" />
      </button>
    {/if}
  </div>

  <!-- Content (Right side) -->
  <div class="flex flex-1 flex-col p-6 space-y-4">
    <!-- Header -->
    <div class="flex-shrink-0">
      <h3 class="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
        {resource.name}
      </h3>
      <p class="mt-2 line-clamp-2 text-base {resource.description ? 'text-muted-foreground' : 'text-muted-foreground/50 italic'}">
        {resource.description || 'No description'}
      </p>
    </div>

    <!-- Category and Status Badges -->
    <div class="flex flex-wrap gap-2.5 flex-shrink-0">
      <Badge class="border px-3.5 py-1.5 text-sm {categoryColors[category] || categoryColors.prop}">
        {categoryLabels[category] || category}
      </Badge>
      {#if linkStatus}
        <Badge class="border px-3.5 py-1.5 text-sm {statusColors[linkStatus] || statusColors.needed}">
          {statusLabels[linkStatus] || linkStatus}
        </Badge>
      {/if}
    </div>

    <!-- Details Grid - Always show fields -->
    <div class="flex-1 grid grid-cols-2 gap-x-6 gap-y-3 text-base">
      <!-- Cost - Always shown -->
      <div class="flex items-center gap-2.5 py-1">
        <DollarSign class="size-5 text-muted-foreground shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="text-xs text-muted-foreground">Cost</div>
          <div class="{resource.cost ? 'text-foreground font-semibold' : 'text-muted-foreground/50 italic'}">
            {resource.cost ? formatCurrencyFromCents(resource.cost) : 'Not set'}
          </div>
        </div>
      </div>

      <!-- Tasks - Always shown if taskCount provided -->
      {#if taskCount !== undefined}
        <div class="flex items-center gap-2.5 py-1">
          <CheckSquare class="size-5 text-muted-foreground shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="text-xs text-muted-foreground">Tasks</div>
            <div class="{taskCount > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground/50 italic'}">
              {taskCount > 0 ? `${taskCount} task${taskCount === 1 ? '' : 's'}` : 'No tasks'}
            </div>
          </div>
        </div>
      {/if}

      <!-- Quantity (project context) -->
      {#if showQuantity && linkQuantity !== undefined && linkQuantity > 1}
        <div class="flex items-center gap-2.5 py-1">
          <Package class="size-5 text-muted-foreground shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="text-xs text-muted-foreground">Quantity</div>
            <div class="text-foreground font-semibold">{linkQuantity}</div>
          </div>
        </div>
      {/if}

      <!-- Project Usage (resource page context) -->
      {#if projectCount !== undefined}
        <div class="flex items-center gap-2.5 py-1">
          <LinkIcon class="size-5 text-muted-foreground shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="text-xs text-muted-foreground">Projects</div>
            <div class="{projectCount > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground/50 italic'}">
              {projectCount > 0 ? `${projectCount} ${projectCount === 1 ? 'project' : 'projects'}` : 'Not used'}
            </div>
          </div>
        </div>
      {/if}

      <!-- Metadata Fields (category-specific) -->
      {#each metadataFields as field}
        <div class="flex flex-col py-1">
          <div class="text-xs text-muted-foreground">{field.label}</div>
          <div class="text-foreground font-semibold">{field.value}</div>
        </div>
      {/each}
      {#if metadataFields.length === 0}
        <div class="flex flex-col py-1">
          <div class="text-xs text-muted-foreground">Details</div>
          <div class="text-muted-foreground/50 italic">No details</div>
        </div>
      {/if}
    </div>

    <!-- Tags - Always shown -->
    <div class="pt-3 border-t border-border/50">
      <div class="flex flex-wrap gap-2">
        {#if resource.tags && resource.tags.length > 0}
          {#each resource.tags.slice(0, 3) as tag}
            <span class="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              {tag}
            </span>
          {/each}
          {#if resource.tags.length > 3}
            <span class="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              +{resource.tags.length - 3}
            </span>
          {/if}
        {:else}
          <span class="text-sm text-muted-foreground/50 italic">No tags</span>
        {/if}
      </div>
    </div>
  </div>
</div>







