import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface BudgetItem {
  project: string
  spent: number
  total: number
  color: string
}

const budgets: BudgetItem[] = [
  { project: "Malenia", spent: 450, total: 800, color: "bg-red-500" },
  { project: "Raiden Shogun", spent: 200, total: 600, color: "bg-purple-500" },
  { project: "V (Cyberpunk)", spent: 50, total: 500, color: "bg-cyan-500" },
]

export function BudgetWidget() {
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalBudget = budgets.reduce((sum, b) => sum + b.total, 0)
  const percentageUsed = Math.round((totalSpent / totalBudget) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Budget Used</span>
            <span className="text-2xl font-bold">
              ${totalSpent} / ${totalBudget}
            </span>
          </div>
          <Progress value={percentageUsed} className="h-3" />
          <p className="text-sm text-muted-foreground">{percentageUsed}% of total budget</p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">By Project</h4>
          {budgets.map((budget) => {
            const percentage = Math.round((budget.spent / budget.total) * 100)
            return (
              <div key={budget.project} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{budget.project}</span>
                  <span className="text-muted-foreground">
                    ${budget.spent} / ${budget.total}
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${budget.color}`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
