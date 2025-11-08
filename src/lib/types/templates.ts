/**
 * Task Template Types
 * 
 * Defines types for reusable task templates and saved task views.
 * Templates allow users to quickly create tasks with predefined subtasks.
 * Saved views persist user filter preferences.
 */

import type { TaskFilters, TaskGroupBy, TaskViewMode } from './tasks';

/**
 * TaskTemplate - Reusable task pattern with default values
 */
export interface TaskTemplate {
	id: string;
	team_id: string;
	name: string;
	description?: string;
	default_stage_id?: string;
	default_priority?: 'low' | 'medium' | 'high';
	subtasks: TaskTemplateSubtask[]; // Stored as JSONB
	created_by: string;
	created_at: string;
	updated_at: string;
	// Relations
	creator?: {
		id: string;
		email: string;
		full_name?: string;
	};
}

/**
 * TaskTemplateSubtask - Subtask definition in template
 */
export interface TaskTemplateSubtask {
	title: string;
	order: number;
}

export type TaskTemplateInsert = Omit<TaskTemplate, 'id' | 'created_at' | 'updated_at' | 'creator'>;
export type TaskTemplateUpdate = Partial<Omit<TaskTemplate, 'id' | 'team_id' | 'created_by' | 'created_at' | 'creator'>>;

/**
 * SavedTaskView - User-defined filter and view configuration
 */
export interface SavedTaskView {
	id: string;
	user_id: string;
	team_id: string;
	name: string;
	filters: TaskFilters; // Stored as JSONB
	grouping?: TaskGroupBy;
	view_mode?: TaskViewMode;
	is_default?: boolean; // If true, this view loads on page open
	created_at: string;
	updated_at: string;
}

export type SavedTaskViewInsert = Omit<SavedTaskView, 'id' | 'created_at' | 'updated_at'>;
export type SavedTaskViewUpdate = Partial<Omit<SavedTaskView, 'id' | 'user_id' | 'team_id' | 'created_at'>>;

/**
 * Template Application Request
 */
export interface ApplyTemplateRequest {
	template_id: string;
	title: string; // Override template name with specific task title
	team_id: string;
	project_id?: string;
	assigned_to?: string;
	due_date?: string;
	// Can override template defaults
	priority?: 'low' | 'medium' | 'high';
	status_id?: string;
}

/**
 * Template Category (for UI organization)
 */
export type TemplateCategory =
	| 'costume_creation'
	| 'prop_building'
	| 'photoshoot_planning'
	| 'convention_prep'
	| 'material_sourcing'
	| 'general';

/**
 * Template with Metadata (for display in template selector)
 */
export interface TemplateWithMeta extends TaskTemplate {
	category?: TemplateCategory;
	usage_count?: number; // How many times this template has been used
	last_used_at?: string;
}

