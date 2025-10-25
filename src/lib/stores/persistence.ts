import { browser } from '$app/environment'
import { projects } from './projects.js'
import { tasks } from './tasks.js'
import { events } from './events.js'
import { user } from './user.js'
import type { Project, Task, Event, User } from '$lib/types'

const STORAGE_KEYS = {
  projects: 'cosplans_projects',
  tasks: 'cosplans_tasks',
  events: 'cosplans_events',
  user: 'cosplans_user'
} as const

/**
 * Save store data to localStorage
 */
export function saveToStorage<T>(key: keyof typeof STORAGE_KEYS, data: T) {
  if (!browser) return
  
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data))
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error)
  }
}

/**
 * Load store data from localStorage
 */
export function loadFromStorage<T>(key: keyof typeof STORAGE_KEYS): T | null {
  if (!browser) return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS[key])
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error)
    return null
  }
}

/**
 * Set up automatic persistence for stores
 */
export function setupPersistence() {
  if (!browser) return

  // Subscribe to store changes and save to localStorage
  projects.subscribe(data => {
    saveToStorage('projects', data)
  })

  tasks.subscribe(data => {
    saveToStorage('tasks', data)
  })

  events.subscribe(data => {
    saveToStorage('events', data)
  })

  user.subscribe(data => {
    saveToStorage('user', data)
  })
}

/**
 * Load persisted data into stores
 */
export function loadPersistedData() {
  if (!browser) return

  // Load projects
  const storedProjects = loadFromStorage<Project[]>('projects')
  if (storedProjects && storedProjects.length > 0) {
    projects.set(storedProjects)
  }

  // Load tasks
  const storedTasks = loadFromStorage<Task[]>('tasks')
  if (storedTasks && storedTasks.length > 0) {
    tasks.set(storedTasks)
  }

  // Load events
  const storedEvents = loadFromStorage<Event[]>('events')
  if (storedEvents && storedEvents.length > 0) {
    events.set(storedEvents)
  }

  // Load user
  const storedUser = loadFromStorage<User>('user')
  if (storedUser) {
    user.set(storedUser)
  }
}

/**
 * Clear all persisted data
 */
export function clearPersistedData() {
  if (!browser) return

  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}