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
  import { tasks as tasksStore } from '$lib/stores/tasks-store'
  import { currentTeam } from '$lib/stores/teams'
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
  import type { Task } from '$lib/types/domain/task'
  import type { Project } from '$lib/types/domain/project'

  type ViewMode = "kanban" | "list" | "table"
  type Status = "todo" | "in-progress" | "done"

  let viewMode = $state<ViewMode>("kanban")
  let filterProject = $state<string>("all")
  let filterPriority = $state<string>("all")
  let loading = $state(true)
  let allTasks = $state<Task[]>([])
  let allProjects = $state<Project[]>([])
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

  // Convert tasks to UI format with project names
  const uiTasks = $derived(() => {
    return filteredTasks().map(task => {
      const project = allProjects.find(p => p.id === task.projectId)
      return {
        ...task,
        projectName: project ? `${project.character} (${project.series})` : 'Unknown Project',
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
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {#each ["todo", "in-progress", "done"] as statusStr}
            {@const status = statusStr as Status}
            <Card class="flex flex-col bg-[var(--theme-card-bg)]">
              <CardHeader class="pb-3">
                <div class="flex items-center justify-between">
                  <CardTitle class="text-sm font-medium">{statusLabels[status]}</CardTitle>
                  <Badge variant="secondary" class="text-xs">
                    {getTasksByStatus(status).length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent class="flex-1 space-y-2">
                {#each getTasksByStatus(status) as task (task.id)}
                  <div 
                    class="group cursor-pointer transition-shadow hover:shadow-md bg-[var(--theme-card-bg)] rounded-lg border p-3" 
                    onclick={() => handleEditTask(task.id)} 
                    onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleEditTask(task.id) }}
                    role="button" 
                    tabindex="0"
                  >
                    <div class="mb-2 flex items-start justify-between gap-2">
                      <div class="flex items-start gap-2">
                        <GripVertical class="mt-0.5 size-4 text-[var(--theme-muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
                        <div onclick={(e: MouseEvent) => e.stopPropagation()}>
                          <Checkbox 
                            checked={task.completed} 
                            onchange={() => handleTaskToggle(task.id)}
                          />
                        </div>
                      </div>
                      <DropdownMenu>
                        {#snippet trigger()}
                          <Button variant="ghost" size="icon" class="size-6" onclick={(e: MouseEvent) => e.stopPropagation()}>
                            <MoreVertical class="size-3" />
                          </Button>
                        {/snippet}
                        {#snippet children()}
                          <DropdownMenuItem onclick={() => handleEditTask(task.id)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onclick={() => handleDeleteTask(task.id)}>Delete</DropdownMenuItem>
                        {/snippet}
                      </DropdownMenu>
                    </div>
                    <h4 class="mb-1 text-sm font-medium leading-tight text-[var(--theme-foreground)]">{task.title}</h4>
                    {#if task.description}
                      <p class="mb-3 text-xs text-[var(--theme-muted-foreground)] line-clamp-2">{task.description}</p>
                    {/if}
                    <div class="flex flex-wrap items-center gap-2">
                      <Badge class={priorityColors[task.priority]} variant="outline">
                        {task.priority}
                      </Badge>
                      {#if task.dueDate}
                        <div class="flex items-center gap-1 text-xs text-[var(--theme-muted-foreground)]">
                          <Clock class="size-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      {/if}
                    </div>
                    <div class="mt-2 text-xs text-[var(--theme-muted-foreground)]">{task.projectName}</div>
                  </div>
                {/each}
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
