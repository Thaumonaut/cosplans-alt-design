<script lang="ts">
	/**
	 * CelebrationAnimation Component
	 * 
	 * Displays celebration animations when tasks are completed.
	 * Uses canvas-confetti for visual celebrations and shows encouraging messages.
	 * Respects prefers-reduced-motion and user preferences.
	 */
	import { onMount, onDestroy } from 'svelte';
	import confetti from 'canvas-confetti';

	interface Props {
		trigger?: boolean;
		message?: string;
		enabled?: boolean;
		onComplete?: () => void;
	}

	let {
		trigger = false,
		message = '',
		enabled = true,
		onComplete = () => {}
	}: Props = $props();

	let canvas: HTMLCanvasElement | null = $state(null);
	let showMessage = $state(false);
	let prefersReducedMotion = $state(false);

	// Check for prefers-reduced-motion
	onMount(() => {
		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			prefersReducedMotion = mediaQuery.matches;
			
			const handleChange = (e: MediaQueryListEvent) => {
				prefersReducedMotion = e.matches;
			};
			
			mediaQuery.addEventListener('change', handleChange);
			
			return () => {
				mediaQuery.removeEventListener('change', handleChange);
			};
		}
	});

	// Trigger celebration when trigger changes to true
	$effect(() => {
		if (trigger && enabled && !prefersReducedMotion) {
			celebrate();
		} else if (trigger && enabled && prefersReducedMotion) {
			// Just show message for reduced motion
			showMessage = true;
			setTimeout(() => {
				showMessage = false;
				onComplete();
			}, 2000);
		}
	});

	async function celebrate() {
		if (!canvas || typeof window === 'undefined') return;

		// Show message
		showMessage = true;

		// Fire confetti from multiple angles
		const duration = 3000;
		const end = Date.now() + duration;

		const frame = () => {
			// Launch confetti from left
			confetti({
				particleCount: 3,
				angle: 60,
				spread: 55,
				origin: { x: 0 },
				colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
			});

			// Launch confetti from right
			confetti({
				particleCount: 3,
				angle: 120,
				spread: 55,
				origin: { x: 1 },
				colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
			});

			// Launch confetti from center
			confetti({
				particleCount: 5,
				angle: 90,
				spread: 45,
				origin: { x: 0.5, y: 0.5 },
				colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
			});

			if (Date.now() < end) {
				requestAnimationFrame(frame);
			} else {
				// Hide message after animation
				setTimeout(() => {
					showMessage = false;
					onComplete();
				}, 500);
			}
		};

		frame();
	}
</script>

<canvas
	bind:this={canvas}
	class="fixed inset-0 pointer-events-none z-[100]"
	style="width: 100vw; height: 100vh;"
></canvas>

<!-- Encouraging Message Overlay -->
{#if showMessage && message}
	<div
		class="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
		role="status"
		aria-live="polite"
	>
		<div
			class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl px-8 py-6 text-center animate-in fade-in zoom-in duration-300"
		>
			<p class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
				{message}
			</p>
			<div class="flex justify-center gap-2 text-3xl">
				<span>🎉</span>
				<span>✨</span>
				<span>🌟</span>
			</div>
		</div>
	</div>
{/if}


