import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, CheckSquare, Package, ArrowRight, AlertCircle } from "lucide-react"
import Image from "next/image"

interface PlanningCardProps {
  character: string
  series: string
  image: string
  budget: {
    allocated: number
    spent: number
  }
  timeline: {
    startDate: string
    targetDate: string
    daysRemaining: number
  }
  tasks: {
    total: number
    completed: number
  }
  materials: {
    ordered: number
    pending: number
  }
  priority: "low" | "medium" | "high"
}

const priorityColors = {
  low: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  high: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
}

export function PlanningCard({
  character,
  series,
  image,
  budget,
  timeline,
  tasks,
  materials,
  priority,
}: PlanningCardProps) {
  const taskProgress = (tasks.completed / tasks.total) * 100
  const budgetProgress = (budget.spent / budget.allocated) * 100

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="flex flex-col gap-6 p-6 md:flex-row">
        <div className="relative size-48 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image src={image || "/placeholder.svg"} alt={character} fill className="object-cover" />
          <div className="absolute right-2 top-2">
            <Badge className={priorityColors[priority]} variant="secondary">
              {priority} priority
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-balance text-xl font-semibold leading-tight">{character}</h3>
              <p className="text-muted-foreground">{series}</p>
            </div>
            <Button>
              View Details
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckSquare className="size-4" />
                <span>Tasks Progress</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {tasks.completed} / {tasks.total}
                  </span>
                  <span className="text-muted-foreground">{Math.round(taskProgress)}%</span>
                </div>
                <Progress value={taskProgress} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="size-4" />
                <span>Budget Used</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    ${budget.spent} / ${budget.allocated}
                  </span>
                  <span className="text-muted-foreground">{Math.round(budgetProgress)}%</span>
                </div>
                <Progress value={budgetProgress} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                <span>Timeline</span>
              </div>
              <div className="space-y-1">
                <div className="text-sm">
                  <p className="font-medium">{timeline.daysRemaining} days left</p>
                  <p className="text-muted-foreground">Due {new Date(timeline.targetDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="size-4" />
                <span>Materials</span>
              </div>
              <div className="space-y-1">
                <div className="text-sm">
                  <p className="font-medium">{materials.ordered} ordered</p>
                  <p className="text-muted-foreground">{materials.pending} pending</p>
                </div>
              </div>
            </div>
          </div>

          {timeline.daysRemaining < 60 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
              <AlertCircle className="size-4" />
              <span>Deadline approaching - consider prioritizing this project</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
