import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export interface Banner { id: number; name: string; image_url: string; sort_order: number; created_at: string }
interface ApiList<T> { success: boolean; data: T[] }

export function useBanners() {
  return useQuery({ queryKey: ['banners'], queryFn: () => api.get<ApiList<Banner>>('/api/v1/banners').then(r => r.data) })
}
export function useCreateBanner() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (f: FormData) => api.upload('/api/v1/banners', f), onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }) })
}
export function useDeleteBanner() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: number) => api.delete(`/api/v1/banners/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }) })
}
