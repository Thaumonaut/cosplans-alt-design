<script lang="ts">
  import CreationFlyout from "$lib/components/creation-flyout.svelte";
  import { Button } from "$lib/components/ui";
  import {
    Plus,
    Folder,
    Calendar,
    CheckSquare,
    DollarSign,
  } from "lucide-svelte";
  import StatCard from "$lib/components/dashboard-stats.svelte";
  import ProjectCard from "$lib/components/project-card.svelte";
  import TasksWidget from "$lib/components/tasks-widget.svelte";
  import BudgetWidget from "$lib/components/budget-widget.svelte";
  import UpcomingEventsWidget from "$lib/components/upcoming-events-widget.svelte";
  import RecentActivityWidget from "$lib/components/recent-activity-widget.svelte";
  import ProjectCreationForm from "$lib/components/project-creation-form.svelte";

  // Dashboard state using Svelte 5 runes
  let creationOpen = $state(false);

  // Mock data matching the React design
  const projects = [
    {
      id: 1,
      title: "Elden Ring Cosplay",
      character: "Malenia, Blade of Miquella",
      series: "Elden Ring",
      image: "/fantasy-warrior-armor-red-hair.jpg",
      progress: 65,
      budget: { spent: 450, total: 800 },
      deadline: "Oct 15, 2025",
      status: "in-progress" as const,
    },
    {
      id: 2,
      title: "Genshin Impact",
      character: "Raiden Shogun",
      series: "Genshin Impact",
      image: "/anime-character-purple-kimono.jpg",
      progress: 30,
      budget: { spent: 200, total: 600 },
      deadline: "Nov 20, 2025",
      status: "planning" as const,
    },
    {
      id: 3,
      title: "Cyberpunk 2077",
      character: "V (Female)",
      series: "Cyberpunk 2077",
      image: "/cyberpunk-character-neon-jacket.jpg",
      progress: 10,
      budget: { spent: 50, total: 500 },
      status: "idea" as const,
    },
  ];

  const notifications = [
    {
      title: "Convention in 2 weeks",
      description: "Anime Expo 2025 - Don't forget to pack!",
    },
    {
      title: "Budget alert",
      description: "Malenia project is 80% of budget",
    },
  ];
</script>

<svelte:head>
  <title>Dashboard - Cosplay Tracker</title>
</svelte:head>



<!-- Page-specific header with action button -->
<div class="border-b bg-background px-6 py-4">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <p class="text-muted-foreground">Manage your cosplay projects and track progress</p>
    </div>
    <Button onclick={() => (creationOpen = true)}>
      <Plus class="mr-2 size-4" />
      New Project
    </Button>
  </div>
</div>

<div class="p-10">
  <div class="mb-12 space-y-10">
    <div class="space-y-4">
      <h1 class="text-balance text-5xl font-bold leading-tight tracking-tight">
        Welcome back, Cosplayer!
      </h1>
      <p class="text-pretty text-xl text-muted-foreground">
        Here's an overview of your cosplay projects and upcoming events
      </p>
    </div>

    <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Projects"
        value={3}
        change={{ value: 15, trend: "up" }}
      >
        {#snippet icon()}
          <Folder class="size-6" />
        {/snippet}
      </StatCard>
      <StatCard title="Upcoming Events" value={3}>
        {#snippet icon()}
          <Calendar class="size-6" />
        {/snippet}
      </StatCard>
      <StatCard
        title="Tasks Due Soon"
        value={5}
        change={{ value: 20, trend: "down" }}
      >
        {#snippet icon()}
          <CheckSquare class="size-6" />
        {/snippet}
      </StatCard>
      <StatCard title="Total Budget" value="$1,900">
        {#snippet icon()}
          <DollarSign class="size-6" />
        {/snippet}
      </StatCard>
    </div>
  </div>

  <div class="grid gap-10 lg:grid-cols-3">
    <div class="space-y-10 lg:col-span-2">
      <div>
        <div class="mb-8 flex items-center justify-between">
          <h2 class="text-3xl font-semibold tracking-tight">Current Projects</h2>
          <Button variant="ghost" size="sm" href="/projects">
            View All
          </Button>
        </div>
        <div class="grid gap-8 sm:grid-cols-2">
          {#each projects as project (project.id)}
            <ProjectCard {...project} />
          {/each}
        </div>
      </div>

      <UpcomingEventsWidget />
    </div>

    <div class="space-y-10">
      <TasksWidget />
      <BudgetWidget />
      <RecentActivityWidget />
    </div>
  </div>
</div>

<CreationFlyout bind:open={creationOpen} title="New Project">
  <ProjectCreationForm />
</CreationFlyout>
