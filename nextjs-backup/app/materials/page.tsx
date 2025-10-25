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

const materials = [
  {
    id: 1,
    name: "EVA Foam Sheets",
    category: "foam" as const,
    quantity: { current: 5, unit: "sheets" },
    status: "in-stock" as const,
    usedIn: ["Malenia's Armor", "Raiden's Accessories"],
    cost: 45.0,
  },
  {
    id: 2,
    name: "Worbla Thermoplastic",
    category: "thermoplastic" as const,
    quantity: { current: 2, unit: "sheets" },
    status: "low-stock" as const,
    usedIn: ["Malenia's Prosthetic"],
    cost: 80.0,
  },
  {
    id: 3,
    name: "Purple Silk Fabric",
    category: "fabric" as const,
    quantity: { current: 0, unit: "yards" },
    status: "out-of-stock" as const,
    usedIn: ["Raiden's Kimono"],
    cost: 35.0,
  },
  {
    id: 4,
    name: "LED Strip Lights",
    category: "electronics" as const,
    quantity: { current: 3, unit: "meters" },
    status: "in-stock" as const,
    usedIn: ["Malenia's Prosthetic", "V's Jacket"],
    cost: 25.0,
  },
  {
    id: 5,
    name: "Acrylic Paint Set",
    category: "paint" as const,
    quantity: { current: 1, unit: "set" },
    status: "in-stock" as const,
    usedIn: ["Multiple Projects"],
    cost: 40.0,
  },
]

const statusColors = {
  "in-stock": "bg-green-500/10 text-green-700 dark:text-green-400",
  "low-stock": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  "out-of-stock": "bg-red-500/10 text-red-700 dark:text-red-400",
  ordered: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
}

const categoryColors = {
  foam: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  thermoplastic: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  fabric: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  electronics: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  paint: "bg-green-500/10 text-green-700 dark:text-green-400",
  other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
}

export default function MaterialsPage() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list")
  const [filters, setFilters] = React.useState({
    category: [] as string[],
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
          <PageHeader searchPlaceholder="Search materials..." notifications={[]}>
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
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["foam", "thermoplastic", "fabric", "electronics", "paint", "other"].map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={filters.category.includes(category)}
                    onCheckedChange={() => toggleFilter("category", category)}
                    className="capitalize"
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["in-stock", "low-stock", "out-of-stock", "ordered"].map((status) => (
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
              <h1 className="text-balance text-3xl font-bold leading-tight">Materials</h1>
              <p className="text-pretty text-muted-foreground">
                {materials.length} materials tracked across all projects
              </p>
            </div>

            {viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-lg"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="mb-1 font-semibold leading-snug">{material.name}</h3>
                        <Badge className={categoryColors[material.category]} variant="secondary">
                          {material.category}
                        </Badge>
                      </div>
                      <Badge className={statusColors[material.status]} variant="secondary">
                        {material.status.replace("-", " ")}
                      </Badge>
                    </div>

                    <div className="mb-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-medium">
                          {material.quantity.current} {material.quantity.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Cost</span>
                        <span className="font-medium">${material.cost.toFixed(2)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Used In</p>
                      <div className="flex flex-wrap gap-1">
                        {material.usedIn.map((project) => (
                          <Badge key={project} variant="outline" className="text-xs">
                            {project}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:shadow-lg"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold leading-snug">{material.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={categoryColors[material.category]} variant="secondary">
                            {material.category}
                          </Badge>
                          {material.usedIn.map((project) => (
                            <Badge key={project} variant="outline" className="text-xs">
                              {project}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Quantity</p>
                          <p className="font-medium">
                            {material.quantity.current} {material.quantity.unit}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Cost</p>
                          <p className="font-medium">${material.cost.toFixed(2)}</p>
                        </div>

                        <Badge className={statusColors[material.status]} variant="secondary">
                          {material.status.replace("-", " ")}
                        </Badge>
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
