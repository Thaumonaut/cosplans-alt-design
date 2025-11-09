<script lang="ts">
	/**
	 * Custom Fields Management Component
	 * 
	 * Allows team admins to create, edit, delete, and reorder custom field definitions.
	 */
	import { onMount } from 'svelte'
	import { customFieldService } from '$lib/api/services/customFieldService'
	import type { CustomFieldDefinition, CustomFieldDefinitionCreate, CustomFieldType } from '$lib/types/domain/task'
	import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Switch, Dialog, DialogFooter, Badge } from '$lib/components/ui'
	import { Plus, Trash2, Edit2, GripVertical, Loader2, AlertCircle } from 'lucide-svelte'
	import { toast } from '$lib/stores/toast'

	interface Props {
		teamId: string
	}

	let { teamId }: Props = $props()

	let definitions = $state<CustomFieldDefinition[]>([])
	let loading = $state(true)
	let error = $state<string | null>(null)
	let showCreateDialog = $state(false)
	let editingDefinition = $state<CustomFieldDefinition | null>(null)

	// Form state
	let formFieldName = $state('')
	let formFieldType = $state<CustomFieldType>('text')
	let formRequired = $state(false)
	let formDefaultValue = $state('')
	let formShowOnCard = $state(false)
	
	// Field type-specific options
	let formChoices = $state<string[]>(['']) // For dropdown/multi-select
	let formCurrencyCode = $state('USD') // For currency
	let formMin = $state<number | undefined>(undefined) // For number
	let formMax = $state<number | undefined>(undefined) // For number

	// Load field definitions
	async function loadDefinitions() {
		if (!teamId) return

		loading = true
		error = null

		try {
			definitions = await customFieldService.listDefinitions(teamId)
			definitions.sort((a, b) => a.displayOrder - b.displayOrder)
		} catch (err: any) {
			error = err.message || 'Failed to load custom fields'
			console.error('Failed to load custom fields:', err)
		} finally {
			loading = false
		}
	}

	// Open create dialog
	function openCreateDialog() {
		editingDefinition = null
		formFieldName = ''
		formFieldType = 'text'
		formRequired = false
		formDefaultValue = ''
		formShowOnCard = false
		formChoices = ['']
		formCurrencyCode = 'USD'
		formMin = undefined
		formMax = undefined
		showCreateDialog = true
	}

	// Open edit dialog
	function openEditDialog(definition: CustomFieldDefinition) {
		editingDefinition = definition
		formFieldName = definition.fieldName
		formFieldType = definition.fieldType
		formRequired = definition.required
		formDefaultValue = definition.defaultValue || ''
		formShowOnCard = definition.showOnCard
		
		// Load type-specific options
		if (definition.fieldType === 'dropdown' || definition.fieldType === 'multi-select') {
			formChoices = definition.options?.choices || ['']
		} else if (definition.fieldType === 'currency') {
			formCurrencyCode = definition.options?.currencyCode || 'USD'
		} else if (definition.fieldType === 'number') {
			formMin = definition.options?.min
			formMax = definition.options?.max
		}
		
		showCreateDialog = true
	}

	// Save field definition
	async function saveDefinition() {
		if (!formFieldName.trim()) {
			toast.error('Validation Error', 'Field name is required')
			return
		}

		// Validate choices for dropdown/multi-select
		if ((formFieldType === 'dropdown' || formFieldType === 'multi-select') && formChoices.filter(c => c.trim()).length === 0) {
			toast.error('Validation Error', 'At least one choice is required for dropdown/multi-select fields')
			return
		}

		// Check field limit
		if (!editingDefinition && definitions.length >= 20) {
			toast.error('Limit Reached', 'Maximum 20 custom fields per team')
			return
		}

		try {
			const options: any = {}
			
			if (formFieldType === 'dropdown' || formFieldType === 'multi-select') {
				options.choices = formChoices.filter(c => c.trim())
			} else if (formFieldType === 'currency') {
				options.currencyCode = formCurrencyCode
			} else if (formFieldType === 'number') {
				if (formMin !== undefined) options.min = formMin
				if (formMax !== undefined) options.max = formMax
			}

			if (editingDefinition) {
				// Update existing
				await customFieldService.updateDefinition(editingDefinition.id, {
					fieldName: formFieldName.trim(),
					fieldType: formFieldType,
					required: formRequired,
					defaultValue: formDefaultValue || null,
					options,
					showOnCard: formShowOnCard,
				})
				toast.success('Updated', 'Custom field updated successfully')
			} else {
				// Create new
				const newDefinition: CustomFieldDefinitionCreate = {
					teamId,
					fieldName: formFieldName.trim(),
					fieldType: formFieldType,
					required: formRequired,
					defaultValue: formDefaultValue || null,
					options,
					displayOrder: definitions.length,
					showOnCard: formShowOnCard,
				}
				await customFieldService.createDefinition(newDefinition)
				toast.success('Created', 'Custom field created successfully')
			}

			showCreateDialog = false
			await loadDefinitions()
		} catch (err: any) {
			toast.error('Error', err.message || 'Failed to save custom field')
			console.error('Failed to save custom field:', err)
		}
	}

	// Delete field definition
	async function deleteDefinition(definition: CustomFieldDefinition) {
		if (!confirm(`Delete "${definition.fieldName}"? This will remove all values for this field on all tasks.`)) {
			return
		}

		try {
			await customFieldService.deleteDefinition(definition.id)
			toast.success('Deleted', 'Custom field deleted successfully')
			await loadDefinitions()
		} catch (err: any) {
			toast.error('Error', err.message || 'Failed to delete custom field')
			console.error('Failed to delete custom field:', err)
		}
	}

	// Add choice option
	function addChoice() {
		formChoices = [...formChoices, '']
	}

	// Remove choice option
	function removeChoice(index: number) {
		formChoices = formChoices.filter((_, i) => i !== index)
	}

	// Update choice value
	function updateChoice(index: number, value: string) {
		formChoices[index] = value
		formChoices = [...formChoices] // Trigger reactivity
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

	// Currency codes
	const currencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL']

	onMount(() => {
		loadDefinitions()
	})

	$effect(() => {
		if (teamId) {
			loadDefinitions()
		}
	})
</script>

<Card>
	<CardHeader>
		<div class="flex items-center justify-between">
			<div>
				<CardTitle>Custom Fields</CardTitle>
				<p class="text-sm text-muted-foreground mt-1">
					Define custom fields for tasks (max 20 fields)
				</p>
			</div>
			<Button onclick={openCreateDialog} disabled={definitions.length >= 20}>
				<Plus class="mr-2 h-4 w-4" />
				Add Field
			</Button>
		</div>
	</CardHeader>
	<CardContent>
		{#if loading}
			<div class="flex items-center justify-center py-8">
				<Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		{:else if error}
			<div class="rounded-md p-4 border" style="background-color: var(--theme-error-bg); border-color: var(--theme-error);">
				<div class="flex items-center gap-2">
					<AlertCircle class="h-5 w-5" style="color: var(--theme-error);" />
					<p class="text-sm" style="color: var(--theme-error);">{error}</p>
				</div>
			</div>
		{:else if definitions.length === 0}
			<div class="text-center py-8">
				<p class="text-sm text-muted-foreground mb-4">No custom fields defined yet</p>
				<Button onclick={openCreateDialog} variant="outline">
					<Plus class="mr-2 h-4 w-4" />
					Create First Field
				</Button>
			</div>
		{:else}
			<div class="space-y-2">
				{#each definitions as definition (definition.id)}
					<div class="flex items-center gap-3 p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors">
						<GripVertical class="h-5 w-5 text-muted-foreground cursor-move" />
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<span class="font-medium">{definition.fieldName}</span>
								<Badge variant="outline">{definition.fieldType}</Badge>
								{#if definition.required}
									<Badge variant="destructive">Required</Badge>
								{/if}
								{#if definition.showOnCard}
									<Badge variant="secondary">Show on Card</Badge>
								{/if}
							</div>
							{#if definition.defaultValue}
								<p class="text-xs text-muted-foreground mt-1">
									Default: {definition.defaultValue}
								</p>
							{/if}
						</div>
						<div class="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onclick={() => openEditDialog(definition)}
							>
								<Edit2 class="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => deleteDefinition(definition)}
							>
								<Trash2 class="h-4 w-4 text-destructive" />
							</Button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>

<!-- Create/Edit Dialog -->
<Dialog bind:open={showCreateDialog}>
	<div class="p-6">
		<h2 class="text-xl font-semibold mb-4">
			{editingDefinition ? 'Edit Custom Field' : 'Create Custom Field'}
		</h2>

		<div class="space-y-4">
			<!-- Field Name -->
			<div>
				<Label>Field Name</Label>
				<Input
					bind:value={formFieldName}
					placeholder="e.g., Material Cost, Hair Type"
				/>
			</div>

			<!-- Field Type -->
			<div>
				<Label>Field Type</Label>
				<Select
					bind:value={formFieldType}
					options={fieldTypes}
					disabled={!!editingDefinition}
				/>
			</div>

			<!-- Type-specific Options -->
			{#if formFieldType === 'dropdown' || formFieldType === 'multi-select'}
				<div>
					<Label>Choices</Label>
					<div class="space-y-2">
						{#each formChoices as choice, index}
							<div class="flex gap-2">
								<Input
									value={choice}
									onchange={(e) => updateChoice(index, e.target.value)}
									placeholder="Option {index + 1}"
								/>
								{#if formChoices.length > 1}
									<Button
										variant="ghost"
										size="sm"
										onclick={() => removeChoice(index)}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								{/if}
							</div>
						{/each}
						<Button
							variant="outline"
							size="sm"
							onclick={addChoice}
						>
							<Plus class="mr-2 h-4 w-4" />
							Add Choice
						</Button>
					</div>
				</div>
			{:else if formFieldType === 'currency'}
				<div>
					<Label>Currency Code</Label>
					<Select
						bind:value={formCurrencyCode}
						options={currencyCodes.map(code => ({ value: code, label: code }))}
					/>
				</div>
			{:else if formFieldType === 'number'}
				<div class="grid grid-cols-2 gap-4">
					<div>
						<Label>Min Value (Optional)</Label>
						<Input
							type="number"
							bind:value={formMin}
							placeholder="No minimum"
						/>
					</div>
					<div>
						<Label>Max Value (Optional)</Label>
						<Input
							type="number"
							bind:value={formMax}
							placeholder="No maximum"
						/>
					</div>
				</div>
			{/if}

			<!-- Default Value -->
			<div>
				<Label>Default Value (Optional)</Label>
				<Input
					bind:value={formDefaultValue}
					placeholder="Leave empty for no default"
				/>
			</div>

			<!-- Options -->
			<div class="space-y-2">
				<div class="flex items-center gap-2">
					<Switch bind:checked={formRequired} />
					<Label>Required field</Label>
				</div>
				<div class="flex items-center gap-2">
					<Switch bind:checked={formShowOnCard} />
					<Label>Show on task cards</Label>
				</div>
			</div>
		</div>

		<DialogFooter class="mt-6">
			<Button variant="outline" onclick={() => showCreateDialog = false}>
				Cancel
			</Button>
			<Button onclick={saveDefinition}>
				{editingDefinition ? 'Update' : 'Create'}
			</Button>
		</DialogFooter>
	</div>
</Dialog>

