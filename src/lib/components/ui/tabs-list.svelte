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
    'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
    className
  )}
  data-slot="tabs-list"
>
  {@render children()}
</div>

