import { writable, derived } from 'svelte/store'
import { toolService } from '$lib/api/services/toolService'
import type { Tool, ToolCreate, ToolUpdate } from '$lib/types/domain/tool'

interface ToolsState {
  items: Tool[]
  loading: boolean
  error: string | null
}

interface ToolsFilter {
  category?: string
  search?: string
}

function createToolsStore() {
  const { subscribe, set, update } = writable<ToolsState>({
    items: [],
    loading: false,
    error: null,
  })

  return {
    subscribe,
    reset: () => set({ items: [], loading: false, error: null }),

    load: async (filters?: ToolsFilter) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const items = await toolService.list(filters)
        set({ items, loading: false, error: null })
      } catch (err: any) {
        set({ items: [], loading: false, error: err?.message || 'Failed to load tools' })
      }
    },

    loadOne: async (id: string): Promise<Tool | null> => {
      try {
        const tool = await toolService.get(id)
        if (tool) {
          update((state) => {
            const index = state.items.findIndex((t) => t.id === id)
            if (index >= 0) {
              state.items[index] = tool
            } else {
              state.items.push(tool)
            }
            return state
          })
        }
        return tool
      } catch (err: any) {
        update((state) => ({ ...state, error: err?.message || 'Failed to load tool' }))
        return null
      }
    },

    create: async (tool: ToolCreate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const created = await toolService.create(tool)
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
          error: err?.message || 'Failed to create tool',
        }))
        throw err
      }
    },

    update: async (id: string, updates: ToolUpdate) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        const updated = await toolService.update(id, updates)
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
          error: err?.message || 'Failed to update tool',
        }))
        throw err
      }
    },

    delete: async (id: string) => {
      update((state) => ({ ...state, loading: true, error: null }))
      try {
        await toolService.delete(id)
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
          error: err?.message || 'Failed to delete tool',
        }))
        throw err
      }
    },
  }
}

export const tools = createToolsStore()

// Derived stores for filtered tool views by category
export const craftingTools = derived(tools, ($tools) =>
  $tools.items.filter((t) => t.metadata.category === 'crafting-tool')
)

export const shootEquipment = derived(tools, ($tools) =>
  $tools.items.filter((t) => t.metadata.category === 'shoot-equipment')
)


