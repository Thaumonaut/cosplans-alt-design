<script lang="ts">
  import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckSquare,
    Users,
    Camera,
    Hammer,
    AlertCircle,
  } from 'lucide-svelte';
  import { Button, Card, Badge } from '$lib/components/ui';

  interface TimelineItem {
    id: number;
    type: 'project' | 'task' | 'event' | 'photoshoot';
    title: string;
    project?: string;
    date: string;
    endDate?: string;
    status: string;
    priority: 'high' | 'medium' | 'low';
    icon: any;
  }

  const timelineItems: TimelineItem[] = [
    {
      id: 1,
      type: "project",
      title: "Malenia Armor - Final Assembly",
      project: "Elden Ring Cosplay",
      date: "2025-10-10",
      status: "in-progress",
      priority: "high",
      icon: Hammer,
    },
    {
      id: 2,
      type: "task",
      title: "Order EVA foam for Raiden Shogun",
      project: "Genshin Impact",
      date: "2025-10-12",
      status: "pending",
      priority: "medium",
      icon: CheckSquare,
    },
    {
      id: 3,
      type: "project",
      title: "Malenia Cosplay Deadline",
      project: "Elden Ring Cosplay",
      date: "2025-10-15",
      status: "deadline",
      priority: "high",
      icon: AlertCircle,
    },
    {
      id: 4,
      type: "event",
      title: "Anime Expo 2025",
      date: "2025-10-18",
      endDate: "2025-10-21",
      status: "upcoming",
      priority: "high",
      icon: Users,
    },
    {
      id: 5,
      type: "task",
      title: "Wig styling for Malenia",
      project: "Elden Ring Cosplay",
      date: "2025-10-20",
      status: "pending",
      priority: "medium",
      icon: CheckSquare,
    },
    {
      id: 6,
      type: "photoshoot",
      title: "Forest Photoshoot - Malenia",
      date: "2025-10-25",
      status: "scheduled",
      priority: "medium",
      icon: Camera,
    },
    {
      id: 7,
      type: "task",
      title: "Start armor patterning",
      project: "Genshin Impact",
      date: "2025-11-01",
      status: "pending",
      priority: "low",
      icon: CheckSquare,
    },
    {
      id: 8,
      type: "project",
      title: "Raiden Shogun Deadline",
      project: "Genshin Impact",
      date: "2025-11-20",
      status: "deadline",
      priority: "medium",
      icon: AlertCircle,
    },
    {
      id: 9,
      type: "event",
      title: "Local Comic Con",
      date: "2025-11-22",
      endDate: "2025-11-24",
      status: "upcoming",
      priority: "medium",
      icon: Users,
    },
    {
      id: 10,
      type: "photoshoot",
      title: "Studio Session - Raiden",
      date: "2025-11-28",
      status: "scheduled",
      priority: "low",
      icon: Camera,
    },
  ];

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

  let currentDate = $state(new Date(2025, 9, 1));
  let view = $state<"month" | "week" | "list">("month");

  const monthName = $derived(currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }));

  function goToPreviousMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  }

  function goToNextMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  function goToToday() {
    currentDate = new Date(2025, 9, 1);
  }

  const itemsByDate = $derived(() => {
    const grouped: Record<string, TimelineItem[]> = {};
    timelineItems.forEach((item) => {
      if (!grouped[item.date]) {
        grouped[item.date] = [];
      }
      grouped[item.date].push(item);
    });
    return grouped;
  });

  const calendarDays = $derived(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
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
        <Button variant="outline" size="icon" onclick={goToPreviousMonth}>
          <ChevronLeft class="size-4" />
        </Button>
        <div class="min-w-[140px] text-center text-sm font-medium">{monthName}</div>
        <Button variant="outline" size="icon" onclick={goToNextMonth}>
          <ChevronRight class="size-4" />
        </Button>
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
          {#each calendarDays as day, index}
            {#if day === null}
              <div class="aspect-square"></div>
            {:else}
              {@const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`}
              {@const items = itemsByDate[dateStr] || []}
              {@const isToday = day === 1}
              
              <div
                class="relative min-h-[100px] rounded-lg border p-2 {isToday ? 'border-primary bg-primary/5' : 'border-border'}"
              >
                <div class="mb-1 text-sm font-medium {isToday ? 'text-primary' : ''}">{day}</div>
                <div class="space-y-1">
                  {#each items.slice(0, 3) as item}
                    {@const Icon = item.icon}
                    <div
                      class="flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs {typeColors[item.type]}"
                    >
                      <Icon class="size-3 shrink-0" />
                      <span class="truncate">{item.title}</span>
                    </div>
                  {/each}
                  {#if items.length > 3}
                    <div class="text-xs text-muted-foreground">+{items.length - 3} more</div>
                  {/if}
                </div>
              </div>
            {/if}
          {/each}
        </div>
      </Card>
    {:else if view === "week"}
      <Card class="p-6">
        <div class="space-y-4">
          {#each Array(7).fill(0) as _, dayIndex}
            {@const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayIndex + 1)}
            {@const dateStr = date.toISOString().split("T")[0]}
            {@const items = itemsByDate[dateStr] || []}
            {@const dayName = date.toLocaleDateString("en-US", { weekday: "short" })}

            <div class="flex gap-4">
              <div class="w-20 shrink-0 text-right">
                <div class="text-sm font-medium">{dayName}</div>
                <div class="text-xs text-muted-foreground">{date.getDate()}</div>
              </div>
              <div class="flex-1 space-y-2">
                {#if items.length === 0}
                  <div class="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No items scheduled
                  </div>
                {:else}
                  {#each items as item}
                    {@const Icon = item.icon}
                    <Card class="p-3">
                      <div class="flex items-start gap-3">
                        <div
                          class="flex size-8 shrink-0 items-center justify-center rounded-lg {typeColors[item.type]}"
                        >
                          <Icon class="size-4" />
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
                                class={typeColors[item.type]}
                              >
                                {item.type}
                              </Badge>
                              <Badge
                                variant="outline"
                                class={priorityColors[item.priority]}
                              >
                                {item.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  {/each}
                {/if}
              </div>
            </div>
          {/each}
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

          <Card class="p-4">
            <div class="flex items-start gap-4">
              <div class="flex w-24 shrink-0 flex-col items-end text-right">
                <div class="text-sm font-medium">{formattedDate}</div>
                <div class="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock class="size-3" />
                  <span>All day</span>
                </div>
              </div>
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-lg {typeColors[item.type]}"
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
                      class={typeColors[item.type]}
                    >
                      {item.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      class={priorityColors[item.priority]}
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
  </div>
</div>