import { writable, derived } from 'svelte/store'
import { projectService } from '$lib/api/services/projectService'
import type { Project, ProjectCreate, ProjectUpdate } from '$lib/types/domain/project'

interface ProjectsState {
  items: Project[]
  loading: boolean
  error: string | null
}

interface ProjectsFilter {
  status?: 'planning' | 'in-progress' | 'completed' | 'archived'
  search?: string
}

function createProjectsStore() {
  const { subscribe, set, update } = writable<ProjectsState>({
    items: [],
    loading: false,
    error: null,
  })

  return {
    subscribe,
    reset: () => set({ items: [], loading: false, error: null }),

    load: async (filters?: ProjectsFilter) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const items = await projectService.list(filters)
        set({ items, loading: false, error: null })
      } catch (err: any) {
        set({ items: [], loading: false, error: err?.message || 'Failed to load projects' })
      }
    },

    loadOne: async (id: string): Promise<Project | null> => {
      try {
        const project = await projectService.get(id)
        if (project) {
          update((state) => {
            const index = state.items.findIndex((p) => p.id === id)
            if (index >= 0) {
              state.items[index] = project
            } else {
              state.items.push(project)
            }
            return state
          })
        }
        return project
      } catch (err: any) {
        update((state) => ({ ...state, error: err?.message || 'Failed to load project' }))
        return null
      }
    },

    create: async (project: ProjectCreate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const created = await projectService.create(project)
        update((state) => ({
          ...state,
          items: [created, ...state.items],
          loading: false,
          error: null,
        }))
        return created
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to create project',
        }))
        throw err
      }
    },

    update: async (id: string, updates: ProjectUpdate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const updated = await projectService.update(id, updates)
        if (updated) {
          update((state) => ({
            ...state,
            items: state.items.map((p) => (p.id === id ? updated : p)),
            loading: false,
            error: null,
          }))
          return updated
        }
        update((state) => ({ ...state, loading: false }))
        return null
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to update project',
        }))
        throw err
      }
    },

    delete: async (id: string) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        await projectService.delete(id)
        update((state) => ({
          ...state,
          items: state.items.filter((p) => p.id !== id),
          loading: false,
          error: null,
        }))
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to delete project',
        }))
        throw err
      }
    },

    linkResource: async (projectId: string, resourceId: string, quantity: number = 1) => {
      try {
        await projectService.linkResource(projectId, resourceId, quantity)
      } catch (err: any) {
        update((state) => ({
          ...state,
          error: err?.message || 'Failed to link resource',
        }))
        throw err
      }
    },

    unlinkResource: async (projectId: string, resourceId: string) => {
      try {
        await projectService.unlinkResource(projectId, resourceId)
      } catch (err: any) {
        update((state) => ({
          ...state,
          error: err?.message || 'Failed to unlink resource',
        }))
        throw err
      }
    },

    calculateProgress: async (projectId: string): Promise<number> => {
      try {
        return await projectService.calculateProgress(projectId)
      } catch (err: any) {
        update((state) => ({
          ...state,
          error: err?.message || 'Failed to calculate progress',
        }))
        return 0
      }
    },
  }
}

export const projects = createProjectsStore()

// Derived stores for filtered project views
export const planningProjects = derived(projects, ($projects) =>
  $projects.items.filter((p) => p.status === 'planning')
)

export const activeProjects = derived(projects, ($projects) =>
  $projects.items.filter((p) => p.status === 'in-progress')
)

export const completedProjects = derived(projects, ($projects) =>
  $projects.items.filter((p) => p.status === 'completed')
)

export const archivedProjects = derived(projects, ($projects) =>
  $projects.items.filter((p) => p.status === 'archived')
)

// Project statistics
export const projectStats = derived(projects, ($projects) => {
  const items = $projects.items
  const total = items.length
  const completed = items.filter((p) => p.status === 'completed').length
  const inProgress = items.filter((p) => p.status === 'in-progress').length
  const overdue = items.filter(
    (p) => p.deadline && new Date(p.deadline) < new Date() && p.status !== 'completed'
  ).length

  return {
    total,
    completed,
    inProgress,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
})