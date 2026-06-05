import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export interface Article {
  id: number
  title: string
  description: string
  image_url: string
  published_at: string
  created_at: string
}

interface ApiPaged<T> { success: boolean; data: { data: T[]; page: number; limit: number; total: number | null } }

export function useArticles() {
  return useQuery({
    queryKey: ['articles'],
    queryFn: () => api.get<ApiPaged<Article>>('/api/v1/articles').then((r) => r.data.data),
  })
}

export function useCreateArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: FormData) => api.upload('/api/v1/articles', form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['articles'] }),
  })
}

export function useDeleteArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/articles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['articles'] }),
  })
}
