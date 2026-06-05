import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export interface ConferencePage {
  slug: string
  label: string
  isPublished: boolean
  hero: { heroImageUrl: string; badgeText: string; headline: string; subText: string }
  titles: { productGrid: string; workspace: string; solutions: string; contact: string }
  workspaceDescription: string
  solutions: unknown[]
  products: unknown[]
}

interface ApiSingle<T> { success: boolean; data: T }

export function useConferencePage(slug: string) {
  return useQuery({
    queryKey: ['conference', slug],
    queryFn: () => api.get<ApiSingle<ConferencePage>>(`/api/v1/admin/conference-pages/${slug}`).then(r => r.data),
    enabled: !!slug,
  })
}

export function useSaveConferencePage(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ConferencePage>) =>
      api.put(`/api/v1/admin/conference-pages/${slug}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conference', slug] }),
  })
}
