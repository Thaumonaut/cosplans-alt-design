<script lang="ts">
	/**
	 * StreakDisplay Component
	 * 
	 * Displays current task completion streak with flame icon.
	 * Shows encouragement when streak breaks.
	 */
	import { onMount } from 'svelte';
	import { Flame } from 'lucide-svelte';
	import { UserTaskStatsService } from '$lib/services/user-task-stats-service';
	import { currentTeam } from '$lib/stores/teams';
	import { user } from '$lib/stores/auth-store';
	import { get } from 'svelte/store';

	interface Props {
		onStreakBreak?: (longestStreak: number) => void;
	}

	let { onStreakBreak }: Props = $props();

	const statsService = new UserTaskStatsService();
	let currentStreak = $state(0);
	let longestStreak = $state(0);
	let isLoading = $state(true);
	let previousStreak = $state(0);

	onMount(async () => {
		await loadStreak();
	});

	async function loadStreak() {
		const currentUser = get(user);
		const team = get(currentTeam);

		if (!currentUser || !team) {
			isLoading = false;
			return;
		}

		try {
			previousStreak = currentStreak;
			
			const [currentResult, longestResult] = await Promise.all([
				statsService.getCurrentStreak(currentUser.id, team.id),
				statsService.getLongestStreak(currentUser.id, team.id)
			]);

			if (currentResult.data !== undefined) {
				currentStreak = currentResult.data;
			}
			if (longestResult.data !== undefined) {
				longestStreak = longestResult.data;
			}

			// Check if streak broke
			if (previousStreak > 0 && currentStreak === 0 && onStreakBreak) {
				onStreakBreak(longestStreak);
			}
		} catch (err) {
			console.error('Failed to load streak:', err);
		} finally {
			isLoading = false;
		}
	}

	// Expose refresh method
	export function refresh() {
		loadStreak();
	}
</script>

{#if isLoading}
	<div class="flex items-center gap-2 text-sm" style="color: var(--theme-text-muted, #78716c);">
		<div class="w-4 h-4 animate-pulse rounded" style="background-color: var(--theme-border-subtle, rgba(120, 113, 108, 0.1));"></div>
		<span>Loading...</span>
	</div>
{:else if currentStreak > 0}
	<div class="flex items-center gap-2 text-sm">
		<Flame class="w-5 h-5" style="color: var(--theme-warning, #f59e0b); fill: var(--theme-warning, #f59e0b);" />
		<span class="font-semibold" style="color: var(--theme-foreground, #1c1917);">
			{currentStreak} {currentStreak === 1 ? 'day' : 'days'}
		</span>
		<span style="color: var(--theme-text-muted, #78716c);">streak</span>
	</div>
{:else}
	<div class="flex items-center gap-2 text-sm" style="color: var(--theme-text-muted, #78716c);">
		<Flame class="w-5 h-5" style="color: var(--theme-text-muted, #78716c);" />
		<span>No streak yet</span>
	</div>
{/if}

