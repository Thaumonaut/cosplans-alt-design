<script lang="ts">
	/**
	 * TaskBoardView Component
	 * 
	 * Renders tasks as a kanban board with columns by stage.
	 * Supports drag-and-drop between columns.
	 */
	import { createEventDispatcher, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import TaskCard from './TaskCard.svelte';
	import { Button } from '$lib/components/ui';

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

	// Group tasks by stage
	const tasksByStage = $derived(
		stages.reduce((acc, stage) => {
			acc[stage.id] = tasks.filter((task) => task.status_id === stage.id);
			return acc;
		}, {} as Record<string, Task[]>)
	);

	// Calculate subtask counts per stage
	const stageSubtaskCounts = $derived(
		stages.reduce((acc, stage) => {
			const stageTasks = tasksByStage[stage.id] || [];
			const totalSubtasks = stageTasks.reduce((sum, task) => sum + (task.total_subtasks || 0), 0);
			const completedSubtasks = stageTasks.reduce((sum, task) => sum + (task.completed_subtasks || 0), 0);
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

	let sortableInstance: any = null;
	let columnRefs: Map<string, HTMLElement> = $state(new Map());
	let boardContainer: HTMLElement | null = $state(null);
	let isDragging = $state(false); // Track if a drag is currently in progress
	let collapsedColumns = $state(new Set<string>()); // Track which columns are collapsed
	let autoExpandedColumnId: string | null = $state(null); // Track single auto-expanded column during drag

	// Action to collect column container references
	function columnContainer(node: HTMLElement, stageId: string) {
		columnRefs.set(stageId, node);
		
		return {
			destroy() {
				columnRefs.delete(stageId);
			}
		};
	}

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

	$effect(() => {
		if (!browser) return;
		
		// Initialize/reinitialize Sortable when containers are available
		// Also reinitialize when collapsed columns change (to update container detection)
		const containers = Array.from(columnRefs.values());
		if (containers.length > 0 && stages.length > 0) {
			// Trigger effect when collapsedColumns changes by accessing it
			const _ = collapsedColumns;
			// Dynamically load and initialize Sortable
			(async () => {
				try {
					const { Sortable } = await import('@shopify/draggable');
					
					// Destroy existing instance if it exists
					if (sortableInstance) {
						sortableInstance.destroy();
						sortableInstance = null;
					}

					// Initialize Sortable with all column containers for cross-column dragging
					sortableInstance = new Sortable(containers, {
						draggable: '.task-card-wrapper',
						// Fix mirror offset by using proper mirror configuration
						mirror: {
							constrainDimensions: true,
							appendTo: 'body', // Append mirror to body to avoid offset issues
							xAxis: true, // Follow mouse X axis
							yAxis: true, // Follow mouse Y axis,
						},
					});

					// Track the dragged task and source to prevent duplicates
					let draggedTaskId: string | null = null;
					let draggedSourceContainer: HTMLElement | null = null;
					let lastProcessedStop: { taskId: string; targetStageId: string; timestamp: number } | null = null;
					let originalTaskStatusId: string | null = null; // Store original status_id when drag starts
					let dragTimeout: number | null = null; // Timeout to detect lost drag control

					// Function to recover from lost drag control
					function recoverFromLostDrag() {
						if (draggedTaskId && originalTaskStatusId) {
							console.warn('[TaskBoardView] Drag control lost, recovering task to original position:', {
								taskId: draggedTaskId,
								originalStatusId: originalTaskStatusId
							});
							// Dispatch revert event to parent
							dispatch('statusChange', { id: draggedTaskId, status_id: originalTaskStatusId });
							// Reset tracking
							draggedTaskId = null;
							originalTaskStatusId = null;
							isDragging = false;
							autoExpandedColumnId = null;
							if (dragTimeout !== null) {
								clearTimeout(dragTimeout);
								dragTimeout = null;
							}
						}
					}

					// Capture drag start to track which task is being dragged
					sortableInstance.on('sortable:start', (event: any) => {
						const source = event.data?.source || event.data?.dragEvent?.data?.source;
						if (source) {
							draggedTaskId = source.getAttribute('data-task-id');
							draggedSourceContainer = event.data?.sourceContainer || event.data?.dragEvent?.data?.sourceContainer;
							lastProcessedStop = null; // Reset on new drag start
							isDragging = true; // Mark that dragging has started
							
							console.log('[TaskBoardView] sortable:start - Initial state:', {
								draggedTaskId,
								sourceStageId: draggedSourceContainer?.getAttribute('data-stage-id'),
								collapsedColumns: Array.from(collapsedColumns),
								autoExpandedColumnIdBeforeReset: autoExpandedColumnId
							});
							
							autoExpandedColumnId = null; // Reset auto-expansion tracking
							
							// Store original task position for error recovery
							originalTaskStatusId = tasks.find(t => t.id === draggedTaskId)?.status_id || null;
							
							// Set timeout to detect lost drag control (30 seconds)
							if (dragTimeout !== null) {
								clearTimeout(dragTimeout);
							}
							dragTimeout = window.setTimeout(() => {
								if (isDragging) {
									console.error('[TaskBoardView] Drag timeout detected, attempting recovery');
									recoverFromLostDrag();
								}
							}, 30000);
							
							// Add event listeners for auto-scroll when drag starts
							document.addEventListener('mousemove', handleDragMove, { passive: true });
							document.addEventListener('touchmove', handleDragMove, { passive: true });
						}
					});

					// Listen for drag cancellation events
					sortableInstance.on('sortable:cancel', () => {
						console.warn('[TaskBoardView] Drag cancelled by library');
						recoverFromLostDrag();
					});

					// Track current mouse/touch position during drag for auto-scroll
					let currentDragX: number | null = null;
					let autoScrollInterval: number | null = null;

					// Function to check which column is being hovered based on mouse position
					function getHoveredColumnId(mouseX: number, mouseY: number): string | null {
						if (!boardContainer) return null;
						
						// Check all column containers
						for (const [stageId, container] of columnRefs.entries()) {
							const rect = container.getBoundingClientRect();
							// Check if mouse is within column bounds
							if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
								return stageId;
							}
						}
						
						// Also check the board-column elements (parent containers)
						const boardColumns = boardContainer.querySelectorAll('.board-column');
						for (const column of boardColumns) {
							const rect = column.getBoundingClientRect();
							if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
								const stageId = (column as HTMLElement).querySelector('[data-stage-id]')?.getAttribute('data-stage-id');
								if (stageId) return stageId;
							}
						}
						
						return null;
					}

					// Listen to sort events to track drag position and auto-expand/collapse columns
					sortableInstance.on('sortable:sort', (event: any) => {
						// Get mouse position from the drag event
						const dragEvent = event.data?.dragEvent?.data;
						let mouseX: number | null = null;
						let mouseY: number | null = null;
						
						if (dragEvent?.originalEvent) {
							const originalEvent = dragEvent.originalEvent;
							mouseX = 'touches' in originalEvent ? originalEvent.touches[0]?.clientX : originalEvent.clientX;
							mouseY = 'touches' in originalEvent ? originalEvent.touches[0]?.clientY : originalEvent.clientY;
							currentDragX = mouseX;
							
							// Start auto-scroll if not already running
							if (!autoScrollInterval && boardContainer && mouseX !== null && mouseX !== undefined) {
								autoScrollInterval = window.setInterval(() => {
									if (currentDragX !== null && boardContainer) {
										// Create a synthetic event for handleAutoScroll
										const syntheticEvent = {
											clientX: currentDragX,
											touches: [] as Touch[]
										} as unknown as MouseEvent;
										handleAutoScroll(syntheticEvent);
									}
								}, 16); // ~60fps
							}
						}
						
						// Auto-expand/collapse columns based on hover using mouse position
						if (mouseX !== null && mouseY !== null) {
							const hoveredStageId = getHoveredColumnId(mouseX, mouseY);
							
							if (hoveredStageId) {
								// Check if hovering over a collapsed column
								if (collapsedColumns.has(hoveredStageId)) {
									// If different from current auto-expanded column, switch to new one
									if (autoExpandedColumnId !== hoveredStageId) {
										console.log('[TaskBoardView] sortable:sort - Setting autoExpandedColumnId:', hoveredStageId);
										autoExpandedColumnId = hoveredStageId;
									}
								} else {
									// Hovering over an expanded column - clear auto-expansion if set
									if (autoExpandedColumnId !== null) {
										console.log('[TaskBoardView] sortable:sort - Clearing autoExpandedColumnId (hovering expanded column):', autoExpandedColumnId);
										autoExpandedColumnId = null;
									}
								}
							} else {
								// No column hovered - clear auto-expansion
								if (autoExpandedColumnId !== null) {
									console.log('[TaskBoardView] sortable:sort - Clearing autoExpandedColumnId (no column hovered):', autoExpandedColumnId);
									autoExpandedColumnId = null;
								}
							}
						}
					});

					// Also listen to global mouse/touch events as fallback for auto-scroll and column hover detection
					const handleDragMove = (e: MouseEvent | TouchEvent) => {
						if (draggedTaskId) {
							const mouseX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
							const mouseY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
							currentDragX = mouseX;
							handleAutoScroll(e);
							
							// Check column hover during drag
							if (mouseX !== null && mouseY !== null) {
								const hoveredStageId = getHoveredColumnId(mouseX, mouseY);
								
								if (hoveredStageId) {
									// Check if hovering over a collapsed column
									if (collapsedColumns.has(hoveredStageId)) {
										// If different from current auto-expanded column, switch to new one
										if (autoExpandedColumnId !== hoveredStageId) {
											console.log('[TaskBoardView] handleDragMove - Setting autoExpandedColumnId:', hoveredStageId);
											autoExpandedColumnId = hoveredStageId;
										}
									} else {
										// Hovering over an expanded column - clear auto-expansion if set
										if (autoExpandedColumnId !== null) {
											console.log('[TaskBoardView] handleDragMove - Clearing autoExpandedColumnId (hovering expanded column):', autoExpandedColumnId);
											autoExpandedColumnId = null;
										}
									}
								} else {
									// No column hovered - clear auto-expansion
									if (autoExpandedColumnId !== null) {
										console.log('[TaskBoardView] handleDragMove - Clearing autoExpandedColumnId (no column hovered):', autoExpandedColumnId);
										autoExpandedColumnId = null;
									}
								}
							}
						}
					};

					// Handle drag completion - use 'sortable:stop' instead of 'sortable:sort'
					// This fires AFTER the drag completes, preventing premature DOM updates
					sortableInstance.on('sortable:stop', (event: any) => {
						// Clean up auto-scroll
						if (autoScrollInterval !== null) {
							clearInterval(autoScrollInterval);
							autoScrollInterval = null;
						}
						currentDragX = null;
						isDragging = false; // Mark that dragging has ended
						
						// Clear drag timeout
						if (dragTimeout !== null) {
							clearTimeout(dragTimeout);
							dragTimeout = null;
						}
						
						// Remove event listeners
						document.removeEventListener('mousemove', handleDragMove);
						document.removeEventListener('touchmove', handleDragMove);
						
						// Get containers from event data
						const sourceContainer = event.data?.dragEvent?.data?.sourceContainer || event.data?.sourceContainer || draggedSourceContainer;
						
						// Get the dragged element
						const taskElement = event.data?.dragEvent?.data?.source || event.data?.source;
						const taskId = taskElement?.getAttribute('data-task-id') || draggedTaskId;
						
						if (!taskId || !taskElement) {
							console.warn('[TaskBoardView] Missing task ID or element in sortable:stop');
							draggedTaskId = null;
							draggedSourceContainer = null;
							return;
						}
						
						// Find which container the element is now in (after the drop)
						let targetContainer: HTMLElement | null = null;
						
						// Method 1: Check if element is contained in any of our containers
						for (const container of containers) {
							if (container.contains(taskElement)) {
								targetContainer = container;
								break;
							}
						}
						
						// Method 2: Try to get from event data
						if (!targetContainer) {
							const eventContainer = event.data?.dragEvent?.data?.container || event.data?.container;
							if (eventContainer && containers.includes(eventContainer)) {
								targetContainer = eventContainer;
							}
						}
						
						// Method 3: Find closest container by traversing up the DOM
						if (!targetContainer && taskElement) {
							let parent: HTMLElement | null = taskElement.parentElement;
							while (parent) {
								if (containers.includes(parent)) {
									targetContainer = parent;
									break;
								}
								parent = parent.parentElement;
							}
						}
						
						const sourceStageId = sourceContainer?.getAttribute('data-stage-id');
						const targetStageId = targetContainer?.getAttribute('data-stage-id');
						
						// Log tracking values for debugging (using actual targetStageId)
						console.log('[TaskBoardView] sortable:stop - Tracking values:', {
							autoExpandedColumnId,
							targetStageId,
							targetIsCollapsed: targetStageId ? collapsedColumns.has(targetStageId) : null,
							idsMatch: targetStageId ? autoExpandedColumnId === targetStageId : null,
							allCollapsedColumns: Array.from(collapsedColumns),
							shouldKeepOpen: targetStageId && autoExpandedColumnId === targetStageId && collapsedColumns.has(targetStageId)
						});
						
						// If dropped into the auto-expanded column, keep it open permanently
						// We need to update the state BEFORE clearing autoExpandedColumnId so the column stays open
						if (targetStageId && autoExpandedColumnId === targetStageId && collapsedColumns.has(targetStageId)) {
							console.log('[TaskBoardView] Keeping column open - removing from collapsedColumns:', targetStageId);
							collapsedColumns.delete(targetStageId);
							collapsedColumns = new Set(collapsedColumns); // Trigger reactivity immediately
							console.log('[TaskBoardView] After update - collapsedColumns:', Array.from(collapsedColumns));
						} else {
							console.log('[TaskBoardView] Column will not be kept open:', {
								hasTarget: !!targetStageId,
								idsMatch: targetStageId ? autoExpandedColumnId === targetStageId : false,
								wasCollapsed: targetStageId ? collapsedColumns.has(targetStageId) : false
							});
						}
						
						// Clear auto-expansion tracking AFTER state has been updated
						// Use requestAnimationFrame to ensure the DOM has updated with the new collapsedColumns state
						requestAnimationFrame(() => {
							console.log('[TaskBoardView] Clearing autoExpandedColumnId. Current value:', autoExpandedColumnId);
							console.log('[TaskBoardView] Current collapsedColumns before clear:', Array.from(collapsedColumns));
							autoExpandedColumnId = null;
							console.log('[TaskBoardView] After clearing autoExpandedColumnId. collapsedColumns:', Array.from(collapsedColumns));
						});
						
						console.log('[TaskBoardView] sortable:stop event:', {
							taskId,
							sourceStageId,
							targetStageId,
							hasSourceContainer: !!sourceContainer,
							hasTargetContainer: !!targetContainer,
							elementParent: taskElement?.parentElement?.getAttribute('data-stage-id'),
							containersCount: containers.length
						});
						
						// CRITICAL: Validate all required values are present and valid UUIDs
						if (!taskId || !targetStageId || !sourceStageId) {
							console.error('[TaskBoardView] Missing required values for status change:', {
								taskId: !!taskId,
								targetStageId: !!targetStageId,
								sourceStageId: !!sourceStageId,
								taskIdValue: taskId,
								targetStageIdValue: targetStageId,
								sourceStageIdValue: sourceStageId
							});
							draggedTaskId = null;
							draggedSourceContainer = null;
							return;
						}
						
						// Only dispatch if task actually moved to a different column
						if (sourceStageId !== targetStageId) {
							// Prevent duplicate dispatches for the same task/stage combination
							const now = Date.now();
							if (
								lastProcessedStop &&
								lastProcessedStop.taskId === taskId &&
								lastProcessedStop.targetStageId === targetStageId &&
								now - lastProcessedStop.timestamp < 300 // Within 300ms
							) {
								console.log('[TaskBoardView] Duplicate sortable:stop detected, skipping dispatch:', {
									taskId,
									targetStageId,
									timeSinceLast: now - lastProcessedStop.timestamp
								});
								return;
							}
							
							// Mark this as processed
							lastProcessedStop = {
								taskId,
								targetStageId,
								timestamp: now
							};
							
							// CRITICAL: Dispatch the statusChange event FIRST, before Shopify's DOM manipulation completes
							// This allows the parent component to update the tasks array immediately,
							// which will cause Svelte to re-render and remove the task from the old column
							// before Shopify's DOM move creates a duplicate
							console.log('[TaskBoardView] Task moved between columns, dispatching events:', {
								taskId,
								from: sourceStageId,
								to: targetStageId
							});
							
							// Dispatch immediately - the parent will handle the optimistic update
							dispatch('statusChange', { id: taskId, status_id: targetStageId });
							
							// Use double requestAnimationFrame to ensure Svelte has fully re-rendered before cleanup
							// This prevents the task from appearing in both columns when Shopify moves the DOM
							// but Svelte hasn't re-rendered yet
							requestAnimationFrame(() => {
								requestAnimationFrame(() => {
									// Find ALL task wrappers with this ID (there might be duplicates)
									const taskWrappers = Array.from(document.querySelectorAll(`.task-card-wrapper[data-task-id="${taskId}"]`));
									
									if (taskWrappers.length > 1) {
										console.warn('[TaskBoardView] Found duplicate task elements, cleaning up:', {
											taskId,
											count: taskWrappers.length,
											targetStageId,
											wrappers: taskWrappers.map(w => {
												const container = w.closest('[data-stage-id]');
												return container?.getAttribute('data-stage-id');
											})
										});
										
										// Find wrappers in the correct target container
										const correctWrappers: Element[] = [];
										const wrongWrappers: Element[] = [];
										
										taskWrappers.forEach((wrapper) => {
											const container = wrapper.closest('[data-stage-id]');
											const containerStageId = container?.getAttribute('data-stage-id');
											
											if (containerStageId === targetStageId) {
												correctWrappers.push(wrapper);
											} else {
												wrongWrappers.push(wrapper);
											}
										});
										
										// If we have correct wrappers, keep only the first one and remove all others (including duplicates in target)
										if (correctWrappers.length > 0) {
											// Keep the first correct wrapper, remove all others
											for (let i = 1; i < correctWrappers.length; i++) {
												const wrapper = correctWrappers[i];
												if (wrapper.parentNode) {
													console.log('[TaskBoardView] Removing duplicate task from target container');
													wrapper.remove();
												}
											}
										}
										
										// Remove all wrappers in wrong containers
										wrongWrappers.forEach((wrapper) => {
											if (wrapper.parentNode) {
												const container = wrapper.closest('[data-stage-id]');
												const containerStageId = container?.getAttribute('data-stage-id');
												console.log('[TaskBoardView] Removing duplicate task from wrong container:', containerStageId);
												wrapper.remove();
											}
										});
										
										// If no correct wrappers found but we have wrappers, keep first and remove rest
										if (correctWrappers.length === 0 && taskWrappers.length > 0) {
											console.warn('[TaskBoardView] No wrapper found in target container, keeping first and removing others');
											for (let i = 1; i < taskWrappers.length; i++) {
												const wrapper = taskWrappers[i];
												if (wrapper.parentNode) {
													wrapper.remove();
												}
											}
										}
									}
								});
							});
						} else {
							console.log('[TaskBoardView] Task dragged within same column, no status change needed');
						}
						
						// Reset tracking after a short delay to allow event to complete
						setTimeout(() => {
							draggedTaskId = null;
							draggedSourceContainer = null;
							originalTaskStatusId = null;
						}, 500);
					});
				} catch (error) {
					console.error('Failed to initialize Sortable:', error);
				}
			})();
		}

		return () => {
			if (sortableInstance) {
				sortableInstance.destroy();
				sortableInstance = null;
			}
		};
	});
</script>

<div 
	class="task-board-container flex gap-4 overflow-x-auto h-full p-4"
	bind:this={boardContainer}
>
	{#each stages as stage (stage.id)}
		{@const stageTasks = tasksByStage[stage.id] || []}
		{@const isCollapsed = collapsedColumns.has(stage.id)}
		{@const isVisuallyExpanded = autoExpandedColumnId === stage.id}
		{@const subtaskCounts = stageSubtaskCounts[stage.id] || { total: 0, completed: 0 }}
		{@const effectiveWidth = (isCollapsed && !isVisuallyExpanded) ? '80px' : '320px'}
		{@const effectivePadding = (isCollapsed && !isVisuallyExpanded) ? '0.75rem' : '1rem'}
		<div
			class="board-column flex-shrink-0 rounded-lg flex flex-col transition-all duration-300"
			style="background-color: var(--theme-section-bg, rgba(255, 255, 255, 0.9)); width: {effectiveWidth}; padding: {effectivePadding};"
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
						{stageTasks.length}
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
						<div>{stageTasks.length}</div>
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
			<div 
				class="{stageTasks.length === 0 && isDragging ? 'task-column' : 'space-y-3 overflow-y-auto task-column flex-1 min-h-0'}" 
				style="max-height: calc(100vh - 250px); {stageTasks.length === 0 && isDragging ? 'min-height: 0 !important; height: 0 !important; padding: 0 !important; margin: 0 !important; overflow: visible;' : 'min-height: 400px;'} opacity: {(isCollapsed && !isVisuallyExpanded) ? '0' : '1'}; pointer-events: {(isCollapsed && !isVisuallyExpanded) ? 'none' : 'auto'}; position: relative;"
				data-stage-id={stage.id}
				use:columnContainer={stage.id}
			>
				{#if stageTasks.length === 0 && !isDragging}
					<div
						class="border-2 border-dashed rounded-lg p-8 text-center flex-1 flex items-center justify-center"
						style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); min-height: 400px;"
					>
						<p class="text-sm" style="color: var(--theme-text-muted, #78716c);">
							Drop tasks here or click + to add
						</p>
					</div>
				{:else if stageTasks.length === 0 && isDragging}
					<!-- Empty column when dragging - completely empty, container collapsed to zero height -->
					<!-- This ensures ghost appears at the top of the column container -->
				{:else}
					{#each stageTasks as task (task.id)}
						<div class="task-card-wrapper" data-task-id={task.id}>
						<TaskCard
							{...task}
							{statusOptions}
							viewMode="board"
								draggable={false}
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

	:global(.draggable-source--is-dragging) {
		opacity: 0.5;
	}

	:global(.draggable-mirror) {
		opacity: 0.9;
		cursor: grabbing;
		pointer-events: none;
		z-index: 9999;
		/* Let Shopify Draggable handle positioning - don't override transforms */
		/* Just ensure it's visible and has proper styling */
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	/* Ensure the mirror element is positioned correctly relative to cursor */
	:global(.draggable-mirror *) {
		pointer-events: none;
	}
</style>

