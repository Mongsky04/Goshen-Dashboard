import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

export function Topbar() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <div className="flex h-14 shrink-0 items-center justify-end border-b bg-card px-8 gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          A
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold text-foreground">Admin</p>
          <p className="text-[11px] text-muted-foreground">Administrator</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/login', { replace: true }) }}
          className="ml-1 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
