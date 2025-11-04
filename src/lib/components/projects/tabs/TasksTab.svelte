<script lang="ts">
  /**
   * Tasks Tab for Project Detail
   * Updated for Phase 5 (User Story 3) - Contextual Task Integration
   * Uses new EmbeddedTaskList component with modern task UI
   */
  import EmbeddedTaskList from '$lib/components/tasks/EmbeddedTaskList.svelte'
  import { currentTeam } from '$lib/stores/teams'
  import { get } from 'svelte/store'

  interface Props {
    projectId: string
    resourceId?: string | null
    onTaskChange?: () => void
  }

  let { projectId, resourceId, onTaskChange }: Props = $props()
  
  // Get current team ID for task filtering
  const team = get(currentTeam)
  const teamId = team?.id || ''
</script>

<!-- Tasks Tab with Modern Task UI Integration -->
<EmbeddedTaskList
  {projectId}
  {resourceId}
  {teamId}
  title="Project Tasks"
  showViewToggle={true}
  showQuickCreate={true}
  showViewAllLink={true}
  maxHeight="600px"
/>

