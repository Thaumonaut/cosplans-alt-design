<script lang="ts">
  import { page } from '$app/stores'
  import IdeaDetail from '$lib/components/ideas/IdeaDetail.svelte'
  import Breadcrumbs from '$lib/components/base/Breadcrumbs.svelte'

  const ideaId = $page.params.id
</script>

<svelte:head>
  <title>Idea Details - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <Breadcrumbs 
    items={[
      { label: 'Ideas', href: '/ideas' },
      { label: 'Idea Details' }
    ]} 
  />
  <IdeaDetail {ideaId} mode="edit" isFlyout={false} />
</div>

