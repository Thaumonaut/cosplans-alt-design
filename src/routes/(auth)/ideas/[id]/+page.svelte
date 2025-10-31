<script lang="ts">
  import { page } from '$app/stores'
  import IdeaDetail from '$lib/components/ideas/IdeaDetail.svelte'

  const ideaId = $page.params.id
</script>

<svelte:head>
  <title>Idea Details - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <IdeaDetail {ideaId} mode="edit" isFlyout={false} />
</div>

