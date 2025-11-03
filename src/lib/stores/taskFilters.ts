/**
 * Task Filters Store
 * Feature: 003-modern-task-ui
 * Purpose: Manage task filtering state for views
 */

import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'
import type { SavedTaskViewFilters, TaskPriority } from '$lib/types/domain/task'

// Active filter state
export interface TaskFiltersState extends SavedTaskViewFilters {
  search?: string // Search text for title/description
}

const defaultFilters: TaskFiltersState = {
  stages: [],
  priorities: [],
  assignees: [],
  projects: [],
  dateRange: undefined,
  tags: [],
  includeArchived: false,
  search: ''
}

// Main filters store with localStorage persistence
function createTaskFiltersStore() {
  const storageKey = 'taskFilters'
  
  // Initialize from localStorage if available
  const initialValue: TaskFiltersState = browser && localStorage.getItem(storageKey)
    ? JSON.parse(localStorage.getItem(storageKey)!)
    : defaultFilters

  const { subscribe, set, update } = writable<TaskFiltersState>(initialValue)

  // Persist to localStorage on changes
  if (browser) {
    subscribe(value => {
      localStorage.setItem(storageKey, JSON.stringify(value))
    })
  }

  return {
    subscribe,
    set,
    update,
    
    // Update specific filter properties
    setStages: (stages: string[]) => update(state => ({ ...state, stages })),
    setPriorities: (priorities: TaskPriority[]) => update(state => ({ ...state, priorities })),
    setAssignees: (assignees: string[]) => update(state => ({ ...state, assignees })),
    setProjects: (projects: string[]) => update(state => ({ ...state, projects })),
    setDateRange: (dateRange?: { start: string; end: string }) => update(state => ({ ...state, dateRange })),
    setTags: (tags: string[]) => update(state => ({ ...state, tags })),
    setIncludeArchived: (includeArchived: boolean) => update(state => ({ ...state, includeArchived })),
    setSearch: (search: string) => update(state => ({ ...state, search })),
    
    // Clear all filters
    clearAll: () => set(defaultFilters),
    
    // Clear specific filter
    clearStages: () => update(state => ({ ...state, stages: [] })),
    clearPriorities: () => update(state => ({ ...state, priorities: [] })),
    clearAssignees: () => update(state => ({ ...state, assignees: [] })),
    clearProjects: () => update(state => ({ ...state, projects: [] })),
    clearDateRange: () => update(state => ({ ...state, dateRange: undefined })),
    clearTags: () => update(state => ({ ...state, tags: [] })),
    clearSearch: () => update(state => ({ ...state, search: '' })),
  }
}

export const taskFilters = createTaskFiltersStore()

// Derived store: Check if any filters are active
export const hasActiveFilters = derived(
  taskFilters,
  $filters => {
    return (
      ($filters.stages?.length ?? 0) > 0 ||
      ($filters.priorities?.length ?? 0) > 0 ||
      ($filters.assignees?.length ?? 0) > 0 ||
      ($filters.projects?.length ?? 0) > 0 ||
      $filters.dateRange !== undefined ||
      ($filters.tags?.length ?? 0) > 0 ||
      $filters.includeArchived === true ||
      ($filters.search?.length ?? 0) > 0
    )
  }
)

// Derived store: Count of active filters (for badges)
export const activeFilterCount = derived(
  taskFilters,
  $filters => {
    let count = 0
    if (($filters.stages?.length ?? 0) > 0) count++
    if (($filters.priorities?.length ?? 0) > 0) count++
    if (($filters.assignees?.length ?? 0) > 0) count++
    if (($filters.projects?.length ?? 0) > 0) count++
    if ($filters.dateRange !== undefined) count++
    if (($filters.tags?.length ?? 0) > 0) count++
    if ($filters.includeArchived === true) count++
    if (($filters.search?.length ?? 0) > 0) count++
    return count
  }
)

// Derived store: Active filter labels for display badges
export const activeFilterLabels = derived(
  taskFilters,
  $filters => {
    const labels: Array<{ key: string; label: string; clear: () => void }> = []
    
    if (($filters.stages?.length ?? 0) > 0) {
      labels.push({
        key: 'stages',
        label: `Stages (${$filters.stages!.length})`,
        clear: () => taskFilters.clearStages()
      })
    }
    
    if (($filters.priorities?.length ?? 0) > 0) {
      labels.push({
        key: 'priorities',
        label: `Priority: ${$filters.priorities!.join(', ')}`,
        clear: () => taskFilters.clearPriorities()
      })
    }
    
    if (($filters.assignees?.length ?? 0) > 0) {
      labels.push({
        key: 'assignees',
        label: `Assignees (${$filters.assignees!.length})`,
        clear: () => taskFilters.clearAssignees()
      })
    }
    
    if (($filters.projects?.length ?? 0) > 0) {
      labels.push({
        key: 'projects',
        label: `Projects (${$filters.projects!.length})`,
        clear: () => taskFilters.clearProjects()
      })
    }
    
    if ($filters.dateRange) {
      labels.push({
        key: 'dateRange',
        label: `${$filters.dateRange.start} - ${$filters.dateRange.end}`,
        clear: () => taskFilters.clearDateRange()
      })
    }
    
    if (($filters.tags?.length ?? 0) > 0) {
      labels.push({
        key: 'tags',
        label: `Tags (${$filters.tags!.length})`,
        clear: () => taskFilters.clearTags()
      })
    }
    
    if ($filters.includeArchived) {
      labels.push({
        key: 'includeArchived',
        label: 'Include Archived',
        clear: () => taskFilters.setIncludeArchived(false)
      })
    }
    
    if (($filters.search?.length ?? 0) > 0) {
      labels.push({
        key: 'search',
        label: `Search: "${$filters.search}"`,
        clear: () => taskFilters.clearSearch()
      })
    }
    
    return labels
  }
)

