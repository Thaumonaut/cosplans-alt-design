<script lang="ts">
  import { onMount } from 'svelte';
  import { setSidebarContext } from './sidebar-context.svelte.ts';
  import Sheet from './sheet.svelte';
  import { cn } from '$lib/utils';

  interface Props {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: 'left' | 'right';
    variant?: 'sidebar' | 'floating' | 'inset';
    collapsible?: 'offcanvas' | 'icon' | 'none';
    class?: string;
    children?: any;
  }

  let {
    defaultOpen = true,
    open: openProp = $bindable(),
    onOpenChange,
    side = 'left',
    variant = 'sidebar',
    collapsible = 'offcanvas',
    class: className,
    children
  }: Props = $props();

  // Internal state management
  let _open = $state(defaultOpen);
  let openMobile = $state(false);
  let isMobile = $state(false);

  // Use external open prop if provided, otherwise use internal state
  const open = $derived(openProp !== undefined ? openProp : _open);
  
  function setOpen(value: boolean) {
    if (openProp !== undefined && onOpenChange) {
      onOpenChange(value);
    } else {
      _open = value;
    }
    
    // Set cookie to persist sidebar state
    if (typeof document !== 'undefined') {
      document.cookie = `sidebar_state=${value}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  }

  function setOpenMobile(value: boolean) {
    openMobile = value;
  }

  function toggleSidebar() {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  }

  // Check if mobile on mount and resize
  onMount(() => {
    function checkMobile() {
      isMobile = window.innerWidth < 768;
    }
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Keyboard shortcut
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'b' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const state = $derived(open ? 'expanded' : 'collapsed');

  // Set context for child components
  setSidebarContext({
    get state() { return state; },
    get open() { return open; },
    setOpen,
    get openMobile() { return openMobile; },
    setOpenMobile,
    get isMobile() { return isMobile; },
    toggleSidebar
  });

  const SIDEBAR_WIDTH = '16rem';
  const SIDEBAR_WIDTH_MOBILE = '18rem';
  const SIDEBAR_WIDTH_ICON = '3rem';
</script>

{#if collapsible === 'none'}
  <div
    class={cn('bg-sidebar text-sidebar-foreground flex h-full flex-col', className)}
    style="width: {SIDEBAR_WIDTH};"
  >
    {@render children?.()}
  </div>
{:else if isMobile}
  <Sheet bind:open={openMobile} {side}>
    <div class="flex h-full w-full flex-col" style="width: {SIDEBAR_WIDTH_MOBILE};">
      {@render children?.()}
    </div>
  </Sheet>
{:else}
  <div
    class="group peer text-sidebar-foreground hidden md:block"
    data-state={state}
    data-collapsible={state === 'collapsed' ? collapsible : ''}
    data-variant={variant}
    data-side={side}
  >
    <!-- Sidebar gap -->
    <div
      class={cn(
        'relative bg-transparent transition-[width] duration-200 ease-linear',
        collapsible === 'offcanvas' && state === 'collapsed' ? 'w-0' : `w-[${SIDEBAR_WIDTH}]`,
        variant === 'floating' || variant === 'inset' 
          ? (state === 'collapsed' ? `w-[calc(${SIDEBAR_WIDTH_ICON}+1rem)]` : `w-[${SIDEBAR_WIDTH}]`)
          : (state === 'collapsed' ? `w-[${SIDEBAR_WIDTH_ICON}]` : `w-[${SIDEBAR_WIDTH}]`)
      )}
      style="width: {state === 'collapsed' && collapsible === 'offcanvas' ? '0' : 
              state === 'collapsed' ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH};"
    ></div>
    
    <!-- Sidebar container -->
    <div
      class={cn(
        'fixed inset-y-0 z-10 hidden h-screen transition-[left,right,width] duration-200 ease-linear md:flex',
        side === 'left'
          ? (state === 'collapsed' && collapsible === 'offcanvas' ? '-left-64' : 'left-0')
          : (state === 'collapsed' && collapsible === 'offcanvas' ? '-right-64' : 'right-0'),
        variant === 'floating' || variant === 'inset'
          ? 'p-2'
          : (side === 'left' ? 'border-r' : 'border-l'),
        className
      )}
      style="width: {state === 'collapsed' ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH};"
    >
      <div
        class={cn(
          'bg-sidebar flex h-full w-full flex-col',
          variant === 'floating' && 'rounded-lg border shadow-sm'
        )}
      >
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}