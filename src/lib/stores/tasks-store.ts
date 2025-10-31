import { writable, derived } from 'svelte/store'
import { taskService } from '$lib/api/services/taskService'
import type { Task, TaskCreate, TaskUpdate } from '$lib/types/domain/task'

interface TasksState {
  items: Task[]
  loading: boolean
  error: string | null
}

interface TasksFilter {
  projectId?: string
  resourceId?: string | null
  completed?: boolean
}

function createTasksStore() {
  const { subscribe, set, update } = writable<TasksState>({
    items: [],
    loading: false,
    error: null,
  })

  return {
    subscribe,
    reset: () => set({ items: [], loading: false, error: null }),

    load: async (filters: { projectId: string; resourceId?: string }) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const items = await taskService.list(filters)
        set({ items, loading: false, error: null })
      } catch (err: any) {
        set({ items: [], loading: false, error: err?.message || 'Failed to load tasks' })
      }
    },

    loadOne: async (id: string): Promise<Task | null> => {
      try {
        const task = await taskService.get(id)
        if (task) {
          update((state) => {
            const index = state.items.findIndex((t) => t.id === id)
            if (index >= 0) {
              state.items[index] = task
            } else {
              state.items.push(task)
            }
            return state
          })
        }
        return task
      } catch (err: any) {
        update((state) => ({ ...state, error: err?.message || 'Failed to load task' }))
        return null
      }
    },

    create: async (task: TaskCreate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const created = await taskService.create(task)
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
          error: err?.message || 'Failed to create task',
        }))
        throw err
      }
    },

    update: async (id: string, updates: TaskUpdate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const updated = await taskService.update(id, updates)
        if (updated) {
          update((state) => ({
            ...state,
            items: state.items.map((t) => (t.id === id ? updated : t)),
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
          error: err?.message || 'Failed to update task',
        }))
        throw err
      }
    },

    delete: async (id: string) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        await taskService.delete(id)
        update((state) => ({
          ...state,
          items: state.items.filter((t) => t.id !== id),
          loading: false,
          error: null,
        }))
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to delete task',
        }))
        throw err
      }
    },

    toggleComplete: async (id: string) => {
      try {
        const updated = await taskService.toggleComplete(id)
        update((state) => ({
          ...state,
          items: state.items.map((t) => (t.id === id ? updated : t)),
        }))
        return updated
      } catch (err: any) {
        update((state) => ({
          ...state,
          error: err?.message || 'Failed to toggle task',
        }))
        throw err
      }
    },
  }
}

export const tasks = createTasksStore()

// Derived stores for filtered task views
export const completedTasks = derived(tasks, ($tasks) =>
  $tasks.items.filter((t) => t.completed)
)

export const incompleteTasks = derived(tasks, ($tasks) =>
  $tasks.items.filter((t) => !t.completed)
)

export const highPriorityTasks = derived(tasks, ($tasks) =>
  $tasks.items.filter((t) => t.priority === 'high' && !t.completed)
)

export const overdueTasks = derived(tasks, ($tasks) =>
  $tasks.items.filter(
    (t) =>
      !t.completed &&
      t.dueDate &&
      new Date(t.dueDate) < new Date()
  )
)


