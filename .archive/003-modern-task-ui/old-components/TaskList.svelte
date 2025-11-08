<script lang="ts">
  import { tasks } from '$lib/stores/tasks-store'
  import type { Task, TaskCreate } from '$lib/types/domain/task'
  import { Button, Checkbox } from '$lib/components/ui'
  import { Plus, Calendar, AlertCircle } from 'lucide-svelte'
  import { cn } from '$lib/utils'

  interface Props {
    projectId: string
    resourceId?: string | null // null = project-level tasks, undefined = all tasks, string = resource-specific
    editable?: boolean
  }

  let { projectId, resourceId, editable = true }: Props = $props()

  let newTaskTitle = $state('')
  let isCreating = $state(false)

  // Load tasks when component mounts
  $effect(() => {
    tasks.load({ projectId, resourceId })
  })

  const taskList = $derived($tasks.items)

  async function handleToggle(task: Task) {
    if (!editable) return
    try {
      await tasks.toggleComplete(task.id)
    } catch (err) {
      console.error('Failed to toggle task:', err)
    }
  }

  async function handleCreate() {
    if (!newTaskTitle.trim() || !editable) return

    isCreating = true
    try {
      const taskData: TaskCreate = {
        projectId,
        resourceId: resourceId === null ? undefined : resourceId,
        title: newTaskTitle.trim(),
        priority: 'medium',
      }
      await tasks.create(taskData)
      newTaskTitle = ''
    } catch (err) {
      console.error('Failed to create task:', err)
    } finally {
      isCreating = false
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCreate()
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const isOverdue = date < now
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  function isOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false
    return new Date(task.dueDate) < new Date()
  }
</script>

<div class="space-y-4">
  <!-- Task List -->
  <div class="space-y-2">
    {#if taskList.length === 0 && !editable}
      <p class="text-center text-sm text-muted-foreground py-8">No tasks yet.</p>
    {:else if taskList.length === 0}
      <p class="text-center text-sm text-muted-foreground py-8">
        No tasks yet. Add one below to get started.
      </p>
    {:else}
      {#each taskList as task (task.id)}
        <div
          class={cn(
            'group flex items-start gap-3 rounded-lg border p-3 transition-colors',
            task.completed && 'bg-muted/50 opacity-75',
            isOverdue(task) && 'border-red-200 dark:border-red-900'
          )}
        >
          <!-- Checkbox -->
          <div class="pt-0.5">
            <Checkbox
              checked={task.completed}
              onchange={() => handleToggle(task)}
              disabled={!editable}
              class="data-[state=checked]:bg-primary"
            />
          </div>

          <!-- Task Content -->
          <div class="flex-1 min-w-0">
            <div class={cn('text-sm font-medium', task.completed && 'line-through text-muted-foreground')}>
              {task.title}
            </div>

            {#if task.description}
              <p class="mt-1 text-xs text-muted-foreground">{task.description}</p>
            {/if}

            <!-- Meta Info -->
            <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {#if task.dueDate}
                <div class={cn('flex items-center gap-1', isOverdue(task) && 'text-red-600')}>
                  <Calendar class="size-3" />
                  <span>{formatDate(task.dueDate)}</span>
                  {#if isOverdue(task)}
                    <AlertCircle class="size-3" />
                  {/if}
                </div>
              {/if}

              {#if task.priority !== 'medium'}
                <span
                  class={cn(
                    'rounded-full px-2 py-0.5',
                    task.priority === 'high'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                  )}
                >
                  {task.priority}
                </span>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Add New Task -->
  {#if editable}
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={newTaskTitle}
        onkeydown={handleKeydown}
        placeholder="Add a new task..."
        disabled={isCreating}
        class="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      />
      <Button
        onclick={handleCreate}
        disabled={!newTaskTitle.trim() || isCreating}
        size="sm"
      >
        <Plus class="size-4" />
      </Button>
    </div>
  {/if}
</div>


