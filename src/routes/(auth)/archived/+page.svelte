<script lang="ts">
  import { Archive } from 'lucide-svelte';
  import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Badge } from '$lib/components/ui';

  interface ArchivedProject {
    id: number;
    title: string;
    character: string;
    series: string;
    image: string;
    progress: number;
    budget: { spent: number; total: number };
    status: 'completed';
  }

  const archivedProjects: ArchivedProject[] = [
    {
      id: 1,
      title: "The Witcher",
      character: "Ciri",
      series: "The Witcher 3",
      image: "/fantasy-warrior-white-hair-sword.jpg",
      progress: 100,
      budget: { spent: 650, total: 650 },
      status: "completed",
    },
  ];
</script>

<svelte:head>
  <title>Archived Projects - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <div class="mb-8">
    <div class="flex items-center gap-3">
      <Archive class="size-8 text-muted-foreground" />
      <div>
        <h1 class="text-balance text-3xl font-bold leading-tight">Archived Projects</h1>
        <p class="text-pretty text-muted-foreground">
          {archivedProjects.length} completed project in your archive
        </p>
      </div>
    </div>
  </div>

  <div class="mb-6 flex items-center justify-between">
    <div class="flex gap-2">
      <Button variant="outline" size="sm">
        All Archived
      </Button>
      <Button variant="ghost" size="sm">
        Completed
      </Button>
      <Button variant="ghost" size="sm">
        Cancelled
      </Button>
    </div>
  </div>

  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each archivedProjects as project (project.id)}
      <Card class="group overflow-hidden transition-all hover:shadow-lg">
        <div class="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={project.image || "/placeholder.svg"}
            alt={project.character}
            class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div class="absolute right-2 top-2">
            <Badge class="bg-green-500/10 text-green-700 dark:text-green-400" variant="secondary">
              {project.status}
            </Badge>
          </div>
        </div>
        <CardContent class="p-4">
          <h3 class="mb-1 line-clamp-1 font-semibold leading-snug">{project.character}</h3>
          <p class="mb-3 text-sm text-muted-foreground">{project.series}</p>
          
          <div class="mb-3 space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Progress</span>
              <span class="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} class="h-2" />
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Budget</span>
            <span class="font-medium">${project.budget.spent}</span>
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>
</div>