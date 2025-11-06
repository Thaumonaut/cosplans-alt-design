<script lang="ts">
	import { browser } from '$app/environment';
	import { draggable } from '@neodrag/svelte';
	import TestTaskCard from '../TestTaskCard.svelte';
	import type { MockStage, MockTask } from '../mockData';

	interface Props {
		stages: MockStage[];
		tasks: MockTask[];
		onTaskMove?: (taskId: string, newStageId: string) => void;
	}

	let { stages, tasks, onTaskMove }: Props = $props();

	let boardContainer: HTMLElement | null = $state(null);
	let isDragging = $state(false);
	let collapsedColumns = $state(new Set<string>());
	let autoExpandedColumnId: string | null = $state(null);
	let draggedTaskId: string | null = $state(null);
	let draggedTask: MockTask | null = $state(null);
	let dragStartPosition = $state<{ x: number; y: number } | null>(null);

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

	function getHoveredColumnId(mouseX: number, mouseY: number): string | null {
		if (!boardContainer) return null;
		const columns = boardContainer.querySelectorAll('.board-column');
		for (const column of columns) {
			const rect = column.getBoundingClientRect();
			if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
				const stageId = column.querySelector('[data-stage-id]')?.getAttribute('data-stage-id');
				if (stageId) return stageId;
			}
		}
		return null;
	}

	function handleDragStart(task: MockTask, event: any) {
		draggedTaskId = task.id;
		draggedTask = task;
		isDragging = true;
		autoExpandedColumnId = null;
		if (event.detail) {
			dragStartPosition = { x: event.detail.x, y: event.detail.y };
		}
		document.addEventListener('mousemove', handleDragMove, { passive: true });
		document.addEventListener('touchmove', handleDragMove, { passive: true });
	}

	function handleDragMove(e: MouseEvent | TouchEvent) {
		if (!draggedTaskId) return;
		const mouseX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
		const mouseY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
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

	function handleDrop(event: DragEvent, targetStageId: string) {
		if (draggedTaskId && onTaskMove) {
			onTaskMove(draggedTaskId, targetStageId);
		}
		resetDrag();
	}

	function resetDrag() {
		draggedTaskId = null;
		draggedTask = null;
		isDragging = false;
		autoExpandedColumnId = null;
		dragStartPosition = null;
		document.removeEventListener('mousemove', handleDragMove);
		document.removeEventListener('touchmove', handleDragMove);
	}

	// Note: Neodrag is primarily designed for dragging individual elements within bounds,
	// not for sortable lists with multiple containers. This implementation uses a workaround
	// with drop zones, which may not provide the same UX as dedicated sortable libraries.
</script>

<div class="task-board-container flex gap-4 overflow-x-auto p-4" bind:this={boardContainer} style="min-height: 600px;">
	{#each stages as stage (stage.id)}
		{@const stageTasks = tasksByStage[stage.id] || []}
		{@const isCollapsed = collapsedColumns.has(stage.id)}
		{@const isVisuallyExpanded = !isCollapsed || autoExpandedColumnId === stage.id}
		<div
			class="board-column flex flex-col min-w-[300px] max-w-[300px] rounded-lg border drop-zone"
			style="background-color: var(--theme-card-bg, white); border-color: var(--theme-border, rgba(120, 113, 108, 0.2));"
			ondrop={(e) => {
				e.preventDefault();
				handleDrop(e, stage.id);
			}}
			ondragover={(e) => e.preventDefault()}
			data-stage-id={stage.id}
		>
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
			>
				{#if stageTasks.length === 0 && !isDragging}
					<div class="border-2 border-dashed rounded-lg p-8 text-center" style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
						<p class="text-sm" style="color: var(--theme-text-muted, #78716c);">Drop tasks here</p>
					</div>
				{:else}
					{#each stageTasks as task (task.id)}
						<div
							class="task-card-wrapper"
							data-task-id={task.id}
							use:draggable={{
								bounds: 'parent'
							}}
							onneodragstart={(e) => handleDragStart(task, e)}
							onneodragend={resetDrag}
							draggable="true"
						>
							<TestTaskCard {task} viewMode="board" draggable={true} />
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/each}
</div>

<div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
	<p class="text-sm text-yellow-800">
		<strong>Note:</strong> Neodrag is primarily designed for dragging individual elements within bounds, not for sortable lists.
		This implementation uses a workaround with HTML5 drag-and-drop API, which may not provide the same UX as dedicated sortable libraries.
	</p>
</div>

<style>
	.task-board-container {
		contain: layout;
	}
</style>

