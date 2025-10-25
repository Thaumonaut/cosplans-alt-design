<script lang="ts">
  import { Skeleton } from '$lib/components/ui/skeleton.svelte';
</script>

<div class="space-y-6 p-6">
  <!-- Header skeleton -->
  <div class="space-y-2">
    <Skeleton class="h-8 w-64" />
    <Skeleton class="h-4 w-96" />
  </div>
  
  <!-- Stats cards skeleton -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each Array(4) as _}
      <Skeleton class="h-32" />
    {/each}
  </div>
  
  <!-- Main content skeleton -->
  <div class="grid gap-6 lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2">
      <div class="space-y-4">
        <Skeleton class="h-6 w-48" />
        <div class="grid gap-4 sm:grid-cols-2">
          {#each Array(4) as _}
            <Skeleton class="h-48" />
          {/each}
        </div>
      </div>
    </div>
    
    <div class="space-y-6">
      {#each Array(3) as _}
        <Skeleton class="h-64" />
      {/each}
    </div>
  </div>
</div>