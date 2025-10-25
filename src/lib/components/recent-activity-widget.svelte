<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle, Avatar, AvatarFallback } from '$lib/components/ui';
  import { Package, Camera, CheckCircle2, Upload } from 'lucide-svelte';
  
  interface Activity {
    id: number;
    type: 'material' | 'photo' | 'completion' | 'upload';
    title: string;
    description: string;
    time: string;
  }
  
  const activities: Activity[] = [
    {
      id: 1,
      type: 'material',
      title: 'Materials ordered',
      description: 'EVA foam and contact cement for Malenia armor',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'photo',
      title: 'Progress photos added',
      description: 'Uploaded 12 photos to Raiden Shogun project',
      time: '5 hours ago',
    },
    {
      id: 3,
      type: 'completion',
      title: 'Task completed',
      description: 'Finished wig styling for Ciri cosplay',
      time: 'Yesterday',
    },
    {
      id: 4,
      type: 'upload',
      title: 'Pattern uploaded',
      description: 'Added kimono pattern to resources',
      time: '2 days ago',
    },
  ];
  
  const activityIcons = {
    material: Package,
    photo: Camera,
    completion: CheckCircle2,
    upload: Upload,
  };
  
  const activityColors = {
    material: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    photo: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    completion: 'bg-primary/10 text-primary',
    upload: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  };
</script>

<Card>
  <CardHeader>
    <CardTitle class="text-lg">Recent Activity</CardTitle>
  </CardHeader>
  <CardContent class="space-y-4">
    {#each activities as activity (activity.id)}
      {@const Icon = activityIcons[activity.type]}
      <div class="flex gap-3">
        <Avatar class={`size-10 ${activityColors[activity.type]}`}>
          <AvatarFallback class={activityColors[activity.type]}>
            <svelte:component this={Icon} class="size-5" />
          </AvatarFallback>
        </Avatar>
        <div class="min-w-0 flex-1 space-y-1">
          <p class="text-sm font-medium leading-tight">{activity.title}</p>
          <p class="text-sm text-muted-foreground">{activity.description}</p>
          <p class="text-xs text-muted-foreground">{activity.time}</p>
        </div>
      </div>
    {/each}
  </CardContent>
</Card>