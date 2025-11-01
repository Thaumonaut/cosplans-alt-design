<script lang="ts">
  import { X } from 'lucide-svelte';
  import { Button } from '$lib/components/ui';
  import { cn } from '$lib/utils';
  import { onMount } from 'svelte';

  interface Props {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: string;
    class?: string;
    children?: any;
  }

  let {
    open = $bindable(false),
    onOpenChange,
    title = 'New Item',
    class: className,
    children
  }: Props = $props();

  // Handle body overflow when modal is open
  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  });

  function handleClose() {
    open = false;
    onOpenChange?.(false);
  }

  function handleBackdropClick(event: MouseEvent) {
    console.log('[CreationFlyout] Backdrop clicked', { target: event.target, currentTarget: event.currentTarget, tagName: (event.target as HTMLElement)?.tagName })
    if (event.target === event.currentTarget) {
      console.log('[CreationFlyout] Closing flyout (backdrop click)')
      handleClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Flyout Panel -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class={cn(
        'fixed right-0 top-0 z-50 h-full w-full bg-background shadow-2xl transition-transform duration-300 ease-out sm:w-[600px] lg:w-[800px]',
        open ? 'translate-x-0' : 'translate-x-full',
        className
      )}
      onclick={(e) => {
        console.log('[CreationFlyout] Panel clicked', { target: e.target, currentTarget: e.currentTarget, tagName: (e.target as HTMLElement)?.tagName })
        // Always stop propagation to prevent backdrop from closing
        e.stopPropagation();
      }}
      onkeydown={(e) => e.stopPropagation()}
      role="document"
    >
      <!-- Header -->
      <div class="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h2 class="text-xl font-semibold">{title}</h2>
        <Button variant="ghost" size="icon" onclick={handleClose}>
          <X class="size-5" />
          <span class="sr-only">Close</span>
        </Button>
      </div>

      <!-- Content -->
      <div class="h-[calc(100vh-73px)] overflow-y-auto">
        <div class="p-6">
          {@render children?.()}
        </div>
      </div>
    </div>
  </div>
{/if}