<script lang="ts">
  import { cn } from '$lib/utils.js'

  interface CardDescriptionProps {
    class?: string
  }

  let {
    class: className = '',
    children,
    ...restProps
  }: CardDescriptionProps & { children?: any } = $props()
</script>

<div
  data-slot="card-description"
  class={cn('text-muted-foreground text-sm', className)}
  {...restProps}
>
  {@render children?.()}
</div>