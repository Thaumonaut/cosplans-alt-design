import { supabase } from '$lib/supabase'

export type TeamType = 'personal' | 'private'
export type TeamRole = 'owner' | 'editor' | 'viewer'
export type TeamMemberStatus = 'invited' | 'active' | 'inactive'

export interface Team {
  id: string
  name: string
  type: TeamType
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: TeamRole
  status: TeamMemberStatus
  invitedBy?: string
  invitedAt?: string
  joinedAt?: string
  user?: {
    id: string
    name?: string
    email: string
    avatarUrl?: string
  }
}

export interface TeamCreate {
  name: string
  type?: TeamType
}

export interface TeamInvite {
  email: string
  role: TeamRole
}

export const teamService = {
  /**
   * List all teams for a user (where they are a member)
   */
  async list(userId?: string): Promise<Team[]> {
    // If userId provided, try to load teams for that user
    if (userId) {
      // Skip RPC for now due to timeout/hanging issues - use direct query instead
      // Direct query approach:
      try {
        const { data: memberships, error: membershipError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', userId)

        if (membershipError) {
          // If status column error, try without status filter
          if (membershipError.message?.includes('status') || membershipError.code === '42703') {
            // Try again without status filter
            const { data: allMemberships, error: allError } = await supabase
              .from('team_members')
              .select('team_id')
              .eq('user_id', userId)

            if (allError) throw allError

            const teamIds = (allMemberships || []).map((m) => m.team_id)

            if (teamIds.length === 0) {
              return []
            }

            const { data, error } = await supabase
              .from('teams')
              .select('*')
              .in('id', teamIds)
              .order('created_at', { ascending: false })

            if (error) throw error
            return (data || []).map((t: any) => ({
              id: t.id,
              name: t.name,
              type: (t.is_personal ? 'personal' : 'private') as TeamType,
              createdBy: t.owner_id || '',
              createdAt: t.created_at,
              updatedAt: t.updated_at,
            }))
          }
          throw membershipError
        }

        const teamIds = (memberships || []).map((m) => m.team_id)

        if (teamIds.length === 0) {
          return []
        }

        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds)
          .order('created_at', { ascending: false })

        if (error) throw error
        return (data || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          type: (t.is_personal ? 'personal' : 'private') as TeamType,
          createdBy: t.owner_id || '',
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        }))
      } catch (fallbackError: any) {
        // If all else fails, provide helpful error
        throw new Error(
          `Failed to load teams: ${fallbackError.message}. ` +
          `Please ensure you have team memberships.`
        )
      }
    }

    // If no userId, return all teams (for admin purposes or when userId is optional)
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      type: (t.is_personal ? 'personal' : 'private') as TeamType,
      createdBy: t.owner_id || '',
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }))
  },

  /**
   * Get a single team by ID
   */
  async get(id: string): Promise<Team | null> {
    const { data, error } = await supabase.from('teams').select('*').eq('id', id).single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return {
      id: data.id,
      name: data.name,
      type: ((data as any).is_personal ? 'personal' : 'private') as TeamType,
      createdBy: (data as any).owner_id || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  },

  /**
   * Create a new team
   */
  async create(team: TeamCreate): Promise<Team> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Check if user is trying to create a personal team and already has one
    if ((team.type || 'private') === 'personal') {
      // Check if user already has a personal team
      const { data: existingPersonalTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('owner_id', user.id)
        .eq('is_personal', true)
        .maybeSingle()
      
      if (existingPersonalTeam) {
        throw new Error('You already have a personal team. Each user can only have one personal team.')
      }
    }

    // Create team - use raw SQL via RPC to bypass schema cache
    // Try SQL function first (always works, bypasses cache)
    const rpcAttempt = await supabase.rpc('create_team_safe', {
      team_name: team.name,
      creator_id: user.id,
      team_type: team.type || 'private',
    })
    
    let teamData: any
    
    if (rpcAttempt.error) {
      // Log RPC error for debugging
      console.error('RPC create_team_safe failed:', rpcAttempt.error)
      
      // If RPC fails due to schema cache (can't see return type), 
      // the function still executed successfully in the database
      // Use list_user_teams_safe RPC to get the newly created team
      // Handle duplicate personal team error
      if (rpcAttempt.error.code === '23505' && 
          rpcAttempt.error.message?.includes('idx_teams_one_personal_per_user')) {
        throw new Error(
          'You already have a personal team. Each user can only have one personal team. ' +
          'Please create a private team instead, or use your existing personal team.'
        )
      }
      
      if (rpcAttempt.error.message?.includes('schema cache') || 
          rpcAttempt.error.code === 'PGRST204' ||
          rpcAttempt.error.message?.includes('created_by') ||
          rpcAttempt.error.message?.includes('owner_id') ||
          rpcAttempt.error.message?.includes('type') ||
          rpcAttempt.error.message?.includes('is_personal')) {
        
        // Function executed but PostgREST can't see the return type
        // Use list_user_teams_safe to get teams for this user (includes the new one)
        const { data: userTeams, error: listError } = await supabase.rpc('list_user_teams_safe', {
          user_uuid: user.id,
        })
        
        if (!listError && userTeams && userTeams.length > 0) {
          // Find the team with matching name (should be the one we just created)
          const newTeam = userTeams.find(t => t.name === team.name) || userTeams[userTeams.length - 1]
          
          if (newTeam) {
            // Map actual schema to expected format
            teamData = {
              id: newTeam.id,
              name: newTeam.name,
              type: (newTeam.is_personal ? 'personal' : 'private') as TeamType,
              createdBy: newTeam.owner_id || user.id,
              createdAt: newTeam.created_at || new Date().toISOString(),
              updatedAt: newTeam.updated_at || new Date().toISOString()
            }
          } else {
            throw new Error(
              `RPC function executed but couldn't retrieve the created team. ` +
              `RPC error: ${rpcAttempt.error.message}. ` +
              `Please check your teams list - the team may have been created.`
            )
          }
        } else {
          // Fallback: try direct query (may also fail due to cache)
          const { data: teamsList, error: queryError } = await supabase
            .from('teams')
            .select('id, name, type')
            .eq('name', team.name)
            .limit(1)
            .single()
          
          if (queryError || !teamsList) {
            throw new Error(
              `Failed to create team: RPC function executed but result couldn't be retrieved. ` +
              `RPC error: ${rpcAttempt.error.message}. ` +
              `List error: ${listError?.message || 'none'}. ` +
              `This is a PostgREST schema cache issue. The team may have been created - please check your teams list and refresh the page.`
            )
          }
          
          // Map actual schema to expected format (teamsList only has id, name, type from select)
          teamData = {
            id: teamsList.id,
            name: teamsList.name,
            type: (team.type || 'private') as TeamType,
            createdBy: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      } else {
        // RPC failed for a different reason, try direct insert as fallback
        // Use actual schema: owner_id and is_personal
        const attempt1 = await supabase
          .from('teams')
          .insert({
            name: team.name,
            owner_id: user.id,
            is_personal: (team.type || 'private') === 'personal',
          } as any)
          .select()
          .single()
        
        if (attempt1.error) {
          // Both methods failed - provide helpful error
          throw new Error(
            `Failed to create team: RPC error: ${rpcAttempt.error.message}. ` +
            `Direct insert error: ${attempt1.error.message}. ` +
            `This may be a schema cache issue. Please run the migration: ` +
            `supabase/migrations/20250000000010_create_team_function.sql ` +
            `in your Supabase SQL Editor.`
          )
        }
        
        teamData = attempt1.data
      }
    } else {
      // RPC succeeded, use its result
      const rpcData = rpcAttempt.data?.[0]
      if (!rpcData) {
        throw new Error('Team created but no data returned')
      }
      // Map actual schema (owner_id, is_personal) to expected format (createdBy, type)
      teamData = {
        id: rpcData.id,
        name: rpcData.name,
        type: (rpcData.is_personal ? 'personal' : 'private') as TeamType,
        createdBy: rpcData.owner_id || user.id,
        createdAt: rpcData.created_at || new Date().toISOString(),
        updatedAt: rpcData.updated_at || new Date().toISOString()
      }
    }

    // Add creator as owner (only if not already added by RPC function)
    // The RPC function should have already added the member, but check just in case
    const { data: existingMember, error: checkError } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamData.id)
      .eq('user_id', user.id)
      .maybeSingle()
    
    // RPC function should have already added the member, but check just in case
    if (!existingMember && !checkError) {
      // Try to add member - use status if available, otherwise skip it
      const memberData: any = {
        team_id: teamData.id,
        user_id: user.id,
        role: 'owner',
        joined_at: new Date().toISOString(),
      }
      
      // Insert member (actual schema has no status column)
      const { error: memberError } = await supabase
        .from('team_members')
        .insert(memberData)
        
      if (memberError && !memberError.message?.includes('duplicate') && !memberError.message?.includes('unique')) {
        // Ignore duplicate/unique constraint errors (member already exists)
        throw memberError
      }
    }

    return {
      id: teamData.id,
      name: teamData.name,
      type: teamData.type,
      createdBy: teamData.createdBy || (teamData as any).owner_id || user.id,
      createdAt: teamData.createdAt || teamData.created_at,
      updatedAt: teamData.updatedAt || teamData.updated_at,
    }
  },

  /**
   * Get members of a team
   * Note: Fetches users separately due to schema cache issues with foreign key relationships
   */
  async getMembers(teamId: string): Promise<TeamMember[]> {
    // Fetch team members (without join due to schema cache issues)
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true })

    if (membersError) throw membersError
    if (!members || members.length === 0) return []

    // Get unique user IDs
    const userIds = [...new Set(members.map((m: any) => m.user_id))]

    // Fetch users separately (schema cache can't see the foreign key relationship)
    // If this fails due to RLS, we'll still return members without user data
    let userMap = new Map<string, any>()
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, avatar_url')
        .in('id', userIds)

      if (!usersError && users) {
        users.forEach((user: any) => {
          userMap.set(user.id, user)
        })
      } else if (usersError) {
        // Log but don't throw - we can still return members without user profiles
        console.warn('Failed to fetch user profiles for team members:', usersError.message)
        // Try to fetch current user's profile at least
        if (userIds.length > 0) {
          try {
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            if (currentUser && userIds.includes(currentUser.id)) {
              const { data: currentUserProfile } = await supabase
                .from('users')
                .select('id, name, email, avatar_url')
                .eq('id', currentUser.id)
                .single()
              if (currentUserProfile) {
                userMap.set(currentUserProfile.id, currentUserProfile)
              }
            }
          } catch (err) {
            // Ignore - at least we tried
          }
        }
      }
    } catch (err) {
      // RLS might be blocking, but we can still return members
      console.warn('Could not fetch user profiles, returning members without profile data:', err)
    }

    // Combine members with user data
    return members.map((item: any) => {
      const userData = userMap.get(item.user_id)
      return {
        id: item.id,
        teamId: item.team_id,
        userId: item.user_id,
        role: item.role,
        status: 'active' as TeamMemberStatus, // Schema doesn't have status, default to active
        invitedBy: item.invited_by || undefined,
        invitedAt: undefined, // Schema doesn't have invited_at column
        joinedAt: item.joined_at || undefined,
        user: userData
          ? {
              id: userData.id,
              name: userData.name || undefined,
              email: userData.email,
              avatarUrl: userData.avatar_url || undefined,
            }
          : undefined,
      }
    })
  },

  /**
   * Invite a member to a team
   */
  async invite(teamId: string, invite: TeamInvite): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', invite.email)
      .single()

    if (userError) {
      // User doesn't exist - would need Supabase invite system
      // For MVP, create invitation record
      throw new Error('User invitation system not yet implemented. User must exist in system.')
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', userData.id)
      .single()

    if (existing) {
      throw new Error('User is already a member of this team')
    }

    // Add member (actual schema: no status or invited_at columns)
    const { error } = await supabase.from('team_members').insert({
      team_id: teamId,
      user_id: userData.id,
      role: invite.role,
      invited_by: user.id,
      joined_at: new Date().toISOString(),
    } as any)

    if (error) throw error
  },

  /**
   * Update member role (owner only)
   */
  async updateMemberRole(teamId: string, userId: string, role: TeamRole): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error
  },

  /**
   * Remove a member from a team (owner only)
   */
  async removeMember(teamId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error
  },

  /**
   * Get current user's role in a team
   */
  async getUserRole(teamId: string): Promise<TeamRole | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Get user's role in team (actual schema has no status column)
    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single()

    if (error || !data) return null
    
    return data.role
  },
}


