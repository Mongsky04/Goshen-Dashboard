import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export interface Customer { id: number; image_url: string; alt_text: string; created_at: string }
interface ApiList<T> { success: boolean; data: T[] }

export function useCustomers() {
  return useQuery({ queryKey: ['customers'], queryFn: () => api.get<ApiList<Customer>>('/api/v1/customers').then(r => r.data) })
}
export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (f: FormData) => api.upload('/api/v1/customers', f), onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }) })
}
export function useDeleteCustomer() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: number) => api.delete(`/api/v1/customers/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }) })
}
