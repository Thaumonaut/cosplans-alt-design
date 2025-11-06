<script lang="ts">
	import { browser } from '$app/environment';
	import TestTaskCard from '../TestTaskCard.svelte';
	import type { MockStage, MockTask } from '../mockData';

	interface Props {
		stages: MockStage[];
		tasks: MockTask[];
		onTaskMove?: (taskId: string, newStageId: string) => void;
	}

	let { stages, tasks, onTaskMove }: Props = $props();

	let sortableInstance: any = null;
	let columnRefs: Map<string, HTMLElement> = $state(new Map());
	let boardContainer: HTMLElement | null = $state(null);
	let isDragging = $state(false);
	let collapsedColumns = $state(new Set<string>());
	let autoExpandedColumnId: string | null = $state(null);

	// Group tasks by stage
	const tasksByStage = $derived(
		stages.reduce((acc, stage) => {
			acc[stage.id] = tasks.filter((task) => task.status_id === stage.id);
			return acc;
		}, {} as Record<string, MockTask[]>)
	);

	function toggleColumnCollapse(stageId: string) {
		if (collapsedColumns.has(stageId)) {
			collapsedColumns.delete(stageId);
		} else {
			collapsedColumns.add(stageId);
		}
		collapsedColumns = new Set(collapsedColumns);
	}

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
		const scrollThreshold = 100;
		const scrollSpeed = 10;
		const distanceFromLeft = clientX - containerRect.left;
		const distanceFromRight = containerRect.right - clientX;
		if (distanceFromLeft < scrollThreshold && boardContainer.scrollLeft > 0) {
			const scrollAmount = Math.min(scrollSpeed, boardContainer.scrollLeft);
			boardContainer.scrollBy({ left: -scrollAmount, behavior: 'auto' });
		}
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
		const containers = Array.from(columnRefs.values());
		if (containers.length > 0 && stages.length > 0) {
			const _ = collapsedColumns;
			(async () => {
				try {
					const { Sortable } = await import('@shopify/draggable');
					if (sortableInstance) {
						sortableInstance.destroy();
						sortableInstance = null;
					}
					sortableInstance = new Sortable(containers, {
						draggable: '.task-card-wrapper',
						mirror: {
							constrainDimensions: true,
							appendTo: 'body',
							xAxis: true,
							yAxis: true
						}
					});

					let draggedTaskId: string | null = null;
					let draggedSourceContainer: HTMLElement | null = null;
					let currentDragX: number | null = null;
					let autoScrollInterval: number | null = null;

					function getHoveredColumnId(mouseX: number, mouseY: number): string | null {
						if (!boardContainer) return null;
						for (const [stageId, container] of columnRefs.entries()) {
							const rect = container.getBoundingClientRect();
							if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
								return stageId;
							}
						}
						return null;
					}

					const handleDragMove = (e: MouseEvent | TouchEvent) => {
						if (draggedTaskId) {
							const mouseX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
							const mouseY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
							currentDragX = mouseX;
							handleAutoScroll(e);
							if (mouseX !== null && mouseY !== null) {
								const hoveredStageId = getHoveredColumnId(mouseX, mouseY);
								if (hoveredStageId && collapsedColumns.has(hoveredStageId)) {
									if (autoExpandedColumnId !== hoveredStageId) {
										autoExpandedColumnId = hoveredStageId;
									}
								} else if (autoExpandedColumnId !== null) {
									autoExpandedColumnId = null;
								}
							}
						}
					};

					sortableInstance.on('sortable:start', (event: any) => {
						const source = event.data?.source || event.data?.dragEvent?.data?.source;
						if (source) {
							draggedTaskId = source.getAttribute('data-task-id');
							draggedSourceContainer = event.data?.sourceContainer || event.data?.dragEvent?.data?.sourceContainer;
							isDragging = true;
							autoExpandedColumnId = null;
							document.addEventListener('mousemove', handleDragMove, { passive: true });
							document.addEventListener('touchmove', handleDragMove, { passive: true });
						}
					});

					sortableInstance.on('sortable:sort', (event: any) => {
						const dragEvent = event.data?.dragEvent?.data;
						if (dragEvent?.originalEvent) {
							const originalEvent = dragEvent.originalEvent;
							const mouseX = 'touches' in originalEvent ? originalEvent.touches[0]?.clientX : originalEvent.clientX;
							const mouseY = 'touches' in originalEvent ? originalEvent.touches[0]?.clientY : originalEvent.clientY;
							currentDragX = mouseX;
							if (!autoScrollInterval && boardContainer && mouseX !== null) {
								autoScrollInterval = window.setInterval(() => {
									if (currentDragX !== null && boardContainer) {
										const syntheticEvent = { clientX: currentDragX, touches: [] } as unknown as MouseEvent;
										handleAutoScroll(syntheticEvent);
									}
								}, 16);
							}
							if (mouseX !== null && mouseY !== null) {
								const hoveredStageId = getHoveredColumnId(mouseX, mouseY);
								if (hoveredStageId && collapsedColumns.has(hoveredStageId)) {
									if (autoExpandedColumnId !== hoveredStageId) {
										autoExpandedColumnId = hoveredStageId;
									}
								} else if (autoExpandedColumnId !== null) {
									autoExpandedColumnId = null;
								}
							}
						}
					});

					sortableInstance.on('sortable:stop', (event: any) => {
						if (autoScrollInterval !== null) {
							clearInterval(autoScrollInterval);
							autoScrollInterval = null;
						}
						currentDragX = null;
						isDragging = false;
						document.removeEventListener('mousemove', handleDragMove);
						document.removeEventListener('touchmove', handleDragMove);
						const taskElement = event.data?.dragEvent?.data?.source || event.data?.source;
						const taskId = taskElement?.getAttribute('data-task-id') || draggedTaskId;
						if (!taskId || !taskElement) {
							draggedTaskId = null;
							draggedSourceContainer = null;
							return;
						}
						let targetContainer: HTMLElement | null = null;
						for (const container of containers) {
							if (container.contains(taskElement)) {
								targetContainer = container;
								break;
							}
						}
						if (!targetContainer) {
							let parent: HTMLElement | null = taskElement.parentElement;
							while (parent) {
								if (containers.includes(parent)) {
									targetContainer = parent;
									break;
								}
								parent = parent.parentElement;
							}
						}
						const targetStageId = targetContainer?.getAttribute('data-stage-id');
						if (targetStageId && onTaskMove) {
							onTaskMove(taskId, targetStageId);
						}
						draggedTaskId = null;
						draggedSourceContainer = null;
						autoExpandedColumnId = null;
					});
				} catch (error) {
					console.error('Failed to initialize Shopify Draggable:', error);
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

<div class="task-board-container flex gap-4 overflow-x-auto p-4" bind:this={boardContainer} style="min-height: 600px;">
	{#each stages as stage (stage.id)}
		{@const stageTasks = tasksByStage[stage.id] || []}
		{@const isCollapsed = collapsedColumns.has(stage.id)}
		{@const isVisuallyExpanded = !isCollapsed || autoExpandedColumnId === stage.id}
		<div class="board-column flex flex-col min-w-[300px] max-w-[300px] rounded-lg border" style="background-color: var(--theme-card-bg, white); border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
			<!-- Column Header -->
			<div class="flex items-center justify-between p-4 border-b" style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
				<div class="flex items-center gap-2">
					{#if stage.color}
						<div class="w-3 h-3 rounded-full" style="background-color: {stage.color}"></div>
					{/if}
					<h3 class="font-semibold" style="color: var(--theme-foreground, #1c1917);">{stage.name}</h3>
					<span class="text-sm" style="color: var(--theme-text-muted, #78716c);">({stageTasks.length})</span>
				</div>
				<button
					type="button"
					class="p-1 rounded hover:bg-muted/50"
					style="color: var(--theme-text-muted, #78716c);"
					onclick={() => toggleColumnCollapse(stage.id)}
					title={isCollapsed ? 'Expand column' : 'Collapse column'}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={isCollapsed ? 'M9 5l7 7-7 7' : 'M19 9l-7 7-7-7'} />
					</svg>
				</button>
			</div>

			<!-- Tasks in Column -->
			<div
				class="space-y-3 overflow-y-auto task-column flex-1 min-h-0 p-3"
				style="max-height: calc(100vh - 250px); min-height: 400px; opacity: {isVisuallyExpanded ? '1' : '0'}; pointer-events: {isVisuallyExpanded ? 'auto' : 'none'}; position: relative;"
				data-stage-id={stage.id}
				use:columnContainer={stage.id}
			>
				{#if stageTasks.length === 0 && !isDragging}
					<div class="border-2 border-dashed rounded-lg p-8 text-center" style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
						<p class="text-sm" style="color: var(--theme-text-muted, #78716c);">Drop tasks here</p>
					</div>
				{:else}
					{#each stageTasks as task (task.id)}
						<div class="task-card-wrapper" data-task-id={task.id}>
							<TestTaskCard {task} viewMode="board" draggable={true} />
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
</style>

