<script lang="ts">
  import { Plus, Filter, Grid3x3, List } from 'lucide-svelte';
  import { Button, Badge, Progress, DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '$lib/components/ui';

  interface Outfit {
    id: number;
    name: string;
    character: string;
    image: string;
    progress: number;
    pieces: { completed: number; total: number };
    status: 'planning' | 'in-progress' | 'completed';
    complexity: 'low' | 'medium' | 'high';
    tags: string[];
  }

  const outfits: Outfit[] = [
    {
      id: 1,
      name: "Malenia Full Armor Set",
      character: "Malenia, Blade of Miquella",
      image: "/fantasy-warrior-armor-red-hair.jpg",
      progress: 65,
      pieces: { completed: 4, total: 8 },
      status: "in-progress",
      complexity: "high",
      tags: ["armor", "metalwork", "fabric", "prosthetic"],
    },
    {
      id: 2,
      name: "Raiden Shogun Kimono",
      character: "Raiden Shogun",
      image: "/anime-character-purple-kimono.jpg",
      progress: 30,
      pieces: { completed: 2, total: 6 },
      status: "planning",
      complexity: "medium",
      tags: ["kimono", "embroidery", "accessories"],
    },
    {
      id: 3,
      name: "V's Street Outfit",
      character: "V (Female)",
      image: "/cyberpunk-character-neon-jacket.jpg",
      progress: 10,
      pieces: { completed: 1, total: 5 },
      status: "planning",
      complexity: "low",
      tags: ["modern", "leather", "tech"],
    },
    {
      id: 4,
      name: "Ciri's Witcher Gear",
      character: "Ciri",
      image: "/fantasy-warrior-white-hair-sword.jpg",
      progress: 100,
      pieces: { completed: 7, total: 7 },
      status: "completed",
      complexity: "medium",
      tags: ["leather", "armor", "fabric"],
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

  let viewMode = $state<"grid" | "list">("grid");
  let filters = $state({
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
  <title>Outfits - Cosplay Tracker</title>
</svelte:head>

<!-- Page Header Actions -->
<div class="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="flex items-center gap-4">
    <h1 class="font-semibold">Outfits</h1>
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

<div class="p-6">
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">Outfits</h1>
    <p class="text-pretty text-muted-foreground">
      {outfits.length} complete outfit sets across all characters
    </p>
  </div>

  {#if viewMode === "grid"}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each outfits as outfit (outfit.id)}
        <div class="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg">
          <div class="relative aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={outfit.image || "/placeholder.svg"}
              alt={outfit.name}
              class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div class="absolute right-2 top-2 flex gap-2">
              <Badge class={complexityColors[outfit.complexity]} variant="secondary">
                {outfit.complexity}
              </Badge>
            </div>
          </div>
          <div class="p-4">
            <h3 class="mb-1 line-clamp-1 font-semibold leading-snug">{outfit.name}</h3>
            <p class="mb-3 text-sm text-muted-foreground">{outfit.character}</p>

            <div class="mb-3 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Progress</span>
                <span class="font-medium">{outfit.progress}%</span>
              </div>
              <Progress value={outfit.progress} class="h-2" />
              <div class="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {outfit.pieces.completed} of {outfit.pieces.total} pieces
                </span>
                <Badge class={statusColors[outfit.status]} variant="secondary">
                  {outfit.status.replace("-", " ")}
                </Badge>
              </div>
            </div>

            <div class="flex flex-wrap gap-1.5">
              {#each outfit.tags.slice(0, 3) as tag}
                <Badge variant="outline" class="text-xs">
                  {tag}
                </Badge>
              {/each}
              {#if outfit.tags.length > 3}
                <Badge variant="outline" class="text-xs">
                  +{outfit.tags.length - 3}
                </Badge>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="space-y-4">
      {#each outfits as outfit (outfit.id)}
        <div class="flex gap-4 overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-lg">
          <div class="relative size-32 shrink-0 overflow-hidden rounded-lg bg-muted">
            <img
              src={outfit.image || "/placeholder.svg"}
              alt={outfit.name}
              class="size-full object-cover"
            />
          </div>
          <div class="flex flex-1 flex-col gap-3">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="font-semibold leading-snug">{outfit.name}</h3>
                <p class="text-sm text-muted-foreground">{outfit.character}</p>
              </div>
              <div class="flex gap-2">
                <Badge class={complexityColors[outfit.complexity]} variant="secondary">
                  {outfit.complexity}
                </Badge>
                <Badge class={statusColors[outfit.status]} variant="secondary">
                  {outfit.status.replace("-", " ")}
                </Badge>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">
                  {outfit.pieces.completed} of {outfit.pieces.total} pieces completed
                </span>
                <span class="font-medium">{outfit.progress}%</span>
              </div>
              <Progress value={outfit.progress} class="h-2" />
            </div>

            <div class="flex flex-wrap gap-1.5">
              {#each outfit.tags as tag}
                <Badge variant="outline" class="text-xs">
                  {tag}
                </Badge>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>