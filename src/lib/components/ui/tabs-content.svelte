<script lang="ts">
  import { cn } from '$lib/utils'

  interface Props {
    value: string
    active?: boolean
    className?: string
    children?: any
  }

  let { value, active = false, className = '', children }: Props = $props()
</script>

{#if active}
  <div class={cn('flex-1 outline-none', className)} data-slot="tabs-content" data-state={active ? 'active' : 'inactive'}>
    {@render children()}
  </div>
{/if}

