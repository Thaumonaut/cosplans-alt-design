/**
 * Task Views Store
 * Feature: 003-modern-task-ui
 * Purpose: Manage saved task views and current view state
 */

import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'
import type { SavedTaskView, ViewMode, GroupingOption } from '$lib/types/domain/task'

// Current view state
export interface CurrentViewState {
  mode: ViewMode
  grouping: GroupingOption
}

const defaultViewState: CurrentViewState = {
  mode: 'list',
  grouping: 'stage'
}

// Current view state store with localStorage persistence
function createCurrentViewStore() {
  const storageKey = 'currentTaskView'
  
  const initialValue: CurrentViewState = browser && localStorage.getItem(storageKey)
    ? JSON.parse(localStorage.getItem(storageKey)!)
    : defaultViewState

  const { subscribe, set, update } = writable<CurrentViewState>(initialValue)

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
    
    setMode: (mode: ViewMode) => update(state => ({ ...state, mode })),
    setGrouping: (grouping: GroupingOption) => update(state => ({ ...state, grouping })),
    
    // Quick view mode switchers
    switchToList: () => update(state => ({ ...state, mode: 'list' })),
    switchToBoard: () => update(state => ({ ...state, mode: 'board' })),
    switchToCalendar: () => update(state => ({ ...state, mode: 'calendar' })),
    switchToTimeline: () => update(state => ({ ...state, mode: 'timeline' })),
  }
}

export const currentView = createCurrentViewStore()

// Saved views store (loaded from API, managed by SavedTaskView service)
export const savedViews = writable<SavedTaskView[]>([])
export const savedViewsLoading = writable(false)
export const savedViewsError = writable<string | null>(null)

// Selected saved view ID (null = no saved view active, custom filters)
export const activeSavedViewId = writable<string | null>(null)

// Derived store: Get currently active saved view
export const activeSavedView = derived(
  [savedViews, activeSavedViewId],
  ([$views, $activeId]) => {
    if (!$activeId) return null
    return $views.find(v => v.id === $activeId) || null
  }
)

// Derived store: Group saved views by team
export const savedViewsByTeam = derived(
  savedViews,
  $views => {
    const byTeam = new Map<string, SavedTaskView[]>()
    
    for (const view of $views) {
      const teamViews = byTeam.get(view.teamId) || []
      teamViews.push(view)
      byTeam.set(view.teamId, teamViews)
    }
    
    return byTeam
  }
)

// Utility functions for managing saved views
export function addSavedView(view: SavedTaskView) {
  savedViews.update(views => [...views, view])
}

export function updateSavedView(id: string, updates: Partial<SavedTaskView>) {
  savedViews.update(views =>
    views.map(view =>
      view.id === id ? { ...view, ...updates } : view
    )
  )
}

export function deleteSavedView(id: string) {
  savedViews.update(views => views.filter(v => v.id !== id))
  
  // If deleted view was active, clear active view
  activeSavedViewId.update(activeId => 
    activeId === id ? null : activeId
  )
}

export function applySavedView(view: SavedTaskView) {
  activeSavedViewId.set(view.id)
  currentView.setMode(view.viewMode)
  currentView.setGrouping(view.grouping)
}

export function clearActiveSavedView() {
  activeSavedViewId.set(null)
}

