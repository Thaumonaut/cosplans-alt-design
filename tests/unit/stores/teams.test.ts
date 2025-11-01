import { describe, it, expect, vi, beforeEach } from 'vitest'

// Partially mock module to preserve shape
vi.mock('../../../src/lib/api/services/teamService', async () => {
  const actual = await vi.importActual('../../../src/lib/api/services/teamService')
  return {
    ...actual,
    teamService: {
      ...(actual as any).teamService,
      list: vi.fn(),
    },
  }
})

const { teams } = await import('../../../src/lib/stores/teams')
const mod = await import('../../../src/lib/api/services/teamService')

const listSpy = () => vi.spyOn(mod.teamService, 'list')

describe('teams store (TDD)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    teams.reset()
  })

  it('loads teams and sets current team', async () => {
    const fakeTeams = [
      { id: 't1', name: 'Personal', type: 'personal', createdBy: 'u1' },
      { id: 't2', name: 'Editors', type: 'private', createdBy: 'u1' },
    ]
    listSpy().mockResolvedValue(fakeTeams)

    await teams.load('u1')

    const value = teams.get()
    expect(value.items).toHaveLength(2)
    expect(value.current?.id).toBe('t1')
  })

  it('can switch current team', async () => {
    const fakeTeams = [
      { id: 't1', name: 'Personal', type: 'personal', createdBy: 'u1' },
      { id: 't2', name: 'Editors', type: 'private', createdBy: 'u1' },
    ]
    listSpy().mockResolvedValue(fakeTeams)
    await teams.load('u1')

    teams.setCurrent('t2')
    const value = teams.get()
    expect(value.current?.id).toBe('t2')
  })
})


