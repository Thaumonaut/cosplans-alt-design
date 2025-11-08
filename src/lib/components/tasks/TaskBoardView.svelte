<script lang="ts">
	/**
	 * TaskBoardView Component
	 * 
	 * Renders tasks as a kanban board with columns by stage.
	 * Supports drag-and-drop between columns.
	 */
import { createEventDispatcher } from 'svelte';
import { tick } from 'svelte';
import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
import TaskCard from './TaskCard.svelte';

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
		addTask: { stageId: string };
	}>();

const LOG_PREFIX = '[TaskBoardView]';

	// Use stageTasks state for reactive task arrays
	// tasksByStage is now derived from stageTasks for backwards compatibility
	const tasksByStage = $derived(stageTasks);

	// Calculate subtask counts per stage
	const stageSubtaskCounts = $derived(
		stages.reduce((acc, stage) => {
			const tasksForStage = tasksByStage[stage.id] || [];
			const totalSubtasks = tasksForStage.reduce((sum, task) => sum + (task.total_subtasks || 0), 0);
			const completedSubtasks = tasksForStage.reduce((sum, task) => sum + (task.completed_subtasks || 0), 0);
			acc[stage.id] = {
				total: totalSubtasks,
				completed: completedSubtasks
			};
			return acc;
		}, {} as Record<string, { total: number; completed: number }>)
	);

	function toggleColumnCollapse(stageId: string) {
		if (collapsedColumns.has(stageId)) {
			collapsedColumns.delete(stageId);
		} else {
			collapsedColumns.add(stageId);
		}
		collapsedColumns = new Set(collapsedColumns); // Trigger reactivity
	}

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

	let boardContainer: HTMLElement | null = $state(null);
	let isDragging = $state(false); // Track if a drag is currently in progress
	let collapsedColumns = $state(new Set<string>()); // Track which columns are collapsed
	let autoExpandedColumnId: string | null = $state(null); // Track single auto-expanded column during drag
	let draggedSourceStage: string | null = $state(null);
	let lastHoveredStageId: string | null = null;
	let currentDragItemId: string | null = $state(null);
	let finalizedZones = $state(new Set<string>()); // Track which zones have finalized

	// Create reactive arrays for each stage's tasks
	let stageTasks: Record<string, Task[]> = $state(
		stages.reduce((acc, stage) => {
			acc[stage.id] = tasks.filter((task) => task.status_id === stage.id);
			return acc;
		}, {} as Record<string, Task[]>)
	);

	function shallowEqualTask(a: Task, b: Task) {
		if (a === b) return true;
		const keysA = Object.keys(a);
		const keysB = Object.keys(b);
		if (keysA.length !== keysB.length) return false;
		for (const key of keysA) {
			const typedKey = key as keyof Task;
			if (a[typedKey] !== b[typedKey]) {
				return false;
			}
		}
		return true;
	}

	// Update stage tasks when tasks prop changes
	// Skip update during drag to prevent interference with drag preview
	$effect(() => {
		// Don't update during drag - svelte-dnd-action manages the DOM during drag
		if (isDragging) {
			return;
		}

		// Build next snapshot from the incoming tasks prop
		const nextStageTasks = stages.reduce((acc, stage) => {
			acc[stage.id] = tasks.filter((task) => task.status_id === stage.id);
			return acc;
		}, {} as Record<string, Task[]>);

		let mergedStageTasks: Record<string, Task[]> = { ...stageTasks };
		let shouldUpdate = false;

		for (const stage of stages) {
			const stageId = stage.id;
			const currentItems = stageTasks[stageId] || [];
			const nextItems = nextStageTasks[stageId] || [];

			const currentIds = new Set(currentItems.map((task) => task.id));
			const nextIds = new Set(nextItems.map((task) => task.id));

			const idsChanged =
				currentIds.size !== nextIds.size ||
				[...currentIds].some((id) => !nextIds.has(id)) ||
				[...nextIds].some((id) => !currentIds.has(id));

			if (idsChanged) {
				// Items were added/removed/moved between stages – accept incoming order
				mergedStageTasks[stageId] = nextItems;
				shouldUpdate = true;
			} else {
				// Same set of items – preserve current order but update task data
				const nextItemMap = new Map(nextItems.map((task) => [task.id, task]));
				let dataMutated = false;
				for (let i = 0; i < currentItems.length; i += 1) {
					const currentTask = currentItems[i];
					const nextTask = nextItemMap.get(currentTask.id);
					if (nextTask && !shallowEqualTask(currentTask, nextTask)) {
						Object.assign(currentTask, nextTask);
						dataMutated = true;
					}
				}
				if (dataMutated) {
					mergedStageTasks = { ...mergedStageTasks, [stageId]: [...currentItems] };
					shouldUpdate = true;
				}
			}
		}

		if (shouldUpdate) {
			stageTasks = mergedStageTasks;
		}
	});

	// Auto-scroll when dragging near horizontal edges
	function handleAutoScroll(event: MouseEvent | TouchEvent) {
		if (!boardContainer) return;

		const clientX = 'touches' in event ? event.touches[0]?.clientX : event.clientX;
		if (clientX === undefined) return;

		const containerRect = boardContainer.getBoundingClientRect();
		const scrollThreshold = 100; // Distance from edge to trigger scroll (in pixels)
		const scrollSpeed = 10; // Pixels to scroll per frame
		
		const distanceFromLeft = clientX - containerRect.left;
		const distanceFromRight = containerRect.right - clientX;

		// Scroll left if near left edge
		if (distanceFromLeft < scrollThreshold && boardContainer.scrollLeft > 0) {
			const scrollAmount = Math.min(scrollSpeed, boardContainer.scrollLeft);
			boardContainer.scrollBy({ left: -scrollAmount, behavior: 'auto' });
		}
		
		// Scroll right if near right edge
		if (distanceFromRight < scrollThreshold) {
			const maxScroll = boardContainer.scrollWidth - boardContainer.clientWidth;
			if (boardContainer.scrollLeft < maxScroll) {
				const scrollAmount = Math.min(scrollSpeed, maxScroll - boardContainer.scrollLeft);
				boardContainer.scrollBy({ left: scrollAmount, behavior: 'auto' });
			}
		}
	}

	// Function to check which column is being hovered based on mouse position
	// This works for both expanded and collapsed columns
	function getHoveredColumnId(mouseX: number, mouseY: number): string | null {
		if (!boardContainer) return null;
		
		// Check all board columns - this includes collapsed columns
		const boardColumns = boardContainer.querySelectorAll('.board-column');
		for (const column of boardColumns) {
			const rect = column.getBoundingClientRect();
			// Check if mouse is within column bounds (even if collapsed)
			if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
				// Get stage ID directly from board-column (most reliable)
				const stageId = (column as HTMLElement).getAttribute('data-stage-id');
				if (stageId) return stageId;
			}
		}
		
		return null;
	}

	function handleDragMove(e: MouseEvent | TouchEvent) {
		if (!isDragging) return;
		const mouseX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
		const mouseY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
		if (mouseX !== null && mouseY !== null) {
			handleAutoScroll(e);
			const hoveredStageId = getHoveredColumnId(mouseX, mouseY);
		if (hoveredStageId !== lastHoveredStageId) {
			console.debug(`${LOG_PREFIX} handleDragMove`, {
				hoveredStageId,
				isCollapsed: hoveredStageId ? collapsedColumns.has(hoveredStageId) : false
			});
			lastHoveredStageId = hoveredStageId ?? null;
		}
			if (hoveredStageId && collapsedColumns.has(hoveredStageId)) {
			if (autoExpandedColumnId !== hoveredStageId) {
				console.debug(`${LOG_PREFIX} auto-expand`, { stageId: hoveredStageId });
				autoExpandedColumnId = hoveredStageId;
			}
			} else if (autoExpandedColumnId !== null) {
			console.debug(`${LOG_PREFIX} auto-expand clear`, { previous: autoExpandedColumnId });
				autoExpandedColumnId = null;
			}
		}
	}

	function handleConsider(e: CustomEvent, stageId: string) {
		const { items, info } = e.detail;
		
		// CRITICAL: Always update items - this includes the insertion placeholder when dragging
		// The library manages the items array and includes placeholders during drag
		// Per svelte-dnd-action docs: each zone should independently update its items array
		stageTasks = { ...stageTasks, [stageId]: items };

		if (!info) {
			return;
		}

		const { trigger, id } = info;
		currentDragItemId = id ?? currentDragItemId;

		if (!isDragging && trigger === 'dragStarted') {
			isDragging = true;
			draggedSourceStage = stageId;
			finalizedZones = new Set(); // Reset finalized zones tracking
			document.addEventListener('mousemove', handleDragMove, { passive: true });
			document.addEventListener('touchmove', handleDragMove, { passive: true });
		}

		if (isDragging && trigger === 'draggedEntered' && collapsedColumns.has(stageId)) {
			autoExpandedColumnId = stageId;
		}
	}

	function handleFinalize(e: CustomEvent, stageId: string) {
		const { items, info } = e.detail;
		
		// CRITICAL: Per svelte-dnd-action docs, each zone should independently update its items array
		// The library handles cross-zone moves automatically - when an item is moved between zones,
		// BOTH zones get finalize calls: source zone gets items without the moved item,
		// target zone gets items with the moved item added
		stageTasks = { ...stageTasks, [stageId]: items };
		
		// Track that this zone has finalized (create new Set for reactivity)
		finalizedZones = new Set([...finalizedZones, stageId]);

		// Dispatch status change event for parent to update backend
		// Only dispatch if this is the target zone (where the item was dropped)
		// Check if item was moved between columns by comparing draggedSourceStage
		if (info && draggedSourceStage && draggedSourceStage !== stageId) {
			const dragInfo = {
				id: info.id,
				activeIndex: info.activeIndex,
				dragged: (info as any)?.dragged,
				draggedContext: (info as any)?.draggedContext
			};
			const draggedItemId =
				dragInfo.id ??
				(dragInfo.dragged as any)?.id ??
				(dragInfo.draggedContext as any)?.id ??
				currentDragItemId ??
				(dragInfo.activeIndex !== undefined && dragInfo.activeIndex !== null
					? items[dragInfo.activeIndex]?.id
					: null);
			const draggedItem = draggedItemId
				? items.find((task) => task.id === draggedItemId)
				: undefined;
			if (!draggedItem && dragInfo.activeIndex !== undefined && dragInfo.activeIndex !== null) {
				// Fallback: use the item at the reported index if available
				const fallbackItem = items[dragInfo.activeIndex];
				if (fallbackItem) {
					console.warn(`${LOG_PREFIX} Using fallback activeIndex to identify dragged item`, {
						from: draggedSourceStage,
						to: stageId,
						dragInfo,
						fallbackId: fallbackItem.id
					});
					currentDragItemId = fallbackItem.id;
					dispatch('statusChange', { id: fallbackItem.id, status_id: stageId });
				}
			} else if (draggedItem) {
				currentDragItemId = draggedItem.id;
				console.debug(`${LOG_PREFIX} Cross-column move detected`, {
					from: draggedSourceStage,
					to: stageId,
					taskId: draggedItem.id,
					taskTitle: draggedItem.title,
					dragInfo
				});
				dispatch('statusChange', { id: draggedItem.id, status_id: stageId });
			} else {
				console.warn(`${LOG_PREFIX} Unable to resolve dragged item during cross-column finalize`, {
					from: draggedSourceStage,
					to: stageId,
					dragInfo,
					items: items.map((task) => task.id)
				});
			}
		}

		// Clean up drag state AFTER both zones have finalized (for cross-column moves)
		// or immediately (for same-column moves)
		const isCrossColumnMove = info && draggedSourceStage && draggedSourceStage !== stageId;
		const bothZonesFinalized = isCrossColumnMove && 
			finalizedZones.has(draggedSourceStage) && 
			finalizedZones.has(stageId);
		
		if (bothZonesFinalized || !isCrossColumnMove) {
			// Both zones have finalized OR it's not a cross-column move - clean up
			// Use tick() to wait for parent's synchronous optimistic update to complete
			// This ensures the $effect doesn't overwrite our stageTasks updates
			if (isCrossColumnMove) {
				tick().then(() => {
					isDragging = false;
				});
			} else {
				isDragging = false;
			}
			
			// Clean up drag state
			autoExpandedColumnId = null;
			draggedSourceStage = null;
			currentDragItemId = null;
			lastHoveredStageId = null;
			finalizedZones = new Set();
			document.removeEventListener('mousemove', handleDragMove);
			document.removeEventListener('touchmove', handleDragMove);
		}
	}
</script>

<div 
	class="task-board-container flex gap-4 overflow-x-auto h-full p-4"
	bind:this={boardContainer}
>
	{#each stages as stage (stage.id)}
		{@const tasksForStage = tasksByStage[stage.id] || []}
		{@const isCollapsed = collapsedColumns.has(stage.id)}
		{@const isVisuallyExpanded = autoExpandedColumnId === stage.id}
		{@const subtaskCounts = stageSubtaskCounts[stage.id] || { total: 0, completed: 0 }}
		{@const effectiveWidth = (isCollapsed && !isVisuallyExpanded) ? '80px' : '320px'}
		{@const effectivePadding = (isCollapsed && !isVisuallyExpanded) ? '0.75rem' : '1rem'}
		<div
			class="board-column flex-shrink-0 rounded-lg flex flex-col transition-all duration-300"
			style="background-color: var(--theme-section-bg, rgba(255, 255, 255, 0.9)); width: {effectiveWidth}; padding: {effectivePadding};"
			data-stage-id={stage.id}
		>
			<!-- Always render the full structure - use CSS to hide/show content -->
			<!-- Column Header - Expanded View -->
			<div 
				class="flex items-center justify-between mb-4 transition-opacity duration-300"
				style="opacity: {(isCollapsed && !isVisuallyExpanded) ? '0' : '1'}; pointer-events: {(isCollapsed && !isVisuallyExpanded) ? 'none' : 'auto'}; position: {(isCollapsed && !isVisuallyExpanded) ? 'absolute' : 'relative'}; width: {(isCollapsed && !isVisuallyExpanded) ? '0' : 'auto'}; overflow: hidden;"
			>
				<div class="flex items-center gap-2 flex-1">
					<button
						type="button"
						class="inline-flex items-center justify-center rounded-md p-1 text-sm transition-colors hover:bg-muted"
						aria-label="Collapse {stage.name} column"
						style="color: var(--theme-text-muted, #78716c);"
						onclick={() => toggleColumnCollapse(stage.id)}
						onmouseenter={(e: MouseEvent) => {
							if (e.currentTarget instanceof HTMLElement) {
								e.currentTarget.style.color = 'var(--theme-foreground, #1c1917)';
							}
						}}
						onmouseleave={(e: MouseEvent) => {
							if (e.currentTarget instanceof HTMLElement) {
								e.currentTarget.style.color = 'var(--theme-text-muted, #78716c)';
							}
						}}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>
					{#if stage.color}
						<div class="w-3 h-3 rounded-full" style="background-color: {stage.color}"></div>
					{/if}
					<h3 class="text-sm font-semibold" style="color: var(--theme-foreground, #1c1917);">
						{stage.name}
					</h3>
					<span class="text-xs" style="color: var(--theme-text-muted, #78716c);">
						{tasksForStage.length}
					</span>
				</div>
				<button
					type="button"
					class="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-muted"
					aria-label="Add task to {stage.name}"
					style="color: var(--theme-text-muted, #78716c);"
					onclick={() => dispatch('addTask', { stageId: stage.id })}
					onmouseenter={(e: MouseEvent) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.color = 'var(--theme-foreground, #1c1917)';
						}
					}}
					onmouseleave={(e: MouseEvent) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.color = 'var(--theme-text-muted, #78716c)';
						}
					}}
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

			<!-- Column Header - Collapsed View -->
			<div 
				class="flex flex-col items-center gap-2 transition-opacity duration-300"
				style="opacity: {(isCollapsed && !isVisuallyExpanded) ? '1' : '0'}; pointer-events: {(isCollapsed && !isVisuallyExpanded) ? 'auto' : 'none'}; position: {(isCollapsed && !isVisuallyExpanded) ? 'relative' : 'absolute'}; width: {(isCollapsed && !isVisuallyExpanded) ? 'auto' : '0'}; overflow: hidden;"
			>
				<button
					type="button"
					class="inline-flex items-center justify-center rounded-md p-1 text-sm transition-colors hover:bg-muted w-full"
					aria-label="Expand {stage.name} column"
					style="color: var(--theme-text-muted, #78716c);"
					onclick={() => toggleColumnCollapse(stage.id)}
					onmouseenter={(e: MouseEvent) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.color = 'var(--theme-foreground, #1c1917)';
						}
					}}
					onmouseleave={(e: MouseEvent) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.color = 'var(--theme-text-muted, #78716c)';
						}
					}}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>
				{#if stage.color}
					<div class="w-3 h-3 rounded-full" style="background-color: {stage.color}"></div>
				{/if}
				<div class="flex flex-col items-center gap-1">
					<h3 
						class="text-xs font-semibold text-center" 
						style="color: var(--theme-foreground, #1c1917); writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg);"
					>
						{stage.name}
					</h3>
					<div class="text-xs text-center" style="color: var(--theme-text-muted, #78716c);">
						<div>{tasksForStage.length}</div>
						{#if subtaskCounts.total > 0}
							<div class="text-[10px] mt-0.5">{subtaskCounts.completed}/{subtaskCounts.total}</div>
						{/if}
					</div>
				</div>
				<button
					type="button"
					class="inline-flex items-center justify-center rounded-md p-1.5 text-sm font-medium transition-colors hover:bg-muted w-full mt-auto"
					aria-label="Add task to {stage.name}"
					style="color: var(--theme-text-muted, #78716c);"
					onclick={() => dispatch('addTask', { stageId: stage.id })}
					onmouseenter={(e: MouseEvent) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.color = 'var(--theme-foreground, #1c1917)';
						}
					}}
					onmouseleave={(e: MouseEvent) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.color = 'var(--theme-text-muted, #78716c)';
						}
					}}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</button>
			</div>

			<!-- Tasks in Column - Always render, hide with CSS when collapsed -->
			<!-- CRITICAL: Keep pointer-events enabled even when collapsed so drag can trigger auto-expand -->
			<div 
				class="{tasksForStage.length === 0 && isDragging ? 'task-column' : 'space-y-3 overflow-y-auto task-column flex-1 min-h-0'}" 
				style="max-height: calc(100vh - 250px); {tasksForStage.length === 0 && isDragging ? 'min-height: 0 !important; height: 0 !important; padding: 0 !important; margin: 0 !important; overflow: visible;' : 'min-height: 400px;'} opacity: {(isCollapsed && !isVisuallyExpanded) ? '0' : '1'}; pointer-events: auto; position: relative;"
				data-stage-id={stage.id}
				use:dndzone={{
					items: tasksForStage,
					flipDurationMs: 150,
					dragDisabled: false
				}}
				onconsider={(e) => handleConsider(e, stage.id)}
				onfinalize={(e) => handleFinalize(e, stage.id)}
			>
				{#if tasksForStage.length === 0 && !isDragging}
					<div
						class="border-2 border-dashed rounded-lg p-8 text-center flex-1 flex items-center justify-center"
						style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); min-height: 400px;"
					>
						<p class="text-sm" style="color: var(--theme-text-muted, #78716c);">
							Drop tasks here or click + to add
						</p>
					</div>
				{:else if tasksForStage.length === 0 && isDragging}
					<!-- Empty column when dragging - completely empty, container collapsed to zero height -->
					<!-- This ensures ghost appears at the top of the column container -->
				{:else}
					<!-- 
						Custom shadow element support:
						- SHADOW_ITEM_MARKER_PROPERTY_NAME identifies placeholder items added during drag
						- Include it in the key to ensure proper reactivity (per svelte-dnd-action docs)
						- data-is-dnd-shadow-item-hint helps prevent unnecessary work in nested zones
						- shadow-placeholder class provides custom styling that ensures visibility
					-->
					{#each tasksForStage as task (`${task.id}${task[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? "_" + task[SHADOW_ITEM_MARKER_PROPERTY_NAME] : ""}`)}
						<div 
							class="task-card-wrapper {task[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? 'shadow-placeholder' : ''}" 
							data-task-id={task.id}
							data-is-dnd-shadow-item-hint={task[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
						>
						<TaskCard
							{...task}
							{statusOptions}
							viewMode="board"
							draggable={true}
							on:click={handleTaskClick}
							on:statusChange={handleStatusChange}
							on:priorityChange={handlePriorityChange}
							on:dueDateChange={handleDueDateChange}
						/>
						</div>
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
		/* Ensure the column takes full available height */
		height: 100%;
	}

	.task-column {
		min-height: 400px;
		/* Ensure the task column takes full height of board-column */
		flex: 1 1 auto;
		/* Add padding to bottom to ensure drops work at the bottom of the column */
		padding-bottom: 1rem;
	}

	/* Prevent transitions from affecting drag preview - fixes disappearing elements */
	:global(.dnd-zone-item--dragging *),
	:global(.dnd-zone-item--dragging .task-card-wrapper),
	:global(.dnd-zone-item--dragging .task-card-wrapper *),
	:global(.dnd-zone-item--dragging .task-card),
	:global(.dnd-zone-item--dragging .task-card *) {
		transition: none !important;
		animation: none !important;
		/* Ensure visibility but don't override parent opacity */
		visibility: visible !important;
		display: revert !important;
	}

	/* Style the dragged item - keep it visible */
	:global(.dnd-zone-item--dragging) {
		opacity: 0.8 !important;
		will-change: transform;
		z-index: 9999 !important;
		pointer-events: none !important;
		/* Let library handle positioning */
		visibility: visible !important;
		display: block !important;
	}

	/* Ensure insertion placeholder is visible */
	:global(.dnd-zone-item--inserted),
	:global(.dnd-zone-item--inserted *) {
		transition: none !important;
		animation: none !important;
		opacity: 0.5 !important;
		visibility: visible !important;
		display: block !important;
		pointer-events: none !important;
	}

	/* Custom shadow placeholder styling - ensures it never disappears */
	.shadow-placeholder,
	.shadow-placeholder * {
		opacity: 0.6 !important;
		visibility: visible !important;
		display: block !important;
		pointer-events: none !important;
		transition: none !important;
		animation: none !important;
		/* Add visual distinction for the placeholder */
		border: 2px dashed var(--theme-primary, #8b5cf6) !important;
		background-color: var(--theme-section-bg, rgba(255, 255, 255, 0.9)) !important;
		position: relative !important;
	}

	/* Ensure shadow placeholder has proper height */
	.shadow-placeholder .task-card {
		min-height: 200px !important;
		opacity: 0.6 !important;
	}

	/* Additional styling for shadow items identified by data attribute */
	:global([data-is-dnd-shadow-item-hint]) {
		opacity: 0.6 !important;
		visibility: visible !important;
		display: block !important;
		pointer-events: none !important;
	}
</style>

