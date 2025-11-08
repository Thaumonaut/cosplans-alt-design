<script lang="ts">
  /**
   * DetailCard Component
   * 
   * A reusable card component that opens a detail drawer when clicked.
   * Extends clickable-card with detail drawer integration.
   * Used for photoshoots, projects, resources, tasks, and other entities.
   */
  import ClickableCard from '$lib/components/ui/clickable-card.svelte'
  import CreationFlyout from '$lib/components/ui/CreationFlyout.svelte'
  import { cn } from '$lib/utils'
  
  interface Props {
    // Card props
    id: string
    selected?: boolean
    disabled?: boolean
    draggable?: boolean
    class?: string
    
    // Detail drawer props
    detailTitle?: string
    detailContent?: import('svelte').Snippet
    detailFooter?: import('svelte').Snippet
    onDetailOpen?: (id: string) => void
    onDetailClose?: (id: string) => void
    onFullScreen?: (id: string) => void
    openDetailId?: string | null // Controlled from parent
    
    // Card content
    children?: import('svelte').Snippet
  }
  
  let {
    id,
    selected = false,
    disabled = false,
    draggable = false,
    class: className = '',
    detailTitle,
    detailContent,
    detailFooter,
    onDetailOpen,
    onDetailClose,
    onFullScreen,
    openDetailId,
    children
  }: Props = $props()
  
  const isDetailOpen = $derived(openDetailId === id)
  
  function handleCardClick() {
    if (disabled) return
    onDetailOpen?.(id)
  }
  
  function handleDetailClose() {
    onDetailClose?.(id)
  }
  
  function handleFullScreen() {
    onFullScreen?.(id)
  }
</script>

<ClickableCard
  onclick={handleCardClick}
  {selected}
  {disabled}
  {draggable}
  class={cn('detail-card', className)}
>
  {#snippet children()}
    {#if children}
      {@render children()}
    {/if}
  {/snippet}
</ClickableCard>

{#if detailTitle && detailContent}
  <CreationFlyout
    bind:open={isDetailOpen}
    title={detailTitle}
    onOpenChange={(open) => {
      if (!open) handleDetailClose()
    }}
    onFullScreen={onFullScreen ? () => handleFullScreen() : undefined}
    {footer}
  >
    {#snippet children()}
      {@render detailContent()}
    {/snippet}
  </CreationFlyout>
{/if}

