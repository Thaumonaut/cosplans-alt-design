<script lang="ts">
  import { BarChart3, ChevronLeft, ChevronRight, Filter } from 'lucide-svelte';
  import { Button, Card, Badge, Progress, Select } from '$lib/components/ui';

  interface Project {
    id: number;
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

  const projects: Project[] = [
    {
      id: 1,
      name: "Elden Ring - Malenia",
      startDate: "2025-09-15",
      endDate: "2025-10-15",
      progress: 85,
      status: "in-progress",
      color: "bg-primary",
      tasks: [
        { name: "Armor Patterning", start: "2025-09-15", end: "2025-09-25", progress: 100 },
        { name: "Foam Fabrication", start: "2025-09-26", end: "2025-10-05", progress: 100 },
        { name: "Painting & Weathering", start: "2025-10-06", end: "2025-10-12", progress: 90 },
        { name: "Final Assembly", start: "2025-10-10", end: "2025-10-15", progress: 60 },
      ],
    },
    {
      id: 2,
      name: "Genshin Impact - Raiden Shogun",
      startDate: "2025-10-01",
      endDate: "2025-11-20",
      progress: 35,
      status: "in-progress",
      color: "bg-purple-500",
      tasks: [
        { name: "Reference Gathering", start: "2025-10-01", end: "2025-10-05", progress: 100 },
        { name: "Material Ordering", start: "2025-10-06", end: "2025-10-12", progress: 100 },
        { name: "Kimono Construction", start: "2025-10-13", end: "2025-10-30", progress: 40 },
        { name: "Armor Pieces", start: "2025-10-25", end: "2025-11-10", progress: 20 },
        { name: "Wig Styling", start: "2025-11-05", end: "2025-11-15", progress: 0 },
      ],
    },
    {
      id: 3,
      name: "Arcane - Jinx",
      startDate: "2025-11-01",
      endDate: "2025-12-15",
      progress: 10,
      status: "planning",
      color: "bg-blue-500",
      tasks: [
        { name: "Concept Planning", start: "2025-11-01", end: "2025-11-10", progress: 50 },
        { name: "Budget Planning", start: "2025-11-05", end: "2025-11-12", progress: 30 },
        { name: "Pattern Making", start: "2025-11-15", end: "2025-11-25", progress: 0 },
        { name: "Fabric Sourcing", start: "2025-11-20", end: "2025-11-30", progress: 0 },
      ],
    },
  ];

  const events = [
    { name: "Anime Expo 2025", date: "2025-10-18", type: "convention", color: "bg-amber-500" },
    { name: "Forest Photoshoot", date: "2025-10-25", type: "photoshoot", color: "bg-pink-500" },
    { name: "Local Comic Con", date: "2025-11-22", type: "convention", color: "bg-amber-500" },
    { name: "Studio Session", date: "2025-11-28", type: "photoshoot", color: "bg-pink-500" },
  ];

  let currentDate = $state(new Date(2025, 9, 1));
  let viewMode = $state<"projects" | "tasks">("projects");
  let expandedProjects = $state<number[]>([1, 2]);

  const monthName = $derived(currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }));

  function goToPreviousMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  }

  function goToNextMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  function toggleProject(projectId: number) {
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