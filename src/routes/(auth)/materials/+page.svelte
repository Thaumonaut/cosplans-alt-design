<script lang="ts">
  import { Plus, Filter, Grid3x3, List } from 'lucide-svelte';
  import { Button, Badge, DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '$lib/components/ui';

  interface Material {
    id: number;
    name: string;
    category: 'foam' | 'thermoplastic' | 'fabric' | 'electronics' | 'paint' | 'other';
    quantity: { current: number; unit: string };
    status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'ordered';
    usedIn: string[];
    cost: number;
  }

  const materials: Material[] = [
    {
      id: 1,
      name: "EVA Foam Sheets",
      category: "foam",
      quantity: { current: 5, unit: "sheets" },
      status: "in-stock",
      usedIn: ["Malenia's Armor", "Raiden's Accessories"],
      cost: 45.0,
    },
    {
      id: 2,
      name: "Worbla Thermoplastic",
      category: "thermoplastic",
      quantity: { current: 2, unit: "sheets" },
      status: "low-stock",
      usedIn: ["Malenia's Prosthetic"],
      cost: 80.0,
    },
    {
      id: 3,
      name: "Purple Silk Fabric",
      category: "fabric",
      quantity: { current: 0, unit: "yards" },
      status: "out-of-stock",
      usedIn: ["Raiden's Kimono"],
      cost: 35.0,
    },
    {
      id: 4,
      name: "LED Strip Lights",
      category: "electronics",
      quantity: { current: 3, unit: "meters" },
      status: "in-stock",
      usedIn: ["Malenia's Prosthetic", "V's Jacket"],
      cost: 25.0,
    },
    {
      id: 5,
      name: "Acrylic Paint Set",
      category: "paint",
      quantity: { current: 1, unit: "set" },
      status: "in-stock",
      usedIn: ["Multiple Projects"],
      cost: 40.0,
    },
  ];

  const statusColors = {
    "in-stock": "bg-green-500/10 text-green-700 dark:text-green-400",
    "low-stock": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    "out-of-stock": "bg-red-500/10 text-red-700 dark:text-red-400",
    ordered: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  };

  const categoryColors = {
    foam: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    thermoplastic: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    fabric: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
    electronics: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    paint: "bg-green-500/10 text-green-700 dark:text-green-400",
    other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  };

  let viewMode = $state<"grid" | "list">("list");
  let filters = $state({
    category: [] as string[],
    status: [] as string[],
  });

  function toggleFilter(category: keyof typeof filters, value: string) {
    const currentFilters = filters[category];
    if (currentFilters.includes(value)) {
      filters[category] = currentFilters.filter((v) => v !== value);
    } else {
      filters[category] = [...currentFilters, value];
    }
  }
</script>

<svelte:head>
  <title>Materials - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <!-- Header with actions -->
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-balance text-3xl font-bold leading-tight">Materials</h1>
      <p class="text-pretty text-muted-foreground">
        {materials.length} materials tracked across all projects
      </p>
    </div>
    
    <div class="flex items-center gap-2">
      <Button variant="outline" size="icon" onclick={() => viewMode = viewMode === "grid" ? "list" : "grid"}>
        {#if viewMode === "grid"}
          <List class="size-5" />
        {:else}
          <Grid3x3 class="size-5" />
        {/if}
      </Button>
      
      <DropdownMenu>
        <Button variant="outline" size="icon" slot="trigger">
          <Filter class="size-5" />
        </Button>
        
        <div slot="content" class="w-56">
          <DropdownMenuLabel>Category</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {#each ["foam", "thermoplastic", "fabric", "electronics", "paint", "other"] as category}
            <DropdownMenuItem 
              class="capitalize cursor-pointer"
              onclick={() => toggleFilter("category", category)}
            >
              <input 
                type="checkbox" 
                checked={filters.category.includes(category)}
                class="mr-2"
                readonly
              />
              {category}
            </DropdownMenuItem>
          {/each}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {#each ["in-stock", "low-stock", "out-of-stock", "ordered"] as status}
            <DropdownMenuItem 
              class="capitalize cursor-pointer"
              onclick={() => toggleFilter("status", status)}
            >
              <input 
                type="checkbox" 
                checked={filters.status.includes(status)}
                class="mr-2"
                readonly
              />
              {status.replace("-", " ")}
            </DropdownMenuItem>
          {/each}
        </div>
      </DropdownMenu>
      
      <Button size="icon">
        <Plus class="size-5" />
      </Button>
    </div>
  </div>

  <!-- Materials Grid/List View -->
  {#if viewMode === "grid"}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each materials as material (material.id)}
        <div class="overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-lg">
          <div class="mb-3 flex items-start justify-between">
            <div>
              <h3 class="mb-1 font-semibold leading-snug">{material.name}</h3>
              <Badge class={categoryColors[material.category]} variant="secondary">
                {material.category}
              </Badge>
            </div>
            <Badge class={statusColors[material.status]} variant="secondary">
              {material.status.replace("-", " ")}
            </Badge>
          </div>

          <div class="mb-3 space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Quantity</span>
              <span class="font-medium">
                {material.quantity.current} {material.quantity.unit}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Cost</span>
              <span class="font-medium">${material.cost.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <p class="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Used In</p>
            <div class="flex flex-wrap gap-1">
              {#each material.usedIn as project}
                <Badge variant="outline" class="text-xs">
                  {project}
                </Badge>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="space-y-3">
      {#each materials as material (material.id)}
        <div class="flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:shadow-lg">
          <div class="flex flex-1 items-center gap-4">
            <div class="flex-1">
              <h3 class="mb-1 font-semibold leading-snug">{material.name}</h3>
              <div class="flex flex-wrap gap-2">
                <Badge class={categoryColors[material.category]} variant="secondary">
                  {material.category}
                </Badge>
                {#each material.usedIn as project}
                  <Badge variant="outline" class="text-xs">
                    {project}
                  </Badge>
                {/each}
              </div>
            </div>

            <div class="flex items-center gap-6">
              <div class="text-right">
                <p class="text-xs text-muted-foreground">Quantity</p>
                <p class="font-medium">
                  {material.quantity.current} {material.quantity.unit}
                </p>
              </div>

              <div class="text-right">
                <p class="text-xs text-muted-foreground">Cost</p>
                <p class="font-medium">${material.cost.toFixed(2)}</p>
              </div>

              <Badge class={statusColors[material.status]} variant="secondary">
                {material.status.replace("-", " ")}
              </Badge>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>