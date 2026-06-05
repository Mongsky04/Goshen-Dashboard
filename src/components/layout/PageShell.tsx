interface PageShellProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function PageShell({ title, subtitle, action, children }: PageShellProps) {
  return (
    <div className="px-8 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  )
}
