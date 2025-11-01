import { describe, it, expect, vi, beforeEach } from 'vitest'

// Partially mock module to preserve shape
vi.mock('../../../src/lib/api/services/ideaService', async () => {
  const actual = await vi.importActual('../../../src/lib/api/services/ideaService')
  return {
    ...actual,
    ideaService: {
      ...(actual as any).ideaService,
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  }
})

const { ideas } = await import('../../../src/lib/stores/ideas')
const mod = await import('../../../src/lib/api/services/ideaService')

const listSpy = () => vi.spyOn(mod.ideaService, 'list')
const getSpy = () => vi.spyOn(mod.ideaService, 'get')
const createSpy = () => vi.spyOn(mod.ideaService, 'create')
const updateSpy = () => vi.spyOn(mod.ideaService, 'update')
const deleteSpy = () => vi.spyOn(mod.ideaService, 'delete')

describe('ideas store (TDD)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ideas.reset()
  })

  it('loads ideas for team', async () => {
    const fakeIdeas = [
      {
        id: 'i1',
        teamId: 't1',
        character: 'Spike Spiegel',
        series: 'Cowboy Bebop',
        difficulty: 'intermediate',
        status: 'saved',
        images: [],
        tags: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'i2',
        teamId: 't1',
        character: 'Edward Elric',
        series: 'Fullmetal Alchemist',
        difficulty: 'advanced',
        status: 'saved',
        images: [],
        tags: [],
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ]
    listSpy().mockResolvedValue(fakeIdeas)

    await ideas.load('t1')

    const value = ideas.get()
    expect(value.items).toHaveLength(2)
    expect(value.items[0].character).toBe('Spike Spiegel')
    expect(value.loading).toBe(false)
  })

  it('filters ideas by difficulty', async () => {
    const fakeIdeas = [
      {
        id: 'i1',
        teamId: 't1',
        character: 'Spike',
        series: 'Bebop',
        difficulty: 'beginner' as const,
        status: 'saved' as const,
        images: [],
        tags: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'i2',
        teamId: 't1',
        character: 'Edward',
        series: 'FMA',
        difficulty: 'advanced' as const,
        status: 'saved' as const,
        images: [],
        tags: [],
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ]
    listSpy().mockResolvedValue(fakeIdeas)
    await ideas.load('t1')

    const beginnerIdeas = ideas.getFiltered({ difficulty: 'beginner' })
    expect(beginnerIdeas).toHaveLength(1)
    expect(beginnerIdeas[0].difficulty).toBe('beginner')
  })

  it('creates a new idea', async () => {
    const newIdea = {
      character: 'New Character',
      series: 'New Series',
      difficulty: 'intermediate' as const,
    }

    const createdIdea = {
      id: 'i1',
      teamId: 't1',
      ...newIdea,
      status: 'saved' as const,
      images: [],
      tags: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    createSpy().mockResolvedValue(createdIdea)

    await ideas.create('t1', newIdea)

    const value = ideas.get()
    expect(value.items).toHaveLength(1)
    expect(value.items[0].character).toBe('New Character')
  })

  it('updates an idea', async () => {
    const existingIdea = {
      id: 'i1',
      teamId: 't1',
      character: 'Old Character',
      series: 'Old Series',
      difficulty: 'beginner' as const,
      status: 'saved' as const,
      images: [],
      tags: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    listSpy().mockResolvedValue([existingIdea])
    await ideas.load('t1')

    const updatedIdea = { ...existingIdea, character: 'Updated Character' }
    updateSpy().mockResolvedValue(updatedIdea)

    await ideas.update('i1', { character: 'Updated Character' })

    const value = ideas.get()
    expect(value.items[0].character).toBe('Updated Character')
  })

  it('deletes an idea', async () => {
    const fakeIdeas = [
      {
        id: 'i1',
        teamId: 't1',
        character: 'Character',
        series: 'Series',
        difficulty: 'beginner' as const,
        status: 'saved' as const,
        images: [],
        tags: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ]

    listSpy().mockResolvedValue(fakeIdeas)
    await ideas.load('t1')

    deleteSpy().mockResolvedValue(undefined)

    await ideas.delete('i1')

    const value = ideas.get()
    expect(value.items).toHaveLength(0)
  })

  it('loads a single idea by id', async () => {
    const idea = {
      id: 'i1',
      teamId: 't1',
      character: 'Spike',
      series: 'Bebop',
      difficulty: 'intermediate' as const,
      status: 'saved' as const,
      images: [],
      tags: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    getSpy().mockResolvedValue(idea)

    const result = await ideas.loadOne('i1')

    expect(result?.character).toBe('Spike')
    expect(getSpy()).toHaveBeenCalledWith('i1')
  })
})

