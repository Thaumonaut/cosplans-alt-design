<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
  import { AlertTriangle, Home, RefreshCw, Bug } from 'lucide-svelte';
  
  function handleRefresh() {
    window.location.reload();
  }
  
  async function goHome() {
    await goto('/');
  }

  const is404 = $derived($page.status === 404);
  const is500 = $derived($page.status === 500 || ($page.status && $page.status >= 500));
  
  const errorTitle = $derived(
    is404 ? 'Page Not Found' :
    is500 ? 'Server Error' :
    'Something went wrong'
  );

  const errorMessage = $derived(
    is404 ? "The page you're looking for doesn't exist or has been moved." :
    is500 ? 'An internal server error occurred. Our team has been notified.' :
    $page.error?.message || "We're sorry for the inconvenience."
  );
</script>

<svelte:head>
  <title>{errorTitle} - Cosplay Tracker</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-6 bg-background">
  <Card class="w-full max-w-md">
    <CardHeader class="text-center">
      <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
        {#if is404}
          <Bug class="size-6 text-destructive" />
        {:else}
          <AlertTriangle class="size-6 text-destructive" />
        {/if}
      </div>
      <CardTitle class="text-xl">{errorTitle}</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="text-center text-sm text-muted-foreground">
        <p class="mb-2">{errorMessage}</p>
        {#if !is404 && !is500 && $page.error && 'stack' in $page.error && $page.error.stack}
          <details class="mt-4 text-left">
            <summary class="cursor-pointer text-xs">Technical Details</summary>
            <pre class="mt-2 text-xs overflow-auto max-h-32 bg-muted p-2 rounded">{$page.error.stack as string}</pre>
          </details>
        {/if}
      </div>
      
      <div class="flex gap-2">
        <Button variant="outline" class="flex-1" onclick={handleRefresh}>
          <RefreshCw class="size-4 mr-2" />
          Refresh
        </Button>
        <Button class="flex-1" onclick={goHome}>
          <Home class="size-4 mr-2" />
          {is404 ? 'Go Home' : 'Home'}
        </Button>
      </div>
      
      {#if $page.status}
        <div class="text-center text-xs text-muted-foreground">
          Error {$page.status}
        </div>
      {/if}
    </CardContent>
  </Card>
</div>