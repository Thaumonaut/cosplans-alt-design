<script lang="ts">
	/**
	 * Custom Fields Section Component
	 * 
	 * Displays and manages custom field values for a task.
	 * Loads field definitions and values, renders appropriate inputs.
	 */
	import { onMount } from 'svelte'
	import { customFieldService } from '$lib/api/services/customFieldService'
	import { currentTeam, currentUserRole } from '$lib/stores/teams'
	import { get } from 'svelte/store'
	import type { CustomFieldDefinition, TaskCustomFieldValue, CustomFieldDefinitionCreate, CustomFieldType } from '$lib/types/domain/task'
	import CustomFieldInput from '../custom-fields/CustomFieldInput.svelte'
	import { Loader2, Plus } from 'lucide-svelte'
	import { Button, Input, Label, Select, Dialog, DialogFooter } from '$lib/components/ui'
	import { toast } from '$lib/stores/toast'

	interface Props {
		taskId: string
		editable?: boolean
	}

	let {
		taskId,
		editable = true
	}: Props = $props()

	let definitions = $state<CustomFieldDefinition[]>([])
	let values = $state<Map<string, TaskCustomFieldValue>>(new Map())
	let loading = $state(true)
	let error = $state<string | null>(null)
	let showCreateDialog = $state(false)

	// Inline create form state
	let formFieldName = $state('')
	let formFieldType = $state<CustomFieldType>('text')
	let formRequired = $state(false)
	let formDefaultValue = $state('')

	// Check if user can create fields
	const canCreateFields = $derived(() => {
		const role = get(currentUserRole)
		return role === 'owner' || role === 'editor'
	})

	// Load field definitions and values
	async function loadFields() {
		if (!taskId) return

		loading = true
		error = null

		try {
			const team = get(currentTeam)
			if (!team) {
				error = 'No active team'
				return
			}

			// Load definitions and values in parallel
			const [defs, vals] = await Promise.all([
				customFieldService.listDefinitions(team.id),
				customFieldService.listValues(taskId)
			])

			definitions = defs.sort((a, b) => a.displayOrder - b.displayOrder)
			
			// Create map of field definition ID to value
			const valuesMap = new Map<string, TaskCustomFieldValue>()
			vals.forEach(val => {
				valuesMap.set(val.fieldDefinitionId, val)
			})
			values = valuesMap
		} catch (err: any) {
			error = err.message || 'Failed to load custom fields'
			console.error('Failed to load custom fields:', err)
		} finally {
			loading = false
		}
	}

	// Save field value
	async function saveValue(definitionId: string, value: string | null) {
		if (!taskId) return

		try {
			const existing = values.get(definitionId)
			
			if (existing) {
				// Update existing value
				const updated = await customFieldService.updateValue(
					taskId,
					definitionId,
					{ value }
				)
				values.set(definitionId, updated)
			} else {
				// Create new value
				const created = await customFieldService.upsertValue({
					taskId,
					fieldDefinitionId: definitionId,
					value
				})
				values.set(definitionId, created)
			}
		} catch (err: any) {
			error = err.message || 'Failed to save field value'
			console.error('Failed to save custom field value:', err)
			throw err
		}
	}

	// Get value for a field definition
	function getValue(definitionId: string): string | null {
		return values.get(definitionId)?.value || null
	}

	// Create new field definition inline
	async function createFieldDefinition() {
		if (!formFieldName.trim()) {
			toast.error('Validation Error', 'Field name is required')
			return
		}

		const team = get(currentTeam)
		if (!team) {
			toast.error('No team', 'Cannot create field without an active team')
			return
		}

		// Check field limit
		if (definitions.length >= 20) {
			toast.error('Limit Reached', 'Maximum 20 custom fields per team')
			return
		}

		try {
			const newDefinition: CustomFieldDefinitionCreate = {
				teamId: team.id,
				fieldName: formFieldName.trim(),
				fieldType: formFieldType,
				required: formRequired,
				defaultValue: formDefaultValue || null,
				options: {},
				displayOrder: definitions.length,
				showOnCard: false,
			}

			await customFieldService.createDefinition(newDefinition)
			toast.success('Created', 'Custom field created successfully')
			
			// Reset form and reload
			formFieldName = ''
			formFieldType = 'text'
			formRequired = false
			formDefaultValue = ''
			showCreateDialog = false
			
			await loadFields()
		} catch (err: any) {
			toast.error('Error', err.message || 'Failed to create custom field')
			console.error('Failed to create custom field:', err)
		}
	}

	// Field type options
	const fieldTypes: Array<{ value: CustomFieldType; label: string }> = [
		{ value: 'text', label: 'Text (Single-line)' },
		{ value: 'textarea', label: 'Text Area (Multi-line)' },
		{ value: 'number', label: 'Number' },
		{ value: 'currency', label: 'Currency' },
		{ value: 'dropdown', label: 'Dropdown (Single-select)' },
		{ value: 'multi-select', label: 'Multi-select' },
		{ value: 'checkbox', label: 'Checkbox' },
		{ value: 'date', label: 'Date' },
		{ value: 'url', label: 'URL' },
		{ value: 'email', label: 'Email' },
	]

	onMount(() => {
		loadFields()
	})

	// Reload when taskId changes
	$effect(() => {
		if (taskId) {
			loadFields()
		}
	})
</script>

{#if loading}
	<div class="flex items-center justify-center py-8">
		<Loader2 class="h-6 w-6 animate-spin" style="color: var(--theme-primary, #8b5cf6);" />
	</div>
{:else if error}
	<div class="p-4 rounded-md border" style="background-color: var(--theme-error-bg); color: var(--theme-error); border-color: var(--theme-error);">
		<p class="text-sm">{error}</p>
	</div>
{:else if definitions.length === 0}
	<div class="space-y-4">
		<div class="text-sm text-center py-4" style="color: var(--theme-text-muted, #78716c);">
			No custom fields defined for this team.
		</div>
		{#if canCreateFields}
			<Button
				variant="outline"
				size="sm"
				onclick={() => showCreateDialog = true}
				class="w-full"
			>
				<Plus class="mr-2 h-4 w-4" />
				Create Custom Field
			</Button>
		{/if}
	</div>
{:else}
	<div class="space-y-4">
		{#each definitions as definition}
			<div class="space-y-2">
				<label class="block text-sm font-medium" style="color: var(--theme-foreground, #1c1917);">
					{definition.fieldName}
					{#if definition.required}
						<span class="ml-1" style="color: var(--theme-error);">*</span>
					{/if}
				</label>
				<CustomFieldInput
					{definition}
					value={getValue(definition.id)}
					{editable}
					onSave={async (value) => {
						await saveValue(definition.id, value)
					}}
				/>
			</div>
		{/each}
		{#if canCreateFields && definitions.length < 20}
			<Button
				variant="outline"
				size="sm"
				onclick={() => showCreateDialog = true}
				class="w-full"
			>
				<Plus class="mr-2 h-4 w-4" />
				Add Custom Field
			</Button>
		{/if}
	</div>
{/if}

<!-- Inline Create Dialog -->
<Dialog bind:open={showCreateDialog}>
	<div class="p-6">
		<h2 class="text-xl font-semibold mb-4">Create Custom Field</h2>
		<div class="space-y-4">
			<div>
				<Label>Field Name</Label>
				<Input
					bind:value={formFieldName}
					placeholder="e.g., Material Cost, Hair Type"
				/>
			</div>
			<div>
				<Label>Field Type</Label>
				<Select
					bind:value={formFieldType}
					options={fieldTypes}
				/>
			</div>
			<div>
				<Label>Default Value (Optional)</Label>
				<Input
					bind:value={formDefaultValue}
					placeholder="Leave empty for no default"
				/>
			</div>
			<div class="flex items-center gap-2">
				<input
					type="checkbox"
					bind:checked={formRequired}
					id="required-checkbox"
				/>
				<Label for="required-checkbox">Required field</Label>
			</div>
		</div>
		<DialogFooter class="mt-6">
			<Button variant="outline" onclick={() => showCreateDialog = false}>
				Cancel
			</Button>
			<Button onclick={createFieldDefinition}>
				Create
			</Button>
		</DialogFooter>
	</div>
</Dialog>

