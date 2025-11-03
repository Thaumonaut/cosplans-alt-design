/**
 * Subtask Service
 * 
 * Handles CRUD operations for task subtasks with optimistic updates and RLS.
 */

import { BaseService, type ServiceResponse } from './supabase';
import type { Subtask, SubtaskInsert, SubtaskUpdate } from '$lib/types/tasks';
import { SubtaskInsertSchema, SubtaskUpdateSchema } from '$lib/schemas/tasks';

export class SubtaskService extends BaseService {
	/**
	 * Get all subtasks for a task
	 */
	async getSubtasks(taskId: string): Promise<ServiceResponse<Subtask[]>> {
		return this.execute(async () => {
			return await this.client
				.from('subtasks')
				.select('*')
				.eq('task_id', taskId)
				.order('display_order', { ascending: true });
		});
	}

	/**
	 * Create a new subtask
	 */
	async createSubtask(data: SubtaskInsert): Promise<ServiceResponse<Subtask>> {
		// Validate input
		const validated = SubtaskInsertSchema.parse(data);

		return this.execute(async () => {
			return await this.client
				.from('subtasks')
				.insert(validated)
				.select()
				.single();
		});
	}

	/**
	 * Update a subtask
	 */
	async updateSubtask(id: string, data: SubtaskUpdate): Promise<ServiceResponse<Subtask>> {
		// Validate input
		const validated = SubtaskUpdateSchema.parse(data);

		return this.execute(async () => {
			return await this.client
				.from('subtasks')
				.update({ ...validated, updated_at: new Date().toISOString() })
				.eq('id', id)
				.select()
				.single();
		});
	}

	/**
	 * Delete a subtask
	 */
	async deleteSubtask(id: string): Promise<ServiceResponse<void>> {
		return this.execute(async () => {
			const { error } = await this.client
				.from('subtasks')
				.delete()
				.eq('id', id);
			return { data: null, error };
		});
	}

	/**
	 * Toggle subtask completion
	 */
	async toggleSubtask(id: string): Promise<ServiceResponse<Subtask>> {
		return this.execute(async () => {
			// First, get current state
			const { data: current, error: fetchError } = await this.client
				.from('subtasks')
				.select('completed')
				.eq('id', id)
				.single();

			if (fetchError) return { data: null, error: fetchError };

			// Toggle the value
			return await this.client
				.from('subtasks')
				.update({ 
					completed: !current.completed,
					updated_at: new Date().toISOString()
				})
				.eq('id', id)
				.select()
				.single();
		});
	}

	/**
	 * Reorder subtasks
	 */
	async reorderSubtasks(
		taskId: string,
		subtaskIds: string[]
	): Promise<ServiceResponse<Subtask[]>> {
		return this.execute(async () => {
			// Update display_order for each subtask
			const updates = subtaskIds.map((id, index) => 
				this.client
					.from('subtasks')
					.update({ display_order: index })
					.eq('id', id)
					.eq('task_id', taskId)
			);

			await Promise.all(updates);

			// Return updated list
			return await this.client
				.from('subtasks')
				.select('*')
				.eq('task_id', taskId)
				.order('display_order', { ascending: true });
		});
	}

	/**
	 * Bulk create subtasks
	 */
	async createSubtasks(subtasks: SubtaskInsert[]): Promise<ServiceResponse<Subtask[]>> {
		// Validate all inputs
		const validated = subtasks.map(s => SubtaskInsertSchema.parse(s));

		return this.execute(async () => {
			return await this.client
				.from('subtasks')
				.insert(validated)
				.select();
		});
	}

	/**
	 * Get completion stats for a task's subtasks
	 */
	async getCompletionStats(taskId: string): Promise<ServiceResponse<{
		total: number;
		completed: number;
		percentage: number;
	}>> {
		return this.execute(async () => {
			const { data, error } = await this.client
				.from('subtasks')
				.select('completed')
				.eq('task_id', taskId);

			if (error) return { data: null, error };

			const total = data.length;
			const completed = data.filter(s => s.completed).length;
			const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

			return { 
				data: { total, completed, percentage },
				error: null
			};
		});
	}
}

