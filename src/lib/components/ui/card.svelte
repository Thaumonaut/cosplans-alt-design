<script lang="ts">
  import { cn } from '$lib/utils.js'

  interface CardProps {
    class?: string
  }

  let {
    class: className = '',
    children,
    ...restProps
  }: CardProps & { children?: any } = $props()
</script>

<div
  data-slot="card"
  class={cn(
    'flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
    'bg-[var(--theme-card-bg)] text-[var(--theme-foreground)] border-[var(--theme-border)]',
    className,
  )}
  {...restProps}
>
  {@render children?.()}
</div>