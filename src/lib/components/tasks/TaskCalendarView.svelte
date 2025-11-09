<script lang="ts">
	/**
	 * TaskCalendarView Component
	 * 
	 * Renders tasks on a calendar grid by due date.
	 * Shows month view with tasks displayed on their due dates.
	 */
	import { createEventDispatcher } from 'svelte';

	interface Task {
		id: string;
		title: string;
		status_id: string;
		priority: 'low' | 'medium' | 'high';
		due_date?: string | null;
		labels?: Array<{ id: string; name: string; color: string }>;
	}

	interface Props {
		tasks: Task[];
		currentMonth?: Date;
	}

	let { tasks, currentMonth = $bindable(new Date()) }: Props = $props();

	const dispatch = createEventDispatcher<{
		taskClick: { id: string };
		monthChange: { month: Date };
	}>();

	// Calendar calculations
	const year = $derived(currentMonth.getFullYear());
	const month = $derived(currentMonth.getMonth());
	
	const firstDayOfMonth = $derived(new Date(year, month, 1));
	const lastDayOfMonth = $derived(new Date(year, month + 1, 0));
	const daysInMonth = $derived(lastDayOfMonth.getDate());
	const startDayOfWeek = $derived(firstDayOfMonth.getDay()); // 0 = Sunday

	// Build calendar grid (6 weeks max)
	const calendarDays = $derived(() => {
		const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];
		
		// Previous month padding
		const prevMonthLastDay = new Date(year, month, 0).getDate();
		for (let i = startDayOfWeek - 1; i >= 0; i--) {
			days.push({
				date: new Date(year, month - 1, prevMonthLastDay - i),
				isCurrentMonth: false,
			});
		}
		
		// Current month days
		for (let day = 1; day <= daysInMonth; day++) {
			days.push({
				date: new Date(year, month, day),
				isCurrentMonth: true,
			});
		}
		
		// Next month padding
		const remaining = 42 - days.length; // 6 rows * 7 days
		for (let day = 1; day <= remaining; day++) {
			days.push({
				date: new Date(year, month + 1, day),
				isCurrentMonth: false,
			});
		}
		
		return days;
	});

	// Group tasks by date
	const tasksByDate = $derived(
		tasks.reduce((acc, task) => {
			if (task.due_date) {
				const dateKey = new Date(task.due_date).toISOString().split('T')[0];
				if (!acc[dateKey]) acc[dateKey] = [];
				acc[dateKey].push(task);
			}
			return acc;
		}, {} as Record<string, Task[]>)
	);

	// Tasks without due dates
	const undatedTasks = $derived(tasks.filter((task) => !task.due_date));

	function getTasksForDate(date: Date): Task[] {
		const dateKey = date.toISOString().split('T')[0];
		return tasksByDate[dateKey] || [];
	}

	function isToday(date: Date): boolean {
		const today = new Date();
		return (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		);
	}

	function handleTaskClick(taskId: string) {
		dispatch('taskClick', { id: taskId });
	}

	function previousMonth() {
		currentMonth = new Date(year, month - 1, 1);
		dispatch('monthChange', { month: currentMonth });
	}

	function nextMonth() {
		currentMonth = new Date(year, month + 1, 1);
		dispatch('monthChange', { month: currentMonth });
	}

	function goToToday() {
		currentMonth = new Date();
		dispatch('monthChange', { month: currentMonth });
	}

	const monthName = $derived(
		currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
	);

	function getPriorityColor(priority: string): string {
		switch (priority) {
			case 'high':
				return 'var(--theme-error)';
			case 'medium':
				return 'var(--theme-warning)';
			case 'low':
				return 'var(--theme-success)';
			default:
				return 'var(--theme-text-muted)';
		}
	}
</script>

<div class="calendar-container h-full flex flex-col">
	<!-- Calendar Header -->
	<div class="flex items-center justify-between p-4 border-b" style="border-color: var(--theme-border);">
		<h2 class="text-lg font-semibold" style="color: var(--theme-foreground);">{monthName}</h2>
		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={()=>goToToday}
				class="px-3 py-1.5 text-sm font-medium rounded transition-colors"
				style="color: var(--theme-foreground); background-color: var(--theme-card-bg); border-color: var(--theme-border);"
				onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-hover)'}
				onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)'}
			>
				Today
			</button>
			<button
				type="button"
				onclick={()=>previousMonth}
				class="p-1.5 transition-colors"
				style="color: var(--theme-text-muted);"
				aria-label="Previous month"
				onmouseenter={(e) => e.currentTarget.style.color = 'var(--theme-foreground)'}
				onmouseleave={(e) => e.currentTarget.style.color = 'var(--theme-text-muted)'}
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
			<button
				type="button"
				onclick={()=>nextMonth}
				class="p-1.5 transition-colors"
				style="color: var(--theme-text-muted);"
				aria-label="Next month"
				onmouseenter={(e) => e.currentTarget.style.color = 'var(--theme-foreground)'}
				onmouseleave={(e) => e.currentTarget.style.color = 'var(--theme-text-muted)'}
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		</div>
	</div>

	<!-- Day Headers -->
	<div class="grid grid-cols-7 border-b" style="border-color: var(--theme-border);">
		{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
			<div class="p-2 text-xs font-semibold text-center" style="color: var(--theme-text-muted);">
				{day}
			</div>
		{/each}
	</div>

	<!-- Calendar Grid -->
	<div class="flex-1 grid grid-cols-7 auto-rows-fr overflow-auto">
		{#each calendarDays() as day (day.date.toISOString())}
			{@const dateTasks = getTasksForDate(day.date)}
			<div
				class="border-r border-b p-2 overflow-y-auto"
				style="border-color: var(--theme-border); {!day.isCurrentMonth ? 'background-color: var(--theme-section-bg); opacity: 0.6;' : ''} {isToday(day.date) ? 'background-color: color-mix(in srgb, var(--theme-primary) 10%, transparent);' : ''}"
			>
				<div class="flex items-center justify-between mb-1">
					<span
						class="text-sm font-medium"
						style={!day.isCurrentMonth
							? 'color: var(--theme-text-muted); opacity: 0.5;'
							: isToday(day.date)
							? 'color: var(--theme-primary); font-weight: 600;'
							: 'color: var(--theme-foreground);'}
					>
						{day.date.getDate()}
					</span>
					{#if dateTasks.length > 0}
						<span class="text-xs" style="color: var(--theme-text-muted);">
							{dateTasks.length}
						</span>
					{/if}
				</div>

				<!-- Tasks for this date -->
				<div class="space-y-1">
					{#each dateTasks.slice(0, 3) as task (task.id)}
						<button
							type="button"
							onclick={() => handleTaskClick(task.id)}
							class="w-full text-left text-xs p-1.5 rounded transition-shadow truncate"
							style="background-color: var(--theme-card-bg); border: 1px solid var(--theme-border); color: var(--theme-foreground);"
							onmouseenter={(e) => e.currentTarget.style.boxShadow = 'var(--theme-shadow-sm)'}
							onmouseleave={(e) => e.currentTarget.style.boxShadow = 'none'}
						>
							<div class="flex items-center gap-1">
								<div class="w-2 h-2 rounded-full" style="background-color: {getPriorityColor(task.priority)};" />
								<span class="truncate">{task.title}</span>
							</div>
						</button>
					{/each}
					{#if dateTasks.length > 3}
						<div class="text-xs text-center" style="color: var(--theme-text-muted);">
							+{dateTasks.length - 3} more
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Undated Tasks Section -->
	{#if undatedTasks.length > 0}
		<div class="border-t p-4" style="border-color: var(--theme-border); background-color: var(--theme-section-bg);">
			<h3 class="text-sm font-semibold mb-2" style="color: var(--theme-foreground);">
				No Due Date ({undatedTasks.length})
			</h3>
			<div class="flex flex-wrap gap-2">
				{#each undatedTasks.slice(0, 10) as task (task.id)}
					<button
						type="button"
						onclick={() => handleTaskClick(task.id)}
						class="text-xs px-2 py-1 rounded transition-shadow"
						style="background-color: var(--theme-card-bg); border: 1px solid var(--theme-border); color: var(--theme-foreground);"
						onmouseenter={(e) => e.currentTarget.style.boxShadow = 'var(--theme-shadow-sm)'}
						onmouseleave={(e) => e.currentTarget.style.boxShadow = 'none'}
					>
						{task.title}
					</button>
				{/each}
				{#if undatedTasks.length > 10}
					<span class="text-xs" style="color: var(--theme-text-muted);">
						+{undatedTasks.length - 10} more
					</span>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.calendar-container {
		contain: layout;
	}

	.auto-rows-fr {
		grid-auto-rows: minmax(100px, 1fr);
	}
</style>

