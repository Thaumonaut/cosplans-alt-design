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

<div class="relative" bind:this={dropdownElement}>
  <!-- Trigger - can be button or other element from snippet -->
  <div
    onclick={toggleDropdown}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggleDropdown()
      }
    }}
    class="inline-flex items-center justify-center cursor-pointer"
    role="button"
    tabindex="0"
  >
    {@render trigger?.()}
  </div>

  <!-- Dropdown menu positioned correctly -->
  {#if isOpen}
    <div
      class={cn(
        "absolute bg-popover text-popover-foreground border shadow-lg rounded-md p-1 min-w-[8rem] z-[9999]",
        // Position based on placement prop
        placement === "top-start" && "bottom-full left-0 mb-1",
        placement === "top-end" && "bottom-full right-0 mb-1", 
        placement === "bottom-start" && "top-full left-0 mt-1",
        placement === "bottom-end" && "top-full right-0 mt-1",
        placement === "left-start" && "right-full top-0 mr-1",
        placement === "right-start" && "left-full top-0 ml-1",
        className,
      )}
    >
      {@render children?.()}
    </div>
  {/if}
</div>
