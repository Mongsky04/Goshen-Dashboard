import { useState, useEffect, useMemo } from 'react'
import { useAllBanners, usePageBanners, useReplacePageBanners } from './usePageBanners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Check, ImageIcon, Search } from 'lucide-react'

interface Props {
  slug: string
  multiple?: boolean
  title?: string
  description?: string
}

export function BannerPicker({ slug, multiple = true, title = 'Banners', description }: Props) {
  const { data: all = [], isLoading: allLoading } = useAllBanners()
  const { data: current = [], isLoading: currentLoading } = usePageBanners(slug)
  const replace = useReplacePageBanners(slug)
  const [selected, setSelected] = useState<number[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    setSelected(current.map(b => b.id))
  }, [current])

  const toggle = (id: number) => {
    if (multiple) {
      setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    } else {
      setSelected(prev => prev.includes(id) ? [] : [id])
    }
  }

  const handleSave = async () => {
    try {
      await replace.mutateAsync(selected)
      toast.success('Banner selection saved')
    } catch {
      toast.error('Failed to save')
    }
  }

  const isLoading = allLoading || currentLoading

  const { selectedBanners, unselectedBanners } = useMemo(() => {
    const q = query.toLowerCase()
    const matches = (b: typeof all[0]) => !q || b.title.toLowerCase().includes(q)
    return {
      selectedBanners: all.filter(b => selected.includes(b.id) && matches(b)),
      unselectedBanners: all.filter(b => !selected.includes(b.id) && matches(b)),
    }
  }, [all, selected, query])

  const BannerCard = ({ b, index }: { b: typeof all[0]; index?: number }) => {
    const isSelected = selected.includes(b.id)
    return (
      <button
        type="button"
        onClick={() => toggle(b.id)}
        className={`relative overflow-hidden rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          isSelected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground'
        }`}
      >
        {b.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.image_url} alt={b.title || `Banner ${b.id}`} className="aspect-video w-full object-cover" />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-muted">
            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}
        {b.title && (
          <div className="px-2 py-1.5">
            <p className="truncate text-xs font-medium">{b.title}</p>
          </div>
        )}
        {isSelected && (
          <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow">
            {multiple && index !== undefined
              ? <span className="text-[10px] font-bold text-white">{index + 1}</span>
              : <Check className="h-3 w-3 text-white" />
            }
          </div>
        )}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {selected.length} selected
          </span>
          <Button size="sm" onClick={handleSave} disabled={replace.isPending}>
            {replace.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {all.length === 0 && !isLoading ? (
        <p className="text-sm text-muted-foreground">
          No banners in catalog yet. Add banners from the <strong>Banner</strong> catalog page first.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-video animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : (
            <>
              {selectedBanners.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {selectedBanners.map((b, i) => <BannerCard key={b.id} b={b} index={i} />)}
                  </div>
                </div>
              )}
              {unselectedBanners.length > 0 && (
                <div className="space-y-2">
                  {selectedBanners.length > 0 && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">All Banners</p>
                  )}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {unselectedBanners.map((b) => <BannerCard key={b.id} b={b} />)}
                  </div>
                </div>
              )}
              {selectedBanners.length === 0 && unselectedBanners.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No banners match "{query}"</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
