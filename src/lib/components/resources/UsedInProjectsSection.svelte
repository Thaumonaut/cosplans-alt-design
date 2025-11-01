<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { resourceService } from '$lib/api/services/resourceService'
  import { Card, Badge } from 'flowbite-svelte'
  import { Link as LinkIcon, Package } from 'lucide-svelte'
  import type { ResourceStatus } from '$lib/types/domain/resource'

  interface Props {
    resourceId: string
  }

  let { resourceId }: Props = $props()

  let projectUsage = $state<any[]>([])
  let loading = $state(true)
  let error = $state<string | null>(null)

  onMount(async () => {
    await loadProjectUsage()
  })

  async function loadProjectUsage() {
    try {
      loading = true
      error = null
      projectUsage = await resourceService.getProjectUsage(resourceId)
    } catch (err: any) {
      error = err?.message || 'Failed to load project usage'
    } finally {
      loading = false
    }
  }

  function formatStatus(status: ResourceStatus): string {
    return status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  function getStatusColor(status: ResourceStatus): string {
    switch (status) {
      case 'needed':
        return 'bg-[color-mix(in_srgb,var(--theme-sidebar-muted)_20%,transparent)] text-[var(--theme-sidebar-muted)] border-[color-mix(in_srgb,var(--theme-border)_30%,transparent)]'
      case 'acquired':
        return 'bg-[color-mix(in_srgb,var(--theme-info)_20%,transparent)] text-[var(--theme-info)] border-[color-mix(in_srgb,var(--theme-info)_30%,transparent)]'
      case 'in-progress':
        return 'bg-[color-mix(in_srgb,var(--theme-warning)_20%,transparent)] text-[var(--theme-warning)] border-[color-mix(in_srgb,var(--theme-warning)_30%,transparent)]'
      case 'completed':
        return 'bg-[color-mix(in_srgb,var(--theme-success)_20%,transparent)] text-[var(--theme-success)] border-[color-mix(in_srgb,var(--theme-success)_30%,transparent)]'
      default:
        return 'bg-[color-mix(in_srgb,var(--theme-sidebar-muted)_20%,transparent)] text-[var(--theme-sidebar-muted)] border-[color-mix(in_srgb,var(--theme-border)_30%,transparent)]'
    }
  }

  function handleProjectClick(projectId: string) {
    goto(`/projects/${projectId}`)
  }
</script>

<div class="space-y-4 rounded-lg bg-background p-6 shadow-sm">
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-medium text-muted-foreground">Used in Projects</h3>
    {#if projectUsage.length > 0}
      <Badge class="border bg-muted px-2 py-0.5 text-xs">
        {projectUsage.length} {projectUsage.length === 1 ? 'project' : 'projects'}
      </Badge>
    {/if}
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-8">
      <div class="text-center">
        <div class="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p class="text-sm text-muted-foreground">Loading projects...</p>
      </div>
    </div>
  {:else if error}
    <Card class="p-6">
      <p class="text-sm text-red-600">{error}</p>
    </Card>
  {:else if projectUsage.length === 0}
    <div class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-12">
      <Package class="mb-4 size-12 text-muted-foreground opacity-50" />
      <p class="mb-2 text-sm font-medium">Not used in any projects yet</p>
      <p class="text-xs text-muted-foreground">This resource will appear here when linked to a project</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each projectUsage as usage (usage.id)}
        {@const project = usage.project || usage.project_id}
        {@const projectId = project?.id || usage.project_id}
        {@const projectName = project?.character ? `${project.character} from ${project.series}` : 'Unknown Project'}
        
        <Card
          class="cursor-pointer transition-all hover:shadow-md"
          onclick={() => handleProjectClick(projectId)}
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="mb-2 flex items-center gap-2">
                <LinkIcon class="size-4 text-muted-foreground" />
                <h4 class="font-medium text-foreground hover:text-primary">
                  {projectName}
                </h4>
              </div>
              <div class="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Quantity: {usage.quantity || 1}</span>
                {#if usage.notes}
                  <span class="italic">"{usage.notes}"</span>
                {/if}
              </div>
            </div>
            <Badge class="border {getStatusColor(usage.status || 'needed')}">
              {formatStatus(usage.status || 'needed')}
            </Badge>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>







