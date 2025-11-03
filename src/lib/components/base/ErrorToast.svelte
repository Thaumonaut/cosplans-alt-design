<script lang="ts">
	/**
	 * ErrorToast Component
	 * 
	 * Toast notification for errors with retry action.
	 * Auto-dismisses after 5 seconds unless persistent.
	 */
	import { createEventDispatcher, onMount } from 'svelte';

	export let message: string;
	export let title: string = 'Error';
	export let type: 'error' | 'success' | 'warning' | 'info' = 'error';
	export let persistent: boolean = false;
	export let showRetry: boolean = false;
	export let duration: number = 5000;
	export let visible: boolean = true;
	
	const dispatch = createEventDispatcher<{
		dismiss: void;
		retry: void;
	}>();

	let timeoutId: number | undefined;
	let progress = $state(100);
	let progressInterval: number | undefined;

	onMount(() => {
		if (!persistent && visible) {
			startDismissTimer();
		}
		return () => {
			if (timeoutId) clearTimeout(timeoutId);
			if (progressInterval) clearInterval(progressInterval);
		};
	});

	function startDismissTimer() {
		const startTime = Date.now();
		
		progressInterval = window.setInterval(() => {
			const elapsed = Date.now() - startTime;
			progress = Math.max(0, 100 - (elapsed / duration) * 100);
		}, 10);

		timeoutId = window.setTimeout(() => {
			handleDismiss();
		}, duration);
	}

	function handleDismiss() {
		if (timeoutId) clearTimeout(timeoutId);
		if (progressInterval) clearInterval(progressInterval);
		visible = false;
		dispatch('dismiss');
	}

	function handleRetry() {
		dispatch('retry');
	}

	const typeStyles = {
		error: {
			bg: 'bg-red-50 dark:bg-red-900/20',
			border: 'border-red-200 dark:border-red-800',
			icon: 'text-red-600 dark:text-red-400',
			text: 'text-red-900 dark:text-red-100',
			progress: 'bg-red-500',
		},
		success: {
			bg: 'bg-green-50 dark:bg-green-900/20',
			border: 'border-green-200 dark:border-green-800',
			icon: 'text-green-600 dark:text-green-400',
			text: 'text-green-900 dark:text-green-100',
			progress: 'bg-green-500',
		},
		warning: {
			bg: 'bg-yellow-50 dark:bg-yellow-900/20',
			border: 'border-yellow-200 dark:border-yellow-800',
			icon: 'text-yellow-600 dark:text-yellow-400',
			text: 'text-yellow-900 dark:text-yellow-100',
			progress: 'bg-yellow-500',
		},
		info: {
			bg: 'bg-blue-50 dark:bg-blue-900/20',
			border: 'border-blue-200 dark:border-blue-800',
			icon: 'text-blue-600 dark:text-blue-400',
			text: 'text-blue-900 dark:text-blue-100',
			progress: 'bg-blue-500',
		},
	};

	const styles = $derived(typeStyles[type]);
</script>

{#if visible}
	<div
		role="alert"
		class="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] border {styles.bg} {styles.border} rounded-lg shadow-lg overflow-hidden animate-slide-in-bottom z-50"
	>
		<!-- Progress bar -->
		{#if !persistent}
			<div class="h-1 {styles.progress} transition-all duration-100 ease-linear" style="width: {progress}%" />
		{/if}

		<!-- Content -->
		<div class="p-4">
			<div class="flex items-start gap-3">
				<!-- Icon -->
				<div class="flex-shrink-0 {styles.icon}">
					{#if type === 'error'}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					{:else if type === 'success'}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					{:else if type === 'warning'}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					{:else}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					{/if}
				</div>

				<!-- Text -->
				<div class="flex-1 min-w-0">
					<h4 class="text-sm font-semibold {styles.text} mb-1">{title}</h4>
					<p class="text-sm {styles.text} opacity-90">{message}</p>
				</div>

				<!-- Close button -->
				<button
					type="button"
					on:click={handleDismiss}
					class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Retry button -->
			{#if showRetry}
				<div class="mt-3">
					<button
						type="button"
						on:click={handleRetry}
						class="text-sm font-medium {styles.text} hover:underline focus:outline-none focus:underline"
					>
						Try Again
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	@keyframes slide-in-bottom {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.animate-slide-in-bottom {
		animation: slide-in-bottom 0.3s ease-out;
	}
</style>

