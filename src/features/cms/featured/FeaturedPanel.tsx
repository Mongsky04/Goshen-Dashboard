import { useState, useMemo } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { useFeatured, useCreateFeatured, useDeleteFeatured } from './useFeatured'
import { useAllProducts } from '../homepage/useHomepage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2, Plus, Star, Search } from 'lucide-react'

type SortKey = 'newest' | 'oldest' | 'az' | 'za' | 'cat'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az',     label: 'Name A–Z' },
  { value: 'za',     label: 'Name Z–A' },
  { value: 'cat',    label: 'Category A–Z' },
]

export function FeaturedPanel() {
  const { data: items = [], isLoading } = useFeatured()
  const { data: allProducts = [] } = useAllProducts()
  const create = useCreateFeatured()
  const remove = useDeleteFeatured()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    let result = items.filter(item =>
      !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    )
    switch (sort) {
      case 'newest': result = [...result].sort((a, b) => b.id - a.id); break
      case 'oldest': result = [...result].sort((a, b) => a.id - b.id); break
      case 'az':     result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break
      case 'za':     result = [...result].sort((a, b) => b.name.localeCompare(a.name)); break
      case 'cat':    result = [...result].sort((a, b) => a.category.localeCompare(b.category)); break
    }
    return result
  }, [items, query, sort])

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
    <PageShell
      title="Featured Products"
      subtitle="Featured products shown on the homepage."
      action={
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
      }
    >
      <div className="space-y-4">
        {/* Search + Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or category…"
              value={query}
              onChange={e => setQuery(e.target.value)}
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

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16 text-center">
            <Star className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No featured items yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Click "Add" to get started.</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                <tr className="border-b">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-12">#</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-16">Image</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Category</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Featured In</th>
                  <th className="px-4 py-2.5 w-12"></th>
                </tr>
              </thead>
            </table>
            <div className="max-h-[640px] overflow-y-auto">
              <table className="w-full text-sm">
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        No items match "{query}"
                      </td>
                    </tr>
                  ) : filtered.map((item, i) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground w-12">{i + 1}</td>
                      <td className="px-4 py-3 w-16">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image_url} alt={item.name} className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-muted" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-primary">
                        {item.featured_categories?.length > 0 ? item.featured_categories.join(', ') : '—'}
                      </td>
                      <td className="px-4 py-3 w-12">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > 10 && (
              <div className="border-t px-4 py-2 text-xs text-muted-foreground">
                Showing {filtered.length} items — scroll to see more
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  )
}
