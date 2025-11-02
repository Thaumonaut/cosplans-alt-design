<script lang="ts">
  import { LoadingSpinner } from '$lib/components/ui'

  interface Props {
    loading?: boolean
    error?: string | null
    empty?: boolean
    emptyMessage?: string
    emptyIcon?: any
    emptyAction?: {
      label: string
      onclick: () => void
    }
    errorMessage?: string
    onRetry?: () => void
  }

  let {
    loading = false,
    error = null,
    empty = false,
    emptyMessage = 'No data available',
    emptyIcon,
    emptyAction,
    errorMessage = 'Something went wrong',
    onRetry
  }: Props = $props()
</script>

{#if loading}
  <div class="flex flex-col items-center justify-center py-12">
    <LoadingSpinner size="lg" />
    <p class="mt-4 text-sm text-muted-foreground">Loading...</p>
  </div>
{:else if error}
  <div class="flex flex-col items-center justify-center py-12">
    <div class="mb-4 size-12 rounded-full bg-destructive/10 flex items-center justify-center">
      <svg class="size-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p class="mb-2 text-sm font-medium text-destructive">{error || errorMessage}</p>
    {#if onRetry}
      <button
        onclick={onRetry}
        class="mt-4 text-sm text-primary hover:underline"
      >
        Try Again
      </button>
    {/if}
  </div>
{:else if empty}
  <div class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16">
    {#if emptyIcon}
      {@const IconComponent = emptyIcon}
      <IconComponent class="mb-4 size-12 text-muted-foreground opacity-50" />
    {:else}
      <div class="mb-4 size-12 rounded-full bg-muted flex items-center justify-center">
        <svg class="size-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    {/if}
    <h3 class="mb-2 text-lg font-semibold">No items found</h3>
    <p class="mb-6 text-center text-sm text-muted-foreground max-w-md">
      {emptyMessage}
    </p>
    {#if emptyAction}
      <button
        onclick={emptyAction.onclick}
        class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {emptyAction.label}
      </button>
    {/if}
  </div>
{/if}

