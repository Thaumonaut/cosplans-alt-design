import { supabase } from '$lib/supabase'
import type { Comment, CommentCreate, CommentUpdate } from '$lib/types/domain/comment'

export const commentService = {
  /**
   * List comments for a specific entity
   */
  async list(entityType: string, entityId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        author:users!comments_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      entityType: item.entity_type,
      entityId: item.entity_id,
      content: item.content,
      author: item.author
        ? {
            id: item.author.id,
            name: item.author.name || undefined,
            avatarUrl: item.author.avatar_url || undefined,
          }
        : undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))
  },

  /**
   * Get a single comment by ID
   */
  async get(id: string): Promise<Comment | null> {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        author:users!comments_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return {
      id: data.id,
      userId: data.user_id,
      entityType: data.entity_type,
      entityId: data.entity_id,
      content: data.content,
      author: data.author
        ? {
            id: data.author.id,
            name: data.author.name || undefined,
            avatarUrl: data.author.avatar_url || undefined,
          }
        : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  /**
   * Create a new comment
   */
  async create(comment: CommentCreate): Promise<Comment> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        entity_type: comment.entityType,
        entity_id: comment.entityId,
        content: comment.content,
      } as any)
      .select(
        `
        *,
        author:users!comments_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `
      )
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      entityType: data.entity_type,
      entityId: data.entity_id,
      content: data.content,
      author: data.author
        ? {
            id: data.author.id,
            name: data.author.name || undefined,
            avatarUrl: data.author.avatar_url || undefined,
          }
        : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  /**
   * Update a comment (only by the author)
   */
  async update(id: string, updates: CommentUpdate): Promise<Comment> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('comments')
      .update(updates as any)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure only author can update
      .select(
        `
        *,
        author:users!comments_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `
      )
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      entityType: data.entity_type,
      entityId: data.entity_id,
      content: data.content,
      author: data.author
        ? {
            id: data.author.id,
            name: data.author.name || undefined,
            avatarUrl: data.author.avatar_url || undefined,
          }
        : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  /**
   * Delete a comment (only by the author)
   */
  async delete(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure only author can delete

    if (error) throw error
  },
}

