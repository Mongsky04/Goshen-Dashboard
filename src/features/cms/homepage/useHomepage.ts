import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Product } from '../products/useProducts'

export interface GridProduct {
  id: number
  productId: number
  name: string
  imageUrl: string
  category: string
  subCategory: string
}

interface ApiList<T> { success: boolean; data: T[] }
interface ApiPaged<T> { success: boolean; data: { data: T[]; page: number; limit: number; total: number | null } }

export function useHomepageGrid() {
  return useQuery({
    queryKey: ['homepage-grid'],
    queryFn: () => api.get<ApiList<GridProduct>>('/api/v1/homepage-grid').then(r => r.data ?? []),
  })
}

export function useUpdateHomepageGrid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productIds: number[]) =>
      api.put('/api/v1/homepage-grid', { product_ids: productIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['homepage-grid'] }),
  })
}

export function useAllProducts() {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => api.get<ApiPaged<Product>>('/api/v1/products?limit=100').then(r => r.data.data),
  })
}
