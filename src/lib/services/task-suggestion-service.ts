/**
 * Task Suggestion Service
 * 
 * Provides intelligent task suggestions using a prioritization algorithm
 * designed for ADHD-friendly task management.
 * 
 * Algorithm weights:
 * - Due date urgency: 40%
 * - Priority: 30%
 * - Dependencies: 20%
 * - Effort: 10%
 */

import { BaseService, type ServiceResponse } from './supabase';
import type { Task, TaskFilters } from '$lib/types/tasks';

export interface TaskSuggestion {
	task: Task;
	score: number;
	reasoning: string;
	urgency: 'critical' | 'high' | 'medium' | 'low';
	urgencyReason: string;
}

export interface SuggestionOptions {
	userId?: string;
	teamId?: string;
	maxSuggestions?: number;
	excludeCompleted?: boolean;
}

export class TaskSuggestionService extends BaseService {
	/**
	 * Get task suggestions for "What should I do now?"
	 * 
	 * Returns prioritized list of tasks with reasoning for each suggestion.
	 */
	async getSuggestions(
		options: SuggestionOptions = {}
	): Promise<ServiceResponse<TaskSuggestion[]>> {
		return this.execute(async () => {
			// Build filters
			const filters: TaskFilters = {
				exclude_completed: options.excludeCompleted ?? true,
			};

			if (options.userId) {
				filters.assigned_to = [options.userId];
			}

			if (options.teamId) {
				filters.team_ids = [options.teamId];
			}

			// Get tasks from TaskService
			const { TaskService } = await import('./task-service');
			const taskService = new TaskService(this.client);
			const tasksResponse = await taskService.getTasks(filters);

			if (tasksResponse.error) {
				return { data: null, error: tasksResponse.error };
			}

			const tasks = tasksResponse.data || [];

			// Score and rank tasks
			const suggestions = tasks
				.map((task) => this.scoreTask(task))
				.filter((suggestion) => suggestion.score > 0)
				.sort((a, b) => b.score - a.score)
				.slice(0, options.maxSuggestions || 5);

			return { data: suggestions, error: null };
		});
	}

	/**
	 * Score a task using the prioritization algorithm
	 */
	private scoreTask(task: Task): TaskSuggestion {
		const now = new Date();
		
		// 1. Due Date Urgency (40% weight)
		const dueDateScore = this.calculateDueDateScore(task.due_date, now);
		const urgency = this.getUrgencyLevel(task.due_date, now);
		const urgencyReason = this.getUrgencyReason(task.due_date, now);

		// 2. Priority (30% weight)
		const priorityScore = this.calculatePriorityScore(task.priority);

		// 3. Dependencies (20% weight)
		// Check if task has incomplete subtasks
		const hasIncompleteSubtasks = task.total_subtasks
			? task.completed_subtasks !== undefined && task.completed_subtasks < task.total_subtasks
			: false;
		const dependencyScore = hasIncompleteSubtasks ? 0.3 : 1.0; // Blocked tasks score lower

		// 4. Effort (10% weight)
		// Estimate effort based on subtask count and complexity
		const effortScore = this.calculateEffortScore(task);

		// Calculate weighted total score (0-100)
		const totalScore =
			dueDateScore * 0.4 +
			priorityScore * 0.3 +
			dependencyScore * 0.2 +
			effortScore * 0.1;

		// Generate reasoning
		const reasoning = this.generateReasoning(
			task,
			dueDateScore,
			priorityScore,
			dependencyScore,
			effortScore,
			hasIncompleteSubtasks
		);

		return {
			task,
			score: Math.round(totalScore * 100) / 100,
			reasoning,
			urgency,
			urgencyReason,
		};
	}

	/**
	 * Calculate due date urgency score (0-1)
	 */
	private calculateDueDateScore(dueDate: string | null | undefined, now: Date): number {
		if (!dueDate) {
			// No due date = lower urgency, but not zero
			return 0.3;
		}

		const due = new Date(dueDate);
		due.setHours(0, 0, 0, 0);
		const today = new Date(now);
		today.setHours(0, 0, 0, 0);

		const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

		if (diffDays < 0) {
			// Overdue - highest urgency
			return 1.0;
		} else if (diffDays === 0) {
			// Due today - very high urgency
			return 0.95;
		} else if (diffDays === 1) {
			// Due tomorrow - high urgency
			return 0.85;
		} else if (diffDays <= 3) {
			// Due in 2-3 days - medium-high urgency
			return 0.7;
		} else if (diffDays <= 7) {
			// Due in a week - medium urgency
			return 0.5;
		} else {
			// More than a week away - low urgency
			return 0.3;
		}
	}

	/**
	 * Get urgency level for display
	 */
	private getUrgencyLevel(dueDate: string | null | undefined, now: Date): 'critical' | 'high' | 'medium' | 'low' {
		if (!dueDate) return 'low';

		const due = new Date(dueDate);
		due.setHours(0, 0, 0, 0);
		const today = new Date(now);
		today.setHours(0, 0, 0, 0);

		const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

		if (diffDays < 0) return 'critical';
		if (diffDays === 0 || diffDays === 1) return 'high';
		if (diffDays <= 7) return 'medium';
		return 'low';
	}

	/**
	 * Get human-readable urgency reason
	 */
	private getUrgencyReason(dueDate: string | null | undefined, now: Date): string {
		if (!dueDate) return 'No due date';

		const due = new Date(dueDate);
		due.setHours(0, 0, 0, 0);
		const today = new Date(now);
		today.setHours(0, 0, 0, 0);

		const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

		if (diffDays < 0) {
			return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
		} else if (diffDays === 0) {
			return 'Due today';
		} else if (diffDays === 1) {
			return 'Due tomorrow';
		} else if (diffDays <= 7) {
			return `Due in ${diffDays} days`;
		} else {
			return `Due in ${Math.ceil(diffDays / 7)} weeks`;
		}
	}

	/**
	 * Calculate priority score (0-1)
	 */
	private calculatePriorityScore(priority: 'low' | 'medium' | 'high' | undefined): number {
		switch (priority) {
			case 'high':
				return 1.0;
			case 'medium':
				return 0.6;
			case 'low':
				return 0.3;
			default:
				return 0.5; // Default to medium
		}
	}

	/**
	 * Calculate effort score (0-1)
	 * Lower effort = higher score (easier tasks are suggested first)
	 */
	private calculateEffortScore(task: Task): number {
		// Simple heuristic: fewer subtasks = less effort
		const subtaskCount = task.total_subtasks || 0;
		
		if (subtaskCount === 0) {
			return 1.0; // No subtasks = quick task
		} else if (subtaskCount <= 3) {
			return 0.8; // Small number of subtasks
		} else if (subtaskCount <= 5) {
			return 0.6; // Medium complexity
		} else {
			return 0.4; // Large task with many subtasks
		}
	}

	/**
	 * Generate human-readable reasoning for the suggestion
	 */
	private generateReasoning(
		task: Task,
		dueDateScore: number,
		priorityScore: number,
		dependencyScore: number,
		effortScore: number,
		hasIncompleteSubtasks: boolean
	): string {
		const reasons: string[] = [];

		// Due date reasoning
		if (dueDateScore >= 0.9) {
			reasons.push('overdue or due very soon');
		} else if (dueDateScore >= 0.7) {
			reasons.push('due in the next few days');
		}

		// Priority reasoning
		if (priorityScore >= 0.8) {
			reasons.push('high priority');
		}

		// Dependency reasoning
		if (hasIncompleteSubtasks) {
			reasons.push('has incomplete subtasks');
		}

		// Effort reasoning
		if (effortScore >= 0.8) {
			reasons.push('quick task');
		}

		if (reasons.length === 0) {
			return 'Good task to work on';
		}

		return reasons.join(', ');
	}
}


