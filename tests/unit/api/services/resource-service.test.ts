import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('$env/static/public', () => ({
  PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  PUBLIC_SUPABASE_ANON_KEY: 'anon-key'
}))

const { resourceService } = await import('../../../../src/lib/api/services/resourceService')
const { supabase } = await import('../../../../src/lib/supabase')
const { currentTeam } = await import('../../../../src/lib/stores/teams')

describe('resourceService', () => {
  let mockChain: any
  let deleteChain: any

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
    
    // Ensure delete().eq().eq() works - delete returns a chain that also has eq()
    deleteChain = {
      eq: vi.fn((...args: any[]) => {
        // First eq() call returns the chain, second returns a promise
        if (deleteChain._eqCallCount === undefined) {
          deleteChain._eqCallCount = 0
        }
        deleteChain._eqCallCount++
        if (deleteChain._eqCallCount === 1) {
          return deleteChain // Chainable
        } else {
          return Promise.resolve({ error: null }) // Resolve after second call
        }
      }),
    }
    mockChain.delete = vi.fn(() => deleteChain)

    // Mock supabase
    Object.assign(supabase, {
      from: vi.fn(() => mockChain),
      rpc: vi.fn(),
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
      },
    })
    
    // Mock currentTeam.get() and waitForLoad()
    const mockTeam = { id: 'test-team-id' }
    Object.assign(currentTeam, {
      get: vi.fn(() => mockTeam),
      waitForLoad: vi.fn(() => Promise.resolve(mockTeam)),
    })
  })

  describe('list', () => {
    it('should fetch resources for current team', async () => {
      const mockResources = [
        {
          id: '1',
          name: 'Test Resource',
          metadata: { category: 'prop' },
          cost: 5000, // $50.00 in cents
        },
      ]

      mockChain.order.mockResolvedValue({ data: mockResources, error: null })

      const result = await resourceService.list()

      expect(supabase.from).toHaveBeenCalledWith('resources')
      expect(mockChain.eq).toHaveBeenCalledWith('team_id', 'test-team-id')
      expect(result).toEqual(mockResources)
    })

    it('should filter by category when provided', async () => {
      // order() should return chainable, so eq() can be called after order()
      const orderChain = {
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      }
      mockChain.order = vi.fn(() => orderChain)

      await resourceService.list({ category: 'prop' })

      expect(mockChain.order).toHaveBeenCalled()
      expect(orderChain.eq).toHaveBeenCalledWith('metadata->>category', 'prop')
    })
  })

  describe('get', () => {
    it('should fetch a single resource by ID', async () => {
      const mockResource = {
        id: '1',
        name: 'Test Resource',
        team_id: 'test-team-id',
      }

      mockChain.single.mockResolvedValue({ data: mockResource, error: null })

      const result = await resourceService.get('1')

      expect(mockChain.eq).toHaveBeenCalledWith('id', '1')
      expect(mockChain.eq).toHaveBeenCalledWith('team_id', 'test-team-id')
      expect(result).toEqual(mockResource)
    })

    it('should return null when resource not found', async () => {
      mockChain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      const result = await resourceService.get('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('should create a new resource', async () => {
      const newResource = {
        name: 'New Resource',
        description: 'Test description',
        metadata: { category: 'prop' },
      }

      const createdResource = {
        id: '1',
        ...newResource,
        team_id: 'test-team-id',
      }

      // Mock team membership check (teams table for owner check)
      const teamsChain = {
        select: vi.fn(() => teamsChain),
        eq: vi.fn(() => teamsChain),
        single: vi.fn(() => Promise.resolve({ 
          data: { id: 'test-team-id', owner_id: 'test-user' }, 
          error: null 
        })),
        maybeSingle: vi.fn(() => Promise.resolve({ 
          data: { id: 'test-team-id', owner_id: 'test-user' }, 
          error: null 
        })),
      }
      
      // Mock team_members check
      const membersChain = {
        select: vi.fn(() => membersChain),
        eq: vi.fn(() => membersChain),
        single: vi.fn(() => Promise.resolve({ 
          data: { team_id: 'test-team-id', user_id: 'test-user', role: 'owner', status: 'active' }, 
          error: null 
        })),
        maybeSingle: vi.fn(() => Promise.resolve({ 
          data: { team_id: 'test-team-id', user_id: 'test-user', role: 'owner', status: 'active' }, 
          error: null 
        })),
      }
      
      // Setup from() to return appropriate chains
      supabase.from = vi.fn((table: string) => {
        if (table === 'teams') {
          return teamsChain
        } else if (table === 'team_members') {
          return membersChain
        }
        return mockChain
      })
      
      mockChain.single.mockResolvedValue({ data: createdResource, error: null })
      
      // Mock RPC call to return function not found error (falls back to direct insert)
      supabase.rpc = vi.fn(() => Promise.resolve({ data: null, error: { message: 'function create_resource_safe does not exist', code: '42883' } }))

      const result = await resourceService.create(newResource as any)

      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          ...newResource,
          team_id: 'test-team-id',
        })
      )
      expect(result).toEqual(createdResource)
    })
  })

  describe('update', () => {
    it('should update an existing resource', async () => {
      const updates = {
        name: 'Updated Name',
      }

      const updatedResource = {
        id: '1',
        name: 'Updated Name',
        team_id: 'test-team-id',
      }

      mockChain.single.mockResolvedValue({ data: updatedResource, error: null })

      const result = await resourceService.update('1', updates)

      expect(mockChain.update).toHaveBeenCalledWith(updates)
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1')
      expect(mockChain.eq).toHaveBeenCalledWith('team_id', 'test-team-id')
      expect(result).toEqual(updatedResource)
    })
  })

  describe('delete', () => {
    it('should delete a resource', async () => {
      // The delete chain is already set up in beforeEach
      await resourceService.delete('1')

      expect(mockChain.delete).toHaveBeenCalled()
      // Check that eq was called twice (for id and team_id)
      expect(deleteChain.eq).toHaveBeenCalledTimes(2)
      expect(deleteChain.eq).toHaveBeenNthCalledWith(1, 'id', '1')
      expect(deleteChain.eq).toHaveBeenNthCalledWith(2, 'team_id', 'test-team-id')
    })
  })

  describe('getProjectUsage', () => {
    it('should fetch projects using a resource', async () => {
      const mockUsage = [
        {
          id: 'link-1',
          resource_id: '1',
          quantity: 2,
          status: 'needed',
          project: {
            id: 'project-1',
            character: 'Test Character',
            series: 'Test Series',
          },
        },
      ]

      const usageChain = {
        select: vi.fn(() => usageChain),
        eq: vi.fn().mockResolvedValue({ data: mockUsage, error: null }),
      }
      supabase.from = vi.fn(() => usageChain)

      const result = await resourceService.getProjectUsage('1')

      expect(usageChain.select).toHaveBeenCalledWith(
        expect.stringContaining('project:projects')
      )
      expect(usageChain.eq).toHaveBeenCalledWith('resource_id', '1')
      expect(result).toEqual(mockUsage)
    })
  })

  describe('getProjectUsageCount', () => {
    it('should return count of projects using a resource', async () => {
      const countChain = {
        select: vi.fn(() => countChain),
        eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
      }
      supabase.from = vi.fn(() => countChain)

      const result = await resourceService.getProjectUsageCount('1')

      expect(result).toBe(3)
    })
  })
})

