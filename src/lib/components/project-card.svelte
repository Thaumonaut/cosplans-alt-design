<script lang="ts">
  import { Card, CardContent, CardFooter, CardHeader, Badge, Progress } from '$lib/components/ui';
  import { Calendar, DollarSign } from 'lucide-svelte';
  
  interface Props {
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
  
  let { title, character, series, image, progress, budget, deadline, status }: Props = $props();
  
  const statusColors = {
    idea: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    planning: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    'in-progress': 'bg-primary/10 text-primary',
    completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  };
</script>

<Card class="group overflow-hidden transition-all hover:shadow-lg">
  <CardHeader class="p-0">
    <div class="relative aspect-[4/3] overflow-hidden bg-muted">
      <img
        src={image || '/placeholder.svg'}
        alt={title}
        class="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
      <div class="absolute right-3 top-3">
        <Badge class={statusColors[status]} variant="secondary">
          {status.replace('-', ' ')}
        </Badge>
      </div>
    </div>
  </CardHeader>
  <CardContent class="p-4">
    <div class="space-y-3">
      <div>
        <h3 class="text-balance font-semibold leading-tight">{character}</h3>
        <p class="text-sm text-muted-foreground">{series}</p>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Progress</span>
          <span class="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} class="h-2" />
      </div>
    </div>
  </CardContent>
  <CardFooter class="flex items-center justify-between border-t bg-muted/30 px-4 py-3 text-sm">
    {#if deadline}
      <div class="flex items-center gap-1.5 text-muted-foreground">
        <Calendar class="size-4" />
        <span>{deadline}</span>
      </div>
    {/if}
    <div class="flex items-center gap-1.5 text-muted-foreground">
      <DollarSign class="size-4" />
      <span>
        ${budget.spent} / ${budget.total}
      </span>
    </div>
  </CardFooter>
</Card>