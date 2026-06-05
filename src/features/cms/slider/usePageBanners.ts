import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Slider } from './useSlider'

interface ApiList<T> { success: boolean; data: T[] }

export function usePageBanners(slug: string) {
  return useQuery({
    queryKey: ['page-banners', slug],
    queryFn: () => api.get<ApiList<Slider>>(`/api/v1/page-banners/${slug}`).then(r => r.data ?? []),
  })
}

export function useAllBanners() {
  return useQuery({
    queryKey: ['banners', 'all'],
    queryFn: () => api.get<ApiList<Slider>>('/api/v1/banners').then(r => r.data ?? []),
  })
}

export function useReplacePageBanners(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (bannerIds: number[]) =>
      api.put(`/api/v1/page-banners/${slug}`, { banner_ids: bannerIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['page-banners', slug] }),
  })
}
