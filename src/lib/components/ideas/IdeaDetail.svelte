<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { ideas } from '$lib/stores/ideas'
  import { ideaService } from '$lib/api/services/ideaService'
  import { currentTeam } from '$lib/stores/teams'
  import { Button } from '$lib/components/ui'
  import { Badge } from 'flowbite-svelte'
  import { ArrowRight, Plus, ImageIcon, X, Clock, DollarSign, Tag as TagIcon, Calendar, Upload, Sparkles } from 'lucide-svelte'
  import InlineTextEditor from '$lib/components/base/InlineTextEditor.svelte'
  import InlineNumberEditor from '$lib/components/base/InlineNumberEditor.svelte'
  import InlineSelect from '$lib/components/base/InlineSelect.svelte'
  import InlineImageUpload from '$lib/components/base/InlineImageUpload.svelte'
  import DifficultySelector from '$lib/components/base/DifficultySelector.svelte'
  import TagSelector from '$lib/components/base/TagSelector.svelte'
  import type { Idea, IdeaCreate } from '$lib/types/domain/idea'

  interface Props {
    ideaId?: string
    mode?: 'create' | 'edit' | 'view'
    isFlyout?: boolean
    onSuccess?: (ideaId: string) => void
  }

  let { ideaId, mode, isFlyout = false, onSuccess }: Props = $props()

  let idea: Idea | null = $state(null)
  let newIdea: IdeaCreate = $state({
    character: '',
    series: '',
    difficulty: 'beginner',
    description: undefined,
    estimatedCost: undefined,
    images: [],
    tags: [],
    notes: undefined,
  })
  let loading = $state(true)
  let error = $state<string | null>(null)
  let isConverting = $state(false)
  let saving = $state(false)
  let activeTab = $state<'overview' | 'images' | 'notes'>('overview')
  
  let estimatedCostValue = $state(0)
  $effect(() => {
    if (mode === 'create') {
      estimatedCostValue = newIdea.estimatedCost ?? 0
    } else if (idea) {
      estimatedCostValue = idea.estimatedCost ?? 0
    }
  })
  
  let estimatedCostSetter = (v: number) => {
    if (mode === 'create') {
      newIdea.estimatedCost = v || undefined
      estimatedCostValue = v
    } else if (idea) {
      idea.estimatedCost = v || undefined
      estimatedCostValue = v
    }
  }

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ]

  const difficultyColors = {
    beginner: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    advanced: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
  }

  const isReadOnly = $derived.by(() => {
    if (mode === 'create') return false
    if (!idea) return false
    return idea.status === 'converted'
  })

  const currentMode = $derived(() => {
    if (mode) return mode
    if (!ideaId) return 'create'
    return idea ? 'edit' : 'view'
  })

  const currentTags = $derived(() => {
    return currentMode() === 'create' ? (newIdea.tags ?? []) : (idea?.tags ?? [])
  })

  const primaryImage = $derived(() => {
    if (currentMode() === 'create') {
      return newIdea.images?.[0]
    }
    return idea?.images?.[0]
  })

  const createdDate = $derived(() => {
    if (currentMode() === 'create') return null
    if (!idea?.createdAt) return null
    return new Date(idea.createdAt)
  })

  onMount(async () => {
    if (currentMode() === 'create') {
      loading = false
      return
    }

    if (!ideaId) {
      error = 'Invalid idea ID'
      loading = false
      return
    }

    try {
      const loaded = await ideas.loadOne(ideaId)
      if (!loaded) {
        const direct = await ideaService.get(ideaId)
        if (direct) {
          idea = direct
        } else {
          error = 'Idea not found'
        }
      } else {
        idea = loaded
      }
    } catch (err: any) {
      error = err?.message || 'Failed to load idea'
    } finally {
      loading = false
    }
  })

  async function handleSaveField(field: string, value: any) {
    if (currentMode() === 'create') {
      if (field === 'character') newIdea.character = value
      else if (field === 'series') newIdea.series = value
      else if (field === 'difficulty') newIdea.difficulty = value
      else if (field === 'estimatedCost') newIdea.estimatedCost = value || undefined
      else if (field === 'description') newIdea.description = value || undefined
      else if (field === 'notes') newIdea.notes = value || undefined
      else if (field === 'images') newIdea.images = value || []
      else if (field === 'tags') newIdea.tags = value || []
      return
    }

    if (!idea || isReadOnly) return
    
    try {
      const updates: any = { [field]: value }
      const updated = await ideas.update(idea.id, updates)
      if (updated) {
        idea = updated
      }
    } catch (err: any) {
      error = err?.message || 'Failed to save'
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
        newIdea.tags = [...(newIdea.tags ?? []), trimmedTag]
      } else if (idea) {
        idea.tags = [...(idea.tags ?? []), trimmedTag]
        handleSaveField('tags', idea.tags)
      }
    }
  }

  function removeTag(tagToRemove: string) {
    if (currentMode() === 'create') {
      newIdea.tags = (newIdea.tags ?? []).filter(t => t !== tagToRemove)
    } else if (idea) {
      idea.tags = (idea.tags ?? []).filter(t => t !== tagToRemove)
      handleSaveField('tags', idea.tags)
    }
  }

  async function handleCreate() {
    error = null

    if (!newIdea.character || !newIdea.series) {
      error = 'Character and Series are required'
      return
    }

    const team = currentTeam.get()
    if (!team) {
      error = 'No team selected'
      return
    }

    saving = true

    try {
      const created = await ideas.create(team.id, newIdea)
      if (isFlyout && onSuccess) {
        onSuccess(created.id)
      } else {
        goto(`/ideas/${created.id}`)
      }
    } catch (err: any) {
      error = err?.message || 'Failed to create idea'
      saving = false
    }
  }

  async function handleConvertToProject() {
    if (!idea || isConverting) return

    const team = currentTeam.get()
    if (!team) {
      error = 'No team selected'
      return
    }

    isConverting = true
    error = null

    try {
      const result = await ideaService.convert(idea.id, team.id)
      const updated = await ideas.loadOne(idea.id)
      if (updated) {
        idea = updated
      }
      goto(`/projects/${result.projectId}`)
    } catch (err: any) {
      error = err?.message || 'Failed to convert idea to project'
      isConverting = false
    }
  }

  let characterValue = $state('')
  let seriesValue = $state('')
  let difficultyValue = $state<'beginner' | 'intermediate' | 'advanced'>('beginner')
  let descriptionValue = $state('')
  let notesValue = $state('')
  let imagesValue = $state<string[]>([])

  $effect(() => {
    if (currentMode() === 'create') {
      characterValue = newIdea.character
      seriesValue = newIdea.series
      difficultyValue = newIdea.difficulty
      descriptionValue = newIdea.description ?? ''
      notesValue = newIdea.notes ?? ''
      imagesValue = newIdea.images ?? []
    } else if (idea) {
      characterValue = idea.character
      seriesValue = idea.series
      difficultyValue = idea.difficulty
      descriptionValue = idea.description ?? ''
      notesValue = idea.notes ?? ''
      imagesValue = idea.images ?? []
    }
  })
</script>

{#if loading}
  <div class="flex items-center justify-center py-20">
    <div class="text-sm text-muted-foreground">Loading idea...</div>
  </div>
{:else if error && currentMode() !== 'create' && !idea}
  <div class="space-y-4 p-8">
    <p class="text-sm text-destructive">{error}</p>
    <Button variant="outline" onclick={() => goto('/ideas')}>Back to Ideas</Button>
  </div>
{:else}
  <div class="flex h-full flex-col">
    <!-- Header with Title and Quick Info -->
    <div class="border-b bg-background px-8 py-6">
      <div class="space-y-4">
        <!-- Title and Series -->
        <div class="space-y-2">
          <InlineTextEditor
            bind:value={characterValue}
            editable={!isReadOnly}
            onSave={async (v: string) => {
              if (currentMode() === 'create') {
                newIdea.character = v
                characterValue = v
              } else {
                await handleSaveField('character', v)
              }
            }}
            onValidate={validateRequired}
            placeholder="Character name"
            variant="title"
            className="text-3xl font-semibold"
          />
          <InlineTextEditor
            bind:value={seriesValue}
            editable={!isReadOnly}
            onSave={async (v: string) => {
              if (currentMode() === 'create') {
                newIdea.series = v
                seriesValue = v
              } else {
                await handleSaveField('series', v)
              }
            }}
            onValidate={validateRequired}
            placeholder="Series or source material"
            variant="body"
            className="text-lg text-muted-foreground"
          />
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
          

          <!-- Status Badges -->
          <div class="flex items-center gap-2">
            <DifficultySelector
              bind:value={difficultyValue}
              editable={!isReadOnly}
              onSave={async (v) => {
                if (currentMode() === 'create') {
                  newIdea.difficulty = v
                } else {
                  await handleSaveField('difficulty', v)
                }
              }}
            />
            {#if idea?.status === 'converted'}
              <Badge class="border bg-gray-500/10 text-gray-700 dark:text-gray-300 px-3 py-1">
                Converted
              </Badge>
            {/if}
          </div>

          <!-- Tags -->
          <div class="flex items-center gap-2">
            <TagIcon class="size-4 text-muted-foreground" />
            <div class="flex flex-wrap gap-1.5">
              {#each currentTags() as tag}
                <Badge class="border bg-muted px-2 py-0.5 text-xs">
                  {tag}
                  {#if !isReadOnly}
                    <button onclick={() => removeTag(tag)} class="ml-1.5 opacity-60 hover:opacity-100">
                      <X class="size-3" />
                    </button>
                  {/if}
                </Badge>
              {/each}
              
              {#if !isReadOnly}
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
          onclick={() => activeTab = 'images'}
          class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'images' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}"
        >
          Images {#if imagesValue.length > 0}({imagesValue.length}){/if}
        </button>
        <button
          onclick={() => activeTab = 'notes'}
          class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'notes' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}"
        >
          Notes
        </button>
      </div>
    </div>

    <!-- Tab Content - Moodboard Style -->
    <div class="flex-1 overflow-y-auto bg-muted/30">
      <div class="p-8">
        {#if activeTab === 'overview'}
          <!-- Overview: Hero Image + Description + Quick Details -->
          <div class="mx-auto max-w-4xl space-y-8">
            <!-- Primary Hero Image -->
            <div class="overflow-hidden rounded-lg bg-background shadow-sm">
              {#if primaryImage()}
                <img src={primaryImage()} alt={characterValue || 'Character'} class="w-full object-cover" style="max-height: 500px;" />
              {:else}
                <div class="flex aspect-video items-center justify-center bg-muted">
                  <div class="text-center space-y-3">
                    <ImageIcon class="mx-auto size-12 text-muted-foreground" />
                    <p class="text-sm text-muted-foreground">No image uploaded</p>
                    {#if !isReadOnly}
                      <InlineImageUpload
                        images={imagesValue}
                        editable={true}
                        onSave={async (v: string[]) => {
                          if (currentMode() === 'create') {
                            newIdea.images = v
                            imagesValue = v
                          } else if (idea) {
                            idea.images = v
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
                editable={!isReadOnly}
                onSave={async (v: string) => {
                  if (currentMode() === 'create') {
                    newIdea.description = v || undefined
                    descriptionValue = v
                  } else if (idea) {
                    idea.description = v || undefined
                    descriptionValue = v
                    await handleSaveField('description', v || undefined)
                  }
                }}
                placeholder="Describe this character and your vision for the cosplay..."
                variant="body"
                multiline={true}
                className="text-base leading-relaxed min-h-[120px]"
              />
            </div>

            <!-- Estimated Cost - Full Width -->
            {#if estimatedCostValue > 0 || !isReadOnly}
              <div class="group relative overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/20 p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md">
                <div class="mb-4 flex items-center gap-2">
                  <DollarSign class="size-4 text-muted-foreground" />
                  <span class="text-sm font-medium uppercase tracking-wider text-muted-foreground">Estimated Cost</span>
                </div>
                <InlineNumberEditor
                  bind:value={estimatedCostValue}
                  editable={!isReadOnly}
                  onSave={async (v: number) => {
                    estimatedCostSetter(v)
                    await handleSaveField('estimatedCost', v)
                  }}
                  placeholder="$0.00"
                  min={0}
                />
              </div>
            {/if}
          </div>

        {:else if activeTab === 'images'}
          <!-- Images Tab: Moodboard Grid -->
          <div class="mx-auto max-w-6xl space-y-6">
            <!-- Upload Section -->
            {#if !isReadOnly}
              <div class="rounded-lg border-2 border-dashed bg-background p-8 text-center">
                <Upload class="mx-auto mb-4 size-12 text-muted-foreground" />
                <p class="mb-2 text-sm font-medium">Upload reference images</p>
                <p class="mb-4 text-xs text-muted-foreground">Drag and drop images here, or click to browse</p>
                <InlineImageUpload
                  images={imagesValue}
                  editable={true}
                  onSave={async (v: string[]) => {
                    if (currentMode() === 'create') {
                      newIdea.images = v
                      imagesValue = v
                    } else if (idea) {
                      idea.images = v
                      imagesValue = v
                      await handleSaveField('images', v)
                    }
                  }}
                  multiple={true}
                />
              </div>
            {/if}

            <!-- Image Grid - Moodboard Style -->
            {#if imagesValue.length > 0}
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {#each imagesValue as image, index}
                  <div class="group relative aspect-square overflow-hidden rounded-lg bg-background shadow-sm transition-all hover:shadow-md">
                    <img src={image} alt="Reference {index + 1}" class="size-full object-cover transition-transform group-hover:scale-105" />
                    {#if !isReadOnly}
                      <button 
                        onclick={() => {
                          const newImages = imagesValue.filter((_, i) => i !== index)
                          if (currentMode() === 'create') {
                            newIdea.images = newImages
                            imagesValue = newImages
                          } else if (idea) {
                            idea.images = newImages
                            imagesValue = newImages
                            handleSaveField('images', newImages)
                          }
                        }}
                        class="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X class="size-4 text-white" />
                      </button>
                    {/if}
                  </div>
                {/each}
              </div>
            {:else if isReadOnly}
              <div class="flex flex-col items-center justify-center rounded-lg bg-background py-16 text-center">
                <ImageIcon class="mb-4 size-12 text-muted-foreground" />
                <p class="text-sm text-muted-foreground">No reference images</p>
              </div>
            {/if}
          </div>

        {:else if activeTab === 'notes'}
          <!-- Notes Tab: Free-form Inspiration Collection -->
          <div class="mx-auto max-w-3xl space-y-6">
            <div class="rounded-lg bg-background p-8 shadow-sm">
              <div class="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles class="size-4" />
                <span>Capture your thoughts, ideas, and inspiration</span>
              </div>
              <InlineTextEditor
                bind:value={notesValue}
                editable={!isReadOnly}
                onSave={async (v: string) => {
                  if (currentMode() === 'create') {
                    newIdea.notes = v || undefined
                    notesValue = v
                  } else if (idea) {
                    idea.notes = v || undefined
                    notesValue = v
                    await handleSaveField('notes', v || undefined)
                  }
                }}
                placeholder="Add notes about materials, techniques, references, or any ideas that come to mind..."
                variant="body"
                multiline={true}
                className="text-base leading-relaxed min-h-[400px]"
              />
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Actions Footer -->
    {#if currentMode() === 'create'}
      <div class="border-t bg-background px-8 py-4">
        <div class="flex gap-3">
          <Button
            onclick={handleCreate}
            disabled={saving || !newIdea.character || !newIdea.series}
            class="flex-1"
          >
            {#if saving}
              <div class="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Creating...
            {:else}
              <Sparkles class="mr-2 size-4" />
              Create Character
            {/if}
          </Button>
          <Button variant="outline" onclick={handleCreate} disabled={saving} class="flex-1">
            Save as Draft
          </Button>
        </div>
      </div>
    {:else if !isReadOnly}
      <div class="border-t bg-background px-8 py-4">
        <Button
          onclick={handleConvertToProject}
          disabled={isConverting || !idea?.character || !idea?.series}
        >
          {#if isConverting}
            <div class="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            Converting...
          {:else}
            Start Planning
            <ArrowRight class="ml-2 size-4" />
          {/if}
        </Button>
      </div>
    {/if}
  </div>
{/if}
