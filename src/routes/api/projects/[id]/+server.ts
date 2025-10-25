import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type { Project, ApiResponse } from '$lib/types'

// Mock database - in a real app, this would be a database connection
let projects: Project[] = [
  {
    id: 1,
    title: 'Nezuko Kamado',
    character: 'Nezuko Kamado',
    series: 'Demon Slayer',
    image: '/anime-character-purple-kimono.jpg',
    progress: 75,
    budget: { spent: 150, total: 200 },
    deadline: '2025-12-15',
    status: 'in-progress',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: 2,
    title: 'Sailor Moon',
    character: 'Usagi Tsukino',
    series: 'Sailor Moon',
    image: '/jinx-arcane-blue-hair-twin-braids.jpg',
    progress: 100,
    budget: { spent: 180, total: 180 },
    status: 'completed',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-20')
  },
  {
    id: 3,
    title: 'Gojo Satoru',
    character: 'Gojo Satoru',
    series: 'Jujutsu Kaisen',
    image: '/fantasy-warrior-white-hair-sword.jpg',
    progress: 25,
    budget: { spent: 50, total: 300 },
    deadline: '2026-03-20',
    status: 'planning',
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10')
  }
]

export const GET: RequestHandler = async ({ params }) => {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      const response: ApiResponse<Project> = {
        data: {} as Project,
        success: false,
        message: 'Invalid project ID'
      }
      return json(response, { status: 400 })
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50))

    const project = projects.find(p => p.id === id)

    if (!project) {
      const response: ApiResponse<Project> = {
        data: {} as Project,
        success: false,
        message: 'Project not found'
      }
      return json(response, { status: 404 })
    }

    const response: ApiResponse<Project> = {
      data: project,
      success: true,
      message: 'Project retrieved successfully'
    }

    return json(response)
  } catch (error) {
    const response: ApiResponse<Project> = {
      data: {} as Project,
      success: false,
      message: 'Failed to fetch project'
    }
    return json(response, { status: 500 })
  }
}

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      const response: ApiResponse<Project> = {
        data: {} as Project,
        success: false,
        message: 'Invalid project ID'
      }
      return json(response, { status: 400 })
    }

    const updates = await request.json()
    const projectIndex = projects.findIndex(p => p.id === id)

    if (projectIndex === -1) {
      const response: ApiResponse<Project> = {
        data: {} as Project,
        success: false,
        message: 'Project not found'
      }
      return json(response, { status: 404 })
    }

    // Update project
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date()
    }

    const response: ApiResponse<Project> = {
      data: projects[projectIndex],
      success: true,
      message: 'Project updated successfully'
    }

    return json(response)
  } catch (error) {
    const response: ApiResponse<Project> = {
      data: {} as Project,
      success: false,
      message: 'Failed to update project'
    }
    return json(response, { status: 500 })
  }
}

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        message: 'Invalid project ID'
      }
      return json(response, { status: 400 })
    }

    const projectIndex = projects.findIndex(p => p.id === id)

    if (projectIndex === -1) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        message: 'Project not found'
      }
      return json(response, { status: 404 })
    }

    // Remove project
    projects.splice(projectIndex, 1)

    const response: ApiResponse<null> = {
      data: null,
      success: true,
      message: 'Project deleted successfully'
    }

    return json(response)
  } catch (error) {
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      message: 'Failed to delete project'
    }
    return json(response, { status: 500 })
  }
}