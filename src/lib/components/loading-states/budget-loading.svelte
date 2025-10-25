<script lang="ts">
  import { Skeleton } from '$lib/components/ui/skeleton.svelte';
</script>

<div class="space-y-6 p-6">
  <!-- Header -->
  <div class="space-y-2">
    <Skeleton class="h-8 w-32" />
    <Skeleton class="h-4 w-64" />
  </div>
  
  <!-- Budget overview cards -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {#each Array(4) as _}
      <Skeleton class="h-32" />
    {/each}
  </div>
  
  <!-- Main budget chart/table -->
  <Skeleton class="h-[600px]" />
</div>