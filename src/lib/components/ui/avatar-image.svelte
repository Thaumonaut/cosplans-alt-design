<script lang="ts">
  import { cn } from '$lib/utils.js'

  interface AvatarImageProps {
    src: string
    alt: string
    class?: string
  }

  let {
    src,
    alt,
    class: className = '',
    ...restProps
  }: AvatarImageProps = $props()

  let loaded = $state(false)
  let error = $state(false)

  function handleLoad() {
    loaded = true
    error = false
  }

  function handleError() {
    error = true
    loaded = false
  }
</script>

{#if !error}
  <img
    {src}
    {alt}
    data-slot="avatar-image"
    class={cn('aspect-square size-full', className)}
    onload={handleLoad}
    onerror={handleError}
    {...restProps}
  />
{/if}