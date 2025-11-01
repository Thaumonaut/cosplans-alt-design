import type { PageLoad } from './$types'
import { ideaService } from '$lib/api/services/ideaService'
import { currentTeam } from '$lib/stores/teams'
import { get } from 'svelte/store'

/**
 * Load ideas data for SSR/client-side rendering
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
        ideas: [],
        error: 'No team selected. Please create or select a team first.'
      }
    }
    
    // Load ideas
    const ideas = await ideaService.list(team.id)
    
    return {
      ideas: ideas || [],
      error: null
    }
  } catch (error) {
    console.error('Failed to load ideas:', error)
    return {
      ideas: [],
      error: error instanceof Error ? error.message : 'Failed to load ideas'
    }
  }
}

