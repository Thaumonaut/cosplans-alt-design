<script lang="ts">
  import { Plus } from 'lucide-svelte';
  import { Button } from '$lib/components/ui';
</script>

<svelte:head>
  <title>Equipment - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <!-- Header with actions -->
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-balance text-3xl font-bold leading-tight">Equipment</h1>
      <p class="text-pretty text-muted-foreground">Photography and event equipment</p>
    </div>
    
    <Button size="icon">
      <Plus class="size-5" />
    </Button>
  </div>

  <!-- Empty state -->
  <div class="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed">
    <div class="text-center">
      <p class="mb-2 text-lg font-medium text-muted-foreground">No equipment tracked yet</p>
      <p class="text-sm text-muted-foreground">Add cameras, lighting, and other event equipment</p>
    </div>
  </div>
</div>