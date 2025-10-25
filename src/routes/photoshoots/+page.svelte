<script lang="ts">
  import { Upload, Grid3x3, List, Camera, MapPin, User, Image } from 'lucide-svelte';
  import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress } from '$lib/components/ui';

  interface Photoshoot {
    id: number;
    title: string;
    character: string;
    series: string;
    date: string;
    location: string;
    photographer: string;
    photos: {
      total: number;
      edited: number;
      favorites: number;
    };
    coverImage: string;
    status: 'editing' | 'completed';
  }

  const photoshoots: Photoshoot[] = [
    {
      id: 1,
      title: "Elden Ring Forest Shoot",
      character: "Malenia, Blade of Miquella",
      series: "Elden Ring",
      date: "2025-01-20",
      location: "Redwood Forest Park",
      photographer: "Jane Photography",
      photos: {
        total: 120,
        edited: 45,
        favorites: 12,
      },
      coverImage: "/fantasy-warrior-armor-red-hair.jpg",
      status: "editing",
    },
    {
      id: 2,
      title: "Witcher Castle Photoshoot",
      character: "Ciri",
      series: "The Witcher 3",
      date: "2024-12-15",
      location: "Historic Castle Ruins",
      photographer: "Epic Cosplay Photos",
      photos: {
        total: 85,
        edited: 85,
        favorites: 20,
      },
      coverImage: "/fantasy-warrior-white-hair-sword.jpg",
      status: "completed",
    },
  ];

  const statusColors = {
    editing: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    completed: "bg-green-500/10 text-green-700 dark:text-green-400",
  };

  let viewMode = $state<"grid" | "list">("grid");
  let activeFilter = $state("all");
</script>

<svelte:head>
  <title>Photoshoots - Cosplay Tracker</title>
</svelte:head>

<!-- Page Header Actions -->
<div class="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="flex items-center gap-4">
    <h1 class="font-semibold">Photoshoots</h1>
  </div>
  
  <div class="flex items-center gap-2">
    <Button variant="outline" size="icon">
      <Upload class="size-5" />
    </Button>
  </div>
</div>

<div class="p-6">
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">Photoshoots</h1>
    <p class="text-pretty text-muted-foreground">
      Manage your cosplay photography sessions and photo galleries
    </p>
  </div>

  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <Button 
          variant={activeFilter === "all" ? "outline" : "ghost"} 
          size="sm"
          onclick={() => activeFilter = "all"}
        >
          All Shoots
        </Button>
        <Button 
          variant={activeFilter === "editing" ? "outline" : "ghost"} 
          size="sm"
          onclick={() => activeFilter = "editing"}
        >
          Editing
        </Button>
        <Button 
          variant={activeFilter === "completed" ? "outline" : "ghost"} 
          size="sm"
          onclick={() => activeFilter = "completed"}
        >
          Completed
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
        {#each photoshoots as shoot (shoot.id)}
          <Card class="group overflow-hidden transition-all hover:shadow-lg">
            <div class="relative aspect-video overflow-hidden bg-muted">
              <img
                src={shoot.coverImage || "/placeholder.svg"}
                alt={shoot.title}
                class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div class="absolute right-2 top-2">
                <Badge class={statusColors[shoot.status]} variant="secondary">
                  {shoot.status}
                </Badge>
              </div>
            </div>
            <CardContent class="p-4">
              <h3 class="mb-1 line-clamp-1 font-semibold leading-snug">{shoot.title}</h3>
              <p class="mb-2 text-sm text-muted-foreground">{shoot.character}</p>
              <p class="mb-3 text-xs text-muted-foreground">{shoot.series}</p>
              
              <div class="mb-3 space-y-2">
                <div class="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin class="size-3" />
                  <span>{shoot.location}</span>
                </div>
                <div class="flex items-center gap-1 text-xs text-muted-foreground">
                  <User class="size-3" />
                  <span>{shoot.photographer}</span>
                </div>
                <div class="flex items-center gap-1 text-xs text-muted-foreground">
                  <Camera class="size-3" />
                  <span>{new Date(shoot.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Editing Progress</span>
                  <span class="font-medium">{shoot.photos.edited} / {shoot.photos.total}</span>
                </div>
                <Progress value={(shoot.photos.edited / shoot.photos.total) * 100} class="h-2" />
                <div class="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{shoot.photos.favorites} favorites</span>
                  <span>{Math.round((shoot.photos.edited / shoot.photos.total) * 100)}% complete</span>
                </div>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    {:else}
      <div class="space-y-4">
        {#each photoshoots as shoot (shoot.id)}
          <Card class="transition-all hover:shadow-lg">
            <CardContent class="flex gap-4 p-4">
              <div class="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img
                  src={shoot.coverImage || "/placeholder.svg"}
                  alt={shoot.title}
                  class="size-full object-cover"
                />
              </div>
              <div class="flex flex-1 flex-col gap-2">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h3 class="font-semibold leading-snug">{shoot.title}</h3>
                    <p class="text-sm text-muted-foreground">{shoot.character} - {shoot.series}</p>
                  </div>
                  <Badge class={statusColors[shoot.status]} variant="secondary">
                    {shoot.status}
                  </Badge>
                </div>
                
                <div class="grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
                  <div class="flex items-center gap-1">
                    <MapPin class="size-3" />
                    <span>{shoot.location}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <User class="size-3" />
                    <span>{shoot.photographer}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Camera class="size-3" />
                    <span>{new Date(shoot.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">
                      {shoot.photos.edited} / {shoot.photos.total} edited • {shoot.photos.favorites} favorites
                    </span>
                    <span class="font-medium">{Math.round((shoot.photos.edited / shoot.photos.total) * 100)}%</span>
                  </div>
                  <Progress value={(shoot.photos.edited / shoot.photos.total) * 100} class="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    {/if}
  </div>
</div>