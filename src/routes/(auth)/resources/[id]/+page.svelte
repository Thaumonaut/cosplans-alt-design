<script lang="ts">
  import { page } from '$app/stores'
  import ResourceDetail from '$lib/components/resources/ResourceDetail.svelte'

  const resourceId = $page.params.id
</script>

<svelte:head>
  <title>Resource Details - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <ResourceDetail resourceId={resourceId} mode="edit" isFlyout={false} />
</div>






