import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export interface PerformerVideo {
  isMain: boolean
  title: string
  subtitle: string
  thumbnailUrl: string
  videoUrl: string
  sortOrder: number
}

export interface PerformerPage {
  slug: string
  label: string
  isPublished: boolean
  heroImageUrl: string
  productGridTitle: string
  videosSectionTitle: string
  products: unknown[]
  mainVideo: PerformerVideo
  relatedVideos: PerformerVideo[]
}

interface ApiSingle<T> { success: boolean; data: T }

export function usePerformerPage(slug: string) {
  return useQuery({
    queryKey: ['performer', slug],
    queryFn: () => api.get<ApiSingle<PerformerPage>>(`/api/v1/admin/performer-pages/${slug}`).then(r => r.data),
    enabled: !!slug,
  })
}

export function useSavePerformerPage(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PerformerPage>) =>
      api.put(`/api/v1/admin/performer-pages/${slug}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['performer', slug] }),
  })
}
