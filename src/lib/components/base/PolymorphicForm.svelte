<script lang="ts">
  interface Props {
    category: string
    metadata: Record<string, unknown>
    onUpdate: (metadata: Record<string, unknown>) => void
  }

  let { category, metadata = $bindable({}), onUpdate }: Props = $props()

  function handleChange() {
    onUpdate(metadata)
  }
</script>

<div>
  <p class="text-gray-600">Category: {category}</p>
  <!-- Category-specific fields will be rendered based on category switch -->
  <p class="text-sm text-gray-500 mt-2">Form fields for {category} will be implemented per category</p>
</div>

