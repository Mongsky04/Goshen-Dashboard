import { useState, useMemo } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { useBrands, useCreateBrand, useDeleteBrand } from './useBrands'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2, Plus, Search } from 'lucide-react'

type SortKey = 'newest' | 'oldest' | 'az' | 'za'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az',     label: 'Name A–Z' },
  { value: 'za',     label: 'Name Z–A' },
]

export function BrandsPanel() {
  const { data: brands = [], isLoading } = useBrands()
  const create = useCreateBrand()
  const remove = useDeleteBrand()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    let result = brands.filter(b => !q || b.name.toLowerCase().includes(q))
    switch (sort) {
      case 'newest': result = [...result].sort((a, b) => b.id - a.id); break
      case 'oldest': result = [...result].sort((a, b) => a.id - b.id); break
      case 'az':     result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break
      case 'za':     result = [...result].sort((a, b) => b.name.localeCompare(a.name)); break
    }
    return result
  }, [brands, query, sort])

  return (
    <PageShell
      title="Brands"
      subtitle="Brand logos displayed on the homepage."
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" />Add Brand</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Brand</DialogTitle></DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault()
              try { await create.mutateAsync(new FormData(e.currentTarget)); toast.success('Brand added'); setOpen(false) }
              catch { toast.error('Failed') }
            }} className="space-y-3">
              <div className="space-y-1"><Label>Name</Label><Input name="name" required /></div>
              <div className="space-y-1"><Label>Logo Image</Label><Input name="image" type="file" accept="image/*" /></div>
              <div className="space-y-1"><Label>Or Image URL</Label><Input name="image_url" type="url" /></div>
              <Button type="submit" className="w-full" disabled={create.isPending}>{create.isPending ? 'Adding…' : 'Add'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name…"
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
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                <tr className="border-b">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-12">#</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-20">Logo</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Name</th>
                  <th className="px-4 py-2.5 w-12"></th>
                </tr>
              </thead>
            </table>
            <div className="max-h-[640px] overflow-y-auto">
              <table className="w-full text-sm">
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                        {brands.length === 0 ? 'No brands yet' : `No brands match "${query}"`}
                      </td>
                    </tr>
                  ) : filtered.map((b, i) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground w-12">{i + 1}</td>
                      <td className="px-4 py-3 w-20">
                        {b.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.image_url} alt={b.name} className="h-8 w-14 rounded object-contain" />
                        ) : (
                          <div className="h-8 w-14 rounded bg-muted" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{b.name}</td>
                      <td className="px-4 py-3 w-12">
                        <button
                          onClick={async () => {
                            if (!confirm('Delete?')) return
                            try { await remove.mutateAsync(b.id); toast.success('Deleted') }
                            catch { toast.error('Failed') }
                          }}
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
