<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { currentTeam, currentUserRole } from '$lib/stores/teams'
  import { taskStageService } from '$lib/api/services/taskStageService'
  import { taskService } from '$lib/api/services/taskService'
  import { Button, Input, Label, Badge } from '$lib/components/ui'
  import ColorPicker from '$lib/components/ui/color-picker.svelte'
  import { Plus, Trash2, GripVertical, CheckCircle, AlertCircle, X } from 'lucide-svelte'
  import { toast } from '$lib/stores/toast'
  import { sortable } from '$lib/utils/draggable'
  import type { TaskStage, TaskStageCreate } from '$lib/types/domain/task'

  let loading = $state(true)
  let saving = $state(false)
  let stages = $state<TaskStage[]>([])
  let showAddStageDialog = $state(false)
  let newStageName = $state('')
  let newStageColor = $state<string | null>(null)
  let editingStageId = $state<string | null>(null)
  let editedStageName = $state('')
  let editedStageColor = $state<string | null>(null)

  const canEdit = $derived(() => {
    const role = get(currentUserRole)
    return role === 'owner' || role === 'editor'
  })

  const isLastStage = $derived((stage: TaskStage) => {
    return stages.length > 0 && stage.id === stages[stages.length - 1].id
  })

  async function loadStages() {
    const team = get(currentTeam)
    if (!team) {
      loading = false
      return
    }

    try {
      // Just load stages - don't ensure defaults (they're created when team is created)
      const loadedStages = await taskStageService.list(team.id)
      // Sort by displayOrder to ensure correct order
      stages = loadedStages.sort((a, b) => a.displayOrder - b.displayOrder)
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

    saving = true
    try {
      // Insert new stage before the completion stage (last stage)
      // If there are stages, put it before the last one; otherwise it becomes the first
      let newOrder: number
      if (stages.length > 0) {
        const lastStageOrder = stages[stages.length - 1].displayOrder
        // Place new stage at the same order as the last stage (will be inserted before it)
        newOrder = lastStageOrder
      } else {
        newOrder = 0
      }
      
      const newStage: TaskStageCreate = {
        teamId: team.id,
        name: newStageName.trim(),
        displayOrder: newOrder,
        isCompletionStage: false, // Will be set automatically if it's the last stage
        color: newStageColor || null,
      }

      const createdStage = await taskStageService.create(newStage)
      
      // Reorder stages to ensure proper ordering: new stage before last (completion) stage
      const allStages = await taskStageService.list(team.id)
      
      // Find the completion stage (last stage by displayOrder)
      const sortedStages = [...allStages].sort((a, b) => a.displayOrder - b.displayOrder)
      const lastStage = sortedStages[sortedStages.length - 1]
      
      // Separate stages: all stages except the new one and the last one
      const otherStages = sortedStages.filter(s => s.id !== createdStage.id && s.id !== lastStage.id)
      
      // Build ordered array: other stages (in order), new stage, completion stage (last)
      const orderedStageIds = [
        ...otherStages.map(s => s.id),
        createdStage.id,
        lastStage.id
      ]
      
      await taskStageService.reorder(team.id, orderedStageIds)
      
      await loadStages()
      newStageName = ''
      newStageColor = null
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

    // Prevent deleting the last stage (it's the completion stage)
    if (stages.length === 1) {
      toast.error('Cannot delete', 'At least one stage is required')
      return
    }

    if (saving) return
    
    saving = true

    // Check if any tasks are using this stage
    try {
      const tasksInStage = await taskService.list({ stageId })
      if (tasksInStage.length > 0) {
        if (!confirm(`This stage has ${tasksInStage.length} task(s). Deleting it will move them to another stage. Continue?`)) {
          saving = false
          return
        }
        // Move tasks to the first available stage (prefer non-completion if deleting completion)
        const targetStage = stages.find(s => s.id !== stageId && !s.isCompletionStage) || stages.find(s => s.id !== stageId)
        
        if (targetStage) {
          for (const task of tasksInStage) {
            await taskService.moveToStage(task.id, targetStage.id)
          }
        } else {
          throw new Error('No target stage available to move tasks to')
        }
    }

      // Now delete the stage (after moving tasks)
      await taskStageService.delete(stageId)
      
      // Reload stages to get the current state after deletion (without ensuring defaults)
      const allStages = await taskStageService.list(get(currentTeam)!.id)
      
      // Reorder remaining stages to fix display_order gaps
      const remainingStageIds = allStages.map(s => s.id)
      if (remainingStageIds.length > 0) {
        await taskStageService.reorder(get(currentTeam)!.id, remainingStageIds)
      }
      
      // Reload stages again to get the updated order
      await loadStages()
      toast.success('Stage deleted', `${stage.name} has been removed`)
    } catch (error: any) {
      console.error('Delete stage error:', error)
      toast.error('Failed to delete stage', error?.message || 'Unknown error')
    } finally {
      saving = false
    }
  }

  async function handleUpdateStage(stageId: string) {
    const stage = stages.find(s => s.id === stageId)
    if (!stage) return

    saving = true
    try {
      await taskStageService.update(stageId, {
        name: editedStageName.trim(),
        color: editedStageColor,
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

  async function handleColorChange(stageId: string, color: string | null | undefined) {
    if (saving) return
    
    // Verify the stage exists before updating
    const stage = stages.find(s => s.id === stageId)
    if (!stage) {
      console.error('Stage not found:', stageId, 'Available stages:', stages.map(s => ({ id: s.id, name: s.name })))
      toast.error('Stage not found', 'The stage you are trying to update does not exist')
      return
    }
    
    console.log('Updating color for stage:', { stageId, stageName: stage.name, color })
    
    saving = true
    try {
      console.log('[TaskStageSettings] Calling taskStageService.update:', { stageId, color })
      const updatedStage = await taskStageService.update(stageId, { color: color ?? null })
      console.log('[TaskStageSettings] Stage updated:', { 
        id: updatedStage.id, 
        name: updatedStage.name, 
        color: updatedStage.color,
        isCompletion: updatedStage.isCompletionStage 
      })
      
      // Update the local stages array directly instead of reloading to avoid closure issues
      const stageIndex = stages.findIndex(s => s.id === stageId)
      if (stageIndex !== -1) {
        // Create a completely new array with a new object for the updated stage
        // This ensures Svelte detects the change and updates all reactive references
        const newStages = stages.map((s, index) => {
          if (index === stageIndex) {
            // Return a completely new object for the updated stage
            return { ...updatedStage }
          }
          // Return a new object reference for other stages too to ensure reactivity
          return { ...s }
        })
        // CRITICAL: Use a microtask to ensure the update happens after any pending effects
        await Promise.resolve()
        stages = newStages
        
        // Verify the update was applied correctly AFTER the assignment
        await Promise.resolve() // Another microtask to ensure reactivity has propagated
        const updatedStageInArray = stages.find(s => s.id === stageId)
        console.log('[TaskStageSettings] Updated local stages array:', {
          stageIndex,
          updatedStage: { id: updatedStage.id, name: updatedStage.name, color: updatedStage.color },
          stageInArray: updatedStageInArray ? { id: updatedStageInArray.id, name: updatedStageInArray.name, color: updatedStageInArray.color } : null,
          allStages: stages.map(s => ({ id: s.id, name: s.name, color: s.color })),
          arrayLength: stages.length,
          arrayReference: stages === newStages
        })
        
        // Double-check: if the color doesn't match, something went wrong
        if (!updatedStageInArray || updatedStageInArray.color !== updatedStage.color) {
          console.error('[TaskStageSettings] CRITICAL: Stage color mismatch after update!', {
            expected: updatedStage.color,
            actual: updatedStageInArray?.color,
            stageId,
            found: !!updatedStageInArray
          })
          // Force reload to fix it
          await loadStages()
        }
      } else {
        // If not found, reload all stages
        await loadStages()
      }
      
      toast.success('Color updated', `${stage.name} color has been changed`)
    } catch (error: any) {
      console.error('[TaskStageSettings] Failed to update color:', error)
      toast.error('Failed to update color', error?.message || 'Unknown error')
      // Reload on error to ensure consistency
      await loadStages()
    } finally {
      saving = false
    }
  }
  
  // Create a color change handler that captures the stage ID
  // Use a Map to ensure each handler is unique and correctly bound
  const colorHandlerMap = new Map<string, (detail: string | null | undefined) => void>()
  
  function createColorChangeHandler(stageId: string) {
    // Reuse handler if it exists, otherwise create a new one
    if (!colorHandlerMap.has(stageId)) {
      const handler = (detail: string | null | undefined) => {
        // Double-check we're using the correct stage ID
        const currentStageId = stageId
        console.log('[TaskStageSettings] Color change handler called:', { 
          handlerStageId: currentStageId, 
          color: detail,
          allStages: stages.map(s => ({ id: s.id, name: s.name, isCompletion: s.isCompletionStage }))
        })
        handleColorChange(currentStageId, detail)
      }
      colorHandlerMap.set(stageId, handler)
    }
    return colorHandlerMap.get(stageId)!
  }
  
  // Clean up handlers when stages are removed
  $effect(() => {
    const currentStageIds = new Set(stages.map(s => s.id))
    for (const [stageId] of colorHandlerMap) {
      if (!currentStageIds.has(stageId)) {
        colorHandlerMap.delete(stageId)
      }
    }
  })

  // Handle stage reordering via sortable
  async function handleStageSort(event: { oldIndex: number; newIndex: number; element?: HTMLElement }) {
    console.log('[TaskStageSettings] handleStageSort called:', { 
      canEdit: canEdit(), 
      saving, 
      event: { oldIndex: event.oldIndex, newIndex: event.newIndex, hasElement: !!event.element }
    })
    
    if (!canEdit() || saving) {
      console.log('[TaskStageSettings] Skipping reorder:', { canEdit: canEdit(), saving })
      return
    }
    
    const { oldIndex, newIndex } = event
    
    // Don't do anything if the position didn't change
    if (oldIndex === newIndex) {
      console.log('[TaskStageSettings] Positions are the same, skipping:', { oldIndex, newIndex })
      return
    }
    
    // Log the actual event details for debugging
    console.log('[TaskStageSettings] Drag event details:', {
      oldIndex,
      newIndex,
      element: event.element?.tagName,
      stagesCount: stages.length
    })

    console.log('[TaskStageSettings] Reordering stages:', { 
      oldIndex, 
      newIndex, 
      currentStages: stages.map(s => ({ id: s.id, name: s.name, order: s.displayOrder, isCompletion: s.isCompletionStage }))
    })

    saving = true
    try {
      // Get the current stages in the order they appear in the DOM (which matches the array)
      // The indices from Sortable are relative to the current array order
      const newOrder = [...stages]
      const [movedStage] = newOrder.splice(oldIndex, 1)
      newOrder.splice(newIndex, 0, movedStage)

      console.log('[TaskStageSettings] New order:', newOrder.map((s, i) => ({ 
        index: i, 
        id: s.id, 
        name: s.name, 
        willBeCompletion: i === newOrder.length - 1 
      })))

      // Update display_order values (this will also set the last stage as completion)
      const stageIds = newOrder.map(s => s.id)
      const updatedStages = await taskStageService.reorder(get(currentTeam)!.id, stageIds)
      
      console.log('[TaskStageSettings] After reorder, stages from DB:', updatedStages.map(s => ({ 
        id: s.id, 
        name: s.name, 
        displayOrder: s.displayOrder, 
        isCompletion: s.isCompletionStage 
      })))
      
      // Verify completion stage is set correctly before updating local state
      const lastStage = updatedStages[updatedStages.length - 1]
      const completionStages = updatedStages.filter(s => s.isCompletionStage)
      console.log('[TaskStageSettings] Completion stage verification:', {
        lastStage: { id: lastStage?.id, name: lastStage?.name, isCompletion: lastStage?.isCompletionStage },
        completionStages: completionStages.map(s => ({ id: s.id, name: s.name })),
        expectedLastStageId: stageIds[stageIds.length - 1],
        allStages: updatedStages.map(s => ({ id: s.id, name: s.name, displayOrder: s.displayOrder, isCompletion: s.isCompletionStage }))
      })
      
      // Update local state with the reordered stages (already sorted by displayOrder from DB)
      stages = [...updatedStages]
      
      toast.success('Stages reordered', 'Stage order has been updated')
    } catch (error: any) {
      console.error('[TaskStageSettings] Failed to reorder:', error)
      toast.error('Failed to reorder', error?.message || 'Unknown error')
      // Reload stages to reset the UI
      await loadStages()
    } finally {
      saving = false
    }
  }

  function startEdit(stage: TaskStage) {
    editingStageId = stage.id
    editedStageName = stage.name
    editedStageColor = stage.color ?? null
  }

  function cancelEdit() {
    editingStageId = null
    editedStageName = ''
    editedStageColor = null
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
        Configure your team's task workflow stages. Drag to reorder. The last stage is automatically the completion stage.
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
        <Button onclick={async () => {
          const team = get(currentTeam)
          if (team) {
            await taskStageService.ensureDefaults(team.id)
            await loadStages()
          }
        }}>
          <Plus class="mr-2 size-4" />
          Create Default Stages
        </Button>
      {/if}
    </div>
  {:else}
    <div 
      class="space-y-2"
      role="list"
      use:sortable={{
        onSort: handleStageSort,
        disabled: !canEdit() || saving,
        handle: '.grip-handle',
        animation: 150,
        dragClass: 'opacity-50',
        ghostClass: 'opacity-30',
      }}
    >
      {#each stages as stage, index (stage.id)}
        {#key stage.id}
          <div 
            class="draggable-item flex items-center gap-4 rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors"
            role="button"
            tabindex={canEdit() && !saving ? 0 : undefined}
            style="cursor: {canEdit() && !saving ? 'grab' : 'default'};"
          >
          {#if editingStageId === stage.id}
            <!-- Edit mode -->
              <div class="flex flex-1 items-center gap-4">
                <GripVertical class="size-4 text-muted-foreground flex-shrink-0 grip-handle {canEdit() && !saving ? 'cursor-grab active:cursor-grabbing' : ''}" />
                <Input
                  bind:value={editedStageName}
                  placeholder="Stage name"
                  class="flex-1"
                />
                <div class="flex items-center gap-2">
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
                <GripVertical class="size-4 text-muted-foreground flex-shrink-0 grip-handle {canEdit() && !saving ? 'cursor-grab active:cursor-grabbing' : ''}" />
                
                <!-- Color Picker (always visible if can edit) -->
                {#if canEdit()}
                  <ColorPicker
                    id={`stage-color-${stage.id}`}
                    value={stage.color}
                    disabled={saving}
                    dataStageId={stage.id}
                    onchange={createColorChangeHandler(stage.id)}
                  />
              {:else if stage.color}
                <div 
                  class="size-4 rounded-full flex-shrink-0" 
                  style="background-color: {stage.color};"
                ></div>
              {/if}
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-medium">{stage.name}</span>
                  {#if isLastStage(stage)}
                    <Badge variant="secondary" class="bg-green-500/10 text-green-700 dark:text-green-300 text-xs">
                      Completion Stage
                    </Badge>
                  {/if}
                </div>
              </div>
              
                {#if canEdit()}
                <div class="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
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
                    disabled={stages.length === 1}
                  >
                    <Trash2 class="size-4 text-destructive" />
                  </Button>
                </div>
                {/if}
            </div>
          {/if}
        </div>
        {/key}
      {/each}
    </div>

    <div class="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/50">
      <div class="flex items-start gap-2">
        <AlertCircle class="mt-0.5 size-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div class="flex-1 text-sm">
          <p class="font-medium text-blue-900 dark:text-blue-100">About Completion Stages</p>
          <p class="mt-1 text-blue-700 dark:text-blue-300">
            The last stage in the list is automatically the completion stage. Tasks in this stage are considered "done". 
            Drag stages to reorder them and change which one is the completion stage.
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Add Stage Dialog -->
{#if showAddStageDialog}
  <div 
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" 
    role="button"
    tabindex={-1}
    onclick={() => {
      if (!saving) {
        showAddStageDialog = false
        newStageName = ''
        newStageColor = null
      }
    }}
    onkeydown={(e) => {
      if (e.key === 'Escape' && !saving) {
        showAddStageDialog = false
        newStageName = ''
        newStageColor = null
      }
    }}
  >
    <div 
      class="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg" 
      role="dialog"
      tabindex={0}
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => {
        if (e.key === 'Escape' && !saving) {
          showAddStageDialog = false
          newStageName = ''
          newStageColor = null
        }
      }}
    >
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold">Add New Stage</h3>
        <button
          type="button"
          onclick={() => {
            if (!saving) {
              showAddStageDialog = false
              newStageName = ''
              newStageColor = null
            }
          }}
          class="rounded-md p-1 hover:bg-muted"
          disabled={saving}
        >
          <X class="size-4" />
        </button>
      </div>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Stage Name</Label>
          <Input
            bind:value={newStageName}
            placeholder="e.g., Review, Testing, Approved"
            onkeydown={(e) => {
              if (e.key === 'Enter' && !saving && newStageName.trim()) {
                e.preventDefault()
                handleAddStage()
              }
            }}
          />
        </div>
        <div class="space-y-2">
          <Label>Color (optional)</Label>
          <div 
            role="presentation"
            onclick={(e) => e.stopPropagation()} 
            onkeydown={(e) => e.stopPropagation()}
            onmousedown={(e) => e.stopPropagation()}
          >
            <ColorPicker
              id="new-stage-color-picker"
              value={newStageColor}
              disabled={saving}
              onchange={(detail) => newStageColor = detail}
            />
          </div>
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
              newStageColor = null
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
