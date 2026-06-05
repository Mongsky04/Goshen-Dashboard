interface PageShellProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function PageShell({ title, subtitle, action, children }: PageShellProps) {
  return (
    <>
      <div className="flex h-14 shrink-0 items-center border-b bg-card px-10">
        <div className="mx-auto max-w-6xl flex w-full items-center justify-between">
          <div>
            <h1 className="text-[15px] font-bold text-foreground leading-snug">{title}</h1>
            {subtitle && (
              <p className="mt-px text-[12px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      </div>
      <div className="px-10 py-5">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </div>
    </>
  )
}
