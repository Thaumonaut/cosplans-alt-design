import { supabase } from '$lib/supabase'
import type { Resource, ResourceCreate, ResourceUpdate } from '$lib/types/domain/resource'
import { currentTeam } from '$lib/stores/teams'
import { get } from 'svelte/store'

export const resourceService = {
  /**
   * List all resources for the current team
   */
  async list(filters?: { category?: string }): Promise<Resource[]> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    let query = supabase
      .from('resources')
      .select('*')
      .eq('team_id', team.id)
      .order('updated_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('metadata->>category', filters.category)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Resource[]
  },

  /**
   * Get a single resource by ID
   */
  async get(id: string): Promise<Resource | null> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .eq('team_id', team.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data as Resource
  },

  /**
   * Create a new resource
   */
  async create(resource: ResourceCreate): Promise<Resource> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('resources')
      .insert({
        ...resource,
        team_id: team.id,
      } as any)
      .select()
      .single()

    if (error) throw error
    return data as Resource
  },

  /**
   * Update an existing resource
   */
  async update(id: string, updates: ResourceUpdate): Promise<Resource> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('resources')
      .update(updates as any)
      .eq('id', id)
      .eq('team_id', team.id)
      .select()
      .single()

    if (error) throw error
    return data as Resource
  },

  /**
   * Delete a resource
   */
  async delete(id: string): Promise<void> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', id)
      .eq('team_id', team.id)

    if (error) throw error
  },

  /**
   * Get projects using this resource with usage details
   */
  async getProjectUsage(resourceId: string) {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('project_resources')
      .select(`
        *,
        project:projects (
          id,
          character,
          series,
          status,
          cover_image
        )
      `)
      .eq('resource_id', resourceId)

    if (error) throw error
    return data || []
  },

  /**
   * Get count of projects using this resource
   */
  async getProjectUsageCount(resourceId: string): Promise<number> {
    const { count, error } = await supabase
      .from('project_resources')
      .select('*', { count: 'exact', head: true })
      .eq('resource_id', resourceId)

    if (error) throw error
    return count || 0
  },
}

