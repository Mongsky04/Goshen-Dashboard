import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export interface Featured {
  id: number
  product_id: number
  name: string
  image_url: string
  category: string
  sub_category: string
  featured_categories: string[]
  created_at: string
}

interface ApiPaged<T> { success: boolean; data: { data: T[]; page: number; limit: number; total: number | null } }

export function useFeatured() {
  return useQuery({
    queryKey: ['featured'],
    queryFn: () => api.get<ApiPaged<Featured>>('/api/v1/featured').then((r) => r.data.data),
  })
}

export function useCreateFeatured() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) => api.upload('/api/v1/featured', form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['featured'] }),
  })
}

export function useDeleteFeatured() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/featured/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['featured'] }),
  })
}
