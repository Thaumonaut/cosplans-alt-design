<script lang="ts">
  import { Card, CardContent, CardHeader, Badge, Progress } from '$lib/components/ui';
  import { Calendar } from 'lucide-svelte';
  
  interface Props {
    id: string | number;
    title: string;
    character: string;
    series: string;
    image: string;
    progress: number;
    budget: {
      spent: number;
      total: number;
    };
    deadline?: string;
    status: 'idea' | 'planning' | 'in-progress' | 'completed';
  }
  
  let { id, title, character, series, image, progress, budget, deadline, status }: Props = $props();
  
  const statusColors = {
    idea: 'bg-[color-mix(in_srgb,var(--theme-primary)_20%,transparent)] text-[var(--theme-primary)]',
    planning: 'bg-[color-mix(in_srgb,var(--theme-info)_20%,transparent)] text-[var(--theme-info)]',
    'in-progress': 'bg-[color-mix(in_srgb,var(--theme-warning)_20%,transparent)] text-[var(--theme-warning)]',
    completed: 'bg-[color-mix(in_srgb,var(--theme-success)_20%,transparent)] text-[var(--theme-success)]',
  };
</script>

<a href="/projects/{id}">
  <Card class="group overflow-hidden transition-all hover:shadow-lg">
    <CardHeader class="p-0">
      <div class="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={image || '/placeholder.svg'}
          alt={title}
          class="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div class="absolute right-4 top-4">
          <Badge class={statusColors[status]} variant="secondary">
            {status.replace('-', ' ')}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent class="p-7">
      <div class="space-y-5">
        <div class="space-y-2">
          <h3 class="text-balance text-xl font-semibold leading-tight">{character}</h3>
          <p class="text-base text-muted-foreground">{series}</p>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-muted-foreground">Progress</span>
            <span class="text-base font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} class="h-3" />
        </div>

        {#if deadline}
          <div class="flex items-center gap-2 pt-2 text-muted-foreground">
            <Calendar class="size-4" />
            <span class="text-sm font-medium">{deadline}</span>
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>
</a>