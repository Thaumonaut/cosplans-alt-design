import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, AlertCircle } from "lucide-react"

interface Task {
  id: number
  title: string
  project: string
  priority: "high" | "medium" | "low"
  dueDate: string
  completed: boolean
}

const tasks: Task[] = [
  {
    id: 1,
    title: "Order foam for armor pieces",
    project: "Malenia",
    priority: "high",
    dueDate: "Today",
    completed: false,
  },
  {
    id: 2,
    title: "Pattern test for kimono sleeves",
    project: "Raiden Shogun",
    priority: "high",
    dueDate: "Tomorrow",
    completed: false,
  },
  {
    id: 3,
    title: "Paint sword prop",
    project: "Malenia",
    priority: "medium",
    dueDate: "Nov 5",
    completed: false,
  },
  {
    id: 4,
    title: "Order purple wig",
    project: "Raiden Shogun",
    priority: "medium",
    dueDate: "Nov 6",
    completed: true,
  },
  {
    id: 5,
    title: "Research LED options for weapon",
    project: "V (Cyberpunk)",
    priority: "low",
    dueDate: "Nov 10",
    completed: false,
  },
]

const priorityColors = {
  high: "bg-red-500/10 text-red-700 dark:text-red-300",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  low: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
}

export function TasksWidget() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Important Tasks</CardTitle>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.slice(0, 5).map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
          >
            <Checkbox checked={task.completed} className="mt-0.5" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`text-sm font-medium leading-tight ${task.completed ? "text-muted-foreground line-through" : ""}`}
                >
                  {task.title}
                </p>
                <Badge className={priorityColors[task.priority]} variant="secondary">
                  {task.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{task.project}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {task.dueDate === "Today" || task.dueDate === "Tomorrow" ? (
                    <AlertCircle className="size-3" />
                  ) : (
                    <Clock className="size-3" />
                  )}
                  <span>{task.dueDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
