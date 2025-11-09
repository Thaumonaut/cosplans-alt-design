<script lang="ts">
	/**
	 * Custom Field Input Component
	 * 
	 * Renders appropriate input widget based on field type.
	 * Handles value formatting and validation.
	 */
	import type { CustomFieldDefinition, CustomFieldType } from '$lib/types/domain/task'
	import InlineTextEditor from '$lib/components/base/InlineTextEditor.svelte'
	import InlineDatePicker from '$lib/components/base/InlineDatePicker.svelte'
	import InlineCheckbox from '$lib/components/base/InlineCheckbox.svelte'
	import { DatePicker } from '$lib/components/ui'
	import { cn } from '$lib/utils'

	interface Props {
		definition: CustomFieldDefinition
		value?: string | null
		editable?: boolean
		onSave?: (value: string | null) => Promise<void> | void
		onChange?: (value: string | null) => void
		className?: string
	}

	let {
		definition,
		value = $bindable<string | null>(null),
		editable = true,
		onSave,
		onChange,
		className = ''
	}: Props = $props()

	// Parse value based on field type
	function parseValue(val: string | null | undefined): any {
		if (!val) return null

		switch (definition.fieldType) {
			case 'currency':
				try {
					return JSON.parse(val)
				} catch {
					return { amount: val, currency: definition.options?.currencyCode || 'USD' }
				}
			case 'multi-select':
				try {
					return JSON.parse(val)
				} catch {
					return []
				}
			case 'checkbox':
				return val === 'true'
			case 'number':
				return parseFloat(val) || 0
			default:
				return val
		}
	}

	// Format value for storage
	function formatValue(val: any): string | null {
		if (val === null || val === undefined) return null

		switch (definition.fieldType) {
			case 'currency':
				return typeof val === 'string' ? val : JSON.stringify(val)
			case 'multi-select':
				return Array.isArray(val) ? JSON.stringify(val) : val
			case 'checkbox':
				return val ? 'true' : 'false'
			case 'number':
				return String(val)
			default:
				return String(val)
		}
	}

	// Handle value change
	async function handleChange(newValue: any) {
		const formatted = formatValue(newValue)
		value = formatted
		onChange?.(formatted)
		
		if (onSave) {
			await onSave(formatted)
		}
	}

	// Currency-specific handlers
	let currencyAmount = $state<string>('')
	let currencyCode = $state<string>(definition.options?.currencyCode || 'USD')

	$effect(() => {
		if (definition.fieldType === 'currency' && value) {
			const parsed = parseValue(value)
			if (parsed && typeof parsed === 'object') {
				currencyAmount = parsed.amount || ''
				currencyCode = parsed.currency || 'USD'
			} else {
				currencyAmount = value
			}
		}
	})

	async function handleCurrencyChange() {
		await handleChange({ amount: currencyAmount, currency: currencyCode })
	}

	// Multi-select handlers
	let selectedOptions = $state<string[]>([])

	$effect(() => {
		if (definition.fieldType === 'multi-select' && value) {
			const parsed = parseValue(value)
			selectedOptions = Array.isArray(parsed) ? parsed : []
		}
	})

	async function handleMultiSelectChange(option: string, checked: boolean) {
		if (checked) {
			selectedOptions = [...selectedOptions, option]
		} else {
			selectedOptions = selectedOptions.filter(o => o !== option)
		}
		await handleChange(selectedOptions)
	}
</script>

<div class={cn('custom-field-input', className)}>
	{#if definition.fieldType === 'text'}
		<InlineTextEditor
			bind:value={value}
			placeholder={definition.defaultValue || 'Enter text...'}
			{editable}
			onSave={async (val) => {
				await handleChange(val)
			}}
		/>
	{:else if definition.fieldType === 'textarea'}
		<InlineTextEditor
			bind:value={value}
			multiline={true}
			placeholder={definition.defaultValue || 'Enter text...'}
			{editable}
			onSave={async (val) => {
				await handleChange(val)
			}}
		/>
	{:else if definition.fieldType === 'number'}
		<input
			type="number"
			bind:value={value}
			placeholder={definition.defaultValue || '0'}
			disabled={!editable}
			min={definition.options?.min}
			max={definition.options?.max}
			onchange={(e) => handleChange(e.target.value)}
			class="w-full px-3 py-2 rounded-md border text-sm"
			style="background-color: var(--theme-card-bg); border-color: var(--theme-border); color: var(--theme-foreground);"
		/>
	{:else if definition.fieldType === 'currency'}
		<div class="flex gap-2">
			<input
				type="number"
				bind:value={currencyAmount}
				placeholder="0.00"
				step="0.01"
				disabled={!editable}
				onchange={handleCurrencyChange}
				class="flex-1 px-3 py-2 rounded-md border text-sm"
				style="background-color: var(--theme-card-bg); border-color: var(--theme-border); color: var(--theme-foreground);"
			/>
			<select
				bind:value={currencyCode}
				disabled={!editable}
				onchange={handleCurrencyChange}
				class="px-3 py-2 rounded-md border text-sm"
				style="background-color: var(--theme-card-bg); border-color: var(--theme-border); color: var(--theme-foreground);"
			>
				<option value="USD">USD</option>
				<option value="EUR">EUR</option>
				<option value="GBP">GBP</option>
				<option value="JPY">JPY</option>
				<option value="CAD">CAD</option>
				<option value="AUD">AUD</option>
			</select>
		</div>
	{:else if definition.fieldType === 'dropdown'}
		<select
			bind:value={value}
			disabled={!editable}
			onchange={(e) => handleChange(e.target.value)}
			class="w-full px-3 py-2 rounded-md border text-sm"
			style="background-color: var(--theme-card-bg); border-color: var(--theme-border); color: var(--theme-foreground);"
		>
			<option value="">Select...</option>
			{#each (definition.options?.choices || []) as choice}
				<option value={choice}>{choice}</option>
			{/each}
		</select>
	{:else if definition.fieldType === 'multi-select'}
		<div class="flex flex-wrap gap-2">
			{#each (definition.options?.choices || []) as choice}
				<label class="flex items-center gap-2 px-3 py-1 rounded-md border cursor-pointer transition-colors {selectedOptions.includes(choice) ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-card-bg)] hover:bg-[var(--theme-hover)]'}"
					style={selectedOptions.includes(choice) ? 'color: var(--theme-card-bg); border-color: var(--theme-border);' : 'color: var(--theme-foreground); border-color: var(--theme-border);'}
				>
					<input
						type="checkbox"
						checked={selectedOptions.includes(choice)}
						disabled={!editable}
						onchange={(e) => handleMultiSelectChange(choice, e.target.checked)}
						class="sr-only"
					/>
					<span class="text-sm">{choice}</span>
				</label>
			{/each}
		</div>
	{:else if definition.fieldType === 'checkbox'}
		{@const checked = value === 'true'}
		<InlineCheckbox
			checked={checked}
			{editable}
			onSave={async (checked) => {
				await handleChange(checked)
			}}
		/>
	{:else if definition.fieldType === 'date'}
		{#if editable}
			<DatePicker
				bind:value={value}
				placeholder="Select date..."
				disabled={!editable}
				onchange={(val) => handleChange(val)}
			/>
		{:else}
			<div class="text-sm" style="color: var(--theme-text-muted, #78716c);">
				{value ? new Date(value).toLocaleDateString() : 'Not set'}
			</div>
		{/if}
	{:else if definition.fieldType === 'url'}
		<input
			type="url"
			bind:value={value}
			placeholder="https://..."
			disabled={!editable}
			onchange={(e) => handleChange(e.target.value)}
			class="w-full px-3 py-2 rounded-md border text-sm"
			style="background-color: var(--theme-card-bg); border-color: var(--theme-border); color: var(--theme-foreground);"
		/>
	{:else if definition.fieldType === 'email'}
		<input
			type="email"
			bind:value={value}
			placeholder="email@example.com"
			disabled={!editable}
			onchange={(e) => handleChange(e.target.value)}
			class="w-full px-3 py-2 rounded-md border text-sm"
			style="background-color: var(--theme-card-bg); border-color: var(--theme-border); color: var(--theme-foreground);"
		/>
	{/if}
</div>

