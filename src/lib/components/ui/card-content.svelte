<script lang="ts">
  import { cn } from '$lib/utils.js'

  interface CardContentProps {
    class?: string
  }

  let {
    class: className = '',
    children,
    ...restProps
  }: CardContentProps & { children?: any } = $props()
</script>

<div
  data-slot="card-content"
  class={cn('px-6', className)}
  {...restProps}
>
  {@render children?.()}
</div>