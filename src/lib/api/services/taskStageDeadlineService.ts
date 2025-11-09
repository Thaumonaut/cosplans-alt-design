/**
 * Task Stage Deadline Service
 * Feature: 003-modern-task-ui
 * Purpose: CRUD operations for stage-level milestone deadlines
 */

import { supabase } from '$lib/supabase'
import type { TaskStageDeadline, TaskStageDeadlineCreate, TaskStageDeadlineUpdate } from '$lib/types/domain/task'

// Map database row to TaskStageDeadline type (camelCase conversion)
function mapStageDeadlineFromDb(row: any): TaskStageDeadline {
  return {
    id: row.id,
    taskId: row.task_id,
    stageId: row.stage_id,
    deadline: row.deadline,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const taskStageDeadlineService = {
  /**
   * List all stage deadlines for a task
   * RLS policies automatically filter by team membership (via parent task)
   */
  async list(taskId: string): Promise<TaskStageDeadline[]> {
    const { data, error } = await supabase
      .from('task_stage_deadlines')
      .select('*')
      .eq('task_id', taskId)
      .order('deadline', { ascending: true })

    if (error) throw error
    return (data || []).map(mapStageDeadlineFromDb)
  },

  /**
   * Get a single stage deadline by ID
   */
  async get(deadlineId: string): Promise<TaskStageDeadline> {
    const { data, error } = await supabase
      .from('task_stage_deadlines')
      .select('*')
      .eq('id', deadlineId)
      .single()

    if (error) throw error
    return mapStageDeadlineFromDb(data)
  },

  /**
   * Get upcoming deadline for a task (next incomplete deadline)
   */
  async getUpcoming(taskId: string): Promise<TaskStageDeadline | null> {
    const { data, error } = await supabase
      .from('task_stage_deadlines')
      .select('*')
      .eq('task_id', taskId)
      .is('completed_at', null)
      .order('deadline', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data ? mapStageDeadlineFromDb(data) : null
  },

  /**
   * Create a new stage deadline
   * RLS policies ensure user is team member
   */
  async create(deadline: TaskStageDeadlineCreate): Promise<TaskStageDeadline> {
    const { data, error } = await supabase
      .from('task_stage_deadlines')
      .insert({
        task_id: deadline.taskId,
        stage_id: deadline.stageId,
        deadline: deadline.deadline,
      })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation (deadline already exists for task/stage)
      if (error.code === '23505') {
        // Return existing deadline
        const { data: existing } = await supabase
          .from('task_stage_deadlines')
          .select('*')
          .eq('task_id', deadline.taskId)
          .eq('stage_id', deadline.stageId)
          .single()
        if (existing) return mapStageDeadlineFromDb(existing)
      }
      throw error
    }
    return mapStageDeadlineFromDb(data)
  },

  /**
   * Update an existing stage deadline
   * RLS policies ensure user is team member
   */
  async update(deadlineId: string, updates: TaskStageDeadlineUpdate): Promise<TaskStageDeadline> {
    const updateData: Record<string, unknown> = {}
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt

    const { data, error } = await supabase
      .from('task_stage_deadlines')
      .update(updateData)
      .eq('id', deadlineId)
      .select()
      .single()

    if (error) throw error
    return mapStageDeadlineFromDb(data)
  },

  /**
   * Delete a stage deadline
   * RLS policies ensure user is team member
   */
  async delete(deadlineId: string): Promise<void> {
    const { error } = await supabase
      .from('task_stage_deadlines')
      .delete()
      .eq('id', deadlineId)

    if (error) throw error
  },

  /**
   * Mark a stage deadline as completed (when task advances to that stage)
   */
  async complete(taskId: string, stageId: string): Promise<TaskStageDeadline | null> {
    // Find the deadline
    const { data: deadline } = await supabase
      .from('task_stage_deadlines')
      .select('*')
      .eq('task_id', taskId)
      .eq('stage_id', stageId)
      .single()

    if (!deadline) return null

    // If already completed, return existing
    if (deadline.completed_at) {
      return mapStageDeadlineFromDb(deadline)
    }

    // Mark as completed
    const { data, error } = await supabase
      .from('task_stage_deadlines')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', deadline.id)
      .select()
      .single()

    if (error) throw error
    return mapStageDeadlineFromDb(data)
  },

  /**
   * Calculate urgency level for a deadline
   * Returns: 'overdue' | 'urgent' | 'soon' | 'ok'
   */
  calculateUrgency(deadline: TaskStageDeadline): 'overdue' | 'urgent' | 'soon' | 'ok' {
    if (deadline.completedAt) return 'ok'

    const now = new Date()
    const deadlineDate = new Date(deadline.deadline)
    const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) return 'overdue'
    if (daysUntil <= 1) return 'urgent'
    if (daysUntil <= 3) return 'soon'
    return 'ok'
  },
}

