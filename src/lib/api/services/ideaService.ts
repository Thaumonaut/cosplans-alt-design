import { supabase } from '$lib/supabase'
import type { Idea, IdeaCreate, IdeaUpdate } from '$lib/types/domain/idea'

export const ideaService = {
  async list(teamId: string): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(mapIdeaFromDb)
  },

  async get(id: string): Promise<Idea | null> {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data ? mapIdeaFromDb(data) : null
  },

  async create(teamId: string, idea: IdeaCreate): Promise<Idea> {
    const { data, error } = await supabase
      .from('ideas')
      .insert({
        team_id: teamId,
        character: idea.character,
        series: idea.series,
        description: idea.description,
        difficulty: idea.difficulty,
        estimated_cost: idea.estimatedCost,
        images: idea.images || [],
        tags: idea.tags || [],
        notes: idea.notes,
        status: 'saved',
      })
      .select()
      .single()

    if (error) throw error
    return mapIdeaFromDb(data)
  },

  async update(id: string, updates: IdeaUpdate): Promise<Idea | null> {
    const dbUpdates: Record<string, unknown> = {}
    if (updates.character !== undefined) dbUpdates.character = updates.character
    if (updates.series !== undefined) dbUpdates.series = updates.series
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty
    if (updates.estimatedCost !== undefined) dbUpdates.estimated_cost = updates.estimatedCost
    if (updates.images !== undefined) dbUpdates.images = updates.images
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes

    const { data, error } = await supabase
      .from('ideas')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data ? mapIdeaFromDb(data) : null
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async convert(ideaId: string, teamId: string): Promise<{ projectId: string; idea: Idea }> {
    // Get the idea first
    const idea = await this.get(ideaId)
    if (!idea) throw new Error('Idea not found')

    // Create project from idea (using RPC if available, otherwise manual insert)
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        team_id: teamId,
        from_idea_id: ideaId,
        character: idea.character,
        series: idea.series,
        description: idea.description,
        status: 'planning',
        progress: 0,
        estimated_budget: idea.estimatedCost,
        cover_image: idea.images[0] || null,
      })
      .select()
      .single()

    if (projectError) throw projectError

    // Update idea to mark as converted
    const updatedIdea = await this.update(ideaId, {
      status: 'converted',
      convertedProjectId: projectData.id,
    })

    if (!updatedIdea) throw new Error('Failed to update idea status')

    return {
      projectId: projectData.id,
      idea: updatedIdea,
    }
  },
}

function mapIdeaFromDb(row: any): Idea {
  return {
    id: row.id,
    teamId: row.team_id,
    character: row.character,
    series: row.series,
    description: row.description,
    difficulty: row.difficulty,
    estimatedCost: row.estimated_cost ? Number(row.estimated_cost) : undefined,
    images: row.images || [],
    tags: row.tags || [],
    notes: row.notes,
    status: row.status,
    convertedProjectId: row.converted_project_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

