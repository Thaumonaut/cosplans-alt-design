<script lang="ts">
  import { cn } from "$lib/utils";

  // Svelte action to append element to portal container
  function portal(node: HTMLElement, container: HTMLElement) {
    container.appendChild(node);
    return {
      update(newContainer: HTMLElement) {
        if (newContainer !== container) {
          container.removeChild(node);
          newContainer.appendChild(node);
        }
      },
      destroy() {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
    };
  }

  interface Props {
    open?: boolean;
    placement?:
      | "top"
      | "bottom"
      | "left"
      | "right"
      | "top-start"
      | "top-end"
      | "bottom-start"
      | "bottom-end"
      | "left-start"
      | "left-end"
      | "right-start"
      | "right-end";
    class?: string;
    children?: any;
    trigger?: any;
  }

  let {
    open = $bindable(false),
    placement = "bottom-start",
    class: className,
    children,
    trigger,
  }: Props = $props();

  let isOpen = $state(false);
  let dropdownElement: HTMLDivElement;
  let triggerElement = $state<HTMLDivElement | undefined>(undefined);
  let dropdownPosition = $state({ top: 0, left: 0, right: 0, bottom: 0, width: 0 });
  let portalContainer: HTMLDivElement | undefined = undefined;
  
  // Calculate dropdown width from trigger element
  const dropdownWidth = $derived(triggerElement?.offsetWidth ?? null);

  // Calculate position for fixed dropdown
  function updateDropdownPosition() {
    if (!triggerElement || !isOpen) return;
    
    const rect = triggerElement.getBoundingClientRect();
    const spacing = 6; // 1.5rem = 6px
    
    let top = 0;
    let left = 0;
    let right = 0;
    let bottom = 0;
    
    // Vertical placement
    if (placement.includes('bottom')) {
      top = rect.bottom + spacing;
    } else if (placement.includes('top')) {
      bottom = window.innerHeight - rect.top + spacing;
    } else {
      // Default to bottom
      top = rect.bottom + spacing;
    }
    
    // Horizontal placement
    if (placement.includes('end') || placement === 'bottom-end' || placement === 'top-end') {
      right = window.innerWidth - rect.right;
      left = 0;
    } else if (placement.includes('start') || placement === 'bottom-start' || placement === 'top-start') {
      left = rect.left;
      right = 0;
    } else if (placement.includes('left')) {
      right = window.innerWidth - rect.left + spacing;
      left = 0;
      top = rect.top;
      bottom = 0;
    } else if (placement.includes('right')) {
      left = rect.right + spacing;
      right = 0;
      top = rect.top;
      bottom = 0;
    } else {
      // Default: bottom-start
      left = rect.left;
      right = 0;
    }
    
    dropdownPosition = { top, left, right, bottom, width: dropdownWidth ?? 280 };
  }

  // Create portal container and manage it
  $effect(() => {
    if (isOpen) {
      // Create portal container if it doesn't exist
      if (!portalContainer) {
        portalContainer = document.createElement('div');
        portalContainer.id = 'dropdown-portal';
        portalContainer.style.position = 'fixed';
        portalContainer.style.top = '0';
        portalContainer.style.left = '0';
        portalContainer.style.width = '100%';
        portalContainer.style.height = '100%';
        portalContainer.style.pointerEvents = 'none';
        portalContainer.style.zIndex = '99999';
        document.body.appendChild(portalContainer);
      }
      
      if (triggerElement) {
        updateDropdownPosition();
        // Recalculate on scroll/resize
        const handleUpdate = () => updateDropdownPosition();
        window.addEventListener('scroll', handleUpdate, true);
        window.addEventListener('resize', handleUpdate);
        return () => {
          window.removeEventListener('scroll', handleUpdate, true);
          window.removeEventListener('resize', handleUpdate);
        };
      }
    } else {
      // Clean up portal container when dropdown closes
      if (portalContainer && portalContainer.parentNode) {
        portalContainer.parentNode.removeChild(portalContainer);
        portalContainer = undefined;
      }
    }
  });

  function toggleDropdown() {
    isOpen = !isOpen;
    if (open !== undefined) {
      open = isOpen;
    }
  }

  function closeDropdown() {
    isOpen = false;
    if (open !== undefined) {
      open = false;
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (isOpen && dropdownElement && !dropdownElement.contains(event.target as Node)) {
      closeDropdown();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      closeDropdown();
    }
  }

  function handleBlur(event: FocusEvent) {
    // Use setTimeout to allow for focus to move to child elements
    setTimeout(() => {
      if (isOpen && dropdownElement && !dropdownElement.contains(document.activeElement)) {
        closeDropdown();
      }
    }, 0);
  }

  // Sync with external open prop
  $effect(() => {
    if (open !== undefined && open !== isOpen) {
      isOpen = open;
    }
  });

  // Add/remove event listeners when dropdown opens/closes
  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeydown);
    } else {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    }

    // Cleanup on component destroy
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div class="relative w-full" bind:this={dropdownElement}>
  <!-- Trigger - can be button or other element from snippet -->
  <div
    bind:this={triggerElement}
    onclick={toggleDropdown}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggleDropdown()
      }
    }}
    class="flex items-center justify-center cursor-pointer w-full"
    role="button"
    tabindex="0"
  >
    {@render trigger?.()}
  </div>

</div>

<!-- Render dropdown in portal to escape all stacking contexts -->
{#if isOpen && portalContainer}
  {@const portal = portalContainer}
  {#key portal}
    <div
      class={cn(
        "fixed backdrop-blur-md border shadow-xl p-1.5 list-none pointer-events-auto",
        "bg-[var(--theme-input-bg)] text-[var(--theme-foreground)] border-[var(--theme-border)] rounded-lg",
        className,
      )}
      style={`
        top: ${dropdownPosition.top}px;
        left: ${dropdownPosition.left ? `${dropdownPosition.left}px` : 'auto'};
        right: ${dropdownPosition.right ? `${dropdownPosition.right}px` : 'auto'};
        bottom: ${dropdownPosition.bottom ? `${dropdownPosition.bottom}px` : 'auto'};
        min-width: 280px;
        z-index: 99999;
        ${dropdownWidth && dropdownWidth > 280 ? `width: ${dropdownWidth}px;` : ''}
      `}
      role="list"
      use:portal
    >
      {@render children?.()}
    </div>
  {/key}
{/if}
