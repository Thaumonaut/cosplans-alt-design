<script lang="ts">
  import {
    TrendingUp,
    TrendingDown,
    Plus,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Users,
  } from 'lucide-svelte';
  import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Badge } from '$lib/components/ui';
  import { onMount } from 'svelte';
  import { projectService } from '$lib/api/services/projectService';
  import { resourceService } from '$lib/api/services/resourceService';
  import { currentTeam } from '$lib/stores/teams';
  import { get } from 'svelte/store';
  import { formatCurrencyFromCents } from '$lib/utils';
  import type { Project } from '$lib/types/domain/project';

  let activeTab = $state("overview");
  let loading = $state(true);

  interface ProjectBudget {
    id: string;
    name: string;
    budget: number;
    spent: number;
    income: number;
    status: string;
    color: string;
  }

  let projectBudgets = $state<ProjectBudget[]>([]);
  
  // Calculate totals from projects
  const personalBudget = $derived(() => {
    const total = projectBudgets.reduce((sum, p) => sum + p.budget, 0);
    const spent = projectBudgets.reduce((sum, p) => sum + p.spent, 0);
    const income = projectBudgets.reduce((sum, p) => sum + p.income, 0);
    return {
      total,
      spent,
      income,
      remaining: total - spent,
    };
  });

  // For now, team budget same as personal (no separate team budget yet)
  const teamBudget = $derived(() => personalBudget());

  // Recent transactions - empty for now (no budget_items table yet)
  interface Transaction {
    id: string;
    type: "expense" | "income";
    category: string;
    description: string;
    amount: number;
    project: string;
    date: string;
  }
  
  const recentTransactions = $derived<Transaction[]>([]);

  // Expense categories - calculate from resources if available
  interface ExpenseCategory {
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }
  
  const expenseCategories = $derived<ExpenseCategory[]>(() => {
    // For now, return empty since we don't have budget_items with categories
    // This would need to be calculated from resource costs grouped by category
    return [];
  });

  const totalSpent = $derived(personalBudget().spent);
  const totalIncome = $derived(personalBudget().income);
  const netBalance = $derived(totalIncome - totalSpent);

  // Color mapping for projects
  const projectColors = [
    "bg-red-500",
    "bg-purple-500",
    "bg-cyan-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-blue-500",
  ];

  async function loadBudgetData() {
    try {
      loading = true;
      const team = get(currentTeam);
      if (!team) {
        projectBudgets = [];
        return;
      }

      // Load projects for budget data
      const projects = await projectService.list();
      
      projectBudgets = projects.map((project, index) => ({
        id: project.id,
        name: project.character,
        budget: project.estimatedBudget ? project.estimatedBudget / 100 : 0, // Convert from cents
        spent: project.spentBudget ? project.spentBudget / 100 : 0, // Convert from cents
        income: 0, // No income tracking yet
        status: project.status,
        color: projectColors[index % projectColors.length],
      }));
    } catch (error) {
      console.error('Failed to load budget data:', error);
      projectBudgets = [];
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadBudgetData();
    
    const unsubscribe = currentTeam.subscribe(() => {
      loadBudgetData();
    });
    
    return unsubscribe;
  });
</script>

<svelte:head>
  <title>Budget - Cosplay Tracker</title>
</svelte:head>

<!-- Page Header Actions -->
<div class="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="flex items-center gap-4">
    <h1 class="font-semibold">Budget</h1>
  </div>
  
  <div class="flex items-center gap-2">
    <Button size="sm" variant="outline">
      <Filter class="size-4" />
    </Button>
    <Button size="sm" variant="outline">
      <Download class="size-4" />
    </Button>
    <Button size="sm">
      <Plus class="size-4" />
    </Button>
  </div>
</div>

<div class="space-y-6 p-6">
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Total Budget</CardTitle>
        <Wallet class="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">
          {#if loading}
            ...
          {:else}
            {formatCurrencyFromCents(personalBudget().total * 100)}
          {/if}
        </div>
        <p class="text-xs text-muted-foreground">Personal budget allocation</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Total Spent</CardTitle>
        <ArrowUpRight class="size-4 text-red-500" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-red-500">
          {#if loading}
            ...
          {:else}
            {formatCurrencyFromCents(totalSpent * 100)}
          {/if}
        </div>
        <p class="text-xs text-muted-foreground">
          {#if loading}
            ...
          {:else}
            {personalBudget().total > 0 ? Math.round((totalSpent / personalBudget().total) * 100) : 0}% of budget
          {/if}
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Total Income</CardTitle>
        <ArrowDownRight class="size-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-green-500">
          {#if loading}
            ...
          {:else}
            {formatCurrencyFromCents(totalIncome * 100)}
          {/if}
        </div>
        <p class="text-xs text-muted-foreground">From commissions & services</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Net Balance</CardTitle>
        {#if netBalance >= 0}
          <TrendingUp class="size-4 text-green-500" />
        {:else}
          <TrendingDown class="size-4 text-red-500" />
        {/if}
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold {netBalance >= 0 ? 'text-green-500' : 'text-red-500'}">
          {#if loading}
            ...
          {:else}
            {formatCurrencyFromCents(Math.abs(netBalance) * 100)}
          {/if}
        </div>
        <p class="text-xs text-muted-foreground">
          {#if loading}
            ...
          {:else}
            {netBalance >= 0 ? "Surplus" : "Deficit"}
          {/if}
        </p>
      </CardContent>
    </Card>
  </div>

  <!-- Tabs -->
  <div class="space-y-6">
    <div class="flex gap-2">
      <Button 
        variant={activeTab === "overview" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "overview"}
      >
        Overview
      </Button>
      <Button 
        variant={activeTab === "personal" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "personal"}
      >
        Personal
      </Button>
      <Button 
        variant={activeTab === "team" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "team"}
      >
        Team
      </Button>
      <Button 
        variant={activeTab === "projects" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "projects"}
      >
        Projects
      </Button>
      <Button 
        variant={activeTab === "transactions" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "transactions"}
      >
        Transactions
      </Button>
    </div>

    {#if activeTab === "overview"}
      <div class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Budget Breakdown</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium">Personal Budget</span>
                  <span class="text-muted-foreground">
                    {#if loading}
                      Loading...
                    {:else}
                      {formatCurrencyFromCents(personalBudget().spent * 100)} / {formatCurrencyFromCents(personalBudget().total * 100)}
                    {/if}
                  </span>
                </div>
                <Progress 
                  value={loading || personalBudget().total === 0 ? 0 : (personalBudget().spent / personalBudget().total) * 100} 
                  class="h-2" 
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium">Team Budget</span>
                  <span class="text-muted-foreground">
                    {#if loading}
                      Loading...
                    {:else}
                      {formatCurrencyFromCents(teamBudget().spent * 100)} / {formatCurrencyFromCents(teamBudget().total * 100)}
                    {/if}
                  </span>
                </div>
                <Progress 
                  value={loading || teamBudget().total === 0 ? 0 : (teamBudget().spent / teamBudget().total) * 100} 
                  class="h-2" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              {#if loading}
                <div class="text-center py-4 text-sm text-muted-foreground">Loading categories...</div>
              {:else if expenseCategories.length === 0}
                <div class="text-center py-4 text-sm text-muted-foreground">
                  Expense categories will appear here once you track expenses by category.
                </div>
              {:else}
                {#each expenseCategories as category}
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="font-medium">{category.name}</span>
                      <span class="text-muted-foreground">{formatCurrencyFromCents(category.amount * 100)}</span>
                    </div>
                    <div class="relative h-2 overflow-hidden rounded-full bg-muted">
                      <div class="{category.color} h-full" style="width: {category.percentage}%"></div>
                    </div>
                  </div>
                {/each}
              {/if}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              {#if loading}
                <div class="text-center py-4 text-sm text-muted-foreground">Loading project budgets...</div>
              {:else if projectBudgets.filter((p) => p.status === "active" || p.status === "in-progress").length === 0}
                <div class="text-center py-4 text-sm text-muted-foreground">
                  No active projects with budgets. Create a project and set a budget to track spending.
                </div>
              {:else}
                {#each projectBudgets.filter((p) => p.status === "active" || p.status === "in-progress") as project}
                  {@const percentage = project.budget > 0 ? (project.spent / project.budget) * 100 : 0}
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="size-3 rounded-full {project.color}"></div>
                        <span class="font-medium">{project.name}</span>
                      </div>
                      <span class="text-sm text-muted-foreground">
                        {formatCurrencyFromCents(project.spent * 100)} / {formatCurrencyFromCents(project.budget * 100)}
                      </span>
                    </div>
                    <Progress value={percentage} class="h-2" />
                  </div>
                {/each}
              {/if}
            </div>
          </CardContent>
        </Card>
      </div>
    {:else if activeTab === "transactions"}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            {#if loading}
              <div class="text-center py-4 text-sm text-muted-foreground">Loading transactions...</div>
            {:else if recentTransactions.length === 0}
              <div class="text-center py-4 text-sm text-muted-foreground">
                No transactions yet. Transaction tracking will be available once budget_items table is implemented.
              </div>
            {:else}
              {#each recentTransactions as transaction}
                <div class="flex items-center justify-between rounded-lg border p-4">
                  <div class="flex items-center gap-4">
                    <div
                      class="flex size-10 items-center justify-center rounded-full {transaction.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'}"
                    >
                      {#if transaction.type === "income"}
                        <ArrowDownRight class="size-5 text-green-500" />
                      {:else}
                        <ArrowUpRight class="size-5 text-red-500" />
                      {/if}
                    </div>
                    <div>
                      <p class="font-medium">{transaction.description}</p>
                      <div class="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" class="text-xs">
                          {transaction.category}
                        </Badge>
                        <span>•</span>
                        <span>{transaction.project}</span>
                        <span>•</span>
                        <span>{transaction.date}</span>
                      </div>
                    </div>
                  </div>
                  <p
                    class="text-lg font-bold {transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}"
                  >
                    {transaction.type === "income" ? "+" : "-"}{formatCurrencyFromCents(transaction.amount * 100)}
                  </p>
                </div>
              {/each}
            {/if}
          </div>
        </CardContent>
      </Card>
    {/if}
  </div>
</div>