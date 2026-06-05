import { useState, useEffect, useMemo } from 'react'
import { useAllBanners, usePageBanners, useReplacePageBanners } from './usePageBanners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Check, ImageIcon, Plus, Search, X } from 'lucide-react'

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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [draft, setDraft] = useState<number[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    setSelected(current.map(b => b.id))
  }, [current])

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

  const selectedItems = all.filter(b => selected.includes(b.id))
  const isLoading = allLoading || currentLoading

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

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="aspect-video animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : selectedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-10 text-center">
          <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No banners selected yet.</p>
          <p className="text-xs text-muted-foreground">Click Add to pick from catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {selectedItems.map((b, i) => (
            <div key={b.id} className="group relative overflow-hidden rounded-xl border border-primary ring-1 ring-primary">
              {b.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.image_url} alt={b.title || `Banner ${i + 1}`} className="aspect-video w-full object-cover" />
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
              {multiple && (
                <div className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow">
                  <span className="text-[10px] font-bold text-white">{i + 1}</span>
                </div>
              )}
              <button
                onClick={() => handleRemove(b.id)}
                className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
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
                      {b.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.image_url} alt={b.title} className="aspect-video w-full object-cover" />
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
