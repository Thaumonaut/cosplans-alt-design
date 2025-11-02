<script lang="ts">
  import { page } from '$app/stores'
  import ToolDetail from '$lib/components/tools/ToolDetail.svelte'
  import Breadcrumbs from '$lib/components/base/Breadcrumbs.svelte'

  const toolId = $page.params.id
</script>

<svelte:head>
  <title>Tool Details - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <Breadcrumbs 
    items={[
      { label: 'Tools', href: '/tools' },
      { label: 'Tool Details' }
    ]} 
  />
  <ToolDetail toolId={toolId} mode="edit" isFlyout={false} />
</div>

