/**
 * Label Service
 * Feature: 003-modern-task-ui
 * Purpose: CRUD operations for task labels and label assignments
 */

import { supabase } from '$lib/supabase'
import type { TaskLabel, TaskLabelCreate, TaskLabelUpdate, TaskLabelAssignment, TaskLabelAssignmentCreate } from '$lib/types/domain/task'

// Map database row to TaskLabel type (camelCase conversion)
function mapLabelFromDb(row: any): TaskLabel {
  return {
    id: row.id,
    teamId: row.team_id,
    name: row.name,
    color: row.color,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Map database row to TaskLabelAssignment type (camelCase conversion)
function mapLabelAssignmentFromDb(row: any): TaskLabelAssignment {
  return {
    id: row.id,
    taskId: row.task_id,
    labelId: row.label_id,
    assignedBy: row.assigned_by,
    assignedAt: row.assigned_at,
  }
}

export const labelService = {
  /**
   * List all labels for a team
   * RLS policies automatically filter by team membership
   */
  async list(teamId: string): Promise<TaskLabel[]> {
    const { data, error } = await supabase
      .from('task_labels')
      .select('*')
      .eq('team_id', teamId)
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []).map(mapLabelFromDb)
  },

  /**
   * Get a single label by ID
   */
  async get(labelId: string): Promise<TaskLabel> {
    const { data, error } = await supabase
      .from('task_labels')
      .select('*')
      .eq('id', labelId)
      .single()

    if (error) throw error
    return mapLabelFromDb(data)
  },

  /**
   * Create a new label
   * RLS policies ensure user is team member
   */
  async create(label: TaskLabelCreate): Promise<TaskLabel> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User must be authenticated')

    const { data, error } = await supabase
      .from('task_labels')
      .insert({
        team_id: label.teamId,
        name: label.name,
        color: label.color,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return mapLabelFromDb(data)
  },

  /**
   * Update an existing label
   * RLS policies ensure user is team member
   */
  async update(labelId: string, updates: TaskLabelUpdate): Promise<TaskLabel> {
    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.color !== undefined) updateData.color = updates.color

    const { data, error } = await supabase
      .from('task_labels')
      .update(updateData)
      .eq('id', labelId)
      .select()
      .single()

    if (error) throw error
    return mapLabelFromDb(data)
  },

  /**
   * Delete a label
   * RLS policies ensure only team owners/admins or label creator can delete
   * CASCADE deletes all label assignments
   */
  async delete(labelId: string): Promise<void> {
    const { error } = await supabase
      .from('task_labels')
      .delete()
      .eq('id', labelId)

    if (error) throw error
  },

  /**
   * List all label assignments for a task
   * RLS policies automatically filter by team membership (via parent task)
   */
  async listAssignments(taskId: string): Promise<TaskLabelAssignment[]> {
    const { data, error } = await supabase
      .from('task_label_assignments')
      .select('*')
      .eq('task_id', taskId)

    if (error) throw error
    return (data || []).map(mapLabelAssignmentFromDb)
  },

  /**
   * Assign a label to a task
   * RLS policies ensure user is team member
   */
  async assignAssignment(assignment: TaskLabelAssignmentCreate): Promise<TaskLabelAssignment> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User must be authenticated')

    const { data, error } = await supabase
      .from('task_label_assignments')
      .insert({
        task_id: assignment.taskId,
        label_id: assignment.labelId,
        assigned_by: user.id,
      })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation (label already assigned)
      if (error.code === '23505') {
        // Return existing assignment
        const { data: existing } = await supabase
          .from('task_label_assignments')
          .select('*')
          .eq('task_id', assignment.taskId)
          .eq('label_id', assignment.labelId)
          .single()
        if (existing) return mapLabelAssignmentFromDb(existing)
      }
      throw error
    }
    return mapLabelAssignmentFromDb(data)
  },

  /**
   * Remove a label assignment from a task
   * RLS policies ensure user is team member
   */
  async removeAssignment(taskId: string, labelId: string): Promise<void> {
    const { error } = await supabase
      .from('task_label_assignments')
      .delete()
      .eq('task_id', taskId)
      .eq('label_id', labelId)

    if (error) throw error
  },

  /**
   * Get labels for a task (with label details)
   */
  async getLabelsForTask(taskId: string): Promise<TaskLabel[]> {
    const assignments = await this.listAssignments(taskId)
    if (assignments.length === 0) return []

    const labelIds = assignments.map(a => a.labelId)
    const { data, error } = await supabase
      .from('task_labels')
      .select('*')
      .in('id', labelIds)

    if (error) throw error
    return (data || []).map(mapLabelFromDb)
  },
}

