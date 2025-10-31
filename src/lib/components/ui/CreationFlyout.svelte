<script lang="ts">
  import { Button } from '$lib/components/ui'
  import { X, Maximize2 } from 'lucide-svelte'
  import { cn } from '$lib/utils'

  interface Props {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    title?: string
    children?: any
    onFullScreen?: () => void
  }

  let { open = $bindable(false), onOpenChange, title = 'New Item', children, onFullScreen }: Props = $props()

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
  <div
    role="button"
    tabindex="0"
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
    class="fixed z-40 bg-black/10 transition-opacity duration-500"
    style="top: {HEADER_HEIGHT}px; left: 16rem; right: 0; bottom: 0;"
  ></div>

  <!-- Flyout Panel - Functional layout -->
  <div
    class={cn(
      'fixed right-0 z-50 bg-background',
      'transition-transform duration-500 ease-out',
      'w-full sm:w-[680px]',
      open ? 'translate-x-0' : 'translate-x-full'
    )}
    style="top: {HEADER_HEIGHT}px; height: calc(100vh - {HEADER_HEIGHT}px);"
    onclick={(e) => {
      // Prevent backdrop click from closing when clicking inside panel
      e.stopPropagation()
    }}
  >
    <!-- Header - Minimal, functional -->
    <header class="flex items-center justify-between border-b px-10 py-8">
      <h2 class="text-xl font-normal">{title}</h2>
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

    <!-- Content - Structured layout -->
    <main class="overflow-y-auto" style="height: calc(100vh - {HEADER_HEIGHT}px - 80px);">
      <div class="px-10 py-12">
        {#if children}
          {@render children()}
        {/if}
      </div>
    </main>
  </div>
{/if}
