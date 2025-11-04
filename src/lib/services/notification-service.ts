/**
 * Notification Service
 * 
 * Handles in-app and email notifications for task events.
 * Integrates with Supabase Edge Functions for email delivery.
 */

import { BaseService, type ServiceResponse } from './supabase';
import type { TaskNotification, TaskNotificationInsert, TaskNotificationEventType } from '$lib/types/tasks';
import { TaskNotificationInsertSchema, TaskNotificationUpdateSchema } from '$lib/schemas/tasks';

export class NotificationService extends BaseService {
	/**
	 * Get all notifications for current user
	 */
	async getNotifications(limit: number = 50): Promise<ServiceResponse<TaskNotification[]>> {
		const userId = await this.getCurrentUserId();
		if (!userId) {
			return { error: { code: 'AUTH_ERROR', message: 'Not authenticated' } };
		}

		return this.execute(async () => {
			return await this.client
				.from('task_notifications')
				.select(`
					*,
					task:tasks!task_notifications_task_id_fkey(id, title),
					actor:users!task_notifications_actor_user_id_fkey(
						id,
						email,
						first_name,
						last_name,
						avatar_url
					)
				`)
				.eq('user_id', userId)
				.order('created_at', { ascending: false })
				.limit(limit);
		});
	}

	/**
	 * Get unread notification count
	 */
	async getUnreadCount(): Promise<ServiceResponse<number>> {
		const userId = await this.getCurrentUserId();
		if (!userId) {
			return { error: { code: 'AUTH_ERROR', message: 'Not authenticated' } };
		}

		return this.execute(async () => {
			const { count, error } = await this.client
				.from('task_notifications')
				.select('*', { count: 'exact', head: true })
				.eq('user_id', userId)
				.eq('read', false);

			return { data: count || 0, error };
		});
	}

	/**
	 * Mark notification as read
	 */
	async markAsRead(notificationId: string): Promise<ServiceResponse<TaskNotification>> {
		return this.execute(async () => {
			return await this.client
				.from('task_notifications')
				.update({ read: true })
				.eq('id', notificationId)
				.select()
				.single();
		});
	}

	/**
	 * Mark all notifications as read for current user
	 */
	async markAllAsRead(): Promise<ServiceResponse<void>> {
		const userId = await this.getCurrentUserId();
		if (!userId) {
			return { error: { code: 'AUTH_ERROR', message: 'Not authenticated' } };
		}

		return this.execute(async () => {
			const { error } = await this.client
				.from('task_notifications')
				.update({ read: true })
				.eq('user_id', userId)
				.eq('read', false);

			return { data: null, error };
		});
	}

	/**
	 * Create a new notification
	 */
	async createNotification(data: TaskNotificationInsert): Promise<ServiceResponse<TaskNotification>> {
		// Validate all required UUIDs are present and not undefined/null or the string "undefined"
		if (
			!data.user_id ||
			!data.task_id ||
			!data.event_type ||
			data.user_id === 'undefined' ||
			data.task_id === 'undefined'
		) {
			return {
				error: {
					code: 'VALIDATION_ERROR',
					message: `Missing required fields: user_id=${data.user_id}, task_id=${data.task_id}, event_type=${data.event_type}`,
				},
			};
		}

		const validated = TaskNotificationInsertSchema.parse(data);

		return this.execute(async () => {
			// Create notification record
			const { data: notification, error } = await this.client
				.from('task_notifications')
				.insert(validated)
				.select()
				.single();

			// Trigger email notification via Edge Function
			if (!error && notification) {
				await this.sendEmailNotification(notification);
			}

			return { data: notification, error };
		});
	}

	/**
	 * Create notification for task assignment
	 */
	async notifyTaskAssigned(
		taskId: string,
		assignedToUserId: string,
		assignedByUserId: string
	): Promise<ServiceResponse<TaskNotification>> {
		return this.createNotification({
			user_id: assignedToUserId,
			task_id: taskId,
			event_type: 'task_assigned',
			message: 'You have been assigned to a task',
			actor_user_id: assignedByUserId,
		});
	}

	/**
	 * Create notification for task status change
	 */
	async notifyStatusChanged(
		taskId: string,
		userId: string,
		changedByUserId: string,
		oldStatus: string,
		newStatus: string
	): Promise<ServiceResponse<TaskNotification>> {
		return this.createNotification({
			user_id: userId,
			task_id: taskId,
			event_type: 'task_status_changed',
			message: `Task status changed from ${oldStatus} to ${newStatus}`,
			actor_user_id: changedByUserId,
			metadata: { old_status: oldStatus, new_status: newStatus },
		});
	}

	/**
	 * Create notification for comment
	 */
	async notifyCommented(
		taskId: string,
		userId: string,
		commentedByUserId: string
	): Promise<ServiceResponse<TaskNotification>> {
		return this.createNotification({
			user_id: userId,
			task_id: taskId,
			event_type: 'task_commented',
			message: 'Someone commented on your task',
			actor_user_id: commentedByUserId,
		});
	}

	/**
	 * Create notification for due soon tasks
	 */
	async notifyDueSoon(
		taskId: string,
		userId: string,
		daysRemaining: number
	): Promise<ServiceResponse<TaskNotification>> {
		return this.createNotification({
			user_id: userId,
			task_id: taskId,
			event_type: 'task_due_soon',
			message: `Task is due in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`,
			metadata: { days_remaining: daysRemaining },
		});
	}

	/**
	 * Send email notification via Edge Function
	 */
	private async sendEmailNotification(notification: TaskNotification): Promise<void> {
		try {
			await this.client.functions.invoke('send-task-notification', {
				body: { notification },
			});
		} catch (error) {
			console.error('Failed to send email notification:', error);
			// Don't throw - in-app notification was already created
		}
	}

	/**
	 * Subscribe to realtime notifications for current user
	 */
	async subscribeToNotifications(
		callback: (notification: TaskNotification) => void
	) {
		const userId = await this.getCurrentUserId();
		if (!userId) return null;

		return this.client
			.channel(`user_notifications:${userId}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'task_notifications',
					filter: `user_id=eq.${userId}`,
				},
				(payload) => {
					callback(payload.new as TaskNotification);
				}
			)
			.subscribe();
	}

	/**
	 * Delete old notifications (cleanup)
	 */
	async deleteOldNotifications(daysOld: number = 90): Promise<ServiceResponse<void>> {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysOld);

		return this.execute(async () => {
			const { error } = await this.client
				.from('task_notifications')
				.delete()
				.lt('created_at', cutoffDate.toISOString());

			return { data: null, error };
		});
	}
}

