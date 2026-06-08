import { useState, useEffect, useMemo } from 'react'
import { useAllBanners, usePageBanners, useReplacePageBanners } from './usePageBanners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Check, ImageIcon, Plus, Search, X } from 'lucide-react'
import type { Slider } from './useSlider'

type SortKey = 'newest' | 'oldest' | 'az' | 'za'

const EMPTY_BANNERS: Slider[] = []

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az',     label: 'Name A–Z' },
  { value: 'za',     label: 'Name Z–A' },
]

interface Props {
  slug: string
  multiple?: boolean
  title?: string
  description?: string
}

export function BannerPicker({ slug, multiple = true, title = 'Banners', description }: Props) {
  const { data: all = [], isLoading: allLoading } = useAllBanners()
  const { data: current, isLoading: currentLoading } = usePageBanners(slug)
  const replace = useReplacePageBanners(slug)

  const [selected, setSelected] = useState<number[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [draft, setDraft] = useState<number[]>([])
  const [query, setQuery] = useState('')
  const [listQuery, setListQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')

  const currentBanners = current ?? EMPTY_BANNERS

  useEffect(() => {
    setSelected(currentBanners.map(b => b.id))
  }, [currentBanners])

  const openDialog = () => {
    setDraft(selected)
    setQuery('')
    setDialogOpen(true)
  }

  const toggleDraft = (id: number) => {
    if (multiple) {
      setDraft(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    } else {
      setDraft(prev => prev.includes(id) ? [] : [id])
    }
  }

  const handleDone = async () => {
    try {
      await replace.mutateAsync(draft)
      setSelected(draft)
      toast.success('Banner selection saved')
      setDialogOpen(false)
    } catch {
      toast.error('Failed to save')
    }
  }

  const handleRemove = async (id: number) => {
    const next = selected.filter(x => x !== id)
    try {
      await replace.mutateAsync(next)
      setSelected(next)
      toast.success('Banner removed')
    } catch {
      toast.error('Failed to remove')
    }
  }

  const isLoading = allLoading || currentLoading

  const selectedItems = useMemo(() => {
    const q = listQuery.toLowerCase()
    let result = all.filter(b => selected.includes(b.id) && (!q || b.title.toLowerCase().includes(q)))
    switch (sort) {
      case 'newest': result = [...result].sort((a, b) => b.id - a.id); break
      case 'oldest': result = [...result].sort((a, b) => a.id - b.id); break
      case 'az':     result = [...result].sort((a, b) => (a.title || '').localeCompare(b.title || '')); break
      case 'za':     result = [...result].sort((a, b) => (b.title || '').localeCompare(a.title || '')); break
    }
    return result
  }, [all, selected, listQuery, sort])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return all.filter(b => !q || b.title.toLowerCase().includes(q))
  }, [all, query])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button size="sm" onClick={openDialog} disabled={isLoading}>
          <Plus className="mr-1 h-4 w-4" />Add
        </Button>
      </div>

      {/* Search + Sort — always visible when multiple=true */}
      {multiple && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search selected banners…"
              value={listQuery}
              onChange={e => setListQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : selected.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-10 text-center">
          <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No banners selected yet.</p>
          <p className="text-xs text-muted-foreground">Click Add to pick from catalog.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              <tr className="border-b">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-12">#</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-20">Image</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Name</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground w-12"></th>
              </tr>
            </thead>
          </table>
          <div className="max-h-160 overflow-y-auto">
            <table className="w-full text-sm">
              <tbody>
                {selectedItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                      No banners match "{listQuery}"
                    </td>
                  </tr>
                ) : selectedItems.map((b, i) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground w-12">{i + 1}</td>
                    <td className="px-4 py-3 w-20">
                      {b.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.imageUrl} alt={b.title || `Banner ${i + 1}`} className="h-10 w-16 rounded-md object-cover" />
                      ) : (
                        <div className="flex h-10 w-16 items-center justify-center rounded-md bg-muted">
                          <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{b.title || '—'}</td>
                    <td className="px-4 py-3 text-right w-12">
                      <button
                        onClick={() => handleRemove(b.id)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedItems.length > 10 && (
            <div className="border-t px-4 py-2 text-xs text-muted-foreground">
              Showing {selectedItems.length} items — scroll to see more
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Banners</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name…" value={query} onChange={e => setQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No banners match "{query}"</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 py-1">
                {filtered.map(b => {
                  const isSelected = draft.includes(b.id)
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleDraft(b.id)}
                      className={`relative overflow-hidden rounded-xl border text-left transition-all ${
                        isSelected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      {b.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.imageUrl} alt={b.title} className="aspect-video w-full object-cover" />
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
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm text-muted-foreground">{draft.length} selected</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleDone} disabled={replace.isPending}>
                {replace.isPending ? 'Saving…' : 'Done'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
