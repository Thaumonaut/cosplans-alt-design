<script lang="ts">
  import { cn } from '$lib/utils'
  import Select from '$lib/components/ui/select.svelte'

  interface Props {
    value: string
    editable?: boolean
    onSave: (value: string) => Promise<void>
    options: Array<{ value: string; label: string }>
    placeholder?: string
    class?: string
  }

  let { value = $bindable(''), editable = true, onSave, options, placeholder, class: className = '' }: Props = $props()

  let isSaving = $state(false)
  let error = $state<string | null>(null)
  let lastSavedValue = $state(value)
  let selectValue = $state(value)

  // Sync selectValue with value prop
  $effect(() => {
    if (value !== lastSavedValue) {
      selectValue = value
      lastSavedValue = value
    }
  })

  // Handle value change from Select component
  async function handleChange(newValue: string) {
    if (!editable || newValue === lastSavedValue || !newValue || isSaving) return
    
    const previousValue = value
    value = newValue
    selectValue = newValue
    lastSavedValue = newValue
    isSaving = true
    error = null
    
    try {
      await onSave(newValue)
    } catch (err: any) {
      value = previousValue
      selectValue = previousValue
      lastSavedValue = previousValue
      error = err?.message || 'Save failed'
    } finally {
      isSaving = false
    }
  }

  // Watch for changes to selectValue (when user selects from dropdown)
  $effect(() => {
    if (selectValue !== lastSavedValue && editable && !isSaving) {
      handleChange(selectValue)
    }
  })
</script>

<div class={cn('relative', className)}>
  <Select
    bind:value={selectValue}
    {options}
    {placeholder}
    disabled={!editable || isSaving}
    class={cn(
      'w-full',
      isSaving && 'opacity-60 pointer-events-none',
      error && 'border-destructive'
    )}
  />
  
  {#if isSaving}
    <div class="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
      <div class="size-3 animate-spin rounded-full border-2 border-current border-t-transparent opacity-50"></div>
    </div>
  {/if}
</div>

{#if error}
  <p class="mt-1.5 text-xs text-destructive">{error}</p>
{/if}
