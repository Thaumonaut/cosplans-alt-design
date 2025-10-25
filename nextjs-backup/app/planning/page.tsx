import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { PlanningCard } from "@/components/planning-card"
import { PageHeader } from "@/components/page-header"

const planningProjects = [
  {
    id: 1,
    character: "Raiden Shogun",
    series: "Genshin Impact",
    image: "/anime-character-purple-kimono.jpg",
    budget: { allocated: 600, spent: 200 },
    timeline: {
      startDate: "2025-03-01",
      targetDate: "2025-05-20",
      daysRemaining: 80,
    },
    tasks: {
      total: 24,
      completed: 8,
    },
    materials: {
      ordered: 5,
      pending: 3,
    },
    priority: "high" as const,
  },
  {
    id: 2,
    character: "V (Female)",
    series: "Cyberpunk 2077",
    image: "/cyberpunk-character-neon-jacket.jpg",
    budget: { allocated: 500, spent: 50 },
    timeline: {
      startDate: "2025-02-15",
      targetDate: "2025-04-15",
      daysRemaining: 50,
    },
    tasks: {
      total: 18,
      completed: 2,
    },
    materials: {
      ordered: 2,
      pending: 5,
    },
    priority: "medium" as const,
  },
]

export default function PlanningPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader
            searchPlaceholder="Search planning projects..."
            notifications={[
              {
                title: "Materials arrived",
                description: "Purple fabric for Raiden Shogun delivered",
              },
            ]}
          />

          <div className="p-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-balance text-3xl font-bold leading-tight">Planning Phase</h1>
                <p className="text-pretty text-muted-foreground">
                  {planningProjects.length} projects in active planning with detailed breakdowns
                </p>
              </div>
              <Button variant="outline" size="icon">
                <Filter className="size-5" />
              </Button>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  All Projects
                </Button>
                <Button variant="ghost" size="sm">
                  High Priority
                </Button>
                <Button variant="ghost" size="sm">
                  Medium Priority
                </Button>
                <Button variant="ghost" size="sm">
                  Low Priority
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {planningProjects.map((project) => (
                <PlanningCard key={project.id} {...project} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
