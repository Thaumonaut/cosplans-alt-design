<script lang="ts">
  import { LoadingSpinner } from '$lib/components/ui/loading-spinner.svelte';
  
  interface Props {
    message?: string;
  }
  
  let { message = 'Loading...' }: Props = $props();
</script>

<div class="flex min-h-screen items-center justify-center">
  <div class="text-center space-y-4">
    <LoadingSpinner size="lg" />
    <p class="text-muted-foreground">{message}</p>
  </div>
</div>