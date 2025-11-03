/**
 * Task Comment Service
 * Feature: 003-modern-task-ui
 * Purpose: CRUD operations for task comments with @mentions
 */

import { supabase } from '$lib/supabase'
import type { TaskComment, TaskCommentCreate, TaskCommentUpdate } from '$lib/types/domain/task'

// Map database row to TaskComment type (camelCase conversion)
function mapCommentFromDb(row: any): TaskComment {
  return {
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    content: row.content,
    mentions: row.mentions || [],
    deleted: row.deleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // User data populated from join (optional)
    user: row.users ? {
      id: row.users.id,
      name: row.users.display_name || row.users.email,
      avatar: row.users.avatar_url,
    } : undefined,
  }
}

export const taskCommentService = {
  /**
   * List all comments for a task (including soft-deleted for context)
   * RLS policies automatically filter by team membership (via parent task)
   * Joins with users table to get commenter info
   */
  async list(taskId: string, includeDeleted: boolean = true): Promise<TaskComment[]> {
    let query = supabase
      .from('task_comments')
      .select(`
        *,
        users:user_id (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    // Filter out deleted comments if requested
    if (!includeDeleted) {
      query = query.eq('deleted', false)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(mapCommentFromDb)
  },

  /**
   * Get a single comment by ID
   */
  async get(commentId: string): Promise<TaskComment> {
    const { data, error } = await supabase
      .from('task_comments')
      .select(`
        *,
        users:user_id (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .eq('id', commentId)
      .single()

    if (error) throw error
    return mapCommentFromDb(data)
  },

  /**
   * Create a new comment
   * Note: user_id is automatically set to current user via RLS INSERT policy
   */
  async create(input: TaskCommentCreate): Promise<TaskComment> {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: input.taskId,
        user_id: user.id,
        content: input.content,
        mentions: input.mentions || [],
      })
      .select(`
        *,
        users:user_id (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return mapCommentFromDb(data)
  },

  /**
   * Update a comment (only author can update)
   * Only content and mentions can be updated
   */
  async update(commentId: string, updates: TaskCommentUpdate): Promise<TaskComment> {
    const dbUpdates: any = {
      content: updates.content,
    }
    
    if (updates.mentions !== undefined) {
      dbUpdates.mentions = updates.mentions
    }

    const { data, error } = await supabase
      .from('task_comments')
      .update(dbUpdates)
      .eq('id', commentId)
      .select(`
        *,
        users:user_id (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return mapCommentFromDb(data)
  },

  /**
   * Soft delete a comment (only author can delete)
   * Sets deleted flag to true, preserving comment for conversation context
   */
  async softDelete(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('task_comments')
      .update({ deleted: true })
      .eq('id', commentId)

    if (error) throw error
  },

  /**
   * Hard delete a comment (removes from database)
   * Only use for cleanup/moderation - prefer softDelete for normal use
   */
  async hardDelete(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
  },

  /**
   * Get comments that mention a specific user
   */
  async getMentioning(userId: string): Promise<TaskComment[]> {
    const { data, error } = await supabase
      .from('task_comments')
      .select(`
        *,
        users:user_id (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .contains('mentions', [userId])
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapCommentFromDb)
  },

  /**
   * Extract @mentions from comment content
   * Looks for patterns like @userId or @[display name](userId)
   */
  extractMentions(content: string): string[] {
    const mentions: string[] = []
    
    // Pattern 1: @userId (simple UUID mention)
    const simplePattern = /@([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi
    let match
    while ((match = simplePattern.exec(content)) !== null) {
      mentions.push(match[1])
    }
    
    // Pattern 2: @[name](userId) (markdown-style mention with display name)
    const markdownPattern = /@\[([^\]]+)\]\(([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\)/gi
    while ((match = markdownPattern.exec(content)) !== null) {
      mentions.push(match[2])
    }
    
    // Return unique mentions
    return [...new Set(mentions)]
  },
}

