export function Topbar() {
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
      </div>
    </div>
  )
}
