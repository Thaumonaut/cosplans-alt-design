<script lang="ts">
  import { DropdownHeader } from 'flowbite-svelte';
  import { cn } from '$lib/utils';

  interface Props {
    inset?: boolean;
    class?: string;
    children?: any;
  }

  let {
    inset = false,
    class: className,
    children
  }: Props = $props();
</script>

<DropdownHeader
  class={cn(
    'px-2 py-1.5 text-sm font-medium',
    inset && 'pl-8',
    className
  )}
>
  {@render children?.()}
</DropdownHeader>