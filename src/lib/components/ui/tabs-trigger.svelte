<script lang="ts">
  import { cn } from '$lib/utils'

  interface Props {
    value: string
    active?: boolean
    onClick?: () => void
    className?: string
    children?: any
  }

  let { value, active = false, onClick, className = '', children }: Props = $props()
</script>

<button
  onclick={onClick}
  class={cn(
    'inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50',
    active
      ? 'bg-[var(--theme-card-bg)] text-[var(--theme-foreground)] shadow-sm border-[var(--theme-border)]'
      : 'text-[var(--theme-sidebar-muted)] hover:text-[var(--theme-foreground)]',
    className
  )}
  data-slot="tabs-trigger"
  data-state={active ? 'active' : 'inactive'}
>
  {@render children()}
</button>

