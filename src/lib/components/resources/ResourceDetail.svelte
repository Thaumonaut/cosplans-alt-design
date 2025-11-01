<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { resourceService } from '$lib/api/services/resourceService'
  import { currentTeam } from '$lib/stores/teams'
  import { toast } from '$lib/stores/toast'
  import { Button, Dialog, DialogFooter } from '$lib/components/ui'
  import { Badge } from 'flowbite-svelte'
  import { Calendar, X, DollarSign, Tag as TagIcon, Upload, ImageIcon, Package, Trash2 } from 'lucide-svelte'
  import InlineTextEditor from '$lib/components/base/InlineTextEditor.svelte'
  import InlineNumberEditor from '$lib/components/base/InlineNumberEditor.svelte'
  import InlineSelect from '$lib/components/base/InlineSelect.svelte'
  import InlineImageUpload from '$lib/components/base/InlineImageUpload.svelte'
  import TagSelector from '$lib/components/base/TagSelector.svelte'
  import CommentBox from '$lib/components/base/CommentBox.svelte'
  import UsedInProjectsSection from './UsedInProjectsSection.svelte'
  import type { Resource, ResourceCreate, ResourceCategory } from '$lib/types/domain/resource'
  import { get } from 'svelte/store'

  interface Props {
    resourceId?: string
    mode?: 'create' | 'edit' | 'view'
    isFlyout?: boolean
    onSuccess?: (resourceId: string) => void
  }

  let { resourceId, mode, isFlyout = false, onSuccess }: Props = $props()

  let resource: Resource | null = $state(null)
  let newResource: ResourceCreate = $state({
    name: '',
    description: '',
    images: [],
    cost: undefined,
    tags: [],
    notes: undefined,
    metadata: { category: 'prop' } as any,
  })
  let loading = $state(true)
  let error = $state<string | null>(null)
  let saving = $state(false)
  let deleting = $state(false)
  let showDeleteDialog = $state(false)
  let activeTab = $state<'overview' | 'details' | 'gallery'>('overview')

  let costValue = $state(0)
  $effect(() => {
    if (mode === 'create') {
      costValue = newResource.cost ?? 0
    } else if (resource) {
      costValue = resource.cost ?? 0
    }
  })

  let costSetter = (v: number) => {
    if (mode === 'create') {
      newResource.cost = v || undefined
      costValue = v
    } else if (resource) {
      resource.cost = v || undefined
      costValue = v
    }
  }

  const currentMode = $derived(() => {
    if (mode) return mode
    if (!resourceId) return 'create'
    return resource ? 'edit' : 'view'
  })

  const isReadOnly = $derived(() => {
    return currentMode() === 'view'
  })

  const currentTags = $derived(() => {
    return currentMode() === 'create' ? (newResource.tags ?? []) : (resource?.tags ?? [])
  })

  const primaryImage = $derived(() => {
    if (currentMode() === 'create') {
      return newResource.images?.[0]
    }
    return resource?.images?.[0]
  })

  const createdDate = $derived(() => {
    if (currentMode() === 'create') return null
    if (!resource?.createdAt) return null
    return new Date(resource.createdAt)
  })

  const categoryOptions: { value: ResourceCategory; label: string }[] = [
    { value: 'prop', label: 'Prop' },
    { value: 'fabric', label: 'Fabric' },
    { value: 'wig', label: 'Wig' },
    { value: 'pattern', label: 'Pattern' },
    { value: 'costume-piece', label: 'Costume Piece' },
    { value: 'accessory', label: 'Accessory' },
    { value: 'material', label: 'Material' },
  ]

  let categoryValue = $state<ResourceCategory>('prop')
  
  $effect(() => {
    if (currentMode() === 'create') {
      categoryValue = (newResource.metadata?.category || 'prop') as ResourceCategory
    } else if (resource) {
      categoryValue = (resource.metadata?.category || 'prop') as ResourceCategory
    }
  })

  onMount(async () => {
    if (currentMode() === 'create') {
      loading = false
      return
    }

    if (!resourceId) {
      error = 'Invalid resource ID'
      loading = false
      return
    }

    try {
      const loaded = await resourceService.get(resourceId)
      if (loaded) {
        resource = loaded
      } else {
        error = 'Resource not found'
      }
    } catch (err: any) {
      error = err?.message || 'Failed to load resource'
    } finally {
      loading = false
    }
  })

  async function handleSaveField(field: string, value: any) {
    if (currentMode() === 'create') {
      if (field === 'name') newResource.name = value
      else if (field === 'description') newResource.description = value || undefined
      else if (field === 'cost') newResource.cost = value || undefined
      else if (field === 'images') newResource.images = value || []
      else if (field === 'tags') newResource.tags = value || []
      else if (field === 'notes') newResource.notes = value || undefined
      else if (field === 'category') {
        newResource.metadata = { ...newResource.metadata, category: value } as any
      }
      return
    }

    if (!resource || isReadOnly()) return
    
    try {
      const updates: any = { [field]: value }
      if (field === 'category') {
        updates.metadata = { ...resource.metadata, category: value } as any
      }
      await resourceService.update(resource.id, updates)
      const updated = await resourceService.get(resource.id)
      if (updated) {
        resource = updated
      }
    } catch (err: any) {
      error = err?.message || 'Failed to save'
    }
  }

  async function updateMetadataField(field: string, value: any) {
    if (currentMode() === 'create') {
      newResource.metadata = { ...newResource.metadata, [field]: value } as any
      return
    }

    if (!resource || isReadOnly()) return

    try {
      const updatedMetadata = { ...resource.metadata, [field]: value } as any
      await resourceService.update(resource.id, { metadata: updatedMetadata })
      const updated = await resourceService.get(resource.id)
      if (updated) {
        resource = updated
      }
    } catch (err: any) {
      error = err?.message || 'Failed to save metadata'
    }
  }

  function validateRequired(value: string): string | null {
    if (!value || value.trim().length === 0) {
      return 'This field is required'
    }
    return null
  }

  function addTag(tagToAdd: string) {
    const tags = currentTags()
    const trimmedTag = tagToAdd.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      if (currentMode() === 'create') {
        newResource.tags = [...(newResource.tags ?? []), trimmedTag]
      } else if (resource) {
        resource.tags = [...(resource.tags ?? []), trimmedTag]
        handleSaveField('tags', resource.tags)
      }
    }
  }

  function removeTag(tagToRemove: string) {
    if (currentMode() === 'create') {
      newResource.tags = (newResource.tags ?? []).filter(t => t !== tagToRemove)
    } else if (resource) {
      resource.tags = (resource.tags ?? []).filter(t => t !== tagToRemove)
      handleSaveField('tags', resource.tags)
    }
  }

  async function handleCreate() {
    error = null

    if (!newResource.name) {
      error = 'Name is required'
      return
    }

    // Category-specific validation
    const metadata = newResource.metadata as any
    if (categoryValue === 'fabric') {
      if (!metadata?.fabricType) {
        error = 'Fabric Type is required for fabric resources'
        return
      }
      if (!metadata?.color) {
        error = 'Color is required for fabric resources'
        return
      }
      if (!metadata?.quantity || metadata.quantity <= 0) {
        error = 'Quantity is required and must be greater than 0'
        return
      }
      if (!metadata?.unit) {
        error = 'Unit is required for fabric resources'
        return
      }
    } else if (categoryValue === 'wig') {
      if (!metadata?.color) {
        error = 'Color is required for wig resources'
        return
      }
      if (!metadata?.length) {
        error = 'Length is required for wig resources'
        return
      }
      if (!metadata?.style) {
        error = 'Style is required for wig resources'
        return
      }
    }

    const team = get(currentTeam)
    if (!team) {
      error = 'No team selected'
      return
    }

    saving = true

    try {
      const created = await resourceService.create(newResource)
      if (isFlyout && onSuccess) {
        onSuccess(created.id)
      } else {
        goto(`/resources/${created.id}`)
      }
    } catch (err: any) {
      error = err?.message || 'Failed to create resource'
      saving = false
    }
  }

  let nameValue = $state('')
  let descriptionValue = $state('')
  let notesValue = $state('')
  let imagesValue = $state<string[]>([])

  $effect(() => {
    if (currentMode() === 'create') {
      nameValue = newResource.name
      descriptionValue = newResource.description ?? ''
      notesValue = newResource.notes ?? ''
      imagesValue = newResource.images ?? []
    } else if (resource) {
      nameValue = resource.name
      descriptionValue = resource.description ?? ''
      notesValue = resource.notes ?? ''
      imagesValue = resource.images ?? []
    }
  })

  async function handleDelete() {
    if (!resource?.id || deleting) return

    deleting = true
    try {
      await resourceService.delete(resource.id)
      toast.success('Resource Deleted', 'The resource has been deleted successfully')
      showDeleteDialog = false
      
      // Navigate away after deletion
      if (isFlyout && onSuccess) {
        onSuccess('')
      } else {
        goto('/resources')
      }
    } catch (err: any) {
      toast.error('Failed to Delete', err?.message || 'Failed to delete resource')
      deleting = false
    }
  }

  // Export functions and state for parent components (e.g., flyout footer)
  // Note: Functions don't need to be reactive, only state values
  export { handleCreate, saving }
  const isValid = $derived(!!nameValue && nameValue.trim().length > 0)
  export { isValid }
</script>

{#if loading}
  <div class="flex items-center justify-center py-20">
    <div class="text-sm text-muted-foreground">Loading resource...</div>
  </div>
{:else if error && currentMode() !== 'create' && !resource}
  <div class="space-y-4 p-8">
    <p class="text-sm text-destructive">{error}</p>
    <Button variant="outline" onclick={() => goto('/resources')}>Back to Resources</Button>
  </div>
{:else}
  <div class="flex flex-col" class:h-full={!isFlyout} style={isFlyout ? 'min-height: 100%; display: flex; flex-direction: column;' : ''}>
    <!-- Header with Title and Quick Info -->
    <div class="flex-shrink-0 border-b bg-background px-10 py-6" class:px-8={!isFlyout}>
      <div class="space-y-4">
        {#if error && currentMode() === 'create'}
          <div class="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        {/if}

            <!-- Title and Actions Row -->
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 space-y-2">
                <InlineTextEditor
                  bind:value={nameValue}
                  editable={!isReadOnly()}
                  onSave={async (v: string) => {
                    if (currentMode() === 'create') {
                      newResource.name = v
                      nameValue = v
                    } else {
                      await handleSaveField('name', v)
                    }
                  }}
                  onValidate={validateRequired}
                  placeholder="Resource name"
                  variant="title"
                  className="text-3xl font-semibold"
                />
              </div>

              <!-- Delete Button (only in edit mode) -->
              {#if currentMode() === 'edit' && resource}
                <Button
                  variant="ghost"
                  size="icon"
                  onclick={() => showDeleteDialog = true}
                  class="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 class="size-4" />
                  <span class="sr-only">Delete resource</span>
                </Button>
              {/if}
            </div>

        <!-- Metadata Bar -->
        <div class="flex flex-wrap items-center gap-6 text-sm">
          <!-- Created Date -->
          {#if createdDate()}
            <div class="flex items-center gap-2 text-muted-foreground">
              <Calendar class="size-4" />
              <span>Created {createdDate()!.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          {/if}

          <!-- Category Badge -->
          <div class="flex items-center gap-2">
            <Package class="size-4 text-muted-foreground" />
            {#if !isReadOnly()}
              <InlineSelect
                value={categoryValue}
                editable={true}
                onSave={async (v: string) => {
                  categoryValue = v as ResourceCategory
                  await handleSaveField('category', v as ResourceCategory)
                }}
                options={categoryOptions}
                placeholder="Category"
              />
            {:else}
              <Badge>{categoryValue}</Badge>
            {/if}
          </div>

          <!-- Tags -->
          <div class="flex items-center gap-2">
            <TagIcon class="size-4 text-muted-foreground" />
            <div class="flex flex-wrap gap-1.5">
              {#each currentTags() as tag}
                <Badge class="border bg-muted px-2 py-0.5 text-xs">
                  {tag}
                  {#if !isReadOnly()}
                    <button onclick={() => removeTag(tag)} class="ml-1.5 opacity-60 hover:opacity-100">
                      <X class="size-3" />
                    </button>
                  {/if}
                </Badge>
              {/each}
              
              {#if !isReadOnly()}
                <TagSelector onAddTag={addTag} />
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="flex-shrink-0 border-b bg-background">
      <div class="flex gap-8" class:px-8={!isFlyout} class:px-10={isFlyout}>
        <button
          onclick={() => activeTab = 'overview'}
          class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'overview' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}"
        >
          Overview
        </button>
        <button
          onclick={() => activeTab = 'details'}
          class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'details' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}"
        >
          Details
        </button>
        <button
          onclick={() => activeTab = 'gallery'}
          class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'gallery' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}"
        >
          Gallery {#if imagesValue.length > 0}({imagesValue.length}){/if}
        </button>
      </div>
    </div>

    <!-- Tab Content - Moodboard Style -->
    <div class="flex-1 bg-muted/30" style="min-height: 0; overflow-y: auto;">
      <div class="p-8" class:p-10={isFlyout} class:p-8={!isFlyout}>
        {#if activeTab === 'overview'}
          <!-- Overview: Hero Image + Description + Quick Details -->
          <div class="mx-auto max-w-4xl space-y-8">
            <!-- Primary Hero Image -->
            <div class="overflow-hidden rounded-lg bg-background shadow-sm">
              {#if primaryImage()}
                <img src={primaryImage()} alt={nameValue || 'Resource'} class="w-full object-cover" style="max-height: 500px;" />
              {:else}
                <div class="flex aspect-video items-center justify-center bg-muted">
                  <div class="text-center space-y-3">
                    <ImageIcon class="mx-auto size-12 text-muted-foreground" />
                    <p class="text-sm text-muted-foreground">No image uploaded</p>
                    {#if !isReadOnly()}
                      <InlineImageUpload
                        images={imagesValue}
                        editable={true}
                        onSave={async (v: string[]) => {
                          if (currentMode() === 'create') {
                            newResource.images = v
                            imagesValue = v
                          } else if (resource) {
                            resource.images = v
                            imagesValue = v
                            await handleSaveField('images', v)
                          }
                        }}
                        multiple={true}
                      />
                    {/if}
                  </div>
                </div>
              {/if}
            </div>

            <!-- Description Section -->
            <div class="space-y-3 rounded-lg bg-background p-6 shadow-sm">
              <h3 class="text-sm font-medium text-muted-foreground">Description</h3>
              <InlineTextEditor
                bind:value={descriptionValue}
                editable={!isReadOnly()}
                onSave={async (v: string) => {
                  if (currentMode() === 'create') {
                    newResource.description = v || undefined
                    descriptionValue = v
                  } else if (resource) {
                    resource.description = v || undefined
                    descriptionValue = v
                    await handleSaveField('description', v || undefined)
                  }
                }}
                placeholder="Describe this resource..."
                variant="body"
                multiline={true}
                className="text-base leading-relaxed min-h-[120px]"
              />
            </div>

            <!-- Cost - Full Width -->
            {#if costValue > 0 || !isReadOnly()}
              <div class="group relative overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/20 p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md">
                <div class="mb-4 flex items-center gap-2">
                  <DollarSign class="size-4 text-muted-foreground" />
                  <span class="text-sm font-medium uppercase tracking-wider text-muted-foreground">Cost</span>
                </div>
                <InlineNumberEditor
                  bind:value={costValue}
                  editable={!isReadOnly()}
                  onSave={async (v: number) => {
                    costSetter(v)
                    await handleSaveField('cost', v)
                  }}
                  placeholder="$0.00"
                  min={0}
                />
              </div>
            {/if}
          </div>

        {:else if activeTab === 'gallery'}
          <!-- Gallery Tab: Moodboard Grid -->
          <div class="mx-auto max-w-6xl space-y-6">
            <!-- Upload Section -->
            {#if !isReadOnly()}
              <div class="rounded-lg border-2 border-dashed bg-background p-8 text-center">
                <Upload class="mx-auto mb-4 size-12 text-muted-foreground" />
                <p class="mb-2 text-sm font-medium">Upload resource images</p>
                <p class="mb-4 text-xs text-muted-foreground">Drag and drop images here, or click to browse</p>
                <InlineImageUpload
                  images={imagesValue}
                  editable={true}
                  folder="resources"
                  onSave={async (v: string[]) => {
                    if (currentMode() === 'create') {
                      newResource.images = v
                      imagesValue = v
                    } else if (resource) {
                      resource.images = v
                      imagesValue = v
                      await handleSaveField('images', v)
                    }
                  }}
                  multiple={true}
                />
              </div>
            {/if}

            <!-- Image Grid -->
            {#if imagesValue.length > 0}
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {#each imagesValue as imageUrl (imageUrl)}
                  <div class="group relative aspect-square overflow-hidden rounded-lg bg-muted shadow-sm transition-all hover:shadow-md">
                    <img src={imageUrl} alt="Resource" class="size-full object-cover" />
                    {#if !isReadOnly()}
                      <button
                        onclick={() => {
                          const updated = imagesValue.filter(img => img !== imageUrl)
                          if (currentMode() === 'create') {
                            newResource.images = updated
                            imagesValue = updated
                          } else if (resource) {
                            resource.images = updated
                            imagesValue = updated
                            handleSaveField('images', updated)
                          }
                        }}
                        class="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X class="size-4 text-destructive" />
                      </button>
                    {/if}
                  </div>
                {/each}
              </div>
            {:else if isReadOnly()}
              <div class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-background p-12 text-center">
                <ImageIcon class="mx-auto mb-4 size-12 text-muted-foreground" />
                <p class="text-sm text-muted-foreground">No images</p>
              </div>
            {/if}
          </div>

        {:else if activeTab === 'details'}
          <!-- Details Tab -->
          <div class="mx-auto max-w-4xl space-y-6">
            <!-- Notes Section -->
            <div class="space-y-3 rounded-lg bg-background p-6 shadow-sm">
              <h3 class="text-sm font-medium text-muted-foreground">Notes</h3>
              <InlineTextEditor
                bind:value={notesValue}
                editable={!isReadOnly()}
                onSave={async (v: string) => {
                  if (currentMode() === 'create') {
                    newResource.notes = v || undefined
                    notesValue = v
                  } else if (resource) {
                    resource.notes = v || undefined
                    notesValue = v
                    await handleSaveField('notes', v || undefined)
                  }
                }}
                placeholder="Add notes about this resource..."
                variant="body"
                multiline={true}
                className="text-base leading-relaxed min-h-[120px]"
              />
            </div>

            <!-- Category-specific metadata fields -->
            <div class="rounded-lg bg-background p-6 shadow-sm">
              <h3 class="mb-4 text-sm font-medium text-muted-foreground">Category Details</h3>
              
              {#if categoryValue === 'prop'}
                <!-- Prop Fields -->
                <div class="space-y-4">
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div class="mb-2 block text-sm font-medium">Dimensions</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.dimensions || (newResource.metadata as any)?.dimensions || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('dimensions', v || undefined)
                        }}
                        placeholder="e.g., 12 x 8 x 4 inches"
                      />
                    </div>
                    <div>
                      <div class="mb-2 block text-sm font-medium">Weight</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.weight || (newResource.metadata as any)?.weight || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('weight', v || undefined)
                        }}
                        placeholder="e.g., 2 lbs"
                        
                      />
                    </div>
                  </div>
                  <div>
                    <div class="mb-2 block text-sm font-medium">Material</div>
                    <InlineTextEditor
                      value={(resource?.metadata as any)?.material || (newResource.metadata as any)?.material || ''}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        await updateMetadataField('material', v || undefined)
                      }}
                        placeholder="e.g., EVA foam"
                    />
                  </div>
                  <div class="flex flex-wrap gap-4">
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(resource?.metadata as any)?.fragile ?? (newResource.metadata as any)?.fragile ?? false}
                        onchange={async (e) => {
                          await updateMetadataField('fragile', e.currentTarget.checked)
                        }}
                        disabled={isReadOnly()}
                        class="size-4 rounded border-gray-300"
                      />
                      <span class="text-sm">Fragile</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(resource?.metadata as any)?.requiresAssembly ?? (newResource.metadata as any)?.requiresAssembly ?? false}
                        onchange={async (e) => {
                          await updateMetadataField('requiresAssembly', e.currentTarget.checked)
                        }}
                        disabled={isReadOnly()}
                        class="size-4 rounded border-gray-300"
                      />
                      <span class="text-sm">Requires Assembly</span>
                    </div>
                  </div>
                  <div>
                    <div class="mb-2 block text-sm font-medium">Storage Location</div>
                    <InlineTextEditor
                      value={(resource?.metadata as any)?.storageLocation || (newResource.metadata as any)?.storageLocation || ''}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        await updateMetadataField('storageLocation', v || undefined)
                      }}
                      placeholder="e.g., Basement shelf 3"
                      
                    />
                  </div>
                </div>

              {:else if categoryValue === 'fabric'}
                <!-- Fabric Fields -->
                <div class="space-y-4">
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div class="mb-2 block text-sm font-medium">Fabric Type *</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.fabricType || (newResource.metadata as any)?.fabricType || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('fabricType', v || undefined)
                        }}
                        placeholder="e.g., Cotton"
                        
                      />
                    </div>
                    <div>
                      <div class="mb-2 block text-sm font-medium">Color *</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.color || (newResource.metadata as any)?.color || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('color', v || undefined)
                        }}
                        placeholder="e.g., Royal Blue"
                        
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div class="mb-2 block text-sm font-medium">Quantity *</div>
                      <InlineNumberEditor
                        value={((resource?.metadata as any)?.quantity || (newResource.metadata as any)?.quantity || 0) * 100}
                        editable={!isReadOnly()}
                        onSave={async (v: number) => {
                          await updateMetadataField('quantity', v / 100)
                        }}
                        placeholder="0.00"
                        min={0}
                      />
                    </div>
                    <div>
                      <div class="mb-2 block text-sm font-medium">Unit *</div>
                      <InlineSelect
                        value={(resource?.metadata as any)?.unit || (newResource.metadata as any)?.unit || 'yards'}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('unit', v as 'yards' | 'meters')
                        }}
                        options={[
                          { value: 'yards', label: 'Yards' },
                          { value: 'meters', label: 'Meters' },
                        ]}
                        placeholder="Select unit"
                      />
                    </div>
                  </div>
                  <div>
                    <div class="mb-2 block text-sm font-medium">Width (inches)</div>
                    <InlineNumberEditor
                      value={((resource?.metadata as any)?.width || (newResource.metadata as any)?.width || 0) * 100}
                      editable={!isReadOnly()}
                      onSave={async (v: number) => {
                        await updateMetadataField('width', v / 100)
                      }}
                      placeholder="0"
                      min={0}
                    />
                  </div>
                  <div class="flex flex-wrap gap-4">
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(resource?.metadata as any)?.stretch ?? (newResource.metadata as any)?.stretch ?? false}
                        onchange={async (e) => {
                          await updateMetadataField('stretch', e.currentTarget.checked)
                        }}
                        disabled={isReadOnly()}
                        class="size-4 rounded border-gray-300"
                      />
                      <span class="text-sm">Stretch</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(resource?.metadata as any)?.washable ?? (newResource.metadata as any)?.washable ?? false}
                        onchange={async (e) => {
                          await updateMetadataField('washable', e.currentTarget.checked)
                        }}
                        disabled={isReadOnly()}
                        class="size-4 rounded border-gray-300"
                      />
                      <span class="text-sm">Washable</span>
                    </div>
                  </div>
                </div>

              {:else if categoryValue === 'wig'}
                <!-- Wig Fields -->
                <div class="space-y-4">
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <div class="mb-2 block text-sm font-medium">Color *</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.color || (newResource.metadata as any)?.color || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('color', v || undefined)
                        }}
                        placeholder="e.g., Silver"
                        
                      />
                    </div>
                    <div>
                      <div class="mb-2 block text-sm font-medium">Length *</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.length || (newResource.metadata as any)?.length || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('length', v || undefined)
                        }}
                        placeholder="e.g., waist-length"
                        
                      />
                    </div>
                    <div>
                      <div class="mb-2 block text-sm font-medium">Style *</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.style || (newResource.metadata as any)?.style || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('style', v || undefined)
                        }}
                        placeholder="e.g., straight"
                        
                      />
                    </div>
                  </div>
                  <div>
                    <div class="mb-2 block text-sm font-medium">Lace Type</div>
                    <InlineSelect
                      value={(resource?.metadata as any)?.laceType || (newResource.metadata as any)?.laceType || 'none'}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        await updateMetadataField('laceType', v as 'none' | 'lace-front' | 'full-lace')
                      }}
                      options={[
                        { value: 'none', label: 'None' },
                        { value: 'lace-front', label: 'Lace Front' },
                        { value: 'full-lace', label: 'Full Lace' },
                      ]}
                      placeholder="Select lace type"
                    />
                  </div>
                  <div class="flex flex-wrap gap-4">
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(resource?.metadata as any)?.needsStyling ?? (newResource.metadata as any)?.needsStyling ?? false}
                        onchange={async (e) => {
                          await updateMetadataField('needsStyling', e.currentTarget.checked)
                        }}
                        disabled={isReadOnly()}
                        class="size-4 rounded border-gray-300"
                      />
                      <span class="text-sm">Needs Styling</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(resource?.metadata as any)?.heatResistant ?? (newResource.metadata as any)?.heatResistant ?? false}
                        onchange={async (e) => {
                          await updateMetadataField('heatResistant', e.currentTarget.checked)
                        }}
                        disabled={isReadOnly()}
                        class="size-4 rounded border-gray-300"
                      />
                      <span class="text-sm">Heat Resistant</span>
                    </div>
                  </div>
                </div>

              {:else if categoryValue === 'pattern'}
                <!-- Pattern Fields -->
                <div class="space-y-4">
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div class="mb-2 block text-sm font-medium">Pattern Company</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.patternCompany || (newResource.metadata as any)?.patternCompany || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('patternCompany', v || undefined)
                        }}
                        placeholder="e.g., Simplicity"
                        
                      />
                    </div>
                    <div>
                      <div class="mb-2 block text-sm font-medium">Pattern Number</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.patternNumber || (newResource.metadata as any)?.patternNumber || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('patternNumber', v || undefined)
                        }}
                        placeholder="e.g., S1234"
                        
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div class="mb-2 block text-sm font-medium">Size</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.size || (newResource.metadata as any)?.size || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('size', v || undefined)
                        }}
                        placeholder="e.g., Medium"
                        
                      />
                    </div>
                    <div>
                      <div class="mb-2 block text-sm font-medium">Difficulty</div>
                      <InlineSelect
                        value={(resource?.metadata as any)?.difficulty || (newResource.metadata as any)?.difficulty || 'beginner'}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('difficulty', v as 'beginner' | 'intermediate' | 'advanced')
                        }}
                        options={[
                          { value: 'beginner', label: 'Beginner' },
                          { value: 'intermediate', label: 'Intermediate' },
                          { value: 'advanced', label: 'Advanced' },
                        ]}
                        placeholder="Select difficulty"
                      />
                    </div>
                  </div>
                  <div>
                    <div class="mb-2 block text-sm font-medium">Digital File URL</div>
                    <InlineTextEditor
                      value={(resource?.metadata as any)?.digitalFileUrl || (newResource.metadata as any)?.digitalFileUrl || ''}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        await updateMetadataField('digitalFileUrl', v || undefined)
                      }}
                      placeholder="https://..."
                      
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(resource?.metadata as any)?.physicalPattern ?? (newResource.metadata as any)?.physicalPattern ?? false}
                      onchange={async (e) => {
                        await updateMetadataField('physicalPattern', e.currentTarget.checked)
                      }}
                      disabled={isReadOnly()}
                      class="size-4 rounded border-gray-300"
                    />
                    <span class="text-sm">Physical Pattern</span>
                  </div>
                </div>

              {:else if categoryValue === 'costume-piece'}
                <!-- Costume Piece Fields -->
                <div class="space-y-4">
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div class="mb-2 block text-sm font-medium">Piece Type</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.pieceType || (newResource.metadata as any)?.pieceType || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('pieceType', v || undefined)
                        }}
                        placeholder="e.g., Jacket"
                        
                      />
                    </div>
                    <div>
                      <div class="mb-2 block text-sm font-medium">Size</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.size || (newResource.metadata as any)?.size || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('size', v || undefined)
                        }}
                        placeholder="e.g., Medium"
                        
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div class="mb-2 block text-sm font-medium">Material</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.material || (newResource.metadata as any)?.material || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('material', v || undefined)
                        }}
                        placeholder="e.g., Polyester"
                        
                      />
                    </div>
                    <div>
                      <div class="mb-2 block text-sm font-medium">Color</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.color || (newResource.metadata as any)?.color || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('color', v || undefined)
                        }}
                        placeholder="e.g., Black"
                        
                      />
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(resource?.metadata as any)?.needsAlterations ?? (newResource.metadata as any)?.needsAlterations ?? false}
                      onchange={async (e) => {
                        await updateMetadataField('needsAlterations', e.currentTarget.checked)
                      }}
                      disabled={isReadOnly()}
                      class="size-4 rounded border-gray-300"
                    />
                    <span class="text-sm">Needs Alterations</span>
                  </div>
                </div>

              {:else if categoryValue === 'accessory'}
                <!-- Accessory Fields -->
                <div class="space-y-4">
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div class="mb-2 block text-sm font-medium">Accessory Type</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.accessoryType || (newResource.metadata as any)?.accessoryType || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('accessoryType', v || undefined)
                        }}
                        placeholder="e.g., Jewelry"
                        
                      />
                    </div>
                    <div>
                      <div class="mb-2 block text-sm font-medium">Material</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.material || (newResource.metadata as any)?.material || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('material', v || undefined)
                        }}
                        placeholder="e.g., Metal"
                        
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div class="mb-2 block text-sm font-medium">Color</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.color || (newResource.metadata as any)?.color || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('color', v || undefined)
                        }}
                        placeholder="e.g., Gold"
                        
                      />
                    </div>
                    <div>
                      <div class="mb-2 block text-sm font-medium">Quantity</div>
                      <InlineNumberEditor
                        value={((resource?.metadata as any)?.quantity || (newResource.metadata as any)?.quantity || 0) * 100}
                        editable={!isReadOnly()}
                        onSave={async (v: number) => {
                          await updateMetadataField('quantity', v / 100)
                        }}
                        placeholder="1"
                        min={0}
                      />
                    </div>
                  </div>
                </div>

              {:else if categoryValue === 'material'}
                <!-- Material Fields -->
                <div class="space-y-4">
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div class="mb-2 block text-sm font-medium">Material Type</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.materialType || (newResource.metadata as any)?.materialType || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('materialType', v || undefined)
                        }}
                        placeholder="e.g., Foam"
                        
                      />
                    </div>
                    <div>
                      <div class="mb-2 block text-sm font-medium">Brand</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.brand || (newResource.metadata as any)?.brand || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('brand', v || undefined)
                        }}
                        placeholder="e.g., Foam Factory"
                        
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div class="mb-2 block text-sm font-medium">Color Variant</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.colorVariant || (newResource.metadata as any)?.colorVariant || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('colorVariant', v || undefined)
                        }}
                        placeholder="e.g., Red"
                        
                      />
                    </div>
                    <div>
                      <div class="mb-2 block text-sm font-medium">Unit</div>
                      <InlineTextEditor
                        value={(resource?.metadata as any)?.unit || (newResource.metadata as any)?.unit || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          await updateMetadataField('unit', v || undefined)
                        }}
                        placeholder="e.g., sheets"
                        
                      />
                    </div>
                  </div>
                  <div>
                    <div class="mb-2 block text-sm font-medium">Quantity</div>
                    <InlineNumberEditor
                      value={((resource?.metadata as any)?.quantity || (newResource.metadata as any)?.quantity || 0) * 100}
                      editable={!isReadOnly()}
                      onSave={async (v: number) => {
                        await updateMetadataField('quantity', v / 100)
                      }}
                      placeholder="0"
                      min={0}
                    />
                  </div>
                </div>
              {/if}
            </div>

            <!-- Used in Projects Section -->
            {#if resource && currentMode() !== 'create'}
              <UsedInProjectsSection resourceId={resource.id} />
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Comments Section -->
    {#if resource}
      <div class="border-t py-6" class:px-8={!isFlyout} class:px-10={isFlyout}>
        <CommentBox entityType="resource" entityId={resource.id} editable={!isReadOnly()} />
      </div>
    {/if}

    <!-- Delete Confirmation Dialog -->
    <Dialog bind:open={showDeleteDialog} title="Delete Resource" description="Are you sure you want to delete this resource? This action cannot be undone.">
      <DialogFooter>
        <Button
          variant="outline"
          onclick={() => showDeleteDialog = false}
          disabled={deleting}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onclick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete Resource'}
        </Button>
      </DialogFooter>
    </Dialog>

    <!-- Create Mode Actions - Render buttons when in flyout mode, positioned at bottom -->
    {#if currentMode() === 'create' && isFlyout}
      <div class="mt-auto flex-shrink-0 border-t bg-background px-10 py-4">
        <div class="flex gap-3">
          <Button
            variant="default"
            class="flex-1"
            onclick={handleCreate}
            disabled={saving || !nameValue}
          >
            {saving ? 'Creating...' : 'Create Resource'}
          </Button>
          <Button
            variant="outline"
            class="flex-1"
            onclick={() => {
              if (onSuccess) {
                onSuccess('')
              }
            }}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </div>
    {/if}
    
    <!-- Create Mode Actions - Only show when not in flyout (normal page view) -->
    {#if currentMode() === 'create' && !isFlyout}
      <div class="sticky bottom-0 border-t bg-background/95 px-8 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex gap-3">
          <Button
            variant="default"
            class="flex-1"
            onclick={handleCreate}
            disabled={saving || !nameValue}
          >
            {saving ? 'Creating...' : 'Create Resource'}
          </Button>
          <Button
            variant="outline"
            class="flex-1 bg-transparent"
            onclick={() => {
              goto('/resources')
            }}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </div>
    {/if}
  </div>
{/if}

