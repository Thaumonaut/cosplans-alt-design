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
    let query = supabase.from('teams').select('*').order('created_at', { ascending: false })

    // If userId provided, filter by membership
    if (userId) {
      query = query.in(
        'id',
        supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', userId)
          .eq('status', 'active')
      )
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map((t) => ({
      id: t.id,
      name: t.name,
      type: t.type,
      createdBy: t.created_by,
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
      type: data.type,
      createdBy: data.created_by,
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

    // Create team
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: team.name,
        type: team.type || 'private',
        created_by: user.id,
      } as any)
      .select()
      .single()

    if (teamError) throw teamError

    // Add creator as owner
    const { error: memberError } = await supabase.from('team_members').insert({
      team_id: teamData.id,
      user_id: user.id,
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString(),
    } as any)

    if (memberError) throw memberError

    return {
      id: teamData.id,
      name: teamData.name,
      type: teamData.type,
      createdBy: teamData.created_by,
      createdAt: teamData.created_at,
      updatedAt: teamData.updated_at,
    }
  },

  /**
   * Get members of a team
   */
  async getMembers(teamId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select(
        `
        *,
        user:users!team_members_user_id_fkey (
          id,
          name,
          email,
          avatar_url
        )
      `
      )
      .eq('team_id', teamId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      teamId: item.team_id,
      userId: item.user_id,
      role: item.role,
      status: item.status,
      invitedBy: item.invited_by || undefined,
      invitedAt: item.invited_at || undefined,
      joinedAt: item.joined_at || undefined,
      user: item.user
        ? {
            id: item.user.id,
            name: item.user.name || undefined,
            email: item.user.email,
            avatarUrl: item.user.avatar_url || undefined,
          }
        : undefined,
    }))
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

    // Add member
    const { error } = await supabase.from('team_members').insert({
      team_id: teamId,
      user_id: userData.id,
      role: invite.role,
      status: 'active', // For MVP, auto-activate
      invited_by: user.id,
      invited_at: new Date().toISOString(),
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

    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (error || !data) return null
    return data.role
  },
}


