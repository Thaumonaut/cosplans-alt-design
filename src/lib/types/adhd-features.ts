/**
 * ADHD-Friendly Feature Types
 * 
 * Defines types for neurodivergent-friendly task management features:
 * - Stage-level deadlines (milestone tracking)
 * - User task statistics (streaks, completion tracking)
 * - Task breakdown patterns (learning system for subtask suggestions)
 */

/**
 * TaskStageDeadline - Milestone deadlines for individual workflow stages
 */
export interface TaskStageDeadline {
	id: string;
	task_id: string;
	stage_id: string;
	deadline: string; // ISO timestamp
	completed_at?: string; // ISO timestamp, null if not yet reached this stage
	created_at: string;
	updated_at: string;
	// Relations
	stage?: {
		id: string;
		name: string;
		color?: string;
	};
}

export type TaskStageDeadlineInsert = Omit<TaskStageDeadline, 'id' | 'completed_at' | 'created_at' | 'updated_at' | 'stage'>;
export type TaskStageDeadlineUpdate = Partial<Omit<TaskStageDeadline, 'id' | 'task_id' | 'stage_id' | 'created_at' | 'stage'>>;

/**
 * Stage Deadline Urgency Level (for color-coding)
 */
export type DeadlineUrgency = 'safe' | 'approaching' | 'urgent' | 'overdue';

/**
 * Stage Deadline with Urgency
 */
export interface StageDeadlineWithUrgency extends TaskStageDeadline {
	urgency: DeadlineUrgency;
	days_remaining: number;
}

/**
 * UserTaskStats - Task completion statistics and preferences
 */
export interface UserTaskStats {
	id: string;
	user_id: string;
	team_id: string;
	current_streak: number; // Consecutive days with completed tasks
	best_streak: number; // All-time best streak
	last_task_completed_at?: string; // ISO timestamp
	streak_paused_at?: string; // ISO timestamp when 1-day grace period started
	tasks_completed_today: number;
	tasks_completed_total: number;
	celebration_animations_enabled: boolean; // User preference
	created_at: string;
	updated_at: string;
}

export type UserTaskStatsInsert = Omit<UserTaskStats, 'id' | 'created_at' | 'updated_at'>;
export type UserTaskStatsUpdate = Partial<Omit<UserTaskStats, 'id' | 'user_id' | 'team_id' | 'created_at'>>;

/**
 * Streak Status
 */
export type StreakStatus = 'active' | 'paused' | 'broken';

/**
 * Streak Display Info
 */
export interface StreakInfo {
	current_streak: number;
	best_streak: number;
	status: StreakStatus;
	message: string; // Display message (e.g., "🔥 5 day streak!" or "🔥 5 day streak (paused)")
	days_remaining_in_grace?: number; // If paused, days left to restore
}

/**
 * Daily Progress Info
 */
export interface DailyProgress {
	completed: number;
	total: number;
	percentage: number; // 0-100
	message: string; // e.g., "3/8 tasks complete today"
}

/**
 * Task Suggestion Reason
 */
export type SuggestionReason =
	| 'due_soon'
	| 'high_priority'
	| 'blocks_others'
	| 'quick_win'
	| 'longest_waiting'
	| 'assigned_to_you';

/**
 * Task Suggestion (for "What should I do now?")
 */
export interface TaskSuggestion {
	task_id: string;
	task_title: string;
	score: number; // 0-100, higher = more important
	reasons: Array<{
		type: SuggestionReason;
		weight: number;
		description: string; // Human-readable explanation
	}>;
	estimated_effort?: number; // Minutes (if available)
	due_date?: string;
	priority?: 'low' | 'medium' | 'high';
}

/**
 * TaskBreakdownPattern - Learned patterns for task breakdown suggestions
 */
export interface TaskBreakdownPattern {
	id: string;
	team_id: string;
	keywords: string[]; // Normalized keywords for matching
	task_type?: string; // Optional category (Costume, Prop, Photoshoot, etc.)
	suggested_subtasks: BreakdownSubtask[]; // Stored as JSONB
	times_offered: number;
	times_accepted: number;
	acceptance_rate: number; // Computed: times_accepted / times_offered * 100
	is_low_quality: boolean; // Computed: acceptance_rate < 20% after 10+ offers
	created_by?: string;
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
 * Breakdown Subtask (stored in pattern)
 */
export interface BreakdownSubtask {
	title: string;
	order: number;
}

export type TaskBreakdownPatternInsert = Omit<TaskBreakdownPattern, 'id' | 'acceptance_rate' | 'is_low_quality' | 'created_at' | 'updated_at' | 'creator'>;
export type TaskBreakdownPatternUpdate = Partial<Omit<TaskBreakdownPattern, 'id' | 'team_id' | 'acceptance_rate' | 'is_low_quality' | 'created_at' | 'creator'>>;

/**
 * Task Type Categories (for pattern matching)
 */
export type TaskType =
	| 'Costume Creation'
	| 'Prop Building'
	| 'Photoshoot Planning'
	| 'Convention Prep'
	| 'Material Sourcing'
	| 'General';

/**
 * Breakdown Suggestion Response
 */
export interface BreakdownSuggestion {
	pattern_id: string;
	task_type?: TaskType;
	confidence: number; // 0-100, how well keywords matched
	subtasks: BreakdownSubtask[];
	reasoning: string; // Explanation of why this pattern was suggested
}

/**
 * Breakdown Acceptance Tracking
 */
export interface BreakdownAcceptance {
	pattern_id: string;
	user_id: string;
	accepted: boolean;
	task_id: string;
	timestamp: string;
}

/**
 * User Breakdown Dismissal (prevents repeated prompting)
 */
export interface UserBreakdownDismissal {
	user_id: string;
	pattern_id: string;
	dismissed_count: number;
	last_dismissed_at: string;
}

/**
 * Focus Mode State
 */
export interface FocusModeState {
	active: boolean;
	task_id?: string;
	started_at?: string;
}

/**
 * Celebration Animation Type
 */
export type CelebrationAnimationType = 'confetti' | 'checkmark' | 'none';

/**
 * Celebration Message
 */
export interface CelebrationMessage {
	type: CelebrationAnimationType;
	message: string;
	emoji?: string;
}

/**
 * Gentle Prompt
 */
export interface GentlePrompt {
	type: 'daily_no_tasks' | 'task_suggestion' | 'break_reminder';
	message: string;
	suggested_task_id?: string;
	dismissible: boolean;
}

