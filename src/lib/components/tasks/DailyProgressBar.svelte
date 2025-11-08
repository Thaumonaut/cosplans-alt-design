<script lang="ts">
	/**
	 * DailyProgressBar Component
	 * 
	 * Displays daily task completion progress (e.g., "3/8 tasks complete").
	 * Shows a progress bar with completed vs total tasks for today.
	 * Updates in real-time as tasks are completed.
	 */
	interface Props {
		completedTasks: number;
		totalTasks: number;
	}

	let { completedTasks = 0, totalTasks = 0 }: Props = $props();

	const percentage = $derived(
		totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
	);

	const progressColor = $derived(() => {
		if (percentage === 100) return 'var(--theme-success, #10b981)';
		if (percentage >= 75) return 'var(--theme-primary, #8b5cf6)';
		if (percentage >= 50) return 'var(--theme-warning, #f59e0b)';
		return 'var(--theme-error, #ef4444)';
	});
</script>

<div class="daily-progress-bar flex items-center gap-3">
	<!-- Progress Text -->
	<div class="flex items-center gap-2 text-sm font-medium" style="color: var(--theme-foreground, #1c1917);">
		<span class="font-semibold" style="color: var(--theme-foreground, #1c1917);">
			{completedTasks}/{totalTasks}
		</span>
		<span style="color: var(--theme-text-muted, #78716c);">tasks complete</span>
	</div>

	<!-- Progress Bar -->
	<div class="flex-1 min-w-[120px] max-w-[200px]">
		<div class="w-full rounded-full h-2 overflow-hidden" style="background-color: var(--theme-border-subtle, rgba(120, 113, 108, 0.1));">
			<div
				class="h-2 rounded-full transition-all duration-500"
				style="width: {percentage}%; background-color: {progressColor()};"
				role="progressbar"
				aria-valuenow={percentage}
				aria-valuemin="0"
				aria-valuemax="100"
				aria-label="Daily task completion progress: {completedTasks} of {totalTasks} tasks complete"
			/>
		</div>
	</div>

	<!-- Percentage -->
	{#if totalTasks > 0}
		<div class="text-xs font-medium min-w-[3rem] text-right" style="color: var(--theme-text-muted, #78716c);">
			{percentage}%
		</div>
	{/if}
</div>

<style>
	.daily-progress-bar {
		min-height: 2rem;
	}
</style>

