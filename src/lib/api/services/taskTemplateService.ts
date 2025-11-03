/**
 * Task Template Service
 * Feature: 003-modern-task-ui
 * Purpose: CRUD operations for reusable task templates
 */

import { supabase } from '$lib/supabase'
import type { TaskTemplate, TaskTemplateCreate, TaskTemplateUpdate, TaskTemplateSubtask } from '$lib/types/domain/task'

// Map database row to TaskTemplate type (camelCase conversion)
function mapTemplateFromDb(row: any): TaskTemplate {
  return {
    id: row.id,
    teamId: row.team_id,
    name: row.name,
    description: row.description,
    defaultStageId: row.default_stage_id,
    defaultPriority: row.default_priority,
    subtasks: row.subtasks || [],
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const taskTemplateService = {
  /**
   * List all templates for a team
   * RLS policies automatically filter by team membership
   */
  async list(teamId: string): Promise<TaskTemplate[]> {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('team_id', teamId)
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []).map(mapTemplateFromDb)
  },

  /**
   * Get a single template by ID
   */
  async get(templateId: string): Promise<TaskTemplate> {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error) throw error
    return mapTemplateFromDb(data)
  },

  /**
   * Create a new template
   */
  async create(input: TaskTemplateCreate): Promise<TaskTemplate> {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('task_templates')
      .insert({
        team_id: input.teamId,
        name: input.name,
        description: input.description || null,
        default_stage_id: input.defaultStageId || null,
        default_priority: input.defaultPriority || 'medium',
        subtasks: input.subtasks || [],
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return mapTemplateFromDb(data)
  },

  /**
   * Update a template
   * Only template creator or team owner/editor can update (enforced by RLS)
   */
  async update(templateId: string, updates: TaskTemplateUpdate): Promise<TaskTemplate> {
    const dbUpdates: any = {}
    
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.defaultStageId !== undefined) dbUpdates.default_stage_id = updates.defaultStageId
    if (updates.defaultPriority !== undefined) dbUpdates.default_priority = updates.defaultPriority
    if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks

    const { data, error } = await supabase
      .from('task_templates')
      .update(dbUpdates)
      .eq('id', templateId)
      .select()
      .single()

    if (error) throw error
    return mapTemplateFromDb(data)
  },

  /**
   * Delete a template
   * Only template creator or team owner can delete (enforced by RLS)
   */
  async delete(templateId: string): Promise<void> {
    const { error } = await supabase
      .from('task_templates')
      .delete()
      .eq('id', templateId)

    if (error) throw error
  },

  /**
   * Create a task from a template
   * Applies template defaults and creates subtasks
   */
  async applyTemplate(templateId: string, overrides?: {
    title?: string
    projectId?: string
    assignedTo?: string
    dueDate?: string
  }): Promise<{ taskId: string; subtaskIds: string[] }> {
    // Get template
    const template = await this.get(templateId)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Create task with template defaults
    const taskData: any = {
      title: overrides?.title || `Task from ${template.name}`,
      team_id: template.teamId,
      stage_id: template.defaultStageId,
      priority: template.defaultPriority,
      description: template.description || null,
    }

    if (overrides?.projectId) taskData.project_id = overrides.projectId
    if (overrides?.assignedTo) taskData.assigned_to = overrides.assignedTo
    if (overrides?.dueDate) taskData.due_date = overrides.dueDate

    // Create task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single()

    if (taskError) throw taskError

    // Create subtasks from template
    const subtaskIds: string[] = []
    
    if (template.subtasks.length > 0) {
      const subtasksData = template.subtasks.map((st: TaskTemplateSubtask) => ({
        task_id: task.id,
        title: st.title,
        display_order: st.order,
        completed: false,
      }))

      const { data: subtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .insert(subtasksData)
        .select()

      if (subtasksError) {
        console.error('Failed to create subtasks from template:', subtasksError)
        // Don't throw - task was created successfully
      } else {
        subtaskIds.push(...(subtasks || []).map((st: any) => st.id))
      }
    }

    return { taskId: task.id, subtaskIds }
  },

  /**
   * Create a template from an existing task
   * Captures task structure and subtasks
   */
  async createFromTask(taskId: string, templateName: string, templateDescription?: string): Promise<TaskTemplate> {
    // Get task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (taskError) throw taskError
    if (!task) throw new Error('Task not found')

    // Get subtasks for this task
    const { data: subtasks, error: subtasksError } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('display_order', { ascending: true })

    if (subtasksError) throw subtasksError

    // Convert subtasks to template format
    const templateSubtasks: TaskTemplateSubtask[] = (subtasks || []).map((st: any) => ({
      title: st.title,
      order: st.display_order,
    }))

    // Create template
    return await this.create({
      teamId: task.team_id,
      name: templateName,
      description: templateDescription || task.description,
      defaultStageId: task.stage_id,
      defaultPriority: task.priority,
      subtasks: templateSubtasks,
    })
  },

  /**
   * Duplicate a template (create copy with new name)
   */
  async duplicate(templateId: string, newName: string): Promise<TaskTemplate> {
    const template = await this.get(templateId)

    return await this.create({
      teamId: template.teamId,
      name: newName,
      description: template.description,
      defaultStageId: template.defaultStageId,
      defaultPriority: template.defaultPriority,
      subtasks: template.subtasks,
    })
  },
}

