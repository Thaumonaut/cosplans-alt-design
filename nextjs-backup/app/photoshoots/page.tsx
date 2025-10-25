import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Upload, Grid3x3, List } from "lucide-react"
import { PhotoshootCard } from "@/components/photoshoot-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"

const photoshoots = [
  {
    id: 1,
    title: "Elden Ring Forest Shoot",
    character: "Malenia, Blade of Miquella",
    series: "Elden Ring",
    date: "2025-01-20",
    location: "Redwood Forest Park",
    photographer: "Jane Photography",
    photos: {
      total: 120,
      edited: 45,
      favorites: 12,
    },
    coverImage: "/fantasy-warrior-armor-red-hair.jpg",
    status: "editing" as const,
  },
  {
    id: 2,
    title: "Witcher Castle Photoshoot",
    character: "Ciri",
    series: "The Witcher 3",
    date: "2024-12-15",
    location: "Historic Castle Ruins",
    photographer: "Epic Cosplay Photos",
    photos: {
      total: 85,
      edited: 85,
      favorites: 20,
    },
    coverImage: "/fantasy-warrior-white-hair-sword.jpg",
    status: "completed" as const,
  },
]

export default function PhotoshootsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader
            searchPlaceholder="Search photoshoots..."
            notifications={[
              {
                title: "Photos ready",
                description: "45 edited photos from Elden Ring shoot",
              },
            ]}
          />

          <div className="p-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-balance text-3xl font-bold leading-tight">Photoshoots</h1>
                <p className="text-pretty text-muted-foreground">
                  Manage your cosplay photography sessions and photo galleries
                </p>
              </div>
              <Button variant="outline" size="icon">
                <Upload className="size-5" />
              </Button>
            </div>

            <Tabs defaultValue="grid" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    All Shoots
                  </Button>
                  <Button variant="ghost" size="sm">
                    Editing
                  </Button>
                  <Button variant="ghost" size="sm">
                    Completed
                  </Button>
                </div>
                <TabsList>
                  <TabsTrigger value="grid">
                    <Grid3x3 className="size-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="size-4" />
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="grid" className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {photoshoots.map((shoot) => (
                    <PhotoshootCard key={shoot.id} {...shoot} variant="grid" />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                {photoshoots.map((shoot) => (
                  <PhotoshootCard key={shoot.id} {...shoot} variant="list" />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
