<script lang="ts">
  import { cn } from "$lib/utils";

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
  
  // Calculate dropdown width from trigger element
  const dropdownWidth = $derived(triggerElement?.offsetWidth ?? null);

  // Calculate position for fixed dropdown
  function updateDropdownPosition() {
    if (!triggerElement || !isOpen) return;
    
    const rect = triggerElement.getBoundingClientRect();
    const dropdownRect = { top: 0, left: 0, right: 0, bottom: 0, width: dropdownWidth ?? 280 };
    
    if (placement.includes('bottom')) {
      dropdownRect.top = rect.bottom + 6; // 1.5 * 4px = 6px (mt-1.5)
    } else if (placement.includes('top')) {
      dropdownRect.bottom = window.innerHeight - rect.top + 6;
    }
    
    if (placement.includes('end') || placement === 'bottom-end' || placement === 'top-end') {
      dropdownRect.right = window.innerWidth - rect.right;
    } else if (placement.includes('start') || placement === 'bottom-start' || placement === 'top-start') {
      dropdownRect.left = rect.left;
    } else {
      // center or default
      dropdownRect.left = rect.left;
    }
    
    dropdownPosition = dropdownRect;
  }

  $effect(() => {
    if (isOpen && triggerElement) {
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

  <!-- Dropdown menu positioned correctly - use fixed to escape stacking contexts -->
  {#if isOpen}
    <div
      class={cn(
        "fixed backdrop-blur-md border shadow-xl p-1.5 z-[99999] list-none",
        "bg-[var(--theme-input-bg)] text-[var(--theme-foreground)] border-[var(--theme-border)] rounded-lg",
        className,
      )}
      style={`
        top: ${dropdownPosition.top}px;
        left: ${dropdownPosition.left ? `${dropdownPosition.left}px` : 'auto'};
        right: ${dropdownPosition.right ? `${dropdownPosition.right}px` : 'auto'};
        bottom: ${dropdownPosition.bottom ? `${dropdownPosition.bottom}px` : 'auto'};
        min-width: 280px;
        ${dropdownWidth && dropdownWidth > 280 ? `width: ${dropdownWidth}px;` : ''}
      `}
      role="list"
    >
      {@render children?.()}
    </div>
  {/if}
</div>
