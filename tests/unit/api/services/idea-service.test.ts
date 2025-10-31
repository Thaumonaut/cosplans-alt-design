import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('$env/static/public', () => ({
  PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  PUBLIC_SUPABASE_ANON_KEY: 'anon-key'
}), { virtual: true })

const { ideaService } = await import('../../../../src/lib/api/services/ideaService')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { supabase } = require('../../../../src/lib/supabase') as { supabase: any }

describe('ideaService (TDD)', () => {
  let mockChain: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock the chainable query builder
    mockChain = {
      select: vi.fn(() => mockChain),
      insert: vi.fn(() => mockChain),
      update: vi.fn(() => mockChain),
      delete: vi.fn(() => mockChain),
      eq: vi.fn(() => mockChain),
      single: vi.fn(() => mockChain),
      order: vi.fn(() => mockChain),
    }
    
    // Ensure delete().eq() works
    const deleteChain = { ...mockChain }
    mockChain.delete = vi.fn(() => deleteChain)

    supabase.from = vi.fn(() => mockChain)
    supabase.rpc = vi.fn()
  })

  it('should list ideas for current team', async () => {
    const mockIdeas = [
      {
        id: 'idea-1',
        team_id: 'team-1',
        character: 'Spike Spiegel',
        series: 'Cowboy Bebop',
        difficulty: 'intermediate',
        status: 'saved',
        estimated_cost: 150.00,
        images: [],
        tags: ['space', 'bounty-hunter'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    mockChain.order.mockResolvedValue({ data: mockIdeas, error: null })

    const result = await ideaService.list('team-1')

    expect(result).toHaveLength(1)
    expect(result[0].character).toBe('Spike Spiegel')
    expect(result[0].difficulty).toBe('intermediate')
    expect(supabase.from).toHaveBeenCalledWith('ideas')
  })

  it('should get a single idea by id', async () => {
    const mockIdea = {
      id: 'idea-1',
      team_id: 'team-1',
      character: 'Spike Spiegel',
      series: 'Cowboy Bebop',
      difficulty: 'intermediate',
      status: 'saved',
      images: ['https://example.com/image.jpg'],
      tags: ['space'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    mockChain.single.mockResolvedValue({ data: mockIdea, error: null })

    const result = await ideaService.get('idea-1')

    expect(result?.character).toBe('Spike Spiegel')
    expect(result?.images).toEqual(['https://example.com/image.jpg'])
    expect(supabase.from).toHaveBeenCalledWith('ideas')
  })

  it('should return null if idea not found', async () => {
    mockChain.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

    const result = await ideaService.get('nonexistent')

    expect(result).toBeNull()
  })

  it('should create a new idea', async () => {
    const newIdea = {
      character: 'Edward Elric',
      series: 'Fullmetal Alchemist',
      difficulty: 'advanced' as const,
      estimatedCost: 200,
      tags: ['alchemy'],
    }

    const mockCreated = {
      id: 'idea-2',
      team_id: 'team-1',
      character: 'Edward Elric',
      series: 'Fullmetal Alchemist',
      difficulty: 'advanced',
      status: 'saved',
      estimated_cost: 200,
      images: [],
      tags: ['alchemy'],
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    mockChain.single.mockResolvedValue({ data: mockCreated, error: null })

    const result = await ideaService.create('team-1', newIdea)

    expect(result.character).toBe('Edward Elric')
    expect(result.difficulty).toBe('advanced')
    expect(supabase.from).toHaveBeenCalledWith('ideas')
    expect(mockChain.insert).toHaveBeenCalled()
  })

  it('should update an idea', async () => {
    const updates = {
      difficulty: 'beginner' as const,
      estimatedCost: 100,
    }

    const mockUpdated = {
      id: 'idea-1',
      team_id: 'team-1',
      character: 'Spike Spiegel',
      series: 'Cowboy Bebop',
      difficulty: 'beginner',
      status: 'saved',
      estimated_cost: 100,
      images: [],
      tags: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    }

    mockChain.single.mockResolvedValue({ data: mockUpdated, error: null })

    const result = await ideaService.update('idea-1', updates)

    expect(result?.difficulty).toBe('beginner')
    expect(supabase.from).toHaveBeenCalledWith('ideas')
    expect(mockChain.eq).toHaveBeenCalledWith('id', 'idea-1')
  })

  it('should delete an idea', async () => {
    const deleteChain: any = { eq: vi.fn(() => Promise.resolve({ data: null, error: null })) }
    mockChain.delete = vi.fn(() => deleteChain)

    await ideaService.delete('idea-1')

    expect(supabase.from).toHaveBeenCalledWith('ideas')
    expect(mockChain.delete).toHaveBeenCalled()
    expect(deleteChain.eq).toHaveBeenCalledWith('id', 'idea-1')
  })

  it('should convert an idea to a project', async () => {
    const mockIdea = {
      id: 'idea-1',
      team_id: 'team-1',
      character: 'Spike Spiegel',
      series: 'Cowboy Bebop',
      difficulty: 'intermediate',
      status: 'saved',
      estimated_cost: 150,
      images: ['https://example.com/image.jpg'],
      tags: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockProject = {
      id: 'project-1',
      team_id: 'team-1',
      from_idea_id: 'idea-1',
      character: 'Spike Spiegel',
      series: 'Cowboy Bebop',
      status: 'planning',
      progress: 0,
    }

    // Mock get call - need to return chain that supports eq()
    const getChain = {
      select: vi.fn(() => getChain),
      eq: vi.fn(() => getChain),
      single: vi.fn(() => Promise.resolve({ data: mockIdea, error: null })),
    }
    supabase.from.mockReturnValueOnce(getChain)
    
    // Mock project creation
    const mockProjectChain = {
      insert: vi.fn(() => mockProjectChain),
      select: vi.fn(() => mockProjectChain),
      single: vi.fn(() => Promise.resolve({ data: mockProject, error: null })),
    }
    supabase.from.mockReturnValueOnce(mockProjectChain)
    
    // Mock idea update after conversion
    mockChain.single.mockResolvedValueOnce({
      data: { ...mockIdea, status: 'converted', converted_project_id: 'project-1' },
      error: null,
    })

    const result = await ideaService.convert('idea-1', 'team-1')

    expect(result.projectId).toBe('project-1')
    expect(result.idea.status).toBe('converted')
    expect(result.idea.convertedProjectId).toBe('project-1')
  })
})
