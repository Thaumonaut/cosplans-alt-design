<script lang="ts">
	/**
	 * TaskTableView Component
	 * 
	 * Renders tasks as a spreadsheet-style table with customizable columns.
	 * Supports inline editing, keyboard navigation, frozen columns, and more.
	 */
	import { createEventDispatcher } from 'svelte';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { browser } from '$app/environment';
	import type { CustomFieldDefinition } from '$lib/types/domain/task';
	import InlineTextEditor from '$lib/components/base/InlineTextEditor.svelte';
	import InlineSelect from '$lib/components/base/InlineSelect.svelte';
	import InlineDatePicker from '$lib/components/base/InlineDatePicker.svelte';
	import CustomFieldInput from '$lib/components/tasks/custom-fields/CustomFieldInput.svelte';

	interface Task {
		id: string;
		title: string;
		description?: string | null;
		status_id: string;
		priority: 'low' | 'medium' | 'high';
		due_date?: string | null;
		assigned_to?: string | null;
		labels?: Array<{ id: string; name: string; color: string }>;
		subtask_completion_percentage?: number;
		total_subtasks?: number;
		completed_subtasks?: number;
		assignee?: any;
		customFieldValues?: Record<string, string>;
	}

	interface StatusOption {
		value: string;
		label: string;
		color?: string;
	}

	interface Column {
		id: string;
		label: string;
		width: number;
		minWidth: number;
		resizable: boolean;
		sortable: boolean;
		editable: boolean;
		required: boolean; // Title and Status cannot be removed
		type: 'row-number' | 'title' | 'status' | 'priority' | 'assignee' | 'due-date' | 'custom-field';
		customFieldId?: string; // For custom field columns
	}

	interface Props {
		tasks: Task[];
		statusOptions?: StatusOption[];
		customFields?: CustomFieldDefinition[];
		teamId?: string;
	}

	let {
		tasks = [],
		statusOptions = [],
		customFields = [],
		teamId
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		taskClick: { id: string };
		statusChange: { id: string; status_id: string };
		priorityChange: { id: string; priority: string };
		dueDateChange: { id: string; due_date: string | null };
		titleChange: { id: string; title: string };
		customFieldChange: { id: string; fieldId: string; value: string };
	}>();

	// Column definitions - Title and Status are required
	const defaultColumns: Column[] = [
		{
			id: 'row-number',
			label: '#',
			width: 50,
			minWidth: 40,
			resizable: false,
			sortable: false,
			editable: false,
			required: false,
			type: 'row-number'
		},
		{
			id: 'title',
			label: 'Title',
			width: 300,
			minWidth: 150,
			resizable: true,
			sortable: true,
			editable: true,
			required: true,
			type: 'title'
		},
		{
			id: 'status',
			label: 'Status',
			width: 150,
			minWidth: 120,
			resizable: true,
			sortable: true,
			editable: true,
			required: true,
			type: 'status'
		}
	];

	// Optional columns that can be added
	const optionalColumns: Column[] = [
		{
			id: 'priority',
			label: 'Priority',
			width: 120,
			minWidth: 100,
			resizable: true,
			sortable: true,
			editable: true,
			required: false,
			type: 'priority'
		},
		{
			id: 'assignee',
			label: 'Assignee',
			width: 150,
			minWidth: 120,
			resizable: true,
			sortable: true,
			editable: true,
			required: false,
			type: 'assignee'
		},
		{
			id: 'due-date',
			label: 'Due Date',
			width: 150,
			minWidth: 120,
			resizable: true,
			sortable: true,
			editable: true,
			required: false,
			type: 'due-date'
		}
	];

	// Active columns state (starts with required columns + row number)
	let columns = $state<Column[]>([...defaultColumns]);

	// Virtual scrolling setup
	let scrollElement = $state<HTMLDivElement | null>(null);
	let tableHeader = $state<HTMLTableElement | null>(null);

	const virtualizer = $derived.by(() => {
		if (!scrollElement) return null;
		
		return createVirtualizer({
			get count() {
				return tasks.length;
			},
			getScrollElement: () => scrollElement!,
			estimateSize: () => 48, // Estimated height of each table row
			overscan: 5, // Render 5 extra items above/below viewport
		});
	});

	// Access the virtualizer store value reactively
	let virtualizerInstance = $state<any>(null);
	
	$effect(() => {
		if (!virtualizer) {
			virtualizerInstance = null;
			return;
		}
		
		const unsubscribe = virtualizer.subscribe((instance: any) => {
			virtualizerInstance = instance;
		});
		
		return unsubscribe;
	});
	
	const virtualItems = $derived.by(() => {
		if (!virtualizerInstance) return [];
		return virtualizerInstance.getVirtualItems() || [];
	});
	
	const totalSize = $derived.by(() => {
		if (!virtualizerInstance) return 0;
		return virtualizerInstance.getTotalSize() || 0;
	});

	// Sort state
	let sortColumn: string | null = $state(null);
	let sortDirection: 'asc' | 'desc' | null = $state(null);

	// Keyboard navigation state
	let focusedCell: { rowIndex: number; columnIndex: number } | null = $state(null);
	let isEditingCell = $state(false);

	// Sorted tasks
	const sortedTasks = $derived.by(() => {
		if (!sortColumn || !sortDirection) return tasks;

		return [...tasks].sort((a, b) => {
			let aVal: any;
			let bVal: any;

			switch (sortColumn) {
				case 'title':
					aVal = a.title?.toLowerCase() || '';
					bVal = b.title?.toLowerCase() || '';
					break;
				case 'status':
					aVal = a.status_id;
					bVal = b.status_id;
					break;
				case 'priority':
					const priorityOrder = { high: 3, medium: 2, low: 1 };
					aVal = priorityOrder[a.priority] || 0;
					bVal = priorityOrder[b.priority] || 0;
					break;
				case 'due-date':
					aVal = a.due_date ? new Date(a.due_date).getTime() : 0;
					bVal = b.due_date ? new Date(b.due_date).getTime() : 0;
					break;
				default:
					return 0;
			}

			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	});

	function handleSort(columnId: string) {
		if (sortColumn === columnId) {
			// Cycle: asc -> desc -> none
			if (sortDirection === 'asc') {
				sortDirection = 'desc';
			} else if (sortDirection === 'desc') {
				sortColumn = null;
				sortDirection = null;
			}
		} else {
			sortColumn = columnId;
			sortDirection = 'asc';
		}
	}

	function handleTaskClick(taskId: string) {
		dispatch('taskClick', { id: taskId });
	}

	function handleStatusChange(taskId: string, statusId: string) {
		dispatch('statusChange', { id: taskId, status_id: statusId });
	}

	function handlePriorityChange(taskId: string, priority: string) {
		dispatch('priorityChange', { id: taskId, priority });
	}

	function handleDueDateChange(taskId: string, dueDate: string | null) {
		dispatch('dueDateChange', { id: taskId, due_date: dueDate });
	}

	function handleTitleChange(taskId: string, title: string) {
		dispatch('titleChange', { id: taskId, title });
	}

	function getStatusLabel(statusId: string): string {
		return statusOptions.find(opt => opt.value === statusId)?.label || statusId;
	}

	function getStatusColor(statusId: string): string | undefined {
		return statusOptions.find(opt => opt.value === statusId)?.color;
	}

	function isOverdue(dueDate: string | null | undefined): boolean {
		if (!dueDate) return false;
		return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
	}

	// Keyboard navigation handlers
	function handleKeydown(event: KeyboardEvent) {
		if (isEditingCell) {
			// Let inline editors handle their own keyboard events
			if (event.key === 'Escape') {
				isEditingCell = false;
				focusedCell = null;
			}
			return;
		}

		if (!focusedCell) {
			// Initialize focus on first cell if no cell is focused
			if (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === 'Tab') {
				focusedCell = { rowIndex: 0, columnIndex: 1 }; // Start at first row, title column (skip row number)
				event.preventDefault();
			}
			return;
		}

		const { rowIndex, columnIndex } = focusedCell;
		const editableColumns = columns.filter(c => c.editable && c.type !== 'row-number');
		const maxRow = sortedTasks.length - 1;
		const maxCol = editableColumns.length - 1;

		switch (event.key) {
			case 'ArrowRight':
				event.preventDefault();
				if (columnIndex < maxCol) {
					focusedCell = { rowIndex, columnIndex: columnIndex + 1 };
				}
				break;
			case 'ArrowLeft':
				event.preventDefault();
				if (columnIndex > 0) {
					focusedCell = { rowIndex, columnIndex: columnIndex - 1 };
				}
				break;
			case 'ArrowDown':
				event.preventDefault();
				if (rowIndex < maxRow) {
					focusedCell = { rowIndex: rowIndex + 1, columnIndex };
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (rowIndex > 0) {
					focusedCell = { rowIndex: rowIndex - 1, columnIndex };
				}
				break;
			case 'Enter':
				event.preventDefault();
				isEditingCell = true;
				// Trigger edit on the focused cell
				break;
			case 'Tab':
				event.preventDefault();
				if (event.shiftKey) {
					// Shift+Tab: move left
					if (columnIndex > 0) {
						focusedCell = { rowIndex, columnIndex: columnIndex - 1 };
					} else if (rowIndex > 0) {
						focusedCell = { rowIndex: rowIndex - 1, columnIndex: maxCol };
					}
				} else {
					// Tab: move right
					if (columnIndex < maxCol) {
						focusedCell = { rowIndex, columnIndex: columnIndex + 1 };
					} else if (rowIndex < maxRow) {
						focusedCell = { rowIndex: rowIndex + 1, columnIndex: 0 };
					}
				}
				break;
			case 'Escape':
				event.preventDefault();
				focusedCell = null;
				isEditingCell = false;
				break;
		}
	}

	// Scroll focused cell into view
	$effect(() => {
		if (focusedCell && scrollElement && virtualizerInstance) {
			const { rowIndex } = focusedCell;
			virtualizerInstance.scrollToIndex(rowIndex, { align: 'center' });
		}
	});
</script>

<div
	class="task-table-container"
	style="
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--theme-section-bg);
		color: var(--theme-foreground, #1c1917);
	"
	onkeydown={handleKeydown}
	tabindex="0"
	role="grid"
	aria-label="Task table"
>
	<!-- Table Header -->
	<div
		class="table-header-wrapper"
		style="
			overflow-x: auto;
			overflow-y: hidden;
			border-bottom: 1px solid var(--theme-border, #e7e5e4);
		"
	>
		<table
			bind:this={tableHeader}
			class="task-table"
			style="
				width: 100%;
				border-collapse: collapse;
				table-layout: fixed;
			"
		>
			<thead>
				<tr>
					{#each columns as column}
						<th
							class="table-header-cell"
							style="
								position: {column.id === 'title' ? 'sticky' : 'relative'};
								left: {column.id === 'title' ? '0' : 'auto'};
								z-index: {column.id === 'title' ? '10' : '1'};
								width: {column.width}px;
								min-width: {column.width}px;
								background-color: var(--theme-card-bg, #fafaf9);
								border-right: 1px solid var(--theme-border, #e7e5e4);
								padding: 12px 8px;
								text-align: left;
								font-weight: 600;
								font-size: 0.875rem;
								color: var(--theme-foreground, #1c1917);
								cursor: {column.sortable ? 'pointer' : 'default'};
								user-select: none;
							"
							onclick={() => column.sortable && handleSort(column.id)}
						>
							<div
								style="
									display: flex;
									align-items: center;
									gap: 8px;
								"
							>
								<span>{column.label}</span>
								{#if column.sortable && sortColumn === column.id}
									<span style="color: var(--theme-primary, #8b5cf6);">
										{#if sortDirection === 'asc'}
											↑
										{:else if sortDirection === 'desc'}
											↓
										{/if}
									</span>
								{/if}
							</div>
						</th>
					{/each}
				</tr>
			</thead>
		</table>
	</div>

	<!-- Table Body with Virtual Scrolling -->
	<div
		bind:this={scrollElement}
		class="table-body-wrapper"
		style="
			flex: 1;
			overflow: auto;
		"
	>
		{#if virtualItems.length > 0}
			<div
				style="
					position: relative;
					height: {totalSize}px;
				"
			>
				<table
					class="task-table"
					style="
						width: 100%;
						border-collapse: collapse;
						table-layout: fixed;
					"
				>
					<tbody>
						{#each virtualItems as virtualItem}
							{@const task = sortedTasks[virtualItem.index]}
							{@const rowNumber = virtualItem.index + 1}
							<tr
								class="table-row"
								style="
									position: absolute;
									top: {virtualItem.start}px;
									left: 0;
									right: 0;
									height: {virtualItem.size}px;
									border-bottom: 1px solid var(--theme-border, #e7e5e4);
									cursor: pointer;
									transition: background-color 0.15s;
								"
								onmouseenter={(e) => {
									e.currentTarget.style.backgroundColor = 'var(--theme-hover, #f5f5f4)';
								}}
								onmouseleave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
								}}
								onclick={() => handleTaskClick(task.id)}
							>
								{#each columns as column, colIdx}
									{@const editableColIndex = columns.filter(c => c.editable && c.type !== 'row-number').findIndex(c => c.id === column.id)}
									{@const isFocused = focusedCell && focusedCell.rowIndex === virtualItem.index && editableColIndex === focusedCell.columnIndex && column.editable && column.type !== 'row-number'}
									<td
										class="table-cell"
										style="
											position: {column.id === 'title' ? 'sticky' : 'relative'};
											left: {column.id === 'title' ? '0' : 'auto'};
											z-index: {column.id === 'title' ? '5' : '1'};
											width: {column.width}px;
											min-width: {column.width}px;
											padding: 8px;
											border-right: 1px solid var(--theme-border, #e7e5e4);
											background-color: {column.id === 'title' ? 'var(--theme-section-bg)' : 'transparent'};
											font-size: 0.875rem;
											color: var(--theme-foreground, #1c1917);
											outline: {isFocused ? '2px solid var(--theme-primary, #8b5cf6)' : 'none'};
											outline-offset: -2px;
										"
										role="gridcell"
										tabindex={isFocused ? 0 : -1}
									>
										{#if column.type === 'row-number'}
											<span style="color: var(--theme-text-muted, #78716c);">
												{rowNumber}
											</span>
										{:else if column.type === 'title'}
											<InlineTextEditor
												value={task.title || ''}
												editable={column.editable}
												onSave={async (newTitle) => handleTitleChange(task.id, newTitle)}
												variant="body"
												className="w-full"
											/>
										{:else if column.type === 'status'}
											<InlineSelect
												value={task.status_id}
												options={statusOptions}
												variant="status"
												on:change={(e) => handleStatusChange(task.id, e.detail)}
											/>
										{:else if column.type === 'priority'}
											<InlineSelect
												value={task.priority}
												options={[
													{ value: 'low', label: 'Low' },
													{ value: 'medium', label: 'Medium' },
													{ value: 'high', label: 'High' }
												]}
												variant="priority"
												on:change={(e) => handlePriorityChange(task.id, e.detail)}
											/>
										{:else if column.type === 'due-date'}
											<InlineDatePicker
												value={task.due_date}
												editable={column.editable}
												onSave={async (newDate) => handleDueDateChange(task.id, newDate)}
												className="w-full"
											/>
										{:else if column.type === 'assignee'}
											{#if task.assignee}
												<span>{task.assignee.name || task.assignee.email || 'Assigned'}</span>
											{:else}
												<span style="color: var(--theme-text-muted, #78716c);">Unassigned</span>
											{/if}
										{:else if column.type === 'custom-field' && column.customFieldId}
											{@const fieldDef = customFields.find(f => f.id === column.customFieldId)}
											{#if fieldDef}
												<CustomFieldInput
													definition={fieldDef}
													value={task.customFieldValues?.[column.customFieldId] || null}
													editable={column.editable}
													onSave={async (value) => {
														dispatch('customFieldChange', {
															id: task.id,
															fieldId: column.customFieldId!,
															value: value || ''
														});
													}}
												/>
											{/if}
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div
				style="
					display: flex;
					align-items: center;
					justify-content: center;
					height: 100%;
					color: var(--theme-text-muted, #78716c);
				"
			>
				No tasks to display
			</div>
		{/if}
	</div>
</div>

<style>
	.task-table-container {
		width: 100%;
		height: 100%;
	}

	.table-header-wrapper {
		flex-shrink: 0;
	}

	.table-body-wrapper {
		flex: 1;
		overflow: auto;
	}

	.task-table {
		width: 100%;
		border-collapse: collapse;
	}

	.table-header-cell {
		position: relative;
	}

	.table-row {
		transition: background-color 0.15s ease;
	}

	.table-row:hover {
		background-color: var(--theme-hover, #f5f5f4);
	}

	.table-cell {
		vertical-align: middle;
	}
</style>

