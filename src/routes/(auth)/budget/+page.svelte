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

  let activeTab = $state("overview");

  const personalBudget = {
    total: 5000,
    spent: 2850,
    income: 1200,
    remaining: 2150,
  };

  const teamBudget = {
    total: 12000,
    spent: 7500,
    income: 3500,
    remaining: 4500,
  };

  const projectBudgets = [
    {
      id: 1,
      name: "Malenia Cosplay",
      budget: 800,
      spent: 650,
      income: 0,
      status: "active",
      color: "bg-red-500",
    },
    {
      id: 2,
      name: "Raiden Shogun",
      budget: 600,
      spent: 380,
      income: 0,
      status: "active",
      color: "bg-purple-500",
    },
    {
      id: 3,
      name: "V (Cyberpunk)",
      budget: 500,
      spent: 120,
      income: 0,
      status: "planning",
      color: "bg-cyan-500",
    },
    {
      id: 4,
      name: "Commission: Wig Styling",
      budget: 0,
      spent: 85,
      income: 250,
      status: "completed",
      color: "bg-green-500",
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: "expense",
      category: "Materials",
      description: "EVA Foam sheets",
      amount: 45,
      project: "Malenia Cosplay",
      date: "2024-01-15",
    },
    {
      id: 2,
      type: "income",
      category: "Commission",
      description: "Wig styling service",
      amount: 250,
      project: "Commission: Wig Styling",
      date: "2024-01-14",
    },
    {
      id: 3,
      type: "expense",
      category: "Fabric",
      description: "Purple silk fabric",
      amount: 120,
      project: "Raiden Shogun",
      date: "2024-01-13",
    },
    {
      id: 4,
      type: "expense",
      category: "Tools",
      description: "Heat gun",
      amount: 65,
      project: "General",
      date: "2024-01-12",
    },
    {
      id: 5,
      type: "expense",
      category: "Accessories",
      description: "LED strips",
      amount: 35,
      project: "V (Cyberpunk)",
      date: "2024-01-11",
    },
  ];

  const expenseCategories = [
    { name: "Materials", amount: 850, percentage: 30, color: "bg-blue-500" },
    { name: "Fabric", amount: 680, percentage: 24, color: "bg-purple-500" },
    { name: "Tools", amount: 420, percentage: 15, color: "bg-orange-500" },
    { name: "Accessories", amount: 380, percentage: 13, color: "bg-pink-500" },
    { name: "Wigs", amount: 320, percentage: 11, color: "bg-yellow-500" },
    { name: "Other", amount: 200, percentage: 7, color: "bg-gray-500" },
  ];

  const totalSpent = personalBudget.spent;
  const totalIncome = personalBudget.income;
  const netBalance = totalIncome - totalSpent;
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
        <div class="text-2xl font-bold">${personalBudget.total.toLocaleString()}</div>
        <p class="text-xs text-muted-foreground">Personal budget allocation</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Total Spent</CardTitle>
        <ArrowUpRight class="size-4 text-red-500" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-red-500">${totalSpent.toLocaleString()}</div>
        <p class="text-xs text-muted-foreground">
          {Math.round((totalSpent / personalBudget.total) * 100)}% of budget
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Total Income</CardTitle>
        <ArrowDownRight class="size-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-green-500">${totalIncome.toLocaleString()}</div>
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
          ${Math.abs(netBalance).toLocaleString()}
        </div>
        <p class="text-xs text-muted-foreground">{netBalance >= 0 ? "Surplus" : "Deficit"}</p>
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
                    ${personalBudget.spent} / ${personalBudget.total}
                  </span>
                </div>
                <Progress value={(personalBudget.spent / personalBudget.total) * 100} class="h-2" />
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium">Team Budget</span>
                  <span class="text-muted-foreground">
                    ${teamBudget.spent} / ${teamBudget.total}
                  </span>
                </div>
                <Progress value={(teamBudget.spent / teamBudget.total) * 100} class="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              {#each expenseCategories as category}
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium">{category.name}</span>
                    <span class="text-muted-foreground">${category.amount}</span>
                  </div>
                  <div class="relative h-2 overflow-hidden rounded-full bg-muted">
                    <div class="{category.color} h-full" style="width: {category.percentage}%"></div>
                  </div>
                </div>
              {/each}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              {#each projectBudgets.filter((p) => p.status === "active") as project}
                {@const percentage = project.budget > 0 ? (project.spent / project.budget) * 100 : 0}
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="size-3 rounded-full {project.color}"></div>
                      <span class="font-medium">{project.name}</span>
                    </div>
                    <span class="text-sm text-muted-foreground">
                      ${project.spent} / ${project.budget}
                    </span>
                  </div>
                  <Progress value={percentage} class="h-2" />
                </div>
              {/each}
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
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount}
                </p>
              </div>
            {/each}
          </div>
        </CardContent>
      </Card>
    {/if}
  </div>
</div>