import { describe, it, expect, vi, beforeEach } from 'vitest'

// Import service and supabase directly via relative paths to satisfy linter path resolution
const { authService } = await import('../../../src/lib/auth/auth-service')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { supabase } = require('../../../src/lib/supabase') as { supabase: any }

describe('authService (TDD)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Stub supabase auth methods for each test
    supabase.auth = {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
      getUser: vi.fn(),
      refreshSession: vi.fn(),
    }
  })

  it('signIn returns user/session on success', async () => {
    const fakeUser = { id: 'u1', email: 'test@example.com' }
    const fakeSession = { access_token: 'token' }
    supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: fakeUser, session: fakeSession }, error: null })

    const result = await authService.signIn({ email: 'test@example.com', password: 'pass' })

    expect(result.error).toBeNull()
    expect(result.user).toEqual(fakeUser)
    expect(result.session).toEqual(fakeSession)
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'test@example.com', password: 'pass' })
  })

  it('signIn returns error message on failure', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: null, session: null }, error: { message: 'Invalid login credentials' } })

    const result = await authService.signIn({ email: 'bad@example.com', password: 'wrong' })

    expect(result.user).toBeNull()
    expect(result.session).toBeNull()
    expect(result.error).toContain('Invalid login credentials')
  })

  it('signOut delegates to supabase.auth.signOut', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null })
    await authService.signOut()
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1)
  })

  it('getSession returns minimal session with validated user when getUser succeeds', async () => {
    const fakeUser = { id: 'u2', email: 'ok@example.com' }
    supabase.auth.getUser.mockResolvedValue({ data: { user: fakeUser }, error: null })

    const session = await authService.getSession()
    expect(session).toEqual({ user: fakeUser })
  })

  it('getSession returns null when getUser fails', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'JWT invalid' } })
    const session = await authService.getSession()
    expect(session).toBeNull()
  })
})


