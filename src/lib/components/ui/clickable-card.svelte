<script lang="ts">
  import { cn } from '$lib/utils'
  import { draggable } from '$lib/utils/drag-drop'
  import type { DragData } from '$lib/utils/drag-drop'
  
  interface Props {
    onclick?: () => void
    class?: string
    disabled?: boolean
    selected?: boolean
    draggable?: boolean // HTML draggable attribute
    dragData?: DragData | null // Data for draggable action
    children?: any
  }
  
  let {
    onclick,
    class: className = '',
    disabled = false,
    selected = false,
    draggable: isDraggable = false,
    dragData = null,
    children
  }: Props = $props()
  
  function handleClick(event: MouseEvent) {
    if (disabled) return
    
    // Get the actual element (not text node)
    let target = event.target as HTMLElement
    // If target is a text node, get its parent element
    if (target.nodeType === Node.TEXT_NODE) {
      target = target.parentElement as HTMLElement
    }
    if (!target) return
    
    const currentTarget = event.currentTarget as HTMLElement
    
    // If clicking directly on the card root element, always trigger
    if (target === currentTarget) {
      onclick?.()
      return
    }
    
    // Check if the target itself is an interactive element
    const isInteractiveElement = (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'TEXTAREA' ||
      (target.getAttribute('role') === 'button' && target.getAttribute('role') !== 'none') ||
      target.getAttribute('role') === 'link' ||
      target.hasAttribute('data-dropdown-trigger')
    )
    
    if (isInteractiveElement) {
      return
    }
    
    // Check for interactive elements within specific containers
    const isTagSelectorButton = target.closest('.tag-selector button, .tag-selector [role="button"]')
    const isDatepickerInput = target.closest('.datepicker input, .datepicker button, .datepicker [role="button"]')
    const isCheckbox = target.closest('input[type="checkbox"]')
    
    // If clicking on actual interactive elements, don't trigger card click
    if (isTagSelectorButton || isDatepickerInput || isCheckbox) {
      return
    }
    
    // Check if click is on a no-click-propagation element - but only if it's actually interactive
    const noClickEl = target.closest('.no-click-propagation')
    if (noClickEl) {
      // Only block if clicking on an interactive element inside the no-click-propagation container
      const interactiveInContainer = target.closest('button, input, [role="button"], [role="link"]', noClickEl)
      if (interactiveInContainer) {
        return
      }
      // Also block if the no-click element itself has a role (is interactive) and it's not role="none"
      if (target === noClickEl) {
        const role = noClickEl.getAttribute('role')
        if (role && role !== 'none') {
          return
        }
      }
    }
    
    // Check if click is on an interactive element (using closest for nested elements)
    // But exclude the card root itself
    const interactiveSelectors = [
      'button:not([role="none"])',
      'a',
      'input',
      'select',
      'textarea',
      '[role="button"]:not([role="none"])',
      '[role="link"]',
      '[data-dropdown-trigger]'
    ]
    
    for (const selector of interactiveSelectors) {
      const match = target.closest(selector)
      if (match && match !== currentTarget) {
        return
      }
    }
    
    // Allow clicks on card body (text, empty space, etc.) to trigger card click
    onclick?.()
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (disabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onclick?.()
    }
  }
</script>

{#if dragData}
  <div
    role={onclick ? 'button' : undefined}
    tabindex={onclick && !disabled ? 0 : undefined}
    onclick={handleClick}
    onkeydown={handleKeydown}
    draggable={isDraggable || true}
    class={cn(
      'group relative rounded-lg bg-card transition-all border',
      onclick && !disabled && 'cursor-pointer hover:shadow-lg',
      selected && 'ring-2 ring-primary',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    style="overflow: visible;"
    use:draggable={dragData}
  >
    {#if children}
      {@render children()}
    {/if}
  </div>
{:else}
  <div
    role={onclick ? 'button' : undefined}
    tabindex={onclick && !disabled ? 0 : undefined}
    onclick={handleClick}
    onkeydown={handleKeydown}
    draggable={isDraggable}
    class={cn(
      'group relative rounded-lg border bg-card transition-all',
      onclick && !disabled && 'cursor-pointer hover:shadow-lg',
      selected && 'ring-2 ring-primary',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    style="overflow: visible;"
  >
    {#if children}
      {@render children()}
    {/if}
  </div>
{/if}

