<script lang="ts">
  import { Button } from '$lib/components/ui'
  import { FileQuestion, Home, ArrowLeft, Search } from 'lucide-svelte'
  import { goto } from '$app/navigation'

  interface Props {
    entityType?: string // e.g., 'project', 'idea', 'resource'
    backUrl?: string // URL to go back to list page
    searchUrl?: string // URL for search/list page
  }

  let { 
    entityType = 'item',
    backUrl,
    searchUrl 
  }: Props = $props()

  const entityLabels: Record<string, string> = {
    project: 'Project',
    idea: 'Idea',
    resource: 'Resource',
    tool: 'Tool',
    photoshoot: 'Photoshoot',
    team: 'Team',
    task: 'Task',
  }

  const entityLabel = entityLabels[entityType] || entityType.charAt(0).toUpperCase() + entityType.slice(1)

  function handleGoBack() {
    if (backUrl) {
      goto(backUrl)
    } else {
      window.history.back()
    }
  }

  function handleGoToSearch() {
    if (searchUrl) {
      goto(searchUrl)
    }
  }
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center p-6">
  <div class="text-center space-y-6 max-w-md">
    <div class="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
      <FileQuestion class="size-10 text-muted-foreground" />
    </div>
    
    <div class="space-y-2">
      <h1 class="text-2xl font-bold">{entityLabel} Not Found</h1>
      <p class="text-sm text-muted-foreground">
        The {entityType} you're looking for doesn't exist or has been deleted.
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      {#if backUrl || searchUrl}
        {#if backUrl}
          <Button variant="outline" onclick={handleGoBack}>
            <ArrowLeft class="mr-2 size-4" />
            Go Back
          </Button>
        {/if}
        {#if searchUrl}
          <Button onclick={handleGoToSearch}>
            <Search class="mr-2 size-4" />
            Browse {entityLabel}s
          </Button>
        {/if}
      {:else}
        <Button onclick={() => goto('/dashboard')}>
          <Home class="mr-2 size-4" />
          Go to Dashboard
        </Button>
      {/if}
    </div>
  </div>
</div>

