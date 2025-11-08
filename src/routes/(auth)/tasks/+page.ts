/**
 * Tasks Page Data Loader
 * 
 * Server-side data loading for the Tasks page.
 * Fetches initial task data, status options, and filter options.
 */

import { TaskService } from '$lib/services/task-service';
import { taskStageService } from '$lib/api/services/taskStageService';
import { customFieldService } from '$lib/api/services/customFieldService';
import { createSupabaseLoadClient } from '$lib/auth/supabase-client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
	// Get parent data (team info, user info)
	const parentData = await parent();

	// Initialize services with fetch for SSR
	const taskService = new TaskService();
	const supabase = createSupabaseLoadClient(fetch);

	try {
		// Fetch tasks for the current team (RLS handles team filtering)
		const tasksResult = await taskService.getTasks();

		// Get current user to find their teams
		const { data: { user } } = await supabase.auth.getUser();
		
		let statusOptions: Array<{ value: string; label: string; color?: string }> = [];
		
		if (user) {
			try {
				// Get user's first active team
				const { data: teamMembers } = await supabase
					.from('team_members')
					.select('team_id')
					.eq('user_id', user.id)
					.eq('status', 'active')
					.limit(1);

				const teamId = teamMembers && teamMembers.length > 0 ? teamMembers[0].team_id : null;
				
				if (teamId) {
					const stages = await taskStageService.ensureDefaults(teamId);
					// Sort: non-completion stages first, then completion stages
					// Completion stages always go last
					const sortedStages = [
						...stages.filter(s => !s.isCompletionStage).sort((a, b) => a.displayOrder - b.displayOrder),
						...stages.filter(s => s.isCompletionStage).sort((a, b) => a.displayOrder - b.displayOrder)
					];
					
					// Map to statusOptions format
					statusOptions = sortedStages.map(stage => ({
						value: stage.id,
						label: stage.name,
						color: stage.color || undefined
					}));
				}
			} catch (stageError) {
				console.error('Failed to load stages:', stageError);
				// Fallback to empty array
			}
		}

		// Fetch project options for filtering
		// TODO: Replace with actual project fetching
		const projectOptions: Array<{ value: string; label: string }> = [];

		// Fetch assignee options (team members)
		// TODO: Replace with actual team member fetching
		const assigneeOptions: Array<{ value: string; label: string; avatar?: string }> = [];

		// Fetch label options
		// TODO: Replace with actual label fetching when labels are implemented
		const labelOptions: Array<{ value: string; label: string; color: string }> = [];

		// Fetch custom field definitions for table view
		let customFields: any[] = [];
		if (user) {
			try {
				const { data: teamMembers } = await supabase
					.from('team_members')
					.select('team_id')
					.eq('user_id', user.id)
					.eq('status', 'active')
					.limit(1);

				const teamId = teamMembers && teamMembers.length > 0 ? teamMembers[0].team_id : null;
				
				if (teamId) {
					customFields = await customFieldService.listDefinitions(teamId);
				}
			} catch (customFieldError) {
				console.error('Failed to load custom fields:', customFieldError);
				// Fallback to empty array
			}
		}

		// Get completion stage IDs for progress calculation
		let completionStageIds: string[] = [];
		if (user) {
			try {
				const { data: teamMembers } = await supabase
					.from('team_members')
					.select('team_id')
					.eq('user_id', user.id)
					.eq('status', 'active')
					.limit(1);

				const teamId = teamMembers && teamMembers.length > 0 ? teamMembers[0].team_id : null;
				
				if (teamId) {
					const stages = await taskStageService.ensureDefaults(teamId);
					completionStageIds = stages.filter(s => s.isCompletionStage).map(s => s.id);
				}
			} catch (stageError) {
				console.error('Failed to load completion stages:', stageError);
			}
		}

		return {
			tasks: tasksResult.data || [],
			statusOptions,
			customFields,
			projectOptions,
			assigneeOptions,
			labelOptions,
			completionStageIds,
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
			completionStageIds: [],
		};
	}
};

