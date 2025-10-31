import { supabase } from '$lib/supabase'

export type Team = {
  id: string
  name: string
  type: 'personal' | 'private'
  createdBy: string
}

export const teamService = {
  async list(userId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name, type, created_by')
    if (error) throw error
    return (data || []).map((t) => ({
      id: t.id as string,
      name: t.name as string,
      type: t.type as 'personal' | 'private',
      createdBy: (t as any).created_by as string,
    }))
  },
}


