<script lang="ts">
  import { Checkbox, Badge, DropdownMenu, DropdownMenuItem, Button } from '$lib/components/ui'
  import StageSelector from '$lib/components/base/StageSelector.svelte'
  import { GripVertical, MoreVertical, Clock, User, Flag, FolderOpen } from 'lucide-svelte'
  import type { Task, TaskStage } from '$lib/types/domain/task'
  
  interface Props {
    task: Task & {
      projectName?: string | null
      assignedUser?: { name?: string; email?: string; avatarUrl?: string } | null
      stageName: string
      teamName?: string | null
      isFromCurrentTeam?: boolean
    }
    stages: TaskStage[]
    priorityColors: Record<string, string>
    onEdit?: (taskId: string) => void
    onDelete?: (taskId: string) => void
    onToggle?: (taskId: string) => void
    onStageChange?: (taskId: string, stageId: string) => Promise<void>
    showTeam?: boolean
    draggable?: boolean
    onDragStart?: (taskId: string, event: DragEvent) => void
    onDragEnd?: () => void
  }
  
  let {
    task,
    stages,
    priorityColors,
    onEdit,
    onDelete,
    onToggle,
    onStageChange,
    showTeam = false,
    draggable = false,
    onDragStart,
    onDragEnd
  }: Props = $props()
  
  const isOverdue = $derived(() => {
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date() && !task.completed
  })
</script>

<div
  class="group relative cursor-pointer rounded-lg border border-border bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-md {draggable && 'cursor-move'}"
  draggable={draggable}
  ondragstart={draggable && onDragStart ? (e) => onDragStart(task.id, e) : () => {}}
  ondragend={draggable && onDragEnd ? () => onDragEnd() : () => {}}
  onclick={() => onEdit?.(task.id)}
  onkeydown={(e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onEdit) {
      e.preventDefault()
      onEdit(task.id)
    }
  }}
  role="button"
  tabindex="0"
>
  <!-- Drag Handle -->
  {#if draggable}
    <div class="absolute left-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
      <GripVertical class="size-4 text-muted-foreground" />
    </div>
  {/if}
  
  <div class="p-4">
    <!-- Header: Title and Actions -->
    <div class="mb-3 flex items-start gap-3">
      <!-- Checkbox -->
      <div onclick={(e: MouseEvent) => e.stopPropagation()} class="mt-0.5 shrink-0">
        <Checkbox
          checked={task.completed}
          onchange={() => onToggle?.(task.id)}
        />
      </div>
      
      <!-- Title and Description -->
      <div class="min-w-0 flex-1">
        <h4 class="mb-1.5 text-[15px] font-semibold leading-tight text-foreground line-clamp-2 {task.completed ? 'line-through opacity-60' : ''}">
          {task.title}
        </h4>
        {#if task.description}
          <p class="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        {/if}
      </div>
      
      <!-- Actions Menu -->
      {#if onEdit || onDelete}
        <DropdownMenu>
          {#snippet trigger()}
            <Button
              variant="ghost"
              size="icon"
              class="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              onclick={(e: MouseEvent) => e.stopPropagation()}
            >
              <MoreVertical class="size-4" />
            </Button>
          {/snippet}
          {#snippet children()}
            {#if onEdit}
              <DropdownMenuItem onclick={() => onEdit(task.id)}>Edit Task</DropdownMenuItem>
            {/if}
            {#if onDelete}
              <DropdownMenuItem variant="destructive" onclick={() => onDelete(task.id)}>
                Delete Task
              </DropdownMenuItem>
            {/if}
          {/snippet}
        </DropdownMenu>
      {/if}
    </div>
    
    <!-- Metadata Row: Priority and Due Date -->
    <div class="mb-3 flex flex-wrap items-center gap-3">
      <!-- Priority Badge -->
      <Badge
        class="{priorityColors[task.priority] || 'bg-muted'} text-[11px] font-medium px-2 py-0.5"
        variant="outline"
      >
        <Flag class="mr-1 size-3" />
        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
      </Badge>
      
      <!-- Due Date -->
      {#if task.dueDate}
        <div class="flex items-center gap-1.5 text-xs {isOverdue() ? 'text-destructive font-medium' : 'text-muted-foreground'}">
          <Clock class="size-3.5" />
          <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      {/if}
    </div>
    
    <!-- Stage Selector (clickable badge) -->
    {#if stages.length > 0 && onStageChange}
      <div class="mb-3 flex items-center gap-2">
        <StageSelector
          stages={stages}
          currentStageId={task.stageId}
          editable={true}
          onStageChange={async (stageId) => {
            await onStageChange(task.id, stageId)
          }}
          showNextStage={false}
          class="text-xs"
        />
      </div>
    {/if}
    
    <!-- Footer: Assignee, Project, Team -->
    <div class="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
      <!-- Left: Assignee and Project -->
      <div class="flex flex-1 items-center gap-3 min-w-0">
        <!-- Assignee -->
        {#if task.assignedUser}
          <div class="flex items-center gap-1.5 shrink-0">
            {#if task.assignedUser.avatarUrl}
              <img
                src={task.assignedUser.avatarUrl}
                alt={task.assignedUser.name || task.assignedUser.email || 'Assignee'}
                class="size-5 rounded-full object-cover ring-1 ring-border"
              />
            {:else}
              <div class="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                {(task.assignedUser.name || task.assignedUser.email || '?').charAt(0).toUpperCase()}
              </div>
            {/if}
            <span class="text-xs font-medium text-muted-foreground truncate max-w-[100px]">
              {task.assignedUser.name || task.assignedUser.email}
            </span>
          </div>
        {:else}
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <User class="size-3.5" />
            <span>Unassigned</span>
          </div>
        {/if}
        
        <!-- Project Link -->
        {#if task.projectName}
          <div class="flex items-center gap-1 text-xs text-muted-foreground/70 truncate">
            <FolderOpen class="size-3.5 shrink-0" />
            <span class="truncate">{task.projectName}</span>
          </div>
        {/if}
      </div>
      
      <!-- Right: Team Indicator (if multi-team view) -->
      {#if showTeam && task.teamName}
        <Badge variant="outline" class="text-[10px] px-1.5 py-0 shrink-0">
          {task.teamName}
        </Badge>
      {/if}
    </div>
  </div>
</div>

