<script lang="ts">
  import { cn } from '$lib/utils.js'

  interface CardFooterProps {
    class?: string
  }

  let {
    class: className = '',
    children,
    ...restProps
  }: CardFooterProps & { children?: any } = $props()
</script>

<div
  data-slot="card-footer"
  class={cn('flex items-center px-6 [.border-t]:pt-6', className)}
  {...restProps}
>
  {@render children?.()}
</div>