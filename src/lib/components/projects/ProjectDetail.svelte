<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { projects } from '$lib/stores/projects'
  import { currentTeam } from '$lib/stores/teams'
  import { projectService } from '$lib/api/services/projectService'
  import { Button } from '$lib/components/ui'
  import { Badge, Progressbar } from 'flowbite-svelte'
  import { Calendar, X, DollarSign, Tag as TagIcon, Upload, ImageIcon, Clock } from 'lucide-svelte'
  import InlineTextEditor from '$lib/components/base/InlineTextEditor.svelte'
  import InlineNumberEditor from '$lib/components/base/InlineNumberEditor.svelte'
  import InlineSelect from '$lib/components/base/InlineSelect.svelte'
  import InlineImageUpload from '$lib/components/base/InlineImageUpload.svelte'
  import TagSelector from '$lib/components/base/TagSelector.svelte'
  import ResourcesTab from './tabs/ResourcesTab.svelte'
  import TasksTab from './tabs/TasksTab.svelte'
  import GalleryTab from './tabs/GalleryTab.svelte'
  import type { Project, ProjectCreate } from '$lib/types/domain/project'
  import { get } from 'svelte/store'

  interface Props {
    projectId?: string
    mode?: 'create' | 'edit' | 'view'
    isFlyout?: boolean
    onSuccess?: (projectId: string) => void
  }

  let { projectId, mode, isFlyout = false, onSuccess }: Props = $props()

  let project: Project | null = $state(null)
  let newProject: ProjectCreate = $state({
    character: '',
    series: '',
    status: 'planning',
    estimatedBudget: 0,
    description: '',
    referenceImages: [],
    tags: [],
  })
  let loading = $state(true)
  let error = $state<string | null>(null)
  let saving = $state(false)
  let activeTab = $state<'overview' | 'resources' | 'tasks' | 'gallery'>('overview')

  let estimatedBudgetValue = $state(0)
  let progressValue = $state(0)
  let spentBudgetValue = $state(0)
  let linkedResourcesData = $state<any[]>([])

  $effect(() => {
    if (mode === 'create') {
      estimatedBudgetValue = newProject.estimatedBudget ?? 0
      progressValue = 0
      spentBudgetValue = 0
    } else if (project) {
      estimatedBudgetValue = project.estimatedBudget ?? 0
      progressValue = project.progress
      spentBudgetValue = project.spentBudget
    }
  })

  let estimatedBudgetSetter = (v: number) => {
    if (mode === 'create') {
      newProject.estimatedBudget = v || undefined
      estimatedBudgetValue = v
    } else if (project) {
      project.estimatedBudget = v || undefined
      estimatedBudgetValue = v
    }
  }

  // Load progress and resources when project loads
  $effect(() => {
    if (project?.id && currentMode() !== 'create') {
      loadProgress()
      loadLinkedResources()
    }
  })

  // Recalculate progress and budget when resources or tasks change
  // This is triggered when user links/unlinks resources or completes tasks
  async function recalculateMetrics() {
    if (!project?.id || currentMode() === 'create') return
    await Promise.all([loadProgress(), loadLinkedResources()])
  }

  async function loadProgress() {
    if (!project?.id) return
    try {
      const calculatedProgress = await projects.calculateProgress(project.id)
      progressValue = calculatedProgress
      if (project) {
        project.progress = calculatedProgress
      }
    } catch (err: any) {
      console.error('Failed to calculate progress:', err)
    }
  }

  async function loadLinkedResources() {
    if (!project?.id) return
    try {
      linkedResourcesData = await projectService.getLinkedResources(project.id)
      // Calculate spent budget from linked resources
      const spent = linkedResourcesData.reduce((total, link) => {
        const resource = link.resource || link
        const cost = resource?.cost || 0
        const quantity = link.quantity || 1
        return total + (cost * quantity)
      }, 0)
      spentBudgetValue = spent
      
      // Update project spent budget
      if (project && project.spentBudget !== spent) {
        await projects.update(project.id, { spentBudget: spent })
        project.spentBudget = spent
      }
    } catch (err: any) {
      console.error('Failed to load linked resources:', err)
    }
  }

  const currentMode = $derived(() => {
    if (mode) return mode
    if (!projectId) return 'create'
    return project ? 'edit' : 'view'
  })

  const isReadOnly = $derived(() => {
    return currentMode() === 'view'
  })

  const currentTags = $derived(() => {
    return currentMode() === 'create' ? (newProject.tags ?? []) : (project?.tags ?? [])
  })

  const primaryImage = $derived(() => {
    if (currentMode() === 'create') {
      return newProject.referenceImages?.[0]
    }
    return project?.coverImage || project?.referenceImages?.[0]
  })

  const createdDate = $derived(() => {
    if (currentMode() === 'create') return null
    if (!project?.createdAt) return null
    return new Date(project.createdAt)
  })

  const statusOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ]

  onMount(async () => {
    if (currentMode() === 'create') {
      loading = false
      return
    }

    if (!projectId) {
      error = 'Invalid project ID'
      loading = false
      return
    }

    try {
      const loaded = await projects.loadOne(projectId)
      if (loaded) {
        project = loaded
      } else {
        error = 'Project not found'
      }
    } catch (err: any) {
      error = err?.message || 'Failed to load project'
    } finally {
      loading = false
    }
  })

  async function handleSaveField(field: string, value: any) {
    if (currentMode() === 'create') {
      if (field === 'character') newProject.character = value
      else if (field === 'series') newProject.series = value
      else if (field === 'status') newProject.status = value
      else if (field === 'estimatedBudget') newProject.estimatedBudget = value || undefined
      else if (field === 'description') newProject.description = value || undefined
      else if (field === 'deadline') newProject.deadline = value || undefined
      else if (field === 'referenceImages') newProject.referenceImages = value || []
      else if (field === 'tags') newProject.tags = value || []
      return
    }

    if (!project || isReadOnly()) return
    
    try {
      await projects.update(project.id, { [field]: value })
      const updated = await projects.loadOne(project.id)
      if (updated) {
        project = updated
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
        newProject.tags = [...(newProject.tags ?? []), trimmedTag]
      } else if (project) {
        project.tags = [...(project.tags ?? []), trimmedTag]
        handleSaveField('tags', project.tags)
      }
    }
  }

  function removeTag(tagToRemove: string) {
    if (currentMode() === 'create') {
      newProject.tags = (newProject.tags ?? []).filter(t => t !== tagToRemove)
    } else if (project) {
      project.tags = (project.tags ?? []).filter(t => t !== tagToRemove)
      handleSaveField('tags', project.tags)
    }
  }

  async function handleCreate() {
    error = null

    if (!newProject.character || !newProject.series) {
      error = 'Character and Series are required'
      return
    }

    const team = get(currentTeam)
    if (!team) {
      error = 'No team selected'
      return
    }

    saving = true

    try {
      const created = await projects.create(newProject)
      if (isFlyout && onSuccess) {
        onSuccess(created.id)
      } else {
        goto(`/projects/${created.id}`)
      }
    } catch (err: any) {
      error = err?.message || 'Failed to create project'
      saving = false
    }
  }

  let characterValue = $state('')
  let seriesValue = $state('')
  let statusValue = $state<'planning' | 'in-progress' | 'completed' | 'archived'>('planning')
  let descriptionValue = $state('')
  let deadlineValue = $state('')
  let imagesValue = $state<string[]>([])

  $effect(() => {
    if (currentMode() === 'create') {
      characterValue = newProject.character
      seriesValue = newProject.series
      statusValue = newProject.status || 'planning'
      descriptionValue = newProject.description ?? ''
      deadlineValue = newProject.deadline ?? ''
      imagesValue = newProject.referenceImages ?? []
    } else if (project) {
      characterValue = project.character
      seriesValue = project.series
      statusValue = project.status
      descriptionValue = project.description ?? ''
      deadlineValue = project.deadline ?? ''
      imagesValue = project.referenceImages ?? []
    }
  })
</script>

{#if loading}
  <div class="flex items-center justify-center py-20">
    <div class="text-sm text-muted-foreground">Loading project...</div>
  </div>
{:else if error && currentMode() !== 'create' && !project}
  <div class="space-y-4 p-8">
    <p class="text-sm text-destructive">{error}</p>
    <Button variant="outline" onclick={() => goto('/projects')}>Back to Projects</Button>
  </div>
{:else}
  <div class="flex h-full flex-col">
    <!-- Header with Title and Quick Info -->
    <div class="border-b bg-background px-8 py-6">
      <div class="space-y-4">
        {#if error && currentMode() === 'create'}
          <div class="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        {/if}

        <!-- Title and Series -->
        <div class="space-y-2">
          <InlineTextEditor
            bind:value={characterValue}
            editable={!isReadOnly}
            onSave={async (v: string) => {
              if (currentMode() === 'create') {
                newProject.character = v
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
                newProject.series = v
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

          <!-- Status Badge -->
          <div class="flex items-center gap-2">
            {#if !isReadOnly}
              <InlineSelect
                bind:value={statusValue}
                editable={true}
                onSave={async (v: string) => {
                  if (currentMode() === 'create') {
                    newProject.status = v as any
                    statusValue = v as any
                  } else {
                    await handleSaveField('status', v)
                  }
                }}
                options={statusOptions}
                placeholder="Status"
              />
            {:else}
              <Badge>{statusValue.replace('-', ' ')}</Badge>
            {/if}
          </div>

          <!-- Progress (only in edit mode) -->
          {#if project}
            <div class="flex items-center gap-2 text-muted-foreground">
              <Clock class="size-4" />
              <span>{project.progress}% complete</span>
            </div>
          {/if}

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
          onclick={() => activeTab = 'resources'}
          class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'resources' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}"
        >
          Resources
        </button>
        <button
          onclick={() => activeTab = 'tasks'}
          class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'tasks' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}"
        >
          Tasks
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
                            newProject.referenceImages = v
                            imagesValue = v
                          } else if (project) {
                            project.referenceImages = v
                            imagesValue = v
                            await handleSaveField('referenceImages', v)
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
                    newProject.description = v || undefined
                    descriptionValue = v
                  } else if (project) {
                    project.description = v || undefined
                    descriptionValue = v
                    await handleSaveField('description', v || undefined)
                  }
                }}
                placeholder="Describe your project goals and vision..."
                variant="body"
                multiline={true}
                className="text-base leading-relaxed min-h-[120px]"
              />
            </div>

            <!-- Estimated Budget - Full Width -->
            {#if estimatedBudgetValue > 0 || !isReadOnly()}
              <div class="group relative overflow-hidden rounded-lg bg-gradient-to-br from-background {project && spentBudgetValue >= estimatedBudgetValue && estimatedBudgetValue > 0 ? 'to-destructive/10' : 'to-muted/20'} p-6 shadow-sm ring-1 {project && spentBudgetValue >= estimatedBudgetValue && estimatedBudgetValue > 0 ? 'ring-destructive/50' : 'ring-black/5'} transition-all hover:shadow-md">
                <div class="mb-4 flex items-center gap-2">
                  <DollarSign class="size-4 text-muted-foreground" />
                  <span class="text-sm font-medium uppercase tracking-wider text-muted-foreground">Estimated Budget</span>
                  {#if project && spentBudgetValue >= estimatedBudgetValue && estimatedBudgetValue > 0}
                    <span class="ml-auto text-xs font-medium text-destructive">⚠ Budget Exceeded</span>
                  {/if}
                </div>
                <InlineNumberEditor
                  bind:value={estimatedBudgetValue}
                  editable={!isReadOnly()}
                  onSave={async (v: number) => {
                    estimatedBudgetSetter(v)
                    await handleSaveField('estimatedBudget', v)
                  }}
                  placeholder="$0.00"
                  min={0}
                />
                {#if project && estimatedBudgetValue > 0}
                  <div class="mt-3 flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">Spent: ${(spentBudgetValue / 100).toFixed(2)}</span>
                    <span class={spentBudgetValue >= estimatedBudgetValue ? 'font-medium text-destructive' : 'text-muted-foreground'}>
                      {spentBudgetValue >= estimatedBudgetValue 
                        ? `Exceeded by $${((spentBudgetValue - estimatedBudgetValue) / 100).toFixed(2)}`
                        : `Remaining: $${((estimatedBudgetValue - spentBudgetValue) / 100).toFixed(2)}`
                      }
                    </span>
                  </div>
                {/if}
              </div>
            {/if}

            <!-- Deadline -->
            {#if deadlineValue || !isReadOnly}
              <div class="space-y-3 rounded-lg bg-background p-6 shadow-sm">
                <div class="flex items-center gap-2">
                  <Calendar class="size-4 text-muted-foreground" />
                  <h3 class="text-sm font-medium text-muted-foreground">Deadline</h3>
                </div>
                {#if !isReadOnly}
                  <input
                    type="date"
                    bind:value={deadlineValue}
                    onchange={() => {
                      if (currentMode() === 'create') {
                        newProject.deadline = deadlineValue || undefined
                      } else if (project) {
                        handleSaveField('deadline', deadlineValue || undefined)
                      }
                    }}
                    class="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                {:else if deadlineValue}
                  <p class="text-base">{new Date(deadlineValue).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                {:else}
                  <p class="text-base text-muted-foreground">No deadline set</p>
                {/if}
              </div>
            {/if}

            <!-- Progress (only in edit mode) -->
            {#if project}
              <div class="space-y-3 rounded-lg bg-background p-6 shadow-sm">
                <h3 class="text-sm font-medium text-muted-foreground">Progress</h3>
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-2xl font-bold">{progressValue}%</span>
                  </div>
                  <Progressbar progress={progressValue} class="h-2" />
                  <div class="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Budget: ${(spentBudgetValue / 100).toFixed(2)}</span>
                    {#if estimatedBudgetValue > 0}
                      <span class={spentBudgetValue >= estimatedBudgetValue ? 'text-destructive font-medium' : ''}>
                        of ${(estimatedBudgetValue / 100).toFixed(2)}
                      </span>
                    {/if}
                    {#if spentBudgetValue >= estimatedBudgetValue && estimatedBudgetValue > 0}
                      <span class="text-xs text-destructive">(Budget exceeded)</span>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}
          </div>

        {:else if activeTab === 'gallery'}
          <!-- Gallery Tab: Moodboard Grid -->
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
                      newProject.referenceImages = v
                      imagesValue = v
                    } else if (project) {
                      project.referenceImages = v
                      imagesValue = v
                      await handleSaveField('referenceImages', v)
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
                    <img src={imageUrl} alt="Reference" class="size-full object-cover" />
                    {#if !isReadOnly}
                      <button
                        onclick={() => {
                          const updated = imagesValue.filter(img => img !== imageUrl)
                          if (currentMode() === 'create') {
                            newProject.referenceImages = updated
                            imagesValue = updated
                          } else if (project) {
                            project.referenceImages = updated
                            imagesValue = updated
                            handleSaveField('referenceImages', updated)
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
                <p class="text-sm text-muted-foreground">No reference images</p>
              </div>
            {/if}
          </div>

        {:else if activeTab === 'resources' && project}
          <!-- Resources Tab -->
          <div class="p-8">
            <ResourcesTab 
              projectId={project.id}
              onResourceChange={async () => {
                // Recalculate progress and budget when resources change
                await recalculateMetrics()
              }}
            />
          </div>

        {:else if activeTab === 'tasks' && project}
          <!-- Tasks Tab -->
          <div class="p-8">
            <TasksTab 
              projectId={project.id}
              onTaskChange={async () => {
                // Recalculate progress when tasks change
                await recalculateMetrics()
              }}
            />
          </div>

        {/if}
        
        {#if activeTab === 'gallery'}
          <!-- Gallery Tab -->
          <div class="p-8">
            <GalleryTab 
              project={project}
              images={imagesValue}
              editable={!isReadOnly()}
              onUpdate={async (images: string[]) => {
                if (currentMode() === 'create') {
                  newProject.referenceImages = images
                  imagesValue = images
                } else if (project) {
                  project.referenceImages = images
                  imagesValue = images
                  await handleSaveField('referenceImages', images)
                }
              }}
            />
          </div>
        {/if}
      </div>
    </div>

    <!-- Create Mode Actions -->
    {#if currentMode() === 'create'}
      <div class="sticky bottom-0 border-t bg-background/95 px-8 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex gap-3">
          <Button
            variant="default"
            class="flex-1"
            onclick={handleCreate}
            disabled={saving || !characterValue || !seriesValue}
          >
            {saving ? 'Creating...' : 'Create Project'}
          </Button>
          <Button
            variant="outline"
            class="flex-1 bg-transparent"
            onclick={() => {
              if (isFlyout && onSuccess) {
                onSuccess('')
              } else {
                goto('/projects')
              }
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
