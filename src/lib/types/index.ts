// Core application types
export interface Project {
  id: number
  title: string
  character: string
  series: string
  image: string
  progress: number
  budget: { spent: number; total: number }
  deadline?: string
  status: 'idea' | 'planning' | 'in-progress' | 'completed' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Task {
  id: number
  title: string
  description?: string
  completed: boolean
  projectId?: number
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
}

export interface Event {
  id: number
  title: string
  description?: string
  date: Date
  type: 'convention' | 'photoshoot' | 'deadline' | 'other'
  projectId?: number
}

export interface Character {
  id: number
  name: string
  series: string
  image?: string
  description?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface Equipment {
  id: number
  name: string
  type: 'prop' | 'accessory' | 'material' | 'tool'
  description?: string
  image?: string
  cost?: number
  projectId?: number
}

// UI State types
export interface Theme {
  mode: 'light' | 'dark' | 'system'
}

export interface AppSettings {
  theme: Theme
  notifications: boolean
  autoSave: boolean
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}