<script lang="ts">
  import { Plus, Filter, Grid3x3, List } from 'lucide-svelte';
  import { Button, Badge, DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '$lib/components/ui';

  interface Prop {
    id: number;
    name: string;
    character: string;
    image: string;
    type: 'weapon' | 'accessory' | 'armor' | 'other';
    status: 'planning' | 'in-progress' | 'completed';
    materials: string[];
    complexity: 'low' | 'medium' | 'high';
  }

  const props: Prop[] = [
    {
      id: 1,
      name: "Malenia's Prosthetic Arm",
      character: "Malenia, Blade of Miquella",
      image: "/armor-shoulder.jpg",
      type: "weapon",
      status: "in-progress",
      materials: ["EVA foam", "Worbla", "LED strips"],
      complexity: "high",
    },
    {
      id: 2,
      name: "Raiden's Musou Isshin",
      character: "Raiden Shogun",
      image: "/purple-katana-sword.jpg",
      type: "weapon",
      status: "planning",
      materials: ["PVC pipe", "Foam", "Acrylic paint"],
      complexity: "medium",
    },
    {
      id: 3,
      name: "Cyberpunk Pistol",
      character: "V (Female)",
      image: "/futuristic-pistol-neon.jpg",
      type: "weapon",
      status: "planning",
      materials: ["3D print", "LED", "Paint"],
      complexity: "medium",
    },
    {
      id: 4,
      name: "Ciri's Sword",
      character: "Ciri",
      image: "/silver-medieval-sword.jpg",
      type: "weapon",
      status: "completed",
      materials: ["Wood", "Foam", "Silver paint"],
      complexity: "low",
    },
  ];

  const complexityColors = {
    low: "bg-green-500/10 text-green-700 dark:text-green-400",
    medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    high: "bg-red-500/10 text-red-700 dark:text-red-400",
  };

  const statusColors = {
    planning: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "in-progress": "bg-primary/10 text-primary",
    completed: "bg-green-500/10 text-green-700 dark:text-green-400",
  };

  const typeColors = {
    weapon: "bg-red-500/10 text-red-700 dark:text-red-400",
    accessory: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    armor: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  };

  let viewMode = $state<"grid" | "list">("grid");
  let filters = $state({
    type: [] as string[],
    complexity: [] as string[],
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
  <title>Props - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <!-- Header with actions -->
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-balance text-3xl font-bold leading-tight">Props</h1>
      <p class="text-pretty text-muted-foreground">{props.length} props across all projects</p>
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
          {#each ["weapon", "accessory", "armor", "other"] as type}
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
          <DropdownMenuLabel>Complexity</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {#each ["low", "medium", "high"] as complexity}
            <DropdownMenuItem 
              class="capitalize cursor-pointer"
              onclick={() => toggleFilter("complexity", complexity)}
            >
              <input 
                type="checkbox" 
                checked={filters.complexity.includes(complexity)}
                class="mr-2"
                readonly
              />
              {complexity}
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

  <!-- Props Grid/List View -->
  {#if viewMode === "grid"}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each props as prop (prop.id)}
        <div class="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg">
          <div class="relative aspect-square overflow-hidden bg-muted">
            <img
              src={prop.image || "/placeholder.svg"}
              alt={prop.name}
              class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div class="absolute right-2 top-2 flex flex-col gap-2">
              <Badge class={typeColors[prop.type]} variant="secondary">
                {prop.type}
              </Badge>
              <Badge class={complexityColors[prop.complexity]} variant="secondary">
                {prop.complexity}
              </Badge>
            </div>
          </div>
          <div class="p-4">
            <h3 class="mb-1 line-clamp-1 font-semibold leading-snug">{prop.name}</h3>
            <p class="mb-3 text-sm text-muted-foreground">{prop.character}</p>

            <div class="mb-3">
              <p class="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Materials
              </p>
              <div class="flex flex-wrap gap-1">
                {#each prop.materials as material}
                  <Badge variant="outline" class="text-xs">
                    {material}
                  </Badge>
                {/each}
              </div>
            </div>

            <Badge class={statusColors[prop.status]} variant="secondary">
              {prop.status.replace("-", " ")}
            </Badge>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="space-y-4">
      {#each props as prop (prop.id)}
        <div class="flex gap-4 overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-lg">
          <div class="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
            <img src={prop.image || "/placeholder.svg"} alt={prop.name} class="size-full object-cover" />
          </div>
          <div class="flex flex-1 flex-col gap-2">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="font-semibold leading-snug">{prop.name}</h3>
                <p class="text-sm text-muted-foreground">{prop.character}</p>
              </div>
              <div class="flex gap-2">
                <Badge class={typeColors[prop.type]} variant="secondary">
                  {prop.type}
                </Badge>
                <Badge class={complexityColors[prop.complexity]} variant="secondary">
                  {prop.complexity}
                </Badge>
                <Badge class={statusColors[prop.status]} variant="secondary">
                  {prop.status.replace("-", " ")}
                </Badge>
              </div>
            </div>

            <div>
              <p class="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Materials
              </p>
              <div class="flex flex-wrap gap-1">
                {#each prop.materials as material}
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