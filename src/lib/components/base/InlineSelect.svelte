<script lang="ts">
	/**
	 * InlineSelect Component
	 * 
	 * Provides inline dropdown editing for "living document" UX.
	 * Click to edit, save on selection, cancel on Escape.
	 */
	import { createEventDispatcher } from 'svelte';

	interface Props {
		value: string;
		options: Array<{ value: string; label: string; color?: string }>;
		placeholder?: string;
		disabled?: boolean;
		variant?: 'default' | 'priority' | 'status';
	}

	let {
		value = $bindable(),
		options,
		placeholder = 'Select...',
		disabled = false,
		variant = 'default'
	}: Props = $props();
	
	const dispatch = createEventDispatcher<{
		change: string;
		cancel: void;
	}>();

	let isEditing = $state(false);
	let selectElement: HTMLSelectElement;
	let displayElement: HTMLDivElement;

	const selectedOption = $derived(
		options.find(opt => opt.value === value)
	);

	function startEditing() {
		if (disabled) return;
		isEditing = true;
		setTimeout(() => selectElement?.focus(), 0);
	}

	function handleChange(event: Event) {
		const newValue = (event.target as HTMLSelectElement).value;
		value = newValue;
		isEditing = false;
		dispatch('change', newValue);
	}

	function handleBlur() {
		// Delay to allow selection to register
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

	const variantStyles = {
		default: 'text-gray-900 dark:text-white',
		priority: value === 'high' 
			? 'text-red-600 dark:text-red-400' 
			: value === 'medium'
			? 'text-yellow-600 dark:text-yellow-400'
			: 'text-green-600 dark:text-green-400',
		status: selectedOption?.color 
			? `text-[${selectedOption.color}]` 
			: 'text-gray-900 dark:text-white'
	};
</script>

{#if isEditing}
	<select
		bind:this={selectElement}
		{value}
		on:change={handleChange}
		on:blur={handleBlur}
		on:keydown={handleKeydown}
		class="inline-block px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
		{disabled}
	>
		{#if placeholder}
			<option value="" disabled>{placeholder}</option>
		{/if}
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
{:else}
	<div
		bind:this={displayElement}
		role="button"
		tabindex={disabled ? -1 : 0}
		class="inline-flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors {variantStyles[variant]} {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
		on:click={startEditing}
		on:keydown={(e) => e.key === 'Enter' && startEditing()}
	>
		{#if selectedOption?.color && variant === 'status'}
			<span
				class="w-2 h-2 rounded-full"
				style="background-color: {selectedOption.color}"
			/>
		{/if}
		<span>{selectedOption?.label || placeholder}</span>
		<svg
			class="w-3 h-3 text-gray-400"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19 9l-7 7-7-7"
			/>
		</svg>
	</div>
{/if}
