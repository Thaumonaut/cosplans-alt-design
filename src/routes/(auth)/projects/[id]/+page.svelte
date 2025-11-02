<script lang="ts">
  import { page } from '$app/stores'
  import ProjectDetail from '$lib/components/projects/ProjectDetail.svelte'
  import Breadcrumbs from '$lib/components/base/Breadcrumbs.svelte'
</script>

<svelte:head>
  <title>Project - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <Breadcrumbs 
    items={[
      { label: 'Projects', href: '/projects' },
      { label: 'Project Details' }
    ]} 
  />
  <ProjectDetail projectId={$page.params.id} mode="edit" isFlyout={false} />
</div>
