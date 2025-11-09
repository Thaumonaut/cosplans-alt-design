/**
 * Core Task Types
 * 
 * Defines types for subtasks, comments, attachments, notifications, and detailed task views.
 * These types extend the existing task system with rich collaboration features.
 */

import type { Database } from './supabase';

// Database table types from Supabase (for future use)
// type Tables = Database['public']['Tables'];

/**
 * Subtask - Nested checklist items within a task
 */
export interface Subtask {
	id: string;
	task_id: string;
	title: string;
	completed: boolean;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export type SubtaskInsert = Omit<Subtask, 'id' | 'created_at' | 'updated_at'>;
export type SubtaskUpdate = Partial<Omit<Subtask, 'id' | 'task_id' | 'created_at'>>;

/**
 * TaskComment - Comments on tasks with @mentions support
 */
export interface TaskComment {
	id: string;
	task_id: string;
	user_id: string;
	content: string;
	mentions: string[]; // Array of user IDs mentioned in comment
	deleted: boolean; // Soft delete flag
	created_at: string;
	updated_at: string;
	// Relations (loaded separately)
	user?: {
		id: string;
		email: string;
		full_name?: string;
		avatar_url?: string;
	};
}

export type TaskCommentInsert = Omit<TaskComment, 'id' | 'deleted' | 'created_at' | 'updated_at' | 'user'>;
export type TaskCommentUpdate = Partial<Pick<TaskComment, 'content' | 'mentions'>>;

/**
 * TaskAttachment - Files attached to tasks
 */
export interface TaskAttachment {
	id: string;
	task_id: string;
	file_name: string;
	file_size: number;
	mime_type: string;
	storage_url: string; // Cloudflare R2 URL
	uploaded_by: string;
	created_at: string;
	// Relations
	uploader?: {
		id: string;
		email: string;
		full_name?: string;
	};
}

export type TaskAttachmentInsert = Omit<TaskAttachment, 'id' | 'created_at' | 'uploader'>;

/**
 * Task Notification Event Types
 */
export type TaskNotificationEventType =
	| 'task_assigned'
	| 'task_unassigned'
	| 'task_commented'
	| 'task_mentioned'
	| 'task_status_changed'
	| 'task_due_soon'
	| 'task_overdue';

/**
 * TaskNotification - In-app and email notifications for task events
 */
export interface TaskNotification {
	id: string;
	user_id: string; // Recipient
	task_id: string;
	event_type: TaskNotificationEventType;
	message: string;
	read: boolean;
	actor_user_id?: string; // User who triggered the notification
	metadata?: Record<string, any>; // Additional context (JSON)
	created_at: string;
	// Relations
	task?: {
		id: string;
		title: string;
	};
	actor?: {
		id: string;
		email: string;
		full_name?: string;
		avatar_url?: string;
	};
}

export type TaskNotificationInsert = Omit<TaskNotification, 'id' | 'read' | 'created_at' | 'task' | 'actor'>;
export type TaskNotificationUpdate = Pick<TaskNotification, 'read'>;

/**
 * TaskDetail - Comprehensive task view with all relations loaded
 * This is the main type used in task detail panels
 */
export interface TaskDetail {
	// Core task fields (from existing tasks table)
	id: string;
	team_id: string;
	title: string;
	description?: string;
	status_id: string;
	priority: 'low' | 'medium' | 'high';
	due_date?: string;
	assigned_to?: string;
	created_by: string;
	project_id?: string;
	photoshoot_id?: string;
	resource_id?: string;
	created_at: string;
	updated_at: string;
	// Rich relations
	subtasks?: Subtask[];
	comments?: TaskComment[];
	attachments?: TaskAttachment[];
	notifications?: TaskNotification[];
	customFieldValues?: any[]; // Defined in custom-fields.ts
	labels?: any[]; // Defined in labels.ts
	stageDeadlines?: any[]; // Defined in adhd-features.ts
	// Metadata
	subtask_completion_percentage?: number; // Calculated: completed / total
	total_subtasks?: number;
	completed_subtasks?: number;
}

/**
 * Task Activity Log Entry
 * Represents a single change in task history
 */
export interface TaskActivity {
	id: string;
	task_id: string;
	user_id: string;
	action: string; // e.g., "status_changed", "assigned", "comment_added"
	old_value?: string;
	new_value?: string;
	metadata?: Record<string, any>;
	created_at: string;
	// Relations
	user?: {
		id: string;
		email: string;
		full_name?: string;
		avatar_url?: string;
	};
}

/**
 * Task Creation Request
 */
export interface CreateTaskRequest {
	team_id: string;
	title: string;
	description?: string;
	status_id: string;
	priority?: 'low' | 'medium' | 'high';
	due_date?: string;
	assigned_to?: string;
	project_id?: string;
	photoshoot_id?: string;
	resource_id?: string;
	// Initial subtasks (optional)
	subtasks?: Array<{
		title: string;
		display_order: number;
	}>;
}

/**
 * Task Update Request
 */
export interface UpdateTaskRequest {
	title?: string;
	description?: string;
	status_id?: string;
	priority?: 'low' | 'medium' | 'high';
	due_date?: string | null;
	assigned_to?: string | null;
	project_id?: string | null;
	photoshoot_id?: string | null;
	resource_id?: string | null;
}

/**
 * Task Filter Criteria
 */
export interface TaskFilters {
	status_ids?: string[];
	priorities?: Array<'low' | 'medium' | 'high'>;
	assigned_to?: string[];
	created_by?: string[];
	project_ids?: string[];
	photoshoot_ids?: string[];
	resource_ids?: string[];
	label_ids?: string[];
	due_date_from?: string;
	due_date_to?: string;
	created_date_from?: string;
	created_date_to?: string;
	has_subtasks?: boolean;
	is_standalone?: boolean; // Tasks not linked to project/photoshoot/resource
	search_query?: string; // Full-text search
}

/**
 * Task Grouping Options
 */
export type TaskGroupBy =
	| 'status'
	| 'priority'
	| 'assignee'
	| 'project'
	| 'due_date'
	| 'created_date'
	| 'label'
	| 'none';

/**
 * Task View Modes
 */
export type TaskViewMode = 'list' | 'board' | 'table' | 'calendar' | 'timeline';

/**
 * Task Sort Options
 */
export interface TaskSortOption {
	field: 'title' | 'due_date' | 'created_at' | 'updated_at' | 'priority' | 'status';
	direction: 'asc' | 'desc';
}

