<script lang="ts">
  import { Card, Badge, Button, Progress } from '$lib/components/ui';
  import { Calendar, DollarSign, CheckSquare, Package, ArrowRight, AlertCircle } from 'lucide-svelte';

  interface Props {
    character: string;
    series: string;
    image: string;
    budget: {
      allocated: number;
      spent: number;
    };
    timeline: {
      startDate: string;
      targetDate: string;
      daysRemaining: number;
    };
    tasks: {
      total: number;
      completed: number;
    };
    materials: {
      ordered: number;
      pending: number;
    };
    priority: 'low' | 'medium' | 'high';
  }

  let {
    character,
    series,
    image,
    budget,
    timeline,
    tasks,
    materials,
    priority
  }: Props = $props();

  const priorityColors = {
    low: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    high: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  };

  const taskProgress = $derived((tasks.completed / tasks.total) * 100);
  const budgetProgress = $derived((budget.spent / budget.allocated) * 100);
</script>

<Card class="overflow-hidden transition-all hover:shadow-lg">
  <div class="flex flex-col gap-6 p-6 md:flex-row">
    <div class="relative size-48 shrink-0 overflow-hidden rounded-lg bg-muted">
      <img src={image || "/placeholder.svg"} alt={character} class="size-full object-cover" />
      <div class="absolute right-2 top-2">
        <Badge class={priorityColors[priority]} variant="secondary">
          {priority} priority
        </Badge>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-6">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-balance text-xl font-semibold leading-tight">{character}</h3>
          <p class="text-muted-foreground">{series}</p>
        </div>
        <Button>
          View Details
          <ArrowRight class="ml-2 size-4" />
        </Button>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckSquare class="size-4" />
            <span>Tasks Progress</span>
          </div>
          <div class="space-y-1">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium">
                {tasks.completed} / {tasks.total}
              </span>
              <span class="text-muted-foreground">{Math.round(taskProgress)}%</span>
            </div>
            <Progress value={taskProgress} class="h-2" />
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign class="size-4" />
            <span>Budget Used</span>
          </div>
          <div class="space-y-1">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium">
                ${budget.spent} / ${budget.allocated}
              </span>
              <span class="text-muted-foreground">{Math.round(budgetProgress)}%</span>
            </div>
            <Progress value={budgetProgress} class="h-2" />
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar class="size-4" />
            <span>Timeline</span>
          </div>
          <div class="space-y-1">
            <div class="text-sm">
              <p class="font-medium">{timeline.daysRemaining} days left</p>
              <p class="text-muted-foreground">Due {new Date(timeline.targetDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Package class="size-4" />
            <span>Materials</span>
          </div>
          <div class="space-y-1">
            <div class="text-sm">
              <p class="font-medium">{materials.ordered} ordered</p>
              <p class="text-muted-foreground">{materials.pending} pending</p>
            </div>
          </div>
        </div>
      </div>

      {#if timeline.daysRemaining < 60}
        <div class="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle class="size-4" />
          <span>Deadline approaching - consider prioritizing this project</span>
        </div>
      {/if}
    </div>
  </div>
</Card>