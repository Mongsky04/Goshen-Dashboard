import { useState } from 'react'
import { useFeatured, useCreateFeatured, useDeleteFeatured } from './useFeatured'
import { useAllProducts } from '../homepage/useHomepage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2, Plus, Star } from 'lucide-react'

export function FeaturedPanel() {
  const { data: items = [], isLoading } = useFeatured()
  const { data: allProducts = [] } = useAllProducts()
  const create = useCreateFeatured()
  const remove = useDeleteFeatured()
  const [open, setOpen] = useState(false)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await create.mutateAsync(new FormData(e.currentTarget))
      toast.success('Featured item added')
      setOpen(false)
    } catch {
      toast.error('Failed to add')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this item?')) return
    try { await remove.mutateAsync(id); toast.success('Deleted') }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Featured Products</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Featured products shown on the homepage.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" />Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Featured Item</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Product</Label>
                <select
                  name="product_id"
                  required
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">— select product —</option>
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  Featured Categories
                  <span className="ml-1 text-xs text-muted-foreground">(comma-separated)</span>
                </Label>
                <Input name="featured_categories" placeholder="e.g. bass, guitar, piano" />
              </div>
              <Button type="submit" className="w-full" disabled={create.isPending}>
                {create.isPending ? 'Saving…' : 'Add'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16 text-center">
          <Star className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No featured items yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Click "Add" to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.category}
                  {item.featured_categories?.length > 0 && (
                    <> · <span className="text-primary">{item.featured_categories.join(', ')}</span></>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
