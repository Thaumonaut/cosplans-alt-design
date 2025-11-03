<script lang="ts">
	/**
	 * TaskFilterPanel Component
	 * 
	 * Advanced filtering UI for tasks with multi-criteria selection.
	 * Shows active filters, clear all, and save view functionality.
	 */
	import { createEventDispatcher } from 'svelte';
	import type { TaskFilters } from '$lib/types/tasks';

	export let filters: TaskFilters = {};
	export let open: boolean = false;
	
	// Options (passed from parent)
	export let statusOptions: Array<{ value: string; label: string; color?: string }> = [];
	export let projectOptions: Array<{ value: string; label: string }> = [];
	export let assigneeOptions: Array<{ value: string; label: string; avatar?: string }> = [];
	export let labelOptions: Array<{ value: string; label: string; color: string }> = [];
	
	const dispatch = createEventDispatcher<{
		change: TaskFilters;
		clear: void;
		save: void;
	}>();

	const priorityOptions = [
		{ value: 'high', label: 'High' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'low', label: 'Low' },
	];

	// Local state for building filters
	let selectedStatuses = $state<string[]>(filters.status_ids || []);
	let selectedPriorities = $state<string[]>(filters.priorities || []);
	let selectedProjects = $state<string[]>(filters.project_ids || []);
	let selectedAssignees = $state<string[]>(filters.assigned_to || []);
	let selectedLabels = $state<string[]>(filters.label_ids || []);
	let dueDateFrom = $state<string>(filters.due_date_from || '');
	let dueDateTo = $state<string>(filters.due_date_to || '');
	let standaloneOnly = $state<boolean>(filters.is_standalone || false);
	let searchQuery = $state<string>(filters.search_query || '');

	function toggleMultiSelect(array: string[], value: string) {
		const index = array.indexOf(value);
		if (index > -1) {
			array.splice(index, 1);
		} else {
			array.push(value);
		}
	}

	function applyFilters() {
		const newFilters: TaskFilters = {};
		
		if (selectedStatuses.length > 0) newFilters.status_ids = selectedStatuses;
		if (selectedPriorities.length > 0) newFilters.priorities = selectedPriorities as any;
		if (selectedProjects.length > 0) newFilters.project_ids = selectedProjects;
		if (selectedAssignees.length > 0) newFilters.assigned_to = selectedAssignees;
		if (selectedLabels.length > 0) newFilters.label_ids = selectedLabels;
		if (dueDateFrom) newFilters.due_date_from = dueDateFrom;
		if (dueDateTo) newFilters.due_date_to = dueDateTo;
		if (standaloneOnly) newFilters.is_standalone = true;
		if (searchQuery) newFilters.search_query = searchQuery;
		
		dispatch('change', newFilters);
	}

	function clearAllFilters() {
		selectedStatuses = [];
		selectedPriorities = [];
		selectedProjects = [];
		selectedAssignees = [];
		selectedLabels = [];
		dueDateFrom = '';
		dueDateTo = '';
		standaloneOnly = false;
		searchQuery = '';
		
		dispatch('clear');
	}

	function handleSaveView() {
		dispatch('save');
	}

	const activeFilterCount = $derived(
		selectedStatuses.length +
		selectedPriorities.length +
		selectedProjects.length +
		selectedAssignees.length +
		selectedLabels.length +
		(dueDateFrom ? 1 : 0) +
		(dueDateTo ? 1 : 0) +
		(standaloneOnly ? 1 : 0) +
		(searchQuery ? 1 : 0)
	);
</script>

{#if open}
	<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 space-y-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
			<div class="flex items-center gap-2">
				{#if activeFilterCount > 0}
					<span class="text-sm text-gray-600 dark:text-gray-400">
						{activeFilterCount} active
					</span>
					<button
						type="button"
						on:click={clearAllFilters}
						class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
					>
						Clear all
					</button>
				{/if}
			</div>
		</div>

		<!-- Search -->
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
				Search
			</label>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search tasks by title..."
				class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<!-- Status -->
		{#if statusOptions.length > 0}
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Status ({selectedStatuses.length})
				</label>
				<div class="flex flex-wrap gap-2">
					{#each statusOptions as status}
						<button
							type="button"
							on:click={() => toggleMultiSelect(selectedStatuses, status.value)}
							class="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors {selectedStatuses.includes(status.value)
								? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
								: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}"
						>
							{#if status.color}
								<span class="w-2 h-2 rounded-full" style="background-color: {status.color}" />
							{/if}
							{status.label}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Priority -->
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
				Priority ({selectedPriorities.length})
			</label>
			<div class="flex flex-wrap gap-2">
				{#each priorityOptions as priority}
					<button
						type="button"
						on:click={() => toggleMultiSelect(selectedPriorities, priority.value)}
						class="inline-flex items-center px-3 py-1.5 text-sm rounded-lg border transition-colors {selectedPriorities.includes(priority.value)
							? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
							: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}"
					>
						{priority.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Projects -->
		{#if projectOptions.length > 0}
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Projects ({selectedProjects.length})
				</label>
				<div class="max-h-40 overflow-y-auto space-y-2">
					{#each projectOptions as project}
						<label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
							<input
								type="checkbox"
								checked={selectedProjects.includes(project.value)}
								on:change={() => toggleMultiSelect(selectedProjects, project.value)}
								class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
							/>
							<span class="text-sm text-gray-700 dark:text-gray-300">{project.label}</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Assignees -->
		{#if assigneeOptions.length > 0}
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Assigned to ({selectedAssignees.length})
				</label>
				<div class="max-h-40 overflow-y-auto space-y-2">
					{#each assigneeOptions as assignee}
						<label class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
							<input
								type="checkbox"
								checked={selectedAssignees.includes(assignee.value)}
								on:change={() => toggleMultiSelect(selectedAssignees, assignee.value)}
								class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
							/>
							{#if assignee.avatar}
								<img src={assignee.avatar} alt={assignee.label} class="w-6 h-6 rounded-full" />
							{:else}
								<div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
									{assignee.label[0].toUpperCase()}
								</div>
							{/if}
							<span class="text-sm text-gray-700 dark:text-gray-300">{assignee.label}</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Labels -->
		{#if labelOptions.length > 0}
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Labels ({selectedLabels.length})
				</label>
				<div class="flex flex-wrap gap-2">
					{#each labelOptions as label}
						<button
							type="button"
							on:click={() => toggleMultiSelect(selectedLabels, label.value)}
							class="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors {selectedLabels.includes(label.value)
								? 'ring-2 ring-offset-2'
								: 'hover:scale-105'}"
							style="background-color: {label.color}20; border-color: {label.color}; color: {label.color}; {selectedLabels.includes(label.value) ? `ring-color: ${label.color}` : ''}"
						>
							{label.label}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Due Date Range -->
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
				Due Date Range
			</label>
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">From</label>
					<input
						type="date"
						bind:value={dueDateFrom}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div>
					<label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">To</label>
					<input
						type="date"
						bind:value={dueDateTo}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>
		</div>

		<!-- Standalone Tasks -->
		<div>
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={standaloneOnly}
					class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
				/>
				<span class="text-sm text-gray-700 dark:text-gray-300">
					Show only standalone tasks (not linked to projects)
				</span>
			</label>
		</div>

		<!-- Actions -->
		<div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
			<button
				type="button"
				on:click={handleSaveView}
				class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
			>
				Save as view
			</button>
			<button
				type="button"
				on:click={applyFilters}
				class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
			>
				Apply Filters
			</button>
		</div>
	</div>
{/if}

