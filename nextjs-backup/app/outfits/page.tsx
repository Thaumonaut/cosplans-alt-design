"use client"

import * as React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus, Filter, Grid3x3, List } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const outfits = [
  {
    id: 1,
    name: "Malenia Full Armor Set",
    character: "Malenia, Blade of Miquella",
    image: "/fantasy-warrior-armor-red-hair.jpg",
    progress: 65,
    pieces: { completed: 4, total: 8 },
    status: "in-progress" as const,
    complexity: "high" as const,
    tags: ["armor", "metalwork", "fabric", "prosthetic"],
  },
  {
    id: 2,
    name: "Raiden Shogun Kimono",
    character: "Raiden Shogun",
    image: "/anime-character-purple-kimono.jpg",
    progress: 30,
    pieces: { completed: 2, total: 6 },
    status: "planning" as const,
    complexity: "medium" as const,
    tags: ["kimono", "embroidery", "accessories"],
  },
  {
    id: 3,
    name: "V's Street Outfit",
    character: "V (Female)",
    image: "/cyberpunk-character-neon-jacket.jpg",
    progress: 10,
    pieces: { completed: 1, total: 5 },
    status: "planning" as const,
    complexity: "low" as const,
    tags: ["modern", "leather", "tech"],
  },
  {
    id: 4,
    name: "Ciri's Witcher Gear",
    character: "Ciri",
    image: "/fantasy-warrior-white-hair-sword.jpg",
    progress: 100,
    pieces: { completed: 7, total: 7 },
    status: "completed" as const,
    complexity: "medium" as const,
    tags: ["leather", "armor", "fabric"],
  },
]

const complexityColors = {
  low: "bg-green-500/10 text-green-700 dark:text-green-400",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  high: "bg-red-500/10 text-red-700 dark:text-red-400",
}

const statusColors = {
  planning: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "in-progress": "bg-primary/10 text-primary",
  completed: "bg-green-500/10 text-green-700 dark:text-green-400",
}

export default function OutfitsPage() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [filters, setFilters] = React.useState({
    complexity: [] as string[],
    status: [] as string[],
  })

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value],
    }))
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader searchPlaceholder="Search outfits..." notifications={[]}>
            <Button size="icon" variant="outline" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
              {viewMode === "grid" ? <List className="size-5" /> : <Grid3x3 className="size-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline">
                  <Filter className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Complexity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["low", "medium", "high"].map((complexity) => (
                  <DropdownMenuCheckboxItem
                    key={complexity}
                    checked={filters.complexity.includes(complexity)}
                    onCheckedChange={() => toggleFilter("complexity", complexity)}
                    className="capitalize"
                  >
                    {complexity}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["planning", "in-progress", "completed"].map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.status.includes(status)}
                    onCheckedChange={() => toggleFilter("status", status)}
                    className="capitalize"
                  >
                    {status.replace("-", " ")}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="icon">
              <Plus className="size-5" />
            </Button>
          </PageHeader>

          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-balance text-3xl font-bold leading-tight">Outfits</h1>
              <p className="text-pretty text-muted-foreground">
                {outfits.length} complete outfit sets across all characters
              </p>
            </div>

            {viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {outfits.map((outfit) => (
                  <div
                    key={outfit.id}
                    className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={outfit.image || "/placeholder.svg"}
                        alt={outfit.name}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute right-2 top-2 flex gap-2">
                        <Badge className={complexityColors[outfit.complexity]} variant="secondary">
                          {outfit.complexity}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 line-clamp-1 font-semibold leading-snug">{outfit.name}</h3>
                      <p className="mb-3 text-sm text-muted-foreground">{outfit.character}</p>

                      <div className="mb-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{outfit.progress}%</span>
                        </div>
                        <Progress value={outfit.progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {outfit.pieces.completed} of {outfit.pieces.total} pieces
                          </span>
                          <Badge className={statusColors[outfit.status]} variant="secondary">
                            {outfit.status.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {outfit.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {outfit.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{outfit.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {outfits.map((outfit) => (
                  <div
                    key={outfit.id}
                    className="flex gap-4 overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-lg"
                  >
                    <div className="relative size-32 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={outfit.image || "/placeholder.svg"}
                        alt={outfit.name}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold leading-snug">{outfit.name}</h3>
                          <p className="text-sm text-muted-foreground">{outfit.character}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={complexityColors[outfit.complexity]} variant="secondary">
                            {outfit.complexity}
                          </Badge>
                          <Badge className={statusColors[outfit.status]} variant="secondary">
                            {outfit.status.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {outfit.pieces.completed} of {outfit.pieces.total} pieces completed
                          </span>
                          <span className="font-medium">{outfit.progress}%</span>
                        </div>
                        <Progress value={outfit.progress} className="h-2" />
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {outfit.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
