import { supabase } from '$lib/supabase'
import type { Task, TaskCreate, TaskUpdate } from '$lib/types/domain/task'

export const taskService = {
  /**
   * List tasks for a project (optionally filter by resource)
   */
  async list(filters: { projectId: string; resourceId?: string }): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('project_id', filters.projectId)
      .order('created_at', { ascending: false })

    if (filters.resourceId !== undefined) {
      // If resourceId is provided (including null), filter by it
      query = filters.resourceId === null
        ? query.is('resource_id', null) // Project-level tasks
        : query.eq('resource_id', filters.resourceId) // Resource-specific tasks
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(mapTaskFromDb)
  },

  /**
   * Get a single task by ID
   */
  async get(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return mapTaskFromDb(data)
  },

  /**
   * Create a new task
   */
  async create(task: TaskCreate): Promise<Task> {
    // Map camelCase to snake_case for database
    const insertData: Record<string, unknown> = {
      project_id: task.projectId,
      title: task.title,
      description: task.description || null,
      priority: task.priority || 'medium',
    }

    // Only include optional fields if they have values
    if (task.resourceId !== undefined && task.resourceId !== null) {
      insertData.resource_id = task.resourceId
    }
    if (task.dueDate !== undefined && task.dueDate !== null) {
      insertData.due_date = task.dueDate
    }
    if (task.assignedTo !== undefined && task.assignedTo !== null) {
      insertData.assigned_to = task.assignedTo
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // Provide helpful error message for schema cache issues
      if (error.message?.includes('schema cache') || error.code === 'PGRST204' || error.code === 'PGRST205') {
        throw new Error(
          `Failed to create task: ${error.message}. ` +
          `This is a PostgREST schema cache issue. Please try refreshing the page and creating the task again.`
        )
      }
      throw error
    }

    return mapTaskFromDb(data)
  },

  /**
   * Update an existing task
   */
  async update(id: string, updates: TaskUpdate): Promise<Task> {
    // Map camelCase to snake_case for database
    const updateData: Record<string, unknown> = {}

    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description || null
    if (updates.completed !== undefined) updateData.completed = updates.completed
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate
    if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Provide helpful error message for schema cache issues
      if (error.message?.includes('schema cache') || error.code === 'PGRST204' || error.code === 'PGRST205') {
        throw new Error(
          `Failed to update task: ${error.message}. ` +
          `This is a PostgREST schema cache issue. Please try refreshing the page and updating the task again.`
        )
      }
      throw error
    }

    return mapTaskFromDb(data)
  },

  /**
   * Delete a task
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) throw error
  },

  /**
   * Toggle task completion
   */
  async toggleComplete(id: string): Promise<Task> {
    // Get current state
    const task = await this.get(id)
    if (!task) throw new Error('Task not found')

    // Toggle completion
    return await this.update(id, { completed: !task.completed })
  },
}

/**
 * Map database row (snake_case) to Task type (camelCase)
 */
function mapTaskFromDb(row: any): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    resourceId: row.resource_id ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    completed: row.completed ?? false,
    dueDate: row.due_date ?? undefined,
    priority: row.priority || 'medium',
    assignedTo: row.assigned_to ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

