<script lang="ts">
  import { onMount } from 'svelte'
  import { Card, CardContent, CardHeader, CardTitle, Checkbox, Badge, Button } from '$lib/components/ui';
  import { Clock, AlertCircle } from 'lucide-svelte';
  import { tasks, tasksLoading, tasksError, loadTasks, toggleTaskCompletion } from '$lib/stores';
  import DataLoader from '$lib/components/loading-states/data-loader.svelte';
  
  // Convert global tasks to widget format
  // Filter out duplicates and ensure unique keys
  const widgetTasks = $derived.by(() => {
    const seen = new Set<string | number>()
    return $tasks
      .filter(task => {
        // Filter out duplicate IDs
        if (seen.has(task.id)) {
          return false
        }
        seen.add(task.id)
        return true
      })
      .slice(0, 5)
      .map((task, index) => ({
        id: task.id,
        uniqueKey: `${task.id}-${index}`, // Ensure unique key for rendering
        title: task.title,
        project: task.projectId ? `Project ${task.projectId}` : 'Personal',
        priority: task.priority,
        dueDate: task.dueDate ? 
          (new Date(task.dueDate).toDateString() === new Date().toDateString() ? 'Today' : 
           new Date(task.dueDate).toLocaleDateString()) : 'No due date',
        completed: task.completed
      }))
  });
  
  const priorityColors = {
    high: 'bg-red-500/10 text-red-700 dark:text-red-300',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    low: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  };
  
  function toggleTask(taskId: number) {
    toggleTaskCompletion(taskId);
  }

  async function handleRetry() {
    await loadTasks({ completed: false });
  }

  onMount(() => {
    // Load tasks if not already loaded
    if ($tasks.length === 0 && !$tasksLoading) {
      loadTasks({ completed: false });
    }
  });
</script>

<Card>
  <CardHeader class="flex flex-row items-center justify-between">
    <CardTitle class="text-lg">Important Tasks</CardTitle>
    <Button variant="ghost" size="sm">
      View All
    </Button>
  </CardHeader>
  <CardContent class="space-y-3">
    <DataLoader 
      loading={$tasksLoading} 
      error={$tasksError} 
      empty={widgetTasks.length === 0}
      emptyMessage="No tasks found"
      onRetry={handleRetry}
    >
      {#each widgetTasks as task (task.uniqueKey)}
        <div class="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
          <Checkbox 
            checked={task.completed} 
            class="mt-0.5" 
            onchange={() => toggleTask(task.id)}
          />
          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex items-start justify-between gap-2">
              <p class={`text-sm font-medium leading-tight ${task.completed ? 'text-muted-foreground line-through' : ''}`}>
                {task.title}
              </p>
              <Badge class={priorityColors[task.priority]} variant="secondary">
                {task.priority}
              </Badge>
            </div>
            <div class="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{task.project}</span>
              <span>•</span>
              <div class="flex items-center gap-1">
                {#if task.dueDate === 'Today' || task.dueDate === 'Tomorrow'}
                  <AlertCircle class="size-3" />
                {:else}
                  <Clock class="size-3" />
                {/if}
                <span>{task.dueDate}</span>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </DataLoader>
  </CardContent>
</Card>