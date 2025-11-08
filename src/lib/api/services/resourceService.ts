import { supabase } from '$lib/supabase'
import type { Resource, ResourceCreate, ResourceUpdate } from '$lib/types/domain/resource'
import { currentTeam } from '$lib/stores/teams'
import { get } from 'svelte/store'
import { reliableQuery } from '$lib/api/reliable-loader'

export const resourceService = {
  /**
   * List all resources for the current team
   */
  async list(filters?: { category?: string }): Promise<Resource[]> {
    // Wait for teams to load if necessary
    let team = get(currentTeam)
    if (!team) {
      team = await currentTeam.waitForLoad()
      if (!team) throw new Error('No team selected. Please create or select a team first.')
    }

    const queryFn = async () => {
      let query = supabase
        .from('resources')
        .select('*')
        .eq('team_id', team.id)
        .order('updated_at', { ascending: false })

      if (filters?.category) {
        query = query.eq('metadata->>category', filters.category)
      }

      return await query
    }

    const result = await reliableQuery(queryFn, { maxRetries: 3, timeout: 30000 })

    if (result.error) throw result.error
    return (result.data || []) as Resource[]
  },

  /**
   * Get a single resource by ID
   */
  async get(id: string): Promise<Resource | null> {
    // Wait for teams to load if necessary
    let team = get(currentTeam)
    if (!team) {
      team = await currentTeam.waitForLoad()
      if (!team) throw new Error('No team selected. Please create or select a team first.')
    }

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .eq('team_id', team.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      // Handle 406 and schema cache errors gracefully
      if (error.message?.includes('schema cache') || error.code === 'PGRST205' || error.code === 'PGRST204' || 
          (error as any).status === 406 || error.message?.includes('406')) {
        console.warn('[ResourceService] Schema cache issue when fetching resource, trying list method:', id)
        // Fallback: try to find it in the list
        try {
          const allResources = await this.list()
          const found = allResources.find(r => r.id === id)
          if (found) return found
        } catch (listErr) {
          console.error('[ResourceService] List fallback also failed:', listErr)
        }
        // If still not found, return null (resource might exist but not accessible due to cache)
        return null
      }
      throw error
    }

    return data as Resource
  },

  /**
   * Create a new resource
   */
  async create(resource: ResourceCreate): Promise<Resource> {
    // Wait for teams to load if necessary
    let team = get(currentTeam)
    if (!team) {
      team = await currentTeam.waitForLoad()
      if (!team) throw new Error('No team selected. Please create or select a team first.')
    }

    // Ensure user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Verify user is a member of the team (with owner/editor role for INSERT)
    // IMPORTANT: We must ensure the membership has status='active' BEFORE attempting INSERT
    // because RLS policies check at INSERT time
    
    // First, check if user is team owner
    const { data: teamData } = await supabase
      .from('teams')
      .select('owner_id')
      .eq('id', team.id)
      .single()

    const isTeamOwner = teamData && (teamData as any).owner_id === user.id

    // Check membership - try to get status if column exists, otherwise just role
    let membership: any = null
    let membershipError: any = null
    
    try {
      const result = await supabase
        .from('team_members')
        .select('role, status')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .maybeSingle()
      
      membership = result.data
      membershipError = result.error
    } catch (err: any) {
      // If status column doesn't exist, try without it
      if (err?.message?.includes('status') || err?.code === '42703') {
        const result = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', team.id)
          .eq('user_id', user.id)
          .maybeSingle()
        
        membership = result.data
        membershipError = result.error
      } else {
        membershipError = err
      }
    }

    // Ensure membership exists BEFORE attempting insert
    // If status column doesn't exist, we'll just ensure role is correct
    const hasStatusColumn = membership && 'status' in membership
    const needsFix = 
      // No membership but user is owner
      (!membership && isTeamOwner) ||
      // Membership exists but status is wrong (only if status column exists)
      (hasStatusColumn && membership && ['owner', 'editor'].includes(membership.role) && membership.status !== 'active') ||
      // Membership exists but status not visible (schema cache issue)
      (membership && ['owner', 'editor'].includes(membership.role) && !hasStatusColumn)

    if (needsFix) {
      // Fix the membership BEFORE attempting insert
      const membershipData: any = {
        team_id: team.id,
        user_id: user.id,
        role: isTeamOwner ? 'owner' : (membership?.role || 'editor'),
        joined_at: membership ? undefined : new Date().toISOString()
      }

      // Only include status if the column exists (we'll let the database use default if not)
      if (hasStatusColumn || !membership) {
        membershipData.status = 'active'
      }

      const { error: fixError } = await supabase
        .from('team_members')
        .upsert(membershipData, {
          onConflict: 'team_id,user_id'
        })

      if (fixError) {
        // If error is about status column, try without it
        if (fixError?.message?.includes('status') || fixError?.code === '42703') {
          delete membershipData.status
          const retryResult = await supabase
            .from('team_members')
            .upsert(membershipData, {
              onConflict: 'team_id,user_id'
            })
          
          if (retryResult.error) {
            console.warn('Could not fix team membership:', retryResult.error)
          } else {
            console.log('Fixed team membership before resource creation (without status column)')
          }
        } else {
          console.warn('Could not fix team membership status:', fixError)
        }
        // Continue anyway - RLS might still work if user is owner
      } else {
        console.log('Fixed team membership status before resource creation')
        // Wait a brief moment for RLS to pick up the change
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Verify we have valid membership after fix attempt
    if (!membership && !isTeamOwner) {
      throw new Error(
        `You must be an owner or editor of this team to create resources. ` +
        `Please contact the team owner to add you as a member.`
      )
    }

    if (membership && !['owner', 'editor'].includes(membership.role) && !isTeamOwner) {
      throw new Error(
        `You must be an owner or editor of this team to create resources. ` +
        `Current role: ${membership.role}. Please contact the team owner to update your role.`
      )
    }

    // Try using RPC function first (bypasses schema cache issues)
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_resource_safe', {
        p_team_id: team.id,
        p_name: resource.name,
        p_description: resource.description || null,
        p_images: resource.images || [],
        p_cost: resource.cost || null,
        p_tags: resource.tags || [],
        p_notes: resource.notes || null,
        p_metadata: resource.metadata || { category: 'prop' },
      } as any)

      if (!rpcError && rpcData && rpcData.length > 0) {
        return rpcData[0] as Resource
      }
      
      // If RPC fails due to function not existing, fall through to direct insert
      if (rpcError && !rpcError.message?.includes('function') && !rpcError.code?.includes('42883')) {
        throw rpcError
      }
    } catch (rpcErr: any) {
      // If function doesn't exist, continue to direct insert
      if (!rpcErr?.message?.includes('function') && !rpcErr?.code?.includes('42883')) {
        throw rpcErr
      }
    }

    // Fallback: Direct insert (for when RPC function doesn't exist)
    // Build insert data, mapping camelCase to snake_case
    const insertData: Record<string, unknown> = {
      team_id: team.id,
      name: resource.name,
      description: resource.description || null,
      images: resource.images || [],
      tags: resource.tags || [],
      metadata: resource.metadata || { category: 'prop' },
    }

    // Only include optional fields if they have values
    if (resource.cost !== undefined && resource.cost !== null) {
      insertData.cost = resource.cost
    }
    if (resource.notes !== undefined && resource.notes !== null) {
      insertData.notes = resource.notes
    }

    const { data, error } = await supabase
      .from('resources')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // Provide more helpful error message for RLS violations
      if (error.code === '42501') {
        throw new Error(
          `Permission denied: You must be an owner or editor of this team to create resources. ` +
          `Please run the migration 20250000000016_create_resource_safe.sql in your Supabase SQL Editor, ` +
          `or ensure your team membership has status='active'.`
        )
      }
      throw error
    }
    
    return data as Resource
  },

  /**
   * Update an existing resource
   */
  async update(id: string, updates: ResourceUpdate): Promise<Resource> {
    // Wait for teams to load if necessary
    let team = get(currentTeam)
    if (!team) {
      team = await currentTeam.waitForLoad()
      if (!team) throw new Error('No team selected. Please create or select a team first.')
    }

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
    // Wait for teams to load if necessary
    let team = get(currentTeam)
    if (!team) {
      team = await currentTeam.waitForLoad()
      if (!team) throw new Error('No team selected. Please create or select a team first.')
    }

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
    // Wait for teams to load if necessary
    let team = get(currentTeam)
    if (!team) {
      team = await currentTeam.waitForLoad()
      if (!team) throw new Error('No team selected. Please create or select a team first.')
    }

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

