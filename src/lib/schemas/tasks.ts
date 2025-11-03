/**
 * Zod Validation Schemas for Task System
 * 
 * Runtime validation for task-related data to ensure type safety
 * and provide clear error messages for invalid inputs.
 */

import { z } from 'zod';

/**
 * Priority enum
 */
export const PrioritySchema = z.enum(['low', 'medium', 'high']);

/**
 * Task View Mode
 */
export const TaskViewModeSchema = z.enum(['list', 'board', 'calendar', 'timeline']);

/**
 * Task Group By
 */
export const TaskGroupBySchema = z.enum([
	'status',
	'priority',
	'assignee',
	'project',
	'due_date',
	'created_date',
	'label',
	'none',
]);

/**
 * Subtask Schemas
 */
export const SubtaskInsertSchema = z.object({
	task_id: z.string().uuid(),
	title: z.string().min(1).max(500),
	completed: z.boolean().default(false),
	display_order: z.number().int().min(0),
});

export const SubtaskUpdateSchema = z.object({
	title: z.string().min(1).max(500).optional(),
	completed: z.boolean().optional(),
	display_order: z.number().int().min(0).optional(),
	updated_at: z.string().datetime().optional(),
});

/**
 * Task Comment Schemas
 */
export const TaskCommentInsertSchema = z.object({
	task_id: z.string().uuid(),
	user_id: z.string().uuid(),
	content: z.string().min(1).max(10000),
	mentions: z.array(z.string().uuid()).default([]),
});

export const TaskCommentUpdateSchema = z.object({
	content: z.string().min(1).max(10000).optional(),
	mentions: z.array(z.string().uuid()).optional(),
});

/**
 * Task Attachment Schemas
 */
export const TaskAttachmentInsertSchema = z.object({
	task_id: z.string().uuid(),
	file_name: z.string().min(1).max(255),
	file_size: z.number().int().positive().max(25 * 1024 * 1024), // 25MB max
	mime_type: z.string().min(1).max(100),
	storage_url: z.string().url(),
	uploaded_by: z.string().uuid(),
});

/**
 * Task Notification Schemas
 */
export const TaskNotificationEventTypeSchema = z.enum([
	'task_assigned',
	'task_unassigned',
	'task_commented',
	'task_mentioned',
	'task_status_changed',
	'task_due_soon',
	'task_overdue',
]);

export const TaskNotificationInsertSchema = z.object({
	user_id: z.string().uuid(),
	task_id: z.string().uuid(),
	event_type: TaskNotificationEventTypeSchema,
	message: z.string().min(1).max(500),
	actor_user_id: z.string().uuid().optional(),
	metadata: z.record(z.any()).optional(),
});

export const TaskNotificationUpdateSchema = z.object({
	read: z.boolean(),
});

/**
 * Task Creation Schema
 */
export const CreateTaskRequestSchema = z.object({
	team_id: z.string().uuid(),
	title: z.string().min(1).max(500),
	description: z.string().max(5000).optional(),
	status_id: z.string().uuid(),
	priority: PrioritySchema.optional(),
	due_date: z.string().datetime().optional(),
	assigned_to: z.string().uuid().optional(),
	project_id: z.string().uuid().optional(),
	photoshoot_id: z.string().uuid().optional(),
	resource_id: z.string().uuid().optional(),
	subtasks: z.array(z.object({
		title: z.string().min(1).max(500),
		display_order: z.number().int().min(0),
	})).optional(),
});

/**
 * Task Update Schema
 */
export const UpdateTaskRequestSchema = z.object({
	title: z.string().min(1).max(500).optional(),
	description: z.string().max(5000).nullable().optional(),
	status_id: z.string().uuid().optional(),
	priority: PrioritySchema.optional(),
	due_date: z.string().datetime().nullable().optional(),
	assigned_to: z.string().uuid().nullable().optional(),
	project_id: z.string().uuid().nullable().optional(),
	photoshoot_id: z.string().uuid().nullable().optional(),
	resource_id: z.string().uuid().nullable().optional(),
});

/**
 * Task Filter Schema
 */
export const TaskFiltersSchema = z.object({
	status_ids: z.array(z.string().uuid()).optional(),
	priorities: z.array(PrioritySchema).optional(),
	assigned_to: z.array(z.string().uuid()).optional(),
	created_by: z.array(z.string().uuid()).optional(),
	project_ids: z.array(z.string().uuid()).optional(),
	photoshoot_ids: z.array(z.string().uuid()).optional(),
	resource_ids: z.array(z.string().uuid()).optional(),
	label_ids: z.array(z.string().uuid()).optional(),
	due_date_from: z.string().datetime().optional(),
	due_date_to: z.string().datetime().optional(),
	created_date_from: z.string().datetime().optional(),
	created_date_to: z.string().datetime().optional(),
	has_subtasks: z.boolean().optional(),
	is_standalone: z.boolean().optional(),
	search_query: z.string().max(200).optional(),
});

/**
 * Task Template Schemas
 */
export const TaskTemplateInsertSchema = z.object({
	team_id: z.string().uuid(),
	name: z.string().min(1).max(200),
	description: z.string().max(1000).optional(),
	default_stage_id: z.string().uuid().optional(),
	default_priority: PrioritySchema.optional(),
	subtasks: z.array(z.object({
		title: z.string().min(1).max(500),
		order: z.number().int().min(0),
	})),
	created_by: z.string().uuid(),
});

export const TaskTemplateUpdateSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	description: z.string().max(1000).nullable().optional(),
	default_stage_id: z.string().uuid().nullable().optional(),
	default_priority: PrioritySchema.nullable().optional(),
	subtasks: z.array(z.object({
		title: z.string().min(1).max(500),
		order: z.number().int().min(0),
	})).optional(),
});

/**
 * Saved Task View Schemas
 */
export const SavedTaskViewInsertSchema = z.object({
	user_id: z.string().uuid(),
	team_id: z.string().uuid(),
	name: z.string().min(1).max(200),
	filters: TaskFiltersSchema,
	grouping: TaskGroupBySchema.optional(),
	view_mode: TaskViewModeSchema.optional(),
	is_default: z.boolean().default(false),
});

export const SavedTaskViewUpdateSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	filters: TaskFiltersSchema.optional(),
	grouping: TaskGroupBySchema.nullable().optional(),
	view_mode: TaskViewModeSchema.nullable().optional(),
	is_default: z.boolean().optional(),
});

/**
 * Custom Field Schemas
 */
export const CustomFieldTypeSchema = z.enum([
	'text',
	'textarea',
	'number',
	'currency',
	'dropdown',
	'multi-select',
	'checkbox',
	'date',
	'url',
	'email',
]);

export const CustomFieldDefinitionInsertSchema = z.object({
	team_id: z.string().uuid(),
	field_name: z.string().min(1).max(100),
	field_type: CustomFieldTypeSchema,
	required: z.boolean().default(false),
	default_value: z.string().max(500).optional(),
	options: z.record(z.any()).optional(),
	display_order: z.number().int().min(0).default(0),
	show_on_card: z.boolean().default(false),
});

export const CustomFieldDefinitionUpdateSchema = z.object({
	field_name: z.string().min(1).max(100).optional(),
	field_type: CustomFieldTypeSchema.optional(),
	required: z.boolean().optional(),
	default_value: z.string().max(500).nullable().optional(),
	options: z.record(z.any()).optional(),
	display_order: z.number().int().min(0).optional(),
	show_on_card: z.boolean().optional(),
});

export const TaskCustomFieldValueInsertSchema = z.object({
	task_id: z.string().uuid(),
	field_definition_id: z.string().uuid(),
	value: z.string().max(5000),
});

export const TaskCustomFieldValueUpdateSchema = z.object({
	value: z.string().max(5000),
});

/**
 * Label Schemas
 */
export const TaskLabelInsertSchema = z.object({
	team_id: z.string().uuid(),
	name: z.string().min(1).max(50),
	color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format'),
	created_by: z.string().uuid(),
});

export const TaskLabelUpdateSchema = z.object({
	name: z.string().min(1).max(50).optional(),
	color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format').optional(),
});

export const TaskLabelAssignmentInsertSchema = z.object({
	task_id: z.string().uuid(),
	label_id: z.string().uuid(),
	assigned_by: z.string().uuid(),
});

/**
 * ADHD Feature Schemas
 */
export const TaskStageDeadlineInsertSchema = z.object({
	task_id: z.string().uuid(),
	stage_id: z.string().uuid(),
	deadline: z.string().datetime(),
});

export const TaskStageDeadlineUpdateSchema = z.object({
	deadline: z.string().datetime().optional(),
	completed_at: z.string().datetime().nullable().optional(),
});

export const UserTaskStatsInsertSchema = z.object({
	user_id: z.string().uuid(),
	team_id: z.string().uuid(),
	current_streak: z.number().int().min(0).default(0),
	best_streak: z.number().int().min(0).default(0),
	last_task_completed_at: z.string().datetime().optional(),
	streak_paused_at: z.string().datetime().optional(),
	tasks_completed_today: z.number().int().min(0).default(0),
	tasks_completed_total: z.number().int().min(0).default(0),
	celebration_animations_enabled: z.boolean().default(true),
});

export const UserTaskStatsUpdateSchema = z.object({
	current_streak: z.number().int().min(0).optional(),
	best_streak: z.number().int().min(0).optional(),
	last_task_completed_at: z.string().datetime().nullable().optional(),
	streak_paused_at: z.string().datetime().nullable().optional(),
	tasks_completed_today: z.number().int().min(0).optional(),
	tasks_completed_total: z.number().int().min(0).optional(),
	celebration_animations_enabled: z.boolean().optional(),
});

export const TaskBreakdownPatternInsertSchema = z.object({
	team_id: z.string().uuid(),
	keywords: z.array(z.string()).min(1),
	task_type: z.string().max(100).optional(),
	suggested_subtasks: z.array(z.object({
		title: z.string().min(1).max(500),
		order: z.number().int().min(0),
	})).min(1),
	times_offered: z.number().int().min(0).default(0),
	times_accepted: z.number().int().min(0).default(0),
	created_by: z.string().uuid().optional(),
});

export const TaskBreakdownPatternUpdateSchema = z.object({
	keywords: z.array(z.string()).min(1).optional(),
	task_type: z.string().max(100).nullable().optional(),
	suggested_subtasks: z.array(z.object({
		title: z.string().min(1).max(500),
		order: z.number().int().min(0),
	})).min(1).optional(),
	times_offered: z.number().int().min(0).optional(),
	times_accepted: z.number().int().min(0).optional(),
});

