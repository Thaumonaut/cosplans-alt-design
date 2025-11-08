<script lang="ts">
	/**
	 * Embedded Task List Component
	 * 
	 * Reusable filtered task view for embedding in Project, Photoshoot, and Resource detail pages.
	 * Shows tasks related to the parent entity with inline quick-create and filtering.
	 */
	import { onMount } from 'svelte';
	import type { Task } from '$lib/types/tasks';
	import { TaskService } from '$lib/services/task-service';
	import TaskCard from './TaskCard.svelte';
	import TaskListView from './TaskListView.svelte';
	import TaskBoardView from './TaskBoardView.svelte';
	import QuickTaskCreate from './QuickTaskCreate.svelte';
	import TaskDetailPanel from './TaskDetailPanel.svelte';
	import { Button } from '$lib/components/ui';
	import { Plus, List, LayoutGrid, ExternalLink, Loader2 } from 'lucide-svelte';
	
	// Service instance
	const taskService = new TaskService();

	// Props
	let {
		projectId = undefined,
		resourceId = undefined,
		photoshootId = undefined,
		teamId,
		title = 'Tasks',
		showViewToggle = true,
		showQuickCreate = true,
		showViewAllLink = true,
		maxHeight = '400px'
	}: {
		projectId?: string;
		resourceId?: string;
		photoshootId?: string;
		teamId: string;
		title?: string;
		showViewToggle?: boolean;
		showQuickCreate?: boolean;
		showViewAllLink?: boolean;
		maxHeight?: string;
	} = $props();

	// State
	let tasks = $state<Task[]>([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let viewMode = $state<'list' | 'board'>('list');
	let showQuickCreateForm = $state(false);
	let detailPanelTaskId = $state<string | null>(null);
	let isDetailPanelOpen = $state(false);

	// Load tasks on mount
	onMount(async () => {
		await loadTasks();
	});

	// Load tasks filtered by parent entity
	async function loadTasks() {
		isLoading = true;
		error = null;

		try {
			// Build filter based on parent entity
			// Note: teamId filtering is handled automatically by RLS policies
			const filters: any = {};

			if (projectId) {
				filters.project_ids = [projectId];
			} else if (resourceId) {
				filters.resource_ids = [resourceId];
			}
			// Note: photoshootId is not directly supported - photoshoot tasks are linked via projects

			const response = await taskService.getTasks(filters);
			if (response.error) {
				throw new Error(response.error.message || 'Failed to load tasks');
			}
			tasks = response.data || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load tasks';
			console.error('Error loading tasks:', err);
		} finally {
			isLoading = false;
		}
	}

	// Handlers
	function handleTaskClick(event: CustomEvent<{ id: string }>) {
		detailPanelTaskId = event.detail.id;
		isDetailPanelOpen = true;
	}

	function handleDetailPanelClose() {
		isDetailPanelOpen = false;
		detailPanelTaskId = null;
	}

	function handleTaskSave(updatedTask: Task) {
		tasks = tasks.map((task) => 
			task.id === updatedTask.id ? { ...task, ...updatedTask } : task
		);
	}

	async function handleTaskCreated(newTask: Task) {
		tasks = [newTask, ...tasks];
		showQuickCreateForm = false;
	}

	async function handleStatusChange(event: CustomEvent<{ id: string; status_id: string }>) {
		const taskId = event.detail.id;
		const statusId = event.detail.status_id;

		// Optimistic update
		tasks = tasks.map((task) =>
			task.id === taskId ? { ...task, status_id: statusId } : task
		);

		try {
			const response = await taskService.updateTask(taskId, { status_id: statusId });
			if (response.error) {
				throw new Error(response.error.message || 'Failed to update task');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update task';
			await loadTasks(); // Reload on error
		}
	}

	// Generate "View All" link with pre-applied filter
	const viewAllLink = $derived(() => {
		const params = new URLSearchParams();
		const filters: any = {};

		if (projectId) {
			filters.projects = [projectId];
		} else if (resourceId) {
			filters.resources = [resourceId];
		} else if (photoshootId) {
			filters.photoshoots = [photoshootId];
		}

		if (Object.keys(filters).length > 0) {
			params.set('filter', JSON.stringify(filters));
		}

		return `/tasks${params.toString() ? `?${params.toString()}` : ''}`;
	});
</script>

<!-- Embedded Task List -->
<div class="embedded-task-list rounded-lg border border-gray-200 bg-white p-4">
	<!-- Header -->
	<div class="mb-4 flex items-center justify-between">
		<div class="flex items-center space-x-3">
			<h3 class="text-lg font-semibold text-gray-900">{title}</h3>
			{#if tasks.length > 0}
				<span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
					{tasks.length}
				</span>
			{/if}
		</div>

		<div class="flex items-center space-x-2">
			<!-- View Toggle -->
			{#if showViewToggle}
				<div class="flex rounded-md border border-gray-300">
					<button
						type="button"
						on:click={() => (viewMode = 'list')}
						class="px-3 py-1.5 text-sm transition-colors {viewMode === 'list'
							? 'bg-gray-100 text-gray-900'
							: 'text-gray-600 hover:bg-gray-50'}"
						title="List view"
					>
						<List class="h-4 w-4" />
					</button>
					<button
						type="button"
						on:click={() => (viewMode = 'board')}
						class="border-l border-gray-300 px-3 py-1.5 text-sm transition-colors {viewMode === 'board'
							? 'bg-gray-100 text-gray-900'
							: 'text-gray-600 hover:bg-gray-50'}"
						title="Board view"
					>
						<LayoutGrid class="h-4 w-4" />
					</button>
				</div>
			{/if}

			<!-- Quick Create Button -->
			{#if showQuickCreate}
				<Button
					variant="outline"
					size="sm"
					on:click={() => (showQuickCreateForm = !showQuickCreateForm)}
				>
					<Plus class="mr-1 h-4 w-4" />
					Add Task
				</Button>
			{/if}

			<!-- View All Link -->
			{#if showViewAllLink}
				<a
					href={viewAllLink()}
					class="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
				>
					<span>View All</span>
					<ExternalLink class="h-3.5 w-3.5" />
				</a>
			{/if}
		</div>
	</div>

	<!-- Quick Create Form -->
	{#if showQuickCreateForm}
		<div class="mb-4">
			<QuickTaskCreate
				{projectId}
				{resourceId}
				{teamId}
				onCancel={() => (showQuickCreateForm = false)}
				onCreate={handleTaskCreated}
			/>
		</div>
	{/if}

	<!-- Error Message -->
	{#if error}
		<div class="mb-4 rounded-md bg-red-50 p-3">
			<p class="text-sm text-red-800">{error}</p>
		</div>
	{/if}

	<!-- Loading State -->
	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-gray-400" />
		</div>
	{:else if tasks.length > 0}
		<!-- Task List/Board View -->
		<div class="overflow-hidden rounded-md border border-gray-200" style="max-height: {maxHeight}; overflow-y: auto;">
			{#if viewMode === 'list'}
				<TaskListView
					{tasks}
					compact={true}
					on:taskClick={handleTaskClick}
					on:statusChange={handleStatusChange}
				/>
			{:else}
				<TaskBoardView
					{tasks}
					compact={true}
					on:taskClick={handleTaskClick}
					on:statusChange={handleStatusChange}
				/>
			{/if}
		</div>
	{:else}
		<!-- Empty State -->
		<div class="rounded-md border-2 border-dashed border-gray-300 p-8 text-center">
			<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
				<List class="h-6 w-6 text-gray-400" />
			</div>
			<h3 class="mt-4 text-sm font-medium text-gray-900">No tasks yet</h3>
			<p class="mt-1 text-sm text-gray-500">
				{#if showQuickCreate}
					Get started by creating your first task.
				{:else}
					Tasks will appear here once created.
				{/if}
			</p>
			{#if showQuickCreate}
				<Button
					variant="default"
					size="sm"
					class="mt-4"
					on:click={() => (showQuickCreateForm = true)}
				>
					<Plus class="mr-2 h-4 w-4" />
					Create Task
				</Button>
			{/if}
		</div>
	{/if}
</div>

<!-- Task Detail Panel -->
{#if isDetailPanelOpen && detailPanelTaskId}
	<TaskDetailPanel
		taskId={detailPanelTaskId}
		onClose={handleDetailPanelClose}
		onSave={handleTaskSave}
	/>
{/if}

<style>
	.embedded-task-list {
		transition: all 0.2s ease;
	}
</style>

