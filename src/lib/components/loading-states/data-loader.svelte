<script lang="ts">
  import { Loader2, AlertCircle, RefreshCw } from 'lucide-svelte'
  import { Button } from '$lib/components/ui'

  export let loading = false
  export let error: string | null = null
  export let empty = false
  export let emptyMessage = 'No data available'
  export let errorMessage = 'Something went wrong'
  export let showRetry = true
  export let onRetry: (() => void) | undefined = undefined

  function handleRetry() {
    if (onRetry) {
      onRetry()
    }
  }
</script>

{#if loading}
  <div class="flex flex-col items-center justify-center p-8 text-center">
    <Loader2 class="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
    <p class="text-sm text-muted-foreground">Loading...</p>
  </div>
{:else if error}
  <div class="flex flex-col items-center justify-center p-8 text-center">
    <AlertCircle class="mb-4 h-8 w-8 text-destructive" />
    <p class="mb-4 text-sm text-destructive">{error || errorMessage}</p>
    {#if showRetry && onRetry}
      <Button variant="outline" size="sm" on:click={handleRetry}>
        <RefreshCw class="mr-2 h-4 w-4" />
        Try Again
      </Button>
    {/if}
  </div>
{:else if empty}
  <div class="flex flex-col items-center justify-center p-8 text-center">
    <div class="mb-4 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
      <span class="text-muted-foreground text-sm">?</span>
    </div>
    <p class="text-sm text-muted-foreground">{emptyMessage}</p>
  </div>
{:else}
  <slot />
{/if}