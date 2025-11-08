<script lang="ts">
	/**
	 * TaskFilterPanel Component
	 * 
	 * Advanced filtering UI for tasks with multi-criteria selection.
	 * Shows active filters, clear all, and save view functionality.
	 */
	import { createEventDispatcher } from 'svelte';
	import type { TaskFilters } from '$lib/types/tasks';

	interface Props {
		filters?: TaskFilters;
		open?: boolean;
		// Options (passed from parent)
		statusOptions?: Array<{ value: string; label: string; color?: string }>;
		projectOptions?: Array<{ value: string; label: string }>;
		assigneeOptions?: Array<{ value: string; label: string; avatar?: string }>;
		labelOptions?: Array<{ value: string; label: string; color: string }>;
	}

	let {
		filters = {},
		open = $bindable(false),
		statusOptions = [],
		projectOptions = [],
		assigneeOptions = [],
		labelOptions = []
	}: Props = $props();
	
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

<!-- Content only - wrapper is handled by parent -->
<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold" style="color: var(--theme-foreground, #1c1917);">Filters</h3>
			<div class="flex items-center gap-2">
				{#if activeFilterCount > 0}
					<span class="text-sm" style="color: var(--theme-text-muted, #78716c);">
						{activeFilterCount} active
					</span>
					<button
						type="button"
						onclick={clearAllFilters}
						class="text-sm hover:underline"
						style="color: var(--theme-primary, #8b5cf6);"
					>
						Clear all
					</button>
				{/if}
			</div>
		</div>

		<!-- Search -->
		<div>
			<label class="block text-sm font-medium mb-2" style="color: var(--theme-foreground, #1c1917);">
				Search
			</label>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search tasks by title..."
				style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); background-color: var(--theme-input-bg, white); color: var(--theme-foreground, #1c1917); --tw-ring-color: var(--theme-primary, #8b5cf6);"
				class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
			/>
		</div>

		<!-- Status -->
		{#if statusOptions.length > 0}
			<div>
				<label class="block text-sm font-medium mb-2" style="color: var(--theme-foreground, #1c1917);">
					Status ({selectedStatuses.length})
				</label>
				<div class="flex flex-wrap gap-2">
					{#each statusOptions as status}
						<button
							type="button"
							onclick={() => toggleMultiSelect(selectedStatuses, status.value)}
							class="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors"
							style={selectedStatuses.includes(status.value)
								? 'background-color: rgba(139, 92, 246, 0.1); border-color: var(--theme-primary, #8b5cf6); color: var(--theme-primary, #8b5cf6);'
								: 'background-color: var(--theme-card-bg, white); border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); color: var(--theme-foreground, #1c1917);'}
							onmouseenter={(e) => {
								if (!selectedStatuses.includes(status.value)) {
									e.currentTarget.style.backgroundColor = 'var(--theme-hover, rgba(237, 233, 254, 0.6))';
								}
							}}
							onmouseleave={(e) => {
								if (!selectedStatuses.includes(status.value)) {
									e.currentTarget.style.backgroundColor = 'var(--theme-card-bg, white)';
								}
							}}
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
			<label class="block text-sm font-medium mb-2" style="color: var(--theme-foreground, #1c1917);">
				Priority ({selectedPriorities.length})
			</label>
			<div class="flex flex-wrap gap-2">
				{#each priorityOptions as priority}
					<button
						type="button"
						onclick={() => toggleMultiSelect(selectedPriorities, priority.value)}
						class="inline-flex items-center px-3 py-1.5 text-sm rounded-lg border transition-colors"
						style={selectedPriorities.includes(priority.value)
							? 'background-color: rgba(139, 92, 246, 0.1); border-color: var(--theme-primary, #8b5cf6); color: var(--theme-primary, #8b5cf6);'
							: 'background-color: var(--theme-card-bg, white); border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); color: var(--theme-foreground, #1c1917);'}
						onmouseenter={(e) => {
							if (!selectedPriorities.includes(priority.value)) {
								e.currentTarget.style.backgroundColor = 'var(--theme-hover, rgba(237, 233, 254, 0.6))';
							}
						}}
						onmouseleave={(e) => {
							if (!selectedPriorities.includes(priority.value)) {
								e.currentTarget.style.backgroundColor = 'var(--theme-card-bg, white)';
							}
						}}
					>
						{priority.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Projects -->
		{#if projectOptions.length > 0}
			<div>
				<label class="block text-sm font-medium mb-2" style="color: var(--theme-foreground, #1c1917);">
					Projects ({selectedProjects.length})
				</label>
				<div class="max-h-40 overflow-y-auto space-y-2">
					{#each projectOptions as project}
						<label class="flex items-center gap-2 cursor-pointer p-2 rounded transition-colors" style="--hover-bg: var(--theme-hover, rgba(237, 233, 254, 0.6));" onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-hover, rgba(237, 233, 254, 0.6))'} onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
							<input
								type="checkbox"
								checked={selectedProjects.includes(project.value)}
								onchange={() => toggleMultiSelect(selectedProjects, project.value)}
								style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); color: var(--theme-primary, #8b5cf6); --tw-ring-color: var(--theme-primary, #8b5cf6);"
								class="rounded focus:ring-1"
							/>
							<span class="text-sm" style="color: var(--theme-foreground, #1c1917);">{project.label}</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Assignees -->
		{#if assigneeOptions.length > 0}
			<div>
				<label class="block text-sm font-medium mb-2" style="color: var(--theme-foreground, #1c1917);">
					Assigned to ({selectedAssignees.length})
				</label>
				<div class="max-h-40 overflow-y-auto space-y-2">
					{#each assigneeOptions as assignee}
						<label class="flex items-center gap-2 cursor-pointer p-2 rounded transition-colors" onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-hover, rgba(237, 233, 254, 0.6))'} onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
							<input
								type="checkbox"
								checked={selectedAssignees.includes(assignee.value)}
								onchange={() => toggleMultiSelect(selectedAssignees, assignee.value)}
								style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); color: var(--theme-primary, #8b5cf6); --tw-ring-color: var(--theme-primary, #8b5cf6);"
								class="rounded focus:ring-1"
							/>
							{#if assignee.avatar}
								<img src={assignee.avatar} alt={assignee.label} class="w-6 h-6 rounded-full" />
							{:else}
								<div class="w-6 h-6 rounded-full flex items-center justify-center text-xs" style="background-color: var(--theme-primary); color: var(--theme-card-bg);">
									{assignee.label[0].toUpperCase()}
								</div>
							{/if}
							<span class="text-sm" style="color: var(--theme-foreground, #1c1917);">{assignee.label}</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Labels -->
		{#if labelOptions.length > 0}
			<div>
				<label class="block text-sm font-medium mb-2" style="color: var(--theme-foreground, #1c1917);">
					Labels ({selectedLabels.length})
				</label>
				<div class="flex flex-wrap gap-2">
					{#each labelOptions as label}
						<button
							type="button"
							onclick={() => toggleMultiSelect(selectedLabels, label.value)}
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
			<label class="block text-sm font-medium mb-2" style="color: var(--theme-foreground, #1c1917);">
				Due Date Range
			</label>
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label class="block text-xs mb-1" style="color: var(--theme-text-muted, #78716c);">From</label>
					<input
						type="date"
						bind:value={dueDateFrom}
						style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); background-color: var(--theme-input-bg, white); color: var(--theme-foreground, #1c1917); --tw-ring-color: var(--theme-primary, #8b5cf6);"
						class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
					/>
				</div>
				<div>
					<label class="block text-xs mb-1" style="color: var(--theme-text-muted, #78716c);">To</label>
					<input
						type="date"
						bind:value={dueDateTo}
						style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); background-color: var(--theme-input-bg, white); color: var(--theme-foreground, #1c1917); --tw-ring-color: var(--theme-primary, #8b5cf6);"
						class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
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
					style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); color: var(--theme-primary, #8b5cf6); --tw-ring-color: var(--theme-primary, #8b5cf6);"
					class="rounded focus:ring-1"
				/>
				<span class="text-sm" style="color: var(--theme-foreground, #1c1917);">
					Show only standalone tasks (not linked to projects)
				</span>
			</label>
		</div>

		<!-- Actions -->
		<div class="flex items-center justify-between pt-4 border-t" style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
			<button
				type="button"
				onclick={handleSaveView}
				class="text-sm underline transition-colors"
				style="color: var(--theme-text-muted, #78716c);"
				onmouseenter={(e) => e.currentTarget.style.color = 'var(--theme-foreground, #1c1917)'}
				onmouseleave={(e) => e.currentTarget.style.color = 'var(--theme-text-muted, #78716c)'}
			>
				Save as view
			</button>
			<button
				type="button"
				onclick={applyFilters}
				class="px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 transition-colors"
				style="background-color: var(--theme-primary); color: var(--theme-card-bg); --tw-ring-color: var(--theme-focus);"
				onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-primary-hover)'}
				onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-primary)'}
			>
				Apply Filters
			</button>
		</div>
	</div>


