"use client"

import * as React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus, Filter, Grid3x3, List } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CreationFlyout } from "@/components/creation-flyout"
import { CharacterCreationForm } from "@/components/character-creation-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const characters = [
  {
    id: 1,
    name: "Malenia, Blade of Miquella",
    series: "Elden Ring",
    image: "/fantasy-warrior-armor-red-hair.jpg",
    difficulty: "expert" as const,
    tags: ["armor", "fantasy", "warrior", "prosthetic"],
    status: "in-progress" as const,
    usedInProjects: 1,
  },
  {
    id: 2,
    name: "Raiden Shogun",
    series: "Genshin Impact",
    image: "/anime-character-purple-kimono.jpg",
    difficulty: "hard" as const,
    tags: ["kimono", "anime", "electro", "archon"],
    status: "planning" as const,
    usedInProjects: 1,
  },
  {
    id: 3,
    name: "V (Female)",
    series: "Cyberpunk 2077",
    image: "/cyberpunk-character-neon-jacket.jpg",
    difficulty: "medium" as const,
    tags: ["cyberpunk", "modern", "tech", "jacket"],
    status: "idea" as const,
    usedInProjects: 1,
  },
  {
    id: 4,
    name: "Ciri",
    series: "The Witcher 3",
    image: "/fantasy-warrior-white-hair-sword.jpg",
    difficulty: "hard" as const,
    tags: ["fantasy", "warrior", "leather", "sword"],
    status: "completed" as const,
    usedInProjects: 1,
  },
  {
    id: 5,
    name: "Jinx",
    series: "Arcane / League of Legends",
    image: "/jinx-arcane-blue-hair-twin-braids.jpg",
    difficulty: "medium" as const,
    tags: ["anime", "punk", "blue-hair", "weapons"],
    status: "idea" as const,
    usedInProjects: 0,
  },
]

const difficultyColors = {
  easy: "bg-green-500/10 text-green-700 dark:text-green-400",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  hard: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  expert: "bg-red-500/10 text-red-700 dark:text-red-400",
}

const statusColors = {
  idea: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  planning: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "in-progress": "bg-primary/10 text-primary",
  completed: "bg-green-500/10 text-green-700 dark:text-green-400",
}

export default function CharactersPage() {
  const [creationOpen, setCreationOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [filters, setFilters] = React.useState({
    difficulty: [] as string[],
    status: [] as string[],
    series: [] as string[],
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
          <PageHeader
            searchPlaceholder="Search characters..."
            notifications={[
              {
                title: "New character added",
                description: "Jinx from Arcane added to your library",
              },
            ]}
          >
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
                <DropdownMenuLabel>Difficulty</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["easy", "medium", "hard", "expert"].map((difficulty) => (
                  <DropdownMenuCheckboxItem
                    key={difficulty}
                    checked={filters.difficulty.includes(difficulty)}
                    onCheckedChange={() => toggleFilter("difficulty", difficulty)}
                    className="capitalize"
                  >
                    {difficulty}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["idea", "planning", "in-progress", "completed"].map((status) => (
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
            <Button size="icon" onClick={() => setCreationOpen(true)}>
              <Plus className="size-5" />
            </Button>
          </PageHeader>

          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-balance text-3xl font-bold leading-tight">Characters</h1>
              <p className="text-pretty text-muted-foreground">
                {characters.length} characters in your library across all projects
              </p>
            </div>

            {viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={character.image || "/placeholder.svg"}
                        alt={character.name}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute right-2 top-2 flex gap-2">
                        <Badge className={difficultyColors[character.difficulty]} variant="secondary">
                          {character.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 line-clamp-1 font-semibold leading-snug">{character.name}</h3>
                      <p className="mb-3 text-sm text-muted-foreground">{character.series}</p>
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {character.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {character.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{character.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={statusColors[character.status]} variant="secondary">
                          {character.status.replace("-", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {character.usedInProjects} {character.usedInProjects === 1 ? "project" : "projects"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    className="flex gap-4 overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-lg"
                  >
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={character.image || "/placeholder.svg"}
                        alt={character.name}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="mb-1 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold leading-snug">{character.name}</h3>
                            <p className="text-sm text-muted-foreground">{character.series}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={difficultyColors[character.difficulty]} variant="secondary">
                              {character.difficulty}
                            </Badge>
                            <Badge className={statusColors[character.status]} variant="secondary">
                              {character.status.replace("-", " ")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {character.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {character.usedInProjects} {character.usedInProjects === 1 ? "project" : "projects"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <CreationFlyout open={creationOpen} onOpenChange={setCreationOpen} title="New Character">
          <CharacterCreationForm />
        </CreationFlyout>
      </div>
    </SidebarProvider>
  )
}
