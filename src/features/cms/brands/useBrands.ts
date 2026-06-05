import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export interface Brand { id: number; name: string; image_url: string; created_at: string }
interface ApiList<T> { success: boolean; data: T[] }

export function useBrands() {
  return useQuery({ queryKey: ['brands'], queryFn: () => api.get<ApiList<Brand>>('/api/v1/brands').then(r => r.data) })
}
export function useCreateBrand() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (f: FormData) => api.upload('/api/v1/brands', f), onSuccess: () => qc.invalidateQueries({ queryKey: ['brands'] }) })
}
export function useDeleteBrand() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: number) => api.delete(`/api/v1/brands/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['brands'] }) })
}
