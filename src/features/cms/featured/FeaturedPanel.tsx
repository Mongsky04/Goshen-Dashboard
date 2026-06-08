import { useState, useMemo } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { useFeatured, useCreateFeatured, useDeleteFeatured } from './useFeatured'
import { useAllProducts } from '../homepage/useHomepage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Check, Trash2, Plus, Star, Search } from 'lucide-react'

type SortKey = 'newest' | 'oldest' | 'az' | 'za' | 'cat'

type FeaturedCategory = 'New Products' | 'Best Sellers' | 'Special Offers'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az',     label: 'Name A–Z' },
  { value: 'za',     label: 'Name Z–A' },
  { value: 'cat',    label: 'Category A–Z' },
]

const CATEGORY_OPTIONS: { value: FeaturedCategory; title: string; description: string }[] = [
  { value: 'New Products', title: 'New Products', description: 'Newest arrivals on the homepage' },
  { value: 'Best Sellers', title: 'Best Sellers', description: 'Top-performing products' },
  { value: 'Special Offers', title: 'Special Offers', description: 'Promotions and highlighted deals' },
]

export function FeaturedPanel() {
  const { data: items = [], isLoading } = useFeatured()
  const { data: allProducts = [] } = useAllProducts()
  const create = useCreateFeatured()
  const remove = useDeleteFeatured()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [productQuery, setProductQuery] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<FeaturedCategory[]>([])

  const openDialog = () => {
    setProductQuery('')
    setSelectedProductId(null)
    setSelectedCategories([])
    setOpen(true)
  }

  const toggleCategory = (category: FeaturedCategory) => {
    setSelectedCategories(prev => prev.includes(category)
      ? prev.filter(item => item !== category)
      : [...prev, category])
  }

  const filteredProducts = useMemo(() => {
    const q = productQuery.toLowerCase()
    let result = allProducts.filter(product =>
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      product.subCategory.toLowerCase().includes(q)
    )

    switch (sort) {
      case 'newest': result = [...result].sort((a, b) => b.id - a.id); break
      case 'oldest': result = [...result].sort((a, b) => a.id - b.id); break
      case 'az':     result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break
      case 'za':     result = [...result].sort((a, b) => b.name.localeCompare(a.name)); break
      case 'cat':    result = [...result].sort((a, b) => a.category.localeCompare(b.category)); break
    }

    return result
  }, [allProducts, productQuery, sort])

  const selectedProduct = allProducts.find(product => product.id === selectedProductId) ?? null

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
    if (!selectedProductId) {
      toast.error('Select a product first')
      return
    }
    if (selectedCategories.length === 0) {
      toast.error('Pick at least one featured group')
      return
    }
    try {
      await create.mutateAsync({
        product_id: selectedProductId,
        featured_categories: selectedCategories,
      })
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
            <Button size="sm" onClick={openDialog}><Plus className="mr-1 h-4 w-4" />Add</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Featured Item</DialogTitle>
              <DialogDescription>
                Pick a product and assign one or more featured groups for the homepage.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-1 flex-col gap-4 overflow-hidden">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_320px] flex-1 overflow-hidden">
                <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products by name, category, or sub category…"
                        value={productQuery}
                        onChange={e => setProductQuery(e.target.value)}
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

                  <div className="min-h-0 overflow-y-auto rounded-xl border bg-card p-3">
                    {filteredProducts.length === 0 ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">No products match "{productQuery}"</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {filteredProducts.map((product) => {
                          const isSelected = selectedProductId === product.id
                          return (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => setSelectedProductId(product.id)}
                              className={`group relative overflow-hidden rounded-xl border text-left transition-all ${
                                isSelected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground'
                              }`}
                            >
                              {product.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.imageUrl} alt={product.name} className="aspect-square w-full object-cover" />
                              ) : (
                                <div className="flex aspect-square items-center justify-center bg-muted">
                                  <span className="text-xs text-muted-foreground">No img</span>
                                </div>
                              )}
                              <div className="p-2.5">
                                <p className="truncate text-xs font-medium text-foreground">{product.name}</p>
                                <p className="truncate text-xs text-muted-foreground">{product.category}</p>
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
                </div>

                <div className="space-y-3 rounded-xl border bg-card p-4">
                  <div>
                    <Label>Featured Groups</Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">Choose one or more groups to show on the homepage.</p>
                  </div>

                  <div className="space-y-2">
                    {CATEGORY_OPTIONS.map((category) => {
                      const isSelected = selectedCategories.includes(category.value)
                      return (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => toggleCategory(category.value)}
                          className={`w-full rounded-xl border p-3 text-left transition-all ${
                            isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-muted-foreground'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">{category.title}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{category.description}</p>
                            </div>
                            {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-3 text-sm">
                    <p className="font-medium text-foreground">Selected product</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedProduct ? `${selectedProduct.name} (${selectedProduct.category})` : 'No product selected'}
                    </p>
                    <p className="mt-3 font-medium text-foreground">Selected groups</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'No group selected'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">
                  {selectedProductId ? '1 product selected' : 'Select a product'}
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={create.isPending}>
                    {create.isPending ? 'Saving…' : 'Add'}
                  </Button>
                </div>
              </div>
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
            <div className="max-h-160 overflow-y-auto">
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
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.name} className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-muted" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-primary">
                        {item.featuredCategories?.length > 0 ? item.featuredCategories.join(', ') : '—'}
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
