import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Package, MonitorPlay, Mic2, Home, LayoutGrid, Image, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATALOG_ITEMS = [
  { to: '/products', label: 'Products', icon: Package },
  { to: '/banner',   label: 'Banner', icon: Image },
]

const PAGE_ITEMS = [
  { to: '/beranda',    label: 'Homepage',   icon: LayoutGrid },
  { to: '/conference', label: 'Conference', icon: MonitorPlay },
  { to: '/performer',  label: 'Performer',  icon: Mic2 },
]

function NavSection({ title, items }: { title: string; items: { to: string; label: string; icon: React.ElementType }[] }) {
  return (
    <div>
      <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {title}
      </p>
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </NavLink>
      ))}
    </div>
  )
}

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2.5 border-b px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <LayoutGrid className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Goshen CMS</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <Home className="h-4 w-4 shrink-0" />
          Dashboard
        </NavLink>

        <NavSection title="Catalog" items={CATALOG_ITEMS} />
        <NavSection title="Pages" items={PAGE_ITEMS} />
      </nav>

      <div className="border-t p-2">
        <button
          onClick={() => { logout(); navigate('/login', { replace: true }) }}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}
