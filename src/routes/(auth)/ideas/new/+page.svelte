<script lang="ts">
  import IdeaDetail from '$lib/components/ideas/IdeaDetail.svelte'
</script>

<svelte:head>
  <title>New Idea - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <IdeaDetail mode="create" isFlyout={false} />
</div>
