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
   */
  async create(stage: TaskStageCreate): Promise<TaskStage> {
    const { data, error } = await (supabase
      .from('task_stages')
      .insert({
        team_id: stage.teamId,
        name: stage.name,
        display_order: stage.displayOrder,
        is_completion_stage: stage.isCompletionStage || false,
      } as any)
      .select()
      .single() as any)

    if (error) throw error
    return mapStageFromDb(data)
  },

  /**
   * Update an existing stage
   */
  async update(id: string, updates: TaskStageUpdate): Promise<TaskStage> {
    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder
    if (updates.isCompletionStage !== undefined) updateData.is_completion_stage = updates.isCompletionStage

    const { data, error } = await ((supabase
      .from('task_stages') as any)
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single())

    if (error) throw error
    return mapStageFromDb(data)
  },

  /**
   * Delete a stage (fails if tasks reference it)
   */
  async delete(id: string): Promise<void> {
    // Check if any tasks reference this stage
    const { data: tasks, error: checkError } = await supabase
      .from('tasks')
      .select('id')
      .eq('stage_id', id)
      .limit(1)

    if (checkError) throw checkError
    if (tasks && tasks.length > 0) {
      throw new Error('Cannot delete stage: tasks are currently using this stage')
    }

    const { error } = await supabase.from('task_stages').delete().eq('id', id)
    if (error) throw error
  },

  /**
   * Reorder stages (update displayOrder for multiple stages)
   */
  async reorder(teamId: string, stageIds: string[]): Promise<TaskStage[]> {
    // Update display_order for each stage
    const updates = stageIds.map((stageId, index) =>
      ((supabase
        .from('task_stages') as any)
        .update({ display_order: index } as any)
        .eq('id', stageId)
        .eq('team_id', teamId))
    )

    await Promise.all(updates)

    // Return updated list
    return this.list(teamId)
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

