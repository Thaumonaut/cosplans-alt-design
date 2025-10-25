<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle, Progress } from '$lib/components/ui';
  
  interface BudgetItem {
    project: string;
    spent: number;
    total: number;
    color: string;
  }
  
  const budgets: BudgetItem[] = [
    { project: 'Malenia', spent: 450, total: 800, color: 'bg-red-500' },
    { project: 'Raiden Shogun', spent: 200, total: 600, color: 'bg-purple-500' },
    { project: 'V (Cyberpunk)', spent: 50, total: 500, color: 'bg-cyan-500' },
  ];
  
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.total, 0);
  const percentageUsed = Math.round((totalSpent / totalBudget) * 100);
</script>

<Card>
  <CardHeader>
    <CardTitle class="text-lg">Budget Overview</CardTitle>
  </CardHeader>
  <CardContent class="space-y-6">
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted-foreground">Total Budget Used</span>
        <span class="text-2xl font-bold">
          ${totalSpent} / ${totalBudget}
        </span>
      </div>
      <Progress value={percentageUsed} class="h-3" />
      <p class="text-sm text-muted-foreground">{percentageUsed}% of total budget</p>
    </div>

    <div class="space-y-4">
      <h4 class="text-sm font-medium">By Project</h4>
      {#each budgets as budget}
        {@const percentage = Math.round((budget.spent / budget.total) * 100)}
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="font-medium">{budget.project}</span>
            <span class="text-muted-foreground">
              ${budget.spent} / ${budget.total}
            </span>
          </div>
          <div class="relative h-2 overflow-hidden rounded-full bg-muted">
            <div class={`h-full ${budget.color}`} style="width: {percentage}%"></div>
          </div>
        </div>
      {/each}
    </div>
  </CardContent>
</Card>