<script lang="ts">
  import { BarChart3, ChevronLeft, ChevronRight, Filter } from 'lucide-svelte';
  import { Button, Card, Badge, Progress, Select } from '$lib/components/ui';
  import { onMount } from 'svelte';
  import { projectService } from '$lib/api/services/projectService';
  import { photoshootService } from '$lib/api/services/photoshootService';
  import { taskService } from '$lib/api/services/taskService';
  import { currentTeam } from '$lib/stores/teams';
  import { get } from 'svelte/store';
  import type { Project as DomainProject } from '$lib/types/domain/project';
  import type { Task as DomainTask } from '$lib/types/domain/task';
  import type { Photoshoot } from '$lib/types/domain/photoshoot';

  interface TimelineProject {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    progress: number;
    status: string;
    color: string;
    tasks: Array<{
      name: string;
      start: string;
      end: string;
      progress: number;
    }>;
  }

  interface TimelineEvent {
    name: string;
    date: string;
    type: string;
    color: string;
  }

  let projects = $state<TimelineProject[]>([]);
  let events = $state<TimelineEvent[]>([]);
  let loading = $state(true);

  let currentDate = $state(new Date());
  let viewMode = $state<"projects" | "tasks">("projects");
  let expandedProjects = $state<string[]>([]);

  // Color mapping based on project index
  const projectColors = [
    "bg-primary",
    "bg-purple-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-pink-500",
  ];

  async function loadTimelineData() {
    try {
      loading = true;
      const team = get(currentTeam);
      if (!team) {
        projects = [];
        events = [];
        return;
      }

      const [dbProjects, dbPhotoshoots] = await Promise.all([
        projectService.list(),
        photoshootService.list(),
      ]);

      // Transform projects to timeline format
      projects = dbProjects.map((project, index) => {
        // Get tasks for this project
        let projectTasks: DomainTask[] = [];
        
        // Calculate start date from created_at, end date from deadline or current date
        const startDate = project.createdAt ? new Date(project.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const endDate = project.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now if no deadline

        return {
          id: project.id,
          name: `${project.character}${project.series ? ` - ${project.series}` : ''}`,
          startDate,
          endDate,
          progress: project.progress,
          status: project.status,
          color: projectColors[index % projectColors.length],
          tasks: projectTasks.map(task => {
            const dueDate = task.dueDate instanceof Date ? task.dueDate : (typeof task.dueDate === 'string' ? new Date(task.dueDate) : null);
            return {
              name: task.title,
              start: dueDate ? new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : startDate, // 7 days before due date
              end: dueDate ? dueDate.toISOString().split('T')[0] : endDate,
              progress: task.completed ? 100 : 0,
            };
          }),
        };
      });

      // Transform photoshoots to events
      events = dbPhotoshoots
        .filter(p => p.date)
        .map(photoshoot => ({
          name: photoshoot.title,
          date: photoshoot.date!,
          type: photoshoot.status === 'completed' ? 'past-photoshoot' : 'photoshoot',
          color: photoshoot.status === 'completed' ? 'bg-gray-500' : 'bg-pink-500',
        }));

      // Expand first 2 projects by default
      if (projects.length > 0) {
        expandedProjects = projects.slice(0, 2).map(p => p.id);
      }
    } catch (error) {
      console.error('Failed to load timeline data:', error);
      projects = [];
      events = [];
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadTimelineData();
    
    const unsubscribe = currentTeam.subscribe(() => {
      loadTimelineData();
    });
    
    return unsubscribe;
  });

  const monthName = $derived(currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }));

  function goToPreviousMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  }

  function goToNextMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  function toggleProject(projectId: string) {
    if (expandedProjects.includes(projectId)) {
      expandedProjects = expandedProjects.filter((id) => id !== projectId);
    } else {
      expandedProjects = [...expandedProjects, projectId];
    }
  }

  // Calculate timeline grid
  const startOfMonth = $derived(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  const endOfMonth = $derived(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
  const daysInMonth = $derived(endOfMonth.getDate());

  function getBarPosition(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthStart = startOfMonth.getTime();
    const monthEnd = endOfMonth.getTime();
    const monthDuration = monthEnd - monthStart;

    const barStart = Math.max(0, (start.getTime() - monthStart) / monthDuration);
    const barEnd = Math.min(1, (end.getTime() - monthStart) / monthDuration);
    const barWidth = barEnd - barStart;

    return {
      left: `${barStart * 100}%`,
      width: `${barWidth * 100}%`,
    };
  }

  function getEventPosition(date: string) {
    const eventDate = new Date(date);
    const monthStart = startOfMonth.getTime();
    const monthEnd = endOfMonth.getTime();
    const monthDuration = monthEnd - monthStart;

    const position = (eventDate.getTime() - monthStart) / monthDuration;

    return {
      left: `${position * 100}%`,
    };
  }
</script>

<svelte:head>
  <title>Timeline - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <div class="mb-6 space-y-4">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-balance text-3xl font-bold leading-tight">Timeline</h1>
        <p class="text-pretty text-muted-foreground">
          Gantt chart view of all projects, tasks, and deadlines
        </p>
      </div>
      <div class="flex items-center gap-2">
        <select 
          bind:value={viewMode} 
          class="w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="projects">Projects</option>
          <option value="tasks">Tasks</option>
        </select>
        <Button variant="outline" size="icon" onclick={goToPreviousMonth}>
          <ChevronLeft class="size-4" />
        </Button>
        <div class="min-w-[140px] text-center text-sm font-medium">{monthName}</div>
        <Button variant="outline" size="icon" onclick={goToNextMonth}>
          <ChevronRight class="size-4" />
        </Button>
      </div>
    </div>

    <Card class="overflow-hidden">
      <!-- Timeline Header -->
      <div class="flex border-b bg-muted/50">
        <div class="w-64 shrink-0 border-r p-4">
          <h3 class="font-semibold">Project / Task</h3>
        </div>
        <div class="relative flex-1 p-4">
          <div class="flex justify-between text-xs text-muted-foreground">
            {#each Array(daysInMonth).fill(0) as _, i}
              {@const day = i + 1}
              {#if day === 1 || day === 10 || day === 20 || day === daysInMonth}
                <div class="text-center">
                  {day}
                </div>
              {/if}
            {/each}
          </div>
        </div>
      </div>

      <!-- Timeline Content -->
      {#if loading}
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p class="text-sm text-muted-foreground">Loading timeline...</p>
          </div>
        </div>
      {:else if projects.length === 0 && events.length === 0}
        <div class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16">
          <p class="mb-2 text-lg font-medium text-muted-foreground">No timeline data</p>
          <p class="text-center text-sm text-muted-foreground max-w-md">
            Create projects and photoshoots to see them on the timeline.
          </p>
        </div>
      {:else}
        <div class="divide-y">
          {#each projects as project (project.id)}
            {@const isExpanded = expandedProjects.includes(project.id)}
            {@const barPosition = getBarPosition(project.startDate, project.endDate)}

          <div>
            <!-- Project Row -->
            <div class="flex hover:bg-muted/50">
              <div class="w-64 shrink-0 border-r p-4">
                <button
                  onclick={() => toggleProject(project.id)}
                  class="flex w-full items-center gap-2 text-left"
                >
                  <BarChart3 class="size-4 shrink-0" />
                  <div class="flex-1 overflow-hidden">
                    <div class="truncate font-medium">{project.name}</div>
                    <div class="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{project.progress}% complete</span>
                      <Badge variant="outline" class="text-xs">
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                </button>
              </div>
              <div class="relative flex-1 p-4">
                <div
                  class="absolute top-1/2 h-8 -translate-y-1/2 rounded {project.color} flex items-center px-2"
                  style="left: {barPosition.left}; width: {barPosition.width}"
                >
                  <div class="w-full overflow-hidden">
                    <Progress value={project.progress} class="h-1 bg-white/20" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Task Rows -->
            {#if isExpanded && viewMode === "tasks"}
              {#each project.tasks as task, taskIndex}
                {@const taskBarPosition = getBarPosition(task.start, task.end)}
                <div class="flex bg-muted/20 hover:bg-muted/40">
                  <div class="w-64 shrink-0 border-r p-4 pl-12">
                    <div class="text-sm">{task.name}</div>
                    <div class="text-xs text-muted-foreground">{task.progress}%</div>
                  </div>
                  <div class="relative flex-1 p-4">
                    <div
                      class="absolute top-1/2 h-6 -translate-y-1/2 rounded bg-muted-foreground/60"
                      style="left: {taskBarPosition.left}; width: {taskBarPosition.width}"
                    >
                      <Progress value={task.progress} class="h-full bg-white/20" />
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        {/each}

        <!-- Events Row -->
        <div class="flex bg-background">
          <div class="w-64 shrink-0 border-r p-4">
            <div class="font-medium">Events & Deadlines</div>
            <div class="text-xs text-muted-foreground">{events.length} scheduled</div>
          </div>
          <div class="relative flex-1 p-4">
            {#each events as event, index}
              {@const eventPosition = getEventPosition(event.date)}
              <div
                class="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full {event.color}"
                style="left: {eventPosition.left}"
                title={event.name}
              ></div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
    </Card>

    <!-- Legend -->
    <div class="flex flex-wrap gap-4 text-sm">
      <div class="flex items-center gap-2">
        <div class="size-3 rounded bg-primary"></div>
        <span>In Progress</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="size-3 rounded bg-muted-foreground/60"></div>
        <span>Tasks</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="size-3 rounded-full bg-amber-500"></div>
        <span>Conventions</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="size-3 rounded-full bg-pink-500"></div>
        <span>Photoshoots</span>
      </div>
    </div>
  </div>
</div>