import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ token: null, isAuthenticated: false, user: null })
  })

  it('login sets token and isAuthenticated', () => {
    useAuthStore.getState().login('test-jwt-token')
    expect(useAuthStore.getState().token).toBe('test-jwt-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('logout clears token and isAuthenticated', () => {
    useAuthStore.getState().login('test-jwt-token')
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('persists token to localStorage on login', () => {
    useAuthStore.getState().login('persistent-token')
    const stored = JSON.parse(localStorage.getItem('goshen-auth') ?? '{}')
    expect(stored.state.token).toBe('persistent-token')
  })

  it('clears localStorage on logout', () => {
    useAuthStore.getState().login('persistent-token')
    useAuthStore.getState().logout()
    const stored = JSON.parse(localStorage.getItem('goshen-auth') ?? '{"state":{}}')
    expect(stored.state?.token).toBeNull()
  })
})
