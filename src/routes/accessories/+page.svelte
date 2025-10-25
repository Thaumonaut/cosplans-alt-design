<script lang="ts">
  import { Plus, Filter, Grid3x3, List } from 'lucide-svelte';
  import { Button, Badge, DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '$lib/components/ui';

  interface Accessory {
    id: number;
    name: string;
    character: string;
    image: string;
    type: 'headwear' | 'jewelry' | 'eyewear' | 'other';
    status: 'planning' | 'in-progress' | 'completed';
    materials: string[];
  }

  const accessories: Accessory[] = [
    {
      id: 1,
      name: "Malenia's Helmet",
      character: "Malenia, Blade of Miquella",
      image: "/armor-chest-plate.jpg",
      type: "headwear",
      status: "in-progress",
      materials: ["Worbla", "EVA foam", "Gold paint"],
    },
    {
      id: 2,
      name: "Raiden's Hair Ornament",
      character: "Raiden Shogun",
      image: "/purple-japanese-hair-ornament.jpg",
      type: "jewelry",
      status: "planning",
      materials: ["Resin", "Wire", "Paint"],
    },
    {
      id: 3,
      name: "Cyberpunk Goggles",
      character: "V (Female)",
      image: "/futuristic-goggles-neon.jpg",
      type: "eyewear",
      status: "completed",
      materials: ["3D print", "Tinted plastic", "LED"],
    },
  ];

  const statusColors = {
    planning: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "in-progress": "bg-primary/10 text-primary",
    completed: "bg-green-500/10 text-green-700 dark:text-green-400",
  };

  const typeColors = {
    headwear: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    jewelry: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
    eyewear: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  };

  let viewMode = $state<"grid" | "list">("grid");
  let filters = $state({
    type: [] as string[],
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
  <title>Accessories - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <!-- Header with actions -->
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-balance text-3xl font-bold leading-tight">Accessories</h1>
      <p class="text-pretty text-muted-foreground">{accessories.length} accessories across all projects</p>
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
          <DropdownMenuLabel>Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {#each ["headwear", "jewelry", "eyewear", "other"] as type}
            <DropdownMenuItem 
              class="capitalize cursor-pointer"
              onclick={() => toggleFilter("type", type)}
            >
              <input 
                type="checkbox" 
                checked={filters.type.includes(type)}
                class="mr-2"
                readonly
              />
              {type}
            </DropdownMenuItem>
          {/each}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {#each ["planning", "in-progress", "completed"] as status}
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

  <!-- Accessories Grid/List View -->
  {#if viewMode === "grid"}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each accessories as accessory (accessory.id)}
        <div class="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg">
          <div class="relative aspect-square overflow-hidden bg-muted">
            <img
              src={accessory.image || "/placeholder.svg"}
              alt={accessory.name}
              class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div class="absolute right-2 top-2">
              <Badge class={typeColors[accessory.type]} variant="secondary">
                {accessory.type}
              </Badge>
            </div>
          </div>
          <div class="p-4">
            <h3 class="mb-1 line-clamp-1 font-semibold leading-snug">{accessory.name}</h3>
            <p class="mb-3 text-sm text-muted-foreground">{accessory.character}</p>

            <div class="mb-3">
              <p class="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Materials
              </p>
              <div class="flex flex-wrap gap-1">
                {#each accessory.materials as material}
                  <Badge variant="outline" class="text-xs">
                    {material}
                  </Badge>
                {/each}
              </div>
            </div>

            <Badge class={statusColors[accessory.status]} variant="secondary">
              {accessory.status.replace("-", " ")}
            </Badge>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="space-y-4">
      {#each accessories as accessory (accessory.id)}
        <div class="flex gap-4 overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-lg">
          <div class="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
            <img
              src={accessory.image || "/placeholder.svg"}
              alt={accessory.name}
              class="size-full object-cover"
            />
          </div>
          <div class="flex flex-1 flex-col gap-2">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="font-semibold leading-snug">{accessory.name}</h3>
                <p class="text-sm text-muted-foreground">{accessory.character}</p>
              </div>
              <div class="flex gap-2">
                <Badge class={typeColors[accessory.type]} variant="secondary">
                  {accessory.type}
                </Badge>
                <Badge class={statusColors[accessory.status]} variant="secondary">
                  {accessory.status.replace("-", " ")}
                </Badge>
              </div>
            </div>

            <div>
              <p class="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Materials
              </p>
              <div class="flex flex-wrap gap-1">
                {#each accessory.materials as material}
                  <Badge variant="outline" class="text-xs">
                    {material}
                  </Badge>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>