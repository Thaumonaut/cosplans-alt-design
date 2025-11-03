<script lang="ts">
	/**
	 * TaskCard Component
	 * 
	 * Displays task summary in list/board views.
	 * Shows title, status, priority, assignee, labels, due date, and subtask progress.
	 * Supports drag-and-drop, inline editing, and navigation to detail view.
	 */
	import { createEventDispatcher } from 'svelte';
	import { draggable } from '$lib/utils/drag-drop';
	import InlineSelect from '$lib/components/base/InlineSelect.svelte';
	import InlineDatePicker from '$lib/components/base/InlineDatePicker.svelte';
	import type { DragData } from '$lib/utils/drag-drop';

	interface Props {
		// Task data (simplified for card display)
		id: string;
		title: string;
		status_id: string;
		priority?: 'low' | 'medium' | 'high';
		due_date?: string | null;
		assigned_to?: string | null;
		labels?: Array<{ id: string; name: string; color: string }>;
		subtask_completion_percentage?: number;
		total_subtasks?: number;
		completed_subtasks?: number;
		// Options for inline editing
		statusOptions?: Array<{ value: string; label: string; color?: string }>;
		priorityOptions?: Array<{ value: string; label: string }>;
		// Assignee info
		assignee?: { id: string; email: string; first_name?: string; last_name?: string; avatar_url?: string } | null;
		// View mode
		viewMode?: 'list' | 'board';
		// Interaction flags
		draggable?: boolean;
		selectable?: boolean;
		selected?: boolean;
	}

	let {
		id,
		title,
		status_id,
		priority = 'medium',
		due_date = null,
		assigned_to = null,
		labels = [],
		subtask_completion_percentage = undefined,
		total_subtasks = 0,
		completed_subtasks = 0,
		statusOptions = [],
		priorityOptions = [
			{ value: 'low', label: 'Low' },
			{ value: 'medium', label: 'Medium' },
			{ value: 'high', label: 'High' },
		],
		assignee = null,
		viewMode = 'list',
		draggable: isDraggable = true,
		selectable = false,
		selected = $bindable(false)
	}: Props = $props();
	
	const dispatch = createEventDispatcher<{
		click: { id: string };
		select: { id: string; selected: boolean };
		statusChange: { id: string; status_id: string };
		priorityChange: { id: string; priority: string };
		dueDateChange: { id: string; due_date: string | null };
		dragStart: DragData;
		dragEnd: void;
	}>();

	function handleClick(event: MouseEvent) {
		// Don't navigate if clicking on inline editors or checkbox
		if (
			(event.target as HTMLElement).closest('.inline-editor') ||
			(event.target as HTMLElement).closest('input[type="checkbox"]')
		) {
			return;
		}
		dispatch('click', { id });
	}

	function handleSelectChange(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		selected = checked;
		dispatch('select', { id, selected: checked });
	}

	function handleStatusChange(event: CustomEvent<string>) {
		dispatch('statusChange', { id, status_id: event.detail });
	}

	function handlePriorityChange(event: CustomEvent<string>) {
		dispatch('priorityChange', { id, priority: event.detail as 'low' | 'medium' | 'high' });
	}

	function handleDueDateChange(event: CustomEvent<string | null>) {
		dispatch('dueDateChange', { id, due_date: event.detail });
	}

	const dragData: DragData = {
		type: 'task',
		id,
		data: { status_id, priority },
	};

	const priorityColors = {
		high: 'text-red-600 dark:text-red-400',
		medium: 'text-yellow-600 dark:text-yellow-400',
		low: 'text-green-600 dark:text-green-400',
	};

	const isOverdue = due_date && new Date(due_date) < new Date();
	const isDueSoon = due_date && !isOverdue && (new Date(due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 3;
</script>

<div
	class="task-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer {selected ? 'ring-2 ring-blue-500' : ''} {viewMode === 'board' ? 'mb-3' : ''}"
	role="button"
	tabindex="0"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick(e as unknown as MouseEvent)}
	use:draggable={isDraggable ? dragData : undefined}
>
	<!-- Header Row -->
	<div class="flex items-start gap-3 mb-2">
		<!-- Checkbox (if selectable) -->
		{#if selectable}
			<input
				type="checkbox"
				checked={selected}
				on:change={handleSelectChange}
				class="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
			/>
		{/if}

		<!-- Priority Indicator -->
		<div class="flex-shrink-0 mt-1">
			<svg
				class="w-4 h-4 {priorityColors[priority]}"
				fill="currentColor"
				viewBox="0 0 20 20"
			>
				{#if priority === 'high'}
					<path d="M10 3l7 14H3z" />
				{:else if priority === 'medium'}
					<circle cx="10" cy="10" r="7" />
				{:else}
					<path d="M10 17l-7-14h14z" />
				{/if}
			</svg>
		</div>

		<!-- Title -->
		<h3 class="flex-1 text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
			{title}
		</h3>
	</div>

	<!-- Metadata Row -->
	<div class="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
		<!-- Status -->
		<div class="inline-editor">
			<InlineSelect
				value={status_id}
				options={statusOptions}
				variant="status"
				on:change={handleStatusChange}
			/>
		</div>

		<!-- Priority -->
		<div class="inline-editor">
			<InlineSelect
				value={priority}
				options={priorityOptions}
				variant="priority"
				on:change={handlePriorityChange}
			/>
		</div>

		<!-- Due Date -->
		{#if due_date || viewMode === 'list'}
			<div class="inline-editor">
				<InlineDatePicker
					value={due_date}
					placeholder="No due date"
					on:change={handleDueDateChange}
				/>
			</div>
		{/if}

		<!-- Assignee -->
		{#if assignee}
			<div class="flex items-center gap-1">
				{#if assignee.avatar_url}
					<img
						src={assignee.avatar_url}
						alt={assignee.first_name || assignee.email}
						class="w-5 h-5 rounded-full"
					/>
				{:else}
					<div class="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
						{(assignee.first_name?.[0] || assignee.email[0]).toUpperCase()}
					</div>
				{/if}
				<span class="text-xs">
					{assignee.first_name || assignee.email.split('@')[0]}
				</span>
			</div>
		{/if}
	</div>

	<!-- Labels -->
	{#if labels.length > 0}
		<div class="flex flex-wrap gap-1 mt-2">
			{#each labels.slice(0, 3) as label}
				<span
					class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded"
					style="background-color: {label.color}20; color: {label.color}"
				>
					{label.name}
				</span>
			{/each}
			{#if labels.length > 3}
				<span class="inline-flex items-center px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400">
					+{labels.length - 3} more
				</span>
			{/if}
		</div>
	{/if}

	<!-- Subtask Progress -->
	{#if total_subtasks > 0}
		<div class="mt-3">
			<div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
				<span>{completed_subtasks}/{total_subtasks} subtasks</span>
				<span>{subtask_completion_percentage}%</span>
			</div>
			<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
				<div
					class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
					style="width: {subtask_completion_percentage}%"
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.task-card:global(.dragging) {
		opacity: 0.5;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
