<script lang="ts">
	/**
	 * TaskTimelineView Component
	 * 
	 * Renders tasks on a horizontal timeline (Gantt-style) with task bars.
	 * Shows tasks as horizontal bars spanning from creation date to due date.
	 */
	import { createEventDispatcher } from 'svelte';
	import { addDays, differenceInDays, startOfWeek, endOfWeek, format, isSameDay } from 'date-fns';
	import TaskCard from './TaskCard.svelte';

	interface Task {
		id: string;
		title: string;
		status_id: string;
		priority: 'low' | 'medium' | 'high';
		due_date?: string | null;
		created_at?: string;
		labels?: Array<{ id: string; name: string; color: string }>;
		subtask_completion_percentage?: number;
		assignee?: any;
	}

	interface Props {
		tasks: Task[];
		statusOptions?: Array<{ value: string; label: string; color?: string }>;
	}

	let {
		tasks,
		statusOptions = []
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		taskClick: { id: string };
	}>();

	// Timeline configuration
	let timelineStart = $state(startOfWeek(new Date(), { weekStartsOn: 0 }));
	let timelineEnd = $state(endOfWeek(addDays(new Date(), 60), { weekStartsOn: 0 })); // 2 months view
	let zoomLevel = $state<'day' | 'week' | 'month'>('week');

	const totalDays = $derived(differenceInDays(timelineEnd, timelineStart) + 1);
	const columnWidth = $derived(zoomLevel === 'day' ? 40 : zoomLevel === 'week' ? 100 : 200);
	const timelineWidth = $derived(totalDays * columnWidth);

	// Filter tasks with dates
	const tasksWithDates = $derived(
		tasks.filter(task => task.due_date || task.created_at)
	);

	// Generate date columns for header
	const dateColumns = $derived(() => {
		const columns: Date[] = [];
		let currentDate = new Date(timelineStart);
		
		while (currentDate <= timelineEnd) {
			columns.push(new Date(currentDate));
			currentDate = addDays(currentDate, 1);
		}
		
		return columns;
	});

	// Group dates by zoom level for header display
	const headerDates = $derived(() => {
		if (zoomLevel === 'day') {
			// Show every day
			return dateColumns.filter((_, i) => i % 7 === 0 || i === 0); // Show weekly markers
		} else if (zoomLevel === 'week') {
			// Show week start dates
			return dateColumns.filter((date, i) => date.getDay() === 0 || i === 0);
		} else {
			// Show month start dates
			const months = new Set<string>();
			return dateColumns.filter(date => {
				const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
				if (!months.has(monthKey)) {
					months.add(monthKey);
					return true;
				}
				return false;
			});
		}
	});

	function getTaskBarPosition(task: Task) {
		const startDate = task.created_at 
			? new Date(task.created_at) 
			: new Date(); // Fallback to today if no creation date
		const endDate = task.due_date 
			? new Date(task.due_date) 
			: addDays(startDate, 7); // Default 1 week duration if no due date

		// Clamp dates to timeline range
		const clampedStart = startDate < timelineStart ? timelineStart : startDate;
		const clampedEnd = endDate > timelineEnd ? timelineEnd : endDate;

		const startOffset = differenceInDays(clampedStart, timelineStart);
		const duration = Math.max(1, differenceInDays(clampedEnd, clampedStart));
		
		return {
			left: `${(startOffset / totalDays) * 100}%`,
			width: `${(duration / totalDays) * 100}%`,
			startDate: clampedStart,
			endDate: clampedEnd
		};
	}

	function handleTaskClick(taskId: string) {
		dispatch('taskClick', { id: taskId });
	}

	function handleZoomChange(level: 'day' | 'week' | 'month') {
		zoomLevel = level;
	}

	function handleTimelineScroll(event: Event) {
		// Could implement auto-scroll or sync with header
	}

	function getPriorityColor(priority: string): string {
		// Return empty string, we'll use inline styles instead
		return '';
	}
	
	function getPriorityStyle(priority: string): string {
		let bgColor = 'var(--theme-text-muted)';
		switch (priority) {
			case 'high':
				bgColor = 'var(--theme-error)';
				break;
			case 'medium':
				bgColor = 'var(--theme-warning)';
				break;
			case 'low':
				bgColor = 'var(--theme-success)';
				break;
		}
		return `background-color: ${bgColor};`;
	}
	
	function getTaskBarStyle(priority: string, position: { left: number; width: number }): string {
		return `${getPriorityStyle(priority)} left: ${position.left}px; width: ${position.width}px; min-width: 100px;`;
	}
</script>

<div class="task-timeline-container h-full flex flex-col" style="background-color: var(--theme-background, #fafaf9);">
	<!-- Timeline Controls -->
	<div class="flex items-center justify-between p-4 border-b" style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
		<div class="flex items-center gap-2">
			<button
				class="px-3 py-1 text-sm rounded transition-colors {zoomLevel === 'day' ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-card-bg)] hover:bg-[var(--theme-hover)]'}"
				style={zoomLevel === 'day' ? 'color: var(--theme-card-bg);' : 'color: var(--theme-foreground);'}
				onclick={() => handleZoomChange('day')}
			>
				Day
			</button>
			<button
				class="px-3 py-1 text-sm rounded transition-colors {zoomLevel === 'week' ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-card-bg)] hover:bg-[var(--theme-hover)]'}"
				style={zoomLevel === 'week' ? 'color: var(--theme-card-bg);' : 'color: var(--theme-foreground);'}
				onclick={() => handleZoomChange('week')}
			>
				Week
			</button>
			<button
				class="px-3 py-1 text-sm rounded transition-colors {zoomLevel === 'month' ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-card-bg)] hover:bg-[var(--theme-hover)]'}"
				style={zoomLevel === 'month' ? 'color: var(--theme-card-bg);' : 'color: var(--theme-foreground);'}
				onclick={() => handleZoomChange('month')}
			>
				Month
			</button>
		</div>
		<div class="text-sm" style="color: var(--theme-text-muted, #78716c);">
			{format(timelineStart, 'MMM d')} - {format(timelineEnd, 'MMM d, yyyy')}
		</div>
	</div>

	<!-- Timeline Header (Date columns) -->
	<div class="border-b overflow-x-auto" style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
		<div class="flex min-w-full" style="width: {timelineWidth}px;">
			{#each headerDates as date, i}
				<div
					class="flex-shrink-0 border-r p-2 text-xs text-center"
					style="width: {columnWidth}px; border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); color: var(--theme-foreground, #1c1917);"
				>
					<div class="font-medium">{format(date, 'MMM d')}</div>
					<div class="text-xs opacity-60">{format(date, 'EEE')}</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Timeline Content (Scrollable) -->
	<div class="flex-1 overflow-auto" onscroll={handleTimelineScroll}>
		{#if tasksWithDates.length === 0}
			<div class="flex items-center justify-center h-full p-8">
				<div class="text-center">
					<p class="text-sm" style="color: var(--theme-text-muted, #78716c);">
						No tasks with dates to display. Add due dates to tasks to see them on the timeline.
					</p>
				</div>
			</div>
		{:else}
			<div class="relative" style="min-width: {timelineWidth}px; min-height: {tasksWithDates.length * 60}px;">
				{#each tasksWithDates as task}
					{@const position = getTaskBarPosition(task)}
					<div class="relative h-14 border-b flex items-center" style="border-color: var(--theme-border, rgba(120, 113, 108, 0.1));">
						<!-- Task Label (Left side) -->
						<div class="w-64 flex-shrink-0 px-4 py-2 border-r" style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
							<div class="flex items-center gap-2">
								<div class="text-sm font-medium truncate" style="color: var(--theme-foreground, #1c1917);">
									{task.title}
								</div>
								{#if task.priority}
									<div class="w-2 h-2 rounded-full" style={getPriorityStyle(task.priority)}></div>
								{/if}
							</div>
							{#if task.due_date}
								<div class="text-xs" style="color: var(--theme-text-muted, #78716c);">
									Due: {format(new Date(task.due_date), 'MMM d')}
								</div>
							{/if}
						</div>

						<!-- Timeline Bar Area (Right side) -->
						<div class="flex-1 relative h-full">
							<!-- Task Bar -->
							<button
								class="absolute top-1/2 -translate-y-1/2 h-8 rounded px-2 flex items-center gap-2 transition-all hover:opacity-90 cursor-pointer"
								style={getTaskBarStyle(task.priority, position)}
								onclick={() => handleTaskClick(task.id)}
								title="{task.title} - {format(position.startDate, 'MMM d')} to {format(position.endDate, 'MMM d')}"
							>
								<span class="text-xs font-medium truncate" style="color: var(--theme-card-bg);">{task.title}</span>
								{#if task.subtask_completion_percentage !== undefined}
									<div class="ml-auto text-xs" style="color: var(--theme-card-bg); opacity: 0.8;">
										{task.subtask_completion_percentage}%
									</div>
								{/if}
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.task-timeline-container {
		contain: layout;
	}
</style>

