<script lang="ts">
  import { Drawer } from 'flowbite-svelte';
  import { X } from 'lucide-svelte';
  import { Button } from '.';
  import { cn } from '$lib/utils';

  interface Props {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: 'top' | 'right' | 'bottom' | 'left';
    class?: string;
    children?: any;
  }

  let {
    open = $bindable(false),
    onOpenChange,
    side = 'right',
    class: className,
    children
  }: Props = $props();

  function handleOpenChange(isOpen: boolean) {
    open = isOpen;
    onOpenChange?.(isOpen);
  }

  // Map side to Flowbite placement
  const placement = $derived(() => {
    switch (side) {
      case 'left': return 'left';
      case 'right': return 'right';
      case 'top': return 'top';
      case 'bottom': return 'bottom';
      default: return 'right';
    }
  });
</script>

<Drawer
  bind:open
  placement={placement()}
  backdrop={true}
  class={cn(
    'bg-background flex flex-col gap-4 shadow-lg transition ease-in-out',
    side === 'right' && 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
    side === 'left' && 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
    side === 'top' && 'inset-x-0 top-0 h-auto border-b',
    side === 'bottom' && 'inset-x-0 bottom-0 h-auto border-t',
    className
  )}
  on:close={() => handleOpenChange(false)}
>
  <div class="relative h-full">
    {@render children?.()}
    
    <Button
      variant="ghost"
      size="icon"
      class="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100"
      onclick={() => handleOpenChange(false)}
    >
      <X class="size-4" />
      <span class="sr-only">Close</span>
    </Button>
  </div>
</Drawer>