<script lang="ts">
  import { cn } from '$lib/utils.js'

  interface SeparatorProps {
    orientation?: 'horizontal' | 'vertical'
    decorative?: boolean
    class?: string
  }

  let {
    orientation = 'horizontal',
    decorative = true,
    class: className = '',
    ...restProps
  }: SeparatorProps = $props()
</script>

<div
  data-slot="separator"
  data-orientation={orientation}
  role={decorative ? 'none' : 'separator'}
  aria-orientation={decorative ? undefined : orientation}
  class={cn(
    'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
    className,
  )}
  {...restProps}
></div>