import { supabase } from '$lib/supabase'
import type { Project, ProjectCreate, ProjectUpdate } from '$lib/types/domain/project'
import { currentTeam } from '$lib/stores/teams'
import { get } from 'svelte/store'

export const projectService = {
  /**
   * List all projects for the current team
   */
  async list(filters?: { status?: string }): Promise<Project[]> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    let query = supabase
      .from('projects')
      .select('*')
      .eq('team_id', team.id)
      .order('updated_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Project[]
  },

  /**
   * Get a single project by ID
   */
  async get(id: string): Promise<Project | null> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('team_id', team.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data as Project
  },

  /**
   * Create a new project
   */
  async create(project: ProjectCreate): Promise<Project> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...project,
        team_id: team.id,
      } as any)
      .select()
      .single()

    if (error) throw error
    return data as Project
  },

  /**
   * Update an existing project
   */
  async update(id: string, updates: ProjectUpdate): Promise<Project> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('projects')
      .update(updates as any)
      .eq('id', id)
      .eq('team_id', team.id)
      .select()
      .single()

    if (error) throw error
    return data as Project
  },

  /**
   * Delete a project
   */
  async delete(id: string): Promise<void> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('team_id', team.id)

    if (error) throw error
  },

  /**
   * Link a resource to a project with quantity and status
   */
  async linkResource(
    projectId: string,
    resourceId: string,
    quantity: number = 1,
    status: 'needed' | 'acquired' | 'in-progress' | 'completed' = 'needed'
  ): Promise<void> {
    const { error } = await supabase.from('project_resources').insert({
      project_id: projectId,
      resource_id: resourceId,
      quantity,
      status,
    } as any)

    if (error) throw error
  },

  /**
   * Unlink a resource from a project
   */
  async unlinkResource(projectId: string, resourceId: string): Promise<void> {
    const { error } = await supabase
      .from('project_resources')
      .delete()
      .eq('project_id', projectId)
      .eq('resource_id', resourceId)

    if (error) throw error
  },

  /**
   * Update resource link (quantity, status, notes)
   */
  async updateResourceLink(
    projectId: string,
    resourceId: string,
    updates: {
      quantity?: number
      status?: 'needed' | 'acquired' | 'in-progress' | 'completed'
      notes?: string
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('project_resources')
      .update(updates as any)
      .eq('project_id', projectId)
      .eq('resource_id', resourceId)

    if (error) throw error
  },

  /**
   * Get all resources linked to a project
   */
  async getLinkedResources(projectId: string): Promise<any[]> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('project_resources')
      .select(`
        *,
        resource:resources (*)
      `)
      .eq('project_id', projectId)

    if (error) throw error
    return data || []
  },

  /**
   * Calculate project progress using the PostgreSQL function
   */
  async calculateProgress(projectId: string): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_project_progress', {
      project_uuid: projectId,
    } as any)

    if (error) throw error
    return data as number
  },
}

