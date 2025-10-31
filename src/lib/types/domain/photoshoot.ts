export type PhotoshootStatus = 'planning' | 'scheduled' | 'completed'

export type CrewRole = 'photographer' | 'assistant' | 'makeup' | 'other'

export interface Shot {
  id: string
  photoshootId: string
  description: string
  pose?: string
  referenceImage?: string
  completed: boolean
  finalPhotos: string[]
  orderIndex: number
  createdAt: string
}

export interface ShotCreate {
  description: string
  pose?: string
  referenceImage?: string
  orderIndex?: number
}

export interface ShotUpdate {
  description?: string
  pose?: string
  referenceImage?: string
  completed?: boolean
  finalPhotos?: string[]
  orderIndex?: number
}

export interface CrewMember {
  id: string
  photoshootId: string
  name: string
  role: CrewRole
  contact?: string
  createdAt: string
}

export interface CrewMemberCreate {
  name: string
  role: CrewRole
  contact?: string
}

export interface CrewMemberUpdate {
  name?: string
  role?: CrewRole
  contact?: string
}

export interface Photoshoot {
  id: string
  teamId: string
  title: string
  date?: string | null
  location?: string
  description?: string
  status: PhotoshootStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PhotoshootCreate {
  title: string
  date?: string
  location?: string
  description?: string
  projectIds?: string[]
}

export interface PhotoshootUpdate {
  title?: string
  date?: string
  location?: string
  description?: string
  status?: PhotoshootStatus
  notes?: string
}

// Extended types for UI (with relationships)
export interface PhotoshootWithRelations extends Photoshoot {
  projects?: Array<{ id: string; character: string; series: string; coverImage?: string }>
  shotList?: Shot[]
  crew?: CrewMember[]
}

