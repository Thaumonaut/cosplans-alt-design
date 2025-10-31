import { writable, derived } from 'svelte/store'
import { ideaService } from '$lib/api/services/ideaService'
import type { Idea, IdeaCreate, IdeaUpdate } from '$lib/types/domain/idea'

interface IdeasState {
  items: Idea[]
  loading: boolean
  error: string | null
}

interface IdeasFilter {
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  status?: 'saved' | 'converted'
  search?: string
}

function createIdeasStore() {
  const { subscribe, set, update } = writable<IdeasState>({
    items: [],
    loading: false,
    error: null,
  })

  return {
    subscribe,
    reset: () => set({ items: [], loading: false, error: null }),
    
    load: async (teamId: string) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const items = await ideaService.list(teamId)
        set({ items, loading: false, error: null })
      } catch (err: any) {
        set({ items: [], loading: false, error: err?.message || 'Failed to load ideas' })
      }
    },

    loadOne: async (id: string): Promise<Idea | null> => {
      try {
        const idea = await ideaService.get(id)
        if (idea) {
          update((state) => {
            const index = state.items.findIndex((i) => i.id === id)
            if (index >= 0) {
              state.items[index] = idea
            } else {
              state.items.push(idea)
            }
            return state
          })
        }
        return idea
      } catch (err: any) {
        update((state) => ({ ...state, error: err?.message || 'Failed to load idea' }))
        return null
      }
    },

    create: async (teamId: string, idea: IdeaCreate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const created = await ideaService.create(teamId, idea)
        update((state) => ({
          ...state,
          items: [created, ...state.items],
          loading: false,
          error: null,
        }))
        return created
      } catch (err: any) {
        update((state) => ({ ...state, loading: false, error: err?.message || 'Failed to create idea' }))
        throw err
      }
    },

    update: async (id: string, updates: IdeaUpdate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const updated = await ideaService.update(id, updates)
        if (updated) {
          update((state) => ({
            ...state,
            items: state.items.map((i) => (i.id === id ? updated : i)),
            loading: false,
            error: null,
          }))
          return updated
        }
        update((state) => ({ ...state, loading: false }))
        return null
      } catch (err: any) {
        update((state) => ({ ...state, loading: false, error: err?.message || 'Failed to update idea' }))
        throw err
      }
    },

    delete: async (id: string) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        await ideaService.delete(id)
        update((state) => ({
          ...state,
          items: state.items.filter((i) => i.id !== id),
          loading: false,
          error: null,
        }))
      } catch (err: any) {
        update((state) => ({ ...state, loading: false, error: err?.message || 'Failed to delete idea' }))
        throw err
      }
    },

    getFiltered: (filter: IdeasFilter) => {
      let filtered: Idea[] = []
      let state: IdeasState = { items: [], loading: false, error: null }
      subscribe((s) => {
        state = s
        filtered = s.items
      })()

      if (filter.difficulty) {
        filtered = filtered.filter((i) => i.difficulty === filter.difficulty)
      }

      if (filter.status) {
        filtered = filtered.filter((i) => i.status === filter.status)
      }

      return filtered
    },

    get: () => {
      let state: IdeasState = { items: [], loading: false, error: null }
      subscribe((s) => {
        state = s
      })()
      return state
    },
  }
}

export const ideas = createIdeasStore()

export const ideasFiltered = derived(ideas, ($ideas) => {
  return {
    byDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced') =>
      $ideas.items.filter((i) => i.difficulty === difficulty),
    byStatus: (status: 'saved' | 'converted') =>
      $ideas.items.filter((i) => i.status === status),
    saved: $ideas.items.filter((i) => i.status === 'saved'),
    converted: $ideas.items.filter((i) => i.status === 'converted'),
  }
})

