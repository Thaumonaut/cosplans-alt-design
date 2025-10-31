<script lang="ts">
  import type { PageData } from './$types';
  import CreationFlyout from "$lib/components/creation-flyout.svelte";
  import PageHeader from "$lib/components/page-header.svelte";
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
  import { projectService } from '$lib/api/services/projectService';
  import { onMount } from 'svelte';

  let { data }: { data: PageData } = $props();

  // Dashboard state using Svelte 5 runes
  let creationOpen = $state(false);
  let projects = $state(data.projects || []);
  let loading = $state(false);

  // Calculate stats from real data
  const activeProjectsCount = $derived(projects.filter(p => p.status !== 'completed' && p.status !== 'archived').length);
  const upcomingEventsCount = $derived(data.events?.length || 0);
  const tasksDueSoonCount = $derived(data.tasks?.filter(t => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length || 0);
  
  // Calculate total budget from projects
  const totalBudget = $derived.by(() => {
    const total = projects.reduce((sum, p) => {
      const budget = typeof p.budget === 'object' && p.budget !== null 
        ? (p.budget as any).total || 0
        : 0;
      return sum + budget;
    }, 0);
    return `$${total.toLocaleString()}`;
  });

  // Notifications from events and projects
  const notifications = $derived.by(() => {
    const notifs: Array<{ title: string; description: string }> = [];
    
    // Add event notifications
    data.events?.slice(0, 2).forEach(event => {
      notifs.push({
        title: event.title || 'Upcoming Event',
        description: event.description || `Event on ${new Date(event.date).toLocaleDateString()}`
      });
    });

    // Add budget alerts
    projects.forEach(project => {
      const budget = typeof project.budget === 'object' && project.budget !== null 
        ? project.budget as { spent?: number; total?: number }
        : null;
      if (budget?.total && budget?.spent) {
        const percentage = (budget.spent / budget.total) * 100;
        if (percentage >= 80) {
          notifs.push({
            title: "Budget alert",
            description: `${project.title || 'Project'} is ${Math.round(percentage)}% of budget`
          });
        }
      }
    });

    return notifs.slice(0, 2); // Limit to 2 notifications
  });

  // Load projects from database if not loaded
  onMount(async () => {
    if (projects.length === 0 && !loading) {
      try {
        loading = true;
        const dbProjects = await projectService.list({ status: undefined });
        projects = dbProjects.slice(0, 6); // Show top 6 projects
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        loading = false;
      }
    }
  });
</script>

<svelte:head>
  <title>Dashboard - Cosplay Tracker</title>
</svelte:head>

<PageHeader 
  searchPlaceholder="Search projects, characters, events..."
  {notifications}
>
  {#snippet children()}
    <Button size="icon" onclick={() => (creationOpen = true)}>
      <Plus class="size-5" />
    </Button>
  {/snippet}
</PageHeader>

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
        value={activeProjectsCount}
      >
        {#snippet icon()}
          <Folder class="size-6" />
        {/snippet}
      </StatCard>
      <StatCard title="Upcoming Events" value={upcomingEventsCount}>
        {#snippet icon()}
          <Calendar class="size-6" />
        {/snippet}
      </StatCard>
      <StatCard
        title="Tasks Due Soon"
        value={tasksDueSoonCount}
      >
        {#snippet icon()}
          <CheckSquare class="size-6" />
        {/snippet}
      </StatCard>
      <StatCard title="Total Budget" value={totalBudget}>
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
          {#if loading}
            <div class="col-span-2 text-center py-8 text-muted-foreground">Loading projects...</div>
          {:else if projects.length === 0}
            <div class="col-span-2 text-center py-8 text-muted-foreground">No projects yet. Create your first project to get started!</div>
          {:else}
            {#each projects.slice(0, 4) as project (project.id)}
              <ProjectCard {...project} />
            {/each}
          {/if}
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
