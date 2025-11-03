<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { get } from 'svelte/store'
  import { taskService } from '$lib/api/services/taskService'
  import { taskStageService } from '$lib/api/services/taskStageService'
  import { teamService, type Team } from '$lib/api/services/teamService'
  import { teams, currentTeam } from '$lib/stores/teams'
  import { Button } from '$lib/components/ui'
  import { Badge, Checkbox } from 'flowbite-svelte'
  import { Calendar, X, Clock, AlertCircle, Flag, LayoutGrid } from 'lucide-svelte'
  import InlineTextEditor from '$lib/components/base/InlineTextEditor.svelte'
  import InlineSelect from '$lib/components/base/InlineSelect.svelte'
  import InlineDatePicker from '$lib/components/base/InlineDatePicker.svelte'
  import StageSelector from '$lib/components/base/StageSelector.svelte'
  import type { Task, TaskCreate, TaskPriority, TaskStage } from '$lib/types/domain/task'

  interface Props {
    taskId?: string
    projectId?: string
    mode?: 'create' | 'edit' | 'view'
    isFlyout?: boolean
    onSuccess?: (taskId: string) => void
  }

  let { taskId, projectId, mode, isFlyout = false, onSuccess }: Props = $props()

  let task: Task | null = $state(null)
  let newTask: TaskCreate = $state({
    projectId: projectId || null,
    title: '',
    description: undefined,
    dueDate: undefined,
    priority: 'medium',
  })
  
  let newTaskCompleted = $state(false)
  let loading = $state(true)
  let error = $state<string | null>(null)
  let saving = $state(false)
  let activeTab = $state<'overview' | 'details'>('overview')
  let availableTeams = $state<Team[]>([])
  let selectedTeamId = $state<string | null>(null) // For standalone task team selection
  let availableStages = $state<TaskStage[]>([]) // Available stages for the task's team
  let selectedStageId = $state<string | null>(null) // For stage selector binding
  let currentStage = $derived(() => {
    if (!task || !availableStages.length) return null
    return availableStages.find(s => s.id === task!.stageId) || null
  })
  
  // Sync selectedStageId with task.stageId
  $effect(() => {
    if (task) {
      selectedStageId = task.stageId
    } else if (currentMode() === 'create') {
      selectedStageId = newTask.stageId || null
    }
  })

  const currentMode = $derived(() => {
    if (mode) return mode
    if (!taskId) return 'create'
    return task ? 'edit' : 'view'
  })

  const isReadOnly = $derived(() => {
    return currentMode() === 'view'
  })

  const createdDate = $derived(() => {
    if (currentMode() === 'create') return null
    if (!task?.createdAt) return null
    return new Date(task.createdAt)
  })

  const priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ]

  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    high: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  }

  let priorityValue = $state<TaskPriority>('medium')

  onMount(async () => {
    if (currentMode() === 'create') {
      // Load available teams for team selector (standalone tasks only)
      try {
        availableTeams = await teamService.list()
        // Default to current active team
        const current = get(currentTeam)
        if (current) {
          selectedTeamId = current.id
          newTask.teamId = current.id
          // Load stages for default team
          availableStages = await taskStageService.list(current.id)
          // Set default stage to first non-completion stage
          const firstNonCompletion = availableStages.find(s => !s.isCompletionStage)
          if (firstNonCompletion) {
            newTask.stageId = firstNonCompletion.id
          }
        } else if (availableTeams.length > 0) {
          selectedTeamId = availableTeams[0].id
          newTask.teamId = availableTeams[0].id
          // Load stages for first team
          availableStages = await taskStageService.list(availableTeams[0].id)
          const firstNonCompletion = availableStages.find(s => !s.isCompletionStage)
          if (firstNonCompletion) {
            newTask.stageId = firstNonCompletion.id
          }
        }
      } catch (err) {
        console.error('Failed to load teams:', err)
      }
      loading = false
      return
    }

    if (!taskId) {
      error = 'Invalid task ID'
      loading = false
      return
    }

    try {
      const loaded = await taskService.get(taskId)
      if (loaded) {
        task = loaded
        // Load stages for this task's team
        const team = get(currentTeam) || { id: loaded.teamId }
        availableStages = await taskStageService.list(team.id)
      } else {
        error = 'Task not found'
      }
    } catch (err: any) {
      error = err?.message || 'Failed to load task'
    } finally {
      loading = false
    }
  })

  async function handleSaveField(field: string, value: any) {
    if (currentMode() === 'create') {
      if (field === 'title') newTask.title = value
      else if (field === 'description') newTask.description = value || undefined
      else if (field === 'dueDate') newTask.dueDate = value || undefined
      else if (field === 'priority') newTask.priority = value
      else if (field === 'completed') newTaskCompleted = value
      return
    }

    if (!task || isReadOnly()) return
    
    try {
      await taskService.update(task.id, { [field]: value })
      const updated = await taskService.get(task.id)
      if (updated) {
        task = updated
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

  async function handleToggleComplete() {
    if (!task) return
    try {
      // toggleComplete internally uses moveToStage to handle stage-based completion
      const updated = await taskService.toggleComplete(task.id)
      // Update local state immediately for responsive UI
      if (updated) {
        task = updated
        // Force reactive update
        completedValue = updated.completed
      }
    } catch (err: any) {
      error = err?.message || 'Failed to toggle completion'
      // Revert checkbox state on error
      completedValue = task.completed
    }
  }

  async function handleCreate() {
    error = null

    if (!newTask.title) {
      error = 'Title is required'
      return
    }

    // projectId is now optional - tasks can be standalone or linked to a project
    saving = true

    try {
      const created = await taskService.create(newTask)
      if (isFlyout && onSuccess) {
        onSuccess(created.id)
      } else if (newTask.projectId) {
        goto(`/projects/${newTask.projectId}`)
      } else {
        // Standalone task - redirect to tasks page or dashboard
        goto('/tasks')
      }
    } catch (err: any) {
      error = err?.message || 'Failed to create task'
      saving = false
    }
  }

  let titleValue = $state('')
  let descriptionValue = $state('')
  let dueDateValue = $state('')
  let completedValue = $state(false)

  $effect(() => {
    if (currentMode() === 'create') {
      titleValue = newTask.title
      descriptionValue = newTask.description ?? ''
      dueDateValue = newTask.dueDate ?? ''
      priorityValue = newTask.priority || 'medium'
      completedValue = newTaskCompleted
    } else if (task) {
      titleValue = task.title
      descriptionValue = task.description ?? ''
      dueDateValue = task.dueDate ?? ''
      priorityValue = task.priority
      // Derive completed from task (which is now derived from stage.is_completion_stage)
      completedValue = task.completed
    }
  })

  // Also update completedValue when task changes externally (e.g., after update)
  $effect(() => {
    if (task) {
      completedValue = task.completed
    }
  })
</script>

{#if loading}
  <div class="flex items-center justify-center py-20">
    <div class="text-sm text-muted-foreground">Loading task...</div>
  </div>
{:else if error && currentMode() !== 'create' && !task}
  <div class="space-y-4 p-8">
    <p class="text-sm text-destructive">{error}</p>
    {#if projectId}
      <Button variant="outline" onclick={() => goto(`/projects/${projectId}`)}>Back to Project</Button>
    {:else}
      <Button variant="outline" onclick={() => goto('/dashboard')}>Back to Dashboard</Button>
    {/if}
  </div>
{:else}
  <div class="flex h-full flex-col">
    <!-- Header with Title and Quick Info -->
    <div class="border-b bg-background px-8 py-6">
      <div class="space-y-4">
        {#if error && currentMode() === 'create'}
          <div class="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        {/if}

        <!-- Title and Completion -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-3">
              {#if task && !isReadOnly()}
                <Checkbox
                  checked={completedValue}
                  onchange={async () => {
                    // handleToggleComplete updates the task state and stage automatically
                    await handleToggleComplete()
                    // completedValue will be updated via $effect when task changes
                  }}
                  class="mt-1"
                />
              {:else if task}
                <div class="mt-1 size-5 flex items-center justify-center">
                  {#if completedValue}
                    <div class="size-5 rounded border-2 border-primary bg-primary"></div>
                  {:else}
                    <div class="size-5 rounded border-2 border-muted-foreground"></div>
                  {/if}
                </div>
              {/if}
              <InlineTextEditor
                bind:value={titleValue}
                editable={!isReadOnly()}
                onSave={async (v: string) => {
                  if (currentMode() === 'create') {
                    newTask.title = v
                    titleValue = v
                  } else {
                    await handleSaveField('title', v)
                  }
                }}
                onValidate={validateRequired}
                placeholder="Task title"
                variant="title"
                className="text-3xl font-semibold {task?.completed ? 'line-through text-muted-foreground' : ''}"
              />
            </div>
          </div>
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

          <!-- Priority Badge -->
          <div class="flex items-center gap-2">
            <Flag class="size-4 text-muted-foreground" />
            {#if !isReadOnly()}
              <InlineSelect
                bind:value={priorityValue}
                editable={true}
                onSave={async (v: string) => {
                  if (currentMode() === 'create') {
                    newTask.priority = v as TaskPriority
                    priorityValue = v as TaskPriority
                  } else {
                    await handleSaveField('priority', v as TaskPriority)
                  }
                }}
                options={priorityOptions}
                placeholder="Priority"
              />
            {:else}
              <Badge class={priorityColors[priorityValue]}>
                {priorityValue.charAt(0).toUpperCase() + priorityValue.slice(1)}
              </Badge>
            {/if}
          </div>

          <!-- Due Date -->
          {#if dueDateValue || !isReadOnly()}
            <div class="flex items-center gap-2 text-muted-foreground">
              <Clock class="size-4" />
              {#if !isReadOnly()}
                <InlineDatePicker
                  bind:value={dueDateValue}
                  editable={true}
                  onSave={async (v) => {
                    if (currentMode() === 'create') {
                      newTask.dueDate = v || undefined
                    } else if (task) {
                      await handleSaveField('dueDate', v || undefined)
                    }
                  }}
                  placeholder="Select due date"
                  class="flex-1"
                />
              {:else if dueDateValue}
                <span>Due {new Date(dueDateValue).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              {:else}
                <span class="text-muted-foreground">No due date</span>
              {/if}
            </div>
          {/if}

          <!-- Status / Stage -->
          {#if task && availableStages.length > 0}
            <div class="flex items-center gap-2">
              <StageSelector
                stages={availableStages}
                currentStageId={task!.stageId}
                editable={!isReadOnly()}
                onStageChange={async (stageId) => {
                  if (!task) return
                  try {
                    await taskService.moveToStage(task!.id, stageId)
                    const updated = await taskService.get(task!.id)
                    if (updated) {
                      task = updated
                      availableStages = await taskStageService.list(updated.teamId)
                    }
                  } catch (err: any) {
                    error = err?.message || 'Failed to update stage'
                  }
                }}
                showNextStage={true}
              />
            </div>
          {/if}
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

    <!-- Tab Content - Moodboard Style -->
    <div class="flex-1 overflow-y-auto bg-muted/30">
      <div class="p-8">
        {#if activeTab === 'overview'}
          <!-- Overview: Description -->
          <div class="mx-auto max-w-4xl space-y-8">
            <!-- Description Section -->
            <div class="space-y-3 rounded-lg bg-background p-6 shadow-sm">
              <h3 class="text-sm font-medium text-muted-foreground">Description</h3>
              <InlineTextEditor
                bind:value={descriptionValue}
                editable={!isReadOnly()}
                onSave={async (v: string) => {
                  if (currentMode() === 'create') {
                    newTask.description = v || undefined
                    descriptionValue = v
                  } else if (task) {
                    task.description = v || undefined
                    descriptionValue = v
                    await handleSaveField('description', v || undefined)
                  }
                }}
                placeholder="Describe this task..."
                variant="body"
                multiline={true}
                className="text-base leading-relaxed min-h-[120px]"
              />
            </div>

            <!-- Quick Info Cards -->
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <!-- Stage Card (prominent) -->
              {#if task || (currentMode() === 'create' && availableStages.length > 0)}
                <div class="rounded-lg bg-background p-6 shadow-sm border border-border">
                  <div class="mb-3 flex items-center gap-2">
                    <LayoutGrid class="size-4 text-muted-foreground" />
                    <h3 class="text-sm font-medium text-muted-foreground">Current Stage</h3>
                  </div>
                  {#if task && availableStages.length > 0}
                    <StageSelector
                      stages={availableStages}
                      currentStageId={task!.stageId}
                      editable={!isReadOnly()}
                      onStageChange={async (stageId) => {
                        if (!task) return
                        try {
                          await taskService.moveToStage(task!.id, stageId)
                          const updated = await taskService.get(task!.id)
                          if (updated) {
                            task = updated
                            availableStages = await taskStageService.list(updated.teamId)
                          }
                        } catch (err: any) {
                          error = err?.message || 'Failed to update stage'
                        }
                      }}
                      showNextStage={true}
                      class="mt-1"
                    />
                  {:else if currentMode() === 'create'}
                    <select
                      bind:value={selectedStageId}
                      onchange={(e) => {
                        const stageId = (e.target as HTMLSelectElement).value
                        newTask.stageId = stageId
                        selectedStageId = stageId
                      }}
                      class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {#each availableStages as stage}
                        <option value={stage.id}>{stage.name} {stage.isCompletionStage ? '(✓ Completed)' : ''}</option>
                      {/each}
                    </select>
                  {/if}
                  <p class="mt-2 text-xs text-muted-foreground">
                    Click the stage to change or move to next stage
                  </p>
                </div>
              {/if}

              <!-- Priority Card -->
              <div class="rounded-lg bg-background p-6 shadow-sm">
                <div class="mb-2 flex items-center gap-2">
                  <Flag class="size-4 text-muted-foreground" />
                  <h3 class="text-sm font-medium text-muted-foreground">Priority</h3>
                </div>
                <Badge class="{priorityColors[priorityValue]} mt-2">
                  {priorityValue.charAt(0).toUpperCase() + priorityValue.slice(1)}
                </Badge>
              </div>

              <!-- Due Date Card -->
              {#if dueDateValue || !isReadOnly()}
                <div class="rounded-lg bg-background p-6 shadow-sm">
                  <div class="mb-2 flex items-center gap-2">
                    <Clock class="size-4 text-muted-foreground" />
                    <h3 class="text-sm font-medium text-muted-foreground">Due Date</h3>
                  </div>
                  {#if dueDateValue}
                    <p class="mt-2 text-base">
                      {new Date(dueDateValue).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                    {#if task && new Date(dueDateValue) < new Date() && !completedValue}
                      <div class="mt-2 flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle class="size-4" />
                        <span>Overdue</span>
                      </div>
                    {/if}
                  {:else}
                    <p class="mt-2 text-base text-muted-foreground">No due date set</p>
                  {/if}
                </div>
              {/if}
            </div>
          </div>

        {:else if activeTab === 'details'}
          <!-- Details Tab -->
          <div class="mx-auto max-w-4xl space-y-6">
            <!-- Task Information -->
            <div class="rounded-lg bg-background p-6 shadow-sm">
              <h3 class="mb-4 text-sm font-medium text-muted-foreground">Task Information</h3>
              <div class="space-y-4">
                <!-- Team Selector (for standalone tasks in create mode) -->
                {#if currentMode() === 'create' && !projectId}
                  <div>
                    <div class="mb-2 flex items-center justify-between">
                      <div class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Team</div>
                    </div>
                    {#if !isReadOnly()}
                      <select
                        bind:value={selectedTeamId}
                        onchange={async (e) => {
                          const teamId = (e.target as HTMLSelectElement).value
                          selectedTeamId = teamId
                          newTask.teamId = teamId
                          // Load stages for selected team
                          try {
                            availableStages = await taskStageService.list(teamId)
                          } catch (err) {
                            console.error('Failed to load stages:', err)
                          }
                        }}
                        class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {#each availableTeams as team}
                          <option value={team.id}>{team.name}</option>
                        {/each}
                      </select>
                      <p class="mt-1 text-xs text-muted-foreground">
                        Select which team this standalone task belongs to
                      </p>
                    {:else}
                      <p class="mt-1 text-sm font-medium">
                        {availableTeams.find(t => t.id === selectedTeamId)?.name || 'Unknown Team'}
                      </p>
                    {/if}
                  </div>
                {/if}

                <!-- Stage Selector -->
                {#if task && availableStages.length > 0}
                  <div>
                    <div class="mb-2 flex items-center justify-between">
                      <div class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stage</div>
                      <a 
                        href="/settings/task-stages" 
                        target="_blank"
                        class="text-xs text-primary hover:underline"
                      >
                        Manage Stages
                      </a>
                    </div>
                    <div class="mt-1">
                      <StageSelector
                        stages={availableStages}
                        currentStageId={task!.stageId}
                        editable={!isReadOnly()}
                        onStageChange={async (stageId) => {
                          if (!task) return
                          try {
                            await taskService.moveToStage(task!.id, stageId)
                            const updated = await taskService.get(task!.id)
                            if (updated) {
                              task = updated
                              availableStages = await taskStageService.list(updated.teamId)
                            }
                          } catch (err: any) {
                            error = err?.message || 'Failed to update stage'
                          }
                        }}
                        showNextStage={true}
                      />
                    </div>
                    <p class="mt-1 text-xs text-muted-foreground">
                      Click the stage badge to change or move to next stage
                    </p>
                  </div>
                {:else if currentMode() === 'create' && availableStages.length > 0}
                  <div>
                    <div class="mb-2 flex items-center justify-between">
                      <div class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stage</div>
                      {#if selectedTeamId}
                        <a 
                          href="/settings/task-stages" 
                          target="_blank"
                          class="text-xs text-primary hover:underline"
                        >
                          Manage Stages
                        </a>
                      {/if}
                    </div>
                    <select
                      bind:value={selectedStageId}
                      onchange={(e) => {
                        const stageId = (e.target as HTMLSelectElement).value
                        newTask.stageId = stageId
                        selectedStageId = stageId
                      }}
                      class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {#each availableStages as stage}
                        <option value={stage.id}>{stage.name} {stage.isCompletionStage ? '(Completed)' : ''}</option>
                      {/each}
                    </select>
                  </div>
                {/if}

                <div>
                  <div class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Project</div>
                  {#if projectId}
                    <p class="mt-1 text-sm">
                      <a href="/projects/{projectId}" class="text-primary hover:underline">View Project</a>
                    </p>
                  {:else if task?.projectId}
                    <p class="mt-1 text-sm">
                      <a href="/projects/{task.projectId}" class="text-primary hover:underline">View Project</a>
                    </p>
                  {:else if currentMode() === 'create'}
                    <p class="mt-1 text-sm text-muted-foreground">Standalone task (no project)</p>
                  {:else}
                    <p class="mt-1 text-sm text-muted-foreground">No project linked</p>
                  {/if}
                </div>
                
                {#if task?.resourceId}
                  <div>
                    <div class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Linked Resource</div>
                    <p class="mt-1 text-sm">
                      <a href="/resources/{task.resourceId}" class="text-primary hover:underline">View Resource</a>
                    </p>
                  </div>
                {/if}
              </div>
            </div>
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
            disabled={saving || !titleValue}
          >
            {saving ? 'Creating...' : 'Create Task'}
          </Button>
          <Button
            variant="outline"
            class="flex-1 bg-transparent"
            onclick={() => {
              if (isFlyout && onSuccess) {
                onSuccess('')
              } else if (projectId) {
                goto(`/projects/${projectId}`)
              } else {
                goto('/dashboard')
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

