<script lang="ts">
	/**
	 * TaskListView Component
	 * 
	 * Renders tasks as a scrollable list with virtual scrolling for performance.
	 * Uses Tanstack Virtual for rendering only visible tasks.
	 */
	import { createEventDispatcher } from 'svelte';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { get } from 'svelte/store';
	import TaskCard from './TaskCard.svelte';
	import type { DragData } from '$lib/utils/drag-drop';

	interface Task {
		id: string;
		title: string;
		description?: string | null;
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

	interface Props {
		tasks: Task[];
		statusOptions?: Array<{ value: string; label: string; color?: string }>;
		selectable?: boolean;
		selectedIds?: Set<string>;
	}

	let {
		tasks,
		statusOptions = [],
		selectable = false,
		selectedIds = $bindable(new Set())
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		taskClick: { id: string };
		taskSelect: { id: string; selected: boolean };
		statusChange: { id: string; status_id: string };
		priorityChange: { id: string; priority: string };
		dueDateChange: { id: string; due_date: string | null };
	}>();

	let scrollElement = $state<HTMLDivElement | null>(null);

	// Virtual scrolling setup
	const virtualizer = $derived.by(() => {
		if (!scrollElement) return null;
		
		return createVirtualizer({
			get count() {
				return tasks.length;
			},
			getScrollElement: () => scrollElement!,
			estimateSize: () => 120, // Estimated height of each task card
			overscan: 5, // Render 5 extra items above/below viewport
		});
	});

	// Access the virtualizer store value reactively
	const virtualItems = $derived.by(() => {
		if (!virtualizer) return [];
		// In Svelte 5, we can use $ prefix for auto-subscription, but since virtualizer is nullable,
		// we use get() to safely access the store value
		const v = get(virtualizer);
		return v?.getVirtualItems() || [];
	});
	
	const totalSize = $derived.by(() => {
		if (!virtualizer) return 0;
		const v = get(virtualizer);
		return v?.getTotalSize() || 0;
	});

	function handleTaskClick(event: CustomEvent<{ id: string }>) {
		dispatch('taskClick', event.detail);
	}

	function handleTaskSelect(event: CustomEvent<{ id: string; selected: boolean }>) {
		if (event.detail.selected) {
			selectedIds.add(event.detail.id);
		} else {
			selectedIds.delete(event.detail.id);
		}
		selectedIds = selectedIds; // Trigger reactivity
		dispatch('taskSelect', event.detail);
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
</script>

<div
	bind:this={scrollElement}
	class="task-list-container overflow-auto h-full"
	style="contain: strict"
>
	{#if tasks.length === 0}
		<!-- Empty State -->
		<div class="flex flex-col items-center justify-center h-full p-8 text-center">
			<svg
				class="w-16 h-16 mb-4"
				style="color: var(--theme-text-muted, #78716c);"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
				/>
			</svg>
			<h3 class="text-lg font-semibold mb-2" style="color: var(--theme-foreground, #1c1917);">No tasks found</h3>
			<p class="text-sm" style="color: var(--theme-text-muted, #78716c);">
				Try adjusting your filters or create a new task to get started.
			</p>
		</div>
	{:else}
		<!-- Virtual List -->
		<div style="height: {totalSize}px; width: 100%; position: relative;">
			{#each virtualItems as virtualItem (tasks[virtualItem.index].id)}
				{@const task = tasks[virtualItem.index]}
				<div
					style="position: absolute; top: 0; left: 0; width: 100%; transform: translateY({virtualItem.start}px);"
				>
					<div class="px-4 py-2">
						<TaskCard
							{...task}
							{statusOptions}
							{selectable}
							selected={selectedIds.has(task.id)}
							viewMode="list"
							on:click={handleTaskClick}
							on:select={handleTaskSelect}
							on:statusChange={handleStatusChange}
							on:priorityChange={handlePriorityChange}
							on:dueDateChange={handleDueDateChange}
						/>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.task-list-container {
		will-change: scroll-position;
	}
</style>

