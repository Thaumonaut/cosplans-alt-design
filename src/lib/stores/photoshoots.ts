import { writable, derived } from 'svelte/store'
import { photoshootService } from '$lib/api/services/photoshootService'
import type { Photoshoot, PhotoshootCreate, PhotoshootUpdate } from '$lib/types/domain/photoshoot'

interface PhotoshootsState {
  items: Photoshoot[]
  loading: boolean
  error: string | null
}

interface PhotoshootsFilter {
  status?: string
}

function createPhotoshootsStore() {
  const { subscribe, set, update } = writable<PhotoshootsState>({
    items: [],
    loading: false,
    error: null,
  })

  return {
    subscribe,
    reset: () => set({ items: [], loading: false, error: null }),

    load: async (filters?: PhotoshootsFilter) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const items = await photoshootService.list(filters)
        set({ items, loading: false, error: null })
      } catch (err: any) {
        set({ items: [], loading: false, error: err?.message || 'Failed to load photoshoots' })
      }
    },

    loadOne: async (id: string): Promise<Photoshoot | null> => {
      try {
        const photoshoot = await photoshootService.get(id)
        if (photoshoot) {
          update((state) => {
            const index = state.items.findIndex((p) => p.id === id)
            if (index >= 0) {
              state.items[index] = photoshoot
            } else {
              state.items.push(photoshoot)
            }
            return state
          })
        }
        return photoshoot
      } catch (err: any) {
        update((state) => ({ ...state, error: err?.message || 'Failed to load photoshoot' }))
        return null
      }
    },

    create: async (photoshoot: PhotoshootCreate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const created = await photoshootService.create(photoshoot)
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
          error: err?.message || 'Failed to create photoshoot',
        }))
        throw err
      }
    },

    update: async (id: string, updates: PhotoshootUpdate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const updated = await photoshootService.update(id, updates)
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
          error: err?.message || 'Failed to update photoshoot',
        }))
        throw err
      }
    },

    delete: async (id: string) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        await photoshootService.delete(id)
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
          error: err?.message || 'Failed to delete photoshoot',
        }))
        throw err
      }
    },
  }
}

export const photoshoots = createPhotoshootsStore()

// Derived stores for filtered photoshoot views by status
export const planningPhotoshoots = derived(photoshoots, ($photoshoots) =>
  $photoshoots.items.filter((p) => p.status === 'planning')
)

export const scheduledPhotoshoots = derived(photoshoots, ($photoshoots) =>
  $photoshoots.items.filter((p) => p.status === 'scheduled')
)

export const completedPhotoshoots = derived(photoshoots, ($photoshoots) =>
  $photoshoots.items.filter((p) => p.status === 'completed')
)

