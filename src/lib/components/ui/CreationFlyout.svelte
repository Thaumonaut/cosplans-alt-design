<script lang="ts">
  import { Button } from '$lib/components/ui'
  import { X, Maximize2 } from 'lucide-svelte'
  import { cn } from '$lib/utils'

  interface Props {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    title?: string
    children?: any
    footer?: import('svelte').Snippet
    onFullScreen?: () => void
  }

  let { 
    open = $bindable(false), 
    onOpenChange, 
    title = 'New Item', 
    children, 
    footer,
    onFullScreen 
  }: Props = $props()

  const HEADER_HEIGHT = 64

  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  })
</script>

{#if open}
      <!-- Backdrop -->
      <button
        type="button"
        aria-label="Close flyout"
        onclick={(e) => {
          // Only close if clicking directly on backdrop, not children
          if (e.target === e.currentTarget) {
            open = false
            onOpenChange?.(false)
          }
        }}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            open = false
            onOpenChange?.(false)
          }
        }}
        class="fixed z-40 bg-black/10 transition-opacity duration-500 w-full h-full border-0 p-0 cursor-default"
        style="top: {HEADER_HEIGHT}px; left: 16rem; right: 0; bottom: 0;"
      ></button>

  <!-- Flyout Panel - Functional layout -->
  <div
    class={cn(
      'fixed right-0 z-50 bg-background flex flex-col',
      'transition-transform duration-500 ease-out',
      'w-full sm:w-[680px]',
      open ? 'translate-x-0' : 'translate-x-full'
    )}
    style="top: {HEADER_HEIGHT}px; bottom: 0;"
    role="dialog"
    aria-modal="true"
    aria-labelledby="flyout-title"
    tabindex="-1"
  >
    <!-- Header - Minimal, functional -->
    <header class="flex-shrink-0 flex items-center justify-between border-b px-10 py-8">
      <h2 id="flyout-title" class="text-xl font-normal">{title}</h2>
      <div class="flex items-center gap-3">
        {#if onFullScreen}
          <button
            onclick={onFullScreen}
            class="p-2 -mr-2 text-sm uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
          >
            <Maximize2 class="size-4" />
          </button>
        {/if}
        <button
          onclick={() => {
            open = false
            onOpenChange?.(false)
          }}
          class="p-2 -mr-2 text-sm uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
        >
          <X class="size-4" />
        </button>
      </div>
    </header>

    <!-- Content - Structured layout with proper overflow handling -->
    <main class="flex-1 overflow-y-auto overflow-x-hidden" style="min-height: 0; display: flex; flex-direction: column;">
      {#if children}
        {@render children()}
      {/if}
    </main>

    <!-- Footer - Fixed at bottom (from snippet prop) -->
    {#if footer !== undefined && footer !== null}
      <footer class="flex-shrink-0 border-t bg-background/95 px-10 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-20">
        {@render footer()}
      </footer>
    {/if}
  </div>
{/if}
