<script lang="ts">
  import { cn } from '$lib/utils.js'

  interface CardActionProps {
    class?: string
  }

  let {
    class: className = '',
    children,
    ...restProps
  }: CardActionProps & { children?: any } = $props()
</script>

<div
  data-slot="card-action"
  class={cn(
    'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
    className,
  )}
  {...restProps}
>
  {@render children?.()}
</div>