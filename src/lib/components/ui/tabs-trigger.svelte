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
      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm border-gray-200 dark:border-gray-600'
      : 'text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
    className
  )}
  data-slot="tabs-trigger"
  data-state={active ? 'active' : 'inactive'}
>
  {@render children()}
</button>

