<script lang="ts">
	/**
	 * FocusMode Component
	 * 
	 * Full-screen distraction-free view for single task focus.
	 * Hides all UI chrome except essential task information.
	 */
	import { onMount, onDestroy } from 'svelte';
	import type { Task, Subtask } from '$lib/types/tasks';
	import { TaskService } from '$lib/services/task-service';
	import { SubtaskService } from '$lib/services/subtask-service';
	import { CommentService } from '$lib/services/comment-service';
	import { AttachmentService } from '$lib/services/attachment-service';
	import SubtaskList from './SubtaskList.svelte';
	import CommentThread from './CommentThread.svelte';
	import AttachmentList from './AttachmentList.svelte';
	import { Button } from '$lib/components/ui';
	import { X, Loader2, CheckCircle2, Circle } from 'lucide-svelte';
	import { keyboardShortcuts } from '$lib/utils/keyboard-shortcuts';

	interface Props {
		taskId: string;
		onExit: () => void;
	}

	let { taskId, onExit }: Props = $props();

	// State
	let task = $state<Task | null>(null);
	let subtasks = $state<Subtask[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Services
	const taskService = new TaskService();
	const subtaskService = new SubtaskService();

	// Load task data
	onMount(async () => {
		await loadTaskData();

		// Register ESC key to exit focus mode
		keyboardShortcuts.register({
			key: 'Escape',
			callback: onExit,
			description: 'Exit Focus Mode'
		});
	});

	onDestroy(() => {
		// Unregister ESC key when component is destroyed
		keyboardShortcuts.unregister({
			key: 'Escape',
			callback: onExit
		});
	});

	async function loadTaskData() {
		isLoading = true;
		error = null;

		try {
			const result = await taskService.getTaskDetail(taskId);
			if (result.error) {
				throw new Error(result.error.message || 'Failed to load task');
			}
			if (result.data) {
				task = result.data as Task;
				// Load subtasks separately
				const subtasksResult = await subtaskService.getSubtasks(taskId);
				if (subtasksResult.data) {
					subtasks = subtasksResult.data;
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load task';
			console.error('Error loading task:', err);
		} finally {
			isLoading = false;
		}
	}

	async function handleSubtaskToggle(subtaskId: string, completed: boolean) {
		if (!task) return;

		try {
			await subtaskService.updateSubtask(subtaskId, { completed });
			// Reload subtasks to get updated state
			const result = await subtaskService.getSubtasks(taskId);
			if (result.data) {
				subtasks = result.data;
			}
		} catch (err) {
			console.error('Error toggling subtask:', err);
		}
	}

	// Calculate progress
	const progress = $derived.by(() => {
		if (!subtasks.length) return 0;
		const completed = subtasks.filter(s => s.completed).length;
		return Math.round((completed / subtasks.length) * 100);
	});
</script>

<!-- Full-screen overlay -->
<div class="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-hidden">
	<!-- Minimal header -->
	<div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center gap-4">
			<button
				type="button"
				onclick={onExit}
				class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
				aria-label="Exit Focus Mode"
			>
				<X class="w-5 h-5" />
			</button>
			<div class="text-sm text-gray-500 dark:text-gray-400">
				Focus Mode
			</div>
		</div>
		<div class="text-xs text-gray-400 dark:text-gray-500">
			Press ESC to exit
		</div>
	</div>

	<!-- Content area - centered and constrained -->
	<div class="h-[calc(100vh-73px)] overflow-y-auto">
		{#if isLoading}
			<div class="flex items-center justify-center h-full">
				<Loader2 class="w-8 h-8 animate-spin text-gray-400" />
			</div>
		{:else if error}
			<div class="flex flex-col items-center justify-center h-full p-8">
				<p class="text-red-600 dark:text-red-400 mb-4">{error}</p>
				<Button onclick={loadTaskData} variant="outline">
					Retry
				</Button>
			</div>
		{:else if task}
			<div class="max-w-4xl mx-auto px-6 py-8">
				<!-- Task Title -->
				<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-6">
					{task.title}
				</h1>

				<!-- Progress indicator (if subtasks exist) -->
				{#if subtasks.length > 0}
					<div class="mb-8">
						<div class="flex items-center justify-between mb-2">
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
								Progress
							</span>
							<span class="text-sm text-gray-500 dark:text-gray-400">
								{progress}% complete
							</span>
						</div>
						<div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
							<div
								class="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
								style="width: {progress}%"
							></div>
						</div>
					</div>
				{/if}

				<!-- Description -->
				{#if task.description}
					<div class="mb-8">
						<div class="prose dark:prose-invert max-w-none">
							<p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
								{task.description}
							</p>
						</div>
					</div>
				{/if}

				<!-- Subtasks -->
				{#if subtasks.length > 0}
					<div class="mb-8">
						<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
							Subtasks
						</h2>
						<div class="space-y-2">
							{#each subtasks as subtask (subtask.id)}
								<label class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
									<input
										type="checkbox"
										checked={subtask.completed}
										onchange={(e) => handleSubtaskToggle(subtask.id, (e.target as HTMLInputElement).checked)}
										class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
									/>
									<span class="flex-1 text-gray-900 dark:text-white {subtask.completed ? 'line-through text-gray-500' : ''}">
										{subtask.title}
									</span>
								</label>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Comments (minimal) -->
				<div class="mb-8">
					<CommentThread taskId={taskId} />
				</div>

				<!-- Quick actions at bottom -->
				<div class="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 -mx-6 -mb-8 mt-8">
					<div class="max-w-4xl mx-auto flex items-center justify-between">
						<button
							type="button"
							onclick={onExit}
							class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
						>
							Exit Focus Mode
						</button>
						<div class="text-xs text-gray-500 dark:text-gray-400">
							ESC to exit
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Prevent body scroll when focus mode is active */
	:global(body.focus-mode-active) {
		overflow: hidden;
	}
</style>


