<script lang="ts">
	import type { MockTask } from './mockData';

	interface Props {
		task: MockTask;
		viewMode?: 'list' | 'board';
		draggable?: boolean;
	}

	let { task, viewMode = 'board', draggable = true }: Props = $props();
</script>

<div
	class="task-card-wrapper"
	style="position: relative;"
>
	<div
		class="task-card rounded-lg p-4 hover:shadow-lg transition-all border-[var(--theme-border)] {viewMode === 'board' ? 'mb-5 min-h-[200px]' : 'mb-5'} {draggable && viewMode === 'board' ? 'cursor-grab active:cursor-grabbing' : ''} relative"
		style="background-color: var(--theme-card-bg, white); border-color: var(--theme-border, rgba(120, 113, 108, 0.2));"
		data-task-id={task.id}
	>

	<!-- Title -->
	<h3 class="text-base font-semibold mb-2 line-clamp-2 leading-tight" style="color: var(--theme-foreground, #1c1917);">
		{task.title}
	</h3>

	<!-- Description -->
	{#if task.description}
		<p class="text-sm mb-3 line-clamp-2" style="color: var(--theme-text-muted, #78716c);">
			{task.description}
		</p>
	{/if}

	<!-- Priority Badge -->
	<div class="flex items-center gap-2 mb-2">
		<span
			class="text-xs px-2 py-1 rounded-full font-medium"
			style="background-color: {
				task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' :
				task.priority === 'medium' ? 'rgba(59, 130, 246, 0.1)' :
				'rgba(156, 163, 175, 0.1)'
			}; color: {
				task.priority === 'high' ? '#ef4444' :
				task.priority === 'medium' ? '#3b82f6' :
				'#9ca3af'
			};"
		>
			{task.priority.toUpperCase()}
		</span>
	</div>

	<!-- Due Date if set -->
	{#if task.due_date}
		<div class="flex items-center gap-2 text-sm" style="color: var(--theme-text-muted, #78716c);">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
			</svg>
			<span>{new Date(task.due_date).toLocaleDateString()}</span>
		</div>
	{/if}
	</div>
</div>


