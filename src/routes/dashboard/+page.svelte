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
  import CharacterCreationForm from "$lib/components/character-creation-form.svelte";
  import {
    projects,
    projectStats,
    activeProjects,
    taskStats,
    eventStats,
  } from "$lib/stores";

  // Dashboard state using Svelte 5 runes
  let creationOpen = $state(false);
</script>

<svelte:head>
  <title>Dashboard - Cosplay Tracker</title>
</svelte:head>

<!-- Page Header Actions -->
<div
  class="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
  <div class="flex items-center gap-4">
    <h1 class="font-semibold">Dashboard</h1>
  </div>

  <div class="flex items-center gap-2">
    <Button size="sm" onclick={() => (creationOpen = true)}>
      <Plus class="size-4 mr-2" />
      New Project
    </Button>
  </div>
</div>

<div class="p-6">
  <div class="mb-8 space-y-6">
    <div>
      <h1 class="text-balance text-3xl font-bold leading-tight">
        Welcome back, Cosplayer!
      </h1>
      <p class="text-pretty text-muted-foreground">
        Here's an overview of your cosplay projects and upcoming events
      </p>
    </div>

    <!-- Stats Cards -->
    <!-- <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Projects"
        value={$projectStats.inProgress}
        change={{ value: $projectStats.completionRate, trend: "up" }}
      >
        {#snippet icon()}
          <Folder class="size-6" />
        {/snippet}
      </StatCard>
      <StatCard title="Upcoming Events" value={$eventStats.upcoming}>
        {#snippet icon()}
          <Calendar class="size-6" />
        {/snippet}
      </StatCard>
      <StatCard
        title="Tasks Due Soon"
        value={$taskStats.overdue}
        change={{ value: $taskStats.pending, trend: "down" }}
      >
        {#snippet icon()}
          <CheckSquare class="size-6" />
        {/snippet}
      </StatCard>
      <StatCard title="Total Projects" value={$projectStats.total}>
        {#snippet icon()}
          <DollarSign class="size-6" />
        {/snippet}
      </StatCard>
    </div> -->
  </div>

  <div class="grid gap-6 lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2">
      <div>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold">Current Projects</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          {#each $projects as project (project.id)}
            <ProjectCard {...project} />
          {/each}
        </div>
      </div>

      <UpcomingEventsWidget />
    </div>

    <div class="space-y-6">
      <TasksWidget />
      <BudgetWidget />
      <RecentActivityWidget />
    </div>
  </div>
</div>

<CreationFlyout bind:open={creationOpen} title="New Character">
  <CharacterCreationForm />
</CreationFlyout>
