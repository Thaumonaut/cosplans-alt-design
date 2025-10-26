<script lang="ts">
  import { Grid3x3, List, Plus, Upload } from 'lucide-svelte';
  import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '$lib/components/ui';

  interface Idea {
    id: number;
    character: string;
    series: string;
    image: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedCost: number;
    estimatedTime: string;
    tags: string[];
    notes: string;
    inspiration: string[];
    dateAdded: string;
  }

  const ideas: Idea[] = [
    {
      id: 1,
      character: "Malenia, Blade of Miquella",
      series: "Elden Ring",
      image: "/fantasy-warrior-armor-red-hair.jpg",
      difficulty: "hard",
      estimatedCost: 800,
      estimatedTime: "3-4 months",
      tags: ["armor", "fantasy", "prosthetic"],
      notes: "Complex armor build with prosthetic arm. Need to research EVA foam techniques.",
      inspiration: ["Pinterest board", "Cosplay tutorial by XYZ"],
      dateAdded: "2025-01-15",
    },
    {
      id: 2,
      character: "Raiden Shogun",
      series: "Genshin Impact",
      image: "/anime-character-purple-kimono.jpg",
      difficulty: "medium",
      estimatedCost: 600,
      estimatedTime: "2-3 months",
      tags: ["kimono", "anime", "wig styling"],
      notes: "Beautiful kimono design. Focus on fabric choice and embroidery details.",
      inspiration: ["Official art", "Cosplay reference photos"],
      dateAdded: "2025-01-20",
    },
    {
      id: 3,
      character: "V (Female)",
      series: "Cyberpunk 2077",
      image: "/cyberpunk-character-neon-jacket.jpg",
      difficulty: "easy",
      estimatedCost: 500,
      estimatedTime: "1-2 months",
      tags: ["cyberpunk", "modern", "LED"],
      notes: "Mostly clothing-based. Could add LED accents for extra flair.",
      inspiration: ["Game screenshots", "Cyberpunk fashion"],
      dateAdded: "2025-02-01",
    },
    {
      id: 4,
      character: "Jinx",
      series: "Arcane / League of Legends",
      image: "/jinx-arcane-blue-hair-twin-braids.jpg",
      difficulty: "medium",
      estimatedCost: 450,
      estimatedTime: "2 months",
      tags: ["anime", "wig styling", "props"],
      notes: "Love the character development in Arcane. Need to make Pow-Pow and Fishbones.",
      inspiration: ["Arcane series", "LoL splash art"],
      dateAdded: "2025-02-10",
    },
  ];

  const difficultyColors = {
    easy: "bg-green-500/10 text-green-700 dark:text-green-400",
    medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    hard: "bg-red-500/10 text-red-700 dark:text-red-400",
  };

  let viewMode = $state<"grid" | "list">("grid");
</script>

<svelte:head>
  <title>Ideas - Cosplay Tracker</title>
</svelte:head>

<!-- Page Header Actions -->
<div class="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="flex items-center gap-4">
    <h1 class="font-semibold">Cosplay Ideas</h1>
  </div>
  
  <div class="flex items-center gap-2">
    <Button variant="ghost" size="icon">
      <Upload class="size-5" />
    </Button>
    <Button size="icon">
      <Plus class="size-5" />
    </Button>
  </div>
</div>

<div class="p-6">
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">Cosplay Ideas</h1>
    <p class="text-pretty text-muted-foreground">
      Your inspiration board with {ideas.length} ideas waiting to come to life
    </p>
  </div>

  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <Button variant="outline" size="sm">
          All Ideas
        </Button>
        <Button variant="ghost" size="sm">
          Easy
        </Button>
        <Button variant="ghost" size="sm">
          Medium
        </Button>
        <Button variant="ghost" size="sm">
          Hard
        </Button>
      </div>
      <div class="flex gap-2">
        <Button 
          variant={viewMode === "grid" ? "default" : "outline"} 
          size="sm"
          onclick={() => viewMode = "grid"}
        >
          <Grid3x3 class="size-4" />
        </Button>
        <Button 
          variant={viewMode === "list" ? "default" : "outline"} 
          size="sm"
          onclick={() => viewMode = "list"}
        >
          <List class="size-4" />
        </Button>
      </div>
    </div>

    {#if viewMode === "grid"}
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each ideas as idea (idea.id)}
          <Card class="group overflow-hidden transition-all hover:shadow-lg">
            <div class="relative aspect-[3/4] overflow-hidden bg-muted">
              <img
                src={idea.image || "/placeholder.svg"}
                alt={idea.character}
                class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div class="absolute right-2 top-2">
                <Badge class={difficultyColors[idea.difficulty]} variant="secondary">
                  {idea.difficulty}
                </Badge>
              </div>
            </div>
            <CardContent class="p-4">
              <h3 class="mb-1 line-clamp-1 font-semibold leading-snug">{idea.character}</h3>
              <p class="mb-3 text-sm text-muted-foreground">{idea.series}</p>
              
              <div class="mb-3 space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Est. Cost</span>
                  <span class="font-medium">${idea.estimatedCost}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Est. Time</span>
                  <span class="font-medium">{idea.estimatedTime}</span>
                </div>
              </div>

              <div class="mb-3 flex flex-wrap gap-1">
                {#each idea.tags.slice(0, 3) as tag}
                  <Badge variant="outline" class="text-xs">
                    {tag}
                  </Badge>
                {/each}
                {#if idea.tags.length > 3}
                  <Badge variant="outline" class="text-xs">
                    +{idea.tags.length - 3}
                  </Badge>
                {/if}
              </div>

              <p class="text-xs text-muted-foreground line-clamp-2">{idea.notes}</p>
            </CardContent>
          </Card>
        {/each}
      </div>
    {:else}
      <div class="space-y-4">
        {#each ideas as idea (idea.id)}
          <Card class="transition-all hover:shadow-lg">
            <CardContent class="flex gap-4 p-4">
              <div class="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img
                  src={idea.image || "/placeholder.svg"}
                  alt={idea.character}
                  class="size-full object-cover"
                />
              </div>
              <div class="flex flex-1 flex-col gap-2">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h3 class="font-semibold leading-snug">{idea.character}</h3>
                    <p class="text-sm text-muted-foreground">{idea.series}</p>
                  </div>
                  <Badge class={difficultyColors[idea.difficulty]} variant="secondary">
                    {idea.difficulty}
                  </Badge>
                </div>
                
                <div class="flex items-center gap-4 text-sm">
                  <span class="text-muted-foreground">Cost: <span class="font-medium">${idea.estimatedCost}</span></span>
                  <span class="text-muted-foreground">Time: <span class="font-medium">{idea.estimatedTime}</span></span>
                </div>

                <div class="flex flex-wrap gap-1">
                  {#each idea.tags as tag}
                    <Badge variant="outline" class="text-xs">
                      {tag}
                    </Badge>
                  {/each}
                </div>

                <p class="text-sm text-muted-foreground line-clamp-2">{idea.notes}</p>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    {/if}
  </div>
</div>