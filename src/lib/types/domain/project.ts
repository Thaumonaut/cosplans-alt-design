export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'archived'

export interface Project {
  id: string
  teamId: string
  fromIdeaId?: string | null
  character: string
  series?: string | null
  status: ProjectStatus
  progress: number // 0-100, calculated via hybrid algorithm
  estimatedBudget?: number // stored in cents
  spentBudget: number // stored in cents
  deadline?: string | null // ISO date string
  description?: string
  coverImage?: string
  referenceImages: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ProjectCreate {
  character: string
  series?: string | null
  fromIdeaId?: string
  status?: ProjectStatus
  estimatedBudget?: number // in cents
  deadline?: string
  description?: string
  coverImage?: string
  referenceImages?: string[]
  tags?: string[]
}

export interface ProjectUpdate {
  character?: string
  series?: string
  status?: ProjectStatus
  estimatedBudget?: number // in cents
  spentBudget?: number // in cents
  deadline?: string | null
  description?: string
  coverImage?: string
  referenceImages?: string[]
  tags?: string[]
  progress?: number
}
