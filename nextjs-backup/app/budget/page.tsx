"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"

export default function BudgetPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const personalBudget = {
    total: 5000,
    spent: 2850,
    income: 1200,
    remaining: 2150,
  }

  const teamBudget = {
    total: 12000,
    spent: 7500,
    income: 3500,
    remaining: 4500,
  }

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
  ]

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
  ]

  const expenseCategories = [
    { name: "Materials", amount: 850, percentage: 30, color: "bg-blue-500" },
    { name: "Fabric", amount: 680, percentage: 24, color: "bg-purple-500" },
    { name: "Tools", amount: 420, percentage: 15, color: "bg-orange-500" },
    { name: "Accessories", amount: 380, percentage: 13, color: "bg-pink-500" },
    { name: "Wigs", amount: 320, percentage: 11, color: "bg-yellow-500" },
    { name: "Other", amount: 200, percentage: 7, color: "bg-gray-500" },
  ]

  const totalSpent = personalBudget.spent
  const totalIncome = personalBudget.income
  const netBalance = totalIncome - totalSpent

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader title="Budget" searchPlaceholder="Search transactions...">
            <Button size="sm" variant="outline">
              <Filter className="size-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Download className="size-4" />
            </Button>
            <Button size="sm">
              <Plus className="size-4" />
            </Button>
          </PageHeader>

          <div className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                  <Wallet className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${personalBudget.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Personal budget allocation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <ArrowUpRight className="size-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">${totalSpent.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((totalSpent / personalBudget.total) * 100)}% of budget
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <ArrowDownRight className="size-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">${totalIncome.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">From commissions & services</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                  {netBalance >= 0 ? (
                    <TrendingUp className="size-4 text-green-500" />
                  ) : (
                    <TrendingDown className="size-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-500" : "text-red-500"}`}>
                    ${Math.abs(netBalance).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">{netBalance >= 0 ? "Surplus" : "Deficit"}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Budget Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Personal Budget</span>
                          <span className="text-muted-foreground">
                            ${personalBudget.spent} / ${personalBudget.total}
                          </span>
                        </div>
                        <Progress value={(personalBudget.spent / personalBudget.total) * 100} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Team Budget</span>
                          <span className="text-muted-foreground">
                            ${teamBudget.spent} / ${teamBudget.total}
                          </span>
                        </div>
                        <Progress value={(teamBudget.spent / teamBudget.total) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Expense Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {expenseCategories.map((category) => (
                        <div key={category.name} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{category.name}</span>
                            <span className="text-muted-foreground">${category.amount}</span>
                          </div>
                          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                            <div className={`h-full ${category.color}`} style={{ width: `${category.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Projects Budget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projectBudgets
                        .filter((p) => p.status === "active")
                        .map((project) => {
                          const percentage = project.budget > 0 ? (project.spent / project.budget) * 100 : 0
                          return (
                            <div key={project.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`size-3 rounded-full ${project.color}`} />
                                  <span className="font-medium">{project.name}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  ${project.spent} / ${project.budget}
                                </span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Budget Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Budget Utilization</span>
                        <span className="text-2xl font-bold">
                          ${personalBudget.spent} / ${personalBudget.total}
                        </span>
                      </div>
                      <Progress value={(personalBudget.spent / personalBudget.total) * 100} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        {Math.round((personalBudget.spent / personalBudget.total) * 100)}% used, $
                        {personalBudget.remaining} remaining
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Allocated</p>
                        <p className="text-2xl font-bold">${personalBudget.total}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold text-red-500">${personalBudget.spent}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className="text-2xl font-bold text-green-500">${personalBudget.remaining}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Income Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">Commissions</p>
                          <p className="text-sm text-muted-foreground">Wig styling, prop making</p>
                        </div>
                        <p className="text-lg font-bold text-green-500">$1,200</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Budget Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Budget Utilization</span>
                        <span className="text-2xl font-bold">
                          ${teamBudget.spent} / ${teamBudget.total}
                        </span>
                      </div>
                      <Progress value={(teamBudget.spent / teamBudget.total) * 100} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        {Math.round((teamBudget.spent / teamBudget.total) * 100)}% used, ${teamBudget.remaining}{" "}
                        remaining
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Allocated</p>
                        <p className="text-2xl font-bold">${teamBudget.total}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold text-red-500">${teamBudget.spent}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className="text-2xl font-bold text-green-500">${teamBudget.remaining}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Team Members Spending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                            <Users className="size-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Sarah Chen</p>
                            <p className="text-sm text-muted-foreground">3 active projects</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold">$2,450</p>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                            <Users className="size-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Mike Johnson</p>
                            <p className="text-sm text-muted-foreground">2 active projects</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold">$1,850</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <div className="grid gap-4">
                  {projectBudgets.map((project) => {
                    const percentage = project.budget > 0 ? (project.spent / project.budget) * 100 : 0
                    const hasIncome = project.income > 0
                    const netAmount = project.income - project.spent

                    return (
                      <Card key={project.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`size-3 rounded-full ${project.color}`} />
                              <CardTitle className="text-lg">{project.name}</CardTitle>
                            </div>
                            <Badge variant={project.status === "active" ? "default" : "secondary"}>
                              {project.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {project.budget > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Budget Progress</span>
                                <span className="font-medium">
                                  ${project.spent} / ${project.budget}
                                </span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          )}

                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Budget</p>
                              <p className="text-xl font-bold">${project.budget}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Spent</p>
                              <p className="text-xl font-bold text-red-500">${project.spent}</p>
                            </div>
                            {hasIncome && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Income</p>
                                <p className="text-xl font-bold text-green-500">${project.income}</p>
                              </div>
                            )}
                          </div>

                          {hasIncome && (
                            <div className="rounded-lg bg-muted p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Net Balance</span>
                                <span
                                  className={`text-lg font-bold ${netAmount >= 0 ? "text-green-500" : "text-red-500"}`}
                                >
                                  {netAmount >= 0 ? "+" : ""}${netAmount}
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex size-10 items-center justify-center rounded-full ${
                                transaction.type === "income" ? "bg-green-500/10" : "bg-red-500/10"
                              }`}
                            >
                              {transaction.type === "income" ? (
                                <ArrowDownRight className="size-5 text-green-500" />
                              ) : (
                                <ArrowUpRight className="size-5 text-red-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
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
                            className={`text-lg font-bold ${
                              transaction.type === "income" ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}${transaction.amount}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
