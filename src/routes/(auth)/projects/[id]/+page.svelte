<script lang="ts">
  import type { PageData } from './$types'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { Button } from '$lib/components/ui'
  import { ArrowLeft, Calendar, Clock, DollarSign, Target } from 'lucide-svelte'
  
  export let data: PageData
  
  $: project = data.project
  $: tasks = data.tasks
  $: events = data.events
  $: errors = data.errors

  function goBack() {
    goto('/dashboard')
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString()
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
</script>

<svelte:head>
  <title>{project.title} - Cosplans</title>
</svelte:head>

<div class="container mx-auto p-6">
  <!-- Header -->
  <div class="mb-6 flex items-center gap-4">
    <Button variant="ghost" size="sm" on:click={goBack}>
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back to Dashboard
    </Button>
  </div>

  <!-- Project Details -->
  <div class="grid gap-6 lg:grid-cols-3">
    <!-- Main Content -->
    <div class="lg:col-span-2">
      <div class="rounded-lg border bg-card p-6">
        <div class="mb-6 flex items-start gap-4">
          <img 
            src={project.image} 
            alt={project.character}
            class="h-32 w-32 rounded-lg object-cover"
          />
          <div class="flex-1">
            <h1 class="mb-2 text-3xl font-bold">{project.title}</h1>
            <p class="mb-2 text-lg text-muted-foreground">
              {project.character} from {project.series}
            </p>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                {project.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  project.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                  project.status === 'planning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}">
                {project.status.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-6">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium">Progress</span>
            <span class="text-sm text-muted-foreground">{project.progress}%</span>
          </div>
          <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div 
              class="h-2 rounded-full bg-primary transition-all duration-300"
              style="width: {project.progress}%"
            ></div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-lg border p-4">
            <div class="flex items-center gap-2">
              <DollarSign class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm font-medium">Budget</span>
            </div>
            <div class="mt-2">
              <div class="text-lg font-bold">
                {formatCurrency(project.budget.spent)} / {formatCurrency(project.budget.total)}
              </div>
              <div class="text-xs text-muted-foreground">
                {Math.round((project.budget.spent / project.budget.total) * 100)}% spent
              </div>
            </div>
          </div>

          {#if project.deadline}
            <div class="rounded-lg border p-4">
              <div class="flex items-center gap-2">
                <Calendar class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm font-medium">Deadline</span>
              </div>
              <div class="mt-2">
                <div class="text-lg font-bold">{formatDate(project.deadline)}</div>
                <div class="text-xs text-muted-foreground">
                  {Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                </div>
              </div>
            </div>
          {/if}

          <div class="rounded-lg border p-4">
            <div class="flex items-center gap-2">
              <Target class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm font-medium">Tasks</span>
            </div>
            <div class="mt-2">
              <div class="text-lg font-bold">
                {tasks.filter(t => t.completed).length} / {tasks.length}
              </div>
              <div class="text-xs text-muted-foreground">completed</div>
            </div>
          </div>

          <div class="rounded-lg border p-4">
            <div class="flex items-center gap-2">
              <Clock class="h-4 w-4 text-muted-foreground" />
              <span class="text-sm font-medium">Events</span>
            </div>
            <div class="mt-2">
              <div class="text-lg font-bold">{events.length}</div>
              <div class="text-xs text-muted-foreground">scheduled</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      <!-- Tasks -->
      <div class="rounded-lg border bg-card p-6">
        <h3 class="mb-4 text-lg font-semibold">Tasks</h3>
        {#if errors.tasks}
          <p class="text-sm text-destructive">{errors.tasks}</p>
        {:else if tasks.length === 0}
          <p class="text-sm text-muted-foreground">No tasks yet</p>
        {:else}
          <div class="space-y-2">
            {#each tasks.slice(0, 5) as task}
              <div class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  class="rounded border-gray-300"
                />
                <span class="text-sm {task.completed ? 'line-through text-muted-foreground' : ''}">
                  {task.title}
                </span>
              </div>
            {/each}
            {#if tasks.length > 5}
              <p class="text-xs text-muted-foreground">
                +{tasks.length - 5} more tasks
              </p>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Events -->
      <div class="rounded-lg border bg-card p-6">
        <h3 class="mb-4 text-lg font-semibold">Events</h3>
        {#if errors.events}
          <p class="text-sm text-destructive">{errors.events}</p>
        {:else if events.length === 0}
          <p class="text-sm text-muted-foreground">No events scheduled</p>
        {:else}
          <div class="space-y-3">
            {#each events.slice(0, 3) as event}
              <div class="rounded border p-3">
                <div class="font-medium text-sm">{event.title}</div>
                <div class="text-xs text-muted-foreground">
                  {formatDate(event.date.toString())} • {event.type}
                </div>
              </div>
            {/each}
            {#if events.length > 3}
              <p class="text-xs text-muted-foreground">
                +{events.length - 3} more events
              </p>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>