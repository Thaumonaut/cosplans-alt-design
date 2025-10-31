import { writable, derived } from 'svelte/store'
import { teamService, type Team, type TeamRole } from '$lib/api/services/teamService'
import { supabase } from '$lib/supabase'

type TeamsState = {
  items: Team[]
  current: Team | null
  currentUserRole: TeamRole | null
  loading: boolean
  error: string | null
}

const initialState: TeamsState = {
  items: [],
  current: null,
  currentUserRole: null,
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
    async load(userId?: string) {
      update((s) => ({ ...s, loading: true, error: null }))
      try {
        const items = await teamService.list(userId)
        const current = items[0] ?? null
        
        // Load user role for current team
        let currentUserRole: TeamRole | null = null
        if (current) {
          currentUserRole = await teamService.getUserRole(current.id)
        }
        
        set({ items, current, currentUserRole, loading: false, error: null })
      } catch (e: any) {
        update((s) => ({ ...s, loading: false, error: e?.message || 'Failed to load teams' }))
      }
    },
    async setCurrent(teamId: string) {
      update((s) => {
        const team = s.items.find((t) => t.id === teamId)
        return {
          ...s,
          current: team || s.current,
        }
      })
      
      // Load user role for the team
      const role = await teamService.getUserRole(teamId)
      update((s) => ({
        ...s,
        currentUserRole: role,
      }))
    },
    setCurrentUserRole(role: TeamRole | null) {
      update((s) => ({
        ...s,
        currentUserRole: role,
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

// Derived store for current user role
export const currentUserRole = {
  subscribe: (fn: (value: TeamRole | null) => void) => {
    return teams.subscribe((state) => {
      fn(state.currentUserRole)
    })
  },
  get: (): TeamRole | null => {
    return teams.get().currentUserRole
  },
}


