import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Grid3x3, List, Plus, Upload } from "lucide-react"
import { IdeaCard } from "@/components/idea-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"

const ideas = [
  {
    id: 1,
    character: "Malenia, Blade of Miquella",
    series: "Elden Ring",
    image: "/fantasy-warrior-armor-red-hair.jpg",
    difficulty: "hard" as const,
    estimatedCost: 800,
    estimatedTime: "3-4 months",
    tags: ["armor", "fantasy", "prosthetic"],
    notes: "Complex armor build with prosthetic arm. Need to research EVA foam techniques.",
    inspiration: ["Pinterest board", "Cosplay tutorial by XYZ"],
    dateAdded: "2025-01-15",
  },
  {
    id: 2,
    character: "Raiden Shogun",
    series: "Genshin Impact",
    image: "/anime-character-purple-kimono.jpg",
    difficulty: "medium" as const,
    estimatedCost: 600,
    estimatedTime: "2-3 months",
    tags: ["kimono", "anime", "wig styling"],
    notes: "Beautiful kimono design. Focus on fabric choice and embroidery details.",
    inspiration: ["Official art", "Cosplay reference photos"],
    dateAdded: "2025-01-20",
  },
  {
    id: 3,
    character: "V (Female)",
    series: "Cyberpunk 2077",
    image: "/cyberpunk-character-neon-jacket.jpg",
    difficulty: "easy" as const,
    estimatedCost: 500,
    estimatedTime: "1-2 months",
    tags: ["cyberpunk", "modern", "LED"],
    notes: "Mostly clothing-based. Could add LED accents for extra flair.",
    inspiration: ["Game screenshots", "Cyberpunk fashion"],
    dateAdded: "2025-02-01",
  },
  {
    id: 4,
    character: "Jinx",
    series: "Arcane / League of Legends",
    image: "/jinx-arcane-blue-hair-twin-braids.jpg",
    difficulty: "medium" as const,
    estimatedCost: 450,
    estimatedTime: "2 months",
    tags: ["anime", "wig styling", "props"],
    notes: "Love the character development in Arcane. Need to make Pow-Pow and Fishbones.",
    inspiration: ["Arcane series", "LoL splash art"],
    dateAdded: "2025-02-10",
  },
]

export default function IdeasPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader
            searchPlaceholder="Search ideas..."
            notifications={[
              {
                title: "New inspiration saved",
                description: "Added 3 new reference images",
              },
            ]}
          >
            <Button variant="ghost" size="icon">
              <Upload className="size-5" />
            </Button>
            <Button size="icon">
              <Plus className="size-5" />
            </Button>
          </PageHeader>

          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-balance text-3xl font-bold leading-tight">Cosplay Ideas</h1>
              <p className="text-pretty text-muted-foreground">
                Your inspiration board with {ideas.length} ideas waiting to come to life
              </p>
            </div>

            <Tabs defaultValue="grid" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    All Ideas
                  </Button>
                  <Button variant="ghost" size="sm">
                    Easy
                  </Button>
                  <Button variant="ghost" size="sm">
                    Medium
                  </Button>
                  <Button variant="ghost" size="sm">
                    Hard
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
                  {ideas.map((idea) => (
                    <IdeaCard key={idea.id} {...idea} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                {ideas.map((idea) => (
                  <IdeaCard key={idea.id} {...idea} variant="list" />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
