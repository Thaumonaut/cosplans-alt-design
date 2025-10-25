import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'
import { apiClient } from '$lib/api/client.js'
import type { Project } from '$types'

// Main projects store
export const projects = writable<Project[]>([])

// Loading and error states
export const projectsLoading = writable(false)
export const projectsError = writable<string | null>(null)

// Derived stores for filtered project views
export const activeProjects = derived(
  projects,
  $projects => $projects.filter(p => p.status === 'in-progress')
)

export const completedProjects = derived(
  projects,
  $projects => $projects.filter(p => p.status === 'completed')
)

export const archivedProjects = derived(
  projects,
  $projects => $projects.filter(p => p.status === 'archived')
)

export const ideaProjects = derived(
  projects,
  $projects => $projects.filter(p => p.status === 'idea')
)

export const planningProjects = derived(
  projects,
  $projects => $projects.filter(p => p.status === 'planning')
)

// Project statistics
export const projectStats = derived(
  projects,
  $projects => {
    const total = $projects.length
    const completed = $projects.filter(p => p.status === 'completed').length
    const inProgress = $projects.filter(p => p.status === 'in-progress').length
    const overdue = $projects.filter(p => 
      p.deadline && new Date(p.deadline) < new Date() && p.status !== 'completed'
    ).length

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }
)

// API-integrated actions for managing projects
export async function loadProjects(params?: { status?: string; forceRefresh?: boolean }) {
  if (!browser) return

  projectsLoading.set(true)
  projectsError.set(null)

  try {
    const response = await apiClient.getProjects(params)
    if (response.success) {
      projects.set(response.data)
    } else {
      throw new Error(response.message || 'Failed to load projects')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load projects'
    projectsError.set(errorMessage)
    console.error('Failed to load projects:', error)
  } finally {
    projectsLoading.set(false)
  }
}

export async function addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
  if (!browser) return

  try {
    const response = await apiClient.createProject(project)
    if (response.success) {
      // Add to local store
      projects.update(currentProjects => [...currentProjects, response.data])
      return response.data
    } else {
      throw new Error(response.message || 'Failed to create project')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create project'
    projectsError.set(errorMessage)
    console.error('Failed to create project:', error)
    throw error
  }
}

export async function updateProject(id: number, updates: Partial<Project>) {
  if (!browser) return

  try {
    const response = await apiClient.updateProject(id, updates)
    if (response.success) {
      // Update local store
      projects.update(currentProjects =>
        currentProjects.map(project =>
          project.id === id ? response.data : project
        )
      )
      return response.data
    } else {
      throw new Error(response.message || 'Failed to update project')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update project'
    projectsError.set(errorMessage)
    console.error('Failed to update project:', error)
    throw error
  }
}

export async function deleteProject(id: number) {
  if (!browser) return

  try {
    const response = await apiClient.deleteProject(id)
    if (response.success) {
      // Remove from local store
      projects.update(currentProjects =>
        currentProjects.filter(project => project.id !== id)
      )
    } else {
      throw new Error(response.message || 'Failed to delete project')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete project'
    projectsError.set(errorMessage)
    console.error('Failed to delete project:', error)
    throw error
  }
}

export function getProjectById(id: number) {
  return derived(
    projects,
    $projects => $projects.find(p => p.id === id)
  )
}

// Legacy functions for backward compatibility (now use local data only)
export function addProjectLocal(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
  projects.update(currentProjects => {
    const newProject: Project = {
      ...project,
      id: Date.now(), // Simple ID generation for now
      createdAt: new Date(),
      updatedAt: new Date()
    }
    return [...currentProjects, newProject]
  })
}

export function updateProjectLocal(id: number, updates: Partial<Project>) {
  projects.update(currentProjects =>
    currentProjects.map(project =>
      project.id === id
        ? { ...project, ...updates, updatedAt: new Date() }
        : project
    )
  )
}

export function deleteProjectLocal(id: number) {
  projects.update(currentProjects =>
    currentProjects.filter(project => project.id !== id)
  )
}