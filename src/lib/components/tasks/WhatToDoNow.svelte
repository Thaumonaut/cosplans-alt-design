<script lang="ts">
	/**
	 * What To Do Now Component
	 * 
	 * Displays intelligent task suggestions with reasoning for ADHD-friendly task management.
	 * Shows top suggestions with urgency indicators and clear explanations.
	 */
	import { onMount } from 'svelte';
	import { TaskSuggestionService, type TaskSuggestion } from '$lib/services/task-suggestion-service';
	import { currentTeam } from '$lib/stores/teams';
	import { supabase } from '$lib/supabase';
	import TaskCard from './TaskCard.svelte';
	import { Button } from '$lib/components/ui';
	import { Sparkles, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-svelte';
	import { get } from 'svelte/store';

	// Props
	let {
		onTaskSelect = (taskId: string) => {}
	}: {
		onTaskSelect?: (taskId: string) => void;
	} = $props();

	// Service instance
	const suggestionService = new TaskSuggestionService();

	// State
	let suggestions = $state<TaskSuggestion[]>([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let currentUserId = $state<string | null>(null);
	let teamId = $state<string | null>(null);

	// Load user and team info
	onMount(async () => {
		// Get current user
		const { data: { user } } = await supabase.auth.getUser();
		currentUserId = user?.id || null;

		// Get current team
		const team = get(currentTeam);
		teamId = team?.id || null;

		// Load suggestions
		await loadSuggestions();
	});

	// Load task suggestions
	async function loadSuggestions() {
		isLoading = true;
		error = null;

		try {
			const response = await suggestionService.getSuggestions({
				userId: currentUserId || undefined,
				teamId: teamId || undefined,
				maxSuggestions: 5,
				excludeCompleted: true,
			});

			if (response.error) {
				throw new Error(response.error.message || 'Failed to load suggestions');
			}

			suggestions = response.data || [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load suggestions';
			console.error('Error loading suggestions:', err);
		} finally {
			isLoading = false;
		}
	}

	// Handle task click
	function handleTaskClick(event: CustomEvent<{ id: string }>) {
		onTaskSelect(event.detail.id);
	}

	// Get urgency color class
	function getUrgencyColor(urgency: TaskSuggestion['urgency']): string {
		switch (urgency) {
			case 'critical':
				return 'text-red-600 bg-red-50 border-red-200';
			case 'high':
				return 'text-orange-600 bg-orange-50 border-orange-200';
			case 'medium':
				return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			case 'low':
				return 'text-blue-600 bg-blue-50 border-blue-200';
			default:
				return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	}

	// Get urgency icon
	function getUrgencyIcon(urgency: TaskSuggestion['urgency']) {
		if (urgency === 'critical' || urgency === 'high') {
			return '🔴';
		} else if (urgency === 'medium') {
			return '🟡';
		} else {
			return '🔵';
		}
	}
</script>

<!-- What To Do Now Panel -->
<div class="what-to-do-now rounded-lg border border-gray-200 bg-white p-6">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center space-x-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
				<Sparkles class="h-5 w-5 text-white" />
			</div>
			<div>
				<h3 class="text-lg font-semibold text-gray-900">What should I do now?</h3>
				<p class="text-sm text-gray-500">
					AI-powered task suggestions based on urgency, priority, and effort
				</p>
			</div>
		</div>
		<Button
			variant="ghost"
			size="sm"
			on:click={loadSuggestions}
			disabled={isLoading}
			title="Refresh suggestions"
		>
			<RefreshCw class="h-4 w-4 {isLoading ? 'animate-spin' : ''}" />
		</Button>
	</div>

	<!-- Loading State -->
	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-gray-400" />
		</div>

	<!-- Error State -->
	{:else if error}
		<div class="rounded-md bg-red-50 p-4">
			<div class="flex items-center space-x-2">
				<AlertCircle class="h-5 w-5 text-red-600" />
				<p class="text-sm text-red-800">{error}</p>
			</div>
			<Button
				variant="outline"
				size="sm"
				class="mt-3"
				on:click={loadSuggestions}
			>
				Try Again
			</Button>
		</div>

	<!-- Empty State -->
	{:else if suggestions.length === 0}
		<div class="flex flex-col items-center justify-center py-12">
			<CheckCircle2 class="mb-4 h-12 w-12 text-green-500" />
			<h4 class="mb-2 text-sm font-medium text-gray-900">All caught up!</h4>
			<p class="text-sm text-gray-500">
				You don't have any pending tasks right now. Great job! 🎉
			</p>
		</div>

	<!-- Suggestions List -->
	{:else}
		<div class="space-y-4">
			{#each suggestions as suggestion (suggestion.task.id)}
				<div
					class="suggestion-card rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
				>
					<!-- Urgency Badge -->
					<div class="mb-3 flex items-center justify-between">
						<div class="flex items-center space-x-2">
							<span class="text-lg">{getUrgencyIcon(suggestion.urgency)}</span>
							<span
								class="rounded-full border px-2.5 py-0.5 text-xs font-medium {getUrgencyColor(suggestion.urgency)}"
							>
								{suggestion.urgencyReason}
							</span>
						</div>
						<div class="text-xs text-gray-500">
							Score: {suggestion.score.toFixed(1)}
						</div>
					</div>

					<!-- Task Card -->
					<div class="mb-3">
						<TaskCard
							{...suggestion.task}
							viewMode="list"
							on:click={handleTaskClick}
						/>
					</div>

					<!-- Reasoning -->
					<div class="rounded-md bg-blue-50 p-3">
						<p class="text-xs font-medium text-blue-900">Why this task?</p>
						<p class="mt-1 text-sm text-blue-700">{suggestion.reasoning}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.what-to-do-now {
		animation: slideDown 0.3s ease-out;
	}

	.suggestion-card {
		animation: fadeIn 0.3s ease-out;
		animation-fill-mode: both;
	}

	.suggestion-card:nth-child(1) {
		animation-delay: 0.05s;
	}
	.suggestion-card:nth-child(2) {
		animation-delay: 0.1s;
	}
	.suggestion-card:nth-child(3) {
		animation-delay: 0.15s;
	}
	.suggestion-card:nth-child(4) {
		animation-delay: 0.2s;
	}
	.suggestion-card:nth-child(5) {
		animation-delay: 0.25s;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>


