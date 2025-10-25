import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Archive } from "lucide-react"
import { ProjectCard } from "@/components/project-card"
import { PageHeader } from "@/components/page-header"

const archivedProjects = [
  {
    id: 1,
    title: "The Witcher",
    character: "Ciri",
    series: "The Witcher 3",
    image: "/fantasy-warrior-white-hair-sword.jpg",
    progress: 100,
    budget: { spent: 650, total: 650 },
    status: "completed" as const,
  },
]

export default function ArchivedPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader searchPlaceholder="Search archived projects..." notifications={[]} />

          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <Archive className="size-8 text-muted-foreground" />
                <div>
                  <h1 className="text-balance text-3xl font-bold leading-tight">Archived Projects</h1>
                  <p className="text-pretty text-muted-foreground">
                    {archivedProjects.length} completed project in your archive
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  All Archived
                </Button>
                <Button variant="ghost" size="sm">
                  Completed
                </Button>
                <Button variant="ghost" size="sm">
                  Cancelled
                </Button>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {archivedProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
