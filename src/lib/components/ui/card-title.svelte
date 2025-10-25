<script lang="ts">
  import { cn } from '$lib/utils.js'

  interface CardTitleProps {
    class?: string
  }

  let {
    class: className = '',
    children,
    ...restProps
  }: CardTitleProps & { children?: any } = $props()
</script>

<div
  data-slot="card-title"
  class={cn('leading-none font-semibold', className)}
  {...restProps}
>
  {@render children?.()}
</div>