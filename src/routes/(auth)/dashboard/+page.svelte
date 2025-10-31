<script lang="ts">
  import type { PageData } from './$types';
  import CreationFlyout from "$lib/components/creation-flyout.svelte";
  import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Checkbox, Progress } from "$lib/components/ui";
  import {
    Plus,
    Bot,
    CheckSquare2,
    FolderPlus,
    Plug,
    Clock,
    Calendar,
    DollarSign,
    FileText,
  } from "lucide-svelte";
  import ProjectCreationForm from "$lib/components/project-creation-form.svelte";
  import { projectService } from '$lib/api/services/projectService';
  import { tasks, loadTasks } from '$lib/stores';
  import { onMount } from 'svelte';
  import type { Project as DomainProject } from '$lib/types/domain/project';
  import { get } from 'svelte/store';

  let { data }: { data: PageData } = $props();

  // Dashboard state
  let creationOpen = $state(false);
  let dbProjects: DomainProject[] = $state([]);
  let loading = $state(false);

  // Format date for greeting: "Mon, Oct 27"
  const currentDate = $derived(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });

  // Map domain projects to display format
  type DisplayProject = {
    id: string;
    character: string;
    series: string;
    image: string;
    progress: number;
    status: string;
    tasks: { completed: number; total: number };
    deadline?: string;
    budget: { spent: number; total: number };
  };

  const projects = $derived.by((): DisplayProject[] => {
    return dbProjects.map(p => {
      // Format deadline: "Oct 15, 2025"
      let formattedDeadline: string | undefined = undefined;
      if (p.deadline) {
        try {
          const date = new Date(p.deadline);
          formattedDeadline = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
          // If date parsing fails, leave undefined
        }
      }
      
      // Get tasks for this project (mock for now - would need to fetch from API)
      const projectTasks = get(tasks).filter(t => t.projectId === p.id);
      const tasksCompleted = projectTasks.filter(t => t.completed).length;
      
      return {
        id: p.id,
        character: p.character,
        series: p.series,
        image: p.coverImage || '/placeholder.svg',
        progress: p.progress,
        status: p.status === 'archived' ? 'completed' : p.status,
        tasks: {
          completed: tasksCompleted,
          total: projectTasks.length || 0
        },
        deadline: formattedDeadline,
        budget: {
          spent: (p.spentBudget || 0) / 100, // Convert from cents
          total: (p.estimatedBudget || 0) / 100 // Convert from cents
        }
      };
    });
  });

  // Group tasks by status
  const tasksByStatus = $derived.by(() => {
    const allTasks = get(tasks);
    return {
      inProgress: allTasks.filter(t => !t.completed && t.priority === 'high' || t.priority === 'medium').slice(0, 2),
      toDo: allTasks.filter(t => !t.completed && t.priority === 'low').slice(0, 1),
      upcoming: allTasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) > new Date()).slice(0, 1)
    };
  });

  // Get current week days for calendar
  const weekDays = $derived.by(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    return days;
  });

  // Budget overview
  const budgetOverview = $derived.by(() => {
    const totalSpent = projects.reduce((sum, p) => sum + p.budget.spent, 0);
    const totalBudget = projects.reduce((sum, p) => sum + p.budget.total, 0);
    return { totalSpent, totalBudget };
  });

  // Timeline items (mock - would come from API)
  const timelineItems = $derived.by(() => {
    // Combine tasks and projects for timeline
    const items: Array<{
      id: string;
      title: string;
      project: string;
      date: string;
      priority: 'high' | 'medium' | 'low';
      completed?: boolean;
      type: 'task' | 'deadline' | 'event';
    }> = [];
    
    // Add completed tasks
    get(tasks).filter(t => t.completed).slice(0, 3).forEach(task => {
      items.push({
        id: `task-${task.id}`,
        title: task.title,
        project: projects.find(p => p.id === String(task.projectId))?.character || 'Unknown',
        date: task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        priority: task.priority,
        completed: true,
        type: 'task'
      });
    });
    
    // Add upcoming deadlines
    projects.filter(p => p.deadline).slice(0, 2).forEach(project => {
      items.push({
        id: `deadline-${project.id}`,
        title: `${project.character} Deadline`,
        project: project.character,
        date: project.deadline?.split(',')[0] || '',
        priority: 'high',
        type: 'deadline'
      });
    });
    
    return items.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  });

  // Recent notes (mock - would come from API)
  const recentNotes = $derived([
    { id: '1', title: 'Armor painting technique notes', project: 'Malenia', time: '2 hours ago' },
    { id: '2', title: 'Fabric research for kimono', project: 'Raiden Shogun', time: '5 hours ago' },
    { id: '3', title: 'LED integration ideas', project: 'V (Cyberpunk)', time: '1 day ago' },
  ]);

  const statusColors = {
    'idea': 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    'planning': 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    'in-progress': 'bg-green-500/10 text-green-700 dark:text-green-300',
    'completed': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  };

  const priorityColors = {
    high: 'bg-red-500/10 text-red-700 dark:text-red-300',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    low: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  };

  // Load data
  onMount(async () => {
    try {
      loading = true;
      const [loadedProjects] = await Promise.all([
        projectService.list({ status: undefined }),
        loadTasks({ completed: false })
      ]);
      dbProjects = loadedProjects.filter(p => p.status !== 'completed' && p.status !== 'archived').slice(0, 3);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Dashboard - Cosplay Tracker</title>
</svelte:head>

<div class="p-6 space-y-8">
  <!-- Greeting Section -->
  <div class="space-y-4">
    <p class="text-sm text-muted-foreground">{currentDate()}</p>
    <div class="space-y-2">
      <h1 class="text-4xl font-bold">Hello, Cosplayer</h1>
      <p class="text-lg text-primary">How can I help you today?</p>
    </div>
    <div class="flex flex-wrap gap-3">
      <Button variant="outline" class="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
        <Bot class="mr-2 size-4" />
        Ask AI
      </Button>
      <Button variant="outline" class="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
        <CheckSquare2 class="mr-2 size-4" />
        Get tasks updates
      </Button>
      <Button variant="outline" class="border-primary text-primary hover:bg-primary hover:text-primary-foreground" onclick={() => (creationOpen = true)}>
        <FolderPlus class="mr-2 size-4" />
        Create project
      </Button>
      <Button variant="outline" class="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
        <Plug class="mr-2 size-4" />
        Connect apps
      </Button>
    </div>
  </div>

  <div class="grid gap-8 lg:grid-cols-3">
    <!-- Left Column: Active Projects -->
    <div class="lg:col-span-2 space-y-8">
      <!-- Active Projects -->
      <div>
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-semibold">Active Projects</h2>
            <p class="text-sm text-muted-foreground">Your current cosplay projects</p>
          </div>
          <Button variant="outline" size="sm" onclick={() => (creationOpen = true)}>
            <Plus class="mr-2 size-4" />
            New Project
          </Button>
        </div>
        <div class="space-y-4">
          {#if loading}
            <div class="text-center py-8 text-muted-foreground">Loading projects...</div>
          {:else if projects.length === 0}
            <div class="text-center py-8 text-muted-foreground">No active projects. Create your first project to get started!</div>
          {:else}
            {#each projects as project (project.id)}
              <Card class="overflow-hidden">
                <div class="flex gap-4">
                  <div class="relative h-32 w-32 flex-shrink-0 overflow-hidden">
                    <img src={project.image} alt={project.character} class="h-full w-full object-cover" />
                  </div>
                  <div class="flex-1 p-4 space-y-3">
                    <div class="flex items-start justify-between">
                      <div>
                        <h3 class="text-lg font-semibold">{project.character}</h3>
                        <p class="text-sm text-muted-foreground">{project.series}</p>
                      </div>
                      <Badge class={statusColors[project.status as keyof typeof statusColors] || statusColors['in-progress']} variant="secondary">
                        {project.status === 'in-progress' ? 'In Progress' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </div>
                    <Progress value={project.progress} class="h-2" />
                    <div class="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p class="text-muted-foreground">Tasks</p>
                        <p class="font-medium">{project.tasks.completed}/{project.tasks.total}</p>
                      </div>
                      {#if project.deadline}
                        <div>
                          <p class="text-muted-foreground">Deadline</p>
                          <p class="font-medium">{project.deadline}</p>
                        </div>
                      {/if}
                      <div>
                        <p class="text-muted-foreground">Budget</p>
                        <p class="font-medium">${project.budget.spent}/${project.budget.total}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            {/each}
          {/if}
        </div>
      </div>
    </div>

    <!-- Right Column: Sidebar Widgets -->
    <div class="space-y-6">
      <!-- My Tasks -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-3">
          <CardTitle class="text-lg flex items-center gap-2">
            <Clock class="size-4" />
            My Tasks
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- IN PROGRESS -->
          {#if tasksByStatus.inProgress.length > 0}
            <div>
              <p class="mb-2 text-xs font-medium text-muted-foreground">IN PROGRESS ({tasksByStatus.inProgress.length} tasks)</p>
              <div class="space-y-2">
                {#each tasksByStatus.inProgress as task}
                  <div class="flex items-start gap-2">
                    <Checkbox checked={task.completed} class="mt-1" />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium">{task.title}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <Badge class="{priorityColors[task.priority]} text-xs" variant="secondary">
                          {task.priority}
                        </Badge>
                        <span class="text-xs text-muted-foreground">
                          {task.dueDate ? (new Date(task.dueDate).toDateString() === new Date().toDateString() ? 'Today' : new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) : 'No date'}
                        </span>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- TO DO -->
          {#if tasksByStatus.toDo.length > 0}
            <div>
              <p class="mb-2 text-xs font-medium text-muted-foreground">TO DO ({tasksByStatus.toDo.length} task)</p>
              <div class="space-y-2">
                {#each tasksByStatus.toDo as task}
                  <div class="flex items-start gap-2">
                    <Checkbox checked={task.completed} class="mt-1" />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium">{task.title}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <Badge class="{priorityColors[task.priority]} text-xs" variant="secondary">
                          {task.priority}
                        </Badge>
                        <span class="text-xs text-muted-foreground">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                        </span>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- UPCOMING -->
          {#if tasksByStatus.upcoming.length > 0}
            <div>
              <p class="mb-2 text-xs font-medium text-muted-foreground">UPCOMING ({tasksByStatus.upcoming.length} task)</p>
              <div class="space-y-2">
                {#each tasksByStatus.upcoming as task}
                  <div class="flex items-start gap-2">
                    <Checkbox checked={task.completed} class="mt-1" />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium">{task.title}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <Badge class="{priorityColors[task.priority]} text-xs" variant="secondary">
                          {task.priority}
                        </Badge>
                        <span class="text-xs text-muted-foreground">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                        </span>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          {#if tasksByStatus.inProgress.length === 0 && tasksByStatus.toDo.length === 0 && tasksByStatus.upcoming.length === 0}
            <p class="text-sm text-muted-foreground text-center py-4">No tasks</p>
          {/if}

          <Button variant="ghost" size="sm" class="w-full text-xs">
            <Plus class="mr-2 size-3" />
            Add task
          </Button>
        </CardContent>
      </Card>

      <!-- Calendar -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-3">
          <CardTitle class="text-lg flex items-center gap-2">
            <Calendar class="size-4" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex gap-2 mb-4">
            {#each weekDays as day}
              <div class="flex-1 text-center">
                <p class="text-xs text-muted-foreground">{day.day}</p>
                <div class={`mt-1 rounded p-2 ${day.isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                  <p class="text-sm font-medium">{day.date}</p>
                </div>
              </div>
            {/each}
          </div>
          <div class="text-right">
            <p class="text-sm text-muted-foreground">{weekDays[0]?.month}</p>
          </div>
          <!-- Event example -->
          <div class="mt-4 flex items-center gap-2 text-sm">
            <div class="size-2 rounded-full bg-primary"></div>
            <div>
              <p class="font-medium">Anime Expo 2025</p>
              <p class="text-xs text-muted-foreground">Today 10:00-11:00 am</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Budget Overview -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-3">
          <CardTitle class="text-lg flex items-center gap-2">
            <DollarSign class="size-4" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          {#each projects as project}
            <div class="space-y-1">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium">{project.character}</span>
                <span class="text-muted-foreground">${project.budget.spent} of ${project.budget.total} spent</span>
              </div>
              <div class="relative h-1.5 overflow-hidden rounded-full bg-muted">
                <div 
                  class="h-full bg-primary" 
                  style="width: {project.budget.total > 0 ? (project.budget.spent / project.budget.total * 100) : 0}%"
                ></div>
              </div>
            </div>
          {/each}
          <div class="pt-2 border-t">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Total Budget</span>
              <span class="text-sm font-semibold">${budgetOverview.totalSpent} / ${budgetOverview.totalBudget}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Timeline -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-3">
          <CardTitle class="text-lg flex items-center gap-2">
            <Clock class="size-4" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          {#each timelineItems.slice(0, 6) as item}
            <div class="flex items-start gap-3">
              {#if item.completed}
                <CheckSquare2 class="mt-0.5 size-4 text-muted-foreground" />
              {:else if item.type === 'deadline'}
                <Clock class="mt-0.5 size-4 text-destructive" />
              {:else}
                <Calendar class="mt-0.5 size-4 text-muted-foreground" />
              {/if}
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium">{item.title}</p>
                <p class="text-xs text-muted-foreground">{item.project} - {item.date}</p>
              </div>
              <Badge class="{priorityColors[item.priority]} text-xs" variant="secondary">
                {item.priority}
              </Badge>
            </div>
          {/each}
        </CardContent>
      </Card>

      <!-- Recent Notes & Updates -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-3">
          <CardTitle class="text-lg flex items-center gap-2">
            <FileText class="size-4" />
            Recent Notes & Updates
          </CardTitle>
          <Button variant="ghost" size="sm" class="text-xs">View all</Button>
        </CardHeader>
        <CardContent class="space-y-3">
          {#each recentNotes as note}
            <div>
              <p class="text-sm font-medium">{note.title}</p>
              <p class="text-xs text-muted-foreground">{note.project} - {note.time}</p>
            </div>
          {/each}
        </CardContent>
      </Card>
    </div>
  </div>
</div>

<CreationFlyout bind:open={creationOpen} title="New Project">
  <ProjectCreationForm />
</CreationFlyout>
