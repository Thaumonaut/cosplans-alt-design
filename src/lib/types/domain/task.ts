export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  projectId?: string | null // null = standalone task, set = project task
  resourceId?: string | null // null = project-level task, set = resource-level task
  teamId: string // Required: either from project.team_id or tasks.team_id
  stageId: string // Required: current workflow stage (determines completion)
  title: string
  description?: string
  completed: boolean // DEPRECATED: Derived from stage.is_completion_stage. Kept for backward compatibility.
  dueDate?: string | null // ISO date string
  priority: TaskPriority
  assignedTo?: string | null // user ID
  createdAt: string
  updatedAt: string
}

export interface TaskCreate {
  projectId?: string | null // null = standalone task, set = project task
  resourceId?: string // Optional: resource-level task
  teamId?: string // Required if projectId is null (standalone task). Defaults to current active team.
  stageId?: string // Optional: defaults to first non-completion stage of team
  title: string
  description?: string
  dueDate?: string
  priority?: TaskPriority
  assignedTo?: string
}

export interface TaskUpdate {
  stageId?: string // Change stage (for drag-and-drop kanban moves)
  title?: string
  description?: string
  dueDate?: string | null
  priority?: TaskPriority
  assignedTo?: string | null
  projectId?: string | null // Move to different project
  resourceId?: string | null // Move to different resource
  completed?: boolean // DEPRECATED: Use stageId instead
}

// Task Stage entity
export interface TaskStage {
  id: string
  teamId: string
  name: string
  displayOrder: number
  isCompletionStage: boolean
  createdAt: string
  updatedAt: string
}

export interface TaskStageCreate {
  teamId: string
  name: string
  displayOrder: number
  isCompletionStage?: boolean // Defaults to false
}

export interface TaskStageUpdate {
  name?: string
  displayOrder?: number
  isCompletionStage?: boolean
}
