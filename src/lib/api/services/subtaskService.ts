/**
 * Subtask Service
 * Feature: 003-modern-task-ui
 * Purpose: CRUD operations for subtasks (child checklist items under tasks)
 */

import { supabase } from '$lib/supabase'
import type { Subtask, SubtaskCreate, SubtaskUpdate } from '$lib/types/domain/task'

// Map database row to Subtask type (camelCase conversion)
function mapSubtaskFromDb(row: any): Subtask {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    completed: row.completed,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const subtaskService = {
  /**
   * List all subtasks for a task
   * RLS policies automatically filter by team membership (via parent task)
   */
  async list(taskId: string): Promise<Subtask[]> {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapSubtaskFromDb)
  },

  /**
   * Get a single subtask by ID
   */
  async get(subtaskId: string): Promise<Subtask> {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('id', subtaskId)
      .single()

    if (error) throw error
    return mapSubtaskFromDb(data)
  },

  /**
   * Create a new subtask
   * Display order defaults to max(display_order) + 1 for the task
   */
  async create(input: SubtaskCreate): Promise<Subtask> {
    // If display_order not provided, get max order for this task
    let displayOrder = input.displayOrder
    
    if (displayOrder === undefined) {
      const { data: existingSubtasks } = await supabase
        .from('subtasks')
        .select('display_order')
        .eq('task_id', input.taskId)
        .order('display_order', { ascending: false })
        .limit(1)
      
      displayOrder = existingSubtasks && existingSubtasks.length > 0
        ? existingSubtasks[0].display_order + 1
        : 0
    }

    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: input.taskId,
        title: input.title,
        display_order: displayOrder,
      })
      .select()
      .single()

    if (error) throw error
    return mapSubtaskFromDb(data)
  },

  /**
   * Update a subtask
   */
  async update(subtaskId: string, updates: SubtaskUpdate): Promise<Subtask> {
    const dbUpdates: any = {}
    
    if (updates.title !== undefined) dbUpdates.title = updates.title
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed
    if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder

    const { data, error } = await supabase
      .from('subtasks')
      .update(dbUpdates)
      .eq('id', subtaskId)
      .select()
      .single()

    if (error) throw error
    return mapSubtaskFromDb(data)
  },

  /**
   * Toggle subtask completion
   */
  async toggleComplete(subtaskId: string): Promise<Subtask> {
    // Get current subtask
    const subtask = await this.get(subtaskId)
    
    // Toggle completion
    return await this.update(subtaskId, { completed: !subtask.completed })
  },

  /**
   * Delete a subtask
   */
  async delete(subtaskId: string): Promise<void> {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId)

    if (error) throw error
  },

  /**
   * Reorder subtasks (update display_order for multiple subtasks)
   */
  async reorder(subtasks: Array<{ id: string; displayOrder: number }>): Promise<void> {
    // Update each subtask's display_order
    const updates = subtasks.map(({ id, displayOrder }) =>
      supabase
        .from('subtasks')
        .update({ display_order: displayOrder })
        .eq('id', id)
    )

    await Promise.all(updates)
  },

  /**
   * Get subtask completion statistics for a task
   */
  async getCompletionStats(taskId: string): Promise<{
    total: number
    completed: number
    percentage: number
  }> {
    const subtasks = await this.list(taskId)
    const total = subtasks.length
    const completed = subtasks.filter(s => s.completed).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, percentage }
  },
}

