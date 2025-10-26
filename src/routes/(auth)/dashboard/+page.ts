import type { PageLoad } from './$types'
import { apiClient } from '$lib/api/client.js'

// Disable SSR for this page since it needs to make API calls
export const ssr = false

export const load: PageLoad = async ({ fetch }) => {
  try {
    // Load dashboard data in parallel
    const [projectsResponse, tasksResponse, eventsResponse] = await Promise.all([
      apiClient.getProjects({ limit: 10 }),
      apiClient.getTasks({ completed: false }),
      apiClient.getEvents({ upcoming: true })
    ])

    // Return data with success/error handling
    return {
      projects: projectsResponse.success ? projectsResponse.data : [],
      tasks: tasksResponse.success ? tasksResponse.data : [],
      events: eventsResponse.success ? eventsResponse.data : [],
      errors: {
        projects: projectsResponse.success ? null : projectsResponse.message,
        tasks: tasksResponse.success ? null : tasksResponse.message,
        events: eventsResponse.success ? null : eventsResponse.message
      }
    }
  } catch (error) {
    console.error('Dashboard load error:', error)
    
    // Return empty data with error information
    return {
      projects: [],
      tasks: [],
      events: [],
      errors: {
        projects: 'Failed to load projects',
        tasks: 'Failed to load tasks', 
        events: 'Failed to load events'
      }
    }
  }
}