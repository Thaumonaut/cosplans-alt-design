<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { TaskService } from '$lib/services/task-service';
	import { formatDistanceToNow } from 'date-fns';
	import { 
		Activity, 
		CheckCircle2, 
		Circle, 
		Edit, 
		UserPlus, 
		Calendar, 
		Flag,
		Loader2
	} from 'lucide-svelte';
	
	// Service instance
	const taskService = new TaskService();

	// Props
	let {
		taskId
	}: {
		taskId: string;
	} = $props();

	// Activity log entry type
	interface ActivityLogEntry {
		id: string;
		type: 'created' | 'updated' | 'assigned' | 'stage_changed' | 'priority_changed' | 'due_date_changed' | 'completed';
		timestamp: string;
		actor: {
			id: string;
			name: string;
			avatar?: string;
		};
		details: {
			field?: string;
			oldValue?: string;
			newValue?: string;
			[key: string]: any;
		};
	}

	// Local state
	let activities = $state<ActivityLogEntry[]>([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// Load activity log
	onMount(async () => {
		await loadActivity();
	});

	async function loadActivity() {
		isLoading = true;
		error = null;

		try {
			// TODO: Implement actual activity log service
			// For now, this is a placeholder that would fetch from a task_activity_log table
			// or compute from task history/audit trail
			const data = await taskService.getActivityLog(taskId);
			activities = data;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load activity log';
			console.error('Error loading activity log:', err);
			
			// Fallback: show empty state instead of error for now
			activities = [];
			error = null;
		} finally {
			isLoading = false;
		}
	}

	// Get icon for activity type
	function getActivityIcon(type: ActivityLogEntry['type']) {
		switch (type) {
			case 'created':
				return Circle;
			case 'completed':
				return CheckCircle2;
			case 'assigned':
				return UserPlus;
			case 'stage_changed':
				return Activity;
			case 'priority_changed':
				return Flag;
			case 'due_date_changed':
				return Calendar;
			case 'updated':
			default:
				return Edit;
		}
	}

	// Get icon color for activity type
	function getActivityColor(type: ActivityLogEntry['type']): string {
		switch (type) {
			case 'created':
				return 'text-blue-600';
			case 'completed':
				return 'text-green-600';
			case 'assigned':
				return 'text-purple-600';
			case 'stage_changed':
				return 'text-indigo-600';
			case 'priority_changed':
				return 'text-orange-600';
			case 'due_date_changed':
				return 'text-yellow-600';
			case 'updated':
			default:
				return 'text-gray-600';
		}
	}

	// Format activity description
	function formatActivityDescription(activity: ActivityLogEntry): string {
		const actor = activity.actor.name;
		
		switch (activity.type) {
			case 'created':
				return `${actor} created this task`;
			case 'completed':
				return `${actor} marked this task as complete`;
			case 'assigned':
				return `${actor} assigned this task to ${activity.details.newValue || 'someone'}`;
			case 'stage_changed':
				return `${actor} moved this task from "${activity.details.oldValue}" to "${activity.details.newValue}"`;
			case 'priority_changed':
				return `${actor} changed priority from ${activity.details.oldValue} to ${activity.details.newValue}`;
			case 'due_date_changed':
				if (activity.details.oldValue && activity.details.newValue) {
					return `${actor} changed due date from ${activity.details.oldValue} to ${activity.details.newValue}`;
				} else if (activity.details.newValue) {
					return `${actor} set due date to ${activity.details.newValue}`;
				} else {
					return `${actor} removed the due date`;
				}
			case 'updated':
				return `${actor} updated ${activity.details.field || 'this task'}`;
			default:
				return `${actor} made changes`;
		}
	}

	// Format relative time
	function formatRelativeTime(dateString: string): string {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true });
		} catch {
			return dateString;
		}
	}
</script>

<!-- Activity Log -->
<div class="space-y-4">
	<!-- Error Message -->
	{#if error}
		<div
			class="rounded-md bg-red-50 p-3 text-sm text-red-800"
			transition:fade={{ duration: 200 }}
		>
			{error}
		</div>
	{/if}

	<!-- Loading State -->
	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-gray-400" />
		</div>
	{:else if activities.length > 0}
		<!-- Activity Timeline -->
		<div class="relative space-y-4">
			<!-- Timeline Line -->
			<div class="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>

			{#each activities as activity (activity.id)}
				<div class="relative flex items-start space-x-3" transition:fade={{ duration: 200 }}>
					<!-- Icon -->
					<div class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white">
						<div class="flex h-6 w-6 items-center justify-center rounded-full {getActivityColor(activity.type)} bg-white ring-2 ring-white">
							<svelte:component this={getActivityIcon(activity.type)} class="h-4 w-4" />
						</div>
					</div>

					<!-- Content -->
					<div class="flex-1 rounded-md border border-gray-200 bg-white p-3">
						<!-- Actor Info -->
						<div class="mb-1 flex items-center space-x-2">
							{#if activity.actor.avatar}
								<img
									src={activity.actor.avatar}
									alt={activity.actor.name}
									class="h-5 w-5 rounded-full"
								/>
							{:else}
								<div class="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
									{activity.actor.name[0]?.toUpperCase() || '?'}
								</div>
							{/if}
							<span class="text-xs font-medium text-gray-500">
								{formatRelativeTime(activity.timestamp)}
							</span>
						</div>

						<!-- Description -->
						<p class="text-sm text-gray-700">
							{formatActivityDescription(activity)}
						</p>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Empty State -->
		<div class="rounded-md border border-dashed border-gray-300 p-8 text-center">
			<Activity class="mx-auto h-8 w-8 text-gray-400" />
			<p class="mt-2 text-sm text-gray-500">No activity yet</p>
			<p class="mt-1 text-xs text-gray-400">Changes to this task will appear here</p>
		</div>
	{/if}
</div>

<style>
	/* Timeline animation */
	.relative {
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>

