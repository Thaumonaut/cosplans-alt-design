<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { toolService } from '$lib/api/services/toolService'
  import { currentTeam } from '$lib/stores/teams'
  import { Button } from '$lib/components/ui'
  import { Badge } from 'flowbite-svelte'
  import { Calendar, X, Tag as TagIcon, Upload, ImageIcon, Wrench, Camera } from 'lucide-svelte'
  import InlineTextEditor from '$lib/components/base/InlineTextEditor.svelte'
  import InlineNumberEditor from '$lib/components/base/InlineNumberEditor.svelte'
  import InlineSelect from '$lib/components/base/InlineSelect.svelte'
  import InlineCheckbox from '$lib/components/base/InlineCheckbox.svelte'
  import InlineDatePicker from '$lib/components/base/InlineDatePicker.svelte'
  import InlineImageUpload from '$lib/components/base/InlineImageUpload.svelte'
  import TagSelector from '$lib/components/base/TagSelector.svelte'
  import CommentBox from '$lib/components/base/CommentBox.svelte'
  import type { Tool, ToolCreate, ToolCategory, ToolCondition } from '$lib/types/domain/tool'
  import { get } from 'svelte/store'

  interface Props {
    toolId?: string
    mode?: 'create' | 'edit' | 'view'
    isFlyout?: boolean
    onSuccess?: (toolId: string) => void
  }

  let { toolId, mode, isFlyout = false, onSuccess }: Props = $props()

  let tool: Tool | null = $state(null)
  let newTool: ToolCreate = $state({
    name: '',
    description: '',
    images: [],
    tags: [],
    notes: undefined,
    metadata: { category: 'crafting-tool' } as any,
  })
  let loading = $state(true)
  let error = $state<string | null>(null)
  let saving = $state(false)
  let activeTab = $state<'overview' | 'details'>('overview')

  const currentMode = $derived(() => {
    if (mode) return mode
    if (!toolId) return 'create'
    return tool ? 'edit' : 'view'
  })

  const isReadOnly = $derived(() => {
    return currentMode() === 'view'
  })

  const currentTags = $derived(() => {
    return currentMode() === 'create' ? (newTool.tags ?? []) : (tool?.tags ?? [])
  })

  const primaryImage = $derived(() => {
    if (currentMode() === 'create') {
      return newTool.images?.[0]
    }
    return tool?.images?.[0]
  })

  const createdDate = $derived(() => {
    if (currentMode() === 'create') return null
    if (!tool?.createdAt) return null
    return new Date(tool.createdAt)
  })

  const categoryOptions: { value: ToolCategory; label: string }[] = [
    { value: 'crafting-tool', label: 'Crafting Tool' },
    { value: 'shoot-equipment', label: 'Shoot Equipment' },
  ]

  const conditionOptions: { value: ToolCondition; label: string }[] = [
    { value: 'new', label: 'New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'needs-repair', label: 'Needs Repair' },
  ]

  let categoryValue = $state<ToolCategory>('crafting-tool')
  
  $effect(() => {
    if (currentMode() === 'create') {
      categoryValue = (newTool.metadata?.category || 'crafting-tool') as ToolCategory
    } else if (tool) {
      categoryValue = (tool.metadata?.category || 'crafting-tool') as ToolCategory
    }
  })

  onMount(async () => {
    if (currentMode() === 'create') {
      loading = false
      return
    }

    if (!toolId) {
      error = 'Invalid tool ID'
      loading = false
      return
    }

    try {
      const loaded = await toolService.get(toolId)
      if (loaded) {
        tool = loaded
      } else {
        error = 'Tool not found'
      }
    } catch (err: any) {
      error = err?.message || 'Failed to load tool'
    } finally {
      loading = false
    }
  })

  async function handleSaveField(field: string, value: any) {
    if (currentMode() === 'create') {
      if (field === 'name') newTool.name = value
      else if (field === 'description') newTool.description = value || undefined
      else if (field === 'images') newTool.images = value || []
      else if (field === 'tags') newTool.tags = value || []
      else if (field === 'notes') newTool.notes = value || undefined
      else if (field === 'category') {
        newTool.metadata = { ...newTool.metadata, category: value } as any
      }
      return
    }

    if (!tool || isReadOnly()) return
    
    try {
      const updates: any = {}
      if (field === 'name') updates.name = value
      else if (field === 'description') updates.description = value || undefined
      else if (field === 'images') updates.images = value || []
      else if (field === 'tags') updates.tags = value || []
      else if (field === 'notes') updates.notes = value || undefined
      else if (field === 'category') {
        updates.metadata = { ...tool.metadata, category: value }
      } else if (field.startsWith('metadata.')) {
        const metadataField = field.replace('metadata.', '')
        updates.metadata = { ...tool.metadata, [metadataField]: value }
      }

      const updated = await toolService.update(tool.id, updates)
      if (updated) {
        tool = updated
      }
    } catch (err: any) {
      console.error('Failed to save field:', err)
      throw err
    }
  }

  function validateRequired(value: string): string | null {
    if (!value || value.trim().length === 0) {
      return 'This field is required'
    }
    return null
  }

  function addTag(tag: string) {
    const tags = currentMode() === 'create' ? (newTool.tags ?? []) : (tool?.tags ?? [])
    if (!tags.includes(tag) && tag.trim()) {
      if (currentMode() === 'create') {
        newTool.tags = [...tags, tag.trim()]
      } else if (tool) {
        handleSaveField('tags', [...tags, tag.trim()])
      }
    }
  }

  function removeTag(tag: string) {
    const tags = currentMode() === 'create' ? (newTool.tags ?? []) : (tool?.tags ?? [])
    if (currentMode() === 'create') {
      newTool.tags = tags.filter((t) => t !== tag)
    } else if (tool) {
      handleSaveField('tags', tags.filter((t) => t !== tag))
    }
  }

  async function handleCreate() {
    if (!newTool.name.trim()) {
      error = 'Name is required'
      return
    }

    if (!newTool.metadata?.category) {
      error = 'Category is required'
      return
    }

    const team = get(currentTeam)
    if (!team) {
      error = 'No team selected'
      return
    }

    saving = true

    try {
      const created = await toolService.create(newTool)
      if (isFlyout && onSuccess) {
        onSuccess(created.id)
      } else {
        goto(`/tools/${created.id}`)
      }
    } catch (err: any) {
      error = err?.message || 'Failed to create tool'
      saving = false
    }
  }

  let nameValue = $state('')
  let descriptionValue = $state('')
  let notesValue = $state('')
  let imagesValue = $state<string[]>([])

  $effect(() => {
    if (currentMode() === 'create') {
      nameValue = newTool.name
      descriptionValue = newTool.description ?? ''
      notesValue = newTool.notes ?? ''
      imagesValue = newTool.images ?? []
    } else if (tool) {
      nameValue = tool.name
      descriptionValue = tool.description ?? ''
      notesValue = tool.notes ?? ''
      imagesValue = tool.images ?? []
    }
  })

  // Metadata helpers
  const metadata = $derived(() => {
    return currentMode() === 'create' ? newTool.metadata : tool?.metadata
  })

  const isCraftingTool = $derived(() => metadata()?.category === 'crafting-tool')
  const isShootEquipment = $derived(() => metadata()?.category === 'shoot-equipment')

  // Type-safe metadata accessors
  const craftingMetadata = $derived(() => {
    const meta = metadata()
    return meta && meta.category === 'crafting-tool' ? meta : null
  })

  const shootMetadata = $derived(() => {
    const meta = metadata()
    return meta && meta.category === 'shoot-equipment' ? meta : null
  })
</script>

{#if loading}
  <div class="flex items-center justify-center py-20">
    <div class="text-sm text-muted-foreground">Loading tool...</div>
  </div>
{:else if error && currentMode() !== 'create' && !tool}
  <div class="space-y-4 p-8">
    <p class="text-sm text-destructive">{error}</p>
    <Button variant="outline" onclick={() => goto('/tools')}>Back to Tools</Button>
  </div>
{:else}
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="border-b bg-background px-8 py-6">
      <div class="space-y-4">
        {#if error && currentMode() === 'create'}
          <div class="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        {/if}

        <!-- Title -->
        <div class="space-y-2">
          <InlineTextEditor
            bind:value={nameValue}
            editable={!isReadOnly()}
            onSave={async (v: string) => {
              if (currentMode() === 'create') {
                newTool.name = v
                nameValue = v
              } else {
                await handleSaveField('name', v)
              }
            }}
            onValidate={validateRequired}
            placeholder="Tool name"
            variant="title"
            className="text-3xl font-semibold"
          />
        </div>

        <!-- Metadata Bar -->
        <div class="flex flex-wrap items-center gap-6 text-sm">
          {#if createdDate()}
            <div class="flex items-center gap-2 text-muted-foreground">
              <Calendar class="size-4" />
              <span>Created {createdDate()!.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          {/if}

          <!-- Category Badge -->
          <div class="flex items-center gap-2">
            {#if isCraftingTool()}
              <Wrench class="size-4 text-muted-foreground" />
            {:else}
              <Camera class="size-4 text-muted-foreground" />
            {/if}
            {#if !isReadOnly()}
              <InlineSelect
                value={categoryValue}
                editable={true}
                onSave={async (v: string) => {
                  categoryValue = v as ToolCategory
                  await handleSaveField('category', v as ToolCategory)
                }}
                options={categoryOptions}
                placeholder="Category"
              />
            {:else}
              <Badge>{categoryValue === 'crafting-tool' ? 'Crafting Tool' : 'Shoot Equipment'}</Badge>
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
    <div class="border-b bg-background">
      <div class="flex gap-8 px-8">
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
      </div>
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-y-auto bg-muted/30">
      <div class="p-8">
        {#if activeTab === 'overview'}
          <!-- Overview: Hero Image + Description -->
          <div class="mx-auto max-w-4xl space-y-8">
            <!-- Primary Hero Image -->
            <div class="overflow-hidden rounded-lg bg-background shadow-sm">
              {#if primaryImage()}
                <img src={primaryImage()} alt={nameValue || 'Tool'} class="w-full object-cover" style="max-height: 500px;" />
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
                            newTool.images = v
                            imagesValue = v
                          } else if (tool) {
                            tool.images = v
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

            <!-- Description -->
            <div class="space-y-2">
              <h3 class="text-sm font-medium text-muted-foreground">Description</h3>
              <InlineTextEditor
                bind:value={descriptionValue}
                editable={!isReadOnly()}
                onSave={async (v: string) => {
                  if (currentMode() === 'create') {
                    newTool.description = v || undefined
                    descriptionValue = v
                  } else {
                    await handleSaveField('description', v)
                  }
                }}
                placeholder="Add a description..."
                multiline={true}
                className="min-h-[100px]"
              />
            </div>

            <!-- Notes -->
            <div class="space-y-2">
              <h3 class="text-sm font-medium text-muted-foreground">Notes</h3>
              <InlineTextEditor
                bind:value={notesValue}
                editable={!isReadOnly()}
                onSave={async (v: string) => {
                  if (currentMode() === 'create') {
                    newTool.notes = v || undefined
                    notesValue = v
                  } else {
                    await handleSaveField('notes', v)
                  }
                }}
                placeholder="Add notes..."
                multiline={true}
                className="min-h-[100px]"
              />
            </div>
          </div>
        {:else if activeTab === 'details'}
          <!-- Details: Category-specific fields -->
          <div class="mx-auto max-w-4xl space-y-6">
            {#if isCraftingTool()}
              <!-- Crafting Tool Fields -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold">Crafting Tool Information</h3>
                
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div class="space-y-2">
                    <label for="brand" class="text-sm font-medium">Brand</label>
                    <InlineTextEditor
                      value={craftingMetadata()?.brand || ''}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        if (currentMode() === 'create') {
                          newTool.metadata = { ...newTool.metadata, brand: v || undefined } as any
                        } else {
                          await handleSaveField('metadata.brand', v || undefined)
                        }
                      }}
                      placeholder="Brand name"
                    />
                  </div>

                  <div class="space-y-2">
                    <label for="model" class="text-sm font-medium">Model</label>
                    <InlineTextEditor
                      value={craftingMetadata()?.model || ''}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        if (currentMode() === 'create') {
                          newTool.metadata = { ...newTool.metadata, model: v || undefined } as any
                        } else {
                          await handleSaveField('metadata.model', v || undefined)
                        }
                      }}
                      placeholder="Model number"
                    />
                  </div>

                  <div class="space-y-2">
                    <label for="purchaseDate" class="text-sm font-medium">Purchase Date</label>
                    <InlineDatePicker
                      value={craftingMetadata()?.purchaseDate || ''}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        if (currentMode() === 'create') {
                          newTool.metadata = { ...newTool.metadata, purchaseDate: v || undefined } as any
                        } else {
                          await handleSaveField('metadata.purchaseDate', v || undefined)
                        }
                      }}
                      placeholder="Purchase date"
                    />
                  </div>

                  <div class="space-y-2">
                    <label for="purchasePrice" class="text-sm font-medium">Purchase Price</label>
                    <InlineNumberEditor
                      value={craftingMetadata()?.purchasePrice || 0}
                      editable={!isReadOnly()}
                      onSave={async (v: number) => {
                        if (currentMode() === 'create') {
                          newTool.metadata = { ...newTool.metadata, purchasePrice: v || undefined } as any
                        } else {
                          await handleSaveField('metadata.purchasePrice', v || undefined)
                        }
                      }}
                      placeholder="0.00"
                    />
                  </div>

                  <div class="space-y-2">
                    <label for="condition" class="text-sm font-medium">Condition</label>
                    <InlineSelect
                      value={craftingMetadata()?.condition || 'good'}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        if (currentMode() === 'create') {
                          newTool.metadata = { ...newTool.metadata, condition: v as ToolCondition } as any
                        } else {
                          await handleSaveField('metadata.condition', v as ToolCondition)
                        }
                      }}
                      options={conditionOptions}
                      placeholder="Condition"
                    />
                  </div>

                  <div class="space-y-2">
                    <label for="storageLocation" class="text-sm font-medium">Storage Location</label>
                    <InlineTextEditor
                      value={craftingMetadata()?.storageLocation || ''}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        if (currentMode() === 'create') {
                          newTool.metadata = { ...newTool.metadata, storageLocation: v || undefined } as any
                        } else {
                          await handleSaveField('metadata.storageLocation', v || undefined)
                        }
                      }}
                      placeholder="Where is this stored?"
                    />
                  </div>

                  <div class="space-y-2">
                    <label for="manualUrl" class="text-sm font-medium">Manual URL</label>
                    <InlineTextEditor
                      value={craftingMetadata()?.manualUrl || ''}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        if (currentMode() === 'create') {
                          newTool.metadata = { ...newTool.metadata, manualUrl: v || undefined } as any
                        } else {
                          await handleSaveField('metadata.manualUrl', v || undefined)
                        }
                      }}
                      placeholder="https://..."
                    />
                  </div>

                  <div class="space-y-2">
                    <label for="warrantyExpires" class="text-sm font-medium">Warranty Expires</label>
                    <InlineDatePicker
                      value={craftingMetadata()?.warrantyExpires || ''}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        if (currentMode() === 'create') {
                          newTool.metadata = { ...newTool.metadata, warrantyExpires: v || undefined } as any
                        } else {
                          await handleSaveField('metadata.warrantyExpires', v || undefined)
                        }
                      }}
                      placeholder="Warranty expiration date"
                    />
                  </div>
                </div>
              </div>
            {:else if isShootEquipment()}
              <!-- Shoot Equipment Fields -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold">Shoot Equipment Information</h3>
                
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div class="space-y-2">
                    <label for="brand-shoot" class="text-sm font-medium">Brand</label>
                    <InlineTextEditor
                      value={shootMetadata()?.brand || ''}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        if (currentMode() === 'create') {
                          newTool.metadata = { ...newTool.metadata, brand: v || undefined } as any
                        } else {
                          await handleSaveField('metadata.brand', v || undefined)
                        }
                      }}
                      placeholder="Brand name"
                    />
                  </div>

                  <div class="space-y-2">
                    <label for="model-shoot" class="text-sm font-medium">Model</label>
                    <InlineTextEditor
                      value={shootMetadata()?.model || ''}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        if (currentMode() === 'create') {
                          newTool.metadata = { ...newTool.metadata, model: v || undefined } as any
                        } else {
                          await handleSaveField('metadata.model', v || undefined)
                        }
                      }}
                      placeholder="Model number"
                    />
                  </div>

                  <div class="space-y-2">
                    <label for="owned" class="text-sm font-medium">Owned</label>
                    <InlineCheckbox
                      checked={shootMetadata()?.owned ?? false}
                      editable={!isReadOnly()}
                      onSave={async (v: boolean) => {
                        if (currentMode() === 'create') {
                          newTool.metadata = { ...newTool.metadata, owned: v } as any
                        } else {
                          await handleSaveField('metadata.owned', v)
                        }
                      }}
                      label="I own this equipment"
                    />
                  </div>

                  {#if !shootMetadata()?.owned}
                    <div class="space-y-2">
                      <label for="rentalCost" class="text-sm font-medium">Rental Cost</label>
                      <InlineNumberEditor
                        value={shootMetadata()?.rentalCost || 0}
                        editable={!isReadOnly()}
                        onSave={async (v: number) => {
                          if (currentMode() === 'create') {
                            newTool.metadata = { ...newTool.metadata, rentalCost: v || null } as any
                          } else {
                            await handleSaveField('metadata.rentalCost', v || null)
                          }
                        }}
                        placeholder="0.00"
                      />
                    </div>

                    <div class="space-y-2">
                      <label for="owner" class="text-sm font-medium">Owner</label>
                      <InlineTextEditor
                        value={shootMetadata()?.owner || ''}
                        editable={!isReadOnly()}
                        onSave={async (v: string) => {
                          if (currentMode() === 'create') {
                            newTool.metadata = { ...newTool.metadata, owner: v || null } as any
                          } else {
                            await handleSaveField('metadata.owner', v || null)
                          }
                        }}
                        placeholder="Who owns this equipment?"
                      />
                    </div>
                  {/if}

                  <div class="space-y-2 md:col-span-2">
                    <label for="specifications" class="text-sm font-medium">Specifications</label>
                    <InlineTextEditor
                      value={shootMetadata()?.specifications || ''}
                      editable={!isReadOnly()}
                      onSave={async (v: string) => {
                        if (currentMode() === 'create') {
                          newTool.metadata = { ...newTool.metadata, specifications: v || undefined } as any
                        } else {
                          await handleSaveField('metadata.specifications', v || undefined)
                        }
                      }}
                      placeholder="Equipment specifications..."
                      multiline={true}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Create Button -->
    {#if currentMode() === 'create' && !isFlyout}
      <div class="border-t bg-background px-8 py-4">
        <div class="flex justify-end gap-3">
          <Button variant="outline" onclick={() => goto('/tools')}>Cancel</Button>
          <Button onclick={handleCreate} disabled={saving || !nameValue.trim()}>
            {saving ? 'Creating...' : 'Create Tool'}
          </Button>
        </div>
      </div>
    {/if}

    <!-- Comments Section -->
    {#if tool}
      <div class="border-t px-8 py-6">
        <CommentBox entityType="tool" entityId={tool.id} editable={!isReadOnly()} />
      </div>
    {/if}
  </div>
{/if}

