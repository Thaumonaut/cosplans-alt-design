/**
 * Comment Service
 * 
 * Handles CRUD operations for task comments with @mentions parsing and RLS.
 */

import { BaseService, type ServiceResponse } from './supabase';
import type { TaskComment, TaskCommentInsert, TaskCommentUpdate } from '$lib/types/tasks';
import { TaskCommentInsertSchema, TaskCommentUpdateSchema } from '$lib/schemas/tasks';
import { extractMentions } from '$lib/types/type-guards';

export class CommentService extends BaseService {
	/**
	 * Get all comments for a task
	 */
	async getComments(taskId: string): Promise<ServiceResponse<TaskComment[]>> {
		return this.execute(async () => {
			// Fetch comments (user_id references auth.users, can't join directly)
			const { data: comments, error } = await this.client
				.from('task_comments')
				.select('*')
				.eq('task_id', taskId)
				.eq('deleted', false)
				.order('created_at', { ascending: true });

			if (error) return { data: null, error };

			// Fetch users separately from public.users (IDs match auth.users)
			const userIds = [...new Set(comments?.map((c: any) => c.user_id).filter(Boolean) || [])];
			let usersMap: Record<string, any> = {};
			
			if (userIds.length > 0) {
				const { data: users } = await this.client
					.from('users')
					.select('id, email, name, avatar_url')
					.in('id', userIds);

				if (users) {
					users.forEach((u: any) => {
						const nameParts = u.name?.split(' ') || [];
						usersMap[u.id] = {
							id: u.id,
							email: u.email,
							first_name: nameParts[0] || null,
							last_name: nameParts.slice(1).join(' ') || null,
							avatar_url: u.avatar_url
						};
					});
				}
			}

			// Attach user data to comments
			const commentsWithUsers = (comments || []).map((c: any) => ({
				...c,
				user: usersMap[c.user_id] || null
			}));

			return { data: commentsWithUsers, error: null };
		});
	}

	/**
	 * Create a new comment with automatic @mention extraction
	 */
	async createComment(data: Omit<TaskCommentInsert, 'mentions'>): Promise<ServiceResponse<TaskComment>> {
		// Extract @mentions from content
		const mentions = extractMentions(data.content);
		
		// Find user IDs for mentioned usernames
		const mentionedUserIds: string[] = [];
		if (mentions.length > 0) {
			const { data: users } = await this.client
				.from('users')
				.select('id, email')
				.in('email', mentions.map(m => `${m}@`)); // Simplified mention matching

			if (users) {
				mentionedUserIds.push(...users.map(u => u.id));
			}
		}

		const validated = TaskCommentInsertSchema.parse({
			...data,
			mentions: mentionedUserIds,
		});

		return this.execute(async () => {
			const { data: comment, error } = await this.client
				.from('task_comments')
				.insert(validated)
				.select(`
					*,
					user:users!task_comments_user_id_fkey(
						id,
						email,
						first_name,
						last_name,
						avatar_url
					)
				`)
				.single();

			// If there are mentions, create notifications
			if (!error && comment && mentionedUserIds.length > 0) {
				await this.createMentionNotifications(
					comment.task_id,
					comment.user_id,
					mentionedUserIds
				);
			}

			return { data: comment, error };
		});
	}

	/**
	 * Update a comment
	 */
	async updateComment(id: string, data: TaskCommentUpdate): Promise<ServiceResponse<TaskComment>> {
		const validated = TaskCommentUpdateSchema.parse(data);

		return this.execute(async () => {
			return await this.client
				.from('task_comments')
				.update({ ...validated, updated_at: new Date().toISOString() })
				.eq('id', id)
				.select(`
					*,
					user:users!task_comments_user_id_fkey(
						id,
						email,
						first_name,
						last_name,
						avatar_url
					)
				`)
				.single();
		});
	}

	/**
	 * Soft delete a comment
	 */
	async deleteComment(id: string): Promise<ServiceResponse<void>> {
		return this.execute(async () => {
			const { error } = await this.client
				.from('task_comments')
				.update({ 
					deleted: true,
					updated_at: new Date().toISOString()
				})
				.eq('id', id);
			return { data: null, error };
		});
	}

	/**
	 * Get comment count for a task
	 */
	async getCommentCount(taskId: string): Promise<ServiceResponse<number>> {
		return this.execute(async () => {
			const { count, error } = await this.client
				.from('task_comments')
				.select('*', { count: 'exact', head: true })
				.eq('task_id', taskId)
				.eq('deleted', false);

			return { data: count || 0, error };
		});
	}

	/**
	 * Create notifications for @mentioned users
	 */
	private async createMentionNotifications(
		taskId: string,
		actorUserId: string,
		mentionedUserIds: string[]
	): Promise<void> {
		const notifications = mentionedUserIds.map(userId => ({
			user_id: userId,
			task_id: taskId,
			event_type: 'task_mentioned' as const,
			message: 'You were mentioned in a comment',
			actor_user_id: actorUserId,
		}));

		await this.client
			.from('task_notifications')
			.insert(notifications);
	}

	/**
	 * Subscribe to realtime comment updates for a task
	 */
	subscribeToComments(
		taskId: string,
		callback: (comment: TaskComment) => void
	) {
		return this.client
			.channel(`task_comments:${taskId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'task_comments',
					filter: `task_id=eq.${taskId}`,
				},
				(payload) => {
					if (payload.new) {
						callback(payload.new as TaskComment);
					}
				}
			)
			.subscribe();
	}
}

