/**
 * Task Label Types
 * 
 * Defines types for color-coded flexible task categorization.
 * Labels are team-scoped and can be applied to multiple tasks.
 */

/**
 * TaskLabel - Color-coded category tag
 */
export interface TaskLabel {
	id: string;
	team_id: string;
	name: string;
	color: string; // Hex color code (e.g., "#FF6B6B")
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

export type TaskLabelInsert = Omit<TaskLabel, 'id' | 'created_at' | 'updated_at' | 'creator'>;
export type TaskLabelUpdate = Partial<Omit<TaskLabel, 'id' | 'team_id' | 'created_by' | 'created_at' | 'creator'>>;

/**
 * TaskLabelAssignment - Many-to-many relationship between tasks and labels
 */
export interface TaskLabelAssignment {
	id: string;
	task_id: string;
	label_id: string;
	assigned_by: string;
	assigned_at: string;
	// Relations
	label?: TaskLabel;
	assigner?: {
		id: string;
		email: string;
		full_name?: string;
	};
}

export type TaskLabelAssignmentInsert = Omit<TaskLabelAssignment, 'id' | 'assigned_at' | 'label' | 'assigner'>;

/**
 * Task with Labels (for display)
 */
export interface TaskWithLabels {
	task_id: string;
	labels: TaskLabel[];
}

/**
 * Predefined Label Color Palette
 */
export interface LabelColorOption {
	name: string;
	hex: string;
	description: string;
}

export const LABEL_COLOR_PALETTE: LabelColorOption[] = [
	{ name: 'Red', hex: '#EF4444', description: 'Urgent, critical' },
	{ name: 'Orange', hex: '#F59E0B', description: 'Warning, attention needed' },
	{ name: 'Yellow', hex: '#EAB308', description: 'Pending, in review' },
	{ name: 'Green', hex: '#10B981', description: 'Complete, approved' },
	{ name: 'Blue', hex: '#3B82F6', description: 'Information, documentation' },
	{ name: 'Purple', hex: '#8B5CF6', description: 'Planning, design' },
	{ name: 'Pink', hex: '#EC4899', description: 'Creative, artistic' },
	{ name: 'Gray', hex: '#6B7280', description: 'Neutral, administrative' },
];

/**
 * Label Usage Statistics
 */
export interface LabelStats {
	label_id: string;
	label_name: string;
	color: string;
	task_count: number;
	recent_usage: string; // ISO timestamp of last use
}

/**
 * Label Validation
 */
export interface LabelValidation {
	is_valid: boolean;
	errors: string[];
}

/**
 * Label Filter Options
 */
export interface LabelFilterOptions {
	label_ids: string[];
	match_mode: 'any' | 'all'; // OR vs AND logic
}

