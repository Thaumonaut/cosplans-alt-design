<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
  import { AlertTriangle, Home, RefreshCw } from 'lucide-svelte';
  
  function handleRefresh() {
    window.location.reload();
  }
  
  function goHome() {
    window.location.href = '/';
  }
</script>

<svelte:head>
  <title>Error - Cosplay Tracker</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-6 bg-background">
  <Card class="w-full max-w-md">
    <CardHeader class="text-center">
      <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle class="size-6 text-destructive" />
      </div>
      <CardTitle class="text-xl">Something went wrong</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="text-center text-sm text-muted-foreground">
        {#if $page.error?.message}
          <p class="mb-2">{$page.error.message}</p>
        {/if}
        <p>We're sorry for the inconvenience. Please try refreshing the page or return to the homepage.</p>
      </div>
      
      <div class="flex gap-2">
        <Button variant="outline" class="flex-1" onclick={handleRefresh}>
          <RefreshCw class="size-4 mr-2" />
          Refresh
        </Button>
        <Button class="flex-1" onclick={goHome}>
          <Home class="size-4 mr-2" />
          Home
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