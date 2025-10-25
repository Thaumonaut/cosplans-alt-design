"use client"

import * as React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { Plus, Folder, Calendar, CheckSquare, DollarSign } from "lucide-react"
import { CreationFlyout } from "@/components/creation-flyout"
import { CharacterCreationForm } from "@/components/character-creation-form"
import { StatCard } from "@/components/dashboard-stats"
import { UpcomingEventsWidget } from "@/components/upcoming-events-widget"
import { TasksWidget } from "@/components/tasks-widget"
import { BudgetWidget } from "@/components/budget-widget"
import { RecentActivityWidget } from "@/components/recent-activity-widget"

const projects = [
  {
    id: 1,
    title: "Elden Ring Cosplay",
    character: "Malenia, Blade of Miquella",
    series: "Elden Ring",
    image: "/fantasy-warrior-armor-red-hair.jpg",
    progress: 65,
    budget: { spent: 450, total: 800 },
    deadline: "Oct 15, 2025",
    status: "in-progress" as const,
  },
  {
    id: 2,
    title: "Genshin Impact",
    character: "Raiden Shogun",
    series: "Genshin Impact",
    image: "/anime-character-purple-kimono.jpg",
    progress: 30,
    budget: { spent: 200, total: 600 },
    deadline: "Nov 20, 2025",
    status: "planning" as const,
  },
  {
    id: 3,
    title: "Cyberpunk 2077",
    character: "V (Female)",
    series: "Cyberpunk 2077",
    image: "/cyberpunk-character-neon-jacket.jpg",
    progress: 10,
    budget: { spent: 50, total: 500 },
    status: "idea" as const,
  },
]

export default function DashboardPage() {
  const [creationOpen, setCreationOpen] = React.useState(false)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader
            searchPlaceholder="Search projects, characters, events..."
            notifications={[
              {
                title: "Convention in 2 weeks",
                description: "Anime Expo 2025 - Don't forget to pack!",
              },
              {
                title: "Budget alert",
                description: "Malenia project is 80% of budget",
              },
            ]}
          >
            <Button size="icon" onClick={() => setCreationOpen(true)}>
              <Plus className="size-5" />
            </Button>
          </PageHeader>

          <div className="p-6">
            <div className="mb-8 space-y-6">
              <div>
                <h1 className="text-balance text-3xl font-bold leading-tight">Welcome back, Cosplayer!</h1>
                <p className="text-pretty text-muted-foreground">
                  Here's an overview of your cosplay projects and upcoming events
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Active Projects"
                  value={3}
                  change={{ value: 15, trend: "up" }}
                  icon={<Folder className="size-6" />}
                />
                <StatCard title="Upcoming Events" value={3} icon={<Calendar className="size-6" />} />
                <StatCard
                  title="Tasks Due Soon"
                  value={5}
                  change={{ value: 20, trend: "down" }}
                  icon={<CheckSquare className="size-6" />}
                />
                <StatCard title="Total Budget" value="$1,900" icon={<DollarSign className="size-6" />} />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Current Projects</h2>
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {projects.map((project) => (
                      <ProjectCard key={project.id} {...project} />
                    ))}
                  </div>
                </div>

                <UpcomingEventsWidget />
              </div>

              <div className="space-y-6">
                <TasksWidget />
                <BudgetWidget />
                <RecentActivityWidget />
              </div>
            </div>
          </div>
        </main>

        <CreationFlyout open={creationOpen} onOpenChange={setCreationOpen} title="New Character">
          <CharacterCreationForm />
        </CreationFlyout>
      </div>
    </SidebarProvider>
  )
}
