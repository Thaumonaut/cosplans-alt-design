<script lang="ts">
  import { 
    LayoutGrid, 
    List, 
    TableIcon, 
    Plus, 
    Clock, 
    GripVertical, 
    MoreVertical, 
    CalendarIcon, 
    User 
  } from 'lucide-svelte';
  import { tasks } from '$lib/stores';
  import { 
    Button, 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    Badge, 
    Checkbox, 
    DropdownMenu, 
    DropdownMenuItem 
  } from '$lib/components/ui';

  type ViewMode = "kanban" | "list" | "table";
  type Priority = "high" | "medium" | "low";
  type Status = "todo" | "in-progress" | "review" | "done";

  interface Task {
    id: number;
    title: string;
    description: string;
    project: string;
    priority: Priority;
    status: Status;
    dueDate: string;
    assignee: string;
    completed: boolean;
  }



  const priorityColors = {
    high: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    low: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  };

  const statusLabels = {
    todo: "To Do",
    "in-progress": "In Progress",
    review: "Review",
    done: "Done",
  };

  const statusColors = {
    todo: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    "in-progress": "bg-primary/10 text-primary",
    review: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    done: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  };

  let viewMode = $state<ViewMode>("kanban");
  let filterProject = $state<string>("all");
  let filterPriority = $state<string>("all");

  const filteredTasks = $derived($tasks.filter((task) => {
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    return true;
  }));

  // Convert tasks to the format expected by the UI
  const uiTasks = $derived(filteredTasks.map(task => ({
    ...task,
    project: task.projectId ? `Project ${task.projectId}` : 'No Project',
    status: task.completed ? 'done' : 'todo',
    dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
    assignee: 'You'
  })));

  const projects = $derived(['No Project', 'Project 1', 'Project 2', 'Project 3']);

  function getTasksByStatus(status: Status) {
    return uiTasks.filter((task) => task.status === status);
  }
</script>

<svelte:head>
  <title>Tasks - Cosplay Tracker</title>
</svelte:head>

<!-- Page Header Actions -->
<div class="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="flex items-center gap-4">
    <h1 class="font-semibold">Tasks</h1>
  </div>
  
  <div class="flex items-center gap-2">
    <Button size="icon" variant="ghost">
      <Plus class="size-4" />
    </Button>
  </div>
</div>

<div class="flex-1 overflow-auto p-6">
  <div class="mx-auto max-w-[1600px] space-y-6">
    <!-- View Controls -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <Button
          variant={viewMode === "kanban" ? "default" : "outline"}
          size="sm"
          onclick={() => viewMode = "kanban"}
        >
          <LayoutGrid class="mr-2 size-4" />
          Kanban
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onclick={() => viewMode = "list"}
        >
          <List class="mr-2 size-4" />
          List
        </Button>
        <Button
          variant={viewMode === "table" ? "default" : "outline"}
          size="sm"
          onclick={() => viewMode = "table"}
        >
          <TableIcon class="mr-2 size-4" />
          Table
        </Button>
      </div>

      <div class="flex items-center gap-2">
        <select 
          bind:value={filterProject}
          class="w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All Projects</option>
          {#each projects as project}
            <option value={project}>{project}</option>
          {/each}
        </select>

        <select 
          bind:value={filterPriority}
          class="w-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>

    <!-- Kanban View -->
    {#if viewMode === "kanban"}
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {#each ["todo", "in-progress", "review", "done"] as status}
          <Card class="flex flex-col">
            <CardHeader class="pb-3">
              <div class="flex items-center justify-between">
                <CardTitle class="text-sm font-medium">{statusLabels[status]}</CardTitle>
                <Badge variant="secondary" class="text-xs">
                  {getTasksByStatus(status).length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent class="flex-1 space-y-2">
              {#each getTasksByStatus(status) as task (task.id)}
                <Card class="group cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent class="p-3">
                    <div class="mb-2 flex items-start justify-between gap-2">
                      <div class="flex items-start gap-2">
                        <GripVertical class="mt-0.5 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        <Checkbox checked={task.completed} />
                      </div>
                      <DropdownMenu>
                        <Button variant="ghost" size="icon" class="size-6" slot="trigger">
                          <MoreVertical class="size-3" />
                        </Button>
                        <div slot="content">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem class="text-destructive">Delete</DropdownMenuItem>
                        </div>
                      </DropdownMenu>
                    </div>
                    <h4 class="mb-1 text-sm font-medium leading-tight">{task.title}</h4>
                    <p class="mb-3 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                    <div class="flex flex-wrap items-center gap-2">
                      <Badge class={priorityColors[task.priority]} variant="outline">
                        {task.priority}
                      </Badge>
                      <div class="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock class="size-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div class="mt-2 text-xs text-muted-foreground">{task.project}</div>
                  </CardContent>
                </Card>
              {/each}
            </CardContent>
          </Card>
        {/each}
      </div>
    {:else if viewMode === "list"}
      <div class="space-y-2">
        {#each uiTasks as task (task.id)}
          <Card class="transition-shadow hover:shadow-md">
            <CardContent class="flex items-center gap-4 p-4">
              <Checkbox checked={task.completed} />
              <div class="min-w-0 flex-1">
                <div class="mb-1 flex items-center gap-2">
                  <h4 class="font-medium">{task.title}</h4>
                  <Badge class={priorityColors[task.priority]} variant="outline">
                    {task.priority}
                  </Badge>
                  <Badge class={statusColors[task.status]} variant="secondary">
                    {statusLabels[task.status]}
                  </Badge>
                </div>
                <p class="mb-2 text-sm text-muted-foreground">{task.description}</p>
                <div class="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span class="font-medium">{task.project}</span>
                  <div class="flex items-center gap-1">
                    <CalendarIcon class="size-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <User class="size-3" />
                    <span>{task.assignee}</span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <Button variant="ghost" size="icon" slot="trigger">
                  <MoreVertical class="size-4" />
                </Button>
                <div slot="content">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem class="text-destructive">Delete</DropdownMenuItem>
                </div>
              </DropdownMenu>
            </CardContent>
          </Card>
        {/each}
      </div>
    {:else}
      <!-- Table View -->
      <Card>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="border-b bg-muted/50">
                <tr>
                  <th class="w-12 p-4">
                    <Checkbox />
                  </th>
                  <th class="p-4 text-left text-sm font-medium">Task</th>
                  <th class="p-4 text-left text-sm font-medium">Project</th>
                  <th class="p-4 text-left text-sm font-medium">Status</th>
                  <th class="p-4 text-left text-sm font-medium">Priority</th>
                  <th class="p-4 text-left text-sm font-medium">Due Date</th>
                  <th class="p-4 text-left text-sm font-medium">Assignee</th>
                  <th class="w-12 p-4"></th>
                </tr>
              </thead>
              <tbody>
                {#each uiTasks as task (task.id)}
                  <tr class="border-b transition-colors hover:bg-muted/50">
                    <td class="p-4">
                      <Checkbox checked={task.completed} />
                    </td>
                    <td class="p-4">
                      <div>
                        <div class="font-medium">{task.title}</div>
                        <div class="text-sm text-muted-foreground">{task.description}</div>
                      </div>
                    </td>
                    <td class="p-4 text-sm">{task.project}</td>
                    <td class="p-4">
                      <Badge class={statusColors[task.status]} variant="secondary">
                        {statusLabels[task.status]}
                      </Badge>
                    </td>
                    <td class="p-4">
                      <Badge class={priorityColors[task.priority]} variant="outline">
                        {task.priority}
                      </Badge>
                    </td>
                    <td class="p-4 text-sm">{new Date(task.dueDate).toLocaleDateString()}</td>
                    <td class="p-4 text-sm">{task.assignee}</td>
                    <td class="p-4">
                      <DropdownMenu>
                        <Button variant="ghost" size="icon" slot="trigger">
                          <MoreVertical class="size-4" />
                        </Button>
                        <div slot="content">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem class="text-destructive">Delete</DropdownMenuItem>
                        </div>
                      </DropdownMenu>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    {/if}
  </div>
</div>