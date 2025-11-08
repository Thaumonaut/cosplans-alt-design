<script lang="ts">
  import { page } from '$app/stores'
  import ResourceDetail from '$lib/components/resources/ResourceDetail.svelte'
  import Breadcrumbs from '$lib/components/base/Breadcrumbs.svelte'

  const resourceId = $page.params.id
</script>

<svelte:head>
  <title>Resource Details - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <Breadcrumbs 
    items={[
      { label: 'Resources', href: '/resources' },
      { label: 'Resource Details' }
    ]} 
  />
  <ResourceDetail resourceId={resourceId} mode="edit" isFlyout={false} />
</div>








