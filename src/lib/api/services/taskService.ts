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
    return data as Task[]
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

    return data as Task
  },

  /**
   * Create a new task
   */
  async create(task: TaskCreate): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task as any)
      .select()
      .single()

    if (error) throw error
    return data as Task
  },

  /**
   * Update an existing task
   */
  async update(id: string, updates: TaskUpdate): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Task
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

