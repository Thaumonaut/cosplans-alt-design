<script lang="ts">
	/**
	 * Tasks Page
	 * 
	 * Main task management page with multiple views (list, board, calendar, timeline).
	 * Supports filtering, sorting, grouping, and all task operations.
	 */
	import { onMount } from 'svelte';
	import { taskViewStore, activeFilterCount, filterSummary } from '$lib/stores/task-view-store';
	import TaskListView from '$lib/components/tasks/TaskListView.svelte';
	import TaskBoardView from '$lib/components/tasks/TaskBoardView.svelte';
	import TaskCalendarView from '$lib/components/tasks/TaskCalendarView.svelte';
	import ViewModeSelector from '$lib/components/tasks/ViewModeSelector.svelte';
	import TaskFilterPanel from '$lib/components/tasks/TaskFilterPanel.svelte';
	import ErrorToast from '$lib/components/base/ErrorToast.svelte';
	import { TaskService } from '$lib/services/task-service';
	import { applyFilters, applySort } from '$lib/services/task-filter-service';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// State
	let tasks = $state(data.tasks || []);
	let statusOptions = $state(data.statusOptions || []);
	let projectOptions = $state(data.projectOptions || []);
	let assigneeOptions = $state(data.assigneeOptions || []);
	let labelOptions = $state(data.labelOptions || []);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let filterPanelOpen = $state(false);
	let selectedTaskIds = $state(new Set<string>());

	// Services
	const taskService = new TaskService();

	// Reactive filtered and sorted tasks
	const filteredTasks = $derived(
		applyFilters(tasks, $taskViewStore.filters)
	);

	const sortedTasks = $derived(
		applySort(filteredTasks, $taskViewStore.sortBy)
	);

	// View mode
	let viewMode = $derived($taskViewStore.viewMode);

	// Handlers
	async function handleTaskClick(event: CustomEvent<{ id: string }>) {
		// Navigate to task detail (will implement in Phase 4)
		console.log('Task clicked:', event.detail.id);
	}

	async function handleStatusChange(event: CustomEvent<{ id: string; status_id: string }>) {
		try {
			loading = true;
			error = null;

			const result = await taskService.updateTask(event.detail.id, {
				status_id: event.detail.status_id,
			});

			if (result.error) {
				throw new Error(result.error.message);
			}

			// Update local state
			tasks = tasks.map((task) =>
				task.id === event.detail.id ? { ...task, status_id: event.detail.status_id } : task
			);
		} catch (err: any) {
			error = err.message || 'Failed to update task status';
		} finally {
			loading = false;
		}
	}

	async function handlePriorityChange(event: CustomEvent<{ id: string; priority: string }>) {
		try {
			loading = true;
			error = null;

			const result = await taskService.updateTask(event.detail.id, {
				priority: event.detail.priority as 'low' | 'medium' | 'high',
			});

			if (result.error) {
				throw new Error(result.error.message);
			}

			// Update local state
			tasks = tasks.map((task) =>
				task.id === event.detail.id
					? { ...task, priority: event.detail.priority as 'low' | 'medium' | 'high' }
					: task
			);
		} catch (err: any) {
			error = err.message || 'Failed to update task priority';
		} finally {
			loading = false;
		}
	}

	async function handleDueDateChange(event: CustomEvent<{ id: string; due_date: string | null }>) {
		try {
			loading = true;
			error = null;

			const result = await taskService.updateTask(event.detail.id, {
				due_date: event.detail.due_date,
			});

			if (result.error) {
				throw new Error(result.error.message);
			}

			// Update local state
			tasks = tasks.map((task) =>
				task.id === event.detail.id ? { ...task, due_date: event.detail.due_date } : task
			);
		} catch (err: any) {
			error = err.message || 'Failed to update task due date';
		} finally {
			loading = false;
		}
	}

	function handleTaskDrop(event: CustomEvent<{ taskId: string; newStatusId: string }>) {
		handleStatusChange(event as any);
	}

	function handleTaskSelect(event: CustomEvent<{ id: string; selected: boolean }>) {
		if (event.detail.selected) {
			selectedTaskIds.add(event.detail.id);
		} else {
			selectedTaskIds.delete(event.detail.id);
		}
		selectedTaskIds = selectedTaskIds;
	}

	function handleFilterChange(event: CustomEvent) {
		taskViewStore.setFilters(event.detail);
		filterPanelOpen = false;
	}

	function handleFilterClear() {
		taskViewStore.clearFilters();
	}

	function handleFilterSave() {
		// TODO: Implement saved view creation (Phase 9 - US6)
		console.log('Save view functionality coming in Phase 9');
	}

	function toggleFilterPanel() {
		filterPanelOpen = !filterPanelOpen;
	}
</script>

<svelte:head>
	<title>Tasks - Cosplay Tracker</title>
</svelte:head>

<div class="tasks-page flex flex-col h-full">
	<!-- Page Header -->
	<div class="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
		<div class="max-w-7xl mx-auto">
			<!-- Top Row -->
			<div class="flex items-center justify-between mb-4">
				<div>
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
					<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
						{sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}
						{#if $activeFilterCount > 0}
							<span class="text-blue-600 dark:text-blue-400">
								({$activeFilterCount} {$activeFilterCount === 1 ? 'filter' : 'filters'} active)
							</span>
						{/if}
					</p>
				</div>

				<div class="flex items-center gap-3">
					<!-- Filter Button -->
					<button
						type="button"
						on:click={toggleFilterPanel}
						class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors {$activeFilterCount > 0 ? 'ring-2 ring-blue-500' : ''}"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
							/>
						</svg>
						Filters
						{#if $activeFilterCount > 0}
							<span class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
								{$activeFilterCount}
							</span>
						{/if}
					</button>

					<!-- New Task Button -->
					<button
						type="button"
						class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						New Task
					</button>
				</div>
			</div>

			<!-- View Controls Row -->
			<div class="flex items-center justify-between">
				<ViewModeSelector
					value={$taskViewStore.viewMode}
					on:change={(e) => taskViewStore.setViewMode(e.detail)}
				/>

				<!-- Quick Actions -->
				{#if selectedTaskIds.size > 0}
					<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
						<span>{selectedTaskIds.size} selected</span>
						<button type="button" class="text-blue-600 dark:text-blue-400 hover:underline">
							Bulk Edit
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Filter Panel (Collapsible) -->
	{#if filterPanelOpen}
		<div class="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-900">
			<div class="max-w-7xl mx-auto">
				<TaskFilterPanel
					open={filterPanelOpen}
					filters={$taskViewStore.filters}
					{statusOptions}
					{projectOptions}
					{assigneeOptions}
					{labelOptions}
					on:change={handleFilterChange}
					on:clear={handleFilterClear}
					on:save={handleFilterSave}
				/>
			</div>
		</div>
	{/if}

	<!-- Task Views -->
	<div class="flex-1 overflow-hidden">
		{#if viewMode === 'list'}
			<TaskListView
				tasks={sortedTasks}
				{statusOptions}
				selectable={true}
				bind:selectedIds={selectedTaskIds}
				on:taskClick={handleTaskClick}
				on:taskSelect={handleTaskSelect}
				on:statusChange={handleStatusChange}
				on:priorityChange={handlePriorityChange}
				on:dueDateChange={handleDueDateChange}
			/>
		{:else if viewMode === 'board'}
			<TaskBoardView
				tasks={sortedTasks}
				stages={statusOptions}
				{statusOptions}
				on:taskClick={handleTaskClick}
				on:statusChange={handleStatusChange}
				on:priorityChange={handlePriorityChange}
				on:dueDateChange={handleDueDateChange}
				on:taskDrop={handleTaskDrop}
			/>
		{:else if viewMode === 'calendar'}
			<TaskCalendarView
				tasks={sortedTasks}
				on:taskClick={handleTaskClick}
			/>
		{:else}
			<!-- Timeline view - Coming later -->
			<div class="flex items-center justify-center h-full p-8">
				<div class="text-center">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						Timeline View Coming Soon
					</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						This view will show tasks on a gantt-style timeline.
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Error Toast -->
{#if error}
	<ErrorToast
		message={error}
		title="Error"
		type="error"
		showRetry={true}
		on:dismiss={() => (error = null)}
		on:retry={() => (error = null)}
	/>
{/if}

<style>
	.tasks-page {
		height: calc(100vh - 64px); /* Adjust based on your header height */
	}
</style>

