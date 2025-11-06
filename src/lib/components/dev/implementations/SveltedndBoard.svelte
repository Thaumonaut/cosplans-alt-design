<script lang="ts">
	import { browser } from '$app/environment';
	import { dndzone } from 'svelte-dnd-action';
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

	// Create reactive arrays for each stage's tasks
	let stageTasks: Record<string, MockTask[]> = $state(
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

	function handleDragMove(e: MouseEvent | TouchEvent) {
		if (!isDragging) return;
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

	let draggedSourceStage: string | null = $state(null);

	function handleConsider(e: CustomEvent, stageId: string) {
		const { items, info } = e.detail;
		stageTasks[stageId] = items;
		
		if (info) {
			// First time drag starts from this zone
			if (!draggedSourceStage && info.initiator) {
				draggedSourceStage = stageId;
			}
			if (info.initiator) {
				isDragging = true;
				autoExpandedColumnId = null;
				document.addEventListener('mousemove', handleDragMove, { passive: true });
				document.addEventListener('touchmove', handleDragMove, { passive: true });
			}
		}
	}

	function handleFinalize(e: CustomEvent, stageId: string) {
		const { items, info } = e.detail;
		stageTasks[stageId] = items;
		
		if (info && draggedSourceStage) {
			// Check if item was moved between stages
			const activeIndex = info.activeIndex;
			if (activeIndex !== undefined && activeIndex !== null) {
				const draggedItem = items[activeIndex];
				if (draggedItem && draggedSourceStage !== stageId && onTaskMove) {
					onTaskMove(draggedItem.id, stageId);
				}
			}
		}
		
		isDragging = false;
		autoExpandedColumnId = null;
		draggedSourceStage = null;
		document.removeEventListener('mousemove', handleDragMove);
		document.removeEventListener('touchmove', handleDragMove);
	}

	// Update stage tasks when tasks prop changes
	$effect(() => {
		stageTasks = stages.reduce((acc, stage) => {
			acc[stage.id] = tasks.filter((task) => task.status_id === stage.id);
			return acc;
		}, {} as Record<string, MockTask[]>);
	});
</script>

<div class="task-board-container flex gap-4 overflow-x-auto p-4" bind:this={boardContainer} style="min-height: 600px;">
	{#each stages as stage (stage.id)}
		{@const tasks = stageTasks[stage.id] || []}
		{@const isCollapsed = collapsedColumns.has(stage.id)}
		{@const isVisuallyExpanded = !isCollapsed || autoExpandedColumnId === stage.id}
		<div
			class="board-column flex flex-col min-w-[300px] max-w-[300px] rounded-lg border"
			style="background-color: var(--theme-card-bg, white); border-color: var(--theme-border, rgba(120, 113, 108, 0.2));"
			data-stage-id={stage.id}
		>
			<!-- Column Header -->
			<div class="flex items-center justify-between p-4 border-b" style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
				<div class="flex items-center gap-2">
					{#if stage.color}
						<div class="w-3 h-3 rounded-full" style="background-color: {stage.color}"></div>
					{/if}
					<h3 class="font-semibold" style="color: var(--theme-foreground, #1c1917);">{stage.name}</h3>
					<span class="text-sm" style="color: var(--theme-text-muted, #78716c);">({tasks.length})</span>
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
				use:dndzone={{
					items: tasks,
					flipDurationMs: 150,
					dragDisabled: false
				}}
				onconsider={(e) => handleConsider(e, stage.id)}
				onfinalize={(e) => handleFinalize(e, stage.id)}
			>
				{#if tasks.length === 0 && !isDragging}
					<div class="border-2 border-dashed rounded-lg p-8 text-center" style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
						<p class="text-sm" style="color: var(--theme-text-muted, #78716c);">Drop tasks here</p>
					</div>
				{:else}
					{#each tasks as task (task.id)}
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

