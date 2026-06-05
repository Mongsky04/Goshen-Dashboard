import { useState, useMemo } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { useProducts, useCreateProduct, useDeleteProduct } from './useProducts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2, Plus, Search } from 'lucide-react'

type SortKey = 'newest' | 'oldest' | 'az' | 'za' | 'cat'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'az',     label: 'Nama A–Z' },
  { value: 'za',     label: 'Nama Z–A' },
  { value: 'cat',    label: 'Kategori A–Z' },
]

export function ProductsPanel() {
  const { data: products = [], isLoading } = useProducts()
  const create = useCreateProduct()
  const remove = useDeleteProduct()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    let result = products.filter(p =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sub_category.toLowerCase().includes(q)
    )

    switch (sort) {
      case 'newest': result = [...result].sort((a, b) => b.id - a.id); break
      case 'oldest': result = [...result].sort((a, b) => a.id - b.id); break
      case 'az':     result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break
      case 'za':     result = [...result].sort((a, b) => b.name.localeCompare(a.name)); break
      case 'cat':    result = [...result].sort((a, b) => a.category.localeCompare(b.category)); break
    }

    return result
  }, [products, query, sort])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await create.mutateAsync(new FormData(e.currentTarget))
      toast.success('Product added')
      setOpen(false)
    } catch {
      toast.error('Failed to add product')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    try { await remove.mutateAsync(id); toast.success('Product deleted') }
    catch { toast.error('Failed to delete product') }
  }

  return (
    <PageShell
      title="Product Catalog"
      subtitle="Manage all products available on the site."
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" />Add Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Product</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input name="name" required placeholder="Product name…" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input name="category" required placeholder="e.g. Audio, Visual…" />
              </div>
              <div className="space-y-1.5">
                <Label>Sub Category</Label>
                <Input name="sub_category" placeholder="e.g. Amplifier…" />
              </div>
              <div className="space-y-1.5">
                <Label>Image</Label>
                <Input name="image" type="file" accept="image/*" />
              </div>
              <Button type="submit" className="w-full" disabled={create.isPending}>
                {create.isPending ? 'Saving…' : 'Add Product'}
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
              placeholder="Search by name, category, or sub category…"
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                <tr className="border-b">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-12">ID</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-16">Gambar</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Nama</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Kategori</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Sub Kategori</th>
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
                        No products match "{query}"
                      </td>
                    </tr>
                  ) : filtered.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground w-12">{p.id}</td>
                      <td className="px-4 py-3 w-16">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url} alt={p.name} className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-muted" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.category}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.sub_category}</td>
                      <td className="px-4 py-3 w-12">
                        <button
                          onClick={() => handleDelete(p.id)}
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
