<script lang="ts">
  import { Tooltip as FlowbiteTooltip } from 'flowbite-svelte';
  import { cn } from '$lib/utils';

  interface Props {
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';
    class?: string;
    children?: any;
  }

  let {
    content,
    placement = 'top',
    class: className,
    children
  }: Props = $props();
</script>

<FlowbiteTooltip
  {content}
  {placement}
  class={cn('bg-foreground text-background rounded-md px-3 py-1.5 text-xs shadow-md', className)}
>
  {@render children?.()}
</FlowbiteTooltip>