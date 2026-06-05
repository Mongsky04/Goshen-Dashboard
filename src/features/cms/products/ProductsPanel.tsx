import { useState, useMemo } from 'react'
import { useProducts, useCreateProduct, useDeleteProduct } from './useProducts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Trash2, Plus, Search } from 'lucide-react'

export function ProductsPanel() {
  const { data: products = [], isLoading } = useProducts()
  const create = useCreateProduct()
  const remove = useDeleteProduct()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return products.filter(p =>
      !q || p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sub_category.toLowerCase().includes(q)
    )
  }, [products, query])

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
    try {
      await remove.mutateAsync(id)
      toast.success('Product deleted')
    } catch {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Product Catalog</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage all products available on the site.
          </p>
        </div>
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
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, category, or sub category…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">ID</TableHead>
                <TableHead className="w-16">Gambar</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Sub Kategori</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No products match "{query}"
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground text-xs">{p.id}</TableCell>
                  <TableCell>
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} className="h-9 w-9 rounded-lg object-cover" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.category}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.sub_category}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
