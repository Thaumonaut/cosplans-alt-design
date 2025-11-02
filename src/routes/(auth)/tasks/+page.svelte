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
  import { projectService } from '$lib/api/services/projectService'
  import { teamService } from '$lib/api/services/teamService'
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
  import type { Task, TaskPriority } from '$lib/types/domain/task'
  import type { Project } from '$lib/types/domain/project'

  type ViewMode = "kanban" | "list" | "table"
  type Status = "todo" | "in-progress" | "done"

  let viewMode = $state<ViewMode>("kanban")
  let filterProject = $state<string>("all")
  let filterPriority = $state<string>("all")
  let loading = $state(true)
  let allTasks = $state<Task[]>([])
  let allProjects = $state<Project[]>([])
  let teamMembers = $state<TeamMember[]>([])
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

      const [tasksData, projectsData] = await Promise.all([
        taskService.listAll(filters),
        projectService.list()
      ])

      allTasks = tasksData
      allProjects = projectsData

      // Load team members for assignment display
      try {
        teamMembers = await teamService.getMembers(team.id)
      } catch (err) {
        console.error('Failed to load team members:', err)
      }
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      loading = false
    }
  }

  // Filter tasks
  const filteredTasks = $derived(() => {
    let filtered = allTasks

    if (filterProject !== "all") {
      filtered = filtered.filter(t => t.projectId === filterProject)
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter(t => t.priority === filterPriority)
    }

    return filtered
  })

  // Convert tasks to UI format with project names and assigned user info
  const uiTasks = $derived(() => {
    return filteredTasks().map(task => {
      const project = allProjects.find(p => p.id === task.projectId)
      const assignedMember = task.assignedTo ? teamMembers.find(m => m.userId === task.assignedTo) : null
      return {
        ...task,
        projectName: project ? `${project.character} (${project.series})` : null,
        assignedUser: assignedMember?.user,
        status: task.completed ? 'done' : (task.priority === 'high' ? 'in-progress' : 'todo') as Status,
        dueDateStr: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      }
    })
  })

  const projects = $derived(() => {
    return [
      { value: 'all', label: 'All Projects' },
      ...allProjects.map(p => ({ value: p.id, label: `${p.character} (${p.series})` }))
    ]
  })

  const statusLabels: Record<Status, string> = {
    todo: "To Do",
    "in-progress": "In Progress",
    done: "Done",
  }

  const priorityColors = {
    high: "bg-[color-mix(in_srgb,var(--theme-error)_20%,transparent)] backdrop-blur-sm text-[var(--theme-error)] border-[color-mix(in_srgb,var(--theme-error)_30%,transparent)]",
    medium: "bg-[color-mix(in_srgb,var(--theme-warning)_20%,transparent)] backdrop-blur-sm text-[var(--theme-warning)] border-[color-mix(in_srgb,var(--theme-warning)_30%,transparent)]",
    low: "bg-[color-mix(in_srgb,var(--theme-info)_20%,transparent)] backdrop-blur-sm text-[var(--theme-info)] border-[color-mix(in_srgb,var(--theme-info)_30%,transparent)]",
  }

  const statusColors = {
    todo: "bg-[color-mix(in_srgb,var(--theme-muted)_20%,transparent)] backdrop-blur-sm text-[var(--theme-muted-foreground)]",
    "in-progress": "bg-[color-mix(in_srgb,var(--theme-primary)_20%,transparent)] backdrop-blur-sm text-[var(--theme-primary)]",
    done: "bg-[color-mix(in_srgb,var(--theme-success)_20%,transparent)] backdrop-blur-sm text-[var(--theme-success)]",
  }

  function getTasksByStatus(status: string) {
    return uiTasks().filter((task) => task.status === status)
  }

  // Drag and drop handlers
  let draggedTask = $state<string | null>(null)
  let dragOverStatus = $state<string | null>(null)

  function handleDragStart(taskId: string, event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', taskId)
    }
    draggedTask = taskId
  }

  function handleDragOver(status: string, event: DragEvent) {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
    dragOverStatus = status
  }

  function handleDragLeave() {
    dragOverStatus = null
  }

  async function handleDrop(status: string, event: DragEvent) {
    event.preventDefault()
    dragOverStatus = null
    
    if (!draggedTask) return

    const task = allTasks.find(t => t.id === draggedTask)
    if (!task) return

    // Determine what updates are needed based on the new status
    const updates: { completed?: boolean; priority?: TaskPriority } = {}
    
    if (status === 'done') {
      updates.completed = true
    } else if (status === 'todo') {
      updates.completed = false
      // If moving to todo from in-progress, might want to lower priority
      if (task.priority === 'high') {
        updates.priority = 'medium'
      }
    } else if (status === 'in-progress') {
      updates.completed = false
      // If moving to in-progress, might want to raise priority
      if (task.priority === 'low') {
        updates.priority = 'medium'
      }
    }

    try {
      await taskService.update(draggedTask, updates)
      await loadData()
    } catch (error) {
      console.error('Failed to update task status:', error)
    }

    draggedTask = null
  }

  async function handleTaskToggle(taskId: string) {
    try {
      await taskService.toggleComplete(taskId)
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
      <Button onclick={handleCreateTask}>
        <Plus class="mr-2 size-4" />
        New Task
      </Button>
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
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {#each ["todo", "in-progress", "done"] as statusStr}
            {@const status = statusStr as Status}
            <Card class="flex flex-col bg-[var(--theme-card-bg)] shadow-sm">
              <CardHeader class="pb-4">
                <div class="flex items-center justify-between">
                  <CardTitle class="text-base font-semibold">{statusLabels[status]}</CardTitle>
                  <Badge variant="secondary" class="text-sm px-2 py-0.5 font-medium">
                    {getTasksByStatus(status).length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent class="flex-1 space-y-3 overflow-y-auto min-h-[200px] p-0">
                <div
                  role="region"
                  aria-label={`${statusLabels[status]} tasks`}
                  class="h-full space-y-3 p-6 {dragOverStatus === status && draggedTask && getTasksByStatus(status).findIndex(t => t.id === draggedTask) === -1 ? 'opacity-50' : ''}"
                  ondragover={(e: DragEvent) => handleDragOver(status, e)}
                  ondragleave={handleDragLeave}
                  ondrop={(e: DragEvent) => handleDrop(status, e)}
                >
                {#each getTasksByStatus(status) as task (task.id)}
                  <div 
                    class="group cursor-pointer transition-all hover:shadow-lg bg-white dark:bg-[var(--theme-card-bg)] rounded-xl border border-[var(--theme-border)] p-5 shadow-sm {draggedTask === task.id ? 'opacity-50' : ''}"
                    draggable="true"
                    ondragstart={(e) => handleDragStart(task.id, e)}
                    ondragend={() => draggedTask = null}
                    onclick={() => handleEditTask(task.id)} 
                    onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleEditTask(task.id) }}
                    role="button" 
                    tabindex="0"
                  >
                    <div class="mb-3 flex items-start justify-between gap-3">
                      <div class="flex items-start gap-3 flex-1 min-w-0">
                        <GripVertical class="mt-1 size-4 text-[var(--theme-muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
                        <div onclick={(e: MouseEvent) => e.stopPropagation()} class="shrink-0 mt-0.5">
                          <Checkbox 
                            checked={task.completed} 
                            onchange={() => handleTaskToggle(task.id)}
                          />
                        </div>
                        <div class="flex-1 min-w-0">
                          <h4 class="mb-2 text-base font-semibold leading-snug text-[var(--theme-foreground)] line-clamp-2">{task.title}</h4>
                          <p class="mb-3 text-sm text-[var(--theme-muted-foreground)] line-clamp-3 leading-relaxed">
                            {#if task.description}
                              {task.description}
                            {:else}
                              <span class="italic opacity-60">No description provided</span>
                            {/if}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        {#snippet trigger()}
                          <Button variant="ghost" size="icon" class="size-7 shrink-0" onclick={(e: MouseEvent) => e.stopPropagation()}>
                            <MoreVertical class="size-4" />
                          </Button>
                        {/snippet}
                        {#snippet children()}
                          <DropdownMenuItem onclick={() => handleEditTask(task.id)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onclick={() => handleDeleteTask(task.id)}>Delete</DropdownMenuItem>
                        {/snippet}
                      </DropdownMenu>
                    </div>
                    
                    <!-- Priority and Due Date -->
                    <div class="flex flex-wrap items-center gap-3 mb-3">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-medium text-[var(--theme-muted-foreground)] uppercase tracking-wide">Priority:</span>
                        <Badge class="{priorityColors[task.priority]} text-xs font-medium px-2 py-1" variant="outline">
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-medium text-[var(--theme-muted-foreground)] uppercase tracking-wide">Due:</span>
                        <div class="flex items-center gap-1.5 text-sm text-[var(--theme-muted-foreground)]">
                          <Clock class="size-4" />
                          {#if task.dueDate}
                            <span class="font-medium">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          {:else}
                            <span class="italic opacity-60">No due date</span>
                          {/if}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Assigned Team Member -->
                    <div class="flex items-center gap-2 mb-3 pb-3 border-b border-[var(--theme-border-subtle)]">
                      <span class="text-xs font-medium text-[var(--theme-muted-foreground)] uppercase tracking-wide">Assigned:</span>
                      <div class="flex items-center gap-2">
                        {#if task.assignedUser}
                          <div class="flex items-center gap-2">
                            {#if task.assignedUser.avatarUrl}
                              <img 
                                src={task.assignedUser.avatarUrl} 
                                alt={task.assignedUser.name || task.assignedUser.email}
                                class="size-6 rounded-full object-cover"
                              />
                            {:else}
                              <div class="flex size-6 items-center justify-center rounded-full bg-[var(--theme-primary)] text-[var(--theme-primary-foreground)] text-xs font-medium">
                                {(task.assignedUser.name || task.assignedUser.email).charAt(0).toUpperCase()}
                              </div>
                            {/if}
                            <span class="text-sm font-medium text-[var(--theme-foreground)]">
                              {task.assignedUser.name || task.assignedUser.email}
                            </span>
                          </div>
                        {:else}
                          <span class="text-sm italic opacity-60 text-[var(--theme-muted-foreground)]">Unassigned</span>
                        {/if}
                      </div>
                    </div>
                    
                    <!-- Linked Project -->
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-medium text-[var(--theme-muted-foreground)] uppercase tracking-wide">Project:</span>
                      <div class="flex items-center gap-2 text-sm text-[var(--theme-muted-foreground)]">
                        {#if task.projectName}
                          <span class="font-medium">{task.projectName}</span>
                        {:else}
                          <span class="italic opacity-60">No project linked</span>
                        {/if}
                      </div>
                    </div>
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
                    <Badge class={statusColors[task.status]} variant="secondary">
                      {statusLabels[task.status]}
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
                        <Badge class={statusColors[task.status]} variant="secondary">
                          {statusLabels[task.status]}
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
