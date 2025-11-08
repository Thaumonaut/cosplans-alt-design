/**
 * Saved View Service
 * Feature: 003-modern-task-ui
 * Purpose: CRUD operations for user-saved task view configurations
 */

import { supabase } from '$lib/supabase'
import type { SavedTaskView, SavedTaskViewCreate, SavedTaskViewUpdate } from '$lib/types/domain/task'

// Map database row to SavedTaskView type (camelCase conversion)
function mapSavedViewFromDb(row: any): SavedTaskView {
  return {
    id: row.id,
    userId: row.user_id,
    teamId: row.team_id,
    name: row.name,
    filters: row.filters || {},
    grouping: row.grouping || 'stage',
    viewMode: row.view_mode || 'list',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const savedViewService = {
  /**
   * List all saved views for current user in a team
   * RLS policies automatically filter to current user's views only
   */
  async list(teamId: string): Promise<SavedTaskView[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User must be authenticated')

    const { data, error } = await supabase
      .from('saved_task_views')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .order('name', { ascending: true })

    if (error) throw error
    return (data || []).map(mapSavedViewFromDb)
  },

  /**
   * Get a single saved view by ID
   * RLS policies ensure user can only access their own views
   */
  async get(viewId: string): Promise<SavedTaskView> {
    const { data, error } = await supabase
      .from('saved_task_views')
      .select('*')
      .eq('id', viewId)
      .single()

    if (error) throw error
    return mapSavedViewFromDb(data)
  },

  /**
   * Create a new saved view
   * RLS policies ensure user is team member and view is created for current user
   */
  async create(view: SavedTaskViewCreate): Promise<SavedTaskView> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User must be authenticated')

    const { data, error } = await supabase
      .from('saved_task_views')
      .insert({
        user_id: user.id,
        team_id: view.teamId,
        name: view.name,
        filters: view.filters || {},
        grouping: view.grouping || 'stage',
        view_mode: view.viewMode || 'list',
      })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation (name already exists for user/team)
      if (error.code === '23505') {
        throw new Error(`A saved view with the name "${view.name}" already exists for this team`)
      }
      throw error
    }
    return mapSavedViewFromDb(data)
  },

  /**
   * Update an existing saved view
   * RLS policies ensure user can only update their own views
   */
  async update(viewId: string, updates: SavedTaskViewUpdate): Promise<SavedTaskView> {
    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.filters !== undefined) updateData.filters = updates.filters
    if (updates.grouping !== undefined) updateData.grouping = updates.grouping
    if (updates.viewMode !== undefined) updateData.view_mode = updates.viewMode

    const { data, error } = await supabase
      .from('saved_task_views')
      .update(updateData)
      .eq('id', viewId)
      .select()
      .single()

    if (error) throw error
    return mapSavedViewFromDb(data)
  },

  /**
   * Delete a saved view
   * RLS policies ensure user can only delete their own views
   */
  async delete(viewId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_task_views')
      .delete()
      .eq('id', viewId)

    if (error) throw error
  },
}

