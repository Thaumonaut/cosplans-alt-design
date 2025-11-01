<script lang="ts">
  import { page } from '$app/stores'
  import PhotoshootDetail from '$lib/components/photoshoots/PhotoshootDetail.svelte'

  const photoshootId = $page.params.id
</script>

<svelte:head>
  <title>Photoshoot Details - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <PhotoshootDetail photoshootId={photoshootId} mode="edit" isFlyout={false} />
</div>

