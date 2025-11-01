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
    'relative flex w-full cursor-default items-center gap-3 rounded-md px-3 py-2.5 text-sm outline-hidden select-none',
    'bg-transparent hover:bg-[var(--theme-sidebar-hover)] focus:bg-[var(--theme-sidebar-hover)]',
    'text-[var(--theme-foreground)] focus:text-[var(--theme-foreground)]',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    'list-none', // Remove list decorations
    inset && 'pl-8',
    variant === 'destructive' && 'text-[var(--theme-error)] hover:bg-[color-mix(in_srgb,var(--theme-error)_10%,transparent)] focus:bg-[color-mix(in_srgb,var(--theme-error)_10%,transparent)]',
    '[&_svg:not([class*="text-"])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
    className
  )}
>
  {@render children?.()}
</DropdownItem>