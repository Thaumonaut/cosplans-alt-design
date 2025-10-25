"use client"

import * as React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckSquare,
  Users,
  Camera,
  Hammer,
  AlertCircle,
} from "lucide-react"

const timelineItems = [
  {
    id: 1,
    type: "project",
    title: "Malenia Armor - Final Assembly",
    project: "Elden Ring Cosplay",
    date: "2025-10-10",
    status: "in-progress",
    priority: "high",
    icon: Hammer,
  },
  {
    id: 2,
    type: "task",
    title: "Order EVA foam for Raiden Shogun",
    project: "Genshin Impact",
    date: "2025-10-12",
    status: "pending",
    priority: "medium",
    icon: CheckSquare,
  },
  {
    id: 3,
    type: "project",
    title: "Malenia Cosplay Deadline",
    project: "Elden Ring Cosplay",
    date: "2025-10-15",
    status: "deadline",
    priority: "high",
    icon: AlertCircle,
  },
  {
    id: 4,
    type: "event",
    title: "Anime Expo 2025",
    date: "2025-10-18",
    endDate: "2025-10-21",
    status: "upcoming",
    priority: "high",
    icon: Users,
  },
  {
    id: 5,
    type: "task",
    title: "Wig styling for Malenia",
    project: "Elden Ring Cosplay",
    date: "2025-10-20",
    status: "pending",
    priority: "medium",
    icon: CheckSquare,
  },
  {
    id: 6,
    type: "photoshoot",
    title: "Forest Photoshoot - Malenia",
    date: "2025-10-25",
    status: "scheduled",
    priority: "medium",
    icon: Camera,
  },
  {
    id: 7,
    type: "task",
    title: "Start armor patterning",
    project: "Genshin Impact",
    date: "2025-11-01",
    status: "pending",
    priority: "low",
    icon: CheckSquare,
  },
  {
    id: 8,
    type: "project",
    title: "Raiden Shogun Deadline",
    project: "Genshin Impact",
    date: "2025-11-20",
    status: "deadline",
    priority: "medium",
    icon: AlertCircle,
  },
  {
    id: 9,
    type: "event",
    title: "Local Comic Con",
    date: "2025-11-22",
    endDate: "2025-11-24",
    status: "upcoming",
    priority: "medium",
    icon: Users,
  },
  {
    id: 10,
    type: "photoshoot",
    title: "Studio Session - Raiden",
    date: "2025-11-28",
    status: "scheduled",
    priority: "low",
    icon: Camera,
  },
]

const typeColors = {
  project: "bg-primary/10 text-primary border-primary/20",
  task: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  event: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  photoshoot: "bg-pink-500/10 text-pink-600 border-pink-500/20",
}

const priorityColors = {
  high: "bg-red-500/10 text-red-600 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  low: "bg-green-500/10 text-green-600 border-green-500/20",
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date(2025, 9, 1))
  const [view, setView] = React.useState<"month" | "week" | "list">("month")

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date(2025, 9, 1))
  }

  const itemsByDate = React.useMemo(() => {
    const grouped: Record<string, typeof timelineItems> = {}
    timelineItems.forEach((item) => {
      if (!grouped[item.date]) {
        grouped[item.date] = []
      }
      grouped[item.date].push(item)
    })
    return grouped
  }, [])

  const calendarDays = React.useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    return days
  }, [currentDate])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader searchPlaceholder="Search calendar items...">
            <Button variant="outline" size="icon">
              <Calendar className="size-5" />
            </Button>
          </PageHeader>

          <div className="p-6">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-balance text-3xl font-bold leading-tight">Calendar</h1>
                  <p className="text-pretty text-muted-foreground">
                    View all your events, tasks, and deadlines in calendar format
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <div className="min-w-[140px] text-center text-sm font-medium">{monthName}</div>
                  <Button variant="outline" size="icon" onClick={goToNextMonth}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>

              <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full">
                <TabsList>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>

                <TabsContent value="month" className="mt-6">
                  <Card className="p-4">
                    <div className="mb-4 grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
                      <div>Sun</div>
                      <div>Mon</div>
                      <div>Tue</div>
                      <div>Wed</div>
                      <div>Thu</div>
                      <div>Fri</div>
                      <div>Sat</div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((day, index) => {
                        if (day === null) {
                          return <div key={`empty-${index}`} className="aspect-square" />
                        }

                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                        const items = itemsByDate[dateStr] || []
                        const isToday = day === 1

                        return (
                          <div
                            key={day}
                            className={`relative min-h-[100px] rounded-lg border p-2 ${
                              isToday ? "border-primary bg-primary/5" : "border-border"
                            }`}
                          >
                            <div className={`mb-1 text-sm font-medium ${isToday ? "text-primary" : ""}`}>{day}</div>
                            <div className="space-y-1">
                              {items.slice(0, 3).map((item) => {
                                const Icon = item.icon
                                return (
                                  <div
                                    key={item.id}
                                    className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs ${typeColors[item.type as keyof typeof typeColors]}`}
                                  >
                                    <Icon className="size-3 shrink-0" />
                                    <span className="truncate">{item.title}</span>
                                  </div>
                                )
                              })}
                              {items.length > 3 && (
                                <div className="text-xs text-muted-foreground">+{items.length - 3} more</div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="week" className="mt-6">
                  <Card className="p-6">
                    <div className="space-y-4">
                      {[...Array(7)].map((_, dayIndex) => {
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayIndex + 1)
                        const dateStr = date.toISOString().split("T")[0]
                        const items = itemsByDate[dateStr] || []
                        const dayName = date.toLocaleDateString("en-US", { weekday: "short" })

                        return (
                          <div key={dayIndex} className="flex gap-4">
                            <div className="w-20 shrink-0 text-right">
                              <div className="text-sm font-medium">{dayName}</div>
                              <div className="text-xs text-muted-foreground">{date.getDate()}</div>
                            </div>
                            <div className="flex-1 space-y-2">
                              {items.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                                  No items scheduled
                                </div>
                              ) : (
                                items.map((item) => {
                                  const Icon = item.icon
                                  return (
                                    <Card key={item.id} className="p-3">
                                      <div className="flex items-start gap-3">
                                        <div
                                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${typeColors[item.type as keyof typeof typeColors]}`}
                                        >
                                          <Icon className="size-4" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-start justify-between gap-2">
                                            <div>
                                              <h4 className="font-medium">{item.title}</h4>
                                              {item.project && (
                                                <p className="text-sm text-muted-foreground">{item.project}</p>
                                              )}
                                            </div>
                                            <div className="flex gap-2">
                                              <Badge
                                                variant="outline"
                                                className={typeColors[item.type as keyof typeof typeColors]}
                                              >
                                                {item.type}
                                              </Badge>
                                              <Badge
                                                variant="outline"
                                                className={priorityColors[item.priority as keyof typeof priorityColors]}
                                              >
                                                {item.priority}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </Card>
                                  )
                                })
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="list" className="mt-6">
                  <div className="space-y-4">
                    {timelineItems
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((item) => {
                        const Icon = item.icon
                        const date = new Date(item.date)
                        const formattedDate = date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })

                        return (
                          <Card key={item.id} className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex w-24 shrink-0 flex-col items-end text-right">
                                <div className="text-sm font-medium">{formattedDate}</div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="size-3" />
                                  <span>All day</span>
                                </div>
                              </div>
                              <div
                                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${typeColors[item.type as keyof typeof typeColors]}`}
                              >
                                <Icon className="size-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-medium">{item.title}</h4>
                                    {item.project && <p className="text-sm text-muted-foreground">{item.project}</p>}
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge
                                      variant="outline"
                                      className={typeColors[item.type as keyof typeof typeColors]}
                                    >
                                      {item.type}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={priorityColors[item.priority as keyof typeof priorityColors]}
                                    >
                                      {item.priority}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
