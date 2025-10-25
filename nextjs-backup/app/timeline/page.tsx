"use client"

import * as React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const projects = [
  {
    id: 1,
    name: "Elden Ring - Malenia",
    startDate: "2025-09-15",
    endDate: "2025-10-15",
    progress: 85,
    status: "in-progress",
    color: "bg-primary",
    tasks: [
      { name: "Armor Patterning", start: "2025-09-15", end: "2025-09-25", progress: 100 },
      { name: "Foam Fabrication", start: "2025-09-26", end: "2025-10-05", progress: 100 },
      { name: "Painting & Weathering", start: "2025-10-06", end: "2025-10-12", progress: 90 },
      { name: "Final Assembly", start: "2025-10-10", end: "2025-10-15", progress: 60 },
    ],
  },
  {
    id: 2,
    name: "Genshin Impact - Raiden Shogun",
    startDate: "2025-10-01",
    endDate: "2025-11-20",
    progress: 35,
    status: "in-progress",
    color: "bg-purple-500",
    tasks: [
      { name: "Reference Gathering", start: "2025-10-01", end: "2025-10-05", progress: 100 },
      { name: "Material Ordering", start: "2025-10-06", end: "2025-10-12", progress: 100 },
      { name: "Kimono Construction", start: "2025-10-13", end: "2025-10-30", progress: 40 },
      { name: "Armor Pieces", start: "2025-10-25", end: "2025-11-10", progress: 20 },
      { name: "Wig Styling", start: "2025-11-05", end: "2025-11-15", progress: 0 },
    ],
  },
  {
    id: 3,
    name: "Arcane - Jinx",
    startDate: "2025-11-01",
    endDate: "2025-12-15",
    progress: 10,
    status: "planning",
    color: "bg-blue-500",
    tasks: [
      { name: "Concept Planning", start: "2025-11-01", end: "2025-11-10", progress: 50 },
      { name: "Budget Planning", start: "2025-11-05", end: "2025-11-12", progress: 30 },
      { name: "Pattern Making", start: "2025-11-15", end: "2025-11-25", progress: 0 },
      { name: "Fabric Sourcing", start: "2025-11-20", end: "2025-11-30", progress: 0 },
    ],
  },
]

const events = [
  { name: "Anime Expo 2025", date: "2025-10-18", type: "convention", color: "bg-amber-500" },
  { name: "Forest Photoshoot", date: "2025-10-25", type: "photoshoot", color: "bg-pink-500" },
  { name: "Local Comic Con", date: "2025-11-22", type: "convention", color: "bg-amber-500" },
  { name: "Studio Session", date: "2025-11-28", type: "photoshoot", color: "bg-pink-500" },
]

export default function TimelinePage() {
  const [currentDate, setCurrentDate] = React.useState(new Date(2025, 9, 1))
  const [viewMode, setViewMode] = React.useState<"projects" | "tasks">("projects")
  const [expandedProjects, setExpandedProjects] = React.useState<number[]>([1, 2])

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const toggleProject = (projectId: number) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId],
    )
  }

  // Calculate timeline grid
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const daysInMonth = endOfMonth.getDate()

  const getBarPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const monthStart = startOfMonth.getTime()
    const monthEnd = endOfMonth.getTime()
    const monthDuration = monthEnd - monthStart

    const barStart = Math.max(0, (start.getTime() - monthStart) / monthDuration)
    const barEnd = Math.min(1, (end.getTime() - monthStart) / monthDuration)
    const barWidth = barEnd - barStart

    return {
      left: `${barStart * 100}%`,
      width: `${barWidth * 100}%`,
    }
  }

  const getEventPosition = (date: string) => {
    const eventDate = new Date(date)
    const monthStart = startOfMonth.getTime()
    const monthEnd = endOfMonth.getTime()
    const monthDuration = monthEnd - monthStart

    const position = (eventDate.getTime() - monthStart) / monthDuration

    return {
      left: `${position * 100}%`,
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader searchPlaceholder="Search timeline...">
            <Button variant="outline" size="icon">
              <Filter className="size-5" />
            </Button>
          </PageHeader>

          <div className="p-6">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-balance text-3xl font-bold leading-tight">Timeline</h1>
                  <p className="text-pretty text-muted-foreground">
                    Gantt chart view of all projects, tasks, and deadlines
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="projects">Projects</SelectItem>
                      <SelectItem value="tasks">Tasks</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <div className="min-w-[140px] text-center text-sm font-medium">{monthName}</div>
                  <Button variant="outline" size="icon" onClick={goToNextMonth}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>

              <Card className="overflow-hidden">
                {/* Timeline Header */}
                <div className="flex border-b bg-muted/50">
                  <div className="w-64 shrink-0 border-r p-4">
                    <h3 className="font-semibold">Project / Task</h3>
                  </div>
                  <div className="relative flex-1 p-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1
                        if (day === 1 || day === 10 || day === 20 || day === daysInMonth) {
                          return (
                            <div key={day} className="text-center">
                              {day}
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                </div>

                {/* Timeline Content */}
                <div className="divide-y">
                  {projects.map((project) => {
                    const isExpanded = expandedProjects.includes(project.id)
                    const barPosition = getBarPosition(project.startDate, project.endDate)

                    return (
                      <div key={project.id}>
                        {/* Project Row */}
                        <div className="flex hover:bg-muted/50">
                          <div className="w-64 shrink-0 border-r p-4">
                            <button
                              onClick={() => toggleProject(project.id)}
                              className="flex w-full items-center gap-2 text-left"
                            >
                              <BarChart3 className="size-4 shrink-0" />
                              <div className="flex-1 overflow-hidden">
                                <div className="truncate font-medium">{project.name}</div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{project.progress}% complete</span>
                                  <Badge variant="outline" className="text-xs">
                                    {project.status}
                                  </Badge>
                                </div>
                              </div>
                            </button>
                          </div>
                          <div className="relative flex-1 p-4">
                            <div
                              className={`absolute top-1/2 h-8 -translate-y-1/2 rounded ${project.color} flex items-center px-2`}
                              style={barPosition}
                            >
                              <div className="w-full overflow-hidden">
                                <Progress value={project.progress} className="h-1 bg-white/20" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Task Rows */}
                        {isExpanded &&
                          viewMode === "tasks" &&
                          project.tasks.map((task, taskIndex) => {
                            const taskBarPosition = getBarPosition(task.start, task.end)
                            return (
                              <div key={taskIndex} className="flex bg-muted/20 hover:bg-muted/40">
                                <div className="w-64 shrink-0 border-r p-4 pl-12">
                                  <div className="text-sm">{task.name}</div>
                                  <div className="text-xs text-muted-foreground">{task.progress}%</div>
                                </div>
                                <div className="relative flex-1 p-4">
                                  <div
                                    className="absolute top-1/2 h-6 -translate-y-1/2 rounded bg-muted-foreground/60"
                                    style={taskBarPosition}
                                  >
                                    <Progress value={task.progress} className="h-full bg-white/20" />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    )
                  })}

                  {/* Events Row */}
                  <div className="flex bg-background">
                    <div className="w-64 shrink-0 border-r p-4">
                      <div className="font-medium">Events & Deadlines</div>
                      <div className="text-xs text-muted-foreground">{events.length} scheduled</div>
                    </div>
                    <div className="relative flex-1 p-4">
                      {events.map((event, index) => {
                        const eventPosition = getEventPosition(event.date)
                        return (
                          <div
                            key={index}
                            className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${event.color}`}
                            style={eventPosition}
                            title={event.name}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded bg-primary" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded bg-muted-foreground/60" />
                  <span>Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-amber-500" />
                  <span>Conventions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-pink-500" />
                  <span>Photoshoots</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
