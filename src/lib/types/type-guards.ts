/**
 * Type Guards and Utility Functions
 * 
 * Runtime type checking and utility functions for task-related types.
 */

import type {
	Subtask,
	TaskComment,
	TaskAttachment,
	TaskNotification,
	TaskDetail,
	TaskActivity,
	TaskNotificationEventType,
} from './tasks';
import type {
	TaskTemplate,
	SavedTaskView,
} from './templates';
import type {
	CustomFieldDefinition,
	TaskCustomFieldValue,
	CustomFieldType,
	CurrencyValue,
	ParsedCustomFieldValue,
} from './custom-fields';
import type {
	TaskLabel,
	TaskLabelAssignment,
} from './labels';
import type {
	TaskStageDeadline,
	UserTaskStats,
	TaskBreakdownPattern,
	DeadlineUrgency,
	StreakStatus,
} from './adhd-features';

/**
 * Check if value is a valid Subtask
 */
export function isSubtask(value: unknown): value is Subtask {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		'task_id' in value &&
		'title' in value &&
		'completed' in value &&
		typeof (value as Subtask).completed === 'boolean'
	);
}

/**
 * Check if value is a valid TaskComment
 */
export function isTaskComment(value: unknown): value is TaskComment {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		'task_id' in value &&
		'user_id' in value &&
		'content' in value &&
		'mentions' in value &&
		Array.isArray((value as TaskComment).mentions)
	);
}

/**
 * Check if value is a valid TaskAttachment
 */
export function isTaskAttachment(value: unknown): value is TaskAttachment {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		'task_id' in value &&
		'file_name' in value &&
		'storage_url' in value
	);
}

/**
 * Check if value is a valid TaskNotification
 */
export function isTaskNotification(value: unknown): value is TaskNotification {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		'user_id' in value &&
		'task_id' in value &&
		'event_type' in value &&
		'read' in value &&
		typeof (value as TaskNotification).read === 'boolean'
	);
}

/**
 * Check if value is a valid CustomFieldDefinition
 */
export function isCustomFieldDefinition(value: unknown): value is CustomFieldDefinition {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		'team_id' in value &&
		'field_name' in value &&
		'field_type' in value
	);
}

/**
 * Check if value is a valid TaskLabel
 */
export function isTaskLabel(value: unknown): value is TaskLabel {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		'team_id' in value &&
		'name' in value &&
		'color' in value &&
		typeof (value as TaskLabel).color === 'string' &&
		/^#[0-9A-Fa-f]{6}$/.test((value as TaskLabel).color)
	);
}

/**
 * Check if value is a valid CurrencyValue
 */
export function isCurrencyValue(value: unknown): value is CurrencyValue {
	return (
		typeof value === 'object' &&
		value !== null &&
		'amount' in value &&
		'currency' in value &&
		typeof (value as CurrencyValue).amount === 'string' &&
		typeof (value as CurrencyValue).currency === 'string'
	);
}

/**
 * Calculate subtask completion percentage
 */
export function calculateSubtaskCompletion(subtasks: Subtask[]): {
	percentage: number;
	completed: number;
	total: number;
} {
	if (!subtasks || subtasks.length === 0) {
		return { percentage: 0, completed: 0, total: 0 };
	}

	const completed = subtasks.filter(s => s.completed).length;
	const total = subtasks.length;
	const percentage = Math.round((completed / total) * 100);

	return { percentage, completed, total };
}

/**
 * Parse custom field value from TEXT storage to typed value
 */
export function parseCustomFieldValue(
	field_type: CustomFieldType,
	value: string | null
): ParsedCustomFieldValue | null {
	if (value === null || value === '') {
		return null;
	}

	try {
		switch (field_type) {
			case 'text':
			case 'textarea':
			case 'url':
			case 'email':
				return { type: field_type, value };

			case 'number':
				const numValue = parseFloat(value);
				if (isNaN(numValue)) return null;
				return { type: 'number', value: numValue };

			case 'currency':
				const currencyData = JSON.parse(value);
				if (!isCurrencyValue(currencyData)) return null;
				return { type: 'currency', value: currencyData };

			case 'dropdown':
				return { type: 'dropdown', value };

			case 'multi-select':
				const arrayValue = JSON.parse(value);
				if (!Array.isArray(arrayValue)) return null;
				return { type: 'multi-select', value: arrayValue };

			case 'checkbox':
				return { type: 'checkbox', value: value === 'true' };

			case 'date':
				// Validate ISO 8601 date format
				const dateValue = value;
				if (!isValidISODate(dateValue)) return null;
				return { type: 'date', value: dateValue };

			default:
				return null;
		}
	} catch (error) {
		console.error('Error parsing custom field value:', error);
		return null;
	}
}

/**
 * Serialize typed custom field value to TEXT for storage
 */
export function serializeCustomFieldValue(
	field_type: CustomFieldType,
	value: any
): string | null {
	if (value === null || value === undefined) {
		return null;
	}

	try {
		switch (field_type) {
			case 'text':
			case 'textarea':
			case 'url':
			case 'email':
			case 'date':
				return String(value);

			case 'number':
				return String(value);

			case 'currency':
				if (!isCurrencyValue(value)) {
					throw new Error('Invalid currency value');
				}
				return JSON.stringify(value);

			case 'dropdown':
				return String(value);

			case 'multi-select':
				if (!Array.isArray(value)) {
					throw new Error('Invalid multi-select value');
				}
				return JSON.stringify(value);

			case 'checkbox':
				return String(Boolean(value));

			default:
				return null;
		}
	} catch (error) {
		console.error('Error serializing custom field value:', error);
		return null;
	}
}

/**
 * Check if string is valid ISO 8601 date
 */
export function isValidISODate(dateString: string): boolean {
	const date = new Date(dateString);
	return !isNaN(date.getTime()) && date.toISOString().startsWith(dateString.substring(0, 10));
}

/**
 * Calculate deadline urgency level
 */
export function calculateDeadlineUrgency(
	deadline: string,
	completed_at?: string
): { urgency: DeadlineUrgency; days_remaining: number } {
	if (completed_at) {
		return { urgency: 'safe', days_remaining: 0 };
	}

	const now = new Date();
	const deadlineDate = new Date(deadline);
	const diffMs = deadlineDate.getTime() - now.getTime();
	const days_remaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

	let urgency: DeadlineUrgency;
	if (days_remaining < 0) {
		urgency = 'overdue';
	} else if (days_remaining <= 1) {
		urgency = 'urgent';
	} else if (days_remaining <= 3) {
		urgency = 'approaching';
	} else {
		urgency = 'safe';
	}

	return { urgency, days_remaining };
}

/**
 * Determine streak status
 */
export function determineStreakStatus(stats: UserTaskStats): {
	status: StreakStatus;
	days_remaining_in_grace?: number;
} {
	if (!stats.last_task_completed_at) {
		return { status: 'broken' };
	}

	const now = new Date();
	const lastCompleted = new Date(stats.last_task_completed_at);
	const diffMs = now.getTime() - lastCompleted.getTime();
	const daysSinceLastTask = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	// Check if in grace period
	if (stats.streak_paused_at) {
		const pausedAt = new Date(stats.streak_paused_at);
		const daysSincePause = Math.floor((now.getTime() - pausedAt.getTime()) / (1000 * 60 * 60 * 24));

		if (daysSincePause <= 1) {
			// Still in 1-day grace period
			return { status: 'paused', days_remaining_in_grace: 1 - daysSincePause };
		} else {
			// Grace period expired
			return { status: 'broken' };
		}
	}

	// Check if streak should be active or paused
	if (daysSinceLastTask === 0) {
		return { status: 'active' };
	} else if (daysSinceLastTask === 1) {
		// First missed day - enter grace period
		return { status: 'paused', days_remaining_in_grace: 1 };
	} else {
		// More than 1 day missed
		return { status: 'broken' };
	}
}

/**
 * Extract @mentions from text
 */
export function extractMentions(text: string): string[] {
	const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
	const mentions: string[] = [];
	let match;

	while ((match = mentionRegex.exec(text)) !== null) {
		mentions.push(match[1]);
	}

	return mentions;
}

/**
 * Format currency value with symbol
 */
export function formatCurrencyValue(
	value: CurrencyValue,
	locale: string = 'en-US'
): string {
	const amount = parseFloat(value.amount);
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: value.currency,
	}).format(amount);
}

/**
 * Check if task is standalone (not linked to project/photoshoot/resource)
 */
export function isStandaloneTask(task: {
	project_id?: string | null;
	photoshoot_id?: string | null;
	resource_id?: string | null;
}): boolean {
	return !task.project_id && !task.photoshoot_id && !task.resource_id;
}

/**
 * Check if task is overdue
 */
export function isTaskOverdue(due_date?: string | null): boolean {
	if (!due_date) return false;
	const now = new Date();
	const dueDate = new Date(due_date);
	return dueDate < now;
}

/**
 * Check if task is due soon (within 3 days)
 */
export function isTaskDueSoon(due_date?: string | null): boolean {
	if (!due_date) return false;
	const now = new Date();
	const dueDate = new Date(due_date);
	const diffMs = dueDate.getTime() - now.getTime();
	const daysDiff = diffMs / (1000 * 60 * 60 * 24);
	return daysDiff > 0 && daysDiff <= 3;
}

/**
 * Sort tasks by priority (high > medium > low)
 */
export function sortByPriority<T extends { priority?: 'low' | 'medium' | 'high' }>(
	tasks: T[]
): T[] {
	const priorityOrder = { high: 3, medium: 2, low: 1 };
	return [...tasks].sort((a, b) => {
		const aPriority = a.priority || 'low';
		const bPriority = b.priority || 'low';
		return priorityOrder[bPriority] - priorityOrder[aPriority];
	});
}

/**
 * Group tasks by a field
 */
export function groupTasksBy<T extends Record<string, any>>(
	tasks: T[],
	field: keyof T
): Map<string, T[]> {
	const groups = new Map<string, T[]>();

	for (const task of tasks) {
		const key = String(task[field] || 'none');
		if (!groups.has(key)) {
			groups.set(key, []);
		}
		groups.get(key)!.push(task);
	}

	return groups;
}

/**
 * Filter tasks by criteria
 */
export function filterTasks<T extends {
	status_id?: string;
	priority?: 'low' | 'medium' | 'high';
	assigned_to?: string;
	project_id?: string;
	due_date?: string;
}>(
	tasks: T[],
	filters: {
		status_ids?: string[];
		priorities?: Array<'low' | 'medium' | 'high'>;
		assigned_to?: string[];
		project_ids?: string[];
		is_overdue?: boolean;
	}
): T[] {
	return tasks.filter(task => {
		if (filters.status_ids && task.status_id && !filters.status_ids.includes(task.status_id)) {
			return false;
		}
		if (filters.priorities && task.priority && !filters.priorities.includes(task.priority)) {
			return false;
		}
		if (filters.assigned_to && task.assigned_to && !filters.assigned_to.includes(task.assigned_to)) {
			return false;
		}
		if (filters.project_ids && task.project_id && !filters.project_ids.includes(task.project_id)) {
			return false;
		}
		if (filters.is_overdue !== undefined) {
			const overdue = isTaskOverdue(task.due_date);
			if (filters.is_overdue !== overdue) {
				return false;
			}
		}
		return true;
	});
}

