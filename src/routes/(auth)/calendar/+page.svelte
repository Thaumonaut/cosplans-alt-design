<script lang="ts">
  import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckSquare,
    Camera,
    AlertCircle,
  } from 'lucide-svelte';
  import { Button, Card, Badge, Dialog } from '$lib/components/ui';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { projectService } from '$lib/api/services/projectService';
  import { photoshootService } from '$lib/api/services/photoshootService';
  import { tasks, loadTasks } from '$lib/stores';
  import { currentTeam } from '$lib/stores/teams';
  import { get } from 'svelte/store';

  interface TimelineItem {
    id: string;
    type: 'project' | 'task' | 'event' | 'photoshoot';
    title: string;
    project?: string;
    date: string;
    endDate?: string;
    status: string;
    priority: 'high' | 'medium' | 'low';
    icon: any;
  }

  let timelineItems = $state<TimelineItem[]>([]);
  let loading = $state(true);
  let showPreviewModal = $state(false);
  let selectedItem = $state<TimelineItem | null>(null);

  const typeColors = {
    project: "bg-primary/10 text-primary border-primary/20",
    task: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    event: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    photoshoot: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  };

  const priorityColors = {
    high: "bg-red-500/10 text-red-600 border-red-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    low: "bg-green-500/10 text-green-600 border-green-500/20",
  };

  let currentDate = $state(new Date());
  let view = $state<"month" | "week" | "list">("month");

  const monthName = $derived(currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }));

  // Calculate week start (Sunday)
  const weekStart = $derived.by(() => {
    const date = new Date(currentDate);
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const diff = date.getDate() - day; // Get Sunday of the week
    const start = new Date(date);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  });

  // Calculate week dates
  const weekDays = $derived.by(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  });

  // Week range display
  const weekRange = $derived.by(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endStr = end.toLocaleDateString("en-US", { 
      month: start.getMonth() === end.getMonth() ? undefined : "short",
      day: "numeric",
      year: start.getFullYear() !== end.getFullYear() ? "numeric" : undefined
    });
    return `${startStr} - ${endStr}`;
  });

  function goToPreviousMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  }

  function goToNextMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  function goToPreviousWeek() {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() - 7);
    currentDate = newDate;
  }

  function goToNextWeek() {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + 7);
    currentDate = newDate;
  }

  function goToToday() {
    currentDate = new Date();
  }

  async function loadTimelineItems() {
    try {
      loading = true;
      const team = get(currentTeam);
      if (!team) {
        timelineItems = [];
        return;
      }

      const [projects, photoshoots] = await Promise.all([
        projectService.list(),
        photoshootService.list(),
      ]);
      
      await loadTasks({ completed: false });
      const allTasks = get(tasks) || [];

      const items: TimelineItem[] = [];

      // Add project deadlines
      projects.forEach(project => {
        if (project.deadline) {
          items.push({
            id: `deadline-${project.id}`,
            type: "project",
            title: `${project.character} Deadline`,
            project: project.character,
            date: project.deadline,
            status: "deadline",
            priority: "high" as const,
            icon: AlertCircle,
          });
        }
      });

      // Add upcoming tasks
      for (const task of allTasks) {
        const dueDate = task.dueDate as string | Date | null | undefined;
        if (!dueDate) continue;
        
        const project = projects.find(p => p.id === String(task.projectId));
        // Handle dueDate - could be Date object from legacy types or string from domain types
        let dueDateStr: string | null = null;
        try {
          if (typeof dueDate === 'string') {
            dueDateStr = dueDate.split('T')[0];
          } else if (dueDate instanceof Date) {
            dueDateStr = dueDate.toISOString().split('T')[0];
          }
        } catch {
          // Skip if date parsing fails
          continue;
        }
        
        if (dueDateStr) {
          items.push({
            id: `task-${task.id}`,
            type: "task",
            title: task.title,
            project: project?.character || 'Unknown',
            date: dueDateStr,
            status: task.completed ? "completed" : "pending",
            priority: task.priority,
            icon: CheckSquare,
          });
        }
      }

      // Add photoshoots
      photoshoots.forEach(photoshoot => {
        if (photoshoot.date) {
          items.push({
            id: `photoshoot-${photoshoot.id}`,
            type: "photoshoot",
            title: photoshoot.title,
            date: photoshoot.date,
            status: photoshoot.status === 'completed' ? "completed" : "scheduled",
            priority: "medium" as const,
            icon: Camera,
          });
        }
      });

      timelineItems = items;
    } catch (error) {
      console.error('Failed to load timeline items:', error);
      timelineItems = [];
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadTimelineItems();
    
    const unsubscribe = currentTeam.subscribe(() => {
      loadTimelineItems();
    });
    
    return unsubscribe;
  });

  const itemsByDate = $derived.by(() => {
    const grouped: Record<string, TimelineItem[]> = {};
    timelineItems.forEach((item) => {
      if (!grouped[item.date]) {
        grouped[item.date] = [];
      }
      grouped[item.date].push(item);
    });
    return grouped;
  });

  const calendarDays = $derived.by(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  });
</script>

<svelte:head>
  <title>Calendar - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <div class="mb-6 space-y-4">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-balance text-3xl font-bold leading-tight">Calendar</h1>
        <p class="text-pretty text-muted-foreground">
          View all your events, tasks, and deadlines in calendar format
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" onclick={goToToday}>
          Today
        </Button>
        {#if view === "month"}
          <Button variant="outline" size="icon" onclick={goToPreviousMonth}>
            <ChevronLeft class="size-4" />
          </Button>
          <div class="min-w-[140px] text-center text-sm font-medium">{monthName}</div>
          <Button variant="outline" size="icon" onclick={goToNextMonth}>
            <ChevronRight class="size-4" />
          </Button>
        {:else if view === "week"}
          <Button variant="outline" size="icon" onclick={goToPreviousWeek}>
            <ChevronLeft class="size-4" />
          </Button>
          <div class="min-w-[200px] text-center text-sm font-medium">{weekRange}</div>
          <Button variant="outline" size="icon" onclick={goToNextWeek}>
            <ChevronRight class="size-4" />
          </Button>
        {:else}
          <div class="min-w-[140px] text-center text-sm font-medium">{monthName}</div>
        {/if}
      </div>
    </div>

    <div class="flex gap-2">
      <Button 
        variant={view === "month" ? "default" : "outline"} 
        size="sm"
        onclick={() => view = "month"}
      >
        Month
      </Button>
      <Button 
        variant={view === "week" ? "default" : "outline"} 
        size="sm"
        onclick={() => view = "week"}
      >
        Week
      </Button>
      <Button 
        variant={view === "list" ? "default" : "outline"} 
        size="sm"
        onclick={() => view = "list"}
      >
        List
      </Button>
    </div>

    {#if view === "month"}
      <Card class="p-4">
        {#if loading}
          <div class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p class="text-sm text-muted-foreground">Loading calendar...</p>
            </div>
          </div>
        {:else}
          <div class="mb-4 grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          <div class="grid grid-cols-7 gap-2">
            {#each calendarDays as day}
              {#if day === null}
                <div class="aspect-square"></div>
              {:else}
                {@const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`}
                {@const dateItems = itemsByDate[dateStr] || []}
                {@const items = Array.isArray(dateItems) ? dateItems : []}
                {@const today = new Date()}
                {@const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()}
                
                <div
                  class="relative min-h-[100px] rounded-lg border p-2 {isToday ? 'border-primary bg-primary/5' : 'border-border'}"
                >
                  <div class="mb-1 text-sm font-medium {isToday ? 'text-primary' : ''}">{day}</div>
                  <div class="space-y-1">
                    {#each items.slice(0, 3) as item}
                      {@const Icon = item.icon}
                      {@const itemType = item.type as keyof typeof typeColors}
                      <button
                        onclick={() => {
                          selectedItem = item;
                          showPreviewModal = true;
                        }}
                        class="flex w-full items-center gap-1 rounded border px-1.5 py-0.5 text-xs text-left transition-colors hover:opacity-80 {typeColors[itemType] || typeColors.task}"
                      >
                        <Icon class="size-3 shrink-0" />
                        <span class="truncate">{item.title}</span>
                      </button>
                    {/each}
                    {#if items.length > 3}
                      <div class="text-xs text-muted-foreground">+{items.length - 3} more</div>
                    {/if}
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </Card>
    {:else if view === "week"}
      <Card class="p-4">
        {#if loading}
          <div class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p class="text-sm text-muted-foreground">Loading calendar...</p>
            </div>
          </div>
        {:else}
          <div class="mb-4 grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          <div class="grid grid-cols-7 gap-2">
            {#each weekDays as date}
              {@const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`}
              {@const dateItems = itemsByDate[dateStr] || []}
              {@const items = Array.isArray(dateItems) ? dateItems : []}
              {@const today = new Date()}
              {@const isToday = date.toDateString() === today.toDateString()}
              
              <div
                class="relative min-h-[120px] rounded-lg border p-2 {isToday ? 'border-primary bg-primary/5' : 'border-border'}"
              >
                <div class="mb-1 text-sm font-medium {isToday ? 'text-primary' : ''}">
                  {date.getDate()}
                </div>
                <div class="space-y-1">
                  {#each items.slice(0, 4) as item}
                    {@const Icon = item.icon}
                    {@const itemType = item.type as keyof typeof typeColors}
                    <div
                      class="flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs {typeColors[itemType] || typeColors.task}"
                    >
                      <Icon class="size-3 shrink-0" />
                      <span class="truncate">{item.title}</span>
                    </div>
                  {/each}
                  {#if items.length > 4}
                    <div class="text-xs text-muted-foreground">+{items.length - 4} more</div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </Card>
    {:else}
      {#if loading}
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p class="text-sm text-muted-foreground">Loading calendar items...</p>
          </div>
        </div>
      {:else if timelineItems.length === 0}
        <Card class="p-12">
          <div class="flex flex-col items-center justify-center text-center">
            <p class="mb-2 text-lg font-medium text-muted-foreground">No calendar items</p>
            <p class="text-sm text-muted-foreground max-w-md">
              Create projects, tasks, or photoshoots to see them on your calendar.
            </p>
          </div>
        </Card>
      {:else}
        <div class="space-y-4">
          {#each timelineItems
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) as item}
            {@const Icon = item.icon}
            {@const date = new Date(item.date)}
            {@const formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {@const itemType = item.type as keyof typeof typeColors}
            {@const itemPriority = item.priority as keyof typeof priorityColors}

            <Card 
              class="p-4 cursor-pointer transition-colors hover:bg-muted/50"
              onclick={() => {
                selectedItem = item;
                showPreviewModal = true;
              }}
            >
              <div class="flex items-start gap-4">
                <div class="flex w-24 shrink-0 flex-col items-end text-right">
                  <div class="text-sm font-medium">{formattedDate}</div>
                  <div class="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock class="size-3" />
                    <span>All day</span>
                  </div>
                </div>
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-lg {typeColors[itemType] || typeColors.task}"
                >
                  <Icon class="size-5" />
                </div>
                <div class="flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <h4 class="font-medium">{item.title}</h4>
                      {#if item.project}
                        <p class="text-sm text-muted-foreground">{item.project}</p>
                      {/if}
                    </div>
                    <div class="flex gap-2">
                      <Badge
                        variant="outline"
                        class={typeColors[itemType] || typeColors.task}
                      >
                        {item.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        class={priorityColors[itemPriority] || priorityColors.medium}
                      >
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          {/each}
        </div>
      {/if}
    {/if}
  </div>

  <!-- Event Preview Modal -->
  {#if selectedItem}
    {@const Icon = selectedItem.icon}
    {@const itemType = selectedItem.type as keyof typeof typeColors}
    <Dialog
      bind:open={showPreviewModal}
      title={selectedItem.title}
      size="md"
      placement="center"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <div class="mt-1 rounded-lg p-2 {typeColors[itemType] || typeColors.task}">
            <Icon class="size-5" />
          </div>
          <div class="flex-1 space-y-2">
            <div>
              <p class="text-sm font-medium">{selectedItem.title}</p>
              {#if selectedItem.project}
                <p class="text-xs text-muted-foreground">Project: {selectedItem.project}</p>
              {/if}
            </div>
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock class="size-3" />
              <span>{new Date(selectedItem.date).toLocaleDateString()}</span>
            </div>
            <div class="flex items-center gap-2">
              <Badge variant="outline" class={priorityColors[selectedItem.priority] || priorityColors.medium}>
                {selectedItem.priority}
              </Badge>
              <Badge variant="outline">{selectedItem.status}</Badge>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onclick={() => {
              showPreviewModal = false;
              selectedItem = null;
            }}
          >
            Close
          </Button>
          <Button
            size="sm"
            onclick={() => {
              if (!selectedItem) return;
              if (selectedItem.type === 'project') {
                goto(`/projects/${selectedItem.id}`);
              } else if (selectedItem.type === 'photoshoot') {
                goto(`/photoshoots/${selectedItem.id}`);
              } else if (selectedItem.type === 'task') {
                goto(`/tasks?taskId=${selectedItem.id}`);
              }
              showPreviewModal = false;
            }}
          >
            Open Full Page
          </Button>
        </div>
      </div>
    </Dialog>
  {/if}
</div>