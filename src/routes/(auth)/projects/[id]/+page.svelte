<script lang="ts">
  import { page } from '$app/stores'
  import ProjectDetail from '$lib/components/projects/ProjectDetail.svelte'
</script>

<svelte:head>
  <title>Project - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <ProjectDetail projectId={$page.params.id} mode="edit" isFlyout={false} />
</div>
