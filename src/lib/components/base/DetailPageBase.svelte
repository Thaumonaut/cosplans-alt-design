<script lang="ts">
  interface Props {
    title: string
    editable?: boolean
    onToggleEdit?: () => void
    children?: any
  }

  let { title, editable = true, onToggleEdit, children }: Props = $props()

  let isEditMode = $state(false)

  function toggleEdit() {
    isEditMode = !isEditMode
    onToggleEdit?.()
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">{title}</h1>
    {#if editable}
      <button
        onclick={toggleEdit}
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {isEditMode ? 'View' : 'Edit'}
      </button>
    {/if}
  </div>

  <div class="edit-mode={isEditMode}">
    {@render children?.()}
  </div>
</div>

