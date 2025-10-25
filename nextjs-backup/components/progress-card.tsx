import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, ArrowRight, CheckCircle2, Clock } from "lucide-react"
import Image from "next/image"

interface ProgressCardProps {
  character: string
  series: string
  image: string
  progress: number
  budget: {
    spent: number
    total: number
  }
  deadline: string
  currentPhase: string
  recentUpdates: Array<{
    date: string
    title: string
    image: string
  }>
  nextMilestone: string
  daysUntilDeadline: number
}

export function ProgressCard({
  character,
  series,
  image,
  progress,
  budget,
  deadline,
  currentPhase,
  recentUpdates,
  nextMilestone,
  daysUntilDeadline,
}: ProgressCardProps) {
  const budgetProgress = (budget.spent / budget.total) * 100

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-6 p-6 lg:flex-row">
        <div className="relative h-64 shrink-0 overflow-hidden rounded-lg bg-muted lg:w-80">
          <Image src={image || "/placeholder.svg"} alt={character} fill className="object-cover" />
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-balance text-2xl font-semibold leading-tight">{character}</h3>
              <p className="text-muted-foreground">{series}</p>
              <Badge variant="outline" className="mt-2">
                {currentPhase}
              </Badge>
            </div>
            <Button>
              View Full Details
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Budget Used</span>
                  <span className="font-medium">{Math.round(budgetProgress)}%</span>
                </div>
                <Progress value={budgetProgress} className="h-2" />
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>Deadline</span>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{new Date(deadline).toLocaleDateString()}</p>
                  <p className="text-muted-foreground">{daysUntilDeadline} days left</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="size-4" />
                  <span>Budget</span>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">
                    ${budget.spent} / ${budget.total}
                  </p>
                  <p className="text-muted-foreground">${budget.total - budget.spent} remaining</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="size-4" />
                <span>Next Milestone</span>
              </div>
              <div className="rounded-lg border bg-primary/5 p-3">
                <p className="text-sm font-medium">{nextMilestone}</p>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="size-4" />
                <span>Recent Updates</span>
              </div>
              <div className="space-y-2">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded bg-muted">
                      <Image
                        src={update.image || "/placeholder.svg"}
                        alt={update.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{update.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(update.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
