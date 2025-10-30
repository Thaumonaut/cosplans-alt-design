<script lang="ts">
  import { Card, CardContent } from '$lib/components/ui';
  import { TrendingUp, TrendingDown } from 'lucide-svelte';
  import type { Snippet } from 'svelte';
  
  interface Props {
    title: string;
    value: string | number;
    change?: {
      value: number;
      trend: 'up' | 'down';
    };
    icon: Snippet;
  }
  
  let { title, value, change, icon }: Props = $props();
</script>

<Card>
  <CardContent class="p-7">
    <div class="flex items-start justify-between">
      <div class="space-y-3">
        <!-- Increased title font weight for better contrast -->
        <p class="text-sm font-medium text-muted-foreground">{title}</p>
        <p class="text-4xl font-bold">{value}</p>
        {#if change}
          <div class="flex items-center gap-1.5 text-sm">
            {#if change.trend === 'up'}
              <TrendingUp class="size-4 text-primary" />
            {:else}
              <TrendingDown class="size-4 text-destructive" />
            {/if}
            <span class={change.trend === 'up' ? 'text-primary' : 'text-destructive'}>
              {change.value}% from last month
            </span>
          </div>
        {/if}
      </div>
      <div class="rounded-lg bg-primary/10 p-4 text-primary">
        {@render icon()}
      </div>
    </div>
  </CardContent>
</Card>