import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export interface Product {
  id: number
  name: string
  imageUrl: string
  category: string
  subCategory: string
  createdAt: string
}

interface ApiPaged<T> { success: boolean; data: { data: T[]; page: number; limit: number; total: number | null } }

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.get<ApiPaged<Product>>('/api/v1/products').then((r) => r.data.data),
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) => api.upload('/api/v1/products', form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}
