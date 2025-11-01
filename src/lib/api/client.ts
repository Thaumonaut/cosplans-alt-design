import { browser } from '$app/environment'
import type { ApiResponse, Project, Task, Event } from '$lib/types'

/**
 * Base API client with error handling and loading states
 */
class ApiClient {
  private baseUrl: string

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    customFetch?: typeof fetch
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    // Use customFetch if provided (from SvelteKit load function), otherwise fall back to global fetch
    // In browser, this will be window.fetch. In server load functions, this must be event.fetch
    const fetchFn = customFetch || (typeof globalThis !== 'undefined' ? globalThis.fetch : fetch)
    
    try {
      const response = await fetchFn(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      const data: ApiResponse<T> = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error instanceof Error ? error : new Error('Unknown API error')
    }
  }

  // Projects API
  async getProjects(params?: {
    status?: string
    limit?: number
    offset?: number
  }, customFetch?: typeof fetch): Promise<ApiResponse<Project[]>> {
    const searchParams = new URLSearchParams()
    
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const query = searchParams.toString()
    const endpoint = `/projects${query ? `?${query}` : ''}`
    
    return this.request<Project[]>(endpoint, {}, customFetch)
  }

  async getProject(id: number): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${id}`)
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Project>> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    })
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async deleteProject(id: number): Promise<ApiResponse<null>> {
    return this.request<null>(`/projects/${id}`, {
      method: 'DELETE'
    })
  }

  // Tasks API
  async getTasks(params?: {
    projectId?: number
    completed?: boolean
    priority?: string
  }, customFetch?: typeof fetch): Promise<ApiResponse<Task[]>> {
    const searchParams = new URLSearchParams()
    
    if (params?.projectId) searchParams.set('projectId', params.projectId.toString())
    if (params?.completed !== undefined) searchParams.set('completed', params.completed.toString())
    if (params?.priority) searchParams.set('priority', params.priority)

    const query = searchParams.toString()
    const endpoint = `/tasks${query ? `?${query}` : ''}`
    
    return this.request<Task[]>(endpoint, {}, customFetch)
  }

  async createTask(task: Omit<Task, 'id'>): Promise<ApiResponse<Task>> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    })
  }

  // Events API
  async getEvents(params?: {
    projectId?: number
    type?: string
    upcoming?: boolean
  }, customFetch?: typeof fetch): Promise<ApiResponse<Event[]>> {
    const searchParams = new URLSearchParams()
    
    if (params?.projectId) searchParams.set('projectId', params.projectId.toString())
    if (params?.type) searchParams.set('type', params.type)
    if (params?.upcoming !== undefined) searchParams.set('upcoming', params.upcoming.toString())

    const query = searchParams.toString()
    const endpoint = `/events${query ? `?${query}` : ''}`
    
    return this.request<Event[]>(endpoint, {}, customFetch)
  }

  async createEvent(event: Omit<Event, 'id'>): Promise<ApiResponse<Event>> {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(event)
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

/**
 * Loading state management for API calls
 */
export class LoadingState {
  private _loading = false
  private _error: string | null = null

  get loading() {
    return this._loading
  }

  get error() {
    return this._error
  }

  async execute<T>(apiCall: () => Promise<T>): Promise<T | null> {
    this._loading = true
    this._error = null

    try {
      const result = await apiCall()
      return result
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'An error occurred'
      console.error('API call failed:', error)
      return null
    } finally {
      this._loading = false
    }
  }

  reset() {
    this._loading = false
    this._error = null
  }
}

/**
 * Reactive data loader with caching (using regular stores for compatibility)
 */
export class DataLoader<T> {
  private _data: T | null = null
  private _loading = false
  private _error: string | null = null
  private _lastFetch = 0
  private cacheDuration: number

  constructor(cacheDuration = 5 * 60 * 1000) { // 5 minutes default
    this.cacheDuration = cacheDuration
  }

  get data() {
    return this._data
  }

  get loading() {
    return this._loading
  }

  get error() {
    return this._error
  }

  get isStale() {
    return Date.now() - this._lastFetch > this.cacheDuration
  }

  async load(fetcher: () => Promise<T>, forceRefresh = false): Promise<T | null> {
    // Return cached data if not stale and not forcing refresh
    if (this._data && !this.isStale && !forceRefresh) {
      return this._data
    }

    this._loading = true
    this._error = null

    try {
      const result = await fetcher()
      this._data = result
      this._lastFetch = Date.now()
      return result
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to load data'
      console.error('Data loading failed:', error)
      return null
    } finally {
      this._loading = false
    }
  }

  invalidate() {
    this._lastFetch = 0
  }

  reset() {
    this._data = null
    this._loading = false
    this._error = null
    this._lastFetch = 0
  }
}