<script lang="ts">
  import { CalendarIcon } from 'lucide-svelte';
  import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress } from '$lib/components/ui';
  import { onMount } from 'svelte';
  import { photoshootService } from '$lib/api/services/photoshootService';
  import { projectService } from '$lib/api/services/projectService';
  import { currentTeam } from '$lib/stores/teams';
  import { get } from 'svelte/store';
  import type { Photoshoot } from '$lib/types/domain/photoshoot';
  import type { Project } from '$lib/types/domain/project';

  interface Event {
    id: string;
    name: string;
    date: string;
    endDate?: string;
    location?: string;
    type: 'photoshoot' | 'convention';
    cosplays: Array<{
      character: string;
      series: string | null;
      day?: string;
    }>;
    daysUntil?: number;
  }

  let upcomingEvents = $state<Event[]>([]);
  let pastEvents = $state<Event[]>([]);
  let loading = $state(true);
  let activeTab = $state("upcoming");

  // Calculate days until event
  function getDaysUntil(date: string): number {
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  async function loadEvents() {
    try {
      loading = true;
      const team = get(currentTeam);
      if (!team) {
        upcomingEvents = [];
        pastEvents = [];
        return;
      }

      // Load photoshoots (they are events)
      const photoshoots = await photoshootService.list();
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Load projects to get character information for photoshoots
      const projects = await projectService.list();

      // Transform photoshoots to events
      const events: Event[] = photoshoots.map(photoshoot => {
        // Find linked project to get character info
        let character = 'Unknown Character';
        let series: string | null = null;
        
        // Get projects linked to this photoshoot (would need project_resources or similar)
        // For now, use the first project if available
        if (projects.length > 0) {
          const firstProject = projects[0];
          character = firstProject.character;
          series = firstProject.series;
        }

        return {
          id: photoshoot.id,
          name: photoshoot.title,
          date: photoshoot.date || new Date().toISOString().split('T')[0],
          location: photoshoot.location || undefined,
          type: 'photoshoot',
          cosplays: character !== 'Unknown Character' ? [{
            character,
            series: series || null,
          }] : [],
          daysUntil: photoshoot.date ? getDaysUntil(photoshoot.date) : undefined,
        };
      });

      // Split into upcoming and past
      upcomingEvents = events.filter(e => {
        if (!e.daysUntil) return false;
        return e.daysUntil >= 0;
      });

      pastEvents = events.filter(e => {
        if (!e.daysUntil) return false;
        return e.daysUntil < 0;
      });
    } catch (error) {
      console.error('Failed to load events:', error);
      upcomingEvents = [];
      pastEvents = [];
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadEvents();
    
    const unsubscribe = currentTeam.subscribe(() => {
      loadEvents();
    });
    
    return unsubscribe;
  });
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
        Upcoming ({#if loading}...{:else}{upcomingEvents.length}{/if})
      </Button>
      <Button 
        variant={activeTab === "past" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "past"}
      >
        Past Events ({#if loading}...{:else}{pastEvents.length}{/if})
      </Button>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p class="text-sm text-muted-foreground">Loading events...</p>
        </div>
      </div>
    {:else if activeTab === "upcoming"}
      {#if upcomingEvents.length === 0}
        <div class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16">
          <p class="mb-2 text-lg font-medium text-muted-foreground">No upcoming events</p>
          <p class="mb-6 text-center text-sm text-muted-foreground max-w-md">
            Create a photoshoot to get started with event planning.
          </p>
        </div>
      {:else}
        <div class="space-y-6">
          {#each upcomingEvents as event (event.id)}
            <Card>
              <CardHeader>
                <div class="flex items-start justify-between">
                  <div>
                    <CardTitle class="text-xl">{event.name}</CardTitle>
                    {#if event.location}
                      <p class="text-muted-foreground">{event.location}</p>
                    {/if}
                    <p class="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                      {#if event.endDate && event.endDate !== event.date}
                        - {new Date(event.endDate).toLocaleDateString()}
                      {/if}
                    </p>
                  </div>
                  {#if event.daysUntil !== undefined}
                    <Badge variant="secondary">{event.daysUntil} days</Badge>
                  {/if}
                </div>
              </CardHeader>
              <CardContent class="space-y-4">
                {#if event.cosplays.length > 0}
                  <div>
                    <h4 class="mb-2 font-medium">Planned Cosplays</h4>
                    <div class="space-y-2">
                      {#each event.cosplays as cosplay}
                        <div class="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p class="font-medium">{cosplay.character}</p>
                            {#if cosplay.series}
                              <p class="text-sm text-muted-foreground">{cosplay.series}</p>
                            {/if}
                          </div>
                          {#if cosplay.day}
                            <Badge variant="outline">{cosplay.day}</Badge>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
              </CardContent>
            </Card>
          {/each}
        </div>
      {/if}
    {:else}
      {#if pastEvents.length === 0}
        <div class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16">
          <p class="mb-2 text-lg font-medium text-muted-foreground">No past events</p>
          <p class="text-center text-sm text-muted-foreground max-w-md">
            Past photoshoots and events will appear here.
          </p>
        </div>
      {:else}
        <div class="space-y-6">
          {#each pastEvents as event (event.id)}
            <Card>
              <CardHeader>
                <CardTitle class="text-xl">{event.name}</CardTitle>
                {#if event.location}
                  <p class="text-muted-foreground">{event.location}</p>
                {/if}
                <p class="text-sm text-muted-foreground">
                  {new Date(event.date).toLocaleDateString()}
                  {#if event.endDate && event.endDate !== event.date}
                    - {new Date(event.endDate).toLocaleDateString()}
                  {/if}
                </p>
              </CardHeader>
              <CardContent class="space-y-4">
                {#if event.cosplays.length > 0}
                  <div>
                    <h4 class="mb-2 font-medium">Cosplays Worn</h4>
                    <div class="space-y-2">
                      {#each event.cosplays as cosplay}
                        <div class="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p class="font-medium">{cosplay.character}</p>
                            {#if cosplay.series}
                              <p class="text-sm text-muted-foreground">{cosplay.series}</p>
                            {/if}
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
              </CardContent>
            </Card>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>