<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { keyboardShortcuts } from '$lib/utils/keyboard-shortcuts'
  import { goto } from '$app/navigation'

  interface Props {
    searchUrl?: string // URL to navigate to when Ctrl+K is pressed
    onSearch?: () => void // Callback for search action
  }

  let { searchUrl, onSearch }: Props = $props()

  onMount(() => {
    // Register Ctrl+K or Cmd+K for search
    keyboardShortcuts.register({
      key: 'k',
      ctrl: true,
      meta: true, // Also works with Cmd on Mac
      callback: () => {
        if (onSearch) {
          onSearch()
        } else if (searchUrl) {
          goto(searchUrl)
        } else {
          // Default: focus on search input if available
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
        }
      },
      description: 'Open search'
    })
  })

  onDestroy(() => {
    // Shortcuts are cleaned up automatically by the singleton
  })
</script>

