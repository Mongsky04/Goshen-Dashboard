import { Link } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { useSlider } from '../slider/useSlider'
import { useProducts } from '../products/useProducts'
import { useFeatured } from '../featured/useFeatured'
import { useArticles } from '../articles/useArticles'
import { Image, Package, Star, FileText, ArrowRight, LayoutGrid, MonitorPlay, Mic2 } from 'lucide-react'

function StatCard({
  title, count, icon: Icon, to, bg, fg,
}: {
  title: string; count: number; icon: React.ElementType; to: string; bg: string; fg: string
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="mt-0.5 text-2xl font-bold text-foreground">{count}</p>
        <span className="mt-2 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Manage <ArrowRight className="h-3 w-3" />
        </span>
      </div>
      <div className={`rounded-xl p-3 ${bg}`}>
        <Icon className={`h-6 w-6 ${fg}`} />
      </div>
    </Link>
  )
}

function QuickLink({
  to, icon: Icon, title, desc,
}: {
  to: string; icon: React.ElementType; title: string; desc: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}

export function OverviewPanel() {
  const { data: slides = [], isLoading: l1 } = useSlider()
  const { data: products = [], isLoading: l2 } = useProducts()
  const { data: featured = [], isLoading: l3 } = useFeatured()
  const { data: articles = [], isLoading: l4 } = useArticles()
  const loading = l1 || l2 || l3 || l4

  return (
    <PageShell title="Dashboard" subtitle="Welcome — manage your Goshen site content from here.">
      <div className="space-y-8">

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Content Stats
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard title="Banner Slide" count={slides.length} icon={Image} to="/banner"
              bg="bg-blue-50" fg="text-blue-600" />
            <StatCard title="Featured" count={featured.length} icon={Star} to="/featured"
              bg="bg-amber-50" fg="text-amber-600" />
            <StatCard title="Articles" count={articles.length} icon={FileText} to="/articles"
              bg="bg-green-50" fg="text-green-600" />
            <StatCard title="Products" count={products.length} icon={Package} to="/products"
              bg="bg-violet-50" fg="text-violet-600" />
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Homepage Content
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <QuickLink to="/banner"   icon={Image}      title="Banner"            desc="Manage banner slide images" />
          <QuickLink to="/beranda"  icon={LayoutGrid}  title="Homepage"          desc="Product grid, featured & articles" />
          <QuickLink to="/products" icon={Package}     title="Products"          desc="Manage the product catalog" />
          <QuickLink to="/conference" icon={MonitorPlay} title="Conference"      desc="Conference page content" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Other Pages
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <QuickLink to="/performer"  icon={Mic2}        title="Performer"       desc="Performer page content" />
        </div>
      </section>
      </div>
    </PageShell>
  )
}
