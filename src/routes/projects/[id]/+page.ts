import type { PageLoad } from './$types'
import { error } from '@sveltejs/kit'
import { apiClient } from '$lib/api/client.js'

export const load: PageLoad = async ({ params }) => {
  try {
    const projectId = parseInt(params.id)
    
    if (isNaN(projectId)) {
      throw error(400, 'Invalid project ID')
    }

    // Load project data and related tasks/events in parallel
    const [projectResponse, tasksResponse, eventsResponse] = await Promise.all([
      apiClient.getProject(projectId),
      apiClient.getTasks({ projectId }),
      apiClient.getEvents({ projectId })
    ])

    if (!projectResponse.success) {
      if (projectResponse.message?.includes('not found')) {
        throw error(404, 'Project not found')
      }
      throw error(500, projectResponse.message || 'Failed to load project')
    }

    return {
      project: projectResponse.data,
      tasks: tasksResponse.success ? tasksResponse.data : [],
      events: eventsResponse.success ? eventsResponse.data : [],
      errors: {
        tasks: tasksResponse.success ? null : tasksResponse.message,
        events: eventsResponse.success ? null : eventsResponse.message
      }
    }
  } catch (err) {
    // Re-throw SvelteKit errors
    if (err && typeof err === 'object' && 'status' in err) {
      throw err
    }
    
    console.error('Project load error:', err)
    throw error(500, 'Failed to load project')
  }
}