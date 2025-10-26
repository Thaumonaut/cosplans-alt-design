<script lang="ts">
  import { Filter } from 'lucide-svelte';
  import { Button } from '$lib/components/ui';
  import PlanningCard from '$lib/components/planning-card.svelte';

  interface PlanningProject {
    id: number;
    character: string;
    series: string;
    image: string;
    budget: { allocated: number; spent: number };
    timeline: {
      startDate: string;
      targetDate: string;
      daysRemaining: number;
    };
    tasks: {
      total: number;
      completed: number;
    };
    materials: {
      ordered: number;
      pending: number;
    };
    priority: 'low' | 'medium' | 'high';
  }

  const planningProjects: PlanningProject[] = [
    {
      id: 1,
      character: "Raiden Shogun",
      series: "Genshin Impact",
      image: "/anime-character-purple-kimono.jpg",
      budget: { allocated: 600, spent: 200 },
      timeline: {
        startDate: "2025-03-01",
        targetDate: "2025-05-20",
        daysRemaining: 80,
      },
      tasks: {
        total: 24,
        completed: 8,
      },
      materials: {
        ordered: 5,
        pending: 3,
      },
      priority: "high",
    },
    {
      id: 2,
      character: "V (Female)",
      series: "Cyberpunk 2077",
      image: "/cyberpunk-character-neon-jacket.jpg",
      budget: { allocated: 500, spent: 50 },
      timeline: {
        startDate: "2025-02-15",
        targetDate: "2025-04-15",
        daysRemaining: 50,
      },
      tasks: {
        total: 18,
        completed: 2,
      },
      materials: {
        ordered: 2,
        pending: 5,
      },
      priority: "medium",
    },
  ];

  let selectedPriority = $state<string>("all");
</script>

<svelte:head>
  <title>Planning - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-balance text-3xl font-bold leading-tight">Planning Phase</h1>
      <p class="text-pretty text-muted-foreground">
        {planningProjects.length} projects in active planning with detailed breakdowns
      </p>
    </div>
    <Button variant="outline" size="icon">
      <Filter class="size-5" />
    </Button>
  </div>

  <div class="mb-6 flex items-center justify-between">
    <div class="flex gap-2">
      <Button 
        variant={selectedPriority === "all" ? "outline" : "ghost"} 
        size="sm"
        onclick={() => selectedPriority = "all"}
      >
        All Projects
      </Button>
      <Button 
        variant={selectedPriority === "high" ? "outline" : "ghost"} 
        size="sm"
        onclick={() => selectedPriority = "high"}
      >
        High Priority
      </Button>
      <Button 
        variant={selectedPriority === "medium" ? "outline" : "ghost"} 
        size="sm"
        onclick={() => selectedPriority = "medium"}
      >
        Medium Priority
      </Button>
      <Button 
        variant={selectedPriority === "low" ? "outline" : "ghost"} 
        size="sm"
        onclick={() => selectedPriority = "low"}
      >
        Low Priority
      </Button>
    </div>
  </div>

  <div class="space-y-6">
    {#each planningProjects as project (project.id)}
      {#if selectedPriority === "all" || project.priority === selectedPriority}
        <PlanningCard {...project} />
      {/if}
    {/each}
  </div>
</div>