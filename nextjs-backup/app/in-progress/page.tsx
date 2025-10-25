import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { ProgressCard } from "@/components/progress-card"
import { PageHeader } from "@/components/page-header"

const activeProjects = [
  {
    id: 1,
    character: "Malenia, Blade of Miquella",
    series: "Elden Ring",
    image: "/fantasy-warrior-armor-red-hair.jpg",
    progress: 65,
    budget: { spent: 450, total: 800 },
    deadline: "2025-10-15",
    currentPhase: "Armor Construction",
    recentUpdates: [
      {
        date: "2025-02-20",
        title: "Completed chest plate",
        image: "/armor-chest-plate.jpg",
      },
      {
        date: "2025-02-18",
        title: "Started shoulder pieces",
        image: "/armor-shoulder.jpg",
      },
    ],
    nextMilestone: "Complete arm prosthetic",
    daysUntilDeadline: 235,
  },
]

export default function InProgressPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader
            searchPlaceholder="Search active projects..."
            notifications={[
              {
                title: "Milestone completed",
                description: "Chest plate finished for Malenia",
              },
            ]}
          />

          <div className="p-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-balance text-3xl font-bold leading-tight">In Progress</h1>
                <p className="text-pretty text-muted-foreground">
                  {activeProjects.length} active project with detailed progress tracking
                </p>
              </div>
              <Button variant="outline" size="icon">
                <Camera className="size-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {activeProjects.map((project) => (
                <ProgressCard key={project.id} {...project} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
