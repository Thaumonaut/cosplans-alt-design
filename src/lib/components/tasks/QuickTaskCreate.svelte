<script lang="ts">
	/**
	 * Quick Task Create Component
	 * 
	 * Inline task creation form for quickly adding tasks with context awareness.
	 * Auto-links to parent entity (project, resource, photoshoot).
	 * Supports natural language parsing for due dates and priorities.
	 */
	import type { Task, CreateTaskRequest } from '$lib/types/tasks';
	import { TaskService } from '$lib/services/task-service';
	import { parseTaskInput } from '$lib/utils/natural-language';
	import StageSelector from '$lib/components/base/StageSelector.svelte';
	import InlineUserSelector from '$lib/components/base/InlineUserSelector.svelte';
	import { Button } from '$lib/components/ui';
	import { Loader2, X, Sparkles } from 'lucide-svelte';
	
	// Service instance
	const taskService = new TaskService();

	// Props
	let {
		projectId = undefined,
		resourceId = undefined,
		photoshootId = undefined,
		teamId,
		onCancel = () => {},
		onCreate = (task: Task) => {}
	}: {
		projectId?: string;
		resourceId?: string;
		photoshootId?: string;
		teamId: string;
		onCancel?: () => void;
		onCreate?: (task: Task) => void;
	} = $props();

	// State
	let title = $state('');
	let description = $state('');
	let stageId = $state<string | undefined>(undefined);
	let priority = $state<'low' | 'medium' | 'high'>('medium');
	let assignedTo = $state<string | undefined>(undefined);
	let dueDate = $state<string | undefined>(undefined);
	let isCreating = $state(false);
	let error = $state<string | null>(null);
	let showAdvanced = $state(false);
	let parsedMetadata = $state<{
		title: string;
		priority?: 'low' | 'medium' | 'high';
		dueDate?: string;
		projectMention?: string;
		tags?: string[];
	} | null>(null);

	// Parse title for natural language metadata
	function handleTitleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		title = input.value;

		// Parse natural language from title
		if (title.length > 3) {
			parsedMetadata = parseTaskInput(title);
			
			// Auto-fill parsed values
			if (parsedMetadata.priority) {
				priority = parsedMetadata.priority;
			}
			if (parsedMetadata.dueDate) {
				dueDate = parsedMetadata.dueDate;
			}
		} else {
			parsedMetadata = null;
		}
	}

	// Create task
	async function handleCreate() {
		if (!title.trim()) {
			error = 'Task title is required';
			return;
		}

		isCreating = true;
		error = null;

		try {
			// Use parsed title (with metadata stripped) if available
			const finalTitle = parsedMetadata?.title || title;

			const taskData: CreateTaskRequest = {
				team_id: teamId,
				title: finalTitle.trim(),
				description: description.trim() || undefined,
				project_id: projectId,
				resource_id: resourceId,
				photoshoot_id: photoshootId,
				status_id: stageId,
				priority,
				assigned_to: assignedTo,
				due_date: dueDate
			};

			const response = await taskService.createTask(taskData);
			if (response.error) {
				throw new Error(response.error.message || 'Failed to create task');
			}
			
			if (response.data) {
				onCreate(response.data as Task);
			}

			// Reset form
			title = '';
			description = '';
			stageId = undefined;
			priority = 'medium';
			assignedTo = undefined;
			dueDate = undefined;
			parsedMetadata = null;
			showAdvanced = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create task';
			console.error('Error creating task:', err);
		} finally {
			isCreating = false;
		}
	}

	// Handle keyboard shortcuts
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			handleCreate();
		} else if (event.key === 'Escape') {
			onCancel();
		}
	}

	// Priority options
	const priorityOptions = [
		{ value: 'low', label: 'Low', color: 'green' },
		{ value: 'medium', label: 'Medium', color: 'yellow' },
		{ value: 'high', label: 'High', color: 'red' }
	];
</script>

<!-- Quick Task Create Form -->
<div class="quick-task-create rounded-md border border-gray-200 bg-gray-50 p-4">
	<!-- Title Input -->
	<div class="mb-3">
		<input
			type="text"
			bind:value={title}
			on:input={handleTitleInput}
			on:keydown={handleKeyDown}
			placeholder="Task title... (try 'by Friday #high' for smart parsing)"
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
			disabled={isCreating}
			autofocus
		/>
		
		<!-- Natural Language Parsing Indicator -->
		{#if parsedMetadata && (parsedMetadata.priority || parsedMetadata.dueDate)}
			<div class="mt-2 flex items-center space-x-2 text-xs text-blue-600">
				<Sparkles class="h-3.5 w-3.5" />
				<span>
					Detected:
					{#if parsedMetadata.priority}
						<span class="font-medium">Priority: {parsedMetadata.priority}</span>
					{/if}
					{#if parsedMetadata.dueDate}
						<span class="ml-2 font-medium">Due: {new Date(parsedMetadata.dueDate).toLocaleDateString()}</span>
					{/if}
				</span>
			</div>
		{/if}
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-800">
			{error}
		</div>
	{/if}

	<!-- Advanced Fields Toggle -->
	{#if !showAdvanced}
		<button
			type="button"
			on:click={() => (showAdvanced = true)}
			class="mb-3 text-xs text-blue-600 hover:text-blue-700"
		>
			+ Add details (description, stage, assignee)
		</button>
	{/if}

	<!-- Advanced Fields -->
	{#if showAdvanced}
		<div class="mb-3 space-y-3">
			<!-- Description -->
			<div>
				<label class="mb-1 block text-xs font-medium text-gray-700">Description</label>
				<textarea
					bind:value={description}
					placeholder="Optional description..."
					rows="2"
					class="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
					disabled={isCreating}
				></textarea>
			</div>

			<!-- Stage and Priority -->
			<div class="grid grid-cols-2 gap-3">
				<!-- Stage -->
				<div>
					<label class="mb-1 block text-xs font-medium text-gray-700">Stage</label>
					<StageSelector
						bind:value={stageId}
						{teamId}
						size="sm"
						placeholder="Select stage..."
					/>
				</div>

				<!-- Priority -->
				<div>
					<label class="mb-1 block text-xs font-medium text-gray-700">Priority</label>
					<select
						bind:value={priority}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
						disabled={isCreating}
					>
						{#each priorityOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Assigned To and Due Date -->
			<div class="grid grid-cols-2 gap-3">
				<!-- Assigned To -->
				<div>
					<label class="mb-1 block text-xs font-medium text-gray-700">Assign To</label>
					<InlineUserSelector
						bind:value={assignedTo}
						{teamId}
						size="sm"
						placeholder="Unassigned"
						editable={true}
					/>
				</div>

				<!-- Due Date -->
				<div>
					<label class="mb-1 block text-xs font-medium text-gray-700">Due Date</label>
					<input
						type="date"
						bind:value={dueDate}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
						disabled={isCreating}
					/>
				</div>
			</div>
		</div>
	{/if}

	<!-- Actions -->
	<div class="flex items-center justify-between">
		<div class="text-xs text-gray-500">
			Cmd/Ctrl + Enter to create · Esc to cancel
		</div>
		<div class="flex items-center space-x-2">
			<Button
				variant="ghost"
				size="sm"
				on:click={onCancel}
				disabled={isCreating}
			>
				<X class="mr-1 h-4 w-4" />
				Cancel
			</Button>
			<Button
				variant="default"
				size="sm"
				on:click={handleCreate}
				disabled={isCreating || !title.trim()}
			>
				{#if isCreating}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Create Task
			</Button>
		</div>
	</div>

	<!-- Context Info -->
	{#if projectId || resourceId || photoshootId}
		<div class="mt-3 border-t border-gray-200 pt-3">
			<p class="text-xs text-gray-600">
				This task will be automatically linked to the current
				{#if projectId}
					<span class="font-medium">project</span>
				{:else if resourceId}
					<span class="font-medium">resource</span>
				{:else if photoshootId}
					<span class="font-medium">photoshoot</span>
				{/if}
			</p>
		</div>
	{/if}
</div>

<style>
	.quick-task-create {
		animation: slideDown 0.2s ease-out;
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
</style>

