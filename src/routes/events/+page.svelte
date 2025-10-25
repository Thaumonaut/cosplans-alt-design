<script lang="ts">
  import { CalendarIcon } from 'lucide-svelte';
  import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress } from '$lib/components/ui';

  interface Event {
    id: number;
    name: string;
    date: string;
    endDate: string;
    location: string;
    type: 'convention';
    cosplays: Array<{
      character: string;
      series: string;
      day: string;
    }>;
    checklist?: {
      total: number;
      completed: number;
    };
    daysUntil?: number;
    photos?: number;
    rating?: number;
  }

  const upcomingEvents: Event[] = [
    {
      id: 1,
      name: "Anime Expo 2025",
      date: "2025-07-04",
      endDate: "2025-07-07",
      location: "Los Angeles Convention Center",
      type: "convention",
      cosplays: [
        {
          character: "Malenia, Blade of Miquella",
          series: "Elden Ring",
          day: "Day 1",
        },
        {
          character: "Ciri",
          series: "The Witcher 3",
          day: "Day 2",
        },
      ],
      checklist: {
        total: 15,
        completed: 8,
      },
      daysUntil: 130,
    },
    {
      id: 2,
      name: "Local Comic Con",
      date: "2025-05-15",
      endDate: "2025-05-16",
      location: "City Convention Center",
      type: "convention",
      cosplays: [
        {
          character: "Raiden Shogun",
          series: "Genshin Impact",
          day: "Day 1",
        },
      ],
      checklist: {
        total: 10,
        completed: 3,
      },
      daysUntil: 80,
    },
  ];

  const pastEvents: Event[] = [
    {
      id: 3,
      name: "Winter Wondercon 2024",
      date: "2024-12-10",
      endDate: "2024-12-12",
      location: "Downtown Convention Hall",
      type: "convention",
      cosplays: [
        {
          character: "Ciri",
          series: "The Witcher 3",
          day: "All Days",
        },
      ],
      photos: 45,
      rating: 5,
    },
  ];

  let activeTab = $state("upcoming");
</script>

<svelte:head>
  <title>Events - Cosplay Tracker</title>
</svelte:head>

<!-- Page Header Actions -->
<div class="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="flex items-center gap-4">
    <h1 class="font-semibold">Events</h1>
  </div>
  
  <div class="flex items-center gap-2">
    <Button variant="outline" size="icon">
      <CalendarIcon class="size-5" />
    </Button>
  </div>
</div>

<div class="p-6">
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">Events</h1>
    <p class="text-pretty text-muted-foreground">
      Manage your conventions, photoshoots, and cosplay gatherings
    </p>
  </div>

  <div class="space-y-6">
    <div class="flex gap-2">
      <Button 
        variant={activeTab === "upcoming" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "upcoming"}
      >
        Upcoming ({upcomingEvents.length})
      </Button>
      <Button 
        variant={activeTab === "past" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "past"}
      >
        Past Events ({pastEvents.length})
      </Button>
    </div>

    {#if activeTab === "upcoming"}
      <div class="space-y-6">
        {#each upcomingEvents as event (event.id)}
          <Card>
            <CardHeader>
              <div class="flex items-start justify-between">
                <div>
                  <CardTitle class="text-xl">{event.name}</CardTitle>
                  <p class="text-muted-foreground">{event.location}</p>
                  <p class="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary">{event.daysUntil} days</Badge>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <h4 class="mb-2 font-medium">Planned Cosplays</h4>
                <div class="space-y-2">
                  {#each event.cosplays as cosplay}
                    <div class="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p class="font-medium">{cosplay.character}</p>
                        <p class="text-sm text-muted-foreground">{cosplay.series}</p>
                      </div>
                      <Badge variant="outline">{cosplay.day}</Badge>
                    </div>
                  {/each}
                </div>
              </div>
              
              {#if event.checklist}
                <div>
                  <div class="mb-2 flex items-center justify-between">
                    <span class="text-sm font-medium">Preparation Checklist</span>
                    <span class="text-sm text-muted-foreground">
                      {event.checklist.completed} / {event.checklist.total}
                    </span>
                  </div>
                  <Progress value={(event.checklist.completed / event.checklist.total) * 100} class="h-2" />
                </div>
              {/if}
            </CardContent>
          </Card>
        {/each}
      </div>
    {:else}
      <div class="space-y-6">
        {#each pastEvents as event (event.id)}
          <Card>
            <CardHeader>
              <CardTitle class="text-xl">{event.name}</CardTitle>
              <p class="text-muted-foreground">{event.location}</p>
              <p class="text-sm text-muted-foreground">
                {new Date(event.date).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <h4 class="mb-2 font-medium">Cosplays Worn</h4>
                <div class="space-y-2">
                  {#each event.cosplays as cosplay}
                    <div class="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p class="font-medium">{cosplay.character}</p>
                        <p class="text-sm text-muted-foreground">{cosplay.series}</p>
                      </div>
                      <Badge variant="outline">{cosplay.day}</Badge>
                    </div>
                  {/each}
                </div>
              </div>
              
              {#if event.photos}
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Photos Taken</span>
                  <span class="text-sm text-muted-foreground">{event.photos}</span>
                </div>
              {/if}
            </CardContent>
          </Card>
        {/each}
      </div>
    {/if}
  </div>
</div>