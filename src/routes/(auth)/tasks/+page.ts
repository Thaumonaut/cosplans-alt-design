/**
 * Tasks Page Data Loader
 * 
 * Server-side data loading for the Tasks page.
 * Fetches initial task data, status options, and filter options.
 */

import { TaskService } from '$lib/services/task-service';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
	// Get parent data (team info, user info)
	const parentData = await parent();

	// Initialize services with fetch for SSR
	const taskService = new TaskService();

	try {
		// Fetch tasks for the current team
		const tasksResult = await taskService.getTasks();

		// Fetch status options (task stages)
		// TODO: Replace with actual status/stage fetching when available
		const statusOptions = [
			{ value: '1', label: 'To Do', color: '#6B7280' },
			{ value: '2', label: 'In Progress', color: '#3B82F6' },
			{ value: '3', label: 'In Review', color: '#F59E0B' },
			{ value: '4', label: 'Done', color: '#10B981' },
		];

		// Fetch project options for filtering
		// TODO: Replace with actual project fetching
		const projectOptions: Array<{ value: string; label: string }> = [];

		// Fetch assignee options (team members)
		// TODO: Replace with actual team member fetching
		const assigneeOptions: Array<{ value: string; label: string; avatar?: string }> = [];

		// Fetch label options
		// TODO: Replace with actual label fetching when labels are implemented
		const labelOptions: Array<{ value: string; label: string; color: string }> = [];

		return {
			tasks: tasksResult.data || [],
			statusOptions,
			projectOptions,
			assigneeOptions,
			labelOptions,
		};
	} catch (error) {
		console.error('Failed to load tasks:', error);

		// Return empty state on error
		return {
			tasks: [],
			statusOptions: [],
			projectOptions: [],
			assigneeOptions: [],
			labelOptions: [],
		};
	}
};

