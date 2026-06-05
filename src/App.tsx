import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LoginPage } from '@/features/auth/LoginPage'
import { OverviewPanel } from '@/features/cms/overview/OverviewPanel'
import { ProdukPanel } from '@/features/cms/produk/ProdukPanel'
import { BerandaPanel } from '@/features/cms/beranda/BerandaPanel'
import { SliderPanel } from '@/features/cms/slider/SliderPanel'
import { ConferencePanel } from '@/features/cms/conference/ConferencePanel'
import { PerformerPanel } from '@/features/cms/performer/PerformerPanel'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index           element={<OverviewPanel />} />
              <Route path="products" element={<ProdukPanel />} />
              <Route path="banner"   element={<SliderPanel />} />
              <Route path="beranda"  element={<BerandaPanel />} />
              <Route path="conference" element={<ConferencePanel />} />
              <Route path="performer"  element={<PerformerPanel />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  )
}
