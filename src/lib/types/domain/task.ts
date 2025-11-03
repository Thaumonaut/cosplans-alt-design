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

// ========== NEW ENTITIES FOR MODERN TASK UI ==========

// Subtask entity
export interface Subtask {
  id: string
  taskId: string
  title: string
  completed: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface SubtaskCreate {
  taskId: string
  title: string
  displayOrder?: number
}

export interface SubtaskUpdate {
  title?: string
  completed?: boolean
  displayOrder?: number
}

// Task Comment entity
export type NotificationEventType = 'assignment' | 'mention' | 'comment' | 'status_change'

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  mentions: string[] // Array of user IDs
  deleted: boolean
  createdAt: string
  updatedAt: string
  
  // Populated from joins (not in DB)
  user?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface TaskCommentCreate {
  taskId: string
  content: string
  mentions?: string[]
}

export interface TaskCommentUpdate {
  content: string
  mentions?: string[]
}

// Task Attachment entity
export interface TaskAttachment {
  id: string
  taskId: string
  fileName: string
  fileSize: number // bytes
  mimeType: string
  storageUrl: string
  uploadedBy: string
  createdAt: string
  
  // Populated from joins (optional)
  uploader?: {
    id: string
    name: string
  }
  signedUrl?: string // Generated on-demand
}

export interface TaskAttachmentCreate {
  taskId: string
  fileName: string
  fileSize: number
  mimeType: string
  storageUrl: string
}

// Task Notification entity
export interface TaskNotification {
  id: string
  userId: string
  taskId: string
  eventType: NotificationEventType
  message: string
  read: boolean
  actorUserId: string | null
  metadata: Record<string, any>
  createdAt: string
  
  // Populated from joins (optional)
  task?: {
    id: string
    title: string
  }
  actor?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface TaskNotificationCreate {
  userId: string
  taskId: string
  eventType: NotificationEventType
  message: string
  actorUserId?: string
  metadata?: Record<string, any>
}

// Task Template entity
export interface TaskTemplateSubtask {
  title: string
  order: number
}

export interface TaskTemplate {
  id: string
  teamId: string
  name: string
  description?: string
  defaultStageId?: string
  defaultPriority: TaskPriority
  subtasks: TaskTemplateSubtask[]
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface TaskTemplateCreate {
  teamId: string
  name: string
  description?: string
  defaultStageId?: string
  defaultPriority?: TaskPriority
  subtasks?: TaskTemplateSubtask[]
}

export interface TaskTemplateUpdate {
  name?: string
  description?: string
  defaultStageId?: string
  defaultPriority?: TaskPriority
  subtasks?: TaskTemplateSubtask[]
}

// Saved Task View entity
export type ViewMode = 'list' | 'board' | 'calendar' | 'timeline'
export type GroupingOption = 'stage' | 'priority' | 'project' | 'assignee' | 'dueDate'

export interface SavedTaskViewFilters {
  stages?: string[]
  priorities?: TaskPriority[]
  assignees?: string[]
  projects?: string[]
  dateRange?: { start: string; end: string }
  tags?: string[]
  includeArchived?: boolean
}

export interface SavedTaskView {
  id: string
  userId: string
  teamId: string
  name: string
  filters: SavedTaskViewFilters
  grouping: GroupingOption
  viewMode: ViewMode
  createdAt: string
  updatedAt: string
}

export interface SavedTaskViewCreate {
  teamId: string
  name: string
  filters: SavedTaskViewFilters
  grouping?: GroupingOption
  viewMode?: ViewMode
}

export interface SavedTaskViewUpdate {
  name?: string
  filters?: SavedTaskViewFilters
  grouping?: GroupingOption
  viewMode?: ViewMode
}

// Task Detail entity (enhanced Task with related data)
export interface TaskDetail extends Task {
  subtasks: Subtask[]
  comments?: TaskComment[]
  attachments?: TaskAttachment[]
  subtaskCompletion: {
    completed: number
    total: number
    percentage: number
  }
}
