import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export interface MediaAsset {
  id: number
  filename: string
  url: string
  size: number
  mime_type: string
  created_at: string
}

interface ApiList<T> { success: boolean; data: T[] }
interface ApiItem<T> { success: boolean; data: T }

export function useMedia() {
  return useQuery({
    queryKey: ['media'],
    queryFn: () => api.get<ApiList<MediaAsset>>('/api/v1/media').then(r => r.data),
  })
}

export function useUploadMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (f: FormData) => api.upload<ApiItem<MediaAsset>>('/api/v1/media', f).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  })
}

export function useDeleteMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/media/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  })
}
