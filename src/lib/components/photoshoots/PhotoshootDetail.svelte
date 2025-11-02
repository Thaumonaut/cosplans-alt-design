<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { photoshootService } from '$lib/api/services/photoshootService'
  import { projectService } from '$lib/api/services/projectService'
  import { currentTeam } from '$lib/stores/teams'
  import { Button } from '$lib/components/ui'
  import { Badge } from 'flowbite-svelte'
  import { Calendar, MapPin, Camera, Users, ImageIcon, X } from 'lucide-svelte'
  import InlineTextEditor from '$lib/components/base/InlineTextEditor.svelte'
  import InlineDatePicker from '$lib/components/base/InlineDatePicker.svelte'
  import InlineSelect from '$lib/components/base/InlineSelect.svelte'
  import InlineImageUpload from '$lib/components/base/InlineImageUpload.svelte'
  import CommentBox from '$lib/components/base/CommentBox.svelte'
  import ShotListEditor from '$lib/components/domain/ShotListEditor.svelte'
  import type {
    Photoshoot,
    PhotoshootCreate,
    PhotoshootUpdate,
    PhotoshootStatus,
    CrewMember,
    CrewMemberCreate,
    CrewRole,
  } from '$lib/types/domain/photoshoot'
  import type { Project } from '$lib/types/domain/project'
  import { get } from 'svelte/store'

  interface Props {
    photoshootId?: string
    mode?: 'create' | 'edit' | 'view'
    isFlyout?: boolean
    onSuccess?: (photoshootId: string) => void
  }

  let { photoshootId, mode, isFlyout = false, onSuccess }: Props = $props()

  let photoshoot: Photoshoot | null = $state(null)
  let newPhotoshoot: PhotoshootCreate = $state({
    title: '',
    date: undefined,
    location: '',
    description: '',
    projectIds: [],
  })
  let linkedProjects = $state<Array<{ id: string; character: string; series: string; coverImage?: string }>>([])
  let availableProjects = $state<Project[]>([])
  let selectedProjectIds = $state<string[]>([])
  let loading = $state(true)
  let error = $state<string | null>(null)
  let saving = $state(false)
  let activeTab = $state<'overview' | 'shots' | 'crew' | 'gallery'>('overview')

  // Crew state
  let crewMembers = $state<CrewMember[]>([])
  let showNewCrewForm = $state(false)
  let newCrew: CrewMemberCreate = $state({
    name: '',
    role: 'photographer',
    contact: '',
  })

  const currentMode = $derived(() => {
    if (mode) return mode
    if (!photoshootId) return 'create'
    return photoshoot ? 'edit' : 'view'
  })

  const isReadOnly = $derived(() => {
    return currentMode() === 'view'
  })

  const statusOptions: { value: PhotoshootStatus; label: string }[] = [
    { value: 'planning', label: 'Planning' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
  ]

  const crewRoleOptions: { value: CrewRole; label: string }[] = [
    { value: 'photographer', label: 'Photographer' },
    { value: 'assistant', label: 'Assistant' },
    { value: 'makeup', label: 'Makeup Artist' },
    { value: 'other', label: 'Other' },
  ]

  onMount(async () => {
    if (currentMode() === 'create') {
      await loadAvailableProjects()
      loading = false
      return
    }

    if (!photoshootId) {
      error = 'Invalid photoshoot ID'
      loading = false
      return
    }

    await Promise.all([
      loadPhotoshoot(),
      loadLinkedProjects(),
      loadCrew(),
      loadAvailableProjects(),
    ])
  })

  async function loadPhotoshoot() {
    if (!photoshootId) return

    try {
      const loaded = await photoshootService.get(photoshootId)
      if (loaded) {
        photoshoot = loaded
        if (linkedProjects.length > 0) {
          selectedProjectIds = linkedProjects.map((p) => p.id)
        }
      } else {
        error = 'Photoshoot not found'
      }
    } catch (err: any) {
      error = err?.message || 'Failed to load photoshoot'
    } finally {
      loading = false
    }
  }

  async function loadLinkedProjects() {
    if (!photoshootId) return

    try {
      const data = await photoshootService.getLinkedProjects(photoshootId)
      linkedProjects = (data || []).map((item: any) => ({
        id: item.project?.id || item.project_id,
        character: item.project?.character || '',
        series: item.project?.series || '',
        coverImage: item.project?.cover_image,
      }))
      selectedProjectIds = linkedProjects.map((p) => p.id)
    } catch (err: any) {
      console.error('Failed to load linked projects:', err)
    }
  }

  async function loadCrew() {
    if (!photoshootId) return

    try {
      crewMembers = await photoshootService.getCrew(photoshootId)
    } catch (err: any) {
      console.error('Failed to load crew:', err)
    }
  }

  async function loadAvailableProjects() {
    try {
      availableProjects = await projectService.list()
    } catch (err: any) {
      console.error('Failed to load projects:', err)
    }
  }

  async function handleSaveField(field: string, value: any) {
    if (currentMode() === 'create') {
      if (field === 'title') newPhotoshoot.title = value
      else if (field === 'date') newPhotoshoot.date = value
      else if (field === 'location') newPhotoshoot.location = value
      else if (field === 'description') newPhotoshoot.description = value
      return
    }

    if (!photoshoot || isReadOnly()) return

    try {
      const updates: any = { [field]: value }
      const updated = await photoshootService.update(photoshoot.id, updates)
      if (updated) {
        photoshoot = updated
      }
    } catch (err: any) {
      console.error('Failed to save field:', err)
      throw err
    }
  }

  async function handleStatusChange(status: PhotoshootStatus) {
    await handleSaveField('status', status)
  }

  async function handleProjectLinkChange() {
    if (!photoshootId) return

    try {
      // Remove all current links
      for (const project of linkedProjects) {
        await photoshootService.unlinkProject(photoshootId, project.id)
      }

      // Add new links
      if (selectedProjectIds.length > 0) {
        await photoshootService.linkProject(photoshootId, selectedProjectIds)
      }

      await loadLinkedProjects()
    } catch (err: any) {
      console.error('Failed to update project links:', err)
      error = err?.message || 'Failed to update project links'
    }
  }

  async function handleCreate() {
    if (!newPhotoshoot.title.trim()) {
      error = 'Title is required'
      return
    }

    const team = get(currentTeam)
    if (!team) {
      error = 'No team selected'
      return
    }

    saving = true

    try {
      const created = await photoshootService.create({
        ...newPhotoshoot,
        projectIds: selectedProjectIds,
      })
      if (isFlyout && onSuccess) {
        onSuccess(created.id)
      } else {
        goto(`/photoshoots/${created.id}`)
      }
    } catch (err: any) {
      error = err?.message || 'Failed to create photoshoot'
      saving = false
    }
  }

  async function handleAddCrew() {
    if (!photoshootId || !newCrew.name.trim()) {
      error = 'Name is required'
      return
    }

    try {
      const created = await photoshootService.addCrew(photoshootId, newCrew)
      crewMembers = [...crewMembers, created]
      newCrew = { name: '', role: 'photographer', contact: '' }
      showNewCrewForm = false
      error = null
    } catch (err: any) {
      error = err?.message || 'Failed to add crew member'
    }
  }

  async function handleDeleteCrew(crewId: string) {
    try {
      await photoshootService.deleteCrew(crewId)
      crewMembers = crewMembers.filter((c) => c.id !== crewId)
    } catch (err: any) {
      error = err?.message || 'Failed to delete crew member'
    }
  }

  let titleValue = $state('')
  let dateValue = $state('')
  let locationValue = $state('')
  let descriptionValue = $state('')
  let notesValue = $state('')

  $effect(() => {
    if (currentMode() === 'create') {
      titleValue = newPhotoshoot.title
      dateValue = newPhotoshoot.date || ''
      locationValue = newPhotoshoot.location || ''
      descriptionValue = newPhotoshoot.description || ''
      notesValue = ''
    } else if (photoshoot) {
      titleValue = photoshoot.title
      dateValue = photoshoot.date || ''
      locationValue = photoshoot.location || ''
      descriptionValue = photoshoot.description || ''
      notesValue = photoshoot.notes || ''
    }
  })
</script>

{#if loading}
  <div class="flex items-center justify-center py-20">
    <div class="text-sm text-[var(--theme-muted-foreground)]">Loading photoshoot...</div>
  </div>
{:else if error && currentMode() !== 'create' && !photoshoot}
  <div class="space-y-4 p-8">
    <p class="text-sm text-[var(--theme-error)]">{error}</p>
    <Button variant="outline" onclick={() => goto('/photoshoots')}>Back to Photoshoots</Button>
  </div>
{:else}
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="border-b bg-[var(--theme-card-bg)] px-8 py-6">
      <div class="space-y-4">
        {#if error && currentMode() === 'create'}
          <div class="rounded-md bg-[color-mix(in_srgb,var(--theme-error)_10%,transparent)] p-3 text-sm text-[var(--theme-error)]">{error}</div>
        {/if}

        <!-- Title -->
        <div class="space-y-2">
          <InlineTextEditor
            bind:value={titleValue}
            editable={!isReadOnly()}
            onSave={async (v: string) => {
              if (currentMode() === 'create') {
                newPhotoshoot.title = v
                titleValue = v
              } else {
                await handleSaveField('title', v)
              }
            }}
            onValidate={(v) => (v.trim() ? null : 'Title is required')}
            placeholder="Photoshoot title"
            variant="title"
            className="text-3xl font-semibold"
          />
        </div>

        <!-- Metadata Bar -->
        <div class="flex flex-wrap items-center gap-6 text-sm">
          {#if photoshoot?.date || currentMode() === 'create'}
            <InlineDatePicker
              bind:value={dateValue}
              editable={!isReadOnly()}
              onSave={async (v: string) => {
                if (currentMode() === 'create') {
                  newPhotoshoot.date = v
                  dateValue = v
                } else {
                  await handleSaveField('date', v || null)
                }
              }}
              placeholder="Select date"
            />
          {/if}

          {#if photoshoot?.status || currentMode() === 'create'}
            <div class="flex items-center gap-2">
              {#if !isReadOnly()}
                <InlineSelect
                  value={photoshoot?.status || 'planning'}
                  editable={true}
                  onSave={async (v: string) => {
                    await handleStatusChange(v as PhotoshootStatus)
                  }}
                  options={statusOptions}
                  placeholder="Status"
                />
              {:else}
                <Badge>{photoshoot?.status || 'planning'}</Badge>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="border-b bg-[var(--theme-card-bg)]">
      <div class="flex gap-8 px-8">
        <button
          onclick={() => activeTab = 'overview'}
          class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'overview' ? 'border-[var(--theme-primary)] text-[var(--theme-foreground)]' : 'border-transparent text-[var(--theme-muted-foreground)] hover:text-[var(--theme-foreground)]'}"
        >
          Overview
        </button>
        <button
          onclick={() => activeTab = 'shots'}
          class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'shots' ? 'border-[var(--theme-primary)] text-[var(--theme-foreground)]' : 'border-transparent text-[var(--theme-muted-foreground)] hover:text-[var(--theme-foreground)]'}"
        >
          Shot List
        </button>
        <button
          onclick={() => activeTab = 'crew'}
          class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'crew' ? 'border-[var(--theme-primary)] text-[var(--theme-foreground)]' : 'border-transparent text-[var(--theme-muted-foreground)] hover:text-[var(--theme-foreground)]'}"
        >
          Crew
        </button>
        <button
          onclick={() => activeTab = 'gallery'}
          class="border-b-2 px-1 py-4 text-sm font-medium transition-colors {activeTab === 'gallery' ? 'border-[var(--theme-primary)] text-[var(--theme-foreground)]' : 'border-transparent text-[var(--theme-muted-foreground)] hover:text-[var(--theme-foreground)]'}"
        >
          Gallery
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-y-auto bg-[var(--theme-card-bg)]">
      <div class="p-8">
        {#if activeTab === 'overview'}
          <!-- Overview Tab -->
          <div class="mx-auto max-w-4xl space-y-6">
            <!-- Location -->
            <div class="space-y-3 rounded-lg bg-[var(--theme-section-bg)] p-6">
              <div class="flex items-center gap-2 text-sm font-medium text-[var(--theme-muted-foreground)]">
                <MapPin class="size-4" />
                <span>Location</span>
              </div>
              <InlineTextEditor
                bind:value={locationValue}
                editable={!isReadOnly()}
                onSave={async (v: string) => {
                  if (currentMode() === 'create') {
                    newPhotoshoot.location = v
                    locationValue = v
                  } else {
                    await handleSaveField('location', v || undefined)
                  }
                }}
                placeholder="Shoot location..."
                className="text-[var(--theme-foreground)]"
              />
            </div>

            <!-- Description -->
            <div class="space-y-3 rounded-lg bg-[var(--theme-section-bg)] p-6">
              <h3 class="text-sm font-medium text-[var(--theme-muted-foreground)]">Description</h3>
              <InlineTextEditor
                bind:value={descriptionValue}
                editable={!isReadOnly()}
                onSave={async (v: string) => {
                  if (currentMode() === 'create') {
                    newPhotoshoot.description = v
                    descriptionValue = v
                  } else {
                    await handleSaveField('description', v || undefined)
                  }
                }}
                placeholder="Add a description..."
                multiline={true}
                className="min-h-[100px] text-[var(--theme-foreground)]"
              />
            </div>

            <!-- Notes -->
            {#if photoshoot || currentMode() === 'create'}
              <div class="space-y-3 rounded-lg bg-[var(--theme-section-bg)] p-6">
                <h3 class="text-sm font-medium text-[var(--theme-muted-foreground)]">Notes</h3>
                <InlineTextEditor
                  bind:value={notesValue}
                  editable={!isReadOnly()}
                  onSave={async (v: string) => {
                    if (photoshoot) {
                      await handleSaveField('notes', v || undefined)
                    }
                  }}
                  placeholder="Add notes..."
                  multiline={true}
                  className="min-h-[100px] text-[var(--theme-foreground)]"
                />
              </div>
            {/if}

            <!-- Linked Projects -->
            {#if currentMode() === 'create' || photoshoot}
              <div class="space-y-4">
                <h3 class="text-sm font-medium text-[var(--theme-muted-foreground)]">Linked Projects</h3>
                {#if !isReadOnly()}
                  <div class="space-y-3">
                    <div class="flex flex-wrap gap-2">
                      {#each availableProjects as project}
                        <label class="flex items-center gap-2 rounded-md border bg-[var(--theme-card-bg)] p-2 cursor-pointer hover:bg-[var(--theme-sidebar-hover)] transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedProjectIds.includes(project.id)}
                            onchange={(e) => {
                              if (e.currentTarget.checked) {
                                selectedProjectIds = [...selectedProjectIds, project.id]
                              } else {
                                selectedProjectIds = selectedProjectIds.filter((id) => id !== project.id)
                              }
                              if (photoshootId) {
                                handleProjectLinkChange()
                              }
                            }}
                          />
                          <span class="text-sm text-[var(--theme-foreground)]">
                            {project.character} ({project.series})
                          </span>
                        </label>
                      {/each}
                    </div>
                  </div>
                {/if}

                <!-- Display linked projects -->
                {#if linkedProjects.length > 0}
                  <div class="flex flex-wrap gap-2">
                    {#each linkedProjects as project}
                      <div class="flex items-center gap-2 rounded-md border bg-[var(--theme-card-bg)] p-2">
                        {#if project.coverImage}
                          <img src={project.coverImage} alt={project.character} class="size-8 rounded object-cover" />
                        {/if}
                        <span class="text-sm text-[var(--theme-foreground)]">
                          {project.character} ({project.series})
                        </span>
                      </div>
                    {/each}
                  </div>
                {:else if !isReadOnly()}
                  <p class="text-sm text-[var(--theme-muted-foreground)]">No projects linked. Select projects above to link them.</p>
                {/if}
              </div>
            {/if}
          </div>
        {:else if activeTab === 'shots' && photoshootId}
          <!-- Shot List Tab -->
          <ShotListEditor {photoshootId} editable={!isReadOnly()} />
        {:else if activeTab === 'crew' && photoshootId}
          <!-- Crew Tab -->
          <div class="mx-auto max-w-4xl space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-[var(--theme-foreground)]">Crew Members</h3>
              {#if !isReadOnly()}
                <Button
                  size="sm"
                  onclick={() => {
                    showNewCrewForm = !showNewCrewForm
                  }}
                >
                  <Users class="mr-2 size-4" />
                  Add Crew Member
                </Button>
              {/if}
            </div>

            <!-- New Crew Form -->
            {#if showNewCrewForm && !isReadOnly()}
              <div class="rounded-lg border bg-[var(--theme-card-bg)] p-4 space-y-4">
                <h4 class="font-medium text-[var(--theme-foreground)]">New Crew Member</h4>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div class="space-y-2">
                    <label for="crew-name" class="text-sm font-medium">Name *</label>
                    <input
                      id="crew-name"
                      type="text"
                      bind:value={newCrew.name}
                      placeholder="Crew member name"
                      class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div class="space-y-2">
                    <label for="crew-role" class="text-sm font-medium">Role *</label>
                    <select
                      id="crew-role"
                      bind:value={newCrew.role}
                      class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {#each crewRoleOptions as option}
                        <option value={option.value}>{option.label}</option>
                      {/each}
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label for="crew-contact" class="text-sm font-medium">Contact</label>
                    <input
                      id="crew-contact"
                      type="text"
                      bind:value={newCrew.contact}
                      placeholder="Email or phone"
                      class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div class="flex gap-2">
                  <Button onclick={handleAddCrew} disabled={!newCrew.name.trim()}>
                    Add Crew Member
                  </Button>
                  <Button
                    variant="outline"
                    onclick={() => {
                      showNewCrewForm = false
                      newCrew = { name: '', role: 'photographer', contact: '' }
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            {/if}

            <!-- Crew List -->
            {#if crewMembers.length === 0}
              <div class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16">
                <Users class="mb-4 size-12 text-muted-foreground opacity-50" />
                <h3 class="mb-2 text-lg font-semibold">No crew members yet</h3>
                <p class="mb-6 text-center text-sm text-muted-foreground max-w-md">
                  Add crew members to track photographers, assistants, and makeup artists.
                </p>
              </div>
            {:else}
              <div class="space-y-3">
                {#each crewMembers as crew (crew.id)}
                  <div class="flex items-center justify-between rounded-lg border bg-card p-4">
                    <div class="flex-1">
                      <div class="font-medium">{crew.name}</div>
                      <div class="text-sm text-muted-foreground">
                        {crewRoleOptions.find((o) => o.value === crew.role)?.label || crew.role}
                        {#if crew.contact}
                          • {crew.contact}
                        {/if}
                      </div>
                    </div>
                    {#if !isReadOnly()}
                      <Button
                        variant="ghost"
                        size="sm"
                        onclick={() => handleDeleteCrew(crew.id)}
                        class="text-[var(--theme-error)] hover:text-[var(--theme-error)]"
                      >
                        <X class="size-4" />
                      </Button>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {:else if activeTab === 'gallery' && photoshootId}
          <!-- Gallery Tab -->
          <div class="mx-auto max-w-4xl space-y-6">
            <h3 class="text-lg font-semibold text-[var(--theme-foreground)]">Gallery</h3>
            <p class="text-sm text-[var(--theme-muted-foreground)]">
              Upload final photos from the photoshoot. Photos can be linked to specific shots in the Shot List tab.
            </p>
            <!-- Gallery upload would go here - for now just a placeholder -->
            <div class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-[var(--theme-section-bg)] py-16">
              <ImageIcon class="mb-4 size-12 text-[var(--theme-muted-foreground)] opacity-50" />
              <p class="text-sm text-[var(--theme-muted-foreground)]">Gallery upload coming soon</p>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Comments Section -->
    {#if photoshoot}
      <div class="border-t px-8 py-6">
        <CommentBox entityType="photoshoot" entityId={photoshoot.id} editable={!isReadOnly()} />
      </div>
    {/if}

    <!-- Create Button -->
    {#if currentMode() === 'create' && isFlyout}
      <div class="border-t bg-[var(--theme-card-bg)] px-10 py-4">
        <div class="flex gap-3">
          <Button variant="outline" class="flex-1" onclick={() => {
            if (onSuccess) onSuccess('')
          }} disabled={saving}>
            Cancel
          </Button>
          <Button onclick={handleCreate} disabled={saving || !titleValue.trim()} class="flex-1">
            {saving ? 'Creating...' : 'Create Photoshoot'}
          </Button>
        </div>
      </div>
    {:else if currentMode() === 'create' && !isFlyout}
      <div class="border-t bg-[var(--theme-card-bg)] px-8 py-4">
        <div class="flex justify-end gap-3">
          <Button variant="outline" onclick={() => goto('/photoshoots')}>Cancel</Button>
          <Button onclick={handleCreate} disabled={saving || !titleValue.trim()}>
            {saving ? 'Creating...' : 'Create Photoshoot'}
          </Button>
        </div>
      </div>
    {/if}
  </div>
{/if}

