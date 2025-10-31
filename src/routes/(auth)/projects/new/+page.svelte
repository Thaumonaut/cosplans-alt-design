<script lang="ts">
  import ProjectDetail from '$lib/components/projects/ProjectDetail.svelte'
</script>

<svelte:head>
  <title>New Project - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <ProjectDetail mode="create" isFlyout={false} />
</div>

