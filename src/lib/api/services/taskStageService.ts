import { supabase } from '$lib/supabase'
import type { TaskStage, TaskStageCreate, TaskStageUpdate } from '$lib/types/domain/task'

export const taskStageService = {
  /**
   * List all stages for a team (ordered by displayOrder)
   */
  async list(teamId: string): Promise<TaskStage[]> {
    const { data, error } = await (supabase
      .from('task_stages')
      .select('*') as any)
      .eq('team_id', teamId)
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapStageFromDb)
  },

  /**
   * Get a single stage by ID
   */
  async get(id: string): Promise<TaskStage | null> {
    const { data, error } = await supabase
      .from('task_stages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return mapStageFromDb(data)
  },

  /**
   * Create a new stage
   * Note: isCompletionStage is ignored - the last stage is always the completion stage
   */
  async create(stage: TaskStageCreate): Promise<TaskStage> {
    // Get current stages to determine if this will be the last one
    const currentStages = await this.list(stage.teamId)
    const willBeLast = currentStages.length === 0 || stage.displayOrder >= Math.max(...currentStages.map(s => s.displayOrder))
    
    const { data, error } = await (supabase
      .from('task_stages')
      .insert({
        team_id: stage.teamId,
        name: stage.name,
        display_order: stage.displayOrder,
        is_completion_stage: willBeLast,
        color: stage.color || null,
      } as any)
      .select()
      .single() as any)

    if (error) throw error
    
    // After creating, ensure the last stage is set as completion
    const allStages = await this.list(stage.teamId)
    const lastStage = allStages[allStages.length - 1]
    if (lastStage && !lastStage.isCompletionStage) {
      await this.update(lastStage.id, { isCompletionStage: true })
    }
    
    return mapStageFromDb(data)
  },

  /**
   * Update an existing stage
   * Note: isCompletionStage is ignored - completion is determined by order
   * IMPORTANT: This function should NOT modify completion stage flags unless displayOrder changes
   */
  async update(id: string, updates: TaskStageUpdate): Promise<TaskStage> {
    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder
    // Don't allow manual isCompletionStage updates - it's determined by order
    if (updates.color !== undefined) updateData.color = updates.color

    // Only update the fields that were explicitly provided
    // Do NOT touch is_completion_stage unless we're reordering
    const { data, error } = await ((supabase
      .from('task_stages') as any)
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single())

    if (error) throw error
    
    const updatedStage = mapStageFromDb(data)
    
    // Only update completion stage flags if displayOrder was explicitly changed
    // This ensures we don't accidentally modify completion stages when just updating color/name
    if (updates.displayOrder !== undefined) {
      console.log('[taskStageService] displayOrder changed, updating completion stages')
      const allStages = await this.list(updatedStage.teamId)
      const lastStage = allStages[allStages.length - 1]
      
      // Update all stages to set completion correctly
      const completionUpdates = allStages.map(s => {
        const shouldBeCompletion = s.id === lastStage.id
        if (s.isCompletionStage !== shouldBeCompletion) {
          console.log(`[taskStageService] Updating completion flag for ${s.name}:`, { 
            id: s.id, 
            shouldBeCompletion 
          })
          return ((supabase
            .from('task_stages') as any)
            .update({ is_completion_stage: shouldBeCompletion } as any)
            .eq('id', s.id))
        }
        return Promise.resolve({ error: null })
      })
      
      await Promise.all(completionUpdates)
      
      // Reload to get the updated completion flags
      const reloadedStages = await this.list(updatedStage.teamId)
      const reloadedStage = reloadedStages.find(s => s.id === id)
      return reloadedStage || updatedStage
    }
    
    // For non-displayOrder updates (like color), just return the updated stage
    // The completion stage flag should remain unchanged from what's in the database
    // However, we should verify the completion flag is correct based on displayOrder
    // This ensures data consistency even if the database has incorrect flags
    const allStages = await this.list(updatedStage.teamId)
    const sortedStages = allStages.sort((a, b) => a.displayOrder - b.displayOrder)
    const lastStage = sortedStages[sortedStages.length - 1]
    const shouldBeCompletion = updatedStage.id === lastStage.id
    
    console.log('[taskStageService] update completed (no displayOrder change):', {
      id: updatedStage.id,
      name: updatedStage.name,
      color: updatedStage.color,
      isCompletionFromDb: updatedStage.isCompletionStage,
      shouldBeCompletion,
      displayOrder: updatedStage.displayOrder,
      lastStageId: lastStage.id
    })
    
    // If the completion flag is incorrect, fix it silently (don't update database, just return correct value)
    if (updatedStage.isCompletionStage !== shouldBeCompletion) {
      console.warn('[taskStageService] Stage has incorrect completion flag, correcting in memory:', {
        stageId: updatedStage.id,
        stageName: updatedStage.name,
        was: updatedStage.isCompletionStage,
        shouldBe: shouldBeCompletion
      })
      return { ...updatedStage, isCompletionStage: shouldBeCompletion }
    }
    
    return updatedStage
  },

  /**
   * Delete a stage
   * Note: Tasks referencing this stage should be moved to another stage before deletion
   * The foreign key constraint uses ON DELETE SET NULL, but we move tasks for better UX
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('task_stages').delete().eq('id', id)
    if (error) throw error
  },

  /**
   * Reorder stages (update displayOrder for multiple stages)
   * The last stage (highest display_order) is automatically set as the completion stage
   */
  async reorder(teamId: string, stageIds: string[]): Promise<TaskStage[]> {
    if (stageIds.length === 0) {
      return []
    }
    
    console.log('[taskStageService] Reordering stages:', { 
      teamId, 
      stageIds, 
      count: stageIds.length,
      lastStageId: stageIds[stageIds.length - 1]
    })
    
    // Update display_order for each stage
    // Set is_completion_stage to true for the last stage, false for all others
    const updates = stageIds.map(async (stageId, index) => {
      const isLast = index === stageIds.length - 1
      const updateData = { 
        display_order: index,
        is_completion_stage: isLast
      }
      console.log(`[taskStageService] Updating stage ${stageId}:`, { index, isLast, updateData })
      
      const { data, error } = await ((supabase
        .from('task_stages') as any)
        .update(updateData as any)
        .eq('id', stageId)
        .eq('team_id', teamId)
        .select()
        .single())
      
      if (error) {
        console.error(`[taskStageService] Error updating stage ${stageId}:`, error)
        throw error
      }
      
      return { data, error: null }
    })
    
    // Wait for all updates to complete
    await Promise.all(updates)

    // Return updated list (will be sorted by display_order)
    const updatedStages = await this.list(teamId)
    console.log('[taskStageService] After reorder, stages:', updatedStages.map(s => ({ 
      id: s.id, 
      name: s.name, 
      displayOrder: s.displayOrder, 
      isCompletion: s.isCompletionStage 
    })))
    
    return updatedStages
  },

  /**
   * Ensure default stages exist for a team (create if they don't exist)
   */
  async ensureDefaults(teamId: string): Promise<TaskStage[]> {
    // Call the database function that creates default stages
    const { error } = await (supabase.rpc('create_default_task_stages_for_team', {
      p_team_id: teamId,
    } as any) as any)

    if (error) {
      // If function doesn't exist yet, create stages manually
      const existing = await this.list(teamId)
      if (existing.length === 0) {
        // Create default stages
        await this.create({ teamId, name: 'Todo', displayOrder: 0, isCompletionStage: false })
        await this.create({ teamId, name: 'In Progress', displayOrder: 1, isCompletionStage: false })
        await this.create({ teamId, name: 'Done', displayOrder: 2, isCompletionStage: true })
      }
    }

    return this.list(teamId)
  },
}

/**
 * Map database row (snake_case) to TaskStage type (camelCase)
 */
function mapStageFromDb(row: any): TaskStage {
  return {
    id: row.id,
    teamId: row.team_id,
    name: row.name,
    displayOrder: row.display_order,
    isCompletionStage: row.is_completion_stage,
    color: row.color || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

