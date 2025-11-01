<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { Card, Checkbox } from 'flowbite-svelte'
  import { Button } from '$lib/components/ui'
  import { Plus, CheckSquare } from 'lucide-svelte'
  import { taskService } from '$lib/api/services/taskService'
  import { teamService } from '$lib/api/services/teamService'
  import { currentTeam } from '$lib/stores/teams'
  import { get } from 'svelte/store'
  import TaskDetail from '$lib/components/tasks/TaskDetail.svelte'
  import CreationFlyout from '$lib/components/ui/CreationFlyout.svelte'
  import type { Task, TaskCreate } from '$lib/types/domain/task'
  import type { TeamMember } from '$lib/api/services/teamService'

  interface Props {
    projectId: string
    resourceId?: string | null
    onTaskChange?: () => void
  }

  let { projectId, resourceId, onTaskChange }: Props = $props()

  let tasks = $state<Task[]>([])
  let loading = $state(true)
  let error = $state<string | null>(null)
  let showCreateForm = $state(false)
  let showNewTaskFlyout = $state(false)
  let newTaskTitle = $state('')
  let newTaskDescription = $state('')
  let newTaskPriority = $state<Task['priority']>('medium')
  let newTaskAssignedTo = $state<string | undefined>(undefined)
  let creating = $state(false)
  let teamMembers = $state<TeamMember[]>([])

  onMount(async () => {
    await Promise.all([loadTasks(), loadTeamMembers()])
  })

  async function loadTeamMembers() {
    const team = get(currentTeam)
    if (team) {
      try {
        teamMembers = await teamService.getMembers(team.id)
      } catch (err) {
        console.error('Failed to load team members:', err)
      }
    }
  }

  async function loadTasks() {
    try {
      loading = true
      tasks = await taskService.list({ projectId, resourceId: resourceId || undefined })
    } catch (err: any) {
      error = err?.message || 'Failed to load tasks'
    } finally {
      loading = false
    }
  }

  async function toggleTask(task: Task) {
    try {
      await taskService.update(task.id, { completed: !task.completed })
      await loadTasks()
      onTaskChange?.()
    } catch (err: any) {
      console.error('Failed to toggle task:', err)
    }
  }
  
  // Export functions to parent if needed for progress updates
  export { loadTasks, toggleTask }

  async function createTask() {
    if (!newTaskTitle.trim()) {
      error = 'Task title is required'
      return
    }

    creating = true
    error = null

    try {
      const taskData: TaskCreate = {
        projectId,
        resourceId: resourceId || undefined,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        priority: newTaskPriority,
        assignedTo: newTaskAssignedTo,
      }

      await taskService.create(taskData)
      newTaskTitle = ''
      newTaskDescription = ''
      newTaskPriority = 'medium'
      newTaskAssignedTo = undefined
      showCreateForm = false
      await loadTasks()
      onTaskChange?.()
    } catch (err: any) {
      error = err?.message || 'Failed to create task'
    } finally {
      creating = false
    }
  }

  function getPriorityColor(priority: Task['priority']) {
    switch (priority) {
      case 'high':
        return 'text-[var(--theme-error)]'
      case 'medium':
        return 'text-[var(--theme-warning)]'
      case 'low':
        return 'text-[var(--theme-success)]'
      default:
        return 'text-[var(--theme-sidebar-muted)]'
    }
  }

  function handleAddTask() {
    showNewTaskFlyout = true
  }

  async function handleTaskCreated(taskId: string) {
    showNewTaskFlyout = false
    await loadTasks()
    onTaskChange?.()
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">Tasks</h2>
    <Button variant="default" size="sm" onclick={handleAddTask}>
      <Plus class="mr-2 size-4" />
      Add Task
    </Button>
  </div>

  {#if showCreateForm}
    <Card class="p-4">
      <div class="space-y-4">
        <div class="space-y-2">
          <div class="text-sm font-medium">Title *</div>
          <input
            type="text"
            bind:value={newTaskTitle}
            placeholder="Enter task title..."
            class="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div class="space-y-2">
          <div class="text-sm font-medium">Description</div>
          <textarea
            bind:value={newTaskDescription}
            placeholder="Enter task description..."
            rows="3"
            class="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
          ></textarea>
        </div>
        {#if teamMembers.length > 0}
          <div class="space-y-2">
            <div class="text-sm font-medium">Assign To</div>
            <select
              bind:value={newTaskAssignedTo}
              class="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Unassigned</option>
              {#each teamMembers as member}
                <option value={member.userId}>{member.user?.name || member.user?.email || 'Unknown'}</option>
              {/each}
            </select>
          </div>
        {/if}
        <div class="flex gap-2">
          <Button variant="default" size="sm" onclick={createTask} disabled={creating || !newTaskTitle.trim()}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
          <Button variant="outline" size="sm" onclick={() => { showCreateForm = false; newTaskTitle = ''; newTaskDescription = ''; }}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  {/if}

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p class="text-sm text-muted-foreground">Loading tasks...</p>
      </div>
    </div>
  {:else if error}
    <Card class="p-6">
      <p class="text-sm text-red-600">{error}</p>
    </Card>
  {:else if tasks.length === 0}
    <Card class="flex flex-col items-center justify-center py-12">
      <CheckSquare class="mb-4 size-12 text-muted-foreground opacity-50" />
      <p class="mb-2 text-sm font-medium">No tasks yet</p>
      <p class="mb-4 text-sm text-muted-foreground">
        Add tasks to track your progress on this project
      </p>
      <Button variant="default" size="sm" onclick={handleAddTask}>
        <Plus class="mr-2 size-4" />
        Add First Task
      </Button>
    </Card>
  {:else}
    <div class="space-y-3">
      {#each tasks as task (task.id)}
        <Card class="p-4">
          <div class="flex items-start gap-3">
            <Checkbox
              checked={task.completed}
              onchange={() => toggleTask(task)}
              class="mt-1"
            />
            <div class="flex-1">
              <div class:line-through={task.completed} class:text-muted-foreground={task.completed}>
                <span class="font-medium">{task.title}</span>
              </div>
              {#if task.description}
                <p class="mt-1 text-sm text-muted-foreground">{task.description}</p>
              {/if}
              <div class="mt-2 flex items-center gap-4 text-xs">
                <span class="{getPriorityColor(task.priority)} font-medium capitalize">
                  {task.priority}
                </span>
                {#if task.assignedTo}
                  {@const assignedMember = teamMembers.find((m) => m.userId === task.assignedTo)}
                  <span class="text-muted-foreground">
                    Assigned to: {assignedMember?.user?.name || assignedMember?.user?.email || 'Unknown'}
                  </span>
                {/if}
                {#if task.dueDate}
                  <span class="text-muted-foreground">
                    Due {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                {/if}
              </div>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<!-- New Task Creation Flyout -->
<CreationFlyout bind:open={showNewTaskFlyout} title="Create New Task">
  <TaskDetail
    mode="create"
    projectId={projectId}
    isFlyout={true}
    onSuccess={handleTaskCreated}
  />
</CreationFlyout>

