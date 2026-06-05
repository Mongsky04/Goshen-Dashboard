import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '../store/authStore'

describe('api client', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, isAuthenticated: false, user: null })
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('injects Authorization header when token exists', async () => {
    useAuthStore.setState({ token: 'my-token', isAuthenticated: true, user: null })
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('./client')
    await api.get('/api/v1/products')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/products'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      })
    )
  })

  it('does not inject Authorization when no token', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('./client')
    await api.get('/api/v1/products')

    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers.Authorization).toBeUndefined()
  })

  it('throws on non-ok response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal error' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const { api } = await import('./client')
    await expect(api.get('/api/v1/products')).rejects.toThrow('Internal error')
  })
})
