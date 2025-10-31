<script lang="ts">
  import { goto } from '$app/navigation'
  import CreationFlyout from '$lib/components/ui/CreationFlyout.svelte'
  import IdeaDetail from './IdeaDetail.svelte'

  interface Props {
    open?: boolean
    onClose: () => void
    onSuccess?: (ideaId: string) => void
  }

  let { open = $bindable(false), onClose, onSuccess }: Props = $props()

  function handleFullScreen() {
    goto('/ideas/new')
    onClose()
  }
</script>

<CreationFlyout bind:open title="New Character" onFullScreen={handleFullScreen}>
  <IdeaDetail 
    mode="create" 
    isFlyout={true} 
    onSuccess={(createdId: string) => {
      onSuccess?.(createdId)
      onClose()
    }}
  />
</CreationFlyout>
