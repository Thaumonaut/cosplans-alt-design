<script lang="ts">
	/**
	 * ViewModeSelector Component
	 * 
	 * Toggles between list, board, calendar, and timeline views.
	 * Keyboard accessible with tooltips.
	 */
	import { createEventDispatcher } from 'svelte';
	import type { TaskViewMode } from '$lib/types/tasks';

	interface Props {
		value: TaskViewMode;
		disabled?: boolean;
	}

	let {
		value = $bindable(),
		disabled = false
	}: Props = $props();
	
	const dispatch = createEventDispatcher<{
		change: TaskViewMode;
	}>();

	const modes: Array<{
		value: TaskViewMode;
		label: string;
		icon: string;
		tooltip: string;
	}> = [
		{
			value: 'list',
			label: 'List',
			icon: 'M4 6h16M4 12h16M4 18h16',
			tooltip: 'List view - See all tasks in a scrollable list',
		},
		{
			value: 'board',
			label: 'Board',
			icon: 'M9 4v16m6-16v16M4 4h16v16H4z',
			tooltip: 'Board view - Kanban board grouped by status',
		},
		{
			value: 'table',
			label: 'Table',
			icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
			tooltip: 'Table view - Spreadsheet-style table with inline editing',
		},
		{
			value: 'calendar',
			label: 'Calendar',
			icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
			tooltip: 'Calendar view - Tasks by due date',
		},
		{
			value: 'timeline',
			label: 'Timeline',
			icon: 'M4 7h16M4 12h16M4 17h10',
			tooltip: 'Timeline view - Gantt-style timeline',
		},
	];

	function selectMode(mode: TaskViewMode) {
		if (disabled) return;
		value = mode;
		dispatch('change', mode);
	}
</script>

<div class="flex items-center gap-1 rounded-lg p-1" style="background-color: var(--theme-section-bg, rgba(255, 255, 255, 0.9));" role="tablist">
	{#each modes as mode}
		<button
			type="button"
			role="tab"
			aria-selected={value === mode.value}
			aria-label={mode.tooltip}
			title={mode.tooltip}
			disabled={disabled}
			class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors {value === mode.value
				? 'shadow-sm'
				: ''} {disabled
				? 'opacity-50 cursor-not-allowed'
				: 'cursor-pointer'}"
			style={value === mode.value
				? 'background-color: var(--theme-card-bg, white); color: var(--theme-primary, #8b5cf6);'
				: 'color: var(--theme-text-muted, #78716c); background-color: transparent;'}
			onmouseenter={(e) => {
				if (value !== mode.value && !disabled) {
					e.currentTarget.style.backgroundColor = 'var(--theme-card-bg, white)';
					e.currentTarget.style.opacity = '0.8';
				}
			}}
			onmouseleave={(e) => {
				if (value !== mode.value && !disabled) {
					e.currentTarget.style.backgroundColor = 'transparent';
					e.currentTarget.style.opacity = '1';
				}
			}}
			onclick={() => selectMode(mode.value)}
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d={mode.icon}
				/>
			</svg>
			<span class="hidden sm:inline">{mode.label}</span>
		</button>
	{/each}
</div>

