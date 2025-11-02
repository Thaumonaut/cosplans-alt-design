export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  projectId?: string | null // null = standalone task, set = project task
  resourceId?: string | null // null = project-level task, set = resource-level task
  title: string
  description?: string
  completed: boolean
  dueDate?: string | null // ISO date string
  priority: TaskPriority
  assignedTo?: string | null // user ID
  createdAt: string
  updatedAt: string
}

export interface TaskCreate {
  projectId?: string | null // null = standalone task, set = project task
  resourceId?: string
  title: string
  description?: string
  dueDate?: string
  priority?: TaskPriority
  assignedTo?: string
}

export interface TaskUpdate {
  title?: string
  description?: string
  completed?: boolean
  dueDate?: string | null
  priority?: TaskPriority
  assignedTo?: string | null
}
