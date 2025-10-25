<script lang="ts">
  import { cn } from '$lib/utils.js'

  interface AvatarFallbackProps {
    class?: string
  }

  let {
    class: className = '',
    children,
    ...restProps
  }: AvatarFallbackProps & { children?: any } = $props()
</script>

<div
  data-slot="avatar-fallback"
  class={cn(
    'bg-muted flex size-full items-center justify-center rounded-full',
    className,
  )}
  {...restProps}
>
  {@render children?.()}
</div>