import { writable, derived } from 'svelte/store'
import { resourceService } from '$lib/api/services/resourceService'
import type { Resource, ResourceCreate, ResourceUpdate } from '$lib/types/domain/resource'

interface ResourcesState {
  items: Resource[]
  loading: boolean
  error: string | null
}

interface ResourcesFilter {
  category?: string
  search?: string
}

function createResourcesStore() {
  const { subscribe, set, update } = writable<ResourcesState>({
    items: [],
    loading: false,
    error: null,
  })

  return {
    subscribe,
    reset: () => set({ items: [], loading: false, error: null }),

    load: async (filters?: ResourcesFilter) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const items = await resourceService.list(filters)
        set({ items, loading: false, error: null })
      } catch (err: any) {
        set({ items: [], loading: false, error: err?.message || 'Failed to load resources' })
      }
    },

    loadOne: async (id: string): Promise<Resource | null> => {
      try {
        const resource = await resourceService.get(id)
        if (resource) {
          update((state) => {
            const index = state.items.findIndex((r) => r.id === id)
            if (index >= 0) {
              state.items[index] = resource
            } else {
              state.items.push(resource)
            }
            return state
          })
        }
        return resource
      } catch (err: any) {
        update((state) => ({ ...state, error: err?.message || 'Failed to load resource' }))
        return null
      }
    },

    create: async (resource: ResourceCreate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const created = await resourceService.create(resource)
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
          error: err?.message || 'Failed to create resource',
        }))
        throw err
      }
    },

    update: async (id: string, updates: ResourceUpdate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const updated = await resourceService.update(id, updates)
        if (updated) {
          update((state) => ({
            ...state,
            items: state.items.map((r) => (r.id === id ? updated : r)),
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
          error: err?.message || 'Failed to update resource',
        }))
        throw err
      }
    },

    delete: async (id: string) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        await resourceService.delete(id)
        update((state) => ({
          ...state,
          items: state.items.filter((r) => r.id !== id),
          loading: false,
          error: null,
        }))
      } catch (err: any) {
        update((state) => ({
          ...state,
          loading: false,
          error: err?.message || 'Failed to delete resource',
        }))
        throw err
      }
    },
  }
}

export const resources = createResourcesStore()

// Derived stores for filtered resource views by category
export const propResources = derived(resources, ($resources) =>
  $resources.items.filter((r) => r.metadata.category === 'prop')
)

export const fabricResources = derived(resources, ($resources) =>
  $resources.items.filter((r) => r.metadata.category === 'fabric')
)

export const wigResources = derived(resources, ($resources) =>
  $resources.items.filter((r) => r.metadata.category === 'wig')
)

export const patternResources = derived(resources, ($resources) =>
  $resources.items.filter((r) => r.metadata.category === 'pattern')
)

export const costumePieceResources = derived(resources, ($resources) =>
  $resources.items.filter((r) => r.metadata.category === 'costume-piece')
)

export const accessoryResources = derived(resources, ($resources) =>
  $resources.items.filter((r) => r.metadata.category === 'accessory')
)

export const materialResources = derived(resources, ($resources) =>
  $resources.items.filter((r) => r.metadata.category === 'material')
)


