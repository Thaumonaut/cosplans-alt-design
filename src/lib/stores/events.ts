import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'
import { apiClient } from '$lib/api/client.js'
import type { Event } from '$types'

// Main events store
export const events = writable<Event[]>([])

// Loading and error states
export const eventsLoading = writable(false)
export const eventsError = writable<string | null>(null)

// Derived stores for filtered event views
export const upcomingEvents = derived(
  events,
  $events => $events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
)

export const pastEvents = derived(
  events,
  $events => $events
    .filter(e => new Date(e.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
)

export const eventsByType = derived(
  events,
  $events => ({
    convention: $events.filter(e => e.type === 'convention'),
    photoshoot: $events.filter(e => e.type === 'photoshoot'),
    deadline: $events.filter(e => e.type === 'deadline'),
    other: $events.filter(e => e.type === 'other')
  })
)

// Event statistics
export const eventStats = derived(
  events,
  $events => {
    const total = $events.length
    const upcoming = $events.filter(e => new Date(e.date) >= new Date()).length
    const thisWeek = $events.filter(e => {
      const eventDate = new Date(e.date)
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return eventDate >= now && eventDate <= weekFromNow
    }).length

    return {
      total,
      upcoming,
      past: total - upcoming,
      thisWeek
    }
  }
)

// API-integrated actions for managing events
export async function loadEvents(params?: { projectId?: number; type?: string; upcoming?: boolean }) {
  if (!browser) return

  eventsLoading.set(true)
  eventsError.set(null)

  try {
    const response = await apiClient.getEvents(params)
    if (response.success) {
      events.set(response.data)
    } else {
      throw new Error(response.message || 'Failed to load events')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load events'
    eventsError.set(errorMessage)
    console.error('Failed to load events:', error)
  } finally {
    eventsLoading.set(false)
  }
}

export async function addEvent(event: Omit<Event, 'id'>) {
  if (!browser) return

  try {
    const response = await apiClient.createEvent(event)
    if (response.success) {
      // Add to local store
      events.update(currentEvents => [...currentEvents, response.data])
      return response.data
    } else {
      throw new Error(response.message || 'Failed to create event')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create event'
    eventsError.set(errorMessage)
    console.error('Failed to create event:', error)
    throw error
  }
}

export function updateEvent(id: number, updates: Partial<Event>) {
  events.update(currentEvents =>
    currentEvents.map(event =>
      event.id === id ? { ...event, ...updates } : event
    )
  )
}

export function deleteEvent(id: number) {
  events.update(currentEvents =>
    currentEvents.filter(event => event.id !== id)
  )
}

export function getEventsByProject(projectId: number) {
  return derived(
    events,
    $events => $events.filter(e => e.projectId === projectId)
  )
}

// Legacy functions for backward compatibility (now use local data only)
export function addEventLocal(event: Omit<Event, 'id'>) {
  events.update(currentEvents => {
    const newEvent: Event = {
      ...event,
      id: Date.now() // Simple ID generation for now
    }
    return [...currentEvents, newEvent]
  })
}