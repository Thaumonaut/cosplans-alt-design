// @ts-nocheck
import type { PageLoad } from './$types'
import { apiClient } from '$lib/api/client.js'

export const load = async ({ fetch, url }: Parameters<PageLoad>[0]) => {
  try {
    // Get filter parameters from URL
    const status = url.searchParams.get('status') || 'all'
    const series = url.searchParams.get('series')
    
    // Load projects that represent characters
    const projectsResponse = await apiClient.getProjects({ 
      status: status !== 'all' ? status : undefined 
    })

    if (!projectsResponse.success) {
      throw new Error(projectsResponse.message || 'Failed to load characters')
    }

    // Transform projects into character format for this page
    let characters = projectsResponse.data.map(project => ({
      id: project.id,
      name: project.character,
      series: project.series,
      image: project.image,
      status: project.status,
      progress: project.progress,
      deadline: project.deadline
    }))

    // Filter by series if specified
    if (series) {
      characters = characters.filter(char => 
        char.series.toLowerCase().includes(series.toLowerCase())
      )
    }

    return {
      characters,
      filters: {
        status,
        series
      }
    }
  } catch (error) {
    console.error('Characters load error:', error)
    
    // Return fallback data
    return {
      characters: [
        {
          id: 1,
          name: 'Malenia, Blade of Miquella',
          series: 'Elden Ring',
          image: '/fantasy-warrior-armor-red-hair.jpg',
          status: 'in-progress',
          progress: 75
        },
        {
          id: 2,
          name: 'Raiden Shogun',
          series: 'Genshin Impact', 
          image: '/anime-character-purple-kimono.jpg',
          status: 'planning',
          progress: 25
        }
      ],
      filters: {
        status: 'all',
        series: null
      },
      error: error instanceof Error ? error.message : 'Failed to load characters'
    }
  }
}