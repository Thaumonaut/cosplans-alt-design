/**
 * Stage Deadline Service
 * 
 * Manages stage-level milestone deadlines for breaking down long-duration tasks.
 * Handles CRUD operations, urgency calculation, and auto-completion when tasks advance stages.
 */

import { BaseService, type ServiceResponse } from './supabase';
import type { TaskStageDeadline, TaskStageDeadlineInsert, TaskStageDeadlineUpdate, StageDeadlineWithUrgency, DeadlineUrgency } from '$lib/types/adhd-features';

export class StageDeadlineService extends BaseService {
	/**
	 * Get all stage deadlines for a task
	 */
	async getDeadlinesForTask(taskId: string): Promise<ServiceResponse<TaskStageDeadline[]>> {
		return this.execute(async () => {
			const { data, error } = await this.client
				.from('task_stage_deadlines')
				.select(`
					*,
					stage:task_stages(id, name)
				`)
				.eq('task_id', taskId)
				.order('deadline', { ascending: true });

			if (error) return { data: null, error };
			return { data: (data || []) as TaskStageDeadline[], error: null };
		});
	}

	/**
	 * Get upcoming deadline for a task (next incomplete deadline)
	 */
	async getUpcomingDeadline(taskId: string): Promise<ServiceResponse<StageDeadlineWithUrgency | null>> {
		return this.execute(async () => {
			const { data, error } = await this.client
				.from('task_stage_deadlines')
				.select(`
					*,
					stage:task_stages(id, name)
				`)
				.eq('task_id', taskId)
				.is('completed_at', null)
				.order('deadline', { ascending: true })
				.limit(1)
				.single();

			if (error && error.code !== 'PGRST116') {
				return { data: null, error };
			}

			if (!data) {
				return { data: null, error: null };
			}

			const deadline = data as TaskStageDeadline;
			const withUrgency = this.calculateUrgency(deadline);

			return { data: withUrgency, error: null };
		});
	}

	/**
	 * Create a stage deadline
	 */
	async createDeadline(deadline: TaskStageDeadlineInsert): Promise<ServiceResponse<TaskStageDeadline>> {
		return this.execute(async () => {
			const { data, error } = await this.client
				.from('task_stage_deadlines')
				.insert({
					task_id: deadline.task_id,
					stage_id: deadline.stage_id,
					deadline: deadline.deadline,
				})
				.select(`
					*,
					stage:task_stages(id, name)
				`)
				.single();

			if (error) return { data: null, error };
			return { data: data as TaskStageDeadline, error: null };
		});
	}

	/**
	 * Update a stage deadline
	 */
	async updateDeadline(deadlineId: string, updates: TaskStageDeadlineUpdate): Promise<ServiceResponse<TaskStageDeadline>> {
		return this.execute(async () => {
			const updateData: Record<string, any> = {};
			if (updates.deadline !== undefined) updateData.deadline = updates.deadline;
			if (updates.completed_at !== undefined) updateData.completed_at = updates.completed_at;

			const { data, error } = await this.client
				.from('task_stage_deadlines')
				.update(updateData)
				.eq('id', deadlineId)
				.select(`
					*,
					stage:task_stages(id, name)
				`)
				.single();

			if (error) return { data: null, error };
			return { data: data as TaskStageDeadline, error: null };
		});
	}

	/**
	 * Delete a stage deadline
	 */
	async deleteDeadline(deadlineId: string): Promise<ServiceResponse<void>> {
		return this.execute(async () => {
			const { error } = await this.client
				.from('task_stage_deadlines')
				.delete()
				.eq('id', deadlineId);

			if (error) return { data: undefined, error };
			return { data: undefined, error: null };
		});
	}

	/**
	 * Mark a stage deadline as completed (when task advances to that stage)
	 */
	async completeDeadline(taskId: string, stageId: string): Promise<ServiceResponse<TaskStageDeadline>> {
		return this.execute(async () => {
			// Find the deadline for this task and stage
			const { data: deadline, error: findError } = await this.client
				.from('task_stage_deadlines')
				.select('*')
				.eq('task_id', taskId)
				.eq('stage_id', stageId)
				.single();

			if (findError && findError.code !== 'PGRST116') {
				return { data: null, error: findError };
			}

			// If deadline doesn't exist, nothing to complete
			if (!deadline) {
				return { data: null, error: null };
			}

			// If already completed, return existing
			if (deadline.completed_at) {
				const { data: fullDeadline } = await this.client
					.from('task_stage_deadlines')
					.select(`
						*,
						stage:task_stages(id, name)
					`)
					.eq('id', deadline.id)
					.single();
				return { data: fullDeadline as TaskStageDeadline, error: null };
			}

			// Mark as completed
			const completedAt = new Date().toISOString();
			const { data: updated, error } = await this.client
				.from('task_stage_deadlines')
				.update({ completed_at: completedAt })
				.eq('id', deadline.id)
				.select(`
					*,
					stage:task_stages(id, name)
				`)
				.single();

			if (error) return { data: null, error };
			return { data: updated as TaskStageDeadline, error: null };
		});
	}

	/**
	 * Auto-complete previous stage deadline when task moves to new stage
	 * Called when task status changes
	 */
	async autoCompletePreviousStage(taskId: string, newStageId: string): Promise<ServiceResponse<void>> {
		return this.execute(async () => {
			// Get current task to find its previous stage
			const { data: task } = await this.client
				.from('tasks')
				.select('stage_id')
				.eq('id', taskId)
				.single();

			if (!task) {
				return { data: undefined, error: null };
			}

			// Find any incomplete deadlines for stages before the new stage
			// We'll mark all incomplete deadlines for stages that are now "behind" as completed
			const { data: deadlines } = await this.client
				.from('task_stage_deadlines')
				.select('*')
				.eq('task_id', taskId)
				.is('completed_at', null);

			if (!deadlines || deadlines.length === 0) {
				return { data: undefined, error: null };
			}

			// Get all stages to determine order
			const { data: stages } = await this.client
				.from('task_stages')
				.select('id, display_order')
				.in('id', [...new Set([...deadlines.map((d: any) => d.stage_id), newStageId])]);

			if (!stages) {
				return { data: undefined, error: null };
			}

			const stageOrderMap = new Map(stages.map((s: any) => [s.id, s.display_order]));
			const newStageOrder = stageOrderMap.get(newStageId) ?? Infinity;

			// Mark deadlines for stages with order < newStageOrder as completed
			const deadlinesToComplete = deadlines.filter((d: any) => {
				const stageOrder = stageOrderMap.get(d.stage_id) ?? Infinity;
				return stageOrder < newStageOrder;
			});

			if (deadlinesToComplete.length === 0) {
				return { data: undefined, error: null };
			}

			const completedAt = new Date().toISOString();
			const { error } = await this.client
				.from('task_stage_deadlines')
				.update({ completed_at: completedAt })
				.in('id', deadlinesToComplete.map((d: any) => d.id));

			if (error) return { data: undefined, error };
			return { data: undefined, error: null };
		});
	}

	/**
	 * Calculate urgency level for a deadline
	 */
	calculateUrgency(deadline: TaskStageDeadline): StageDeadlineWithUrgency {
		const now = new Date();
		const deadlineDate = new Date(deadline.deadline);
		const diffMs = deadlineDate.getTime() - now.getTime();
		const diffDays = diffMs / (1000 * 60 * 60 * 24);

		let urgency: DeadlineUrgency;
		if (diffDays < 0) {
			urgency = 'overdue';
		} else if (diffDays <= 1) {
			urgency = 'urgent';
		} else if (diffDays <= 3) {
			urgency = 'approaching';
		} else {
			urgency = 'safe';
		}

		return {
			...deadline,
			urgency,
			days_remaining: Math.ceil(diffDays),
		};
	}

	/**
	 * Get urgency color class for CSS
	 */
	getUrgencyColor(urgency: DeadlineUrgency): string {
		switch (urgency) {
			case 'safe':
				return 'text-green-600 dark:text-green-400';
			case 'approaching':
				return 'text-yellow-600 dark:text-yellow-400';
			case 'urgent':
				return 'text-orange-600 dark:text-orange-400';
			case 'overdue':
				return 'text-red-600 dark:text-red-400';
		}
	}

	/**
	 * Get urgency background color class for CSS
	 */
	getUrgencyBgColor(urgency: DeadlineUrgency): string {
		switch (urgency) {
			case 'safe':
				return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
			case 'approaching':
				return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
			case 'urgent':
				return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
			case 'overdue':
				return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
		}
	}
}

