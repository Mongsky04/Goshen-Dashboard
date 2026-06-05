import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export interface SupportCard {
  id: string
  title: string
  description: string
  cta_label: string
  cta_href: string
  sort_order: number
}

interface ApiList<T> { success: boolean; data: T[] }

export function useSupportCards() {
  return useQuery({
    queryKey: ['support-cards'],
    queryFn: () => api.get<ApiList<SupportCard>>('/api/v1/support-cards').then(r => r.data),
  })
}

export function useCreateSupportCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<SupportCard, 'id'>) => api.post('/api/v1/support-cards', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support-cards'] }),
  })
}

export function useDeleteSupportCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/support-cards/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['support-cards'] }),
  })
}
