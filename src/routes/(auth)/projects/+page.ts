import type { PageLoad } from './$types'
import { projectService } from '$lib/api/services/projectService'
import { currentTeam } from '$lib/stores/teams'
import { get } from 'svelte/store'

/**
 * Load projects data for SSR/client-side rendering
 */
export const load: PageLoad = async ({ depends }) => {
  depends('supabase:auth')
  
  try {
    // Ensure we have a team
    let team = get(currentTeam)
    if (!team) {
      // Wait for teams to load (with timeout)
      const waitStart = Date.now()
      while (!team && Date.now() - waitStart < 5000) {
        await new Promise(resolve => setTimeout(resolve, 100))
        team = get(currentTeam)
      }
    }
    
    if (!team) {
      return {
        projects: [],
        error: 'No team selected. Please create or select a team first.'
      }
    }
    
    // Load projects
    const projects = await projectService.list({ status: undefined })
    
    return {
      projects: projects || [],
      error: null
    }
  } catch (error) {
    console.error('Failed to load projects:', error)
    return {
      projects: [],
      error: error instanceof Error ? error.message : 'Failed to load projects'
    }
  }
}

