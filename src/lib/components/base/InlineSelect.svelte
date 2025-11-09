<script lang="ts">
	/**
	 * InlineSelect Component
	 * 
	 * Provides inline dropdown editing for "living document" UX.
	 * Click to edit, save on selection, cancel on Escape.
	 * Rebuilt to use DropdownMenu like TagSelector for better UX.
	 */
	import { createEventDispatcher } from 'svelte';
	import { DropdownMenu, DropdownMenuItem } from '$lib/components/ui';
	import { ChevronDown, Check } from 'lucide-svelte';

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

	let isOpen = $state(false);
	let wasOpen = $state(false);
	let selectionMade = $state(false);

	const selectedOption = $derived(
		options.find(opt => opt.value === value)
	);

	// Watch for dropdown closing to dispatch cancel event if no selection was made
	$effect(() => {
		if (wasOpen && !isOpen && !selectionMade) {
			// Dropdown was closed without selecting (wasOpen was true, now isOpen is false, and no selection was made)
			// This means user clicked outside or pressed Escape
			dispatch('cancel');
		}
		if (isOpen) {
			// Reset selectionMade when opening
			selectionMade = false;
		}
		wasOpen = isOpen;
	});

	function selectOption(option: { value: string; label: string; color?: string }) {
		if (disabled || option.value === value) return;
		selectionMade = true;
		value = option.value;
		isOpen = false;
		dispatch('change', option.value);
	}

	// Get styling for the trigger button based on variant
	function getTriggerStyles(): string {
		if (variant === 'priority') {
			if (value === 'high') {
				return 'bg-[var(--theme-priority-high-bg)] text-[var(--theme-priority-high-text)] border-[var(--theme-priority-high-border)]';
			} else if (value === 'medium') {
				return 'bg-[var(--theme-priority-medium-bg)] text-[var(--theme-priority-medium-text)] border-[var(--theme-priority-medium-border)]';
			} else {
				return 'bg-[var(--theme-priority-low-bg)] text-[var(--theme-priority-low-text)] border-[var(--theme-priority-low-border)]';
			}
		}
		// Default and status variants
		return 'bg-[var(--theme-card-bg)] text-[var(--theme-foreground)] border-[var(--theme-border)]';
	}
</script>

<div class="relative inline-block">
	{#if disabled}
		<!-- Disabled state - just show the value -->
		<div
			class="inline-flex items-center gap-1.5 px-2 py-1 text-sm rounded-md border cursor-not-allowed opacity-50 {getTriggerStyles()}"
		>
			{#if selectedOption?.color && variant === 'status'}
				<span
					class="w-2 h-2 rounded-full"
					style="background-color: {selectedOption.color}"
				></span>
			{/if}
			<span>{selectedOption?.label || placeholder}</span>
		</div>
	{:else}
		<DropdownMenu 
			bind:open={isOpen} 
			placement="bottom-start"
		>
			{#snippet trigger()}
				<button
					type="button"
					class="inline-flex items-center gap-1.5 px-2 py-1 text-sm rounded-md border transition-all cursor-pointer hover:opacity-90 hover:shadow-sm {getTriggerStyles()}"
					style="background-color: var(--theme-card-bg); color: var(--theme-foreground); border-color: var(--theme-border);"
					onmouseenter={(e) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.backgroundColor = 'var(--theme-hover)';
						}
					}}
					onmouseleave={(e) => {
						if (e.currentTarget instanceof HTMLElement) {
							e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)';
						}
					}}
				>
					{#if selectedOption?.color && variant === 'status'}
						<span
							class="w-2 h-2 rounded-full"
							style="background-color: {selectedOption.color}"
						></span>
					{/if}
					<span>{selectedOption?.label || placeholder}</span>
					<ChevronDown class="size-3 opacity-80" style="color: var(--theme-text-muted);" />
				</button>
			{/snippet}
			
			{#snippet children()}
				<div class="py-1.5 min-w-[180px]">
					{#each options as option}
						<DropdownMenuItem onclick={() => selectOption(option)}>
							<div class="flex w-full items-center justify-between gap-3 text-left">
								<div class="flex items-center gap-2">
									{#if option.color && variant === 'status'}
										<div 
											class="size-2 rounded-full"
											style="background-color: {option.color}"
										></div>
									{/if}
									<span class="text-sm font-medium text-left">{option.label}</span>
								</div>
								{#if value === option.value}
									<Check class="size-4 shrink-0" style="color: var(--theme-primary);" />
								{/if}
							</div>
						</DropdownMenuItem>
					{/each}
				</div>
			{/snippet}
		</DropdownMenu>
	{/if}
</div>
