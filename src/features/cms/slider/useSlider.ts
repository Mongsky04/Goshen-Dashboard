import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export interface Slider { id: number; title: string; imageUrl: string; orderNum: number; createdAt: string }
interface ApiList<T> { success: boolean; data: T[] }

export function useSlider() {
  return useQuery({ queryKey: ['slider'], queryFn: () => api.get<ApiList<Slider>>('/api/v1/banners').then(r => r.data) })
}
export function useCreateSlider() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (f: FormData) => api.upload('/api/v1/banners', f), onSuccess: () => qc.invalidateQueries({ queryKey: ['slider'] }) })
}
export function useDeleteSlider() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: number) => api.delete(`/api/v1/banners/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['slider'] }) })
}

export function useReorderSlider() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, orderNum }: { id: number; orderNum: number }) => {
      const fd = new FormData()
      fd.append('order_num', String(orderNum))
      return api.putForm(`/api/v1/banners/${id}`, fd)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slider'] }),
  })
}
