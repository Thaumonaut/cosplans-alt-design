import { supabase } from '$lib/supabase'
import type {
  Photoshoot,
  PhotoshootCreate,
  PhotoshootUpdate,
  Shot,
  ShotCreate,
  ShotUpdate,
  CrewMember,
  CrewMemberCreate,
  CrewMemberUpdate,
} from '$lib/types/domain/photoshoot'
import { currentTeam } from '$lib/stores/teams'
import { get } from 'svelte/store'

export const photoshootService = {
  /**
   * List all photoshoots for the current team
   */
  async list(filters?: { status?: string }): Promise<Photoshoot[]> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    let query = supabase
      .from('photoshoots')
      .select('*')
      .eq('team_id', team.id)
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Photoshoot[]
  },

  /**
   * Get a single photoshoot by ID with related data
   */
  async get(id: string): Promise<Photoshoot | null> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('photoshoots')
      .select('*')
      .eq('id', id)
      .eq('team_id', team.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data as Photoshoot
  },

  /**
   * Create a new photoshoot and optionally link projects
   */
  async create(photoshoot: PhotoshootCreate): Promise<Photoshoot> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('photoshoots')
      .insert({
        title: photoshoot.title,
        date: photoshoot.date || null,
        location: photoshoot.location || null,
        description: photoshoot.description || null,
        team_id: team.id,
      } as any)
      .select()
      .single()

    if (error) throw error

    const created = data as Photoshoot

    // Link projects if provided
    if (photoshoot.projectIds && photoshoot.projectIds.length > 0) {
      await photoshootService.linkProject(created.id, photoshoot.projectIds)
    }

    return created
  },

  /**
   * Update an existing photoshoot
   */
  async update(id: string, updates: PhotoshootUpdate): Promise<Photoshoot> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { data, error } = await supabase
      .from('photoshoots')
      .update(updates as any)
      .eq('id', id)
      .eq('team_id', team.id)
      .select()
      .single()

    if (error) throw error
    return data as Photoshoot
  },

  /**
   * Delete a photoshoot
   */
  async delete(id: string): Promise<void> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    const { error } = await supabase
      .from('photoshoots')
      .delete()
      .eq('id', id)
      .eq('team_id', team.id)

    if (error) throw error
  },

  /**
   * Link projects to a photoshoot
   */
  async linkProject(photoshootId: string, projectIds: string[]): Promise<void> {
    const team = get(currentTeam)
    if (!team) throw new Error('No team selected')

    // First, get existing links to avoid duplicates
    const { data: existing } = await supabase
      .from('photoshoot_projects')
      .select('project_id')
      .eq('photoshoot_id', photoshootId)

    const existingIds = new Set(existing?.map((e) => e.project_id) || [])

    // Insert only new links
    const newLinks = projectIds
      .filter((pid) => !existingIds.has(pid))
      .map((projectId) => ({
        photoshoot_id: photoshootId,
        project_id: projectId,
      }))

    if (newLinks.length > 0) {
      const { error } = await supabase.from('photoshoot_projects').insert(newLinks)

      if (error) throw error
    }
  },

  /**
   * Unlink a project from a photoshoot
   */
  async unlinkProject(photoshootId: string, projectId: string): Promise<void> {
    const { error } = await supabase
      .from('photoshoot_projects')
      .delete()
      .eq('photoshoot_id', photoshootId)
      .eq('project_id', projectId)

    if (error) throw error
  },

  /**
   * Get shots for a photoshoot
   */
  async getShots(photoshootId: string): Promise<Shot[]> {
    const { data, error } = await supabase
      .from('shots')
      .select('*')
      .eq('photoshoot_id', photoshootId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return (data || []) as Shot[]
  },

  /**
   * Add a shot to a photoshoot
   */
  async addShot(photoshootId: string, shot: ShotCreate): Promise<Shot> {
    const { data, error } = await supabase
      .from('shots')
      .insert({
        photoshoot_id: photoshootId,
        description: shot.description,
        pose: shot.pose || null,
        reference_image: shot.referenceImage || null,
        order_index: shot.orderIndex || 0,
      } as any)
      .select()
      .single()

    if (error) throw error
    return data as Shot
  },

  /**
   * Update a shot
   */
  async updateShot(shotId: string, updates: ShotUpdate): Promise<Shot> {
    const { data, error } = await supabase
      .from('shots')
      .update(updates as any)
      .eq('id', shotId)
      .select()
      .single()

    if (error) throw error
    return data as Shot
  },

  /**
   * Delete a shot
   */
  async deleteShot(shotId: string): Promise<void> {
    const { error } = await supabase.from('shots').delete().eq('id', shotId)

    if (error) throw error
  },

  /**
   * Get crew members for a photoshoot
   */
  async getCrew(photoshootId: string): Promise<CrewMember[]> {
    const { data, error } = await supabase
      .from('crew_members')
      .select('*')
      .eq('photoshoot_id', photoshootId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []) as CrewMember[]
  },

  /**
   * Add a crew member to a photoshoot
   */
  async addCrew(photoshootId: string, crew: CrewMemberCreate): Promise<CrewMember> {
    const { data, error } = await supabase
      .from('crew_members')
      .insert({
        photoshoot_id: photoshootId,
        name: crew.name,
        role: crew.role,
        contact: crew.contact || null,
      } as any)
      .select()
      .single()

    if (error) throw error
    return data as CrewMember
  },

  /**
   * Update a crew member
   */
  async updateCrew(crewId: string, updates: CrewMemberUpdate): Promise<CrewMember> {
    const { data, error } = await supabase
      .from('crew_members')
      .update(updates as any)
      .eq('id', crewId)
      .select()
      .single()

    if (error) throw error
    return data as CrewMember
  },

  /**
   * Delete a crew member
   */
  async deleteCrew(crewId: string): Promise<void> {
    const { error } = await supabase.from('crew_members').delete().eq('id', crewId)

    if (error) throw error
  },

  /**
   * Get linked projects for a photoshoot
   */
  async getLinkedProjects(photoshootId: string) {
    const { data, error } = await supabase
      .from('photoshoot_projects')
      .select(
        `
        *,
        project:projects (
          id,
          character,
          series,
          cover_image
        )
      `
      )
      .eq('photoshoot_id', photoshootId)

    if (error) throw error
    return data || []
  },
}

