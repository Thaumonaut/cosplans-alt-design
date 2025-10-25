<script lang="ts">
  import { cn } from '$lib/utils';
  import { getSidebarContext } from './sidebar-context.svelte.ts';
  import Tooltip from './tooltip.svelte';

  interface Props {
    href?: string;
    isActive?: boolean;
    variant?: 'default' | 'outline';
    size?: 'default' | 'sm' | 'lg';
    tooltip?: string;
    class?: string;
    onclick?: () => void;
    children?: any;
  }

  let {
    href,
    isActive = false,
    variant = 'default',
    size = 'default',
    tooltip,
    class: className,
    onclick,
    children
  }: Props = $props();

  const { state, isMobile } = getSidebarContext();

  const baseClasses = cn(
    'flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding]',
    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
    isActive && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
    variant === 'outline' && 'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
    size === 'sm' && 'h-7 text-xs',
    size === 'default' && 'h-8 text-sm',
    size === 'lg' && 'h-12 text-sm',
    className
  );

  const button = href ? 
    `<a href="${href}" class="${baseClasses}" onclick={onclick}>` :
    `<button class="${baseClasses}" onclick={onclick}>`;
</script>

{#if tooltip && state === 'collapsed' && !isMobile}
  <Tooltip content={tooltip} placement="right">
    {#if href}
      <a {href} class={baseClasses} {onclick}>
        {@render children?.()}
      </a>
    {:else}
      <button class={baseClasses} {onclick}>
        {@render children?.()}
      </button>
    {/if}
  </Tooltip>
{:else}
  {#if href}
    <a {href} class={baseClasses} {onclick}>
      {@render children?.()}
    </a>
  {:else}
    <button class={baseClasses} {onclick}>
      {@render children?.()}
    </button>
  {/if}
{/if}