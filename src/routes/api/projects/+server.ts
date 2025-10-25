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

export const GET: RequestHandler = async ({ url }) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))

    const status = url.searchParams.get('status')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let filteredProjects = projects

    // Filter by status if provided
    if (status && status !== 'all') {
      filteredProjects = projects.filter(p => p.status === status)
    }

    // Apply pagination
    const paginatedProjects = filteredProjects.slice(offset, offset + limit)

    const response: ApiResponse<Project[]> = {
      data: paginatedProjects,
      success: true,
      message: `Retrieved ${paginatedProjects.length} projects`
    }

    return json(response)
  } catch (error) {
    const response: ApiResponse<Project[]> = {
      data: [],
      success: false,
      message: 'Failed to fetch projects'
    }
    return json(response, { status: 500 })
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const projectData = await request.json()
    
    // Validate required fields
    if (!projectData.title || !projectData.character || !projectData.series) {
      const response: ApiResponse<Project> = {
        data: {} as Project,
        success: false,
        message: 'Missing required fields: title, character, series'
      }
      return json(response, { status: 400 })
    }

    const newProject: Project = {
      id: Math.max(...projects.map(p => p.id), 0) + 1,
      title: projectData.title,
      character: projectData.character,
      series: projectData.series,
      image: projectData.image || '/placeholder.jpg',
      progress: projectData.progress || 0,
      budget: projectData.budget || { spent: 0, total: 0 },
      deadline: projectData.deadline,
      status: projectData.status || 'idea',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    projects.push(newProject)

    const response: ApiResponse<Project> = {
      data: newProject,
      success: true,
      message: 'Project created successfully'
    }

    return json(response, { status: 201 })
  } catch (error) {
    const response: ApiResponse<Project> = {
      data: {} as Project,
      success: false,
      message: 'Failed to create project'
    }
    return json(response, { status: 500 })
  }
}