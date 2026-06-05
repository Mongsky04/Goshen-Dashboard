import { useState, useEffect, useMemo } from 'react'
import { useHomepageGrid, useUpdateHomepageGrid, useAllProducts } from './useHomepage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Check, Search } from 'lucide-react'

export function HomepagePanel() {
  const { data: grid = [], isLoading: gridLoading } = useHomepageGrid()
  const { data: allProducts = [], isLoading: productsLoading } = useAllProducts()
  const update = useUpdateHomepageGrid()
  const [selected, setSelected] = useState<number[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    setSelected(grid.map((g) => g.product_id))
  }, [grid])

  const toggle = (productId: number) => {
    setSelected((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const handleSave = async () => {
    try {
      await update.mutateAsync(selected)
      toast.success('Product grid updated')
    } catch {
      toast.error('Failed to save')
    }
  }

  const isLoading = gridLoading || productsLoading

  const { selectedProducts, unselectedProducts } = useMemo(() => {
    const q = query.toLowerCase()
    const matches = (p: typeof allProducts[0]) =>
      !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)

    return {
      selectedProducts: allProducts.filter((p) => selected.includes(p.id) && matches(p)),
      unselectedProducts: allProducts.filter((p) => !selected.includes(p.id) && matches(p)),
    }
  }, [allProducts, selected, query])

  const ProductCard = ({ p }: { p: typeof allProducts[0] }) => {
    const isSelected = selected.includes(p.id)
    return (
      <button
        key={p.id}
        type="button"
        onClick={() => toggle(p.id)}
        className={`relative overflow-hidden rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
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
        <div className="p-2">
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
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Product Grid</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Select products shown in the homepage grid.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {selected.length} selected
          </span>
          <Button size="sm" onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or category…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {selectedProducts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected</p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {selectedProducts.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            </div>
          )}
          {unselectedProducts.length > 0 && (
            <div className="space-y-2">
              {selectedProducts.length > 0 && (
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">All Products</p>
              )}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {unselectedProducts.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            </div>
          )}
          {selectedProducts.length === 0 && unselectedProducts.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No products match "{query}"</p>
          )}
        </div>
      )}
    </div>
  )
}
