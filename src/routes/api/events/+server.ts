import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type { Event, ApiResponse } from '$lib/types'

// Mock database - in a real app, this would be a database connection
let events: Event[] = [
  {
    id: 1,
    title: 'Anime Expo 2025',
    description: 'Major anime convention in Los Angeles',
    date: new Date('2025-07-04'),
    type: 'convention',
    projectId: 1
  },
  {
    id: 2,
    title: 'Photoshoot with photographer',
    description: 'Professional photoshoot for Sailor Moon cosplay',
    date: new Date('2025-11-20'),
    type: 'photoshoot',
    projectId: 2
  },
  {
    id: 3,
    title: 'Nezuko deadline',
    description: 'Final deadline for Nezuko cosplay completion',
    date: new Date('2025-12-15'),
    type: 'deadline',
    projectId: 1
  }
]

export const GET: RequestHandler = async ({ url }) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 60))

    const projectId = url.searchParams.get('projectId')
    const type = url.searchParams.get('type')
    const upcoming = url.searchParams.get('upcoming')

    let filteredEvents = events

    // Filter by project ID if provided
    if (projectId) {
      const id = parseInt(projectId)
      if (!isNaN(id)) {
        filteredEvents = filteredEvents.filter(e => e.projectId === id)
      }
    }

    // Filter by type if provided
    if (type && type !== 'all') {
      filteredEvents = filteredEvents.filter(e => e.type === type)
    }

    // Filter by upcoming/past if provided
    if (upcoming !== null) {
      const now = new Date()
      const isUpcoming = upcoming === 'true'
      filteredEvents = filteredEvents.filter(e => 
        isUpcoming ? new Date(e.date) >= now : new Date(e.date) < now
      )
    }

    // Sort by date
    filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const response: ApiResponse<Event[]> = {
      data: filteredEvents,
      success: true,
      message: `Retrieved ${filteredEvents.length} events`
    }

    return json(response)
  } catch (error) {
    const response: ApiResponse<Event[]> = {
      data: [],
      success: false,
      message: 'Failed to fetch events'
    }
    return json(response, { status: 500 })
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const eventData = await request.json()
    
    // Validate required fields
    if (!eventData.title || !eventData.date) {
      const response: ApiResponse<Event> = {
        data: {} as Event,
        success: false,
        message: 'Missing required fields: title, date'
      }
      return json(response, { status: 400 })
    }

    const newEvent: Event = {
      id: Math.max(...events.map(e => e.id), 0) + 1,
      title: eventData.title,
      description: eventData.description,
      date: new Date(eventData.date),
      type: eventData.type || 'other',
      projectId: eventData.projectId
    }

    events.push(newEvent)

    const response: ApiResponse<Event> = {
      data: newEvent,
      success: true,
      message: 'Event created successfully'
    }

    return json(response, { status: 201 })
  } catch (error) {
    const response: ApiResponse<Event> = {
      data: {} as Event,
      success: false,
      message: 'Failed to create event'
    }
    return json(response, { status: 500 })
  }
}