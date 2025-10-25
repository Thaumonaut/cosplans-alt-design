"use client"

import * as React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus, Filter, Grid3x3, List } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const props = [
  {
    id: 1,
    name: "Malenia's Prosthetic Arm",
    character: "Malenia, Blade of Miquella",
    image: "/armor-shoulder.jpg",
    type: "weapon" as const,
    status: "in-progress" as const,
    materials: ["EVA foam", "Worbla", "LED strips"],
    complexity: "high" as const,
  },
  {
    id: 2,
    name: "Raiden's Musou Isshin",
    character: "Raiden Shogun",
    image: "/purple-katana-sword.jpg",
    type: "weapon" as const,
    status: "planning" as const,
    materials: ["PVC pipe", "Foam", "Acrylic paint"],
    complexity: "medium" as const,
  },
  {
    id: 3,
    name: "Cyberpunk Pistol",
    character: "V (Female)",
    image: "/futuristic-pistol-neon.jpg",
    type: "weapon" as const,
    status: "planning" as const,
    materials: ["3D print", "LED", "Paint"],
    complexity: "medium" as const,
  },
  {
    id: 4,
    name: "Ciri's Sword",
    character: "Ciri",
    image: "/silver-medieval-sword.jpg",
    type: "weapon" as const,
    status: "completed" as const,
    materials: ["Wood", "Foam", "Silver paint"],
    complexity: "low" as const,
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

const typeColors = {
  weapon: "bg-red-500/10 text-red-700 dark:text-red-400",
  accessory: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  armor: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
}

export default function PropsPage() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [filters, setFilters] = React.useState({
    type: [] as string[],
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
          <PageHeader searchPlaceholder="Search props..." notifications={[]}>
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
                <DropdownMenuLabel>Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["weapon", "accessory", "armor", "other"].map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={filters.type.includes(type)}
                    onCheckedChange={() => toggleFilter("type", type)}
                    className="capitalize"
                  >
                    {type}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
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
              <h1 className="text-balance text-3xl font-bold leading-tight">Props</h1>
              <p className="text-pretty text-muted-foreground">{props.length} props across all projects</p>
            </div>

            {viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {props.map((prop) => (
                  <div
                    key={prop.id}
                    className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={prop.image || "/placeholder.svg"}
                        alt={prop.name}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute right-2 top-2 flex flex-col gap-2">
                        <Badge className={typeColors[prop.type]} variant="secondary">
                          {prop.type}
                        </Badge>
                        <Badge className={complexityColors[prop.complexity]} variant="secondary">
                          {prop.complexity}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 line-clamp-1 font-semibold leading-snug">{prop.name}</h3>
                      <p className="mb-3 text-sm text-muted-foreground">{prop.character}</p>

                      <div className="mb-3">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Materials
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {prop.materials.map((material) => (
                            <Badge key={material} variant="outline" className="text-xs">
                              {material}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Badge className={statusColors[prop.status]} variant="secondary">
                        {prop.status.replace("-", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {props.map((prop) => (
                  <div
                    key={prop.id}
                    className="flex gap-4 overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-lg"
                  >
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img src={prop.image || "/placeholder.svg"} alt={prop.name} className="size-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold leading-snug">{prop.name}</h3>
                          <p className="text-sm text-muted-foreground">{prop.character}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={typeColors[prop.type]} variant="secondary">
                            {prop.type}
                          </Badge>
                          <Badge className={complexityColors[prop.complexity]} variant="secondary">
                            {prop.complexity}
                          </Badge>
                          <Badge className={statusColors[prop.status]} variant="secondary">
                            {prop.status.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Materials
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {prop.materials.map((material) => (
                            <Badge key={material} variant="outline" className="text-xs">
                              {material}
                            </Badge>
                          ))}
                        </div>
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
