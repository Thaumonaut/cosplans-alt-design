<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { goto } from '$app/navigation'
  import { 
    LayoutGrid, 
    List, 
    TableIcon, 
    Plus, 
    Clock, 
    GripVertical, 
    MoreVertical, 
    CalendarIcon, 
    User 
  } from 'lucide-svelte'
  import { taskService } from '$lib/api/services/taskService'
  import { taskStageService } from '$lib/api/services/taskStageService'
  import { projectService } from '$lib/api/services/projectService'
  import { teamService, type Team } from '$lib/api/services/teamService'
  import StageSelector from '$lib/components/base/StageSelector.svelte'
  import { tasks as tasksStore } from '$lib/stores/tasks-store'
  import { currentTeam } from '$lib/stores/teams'
  import type { TeamMember } from '$lib/api/services/teamService'
  import { 
    Button, 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    Badge, 
    Checkbox, 
    DropdownMenu, 
    DropdownMenuItem
  } from '$lib/components/ui'
  import CreationFlyout from '$lib/components/ui/CreationFlyout.svelte'
  import TaskDetail from '$lib/components/tasks/TaskDetail.svelte'
  import TaskCard from '$lib/components/tasks/TaskCard.svelte'
  import type { Task, TaskPriority, TaskStage } from '$lib/types/domain/task'
  import type { Project } from '$lib/types/domain/project'

  type ViewMode = "kanban" | "list" | "table"

  let viewMode = $state<ViewMode>("kanban")
  let filterProject = $state<string>("all")
  let filterPriority = $state<string>("all")
  let showAllTeams = $state(false) // Toggle to show tasks from all teams vs current team only
  let loading = $state(true)
  let allTasks = $state<Task[]>([])
  let allProjects = $state<Project[]>([])
  let teamMembers = $state<TeamMember[]>([])
  let taskStages = $state<TaskStage[]>([]) // Team's task stages for kanban columns
  let allTeams = $state<Team[]>([]) // All user's teams for team filtering
  let showCreateFlyout = $state(false)
  let selectedTaskId = $state<string | null>(null)
  let showTaskDetailFlyout = $state(false)

  // Load tasks and projects
  async function loadData() {
    loading = true
    try {
      const team = get(currentTeam)
      if (!team) {
        loading = false
        return
      }

      const filters: { completed?: boolean; priority?: string } = {}
      if (filterPriority !== "all") {
        filters.priority = filterPriority
      }

      // Load tasks, projects, stages, team members, and all teams in parallel
      const [tasksData, projectsData, stagesData, membersData, teamsData] = await Promise.all([
        taskService.listAll(filters),
        projectService.list(),
        taskStageService.ensureDefaults(team.id), // Ensure default stages exist
        teamService.getMembers(team.id).catch(() => []),
        teamService.list().catch(() => [])
      ])

      allTasks = tasksData
      allProjects = projectsData
      taskStages = stagesData
      teamMembers = membersData || []
      allTeams = teamsData || []

    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      loading = false
    }
  }

  // Filter tasks
  const filteredTasks = $derived(() => {
    let filtered = allTasks
    const currentTeamObj = get(currentTeam)

    // Filter by team: default to current team, unless "show all teams" is enabled
    if (!showAllTeams && currentTeamObj) {
      // Only show tasks from current active team
      filtered = filtered.filter(t => {
        // For project-scoped tasks, check project's team
        if (t.projectId) {
          const project = allProjects.find(p => p.id === t.projectId)
          return project && project.teamId === currentTeamObj.id
        }
        // For standalone tasks, check task's team_id
        return t.teamId === currentTeamObj.id
      })
    }
    // If showAllTeams is true, RLS already ensures only tasks from user's teams are visible

    if (filterProject !== "all") {
      filtered = filtered.filter(t => t.projectId === filterProject)
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter(t => t.priority === filterPriority)
    }

    return filtered
  })

  // Convert tasks to UI format with project names, assigned user info, stage mapping, and team info
  const uiTasks = $derived(() => {
    const currentTeamObj = get(currentTeam)
    return filteredTasks().map(task => {
      const project = allProjects.find(p => p.id === task.projectId)
      const assignedMember = task.assignedTo ? teamMembers.find(m => m.userId === task.assignedTo) : null
      const stage = taskStages.find(s => s.id === task.stageId)
      // Get team name for this task (from project.team_id or task.team_id)
      let taskTeam: Team | undefined
      if (task.projectId && project) {
        taskTeam = allTeams.find(t => t.id === project.teamId)
      } else if (task.teamId) {
        taskTeam = allTeams.find(t => t.id === task.teamId)
      }
      
      return {
        ...task,
        projectName: project ? `${project.character} (${project.series})` : null,
        assignedUser: assignedMember?.user,
        stageName: stage?.name || 'Unknown',
        stageId: task.stageId, // Current stage ID for drag-and-drop
        dueDateStr: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        teamName: taskTeam?.name || null,
        teamId: taskTeam?.id || null,
        isFromCurrentTeam: taskTeam?.id === currentTeamObj?.id || false,
      }
    })
  })

  const projects = $derived(() => {
    return [
      { value: 'all', label: 'All Projects' },
      ...allProjects.map(p => ({ value: p.id, label: `${p.character} (${p.series})` }))
    ]
  })

  const priorityColors = {
    high: "bg-[color-mix(in_srgb,var(--theme-error)_20%,transparent)] backdrop-blur-sm text-[var(--theme-error)] border-[color-mix(in_srgb,var(--theme-error)_30%,transparent)]",
    medium: "bg-[color-mix(in_srgb,var(--theme-warning)_20%,transparent)] backdrop-blur-sm text-[var(--theme-warning)] border-[color-mix(in_srgb,var(--theme-warning)_30%,transparent)]",
    low: "bg-[color-mix(in_srgb,var(--theme-info)_20%,transparent)] backdrop-blur-sm text-[var(--theme-info)] border-[color-mix(in_srgb,var(--theme-info)_30%,transparent)]",
  }

  // Helper to get status color based on stage
  function getStageColor(stage: TaskStage | undefined): string {
    if (!stage) return "bg-[color-mix(in_srgb,var(--theme-muted)_20%,transparent)] backdrop-blur-sm text-[var(--theme-muted-foreground)]"
    if (stage.isCompletionStage) {
      return "bg-[color-mix(in_srgb,var(--theme-success)_20%,transparent)] backdrop-blur-sm text-[var(--theme-success)]"
    }
    return "bg-[color-mix(in_srgb,var(--theme-primary)_20%,transparent)] backdrop-blur-sm text-[var(--theme-primary)]"
  }

  // Get tasks for a specific stage (kanban column)
  function getTasksByStage(stageId: string) {
    return uiTasks().filter((task) => task.stageId === stageId)
  }

  // Drag and drop handlers
  let draggedTask = $state<string | null>(null)
  let dragOverStageId = $state<string | null>(null)

  function handleDragStart(taskId: string, event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', taskId)
    }
    draggedTask = taskId
  }

  function handleDragOver(stageId: string, event: DragEvent) {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
    dragOverStageId = stageId
  }

  function handleDragLeave() {
    dragOverStageId = null
  }

  async function handleDrop(stageId: string, event: DragEvent) {
    event.preventDefault()
    dragOverStageId = null
    
    if (!draggedTask || !stageId) return

    const task = allTasks.find(t => t.id === draggedTask)
    if (!task) return

    // Use moveToStage to change task stage (completion is determined by stage)
    try {
      await taskService.moveToStage(draggedTask, stageId)
      await loadData()
    } catch (error) {
      console.error('Failed to update task stage:', error)
      // Optionally show error toast here
    }

    draggedTask = null
  }

  async function handleTaskToggle(taskId: string) {
    try {
      // Get current task to determine target stage
      const task = allTasks.find(t => t.id === taskId)
      if (!task) return

      const currentStage = taskStages.find(s => s.id === task.stageId)
      if (!currentStage) return

      // Toggle between completion stage and first non-completion stage
      if (currentStage.isCompletionStage) {
        // Move to first non-completion stage
        const firstNonCompletion = taskStages.find(s => !s.isCompletionStage)
        if (firstNonCompletion) {
          await taskService.moveToStage(taskId, firstNonCompletion.id)
        }
      } else {
        // Move to completion stage
        const completionStage = taskStages.find(s => s.isCompletionStage)
        if (completionStage) {
          await taskService.moveToStage(taskId, completionStage.id)
        }
      }
      await loadData()
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await taskService.delete(taskId)
      await loadData()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  function handleEditTask(taskId: string) {
    selectedTaskId = taskId
    showTaskDetailFlyout = true
  }

  function handleCreateTask() {
    selectedTaskId = null
    showCreateFlyout = true
  }

  $effect(() => {
    if (filterPriority !== "all" || filterProject !== "all") {
      loadData()
    }
  })

  onMount(() => {
    loadData()
  })
</script>

<svelte:head>
  <title>Tasks - Cosplay Tracker</title>
</svelte:head>

<div class="flex-1 overflow-auto p-6">
  <div class="mx-auto max-w-[1600px] space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Tasks</h1>
        <p class="text-sm text-[var(--theme-muted-foreground)] mt-1">Manage tasks across all your projects</p>
      </div>
      <div class="flex items-center gap-2">
        <Button 
          variant="outline" 
          onclick={() => goto('/settings/task-stages')}
          class="hidden sm:flex"
        >
          <LayoutGrid class="mr-2 size-4" />
          Manage Stages
        </Button>
        <Button onclick={handleCreateTask}>
          <Plus class="mr-2 size-4" />
          New Task
        </Button>
      </div>
    </div>

    <!-- View Controls -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <Button
          variant={viewMode === "kanban" ? "default" : "outline"}
          size="sm"
          onclick={() => viewMode = "kanban"}
        >
          <LayoutGrid class="mr-2 size-4" />
          Kanban
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onclick={() => viewMode = "list"}
        >
          <List class="mr-2 size-4" />
          List
        </Button>
        <Button
          variant={viewMode === "table" ? "default" : "outline"}
          size="sm"
          onclick={() => viewMode = "table"}
        >
          <TableIcon class="mr-2 size-4" />
          Table
        </Button>
      </div>

      <div class="flex items-center gap-2">
        <!-- Show All Teams Toggle (only show if user has multiple teams) -->
        {#if allTeams.length > 1}
          <label class="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted">
            <input
              type="checkbox"
              bind:checked={showAllTeams}
              onchange={() => loadData()}
              class="size-4 rounded border-input"
            />
            <span>Show All Teams</span>
          </label>
        {/if}

        <select 
          bind:value={filterProject}
          class="w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          {#each projects() as project}
            <option value={project.value}>{project.label}</option>
          {/each}
        </select>

        <select 
          bind:value={filterPriority}
          class="w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="text-sm text-[var(--theme-muted-foreground)]">Loading tasks...</div>
      </div>
    {:else if uiTasks().length === 0}
      <Card>
        <CardContent class="flex flex-col items-center justify-center py-12">
          <Clock class="mb-4 size-12 text-[var(--theme-muted-foreground)]" />
          <h3 class="mb-2 text-lg font-semibold">No tasks found</h3>
          <p class="mb-6 text-center text-sm text-[var(--theme-muted-foreground)]">
            {#if filterProject !== "all" || filterPriority !== "all"}
              Try adjusting your filters to see more tasks.
            {:else}
              Get started by creating your first task.
            {/if}
          </p>
          <Button onclick={handleCreateTask}>
            <Plus class="mr-2 size-4" />
            Create Task
          </Button>
        </CardContent>
      </Card>
    {:else}
      <!-- Kanban View -->
      {#if viewMode === "kanban"}
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {#each taskStages as stage}
            <Card class="flex flex-col border-border bg-card shadow-sm">
              <CardHeader class="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm pb-3">
                <div class="flex items-center justify-between gap-2">
                  <CardTitle class="text-sm font-semibold leading-tight">{stage.name}</CardTitle>
                  <Badge variant="secondary" class="shrink-0 text-[11px] font-medium px-2 py-0.5">
                    {getTasksByStage(stage.id).length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent class="flex-1 space-y-2.5 overflow-y-auto min-h-[300px] max-h-[calc(100vh-280px)] p-3 scrollbar-thin">
                <div
                  role="region"
                  aria-label={`${stage.name} tasks`}
                  class="h-full space-y-2.5 {dragOverStageId === stage.id && draggedTask && getTasksByStage(stage.id).findIndex(t => t.id === draggedTask) === -1 ? 'opacity-60 bg-primary/5 rounded-lg border-2 border-dashed border-primary/30' : ''}"
                  ondragover={(e: DragEvent) => handleDragOver(stage.id, e)}
                  ondragleave={handleDragLeave}
                  ondrop={(e: DragEvent) => handleDrop(stage.id, e)}
                >
                {#each getTasksByStage(stage.id) as task (task.id)}
                  <div class="{draggedTask === task.id ? 'opacity-50' : ''}">
                    <TaskCard
                      {task}
                      stages={taskStages}
                      {priorityColors}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onToggle={handleTaskToggle}
                      onStageChange={async (taskId, stageId) => {
                        try {
                          await taskService.moveToStage(taskId, stageId)
                          await loadData()
                        } catch (error) {
                          console.error('Failed to update task stage:', error)
                        }
                      }}
                      showTeam={showAllTeams}
                      draggable={true}
                      onDragStart={handleDragStart}
                      onDragEnd={() => draggedTask = null}
                    />
                  </div>
                {/each}
                </div>
              </CardContent>
            </Card>
          {/each}
        </div>
      {:else if viewMode === "list"}
        <div class="space-y-2">
          {#each uiTasks() as task (task.id)}
            <div 
              class="transition-shadow hover:shadow-md bg-[var(--theme-card-bg)] rounded-lg border cursor-pointer" 
              onclick={() => handleEditTask(task.id)} 
              onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleEditTask(task.id) }}
              role="button" 
              tabindex="0"
            >
              <div class="flex items-center gap-4 p-4">
                <div onclick={(e: MouseEvent) => e.stopPropagation()}>
                  <Checkbox 
                    checked={task.completed} 
                    onchange={() => handleTaskToggle(task.id)}
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="mb-1 flex items-center gap-2">
                    <h4 class="font-medium text-[var(--theme-foreground)]">{task.title}</h4>
                    <Badge class={priorityColors[task.priority]} variant="outline">
                      {task.priority}
                    </Badge>
                    <Badge class={getStageColor(taskStages.find(s => s.id === task.stageId))} variant="secondary">
                      {task.stageName}
                    </Badge>
                  </div>
                  {#if task.description}
                    <p class="mb-2 text-sm text-[var(--theme-muted-foreground)]">{task.description}</p>
                  {/if}
                  <div class="flex flex-wrap items-center gap-4 text-xs text-[var(--theme-muted-foreground)]">
                    <span class="font-medium">{task.projectName}</span>
                    {#if task.dueDate}
                      <div class="flex items-center gap-1">
                        <CalendarIcon class="size-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    {/if}
                  </div>
                </div>
                <DropdownMenu>
                  {#snippet trigger()}
                    <Button variant="ghost" size="icon" onclick={(e) => e.stopPropagation()}>
                      <MoreVertical class="size-4" />
                    </Button>
                  {/snippet}
                  {#snippet children()}
                    <DropdownMenuItem onclick={() => handleEditTask(task.id)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onclick={() => handleDeleteTask(task.id)}>Delete</DropdownMenuItem>
                  {/snippet}
                </DropdownMenu>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- Table View -->
        <Card class="bg-[var(--theme-card-bg)]">
          <CardContent class="p-0">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="border-b bg-[var(--theme-section-bg)]">
                  <tr>
                    <th class="w-12 p-4">
                      <Checkbox />
                    </th>
                    <th class="p-4 text-left text-sm font-medium text-[var(--theme-foreground)]">Task</th>
                    <th class="p-4 text-left text-sm font-medium text-[var(--theme-foreground)]">Project</th>
                    <th class="p-4 text-left text-sm font-medium text-[var(--theme-foreground)]">Status</th>
                    <th class="p-4 text-left text-sm font-medium text-[var(--theme-foreground)]">Priority</th>
                    <th class="p-4 text-left text-sm font-medium text-[var(--theme-foreground)]">Due Date</th>
                    <th class="w-12 p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {#each uiTasks() as task (task.id)}
                    <tr class="border-b transition-colors hover:bg-[var(--theme-sidebar-hover)]">
                      <td class="p-4">
                        <Checkbox checked={task.completed} onchange={() => handleTaskToggle(task.id)} />
                      </td>
                      <td class="p-4 cursor-pointer" onclick={() => handleEditTask(task.id)}>
                        <div>
                          <div class="font-medium text-[var(--theme-foreground)]">{task.title}</div>
                          {#if task.description}
                            <div class="text-sm text-[var(--theme-muted-foreground)]">{task.description}</div>
                          {/if}
                        </div>
                      </td>
                      <td class="p-4 text-sm text-[var(--theme-foreground)] cursor-pointer" onclick={() => {
                        if (task.projectId) goto(`/projects/${task.projectId}`)
                      }}>{task.projectName}</td>
                      <td class="p-4">
                        <Badge class={getStageColor(taskStages.find(s => s.id === task.stageId))} variant="secondary">
                          {task.stageName}
                        </Badge>
                      </td>
                      <td class="p-4">
                        <Badge class={priorityColors[task.priority]} variant="outline">
                          {task.priority}
                        </Badge>
                      </td>
                      <td class="p-4 text-sm text-[var(--theme-foreground)]">
                        {#if task.dueDate}
                          {new Date(task.dueDate).toLocaleDateString()}
                        {:else}
                          <span class="text-[var(--theme-muted-foreground)]">No date</span>
                        {/if}
                      </td>
                      <td class="p-4">
                        <DropdownMenu>
                          {#snippet trigger()}
                            <Button variant="ghost" size="icon">
                              <MoreVertical class="size-4" />
                            </Button>
                          {/snippet}
                          {#snippet children()}
                            <DropdownMenuItem onclick={() => handleEditTask(task.id)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onclick={() => handleDeleteTask(task.id)}>Delete</DropdownMenuItem>
                          {/snippet}
                        </DropdownMenu>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      {/if}
    {/if}
  </div>
</div>

<!-- Create Task Flyout -->
{#if showCreateFlyout}
  <CreationFlyout bind:open={showCreateFlyout} title="New Task">
    <TaskDetail
      mode="create"
      isFlyout={true}
      onSuccess={async (taskId: string) => {
        showCreateFlyout = false
        await loadData()
      }}
    />
  </CreationFlyout>
{/if}

<!-- Edit Task Flyout -->
{#if showTaskDetailFlyout && selectedTaskId}
  <CreationFlyout bind:open={showTaskDetailFlyout} title="Edit Task">
    <TaskDetail
      taskId={selectedTaskId}
      mode="edit"
      isFlyout={true}
      onSuccess={async (taskId: string) => {
        showTaskDetailFlyout = false
        selectedTaskId = null
        await loadData()
      }}
    />
  </CreationFlyout>
{/if}
