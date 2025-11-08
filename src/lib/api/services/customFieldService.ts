/**
 * Custom Field Service
 * Feature: 003-modern-task-ui
 * Purpose: CRUD operations for custom field definitions and values
 */

import { supabase } from '$lib/supabase'
import type {
  CustomFieldDefinition,
  CustomFieldDefinitionCreate,
  CustomFieldDefinitionUpdate,
  TaskCustomFieldValue,
  TaskCustomFieldValueCreate,
  TaskCustomFieldValueUpdate,
} from '$lib/types/domain/task'

// Map database row to CustomFieldDefinition type (camelCase conversion)
function mapFieldDefinitionFromDb(row: any): CustomFieldDefinition {
  return {
    id: row.id,
    teamId: row.team_id,
    fieldName: row.name || row.field_name, // Support both 'name' (actual DB) and 'field_name' (expected)
    fieldType: row.field_type,
    required: row.required,
    defaultValue: row.default_value,
    options: row.options || {},
    displayOrder: row.display_order,
    showOnCard: row.show_on_card || false, // Default to false if column doesn't exist
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Map database row to TaskCustomFieldValue type (camelCase conversion)
function mapFieldValueFromDb(row: any): TaskCustomFieldValue {
  return {
    id: row.id,
    taskId: row.task_id,
    fieldDefinitionId: row.field_definition_id,
    value: row.value,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const customFieldService = {
  /**
   * List all custom field definitions for a team
   * RLS policies automatically filter by team membership
   * Ordered by display_order
   */
  async listDefinitions(teamId: string): Promise<CustomFieldDefinition[]> {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .select('*')
      .eq('team_id', teamId)
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapFieldDefinitionFromDb)
  },

  /**
   * Get a single field definition by ID
   */
  async getDefinition(definitionId: string): Promise<CustomFieldDefinition> {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .select('*')
      .eq('id', definitionId)
      .single()

    if (error) throw error
    return mapFieldDefinitionFromDb(data)
  },

  /**
   * Create a new field definition
   * RLS policies ensure only team owners/admins can create
   */
  async createDefinition(definition: CustomFieldDefinitionCreate): Promise<CustomFieldDefinition> {
    const { data, error } = await supabase
      .from('custom_field_definitions')
      .insert({
        team_id: definition.teamId,
        name: definition.fieldName, // Use 'name' to match actual DB column
        field_type: definition.fieldType,
        required: definition.required ?? false,
        default_value: definition.defaultValue || null,
        options: definition.options || {},
        display_order: definition.displayOrder ?? 0,
        // Note: show_on_card column doesn't exist in current migration, so it's omitted
      })
      .select()
      .single()

    if (error) throw error
    return mapFieldDefinitionFromDb(data)
  },

  /**
   * Update an existing field definition
   * RLS policies ensure only team owners/admins can update
   */
  async updateDefinition(
    definitionId: string,
    updates: CustomFieldDefinitionUpdate
  ): Promise<CustomFieldDefinition> {
    const updateData: Record<string, unknown> = {}
    if (updates.fieldName !== undefined) updateData.name = updates.fieldName // Use 'name' to match actual DB column
    if (updates.fieldType !== undefined) updateData.field_type = updates.fieldType
    if (updates.required !== undefined) updateData.required = updates.required
    if (updates.defaultValue !== undefined) updateData.default_value = updates.defaultValue
    if (updates.options !== undefined) updateData.options = updates.options
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder
    // Note: show_on_card column doesn't exist in current migration, so it's omitted

    const { data, error } = await supabase
      .from('custom_field_definitions')
      .update(updateData)
      .eq('id', definitionId)
      .select()
      .single()

    if (error) throw error
    return mapFieldDefinitionFromDb(data)
  },

  /**
   * Delete a field definition
   * RLS policies ensure only team owners/admins can delete
   * CASCADE deletes all field values
   */
  async deleteDefinition(definitionId: string): Promise<void> {
    const { error } = await supabase
      .from('custom_field_definitions')
      .delete()
      .eq('id', definitionId)

    if (error) throw error
  },

  /**
   * List all custom field values for a task
   * RLS policies automatically filter by team membership (via parent task)
   */
  async listValues(taskId: string): Promise<TaskCustomFieldValue[]> {
    const { data, error } = await supabase
      .from('task_custom_field_values')
      .select('*')
      .eq('task_id', taskId)

    if (error) throw error
    return (data || []).map(mapFieldValueFromDb)
  },

  /**
   * Get a single field value by task and field definition
   */
  async getValue(taskId: string, fieldDefinitionId: string): Promise<TaskCustomFieldValue | null> {
    const { data, error } = await supabase
      .from('task_custom_field_values')
      .select('*')
      .eq('task_id', taskId)
      .eq('field_definition_id', fieldDefinitionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return mapFieldValueFromDb(data)
  },

  /**
   * Create or update a field value
   * RLS policies ensure user is team member
   */
  async upsertValue(value: TaskCustomFieldValueCreate): Promise<TaskCustomFieldValue> {
    const { data, error } = await supabase
      .from('task_custom_field_values')
      .upsert({
        task_id: value.taskId,
        field_definition_id: value.fieldDefinitionId,
        value: value.value || null,
      }, {
        onConflict: 'task_id,field_definition_id'
      })
      .select()
      .single()

    if (error) throw error
    return mapFieldValueFromDb(data)
  },

  /**
   * Update an existing field value
   * RLS policies ensure user is team member
   */
  async updateValue(
    taskId: string,
    fieldDefinitionId: string,
    updates: TaskCustomFieldValueUpdate
  ): Promise<TaskCustomFieldValue> {
    const updateData: Record<string, unknown> = {}
    if (updates.value !== undefined) updateData.value = updates.value

    const { data, error } = await supabase
      .from('task_custom_field_values')
      .update(updateData)
      .eq('task_id', taskId)
      .eq('field_definition_id', fieldDefinitionId)
      .select()
      .single()

    if (error) throw error
    return mapFieldValueFromDb(data)
  },

  /**
   * Delete a field value
   * RLS policies ensure user is team member
   */
  async deleteValue(taskId: string, fieldDefinitionId: string): Promise<void> {
    const { error } = await supabase
      .from('task_custom_field_values')
      .delete()
      .eq('task_id', taskId)
      .eq('field_definition_id', fieldDefinitionId)

    if (error) throw error
  },

  /**
   * Get all field values for a task with field definitions
   * Returns values with their field definitions for easy rendering
   */
  async getValuesWithDefinitions(taskId: string): Promise<Array<TaskCustomFieldValue & { definition: CustomFieldDefinition }>> {
    const values = await this.listValues(taskId)
    if (values.length === 0) return []

    const definitionIds = values.map(v => v.fieldDefinitionId)
    const { data: definitions, error } = await supabase
      .from('custom_field_definitions')
      .select('*')
      .in('id', definitionIds)

    if (error) throw error

    const definitionsMap = new Map(
      (definitions || []).map(d => [d.id, mapFieldDefinitionFromDb(d)])
    )

    return values.map(value => ({
      ...value,
      definition: definitionsMap.get(value.fieldDefinitionId)!
    })).filter(v => v.definition) // Filter out any values with missing definitions
  },
}

