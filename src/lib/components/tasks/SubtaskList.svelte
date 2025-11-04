<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade, slide } from 'svelte/transition';
	import type { Subtask, CreateSubtaskRequest } from '$lib/types/tasks';
	import { SubtaskService } from '$lib/services/subtask-service';
	import InlineTextEditor from '$lib/components/base/InlineTextEditor.svelte';
	import InlineCheckbox from '$lib/components/base/InlineCheckbox.svelte';
	import { Button } from '$lib/components/ui';
	import { Plus, GripVertical, Trash2, Loader2 } from 'lucide-svelte';
	
	// Service instance
	const subtaskService = new SubtaskService();

	// Props
	let {
		taskId,
		subtasks = $bindable<Subtask[]>([]),
		onChange = (subtasks: Subtask[]) => {}
	}: {
		taskId: string;
		subtasks: Subtask[];
		onChange?: (subtasks: Subtask[]) => void;
	} = $props();

	// Local state
	let isAdding = $state(false);
	let newSubtaskTitle = $state('');
	let isSaving = $state(false);
	let error = $state<string | null>(null);
	let editingId = $state<string | null>(null);
	let draggedSubtask = $state<Subtask | null>(null);

	// Add new subtask
	async function addSubtask() {
		if (!newSubtaskTitle.trim()) return;

		isSaving = true;
		error = null;

		try {
			const data: CreateSubtaskRequest = {
				task_id: taskId,
				title: newSubtaskTitle.trim(),
				display_order: subtasks.length
			};

			const response = await subtaskService.createSubtask(data);
			if (response.error) {
				throw new Error(response.error.message || 'Failed to add subtask');
			}
			
			if (response.data) {
				subtasks = [...subtasks, response.data];
				onChange(subtasks);
			}

			// Reset form
			newSubtaskTitle = '';
			isAdding = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to add subtask';
			console.error('Error adding subtask:', err);
		} finally {
			isSaving = false;
		}
	}

	// Update subtask completion (accepts the new checked value from checkbox)
	async function updateCompletion(subtask: Subtask, newCompleted: boolean) {
		const previousValue = subtask.completed;
		subtask.completed = newCompleted; // Set to the new value (checkbox bind already updated it)

		// Update local state
		subtasks = [...subtasks];
		onChange(subtasks);

		try {
			const response = await subtaskService.updateSubtask(subtask.id, { completed: newCompleted });
			if (response.error) {
				throw new Error(response.error.message || 'Failed to update subtask');
			}
			
			// Update with response data if available
			if (response.data) {
				const index = subtasks.findIndex(s => s.id === subtask.id);
				if (index >= 0) {
					subtasks[index] = response.data;
					onChange(subtasks);
				}
			}
		} catch (err) {
			// Rollback on error
			subtask.completed = previousValue;
			subtasks = [...subtasks];
			onChange(subtasks);
			error = err instanceof Error ? err.message : 'Failed to update subtask';
			console.error('Error updating subtask:', err);
		}
	}

	// Update subtask title
	async function updateTitle(subtask: Subtask, newTitle: string) {
		if (!newTitle.trim()) {
			error = 'Subtask title cannot be empty';
			return;
		}

		const previousTitle = subtask.title;
		subtask.title = newTitle.trim(); // Optimistic update

		// Update local state
		subtasks = [...subtasks];
		onChange(subtasks);

		try {
			const response = await subtaskService.updateSubtask(subtask.id, { title: newTitle.trim() });
			if (response.error) {
				throw new Error(response.error.message || 'Failed to update subtask');
			}
		} catch (err) {
			// Rollback on error
			subtask.title = previousTitle;
			subtasks = [...subtasks];
			onChange(subtasks);
			error = err instanceof Error ? err.message : 'Failed to update subtask';
			console.error('Error updating subtask:', err);
		}
	}

	// Delete subtask
	async function deleteSubtask(subtaskId: string) {
		const previousSubtasks = [...subtasks];
		subtasks = subtasks.filter((s) => s.id !== subtaskId); // Optimistic delete
		onChange(subtasks);

		try {
			const response = await subtaskService.deleteSubtask(subtaskId);
			if (response.error) {
				throw new Error(response.error.message || 'Failed to delete subtask');
			}
		} catch (err) {
			// Rollback on error
			subtasks = previousSubtasks;
			onChange(subtasks);
			error = err instanceof Error ? err.message : 'Failed to delete subtask';
			console.error('Error deleting subtask:', err);
		}
	}

	// Drag-and-drop handlers
	function handleDragStart(event: DragEvent, subtask: Subtask) {
		if (!event.dataTransfer) return;
		draggedSubtask = subtask;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', subtask.id);
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDrop(event: DragEvent, targetSubtask: Subtask) {
		event.preventDefault();
		if (!draggedSubtask || draggedSubtask.id === targetSubtask.id) {
			draggedSubtask = null;
			return;
		}

		// Reorder subtasks
		const draggedIndex = subtasks.findIndex((s) => s.id === draggedSubtask.id);
		const targetIndex = subtasks.findIndex((s) => s.id === targetSubtask.id);

		if (draggedIndex === -1 || targetIndex === -1) return;

		// Create new array with reordered items
		const newSubtasks = [...subtasks];
		const [movedItem] = newSubtasks.splice(draggedIndex, 1);
		newSubtasks.splice(targetIndex, 0, movedItem);

		// Update display orders
		const updatedSubtasks = newSubtasks.map((s, index) => ({
			...s,
			displayOrder: index
		}));

		subtasks = updatedSubtasks;
		onChange(subtasks);

		// Save new order to backend
		saveOrder(updatedSubtasks);

		draggedSubtask = null;
	}

	// Save subtask order
	async function saveOrder(orderedSubtasks: Subtask[]) {
		try {
			// Update each subtask with new display order
			await Promise.all(
				orderedSubtasks.map((s) =>
					subtaskService.updateSubtask(s.id, { display_order: s.display_order })
				)
			);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to reorder subtasks';
			console.error('Error reordering subtasks:', err);
		}
	}

	// Keyboard handlers
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addSubtask();
		} else if (event.key === 'Escape') {
			isAdding = false;
			newSubtaskTitle = '';
		}
	}
</script>

<!-- Subtask List -->
<div class="space-y-2">
	<!-- Error Message -->
	{#if error}
		<div
			class="rounded-md p-3 text-sm"
			style="background-color: var(--theme-error-bg, rgba(239, 68, 68, 0.1)); color: var(--theme-error, #ef4444);"
			transition:fade={{ duration: 200 }}
		>
			{error}
		</div>
	{/if}

	<!-- Subtask Items -->
	{#if subtasks.length > 0}
		<div class="space-y-1">
			{#each subtasks as subtask (subtask.id)}
				<div
					class="group flex items-start space-x-2 rounded-md border p-3 transition-colors hover:opacity-90"
					style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); background-color: var(--theme-card-bg, white);"
					draggable="true"
					ondragstart={(e) => handleDragStart(e, subtask)}
					ondragover={handleDragOver}
					ondrop={(e) => handleDrop(e, subtask)}
					animate:flip={{ duration: 300 }}
					transition:slide={{ duration: 200 }}
				>
					<!-- Drag Handle -->
					<button
						class="cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
						style="color: var(--theme-text-muted, #78716c);"
						title="Drag to reorder"
					>
						<GripVertical class="h-5 w-5" />
					</button>

					<!-- Checkbox -->
					<div class="pt-0.5">
						<InlineCheckbox
							bind:checked={subtask.completed}
							onSave={async (checked) => updateCompletion(subtask, checked)}
						/>
					</div>

					<!-- Title -->
					<div class="flex-1">
						<InlineTextEditor
							bind:value={subtask.title}
							variant="text"
							editable={true}
							style={subtask.completed 
								? 'color: var(--theme-text-muted, #78716c);' 
								: 'color: var(--theme-foreground, #1c1917);'}
							class={subtask.completed ? 'line-through' : ''}
							onSave={(value) => updateTitle(subtask, value)}
						/>
					</div>

					<!-- Delete Button -->
					<button
						class="opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100"
						style="color: var(--theme-text-muted, #78716c);"
						onmouseenter={(e) => e.currentTarget.style.color = 'var(--theme-error, #ef4444)'}
						onmouseleave={(e) => e.currentTarget.style.color = 'var(--theme-text-muted, #78716c)'}
						onclick={() => deleteSubtask(subtask.id)}
						title="Delete subtask"
					>
						<Trash2 class="h-4 w-4" />
					</button>
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-md border border-dashed p-6 text-center" style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
			<p class="text-sm" style="color: var(--theme-text-muted, #78716c);">No subtasks yet. Break down this task into smaller steps.</p>
		</div>
	{/if}

	<!-- Add Subtask Form -->
	{#if isAdding}
		<div class="flex items-center space-x-2" transition:slide={{ duration: 200 }}>
			<input
				type="text"
				bind:value={newSubtaskTitle}
				placeholder="New subtask..."
				style="border-color: var(--theme-border, rgba(120, 113, 108, 0.2)); --tw-ring-color: var(--theme-primary, #8b5cf6);"
				class="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-[var(--theme-primary)]"
				onkeydown={handleKeyDown}
				disabled={isSaving}
				autofocus
			/>
			<Button
				variant="default"
				size="sm"
				onclick={addSubtask}
				disabled={isSaving || !newSubtaskTitle.trim()}
			>
				{#if isSaving}
					<Loader2 class="h-4 w-4 animate-spin" />
				{:else}
					Add
				{/if}
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onclick={() => {
					isAdding = false;
					newSubtaskTitle = '';
				}}
				disabled={isSaving}
			>
				Cancel
			</Button>
		</div>
	{:else}
		<Button
			variant="outline"
			size="sm"
			class="w-full bg-[var(--theme-header-bg)] border-[var(--theme-border)] rounded-[var(--radius)]"
			onclick={() => (isAdding = true)}
		>
			<Plus class="mr-2 h-4 w-4" />
			Add Subtask
		</Button>
	{/if}
</div>

<style>
	/* Drag and drop styles */
	[draggable='true'] {
		cursor: grab;
	}

	[draggable='true']:active {
		cursor: grabbing;
	}
</style>

