import { useState, useEffect, useMemo } from 'react'
import { useHomepageGrid, useUpdateHomepageGrid, useAllProducts } from './useHomepage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Check, Grid2x2, Plus, Search, X } from 'lucide-react'

export function HomepagePanel() {
  const { data: grid = [], isLoading: gridLoading } = useHomepageGrid()
  const { data: allProducts = [], isLoading: productsLoading } = useAllProducts()
  const update = useUpdateHomepageGrid()

  const [selected, setSelected] = useState<number[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [draft, setDraft] = useState<number[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    setSelected(grid.map(g => g.product_id))
  }, [grid])

  const openDialog = () => {
    setDraft(selected)
    setQuery('')
    setDialogOpen(true)
  }

  const toggleDraft = (id: number) => {
    setDraft(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleDone = async () => {
    try {
      await update.mutateAsync(draft)
      setSelected(draft)
      toast.success('Product grid updated')
      setDialogOpen(false)
    } catch {
      toast.error('Failed to save')
    }
  }

  const handleRemove = async (id: number) => {
    const next = selected.filter(x => x !== id)
    try {
      await update.mutateAsync(next)
      setSelected(next)
      toast.success('Product removed')
    } catch {
      toast.error('Failed to remove')
    }
  }

  const selectedItems = allProducts.filter(p => selected.includes(p.id))
  const isLoading = gridLoading || productsLoading

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return allProducts.filter(p =>
      !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    )
  }, [allProducts, query])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Product Grid</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Select products shown in the homepage grid.
          </p>
        </div>
        <Button size="sm" onClick={openDialog} disabled={isLoading}>
          <Plus className="mr-1 h-4 w-4" />Add
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : selectedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-10 text-center">
          <Grid2x2 className="mb-2 h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No products selected yet.</p>
          <p className="text-xs text-muted-foreground">Click Add to pick from catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {selectedItems.map(p => (
            <div key={p.id} className="group relative overflow-hidden rounded-xl border border-primary ring-1 ring-primary">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.name} className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-muted">
                  <span className="text-xs text-muted-foreground">No img</span>
                </div>
              )}
              <div className="px-2 py-1.5">
                <p className="truncate text-xs font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">{p.category}</p>
              </div>
              <button
                onClick={() => handleRemove(p.id)}
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
            <DialogTitle>Select Products</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or category…" value={query} onChange={e => setQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No products match "{query}"</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 py-1">
                {filtered.map(p => {
                  const isSelected = draft.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleDraft(p.id)}
                      className={`relative overflow-hidden rounded-xl border text-left transition-all ${
                        isSelected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt={p.name} className="aspect-square w-full object-cover" />
                      ) : (
                        <div className="flex aspect-square items-center justify-center bg-muted">
                          <span className="text-xs text-muted-foreground">No img</span>
                        </div>
                      )}
                      <div className="px-2 py-1.5">
                        <p className="truncate text-xs font-medium">{p.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.category}</p>
                      </div>
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
              <Button size="sm" onClick={handleDone} disabled={update.isPending}>
                {update.isPending ? 'Saving…' : 'Done'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
