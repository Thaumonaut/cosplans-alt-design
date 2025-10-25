<script lang="ts">
  import { cn } from '$lib/utils.js'

  interface AvatarProps {
    class?: string
  }

  let {
    class: className = '',
    children,
    ...restProps
  }: AvatarProps & { children?: any } = $props()
</script>

<div
  data-slot="avatar"
  class={cn(
    'relative flex size-8 shrink-0 overflow-hidden rounded-full',
    className,
  )}
  {...restProps}
>
  {@render children?.()}
</div>