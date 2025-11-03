/**
 * Task Service
 * 
 * Core task management service that extends existing task functionality
 * with rich relations (subtasks, comments, attachments, notifications, custom fields, labels).
 */

import { BaseService, type ServiceResponse } from './supabase';
import type { TaskDetail, CreateTaskRequest, UpdateTaskRequest, TaskFilters } from '$lib/types/tasks';
import { CreateTaskRequestSchema, UpdateTaskRequestSchema } from '$lib/schemas/tasks';
import { SubtaskService } from './subtask-service';
import { NotificationService } from './notification-service';

export class TaskService extends BaseService {
	private subtaskService: SubtaskService;
	private notificationService: NotificationService;

	constructor(client?: any) {
		super(client);
		this.subtaskService = new SubtaskService(client);
		this.notificationService = new NotificationService(client);
	}

	/**
	 * Get task with all relations (full TaskDetail)
	 */
	async getTaskDetail(taskId: string): Promise<ServiceResponse<TaskDetail>> {
		return this.execute(async () => {
			const { data: task, error } = await this.client
				.from('tasks')
				.select(`
					*,
					subtasks(*),
					comments:task_comments(
						*,
						user:users(id, email, first_name, last_name, avatar_url)
					),
					attachments:task_attachments(
						*,
						uploader:users(id, email, first_name, last_name)
					),
					customFieldValues:task_custom_field_values(
						*,
						field_definition:custom_field_definitions(*)
					),
					labels:task_label_assignments(
						*,
						label:task_labels(*)
					),
					stageDeadlines:task_stage_deadlines(
						*,
						stage:task_stages(id, name, color)
					)
				`)
				.eq('id', taskId)
				.single();

			if (error) return { data: null, error };

			// Calculate subtask completion percentage
			const subtasks = task.subtasks || [];
			const completed = subtasks.filter((s: any) => s.completed).length;
			const total = subtasks.length;
			const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

			return {
				data: {
					...task,
					subtask_completion_percentage: percentage,
					total_subtasks: total,
					completed_subtasks: completed,
				},
				error: null,
			};
		});
	}

	/**
	 * Get tasks with basic relations (for list views)
	 */
	async getTasks(filters?: TaskFilters): Promise<ServiceResponse<any[]>> {
		return this.execute(async () => {
			let query = this.client
				.from('tasks')
				.select(`
					*,
					subtasks(id, completed),
					labels:task_label_assignments(
						label:task_labels(id, name, color)
					),
					assignee:users!tasks_assigned_to_fkey(id, email, first_name, last_name, avatar_url)
				`);

			// Apply filters
			if (filters?.status_ids?.length) {
				query = query.in('status_id', filters.status_ids);
			}
			if (filters?.priorities?.length) {
				query = query.in('priority', filters.priorities);
			}
			if (filters?.assigned_to?.length) {
				query = query.in('assigned_to', filters.assigned_to);
			}
			if (filters?.project_ids?.length) {
				query = query.in('project_id', filters.project_ids);
			}
			if (filters?.label_ids?.length) {
				// Filter by labels requires a subquery
				query = query.in('id', 
					this.client
						.from('task_label_assignments')
						.select('task_id')
						.in('label_id', filters.label_ids)
				);
			}
			if (filters?.due_date_from) {
				query = query.gte('due_date', filters.due_date_from);
			}
			if (filters?.due_date_to) {
				query = query.lte('due_date', filters.due_date_to);
			}
			if (filters?.is_standalone !== undefined) {
				if (filters.is_standalone) {
					query = query
						.is('project_id', null)
						.is('photoshoot_id', null)
						.is('resource_id', null);
				} else {
					query = query.or('project_id.not.is.null,photoshoot_id.not.is.null,resource_id.not.is.null');
				}
			}
			if (filters?.search_query) {
				query = query.ilike('title', `%${filters.search_query}%`);
			}

			const { data, error } = await query.order('created_at', { ascending: false });

			if (error) return { data: null, error };

			// Add subtask completion percentage to each task
			const tasksWithMeta = data.map((task: any) => {
				const subtasks = task.subtasks || [];
				const completed = subtasks.filter((s: any) => s.completed).length;
				const total = subtasks.length;
				const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

				return {
					...task,
					subtask_completion_percentage: percentage,
					total_subtasks: total,
					completed_subtasks: completed,
				};
			});

			return { data: tasksWithMeta, error: null };
		});
	}

	/**
	 * Create a new task with optional subtasks
	 */
	async createTask(data: CreateTaskRequest): Promise<ServiceResponse<TaskDetail>> {
		const validated = CreateTaskRequestSchema.parse(data);
		const userId = await this.getCurrentUserId();

		return this.execute(async () => {
			// Create task
			const { data: task, error: taskError } = await this.client
				.from('tasks')
				.insert({
					team_id: validated.team_id,
					title: validated.title,
					description: validated.description,
					status_id: validated.status_id,
					priority: validated.priority || 'medium',
					due_date: validated.due_date,
					assigned_to: validated.assigned_to,
					project_id: validated.project_id,
					photoshoot_id: validated.photoshoot_id,
					resource_id: validated.resource_id,
					created_by: userId,
				})
				.select()
				.single();

			if (taskError) return { data: null, error: taskError };

			// Create subtasks if provided
			if (validated.subtasks && validated.subtasks.length > 0) {
				await this.subtaskService.createSubtasks(
					validated.subtasks.map((s, index) => ({
						task_id: task.id,
						title: s.title,
						completed: false,
						display_order: s.display_order ?? index,
					}))
				);
			}

			// Send notification if task is assigned
			if (validated.assigned_to && userId) {
				await this.notificationService.notifyTaskAssigned(
					task.id,
					validated.assigned_to,
					userId
				);
			}

			// Return full task detail
			return await this.getTaskDetail(task.id);
		});
	}

	/**
	 * Update a task
	 */
	async updateTask(taskId: string, data: UpdateTaskRequest): Promise<ServiceResponse<TaskDetail>> {
		const validated = UpdateTaskRequestSchema.parse(data);
		const userId = await this.getCurrentUserId();

		return this.execute(async () => {
			// Get current task for comparison
			const { data: currentTask } = await this.client
				.from('tasks')
				.select('*')
				.eq('id', taskId)
				.single();

			// Update task
			const { data: task, error: updateError } = await this.client
				.from('tasks')
				.update({
					...validated,
					updated_at: new Date().toISOString(),
				})
				.eq('id', taskId)
				.select()
				.single();

			if (updateError) return { data: null, error: updateError };

			// Send notifications for changes
			if (currentTask && userId) {
				// Notify if assignee changed
				if (data.assigned_to && data.assigned_to !== currentTask.assigned_to) {
					await this.notificationService.notifyTaskAssigned(
						taskId,
						data.assigned_to,
						userId
					);
				}

				// Notify if status changed
				if (data.status_id && data.status_id !== currentTask.status_id) {
					if (currentTask.assigned_to) {
						await this.notificationService.notifyStatusChanged(
							taskId,
							currentTask.assigned_to,
							userId,
							currentTask.status_id,
							data.status_id
						);
					}
				}
			}

			// Return full task detail
			return await this.getTaskDetail(taskId);
		});
	}

	/**
	 * Delete a task
	 */
	async deleteTask(taskId: string): Promise<ServiceResponse<void>> {
		return this.execute(async () => {
			const { error } = await this.client
				.from('tasks')
				.delete()
				.eq('id', taskId);

			return { data: null, error };
		});
	}

	/**
	 * Bulk update tasks (for bulk actions)
	 */
	async bulkUpdateTasks(
		taskIds: string[],
		updates: Partial<UpdateTaskRequest>
	): Promise<ServiceResponse<void>> {
		return this.execute(async () => {
			const { error } = await this.client
				.from('tasks')
				.update({
					...updates,
					updated_at: new Date().toISOString(),
				})
				.in('id', taskIds);

			return { data: null, error };
		});
	}

	/**
	 * Get tasks for a project
	 */
	async getProjectTasks(projectId: string): Promise<ServiceResponse<any[]>> {
		return this.getTasks({ project_ids: [projectId] });
	}

	/**
	 * Get tasks for a photoshoot
	 */
	async getPhotoshootTasks(photoshootId: string): Promise<ServiceResponse<any[]>> {
		return this.getTasks({ photoshoot_ids: [photoshootId] });
	}

	/**
	 * Get standalone tasks (not linked to any project/photoshoot/resource)
	 */
	async getStandaloneTasks(teamId: string): Promise<ServiceResponse<any[]>> {
		return this.getTasks({ is_standalone: true });
	}
}

