<script lang="ts">
  import { Plus, Filter, Grid3x3, List } from 'lucide-svelte';
  import { Button, Badge, DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '$lib/components/ui';
  import CreationFlyout from '$lib/components/creation-flyout.svelte';
  import CharacterCreationForm from '$lib/components/character-creation-form.svelte';

  interface Character {
    id: number;
    name: string;
    series: string;
    image: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    tags: string[];
    status: 'idea' | 'planning' | 'in-progress' | 'completed';
    usedInProjects: number;
  }

  const characters: Character[] = [
    {
      id: 1,
      name: "Malenia, Blade of Miquella",
      series: "Elden Ring",
      image: "/fantasy-warrior-armor-red-hair.jpg",
      difficulty: "expert",
      tags: ["armor", "fantasy", "warrior", "prosthetic"],
      status: "in-progress",
      usedInProjects: 1,
    },
    {
      id: 2,
      name: "Raiden Shogun",
      series: "Genshin Impact",
      image: "/anime-character-purple-kimono.jpg",
      difficulty: "hard",
      tags: ["kimono", "anime", "electro", "archon"],
      status: "planning",
      usedInProjects: 1,
    },
    {
      id: 3,
      name: "V (Female)",
      series: "Cyberpunk 2077",
      image: "/cyberpunk-character-neon-jacket.jpg",
      difficulty: "medium",
      tags: ["cyberpunk", "modern", "tech", "jacket"],
      status: "idea",
      usedInProjects: 1,
    },
    {
      id: 4,
      name: "Ciri",
      series: "The Witcher 3",
      image: "/fantasy-warrior-white-hair-sword.jpg",
      difficulty: "hard",
      tags: ["fantasy", "warrior", "leather", "sword"],
      status: "completed",
      usedInProjects: 1,
    },
    {
      id: 5,
      name: "Jinx",
      series: "Arcane / League of Legends",
      image: "/jinx-arcane-blue-hair-twin-braids.jpg",
      difficulty: "medium",
      tags: ["anime", "punk", "blue-hair", "weapons"],
      status: "idea",
      usedInProjects: 0,
    },
  ];

  const difficultyColors = {
    easy: "bg-green-500/10 text-green-700 dark:text-green-400",
    medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    hard: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    expert: "bg-red-500/10 text-red-700 dark:text-red-400",
  };

  const statusColors = {
    idea: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    planning: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "in-progress": "bg-primary/10 text-primary",
    completed: "bg-green-500/10 text-green-700 dark:text-green-400",
  };

  let creationOpen = $state(false);
  let viewMode = $state<"grid" | "list">("grid");
  let filters = $state({
    difficulty: [] as string[],
    status: [] as string[],
    series: [] as string[],
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
  <title>Characters - Cosplay Tracker</title>
</svelte:head>

<!-- Page Header Actions -->
<div class="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="flex items-center gap-4">
    <h1 class="font-semibold">Characters</h1>
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
        <DropdownMenuLabel>Difficulty</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {#each ["easy", "medium", "hard", "expert"] as difficulty}
          <DropdownMenuItem 
            class="capitalize cursor-pointer"
            onclick={() => toggleFilter("difficulty", difficulty)}
          >
            <input 
              type="checkbox" 
              checked={filters.difficulty.includes(difficulty)}
              class="mr-2"
              readonly
            />
            {difficulty}
          </DropdownMenuItem>
        {/each}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {#each ["idea", "planning", "in-progress", "completed"] as status}
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
    
    <Button size="icon" onclick={() => creationOpen = true}>
      <Plus class="size-5" />
    </Button>
  </div>
</div>

<div class="p-6">
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">Characters</h1>
    <p class="text-pretty text-muted-foreground">
      {characters.length} characters in your library across all projects
    </p>
  </div>

  <!-- Characters Grid/List View -->
  {#if viewMode === "grid"}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each characters as character (character.id)}
        <div class="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg">
          <div class="relative aspect-[3/4] overflow-hidden bg-muted">
            <img
              src={character.image || "/placeholder.svg"}
              alt={character.name}
              class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div class="absolute right-2 top-2 flex gap-2">
              <Badge class={difficultyColors[character.difficulty]} variant="secondary">
                {character.difficulty}
              </Badge>
            </div>
          </div>
          <div class="p-4">
            <h3 class="mb-1 line-clamp-1 font-semibold leading-snug">{character.name}</h3>
            <p class="mb-3 text-sm text-muted-foreground">{character.series}</p>
            <div class="mb-3 flex flex-wrap gap-1.5">
              {#each character.tags.slice(0, 3) as tag}
                <Badge variant="outline" class="text-xs">
                  {tag}
                </Badge>
              {/each}
              {#if character.tags.length > 3}
                <Badge variant="outline" class="text-xs">
                  +{character.tags.length - 3}
                </Badge>
              {/if}
            </div>
            <div class="flex items-center justify-between">
              <Badge class={statusColors[character.status]} variant="secondary">
                {character.status.replace("-", " ")}
              </Badge>
              <span class="text-xs text-muted-foreground">
                {character.usedInProjects} {character.usedInProjects === 1 ? "project" : "projects"}
              </span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="space-y-4">
      {#each characters as character (character.id)}
        <div class="flex gap-4 overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-lg">
          <div class="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
            <img
              src={character.image || "/placeholder.svg"}
              alt={character.name}
              class="size-full object-cover"
            />
          </div>
          <div class="flex flex-1 flex-col justify-between">
            <div>
              <div class="mb-1 flex items-start justify-between gap-4">
                <div>
                  <h3 class="font-semibold leading-snug">{character.name}</h3>
                  <p class="text-sm text-muted-foreground">{character.series}</p>
                </div>
                <div class="flex gap-2">
                  <Badge class={difficultyColors[character.difficulty]} variant="secondary">
                    {character.difficulty}
                  </Badge>
                  <Badge class={statusColors[character.status]} variant="secondary">
                    {character.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex flex-wrap gap-1.5">
                {#each character.tags as tag}
                  <Badge variant="outline" class="text-xs">
                    {tag}
                  </Badge>
                {/each}
              </div>
              <span class="text-xs text-muted-foreground">
                {character.usedInProjects} {character.usedInProjects === 1 ? "project" : "projects"}
              </span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<CreationFlyout bind:open={creationOpen} title="New Character">
  <CharacterCreationForm />
</CreationFlyout>