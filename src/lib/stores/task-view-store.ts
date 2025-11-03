/**
 * Task View Store
 * 
 * Manages task view state (view mode, filters, grouping, sorting).
 * Persists to localStorage and URL query params for shareable views.
 */

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { TaskViewMode, TaskGroupBy, TaskFilters, TaskSortOption } from '$lib/types/tasks';

interface TaskViewState {
	viewMode: TaskViewMode;
	filters: TaskFilters;
	groupBy: TaskGroupBy;
	sortBy: TaskSortOption;
	savedViewId?: string;
}

const defaultState: TaskViewState = {
	viewMode: 'list',
	filters: {},
	groupBy: 'status',
	sortBy: { field: 'created_at', direction: 'desc' },
};

/**
 * Load state from localStorage
 */
function loadState(): TaskViewState {
	if (!browser) return defaultState;
	
	try {
		const stored = localStorage.getItem('task-view-state');
		if (stored) {
			return { ...defaultState, ...JSON.parse(stored) };
		}
	} catch (error) {
		console.error('Failed to load task view state:', error);
	}
	
	return defaultState;
}

/**
 * Save state to localStorage
 */
function saveState(state: TaskViewState): void {
	if (!browser) return;
	
	try {
		localStorage.setItem('task-view-state', JSON.stringify(state));
	} catch (error) {
		console.error('Failed to save task view state:', error);
	}
}

/**
 * Create task view store
 */
function createTaskViewStore() {
	const { subscribe, set, update } = writable<TaskViewState>(loadState());

	// Auto-save to localStorage on changes
	subscribe((state) => {
		saveState(state);
	});

	return {
		subscribe,
		
		/**
		 * Set view mode
		 */
		setViewMode: (mode: TaskViewMode) => {
			update(state => ({ ...state, viewMode: mode }));
		},
		
		/**
		 * Set filters
		 */
		setFilters: (filters: TaskFilters) => {
			update(state => ({ ...state, filters }));
		},
		
		/**
		 * Update filters (merge with existing)
		 */
		updateFilters: (partialFilters: Partial<TaskFilters>) => {
			update(state => ({
				...state,
				filters: { ...state.filters, ...partialFilters }
			}));
		},
		
		/**
		 * Clear all filters
		 */
		clearFilters: () => {
			update(state => ({ ...state, filters: {} }));
		},
		
		/**
		 * Set grouping
		 */
		setGroupBy: (groupBy: TaskGroupBy) => {
			update(state => ({ ...state, groupBy }));
		},
		
		/**
		 * Set sorting
		 */
		setSortBy: (sortBy: TaskSortOption) => {
			update(state => ({ ...state, sortBy }));
		},
		
		/**
		 * Load a saved view
		 */
		loadSavedView: (viewId: string, viewData: Partial<TaskViewState>) => {
			update(state => ({
				...state,
				...viewData,
				savedViewId: viewId,
			}));
		},
		
		/**
		 * Reset to default state
		 */
		reset: () => {
			set(defaultState);
		},
		
		/**
		 * Get current state (for saving views)
		 */
		getState: (): TaskViewState => {
			let currentState = defaultState;
			const unsubscribe = subscribe(state => { currentState = state; });
			unsubscribe();
			return currentState;
		},
	};
}

export const taskViewStore = createTaskViewStore();

/**
 * Derived store for active filter count
 */
export const activeFilterCount = derived(
	taskViewStore,
	$store => {
		const filters = $store.filters;
		let count = 0;
		
		if (filters.status_ids?.length) count++;
		if (filters.priorities?.length) count++;
		if (filters.assigned_to?.length) count++;
		if (filters.project_ids?.length) count++;
		if (filters.label_ids?.length) count++;
		if (filters.due_date_from || filters.due_date_to) count++;
		if (filters.is_standalone !== undefined) count++;
		if (filters.search_query) count++;
		
		return count;
	}
);

/**
 * Derived store for human-readable filter summary
 */
export const filterSummary = derived(
	taskViewStore,
	$store => {
		const filters = $store.filters;
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
		if (filters.due_date_from && filters.due_date_to) {
			parts.push('date range');
		} else if (filters.due_date_from) {
			parts.push('due after');
		} else if (filters.due_date_to) {
			parts.push('due before');
		}
		if (filters.is_standalone) {
			parts.push('standalone only');
		}
		if (filters.search_query) {
			parts.push(`search: "${filters.search_query}"`);
		}
		
		return parts.length > 0 ? parts.join(', ') : 'No filters';
	}
);

