import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign } from "lucide-react"
import Image from "next/image"

interface ProjectCardProps {
  title: string
  character: string
  series: string
  image: string
  progress: number
  budget: {
    spent: number
    total: number
  }
  deadline?: string
  status: "idea" | "planning" | "in-progress" | "completed"
}

const statusColors = {
  idea: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  planning: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "in-progress": "bg-primary/10 text-primary",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

export function ProjectCard({ title, character, series, image, progress, budget, deadline, status }: ProjectCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute right-3 top-3">
            <Badge className={statusColors[status]} variant="secondary">
              {status.replace("-", " ")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="text-balance font-semibold leading-tight">{character}</h3>
            <p className="text-sm text-muted-foreground">{series}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-muted/30 px-4 py-3 text-sm">
        {deadline && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="size-4" />
            <span>{deadline}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <DollarSign className="size-4" />
          <span>
            ${budget.spent} / ${budget.total}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
