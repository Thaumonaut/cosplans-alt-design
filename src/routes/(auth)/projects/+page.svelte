<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { projects } from '$lib/stores/projects'
  import { currentTeam, teams } from '$lib/stores/teams'
  import { user } from '$lib/stores/auth-store'
  import { Button, Input } from '$lib/components/ui'
  import { Plus, Search } from 'lucide-svelte'
  import ProjectCard from '$lib/components/cards/ProjectCard.svelte'
  import CreationFlyout from '$lib/components/ui/CreationFlyout.svelte'
  import ProjectDetail from '$lib/components/projects/ProjectDetail.svelte'
  import Fuse from 'fuse.js'
  import { get } from 'svelte/store'

  let searchQuery = $state('')
  let statusFilter = $state<'all' | 'planning' | 'in-progress' | 'completed' | 'archived'>('all')
  let showNewProjectFlyout = $state(false)
  let selectedProjectId = $state<string | null>(null)
  let showProjectDetailFlyout = $state(false)

  import type { PageData } from './$types'
  let { data }: { data: PageData } = $props()
  
  // If we got projects from load function, use them
  $effect(() => {
    if (data?.projects && data.projects.length > 0) {
      // Projects were loaded in +page.ts, ensure store has them
      const currentProjects = get(projects)
      if (currentProjects.items.length === 0) {
        projects.load()
      }
    }
  })

  // Load projects on mount as fallback if not loaded from +page.ts
  onMount(async () => {
    // Only load if we don't already have data from load function
    if (!data?.projects || data.projects.length === 0) {
      try {
        const currentUser = get(user)
        if (currentUser) {
          const currentTeamValue = get(currentTeam)
          if (!currentTeamValue) {
            // No team selected, try to load teams
            await teams.load(currentUser.id)
          }
        }
        
        // Only load projects if we have a team
        const team = get(currentTeam)
        if (team) {
          await projects.load()
        }
      } catch (error) {
        console.error('Failed to load projects:', error)
      }
    }
  })

  // Reactive filtered projects
  const filtered = $derived.by(() => {
    let items = $projects.items

    // Filter by status
    if (statusFilter !== 'all') {
      items = items.filter((p) => p.status === statusFilter)
    }

    // Fuzzy search if query present
    if (searchQuery.trim()) {
      const fuse = new Fuse(items, {
        keys: ['character', 'series', 'tags'],
        threshold: 0.3, // Allows for typos
      })
      const results = fuse.search(searchQuery)
      return results.map((r: { item: typeof items[0] }) => r.item)
    }

    return items
  })

  function handleNewProject() {
    selectedProjectId = null
    showNewProjectFlyout = true
  }

  function handleProjectClick(projectId: string) {
    selectedProjectId = projectId
    showProjectDetailFlyout = true
  }

  const statusCounts = $derived({
    all: $projects.items.length,
    planning: $projects.items.filter((p) => p.status === 'planning').length,
    'in-progress': $projects.items.filter((p) => p.status === 'in-progress').length,
    completed: $projects.items.filter((p) => p.status === 'completed').length,
    archived: $projects.items.filter((p) => p.status === 'archived').length,
  })
</script>

<svelte:head>
  <title>Projects - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">Projects</h1>
    <p class="text-pretty text-gray-600 dark:text-gray-400">
      Manage your active cosplay projects • {statusCounts.all} total
    </p>
  </div>

  <!-- Filters & Actions -->
  <div class="mb-6 space-y-4">
    <!-- Status Filter Tabs -->
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onclick={() => (statusFilter = 'all')}
        >
          All Projects
          {#if statusCounts.all > 0}
            <span class="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
              {statusCounts.all}
            </span>
          {/if}
        </Button>

        <Button
          variant={statusFilter === 'planning' ? 'default' : 'ghost'}
          size="sm"
          onclick={() => (statusFilter = 'planning')}
        >
          Planning
          {#if statusCounts.planning > 0}
            <span class="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
              {statusCounts.planning}
            </span>
          {/if}
        </Button>

        <Button
          variant={statusFilter === 'in-progress' ? 'default' : 'ghost'}
          size="sm"
          onclick={() => (statusFilter = 'in-progress')}
        >
          In Progress
          {#if statusCounts['in-progress'] > 0}
            <span class="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
              {statusCounts['in-progress']}
            </span>
          {/if}
        </Button>

        <Button
          variant={statusFilter === 'completed' ? 'default' : 'ghost'}
          size="sm"
          onclick={() => (statusFilter = 'completed')}
        >
          Completed
          {#if statusCounts.completed > 0}
            <span class="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
              {statusCounts.completed}
            </span>
          {/if}
        </Button>
      </div>

      <!-- New Project Button -->
      <Button onclick={handleNewProject} size="sm">
        <Plus class="mr-2 size-4" />
        New Project
      </Button>
    </div>

    <!-- Search -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search projects by character, series, or tags..."
        bind:value={searchQuery}
        class="pl-10"
      />
    </div>
  </div>

  <!-- Projects Grid -->
  {#if $projects.loading}
    <div class="flex items-center justify-center py-12">
      <p class="text-sm text-muted-foreground">Loading projects...</p>
    </div>
  {:else if $projects.error}
    <div class="flex items-center justify-center py-12">
      <p class="text-sm text-red-600">{$projects.error}</p>
    </div>
  {:else if filtered.length === 0 && searchQuery}
    <div class="flex flex-col items-center justify-center py-12">
      <p class="text-sm text-muted-foreground">No projects match your search.</p>
      <p class="mt-2 text-xs text-muted-foreground">
        Try adjusting your search terms or filters.
      </p>
    </div>
  {:else if filtered.length === 0}
    <div class="flex flex-col items-center justify-center py-12">
      <p class="text-sm text-muted-foreground">
        {statusFilter === 'all'
          ? 'No projects yet.'
          : `No ${statusFilter.replace('-', ' ')} projects.`}
      </p>
      <Button onclick={handleNewProject} variant="outline" size="sm" class="mt-4">
        <Plus class="mr-2 size-4" />
        Create your first project
      </Button>
    </div>
  {:else}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each filtered as project (project.id)}
        <ProjectCard {project} onclick={() => handleProjectClick(project.id)} />
      {/each}
    </div>
  {/if}
</div>

<!-- Project Detail Flyout -->
{#if showNewProjectFlyout || showProjectDetailFlyout}
  {@const flyoutOpen = showNewProjectFlyout || showProjectDetailFlyout}
  {@const setFlyoutOpen = (val: boolean) => {
    showNewProjectFlyout = val && !selectedProjectId
    showProjectDetailFlyout = val && !!selectedProjectId
  }}
  <CreationFlyout
    open={flyoutOpen}
    onOpenChange={setFlyoutOpen}
    title={selectedProjectId ? 'Project' : 'New Project'}
    onFullScreen={() => {
      if (selectedProjectId) {
        goto(`/projects/${selectedProjectId}`)
      } else {
        goto('/projects/new')
      }
      showNewProjectFlyout = false
      showProjectDetailFlyout = false
    }}
  >
  <ProjectDetail
    projectId={selectedProjectId || undefined}
    mode={selectedProjectId ? 'edit' : 'create'}
    isFlyout={true}
    onSuccess={(id) => {
      // If id is empty, project was deleted or converted - close flyout
      if (!id || id === '') {
        showProjectDetailFlyout = false
        showNewProjectFlyout = false
        selectedProjectId = null
        // Reload projects list
        projects.load()
        return
      }
      
      // If creating a new project, show it in the detail view
      if (!selectedProjectId) {
        selectedProjectId = id
        showNewProjectFlyout = false
        showProjectDetailFlyout = true
      } else {
        // Project was updated, reload projects list
        projects.load()
      }
    }}
  />
  </CreationFlyout>
{/if}

