<script lang="ts">
  interface Props {
    checked: boolean
    editable?: boolean
    onSave: (checked: boolean) => Promise<void>
    label?: string
  }

  let { checked = $bindable(false), editable = true, onSave, label }: Props = $props()

  let isSaving = $state(false)
  let error = $state<string | null>(null)
  let lastSavedValue = $state(checked)

  async function handleChange() {
    if (!editable || checked === lastSavedValue) return
    lastSavedValue = checked
    isSaving = true
    error = null
    try {
      await onSave(checked)
    } catch (err: any) {
      checked = lastSavedValue
      error = err?.message || 'Save failed'
    } finally {
      isSaving = false
    }
  }
</script>

<label>
  <input
    type="checkbox"
    bind:checked
    onchange={handleChange}
    disabled={!editable}
    class="rounded border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    class:saving={isSaving}
    class:error={!!error}
  />
  {#if label}
    <span>{label}</span>
  {/if}
</label>

{#if isSaving}
  <span class="text-sm text-gray-500">Saving...</span>
{/if}

{#if error}
  <span class="text-sm text-red-600">{error}</span>
{/if}

