<script lang="ts">
  import { DropdownItem } from 'flowbite-svelte';
  import { cn } from '$lib/utils';

  interface Props {
    variant?: 'default' | 'destructive';
    inset?: boolean;
    disabled?: boolean;
    class?: string;
    onclick?: () => void;
    children?: any;
  }

  let {
    variant = 'default',
    inset = false,
    disabled = false,
    class: className,
    onclick,
    children
  }: Props = $props();
</script>

<DropdownItem
  {disabled}
  onclick={onclick || (() => {})}
  class={cn(
    'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-3 rounded-md px-2 py-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors',
    'list-none', // Remove list decorations
    'hover:bg-[color-mix(in_srgb,var(--theme-primary)_8%,transparent)]',
    inset && 'pl-8',
    variant === 'destructive' && 'text-destructive focus:bg-destructive/10 focus:text-destructive',
    '[&_svg:not([class*="text-"])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
    className
  )}
>
  {@render children?.()}
</DropdownItem>