<script lang="ts">
	/**
	 * InlineDatePicker Component
	 * 
	 * Provides inline date editing for "living document" UX.
	 * Click to edit, save on selection, cancel on Escape.
	 */
	import { createEventDispatcher } from 'svelte';

	export let value: string | null = null; // ISO date string
	export let placeholder: string = 'No date';
	export let disabled: boolean = false;
	export let showTime: boolean = false;
	export let minDate: string | undefined = undefined;
	export let maxDate: string | undefined = undefined;
	
	const dispatch = createEventDispatcher<{
		change: string | null;
		cancel: void;
	}>();

	let isEditing = $state(false);
	let inputElement: HTMLInputElement;

	function startEditing() {
		if (disabled) return;
		isEditing = true;
		setTimeout(() => inputElement?.focus(), 0);
	}

	function handleChange(event: Event) {
		const newValue = (event.target as HTMLInputElement).value;
		value = newValue || null;
		isEditing = false;
		dispatch('change', value);
	}

	function handleBlur() {
		setTimeout(() => {
			isEditing = false;
		}, 150);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isEditing = false;
			dispatch('cancel');
		}
	}

	function formatDisplayDate(dateString: string | null): string {
		if (!dateString) return placeholder;
		
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return placeholder;

		if (showTime) {
			return date.toLocaleString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
			});
		}

		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	}

	function isOverdue(dateString: string | null): boolean {
		if (!dateString) return false;
		const date = new Date(dateString);
		const now = new Date();
		return date < now;
	}

	function isDueSoon(dateString: string | null): boolean {
		if (!dateString) return false;
		const date = new Date(dateString);
		const now = new Date();
		const diff = date.getTime() - now.getTime();
		const daysDiff = diff / (1000 * 60 * 60 * 24);
		return daysDiff > 0 && daysDiff <= 3;
	}

	const displayClass = $derived(
		value && isOverdue(value)
			? 'text-red-600 dark:text-red-400'
			: value && isDueSoon(value)
			? 'text-yellow-600 dark:text-yellow-400'
			: value
			? 'text-gray-900 dark:text-white'
			: 'text-gray-500 dark:text-gray-400'
	);
</script>

{#if isEditing}
	<input
		bind:this={inputElement}
		type={showTime ? 'datetime-local' : 'date'}
		value={value || ''}
		on:change={handleChange}
		on:blur={handleBlur}
		on:keydown={handleKeydown}
		min={minDate}
		max={maxDate}
		class="inline-block px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
		{disabled}
	/>
{:else}
	<div
		role="button"
		tabindex={disabled ? -1 : 0}
		class="inline-flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors {displayClass} {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
		on:click={startEditing}
		on:keydown={(e) => e.key === 'Enter' && startEditing()}
	>
		<svg
			class="w-4 h-4"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		</svg>
		<span>{formatDisplayDate(value)}</span>
	</div>
{/if}
