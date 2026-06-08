import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export interface Featured {
  id: number
  productId: number
  name: string
  imageUrl: string
  category: string
  subCategory: string
  featuredCategories: string[]
  createdAt: string
}

interface ApiPaged<T> { success: boolean; data: { data: T[]; page: number; limit: number; total: number | null } }

export interface CreateFeaturedInput {
  product_id: number
  featured_categories: string[]
}

export function useFeatured() {
  return useQuery({
    queryKey: ['featured'],
    queryFn: () => api.get<ApiPaged<Featured>>('/api/v1/featured').then((r) => r.data.data),
  })
}

export function useCreateFeatured() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateFeaturedInput) => api.post('/api/v1/featured', body),
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
