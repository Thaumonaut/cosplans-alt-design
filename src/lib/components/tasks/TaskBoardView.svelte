<script lang="ts">
	/**
	 * TaskBoardView Component
	 * 
	 * Renders tasks as a kanban board with columns by stage.
	 * Supports drag-and-drop between columns.
	 */
	import { createEventDispatcher } from 'svelte';
	import { dropzone } from '$lib/utils/drag-drop';
	import TaskCard from './TaskCard.svelte';
	import type { DragData } from '$lib/utils/drag-drop';

	interface Task {
		id: string;
		title: string;
		status_id: string;
		priority: 'low' | 'medium' | 'high';
		due_date?: string | null;
		assigned_to?: string | null;
		labels?: Array<{ id: string; name: string; color: string }>;
		subtask_completion_percentage?: number;
		total_subtasks?: number;
		completed_subtasks?: number;
		assignee?: any;
	}

	interface Stage {
		id: string;
		name: string;
		color?: string;
	}

	interface Props {
		tasks: Task[];
		stages: Stage[];
		statusOptions?: Array<{ value: string; label: string; color?: string }>;
	}

	let { tasks, stages, statusOptions = [] }: Props = $props();

	const dispatch = createEventDispatcher<{
		taskClick: { id: string };
		statusChange: { id: string; status_id: string };
		priorityChange: { id: string; priority: string };
		dueDateChange: { id: string; due_date: string | null };
		taskDrop: { taskId: string; newStatusId: string };
	}>();

	// Group tasks by stage
	const tasksByStage = $derived(
		stages.reduce((acc, stage) => {
			acc[stage.id] = tasks.filter((task) => task.status_id === stage.id);
			return acc;
		}, {} as Record<string, Task[]>)
	);

	function handleTaskClick(event: CustomEvent<{ id: string }>) {
		dispatch('taskClick', event.detail);
	}

	function handleStatusChange(event: CustomEvent<{ id: string; status_id: string }>) {
		dispatch('statusChange', event.detail);
	}

	function handlePriorityChange(event: CustomEvent<{ id: string; priority: string }>) {
		dispatch('priorityChange', event.detail);
	}

	function handleDueDateChange(event: CustomEvent<{ id: string; due_date: string | null }>) {
		dispatch('dueDateChange', event.detail);
	}

	function handleDrop(stageId: string, dragData: DragData) {
		if (dragData.type === 'task') {
			dispatch('taskDrop', { taskId: dragData.id, newStatusId: stageId });
			dispatch('statusChange', { id: dragData.id, status_id: stageId });
		}
	}
</script>

<div class="task-board-container flex gap-4 overflow-x-auto h-full p-4">
	{#each stages as stage (stage.id)}
		{@const stageTasks = tasksByStage[stage.id] || []}
		<div
			class="board-column flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
			use:dropzone={{
				acceptedTypes: ['task'],
				onDrop: (data) => handleDrop(stage.id, data),
			}}
		>
			<!-- Column Header -->
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-2">
					{#if stage.color}
						<div class="w-3 h-3 rounded-full" style="background-color: {stage.color}" />
					{/if}
					<h3 class="text-sm font-semibold text-gray-900 dark:text-white">
						{stage.name}
					</h3>
					<span class="text-xs text-gray-500 dark:text-gray-400">
						{stageTasks.length}
					</span>
				</div>
				<button
					type="button"
					class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
					aria-label="Add task to {stage.name}"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</button>
			</div>

			<!-- Tasks in Column -->
			<div class="space-y-3 overflow-y-auto" style="max-height: calc(100vh - 250px);">
				{#if stageTasks.length === 0}
					<div
						class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center"
					>
						<p class="text-sm text-gray-500 dark:text-gray-400">
							Drop tasks here or click + to add
						</p>
					</div>
				{:else}
					{#each stageTasks as task (task.id)}
						<TaskCard
							{...task}
							{statusOptions}
							viewMode="board"
							on:click={handleTaskClick}
							on:statusChange={handleStatusChange}
							on:priorityChange={handlePriorityChange}
							on:dueDateChange={handleDueDateChange}
						/>
					{/each}
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.task-board-container {
		contain: layout;
	}

	.board-column {
		min-height: 400px;
	}

	.board-column:global(.drag-over) {
		background-color: rgba(59, 130, 246, 0.1);
		border: 2px dashed rgb(59, 130, 246);
	}
</style>

