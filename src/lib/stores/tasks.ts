import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'
import { apiClient } from '$lib/api/client.js'
import type { Task } from '$types'

// Main tasks store
export const tasks = writable<Task[]>([])

// Loading and error states
export const tasksLoading = writable(false)
export const tasksError = writable<string | null>(null)

// Derived stores for filtered task views
export const completedTasks = derived(
  tasks,
  $tasks => $tasks.filter(t => t.completed)
)

export const pendingTasks = derived(
  tasks,
  $tasks => $tasks.filter(t => !t.completed)
)

export const overdueTasks = derived(
  tasks,
  $tasks => $tasks.filter(t => 
    !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
  )
)

export const tasksByPriority = derived(
  tasks,
  $tasks => ({
    high: $tasks.filter(t => t.priority === 'high' && !t.completed),
    medium: $tasks.filter(t => t.priority === 'medium' && !t.completed),
    low: $tasks.filter(t => t.priority === 'low' && !t.completed)
  })
)

// Task statistics
export const taskStats = derived(
  tasks,
  $tasks => {
    const total = $tasks.length
    const completed = $tasks.filter(t => t.completed).length
    const overdue = $tasks.filter(t => 
      !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
    ).length

    return {
      total,
      completed,
      pending: total - completed,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }
)

// API-integrated actions for managing tasks
export async function loadTasks(params?: { projectId?: number; completed?: boolean; priority?: string }) {
  if (!browser) return

  tasksLoading.set(true)
  tasksError.set(null)

  try {
    const response = await apiClient.getTasks(params)
    if (response.success) {
      tasks.set(response.data)
    } else {
      throw new Error(response.message || 'Failed to load tasks')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load tasks'
    tasksError.set(errorMessage)
    console.error('Failed to load tasks:', error)
  } finally {
    tasksLoading.set(false)
  }
}

export async function addTask(task: Omit<Task, 'id'>) {
  if (!browser) return

  try {
    const response = await apiClient.createTask(task)
    if (response.success) {
      // Add to local store
      tasks.update(currentTasks => [...currentTasks, response.data])
      return response.data
    } else {
      throw new Error(response.message || 'Failed to create task')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create task'
    tasksError.set(errorMessage)
    console.error('Failed to create task:', error)
    throw error
  }
}

export function updateTask(id: number, updates: Partial<Task>) {
  tasks.update(currentTasks =>
    currentTasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    )
  )
}

export function deleteTask(id: number) {
  tasks.update(currentTasks =>
    currentTasks.filter(task => task.id !== id)
  )
}

export function toggleTaskCompletion(id: number) {
  tasks.update(currentTasks =>
    currentTasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    )
  )
}

export function getTasksByProject(projectId: number) {
  return derived(
    tasks,
    $tasks => $tasks.filter(t => t.projectId === projectId)
  )
}

// Legacy functions for backward compatibility (now use local data only)
export function addTaskLocal(task: Omit<Task, 'id'>) {
  tasks.update(currentTasks => {
    // Generate unique ID using timestamp + random component to avoid collisions
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const newTask: Task = {
      ...task,
      id: `${timestamp}-${random}` // Unique ID with timestamp and random component
    }
    return [...currentTasks, newTask]
  })
}