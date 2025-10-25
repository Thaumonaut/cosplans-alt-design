<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    href?: string;
    active?: boolean;
    class?: string;
    onclick?: () => void;
    children?: any;
  }

  let {
    href,
    active = false,
    class: className,
    onclick,
    children
  }: Props = $props();
</script>

{#if href}
  <a
    {href}
    class={cn(
      'flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none',
      'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
      'focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-1',
      '[&_svg:not([class*="text-"])]:text-muted-foreground [&_svg:not([class*="size-"])]:size-4',
      active && 'bg-accent/50 text-accent-foreground',
      className
    )}
    {onclick}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    class={cn(
      'flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none',
      'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
      'focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-1',
      '[&_svg:not([class*="text-"])]:text-muted-foreground [&_svg:not([class*="size-"])]:size-4',
      active && 'bg-accent/50 text-accent-foreground',
      className
    )}
    {onclick}
  >
    {@render children?.()}
  </button>
{/if}