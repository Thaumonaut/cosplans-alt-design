/**
 * Task Filter Service
 * 
 * Client-side filtering logic for tasks based on multiple criteria.
 * Provides efficient filtering, sorting, and grouping operations.
 */

import type { TaskFilters, TaskGroupBy, TaskSortOption } from '$lib/types/tasks';
import { isTaskOverdue, isTaskDueSoon, isStandaloneTask, sortByPriority, groupTasksBy, filterTasks } from '$lib/types/type-guards';

export interface FilterableTask {
	id: string;
	title: string;
	status_id?: string;
	priority?: 'low' | 'medium' | 'high';
	assigned_to?: string;
	created_by?: string;
	project_id?: string;
	photoshoot_id?: string;
	resource_id?: string;
	due_date?: string;
	created_at?: string;
	updated_at?: string;
	labels?: Array<{ id: string; name: string; color: string }>;
	[key: string]: any;
}

/**
 * Apply filters to a list of tasks
 */
export function applyFilters(
	tasks: FilterableTask[],
	filters: TaskFilters
): FilterableTask[] {
	let filtered = [...tasks];

	// Status filter
	if (filters.status_ids?.length) {
		filtered = filtered.filter((task) => 
			task.status_id && filters.status_ids!.includes(task.status_id)
		);
	}

	// Priority filter
	if (filters.priorities?.length) {
		filtered = filtered.filter((task) => 
			task.priority && filters.priorities!.includes(task.priority)
		);
	}

	// Assigned to filter
	if (filters.assigned_to?.length) {
		filtered = filtered.filter((task) => 
			task.assigned_to && filters.assigned_to!.includes(task.assigned_to)
		);
	}

	// Created by filter
	if (filters.created_by?.length) {
		filtered = filtered.filter((task) => 
			task.created_by && filters.created_by!.includes(task.created_by)
		);
	}

	// Project filter
	if (filters.project_ids?.length) {
		filtered = filtered.filter((task) => 
			task.project_id && filters.project_ids!.includes(task.project_id)
		);
	}

	// Photoshoot filter
	if (filters.photoshoot_ids?.length) {
		filtered = filtered.filter((task) => 
			task.photoshoot_id && filters.photoshoot_ids!.includes(task.photoshoot_id)
		);
	}

	// Resource filter
	if (filters.resource_ids?.length) {
		filtered = filtered.filter((task) => 
			task.resource_id && filters.resource_ids!.includes(task.resource_id)
		);
	}

	// Label filter (OR logic - task must have at least one matching label)
	if (filters.label_ids?.length) {
		filtered = filtered.filter((task) => {
			if (!task.labels || task.labels.length === 0) return false;
			return task.labels.some((label) => filters.label_ids!.includes(label.id));
		});
	}

	// Due date range filter
	if (filters.due_date_from || filters.due_date_to) {
		filtered = filtered.filter((task) => {
			if (!task.due_date) return false;
			const dueDate = new Date(task.due_date);
			
			if (filters.due_date_from) {
				const from = new Date(filters.due_date_from);
				if (dueDate < from) return false;
			}
			
			if (filters.due_date_to) {
				const to = new Date(filters.due_date_to);
				if (dueDate > to) return false;
			}
			
			return true;
		});
	}

	// Created date range filter
	if (filters.created_date_from || filters.created_date_to) {
		filtered = filtered.filter((task) => {
			if (!task.created_at) return false;
			const createdDate = new Date(task.created_at);
			
			if (filters.created_date_from) {
				const from = new Date(filters.created_date_from);
				if (createdDate < from) return false;
			}
			
			if (filters.created_date_to) {
				const to = new Date(filters.created_date_to);
				if (createdDate > to) return false;
			}
			
			return true;
		});
	}

	// Subtasks filter
	if (filters.has_subtasks !== undefined) {
		filtered = filtered.filter((task) => {
			const hasSubtasks = (task.total_subtasks || 0) > 0;
			return hasSubtasks === filters.has_subtasks;
		});
	}

	// Standalone tasks filter
	if (filters.is_standalone !== undefined) {
		filtered = filtered.filter((task) => 
			isStandaloneTask(task) === filters.is_standalone
		);
	}

	// Search query filter
	if (filters.search_query) {
		const query = filters.search_query.toLowerCase();
		filtered = filtered.filter((task) => 
			task.title.toLowerCase().includes(query)
		);
	}

	return filtered;
}

/**
 * Sort tasks based on sort option
 */
export function applySort(
	tasks: FilterableTask[],
	sortBy: TaskSortOption
): FilterableTask[] {
	const sorted = [...tasks];

	sorted.sort((a, b) => {
		let aValue: any;
		let bValue: any;

		switch (sortBy.field) {
			case 'title':
				aValue = a.title.toLowerCase();
				bValue = b.title.toLowerCase();
				break;
			case 'due_date':
				aValue = a.due_date ? new Date(a.due_date).getTime() : Infinity;
				bValue = b.due_date ? new Date(b.due_date).getTime() : Infinity;
				break;
			case 'created_at':
				aValue = a.created_at ? new Date(a.created_at).getTime() : 0;
				bValue = b.created_at ? new Date(b.created_at).getTime() : 0;
				break;
			case 'updated_at':
				aValue = a.updated_at ? new Date(a.updated_at).getTime() : 0;
				bValue = b.updated_at ? new Date(b.updated_at).getTime() : 0;
				break;
			case 'priority':
				const priorityOrder = { high: 3, medium: 2, low: 1 };
				aValue = a.priority ? priorityOrder[a.priority] : 0;
				bValue = b.priority ? priorityOrder[b.priority] : 0;
				break;
			case 'status':
				aValue = a.status_id || '';
				bValue = b.status_id || '';
				break;
			default:
				return 0;
		}

		if (sortBy.direction === 'asc') {
			return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
		} else {
			return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
		}
	});

	return sorted;
}

/**
 * Group tasks by specified field
 */
export function applyGrouping(
	tasks: FilterableTask[],
	groupBy: TaskGroupBy
): Map<string, FilterableTask[]> {
	if (groupBy === 'none') {
		return new Map([['all', tasks]]);
	}

	const groups = new Map<string, FilterableTask[]>();

	for (const task of tasks) {
		let key: string;

		switch (groupBy) {
			case 'status':
				key = task.status_id || 'No Status';
				break;
			case 'priority':
				key = task.priority || 'No Priority';
				break;
			case 'assignee':
				key = task.assigned_to || 'Unassigned';
				break;
			case 'project':
				key = task.project_id || 'No Project';
				break;
			case 'due_date':
				if (!task.due_date) {
					key = 'No Due Date';
				} else if (isTaskOverdue(task.due_date)) {
					key = 'Overdue';
				} else if (isTaskDueSoon(task.due_date)) {
					key = 'Due Soon';
				} else {
					key = 'Upcoming';
				}
				break;
			case 'created_date':
				if (!task.created_at) {
					key = 'Unknown';
				} else {
					const date = new Date(task.created_at);
					key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
				}
				break;
			case 'label':
				// Tasks with multiple labels appear in multiple groups
				if (!task.labels || task.labels.length === 0) {
					key = 'No Labels';
				} else {
					// For simplicity, use first label
					key = task.labels[0].name;
				}
				break;
			default:
				key = 'Other';
		}

		if (!groups.has(key)) {
			groups.set(key, []);
		}
		groups.get(key)!.push(task);
	}

	return groups;
}

/**
 * Apply filters, sorting, and grouping in one operation
 */
export function processTaskList(
	tasks: FilterableTask[],
	filters: TaskFilters,
	sortBy: TaskSortOption,
	groupBy: TaskGroupBy
): { filtered: FilterableTask[]; sorted: FilterableTask[]; grouped: Map<string, FilterableTask[]> } {
	const filtered = applyFilters(tasks, filters);
	const sorted = applySort(filtered, sortBy);
	const grouped = applyGrouping(sorted, groupBy);

	return { filtered, sorted, grouped };
}

/**
 * Count active filters
 */
export function countActiveFilters(filters: TaskFilters): number {
	let count = 0;

	if (filters.status_ids?.length) count++;
	if (filters.priorities?.length) count++;
	if (filters.assigned_to?.length) count++;
	if (filters.created_by?.length) count++;
	if (filters.project_ids?.length) count++;
	if (filters.photoshoot_ids?.length) count++;
	if (filters.resource_ids?.length) count++;
	if (filters.label_ids?.length) count++;
	if (filters.due_date_from || filters.due_date_to) count++;
	if (filters.created_date_from || filters.created_date_to) count++;
	if (filters.has_subtasks !== undefined) count++;
	if (filters.is_standalone !== undefined) count++;
	if (filters.search_query) count++;

	return count;
}

/**
 * Generate human-readable filter summary
 */
export function getFilterSummary(filters: TaskFilters): string {
	const parts: string[] = [];

	if (filters.status_ids?.length) {
		parts.push(`${filters.status_ids.length} status${filters.status_ids.length > 1 ? 'es' : ''}`);
	}
	if (filters.priorities?.length) {
		parts.push(`${filters.priorities.length} priorit${filters.priorities.length > 1 ? 'ies' : 'y'}`);
	}
	if (filters.assigned_to?.length) {
		parts.push(`${filters.assigned_to.length} assignee${filters.assigned_to.length > 1 ? 's' : ''}`);
	}
	if (filters.project_ids?.length) {
		parts.push(`${filters.project_ids.length} project${filters.project_ids.length > 1 ? 's' : ''}`);
	}
	if (filters.label_ids?.length) {
		parts.push(`${filters.label_ids.length} label${filters.label_ids.length > 1 ? 's' : ''}`);
	}
	if (filters.search_query) {
		parts.push(`search: "${filters.search_query}"`);
	}

	return parts.length > 0 ? parts.join(', ') : 'No filters';
}

