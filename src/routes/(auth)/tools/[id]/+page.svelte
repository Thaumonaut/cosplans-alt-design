<script lang="ts">
  import { page } from '$app/stores'
  import ToolDetail from '$lib/components/tools/ToolDetail.svelte'

  const toolId = $page.params.id
</script>

<svelte:head>
  <title>Tool Details - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <ToolDetail toolId={toolId} mode="edit" isFlyout={false} />
</div>

