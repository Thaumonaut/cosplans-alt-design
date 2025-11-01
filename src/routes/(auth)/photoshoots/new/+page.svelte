<script lang="ts">
  import PhotoshootDetail from '$lib/components/photoshoots/PhotoshootDetail.svelte'
</script>

<svelte:head>
  <title>New Photoshoot - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <PhotoshootDetail mode="create" isFlyout={false} />
</div>

