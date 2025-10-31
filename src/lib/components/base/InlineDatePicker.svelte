<script lang="ts">
  interface Props {
    value: string
    editable?: boolean
    onSave: (value: string) => Promise<void>
    placeholder?: string
  }

  let { value = $bindable(''), editable = true, onSave, placeholder }: Props = $props()

  let isSaving = $state(false)
  let error = $state<string | null>(null)
  let lastSavedValue = $state(value)

  async function handleBlur() {
    if (!editable || value === lastSavedValue) return
    lastSavedValue = value
    isSaving = true
    error = null
    try {
      await onSave(value)
    } catch (err: any) {
      value = lastSavedValue
      error = err?.message || 'Save failed'
    } finally {
      isSaving = false
    }
  }
</script>

<input
  type="date"
  bind:value
  onblur={handleBlur}
  disabled={!editable}
  {placeholder}
  class:saving={isSaving}
  class:error={!!error}
/>

{#if isSaving}
  <span class="text-sm text-gray-500">Saving...</span>
{/if}

{#if error}
  <span class="text-sm text-red-600">{error}</span>
{/if}

