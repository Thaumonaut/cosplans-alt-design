import { supabase } from '$lib/supabase'
import type { Tool, ToolCreate, ToolUpdate } from '$lib/types/domain/tool'
import { currentTeam } from '$lib/stores/teams'
import { get } from 'svelte/store'

export const toolService = {
  /**
   * List all tools for the current team
   */
  async list(filters?: { category?: string }): Promise<Tool[]> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    let query = supabase
      .from('tools')
      .select('*')
      .eq('team_id', team.id)
      .order('updated_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('metadata->>category', filters.category)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Tool[]
  },

  /**
   * Get a single tool by ID
   */
  async get(id: string): Promise<Tool | null> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('id', id)
      .eq('team_id', team.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data as Tool
  },

  /**
   * Create a new tool
   */
  async create(tool: ToolCreate): Promise<Tool> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('tools')
      .insert({
        ...tool,
        team_id: team.id,
      } as any)
      .select()
      .single()

    if (error) throw error
    return data as Tool
  },

  /**
   * Update an existing tool
   */
  async update(id: string, updates: ToolUpdate): Promise<Tool> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('tools')
      .update(updates as any)
      .eq('id', id)
      .eq('team_id', team.id)
      .select()
      .single()

    if (error) throw error
    return data as Tool
  },

  /**
   * Delete a tool
   */
  async delete(id: string): Promise<void> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id)
      .eq('team_id', team.id)

    if (error) throw error
  },
}


