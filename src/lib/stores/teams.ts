import { writable, derived } from 'svelte/store'
import { teamService, type Team } from '$lib/api/services/teamService'

type TeamsState = {
  items: Team[]
  current: Team | null
  loading: boolean
  error: string | null
}

const initialState: TeamsState = {
  items: [],
  current: null,
  loading: false,
  error: null,
}

function createTeamsStore() {
  const { subscribe, set, update } = writable<TeamsState>(initialState)

  return {
    subscribe,
    get: (): TeamsState => {
      let value: TeamsState = initialState
      const unsub = subscribe((v) => (value = v))
      unsub()
      return value
    },
    async load(userId: string) {
      update((s) => ({ ...s, loading: true, error: null }))
      try {
        const items = await teamService.list(userId)
        set({ items, current: items[0] ?? null, loading: false, error: null })
      } catch (e: any) {
        update((s) => ({ ...s, loading: false, error: e?.message || 'Failed to load teams' }))
      }
    },
    setCurrent(teamId: string) {
      update((s) => ({
        ...s,
        current: s.items.find((t) => t.id === teamId) || s.current,
      }))
    },
    reset() {
      set(initialState)
    },
  }
}

export const teams = createTeamsStore()

// Derived store for current team
export const currentTeam = {
  subscribe: (fn: (value: Team | null) => void) => {
    return teams.subscribe((state) => {
      fn(state.current)
    })
  },
  get: (): Team | null => {
    return teams.get().current
  },
}


