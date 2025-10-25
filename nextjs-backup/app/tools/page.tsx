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

const tools = [
  {
    id: 1,
    name: "Heat Gun",
    category: "power-tool" as const,
    status: "owned" as const,
    condition: "good" as const,
    usedFor: ["Thermoplastic forming", "EVA foam shaping"],
    lastUsed: "2025-10-20",
  },
  {
    id: 2,
    name: "Dremel Rotary Tool",
    category: "power-tool" as const,
    status: "owned" as const,
    condition: "excellent" as const,
    usedFor: ["Detail work", "Sanding", "Cutting"],
    lastUsed: "2025-10-22",
  },
  {
    id: 3,
    name: "Sewing Machine",
    category: "sewing" as const,
    status: "owned" as const,
    condition: "good" as const,
    usedFor: ["Fabric work", "Costume assembly"],
    lastUsed: "2025-10-18",
  },
  {
    id: 4,
    name: "Airbrush Kit",
    category: "painting" as const,
    status: "wishlist" as const,
    condition: "n/a" as const,
    usedFor: ["Fine detail painting", "Weathering"],
    lastUsed: null,
  },
  {
    id: 5,
    name: "3D Printer",
    category: "fabrication" as const,
    status: "borrowed" as const,
    condition: "good" as const,
    usedFor: ["Props", "Accessories", "Small parts"],
    lastUsed: "2025-10-15",
  },
]

const statusColors = {
  owned: "bg-green-500/10 text-green-700 dark:text-green-400",
  borrowed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  wishlist: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  "needs-repair": "bg-red-500/10 text-red-700 dark:text-red-400",
}

const conditionColors = {
  excellent: "bg-green-500/10 text-green-700 dark:text-green-400",
  good: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  fair: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  poor: "bg-red-500/10 text-red-700 dark:text-red-400",
  "n/a": "bg-gray-500/10 text-gray-700 dark:text-gray-400",
}

const categoryColors = {
  "power-tool": "bg-red-500/10 text-red-700 dark:text-red-400",
  sewing: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  painting: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  fabrication: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  measuring: "bg-green-500/10 text-green-700 dark:text-green-400",
  other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
}

export default function ToolsPage() {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list")
  const [filters, setFilters] = React.useState({
    category: [] as string[],
    status: [] as string[],
    condition: [] as string[],
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
          <PageHeader searchPlaceholder="Search tools..." notifications={[]}>
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
                {["power-tool", "sewing", "painting", "fabrication", "measuring", "other"].map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={filters.category.includes(category)}
                    onCheckedChange={() => toggleFilter("category", category)}
                    className="capitalize"
                  >
                    {category.replace("-", " ")}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {["owned", "borrowed", "wishlist", "needs-repair"].map((status) => (
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
              <h1 className="text-balance text-3xl font-bold leading-tight">Tools</h1>
              <p className="text-pretty text-muted-foreground">{tools.length} tools in your workshop</p>
            </div>

            {viewMode === "grid" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-lg"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="mb-1 font-semibold leading-snug">{tool.name}</h3>
                        <Badge className={categoryColors[tool.category]} variant="secondary">
                          {tool.category.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={statusColors[tool.status]} variant="secondary">
                          {tool.status.replace("-", " ")}
                        </Badge>
                        {tool.condition !== "n/a" && (
                          <Badge className={conditionColors[tool.condition]} variant="secondary">
                            {tool.condition}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Used For</p>
                      <div className="flex flex-wrap gap-1">
                        {tool.usedFor.map((use) => (
                          <Badge key={use} variant="outline" className="text-xs">
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {tool.lastUsed && (
                      <p className="text-xs text-muted-foreground">
                        Last used: {new Date(tool.lastUsed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:shadow-lg"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold leading-snug">{tool.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={categoryColors[tool.category]} variant="secondary">
                            {tool.category.replace("-", " ")}
                          </Badge>
                          {tool.usedFor.map((use) => (
                            <Badge key={use} variant="outline" className="text-xs">
                              {use}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {tool.lastUsed && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Last Used</p>
                            <p className="text-sm font-medium">{new Date(tool.lastUsed).toLocaleDateString()}</p>
                          </div>
                        )}

                        <div className="flex flex-col gap-1">
                          <Badge className={statusColors[tool.status]} variant="secondary">
                            {tool.status.replace("-", " ")}
                          </Badge>
                          {tool.condition !== "n/a" && (
                            <Badge className={conditionColors[tool.condition]} variant="secondary">
                              {tool.condition}
                            </Badge>
                          )}
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
