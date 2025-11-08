/**
 * Task Notification Service
 * Feature: 003-modern-task-ui
 * Purpose: Fetch and manage in-app notifications for task events
 */

import { supabase } from '$lib/supabase'
import type { TaskNotification, TaskNotificationCreate, NotificationEventType } from '$lib/types/domain/task'

// Map database row to TaskNotification type (camelCase conversion)
function mapNotificationFromDb(row: any): TaskNotification {
  return {
    id: row.id,
    userId: row.user_id,
    taskId: row.task_id,
    eventType: row.event_type,
    message: row.message,
    read: row.read,
    actorUserId: row.actor_user_id,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    // Task data populated from join (optional)
    task: row.tasks ? {
      id: row.tasks.id,
      title: row.tasks.title,
    } : undefined,
    // Actor data populated from join (optional)
    actor: row.actor_users ? {
      id: row.actor_users.id,
      name: row.actor_users.display_name || row.actor_users.email,
      avatar: row.actor_users.avatar_url,
    } : undefined,
  }
}

export const taskNotificationService = {
  /**
   * List notifications for current user
   * RLS policies automatically filter to current user's notifications only
   * Joins with tasks and users tables for context
   */
  async list(filters?: {
    unreadOnly?: boolean
    eventType?: NotificationEventType
    limit?: number
  }): Promise<TaskNotification[]> {
    let query = supabase
      .from('task_notifications')
      .select(`
        *,
        tasks:task_id (
          id,
          title
        ),
        actor_users:actor_user_id (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.unreadOnly) {
      query = query.eq('read', false)
    }

    if (filters?.eventType) {
      query = query.eq('event_type', filters.eventType)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(mapNotificationFromDb)
  },

  /**
   * Get a single notification by ID
   */
  async get(notificationId: string): Promise<TaskNotification> {
    const { data, error } = await supabase
      .from('task_notifications')
      .select(`
        *,
        tasks:task_id (
          id,
          title
        ),
        actor_users:actor_user_id (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .eq('id', notificationId)
      .single()

    if (error) throw error
    return mapNotificationFromDb(data)
  },

  /**
   * Create a notification
   * Note: This is typically called by system/application code, not directly by users
   * RLS policies prevent direct user INSERT, so this requires service role or server-side function
   */
  async create(input: TaskNotificationCreate): Promise<TaskNotification> {
    const { data, error } = await supabase
      .from('task_notifications')
      .insert({
        user_id: input.userId,
        task_id: input.taskId,
        event_type: input.eventType,
        message: input.message,
        actor_user_id: input.actorUserId || null,
        metadata: input.metadata || {},
      })
      .select(`
        *,
        tasks:task_id (
          id,
          title
        ),
        actor_users:actor_user_id (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return mapNotificationFromDb(data)
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<TaskNotification> {
    const { data, error } = await supabase
      .from('task_notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select(`
        *,
        tasks:task_id (
          id,
          title
        ),
        actor_users:actor_user_id (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return mapNotificationFromDb(data)
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('task_notifications')
      .update({ read: true })
      .eq('read', false)

    if (error) throw error
  },

  /**
   * Delete a notification (dismiss)
   */
  async delete(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('task_notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
  },

  /**
   * Delete all read notifications for current user
   */
  async clearRead(): Promise<void> {
    const { error } = await supabase
      .from('task_notifications')
      .delete()
      .eq('read', true)

    if (error) throw error
  },

  /**
   * Get unread notification count for current user
   */
  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('task_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false)

    if (error) throw error
    return count || 0
  },

  /**
   * Helper: Create notification for task assignment
   */
  async notifyAssignment(taskId: string, assigneeUserId: string, actorUserId: string): Promise<void> {
    // Get task details
    const { data: task } = await supabase
      .from('tasks')
      .select('title')
      .eq('id', taskId)
      .single()

    if (!task) return

    // Get actor name
    const { data: actor } = await supabase
      .from('users')
      .select('display_name, email')
      .eq('id', actorUserId)
      .single()

    const actorName = actor?.display_name || actor?.email || 'Someone'

    await this.create({
      userId: assigneeUserId,
      taskId,
      eventType: 'assignment',
      message: `${actorName} assigned you to "${task.title}"`,
      actorUserId,
    })
  },

  /**
   * Helper: Create notification for @mention in comment
   */
  async notifyMention(taskId: string, mentionedUserId: string, actorUserId: string): Promise<void> {
    // Get task details
    const { data: task } = await supabase
      .from('tasks')
      .select('title')
      .eq('id', taskId)
      .single()

    if (!task) return

    // Get actor name
    const { data: actor } = await supabase
      .from('users')
      .select('display_name, email')
      .eq('id', actorUserId)
      .single()

    const actorName = actor?.display_name || actor?.email || 'Someone'

    await this.create({
      userId: mentionedUserId,
      taskId,
      eventType: 'mention',
      message: `${actorName} mentioned you in "${task.title}"`,
      actorUserId,
    })
  },

  /**
   * Helper: Create notification for new comment on assigned task
   */
  async notifyComment(taskId: string, assigneeUserId: string, actorUserId: string): Promise<void> {
    // Don't notify if actor is the assignee
    if (actorUserId === assigneeUserId) return

    // Get task details
    const { data: task } = await supabase
      .from('tasks')
      .select('title')
      .eq('id', taskId)
      .single()

    if (!task) return

    // Get actor name
    const { data: actor } = await supabase
      .from('users')
      .select('display_name, email')
      .eq('id', actorUserId)
      .single()

    const actorName = actor?.display_name || actor?.email || 'Someone'

    await this.create({
      userId: assigneeUserId,
      taskId,
      eventType: 'comment',
      message: `${actorName} commented on "${task.title}"`,
      actorUserId,
    })
  },

  /**
   * Helper: Create notification for task status change
   */
  async notifyStatusChange(
    taskId: string,
    assigneeUserId: string,
    actorUserId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    // Don't notify if actor is the assignee
    if (actorUserId === assigneeUserId) return

    // Get task details
    const { data: task } = await supabase
      .from('tasks')
      .select('title')
      .eq('id', taskId)
      .single()

    if (!task) return

    // Get actor name
    const { data: actor } = await supabase
      .from('users')
      .select('display_name, email')
      .eq('id', actorUserId)
      .single()

    const actorName = actor?.display_name || actor?.email || 'Someone'

    await this.create({
      userId: assigneeUserId,
      taskId,
      eventType: 'status_change',
      message: `${actorName} moved "${task.title}" from ${oldStatus} to ${newStatus}`,
      actorUserId,
      metadata: { oldStatus, newStatus },
    })
  },
}

