<script lang="ts">
  import { cn } from '$lib/utils'

  interface Props {
    className?: string
    children?: any
  }

  let { className = '', children }: Props = $props()
</script>

<div
  class={cn(
    'bg-[var(--theme-section-bg)] text-[var(--theme-sidebar-muted)] inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
    className
  )}
  data-slot="tabs-list"
>
  {@render children()}
</div>

