<script lang="ts">
  import { Camera } from 'lucide-svelte';
  import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Badge } from '$lib/components/ui';

  interface ActiveProject {
    id: number;
    character: string;
    series: string;
    image: string;
    progress: number;
    budget: { spent: number; total: number };
    deadline: string;
    currentPhase: string;
    recentUpdates: Array<{
      date: string;
      title: string;
      image: string;
    }>;
    nextMilestone: string;
    daysUntilDeadline: number;
  }

  const activeProjects: ActiveProject[] = [
    {
      id: 1,
      character: "Malenia, Blade of Miquella",
      series: "Elden Ring",
      image: "/fantasy-warrior-armor-red-hair.jpg",
      progress: 65,
      budget: { spent: 450, total: 800 },
      deadline: "2025-10-15",
      currentPhase: "Armor Construction",
      recentUpdates: [
        {
          date: "2025-02-20",
          title: "Completed chest plate",
          image: "/armor-chest-plate.jpg",
        },
        {
          date: "2025-02-18",
          title: "Started shoulder pieces",
          image: "/armor-shoulder.jpg",
        },
      ],
      nextMilestone: "Complete arm prosthetic",
      daysUntilDeadline: 235,
    },
  ];
</script>

<svelte:head>
  <title>In Progress - Cosplay Tracker</title>
</svelte:head>

<!-- Page Header Actions -->
<div class="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="flex items-center gap-4">
    <h1 class="font-semibold">In Progress</h1>
  </div>
  
  <div class="flex items-center gap-2">
    <Button variant="outline" size="icon">
      <Camera class="size-5" />
    </Button>
  </div>
</div>

<div class="p-6">
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">In Progress</h1>
    <p class="text-pretty text-muted-foreground">
      {activeProjects.length} active project with detailed progress tracking
    </p>
  </div>

  <div class="space-y-6">
    {#each activeProjects as project (project.id)}
      <Card class="overflow-hidden">
        <CardHeader>
          <div class="flex items-start justify-between">
            <div>
              <CardTitle class="text-xl">{project.character}</CardTitle>
              <p class="text-muted-foreground">{project.series}</p>
            </div>
            <Badge variant="secondary">{project.daysUntilDeadline} days left</Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="flex gap-6">
            <div class="relative size-32 shrink-0 overflow-hidden rounded-lg bg-muted">
              <img
                src={project.image || "/placeholder.svg"}
                alt={project.character}
                class="size-full object-cover"
              />
            </div>
            
            <div class="flex-1 space-y-4">
              <div>
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-sm font-medium">Overall Progress</span>
                  <span class="text-sm text-muted-foreground">{project.progress}%</span>
                </div>
                <Progress value={project.progress} class="h-3" />
              </div>

              <div>
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-sm font-medium">Budget Used</span>
                  <span class="text-sm text-muted-foreground">
                    ${project.budget.spent} / ${project.budget.total}
                  </span>
                </div>
                <Progress value={(project.budget.spent / project.budget.total) * 100} class="h-2" />
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <p class="text-sm text-muted-foreground">Current Phase</p>
                  <p class="font-medium">{project.currentPhase}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Next Milestone</p>
                  <p class="font-medium">{project.nextMilestone}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 class="mb-3 font-medium">Recent Updates</h4>
            <div class="grid gap-3 sm:grid-cols-2">
              {#each project.recentUpdates as update}
                <div class="flex gap-3 rounded-lg border p-3">
                  <div class="relative size-16 shrink-0 overflow-hidden rounded bg-muted">
                    <img
                      src={update.image || "/placeholder.svg"}
                      alt={update.title}
                      class="size-full object-cover"
                    />
                  </div>
                  <div>
                    <p class="font-medium">{update.title}</p>
                    <p class="text-sm text-muted-foreground">{new Date(update.date).toLocaleDateString()}</p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>
</div>