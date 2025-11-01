export type IdeaDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type IdeaStatus = 'saved' | 'converted'

export interface Idea {
  id: string
  teamId: string
  character: string
  series?: string | null
  description?: string
  difficulty: IdeaDifficulty
  estimatedCost?: number // stored in cents (e.g., 599 = $5.99) to avoid floating point errors
  images: string[]
  tags: string[]
  notes?: string
  status: IdeaStatus
  convertedProjectId?: string | null
  primaryImageIndex?: number // Index of the primary/header image (0-based, defaults to 0)
  createdAt: string
  updatedAt: string
}

export interface IdeaCreate {
  character: string
  series?: string | null
  description?: string
  difficulty: IdeaDifficulty
  estimatedCost?: number // stored in cents (e.g., 599 = $5.99) to avoid floating point errors
  images?: string[]
  tags?: string[]
  notes?: string
}

export interface IdeaUpdate {
  character?: string
  series?: string
  description?: string
  difficulty?: IdeaDifficulty
  estimatedCost?: number // stored in cents (e.g., 599 = $5.99) to avoid floating point errors
  images?: string[]
  tags?: string[]
  notes?: string
  status?: IdeaStatus
  convertedProjectId?: string | null
  primaryImageIndex?: number // Index of the primary/header image (0-based)
}


