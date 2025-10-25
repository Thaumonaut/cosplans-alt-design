<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '$lib/components/ui';
  import { Calendar, MapPin, Users } from 'lucide-svelte';
  
  interface Event {
    id: number;
    title: string;
    date: string;
    location: string;
    type: 'convention' | 'photoshoot' | 'meetup';
    cosplays: string[];
  }
  
  const events: Event[] = [
    {
      id: 1,
      title: 'Anime Expo 2025',
      date: 'Nov 8, 2025',
      location: 'Los Angeles, CA',
      type: 'convention',
      cosplays: ['Malenia', 'Raiden Shogun'],
    },
    {
      id: 2,
      title: 'Forest Photoshoot',
      date: 'Nov 15, 2025',
      location: 'Griffith Park',
      type: 'photoshoot',
      cosplays: ['Ciri'],
    },
    {
      id: 3,
      title: 'Genshin Meetup',
      date: 'Nov 22, 2025',
      location: 'Santa Monica Pier',
      type: 'meetup',
      cosplays: ['Raiden Shogun'],
    },
  ];
  
  const typeColors = {
    convention: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    photoshoot: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    meetup: 'bg-primary/10 text-primary',
  };
</script>

<Card>
  <CardHeader class="flex flex-row items-center justify-between">
    <CardTitle class="text-lg">Upcoming Events</CardTitle>
    <Button variant="ghost" size="sm">
      View All
    </Button>
  </CardHeader>
  <CardContent class="space-y-4">
    {#each events as event (event.id)}
      <div class="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
        <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Calendar class="size-6" />
        </div>
        <div class="min-w-0 flex-1 space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h4 class="font-semibold leading-tight">{event.title}</h4>
              <p class="text-sm text-muted-foreground">{event.date}</p>
            </div>
            <Badge class={typeColors[event.type]} variant="secondary">
              {event.type}
            </Badge>
          </div>
          <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div class="flex items-center gap-1">
              <MapPin class="size-3.5" />
              <span>{event.location}</span>
            </div>
            <div class="flex items-center gap-1">
              <Users class="size-3.5" />
              <span>{event.cosplays.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </CardContent>
</Card>