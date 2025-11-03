<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { currentTeam, currentUserRole } from '$lib/stores/teams'
  import { taskStageService } from '$lib/api/services/taskStageService'
  import { taskService } from '$lib/api/services/taskService'
  import { Button, Input, Label, Switch, Badge } from '$lib/components/ui'
  import { Plus, Trash2, GripVertical, CheckCircle, AlertCircle } from 'lucide-svelte'
  import { toast } from '$lib/stores/toast'
  import type { TaskStage, TaskStageCreate } from '$lib/types/domain/task'

  let loading = $state(true)
  let saving = $state(false)
  let stages = $state<TaskStage[]>([])
  let showAddStageDialog = $state(false)
  let newStageName = $state('')
  let newStageIsCompletion = $state(false)
  let editingStageId = $state<string | null>(null)
  let editedStageName = $state('')
  let editedStageIsCompletion = $state(false)

  const canEdit = $derived(() => {
    const role = get(currentUserRole)
    return role === 'owner' || role === 'editor'
  })

  async function loadStages() {
    const team = get(currentTeam)
    if (!team) {
      loading = false
      return
    }

    try {
      stages = await taskStageService.ensureDefaults(team.id)
    } catch (error: any) {
      toast.error('Failed to load stages', error?.message || 'Unknown error')
    } finally {
      loading = false
    }
  }

  async function handleAddStage() {
    if (!newStageName.trim()) {
      toast.error('Invalid input', 'Stage name is required')
      return
    }

    const team = get(currentTeam)
    if (!team) {
      toast.error('No team selected', 'Please select a team first')
      return
    }

    // Check if at least one completion stage exists (if this is not one)
    const hasCompletionStage = stages.some(s => s.isCompletionStage)
    if (!newStageIsCompletion && !hasCompletionStage) {
      toast.error('Invalid configuration', 'At least one stage must be marked as a completion stage')
      return
    }

    saving = true
    try {
      const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.displayOrder)) : -1
      const newStage: TaskStageCreate = {
        teamId: team.id,
        name: newStageName.trim(),
        displayOrder: maxOrder + 1,
        isCompletionStage: newStageIsCompletion,
      }

      await taskStageService.create(newStage)
      await loadStages()
      newStageName = ''
      newStageIsCompletion = false
      showAddStageDialog = false
      toast.success('Stage created', `${newStage.name} has been added`)
    } catch (error: any) {
      toast.error('Failed to create stage', error?.message || 'Unknown error')
    } finally {
      saving = false
    }
  }

  async function handleDeleteStage(stageId: string) {
    const stage = stages.find(s => s.id === stageId)
    if (!stage) return

    // Check if this is the last completion stage
    const completionStages = stages.filter(s => s.isCompletionStage)
    if (stage.isCompletionStage && completionStages.length === 1) {
      toast.error('Cannot delete', 'At least one completion stage is required')
      return
    }

    // Check if any tasks are using this stage
    try {
      const tasksInStage = await taskService.list({ stageId })
      if (tasksInStage.length > 0) {
        if (!confirm(`This stage has ${tasksInStage.length} task(s). Deleting it will move them to the first available stage. Continue?`)) {
          return
        }
        // Move tasks to first non-completion stage (or completion stage if deleting a non-completion one)
        const targetStage = stages.find(
          s => s.id !== stageId && 
          (stage.isCompletionStage ? !s.isCompletionStage : s.isCompletionStage)
        ) || stages.find(s => s.id !== stageId)
        
        if (targetStage) {
          for (const task of tasksInStage) {
            await taskService.moveToStage(task.id, targetStage.id)
          }
        }
      }
    } catch (error: any) {
      toast.error('Failed to check tasks', error?.message || 'Unknown error')
      return
    }

    try {
      await taskStageService.delete(stageId)
      await loadStages()
      toast.success('Stage deleted', `${stage.name} has been removed`)
    } catch (error: any) {
      toast.error('Failed to delete stage', error?.message || 'Unknown error')
    }
  }

  async function handleUpdateStage(stageId: string) {
    const stage = stages.find(s => s.id === stageId)
    if (!stage) return

    // Prevent removing last completion stage
    const completionStages = stages.filter(s => s.isCompletionStage)
    if (stage.isCompletionStage && !editedStageIsCompletion && completionStages.length === 1) {
      toast.error('Cannot update', 'At least one completion stage is required')
      return
    }

    saving = true
    try {
      await taskStageService.update(stageId, {
        name: editedStageName.trim(),
        isCompletionStage: editedStageIsCompletion,
      })
      await loadStages()
      editingStageId = null
      toast.success('Stage updated', `${editedStageName} has been updated`)
    } catch (error: any) {
      toast.error('Failed to update stage', error?.message || 'Unknown error')
    } finally {
      saving = false
    }
  }

  async function handleReorder(up: boolean, index: number) {
    if (!canEdit()) return

    const newIndex = up ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= stages.length) return

    const newOrder = [...stages]
    ;[newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]]

    // Update display_order values
    const stageIds = newOrder.map(s => s.id)
    try {
      await taskStageService.reorder(get(currentTeam)!.id, stageIds)
      await loadStages()
      toast.success('Stages reordered', 'Stage order has been updated')
    } catch (error: any) {
      toast.error('Failed to reorder', error?.message || 'Unknown error')
    }
  }

  function startEdit(stage: TaskStage) {
    editingStageId = stage.id
    editedStageName = stage.name
    editedStageIsCompletion = stage.isCompletionStage
  }

  function cancelEdit() {
    editingStageId = null
    editedStageName = ''
    editedStageIsCompletion = false
  }

  onMount(() => {
    loadStages()
  })
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-semibold">Task Stages</h2>
      <p class="text-sm text-muted-foreground">
        Configure your team's task workflow stages. Tasks move through these stages in the kanban board.
      </p>
    </div>
    {#if canEdit()}
      <Button onclick={() => showAddStageDialog = true}>
        <Plus class="mr-2 size-4" />
        Add Stage
      </Button>
    {/if}
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-sm text-muted-foreground">Loading stages...</div>
    </div>
  {:else if stages.length === 0}
    <div class="rounded-lg border border-dashed bg-muted/30 p-12 text-center">
      <AlertCircle class="mx-auto mb-4 size-12 text-muted-foreground" />
      <p class="mb-2 text-lg font-semibold">No stages configured</p>
      <p class="mb-4 text-sm text-muted-foreground">
        Create your first stage to get started. Default stages will be created automatically.
      </p>
      {#if canEdit()}
        <Button onclick={() => loadStages()}>
          <Plus class="mr-2 size-4" />
          Create Default Stages
        </Button>
      {/if}
    </div>
  {:else}
    <div class="space-y-2">
      {#each stages as stage, index (stage.id)}
        <div class="flex items-center gap-4 rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors">
          {#if editingStageId === stage.id}
            <!-- Edit mode -->
            <div class="flex-1 space-y-3">
              <div class="flex items-center gap-2">
                <GripVertical class="size-4 text-muted-foreground" />
                <Input
                  bind:value={editedStageName}
                  placeholder="Stage name"
                  class="flex-1"
                />
                <div class="flex items-center gap-2">
                  <Label class="text-sm">Completion Stage</Label>
                  <Switch bind:checked={editedStageIsCompletion} />
                </div>
                <Button
                  size="sm"
                  onclick={() => handleUpdateStage(stage.id)}
                  disabled={saving || !editedStageName.trim()}
                >
                  <CheckCircle class="mr-2 size-4" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onclick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          {:else}
            <!-- View mode -->
            <div class="flex flex-1 items-center gap-4">
              <GripVertical class="size-4 text-muted-foreground cursor-grab" />
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium">{stage.name}</span>
                  {#if stage.isCompletionStage}
                    <Badge variant="secondary" class="bg-green-500/10 text-green-700 dark:text-green-300">
                      Completion Stage
                    </Badge>
                  {/if}
                </div>
                <p class="text-xs text-muted-foreground">Order: {stage.displayOrder}</p>
              </div>
              <div class="flex items-center gap-2">
                {#if canEdit()}
                  {#if index > 0}
                    <button
                      type="button"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      onclick={() => handleReorder(true, index)}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                  {/if}
                  {#if index < stages.length - 1}
                    <button
                      type="button"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      onclick={() => handleReorder(false, index)}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  {/if}
                  <Button
                    size="icon"
                    variant="ghost"
                    onclick={() => startEdit(stage)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onclick={() => {
                      if (confirm(`Delete stage "${stage.name}"?`)) {
                        handleDeleteStage(stage.id)
                      }
                    }}
                  >
                    <Trash2 class="size-4 text-destructive" />
                  </Button>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <div class="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/50">
      <div class="flex items-start gap-2">
        <AlertCircle class="mt-0.5 size-4 text-blue-600 dark:text-blue-400" />
        <div class="flex-1 text-sm">
          <p class="font-medium text-blue-900 dark:text-blue-100">About Completion Stages</p>
          <p class="mt-1 text-blue-700 dark:text-blue-300">
            Tasks in completion stages are considered "done". At least one completion stage is required. 
            You can mark multiple stages as completion stages if you have different types of completion (e.g., "Done", "Approved").
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Add Stage Dialog -->
{#if showAddStageDialog}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
      <h3 class="mb-4 text-lg font-semibold">Add New Stage</h3>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Stage Name</Label>
          <Input
            bind:value={newStageName}
            placeholder="e.g., Review, Testing, Approved"
          />
        </div>
        <div class="flex items-center gap-2">
          <Switch bind:checked={newStageIsCompletion} />
          <Label>Mark as Completion Stage</Label>
        </div>
        <div class="flex gap-2">
          <Button
            class="flex-1"
            onclick={handleAddStage}
            disabled={saving || !newStageName.trim()}
          >
            {saving ? 'Creating...' : 'Create Stage'}
          </Button>
          <Button
            variant="outline"
            onclick={() => {
              showAddStageDialog = false
              newStageName = ''
              newStageIsCompletion = false
            }}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}

