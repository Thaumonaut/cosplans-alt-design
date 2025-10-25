"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { LayoutGrid, List, TableIcon, Plus, Clock, GripVertical, MoreVertical, CalendarIcon, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ViewMode = "kanban" | "list" | "table"
type Priority = "high" | "medium" | "low"
type Status = "todo" | "in-progress" | "review" | "done"

interface Task {
  id: number
  title: string
  description: string
  project: string
  priority: Priority
  status: Status
  dueDate: string
  assignee: string
  completed: boolean
}

const tasks: Task[] = [
  {
    id: 1,
    title: "Order foam for armor pieces",
    description: "Need EVA foam sheets 6mm and 10mm thickness",
    project: "Malenia",
    priority: "high",
    status: "todo",
    dueDate: "2024-11-01",
    assignee: "You",
    completed: false,
  },
  {
    id: 2,
    title: "Pattern test for kimono sleeves",
    description: "Test pattern fit before cutting final fabric",
    project: "Raiden Shogun",
    priority: "high",
    status: "in-progress",
    dueDate: "2024-11-02",
    assignee: "You",
    completed: false,
  },
  {
    id: 3,
    title: "Paint sword prop",
    description: "Base coat, weathering, and clear coat",
    project: "Malenia",
    priority: "medium",
    status: "in-progress",
    dueDate: "2024-11-05",
    assignee: "You",
    completed: false,
  },
  {
    id: 4,
    title: "Order purple wig",
    description: "Long purple wig with bangs",
    project: "Raiden Shogun",
    priority: "medium",
    status: "done",
    dueDate: "2024-11-06",
    assignee: "You",
    completed: true,
  },
  {
    id: 5,
    title: "Research LED options for weapon",
    description: "Find suitable LED strips for cyberpunk weapon",
    project: "V (Cyberpunk)",
    priority: "low",
    status: "todo",
    dueDate: "2024-11-10",
    assignee: "You",
    completed: false,
  },
  {
    id: 6,
    title: "Heat form armor pieces",
    description: "Use heat gun to shape chest and shoulder pieces",
    project: "Malenia",
    priority: "medium",
    status: "review",
    dueDate: "2024-11-08",
    assignee: "You",
    completed: false,
  },
  {
    id: 7,
    title: "Sew kimono base",
    description: "Complete main kimono body construction",
    project: "Raiden Shogun",
    priority: "high",
    status: "in-progress",
    dueDate: "2024-11-04",
    assignee: "You",
    completed: false,
  },
  {
    id: 8,
    title: "3D print weapon parts",
    description: "Print all weapon components for assembly",
    project: "V (Cyberpunk)",
    priority: "medium",
    status: "todo",
    dueDate: "2024-11-12",
    assignee: "You",
    completed: false,
  },
]

const priorityColors = {
  high: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  low: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
}

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
}

const statusColors = {
  todo: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  "in-progress": "bg-primary/10 text-primary",
  review: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  done: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [filterProject, setFilterProject] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")

  const filteredTasks = tasks.filter((task) => {
    if (filterProject !== "all" && task.project !== filterProject) return false
    if (filterPriority !== "all" && task.priority !== filterPriority) return false
    return true
  })

  const projects = Array.from(new Set(tasks.map((t) => t.project)))

  const getTasksByStatus = (status: Status) => {
    return filteredTasks.filter((task) => task.status === status)
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader title="Tasks" searchPlaceholder="Search tasks...">
            <Button size="icon" variant="ghost">
              <Plus className="size-4" />
            </Button>
          </PageHeader>

          <div className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-[1600px] space-y-6">
              {/* View Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "kanban" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("kanban")}
                  >
                    <LayoutGrid className="mr-2 size-4" />
                    Kanban
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="mr-2 size-4" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                  >
                    <TableIcon className="mr-2 size-4" />
                    Table
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={filterProject} onValueChange={setFilterProject}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Kanban View */}
              {viewMode === "kanban" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {(["todo", "in-progress", "review", "done"] as Status[]).map((status) => (
                    <Card key={status} className="flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">{statusLabels[status]}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {getTasksByStatus(status).length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-2">
                        {getTasksByStatus(status).map((task) => (
                          <Card key={task.id} className="group cursor-pointer transition-shadow hover:shadow-md">
                            <CardContent className="p-3">
                              <div className="mb-2 flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2">
                                  <GripVertical className="mt-0.5 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                  <Checkbox checked={task.completed} />
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-6">
                                      <MoreVertical className="size-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <h4 className="mb-1 text-sm font-medium leading-tight">{task.title}</h4>
                              <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className={priorityColors[task.priority]} variant="outline">
                                  {task.priority}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="size-3" />
                                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">{task.project}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <Card key={task.id} className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center gap-4 p-4">
                        <Checkbox checked={task.completed} />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge className={priorityColors[task.priority]} variant="outline">
                              {task.priority}
                            </Badge>
                            <Badge className={statusColors[task.status]} variant="secondary">
                              {statusLabels[task.status]}
                            </Badge>
                          </div>
                          <p className="mb-2 text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="font-medium">{task.project}</span>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="size-3" />
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="size-3" />
                              <span>{task.assignee}</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Table View */}
              {viewMode === "table" && (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b bg-muted/50">
                          <tr>
                            <th className="w-12 p-4">
                              <Checkbox />
                            </th>
                            <th className="p-4 text-left text-sm font-medium">Task</th>
                            <th className="p-4 text-left text-sm font-medium">Project</th>
                            <th className="p-4 text-left text-sm font-medium">Status</th>
                            <th className="p-4 text-left text-sm font-medium">Priority</th>
                            <th className="p-4 text-left text-sm font-medium">Due Date</th>
                            <th className="p-4 text-left text-sm font-medium">Assignee</th>
                            <th className="w-12 p-4"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTasks.map((task) => (
                            <tr key={task.id} className="border-b transition-colors hover:bg-muted/50">
                              <td className="p-4">
                                <Checkbox checked={task.completed} />
                              </td>
                              <td className="p-4">
                                <div>
                                  <div className="font-medium">{task.title}</div>
                                  <div className="text-sm text-muted-foreground">{task.description}</div>
                                </div>
                              </td>
                              <td className="p-4 text-sm">{task.project}</td>
                              <td className="p-4">
                                <Badge className={statusColors[task.status]} variant="secondary">
                                  {statusLabels[task.status]}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <Badge className={priorityColors[task.priority]} variant="outline">
                                  {task.priority}
                                </Badge>
                              </td>
                              <td className="p-4 text-sm">{new Date(task.dueDate).toLocaleDateString()}</td>
                              <td className="p-4 text-sm">{task.assignee}</td>
                              <td className="p-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="size-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
