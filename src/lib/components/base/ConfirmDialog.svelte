<script lang="ts">
	/**
	 * ConfirmDialog Component
	 * 
	 * Modal dialog for confirming destructive actions.
	 * Keyboard accessible with Escape to cancel, Enter to confirm.
	 */
	import { createEventDispatcher, onMount } from 'svelte';

	export let open: boolean = false;
	export let title: string = 'Confirm Action';
	export let message: string;
	export let confirmText: string = 'Confirm';
	export let cancelText: string = 'Cancel';
	export let variant: 'danger' | 'warning' | 'info' = 'danger';
	export let loading: boolean = false;
	
	const dispatch = createEventDispatcher<{
		confirm: void;
		cancel: void;
	}>();

	let dialogElement: HTMLDialogElement;
	let confirmButton: HTMLButtonElement;

	$effect(() => {
		if (open && dialogElement) {
			dialogElement.showModal();
			setTimeout(() => confirmButton?.focus(), 0);
		} else if (!open && dialogElement && dialogElement.open) {
			dialogElement.close();
		}
	});

	function handleConfirm() {
		if (loading) return;
		dispatch('confirm');
	}

	function handleCancel() {
		if (loading) return;
		dispatch('cancel');
		open = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (loading) return;
		if (event.key === 'Escape') {
			handleCancel();
		} else if (event.key === 'Enter' && event.target === confirmButton) {
			handleConfirm();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialogElement) {
			handleCancel();
		}
	}

	const variantStyles = {
		danger: {
			button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
			icon: 'text-red-600',
		},
		warning: {
			button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
			icon: 'text-yellow-600',
		},
		info: {
			button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
			icon: 'text-blue-600',
		},
	};
</script>

<dialog
	bind:this={dialogElement}
	on:click={handleBackdropClick}
	on:keydown={handleKeydown}
	class="backdrop:bg-gray-900/50 backdrop:backdrop-blur-sm rounded-lg shadow-xl p-0 max-w-md w-full"
>
	<div class="bg-white dark:bg-gray-800 p-6">
		<!-- Header -->
		<div class="flex items-start gap-4">
			<div class="flex-shrink-0">
				{#if variant === 'danger'}
					<svg
						class="w-6 h-6 {variantStyles[variant].icon}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				{:else if variant === 'warning'}
					<svg
						class="w-6 h-6 {variantStyles[variant].icon}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				{:else}
					<svg
						class="w-6 h-6 {variantStyles[variant].icon}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				{/if}
			</div>
			<div class="flex-1">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
					{title}
				</h3>
				<p class="text-sm text-gray-600 dark:text-gray-300">
					{message}
				</p>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex gap-3 justify-end mt-6">
			<button
				type="button"
				on:click={handleCancel}
				disabled={loading}
				class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{cancelText}
			</button>
			<button
				bind:this={confirmButton}
				type="button"
				on:click={handleConfirm}
				disabled={loading}
				class="px-4 py-2 text-sm font-medium text-white {variantStyles[variant].button} rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
			>
				{#if loading}
					<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				{/if}
				{confirmText}
			</button>
		</div>
	</div>
</dialog>

