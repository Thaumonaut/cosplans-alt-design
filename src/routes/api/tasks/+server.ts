import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type { Task, ApiResponse } from '$lib/types'

// Mock database - in a real app, this would be a database connection
let tasks: Task[] = [
  {
    id: 1,
    title: 'Order bamboo muzzle prop',
    description: 'Find and order the bamboo muzzle for Nezuko cosplay',
    completed: false,
    projectId: 1,
    dueDate: new Date('2025-11-15'),
    priority: 'high'
  },
  {
    id: 2,
    title: 'Sew kimono sleeves',
    description: 'Complete the kimono sleeves with proper measurements',
    completed: true,
    projectId: 1,
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Style wig',
    description: 'Cut and style the white wig for Gojo',
    completed: false,
    projectId: 3,
    dueDate: new Date('2025-12-01'),
    priority: 'medium'
  }
]

export const GET: RequestHandler = async ({ url }) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 80))

    const projectId = url.searchParams.get('projectId')
    const completed = url.searchParams.get('completed')
    const priority = url.searchParams.get('priority')

    let filteredTasks = tasks

    // Filter by project ID if provided
    if (projectId) {
      const id = parseInt(projectId)
      if (!isNaN(id)) {
        filteredTasks = filteredTasks.filter(t => t.projectId === id)
      }
    }

    // Filter by completion status if provided
    if (completed !== null) {
      const isCompleted = completed === 'true'
      filteredTasks = filteredTasks.filter(t => t.completed === isCompleted)
    }

    // Filter by priority if provided
    if (priority && priority !== 'all') {
      filteredTasks = filteredTasks.filter(t => t.priority === priority)
    }

    const response: ApiResponse<Task[]> = {
      data: filteredTasks,
      success: true,
      message: `Retrieved ${filteredTasks.length} tasks`
    }

    return json(response)
  } catch (error) {
    const response: ApiResponse<Task[]> = {
      data: [],
      success: false,
      message: 'Failed to fetch tasks'
    }
    return json(response, { status: 500 })
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const taskData = await request.json()
    
    // Validate required fields
    if (!taskData.title) {
      const response: ApiResponse<Task> = {
        data: {} as Task,
        success: false,
        message: 'Missing required field: title'
      }
      return json(response, { status: 400 })
    }

    const newTask: Task = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      title: taskData.title,
      description: taskData.description,
      completed: taskData.completed || false,
      projectId: taskData.projectId,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      priority: taskData.priority || 'medium'
    }

    tasks.push(newTask)

    const response: ApiResponse<Task> = {
      data: newTask,
      success: true,
      message: 'Task created successfully'
    }

    return json(response, { status: 201 })
  } catch (error) {
    const response: ApiResponse<Task> = {
      data: {} as Task,
      success: false,
      message: 'Failed to create task'
    }
    return json(response, { status: 500 })
  }
}