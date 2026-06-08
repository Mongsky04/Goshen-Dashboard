import { useState, useMemo } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { useSlider, useCreateSlider, useDeleteSlider } from './useSlider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2, Plus, ImageIcon, Search } from 'lucide-react'

type SortKey = 'newest' | 'oldest' | 'az' | 'za'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'az',     label: 'Nama A–Z' },
  { value: 'za',     label: 'Nama Z–A' },
]

export function SliderPanel() {
  const { data: rawItems = [], isLoading } = useSlider()
  const create = useCreateSlider()
  const remove = useDeleteSlider()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    let result = rawItems.filter(s => !q || s.title.toLowerCase().includes(q))

    switch (sort) {
      case 'newest': result = [...result].sort((a, b) => b.id - a.id); break
      case 'oldest': result = [...result].sort((a, b) => a.id - b.id); break
      case 'az':     result = [...result].sort((a, b) => a.title.localeCompare(b.title)); break
      case 'za':     result = [...result].sort((a, b) => b.title.localeCompare(a.title)); break
    }

    return result
  }, [rawItems, query, sort])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this slide?')) return
    try { await remove.mutateAsync(id); toast.success('Slide deleted') }
    catch { toast.error('Failed to delete') }
  }

  return (
    <PageShell
      title="Banner"
      subtitle="Manage banner slide images."
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" />Add Slide</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Slide</DialogTitle></DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                fd.set('order_num', String(rawItems.length))
                try {
                  await create.mutateAsync(fd)
                  toast.success('Slide added')
                  setOpen(false)
                } catch {
                  toast.error('Failed to add slide')
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input name="title" placeholder="e.g. Summer Campaign" required />
              </div>
              <div className="space-y-1.5">
                <Label>Image</Label>
                <Input name="image" type="file" accept="image/*" required />
              </div>
              <Button type="submit" className="w-full" disabled={create.isPending}>
                {create.isPending ? 'Saving…' : 'Add Slide'}
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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : rawItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16 text-center">
            <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No slides yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Click "Add Slide" to get started.</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No banners match "{query}"</p>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                <tr className="border-b">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-12">#</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-20">Image</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Name</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground w-16"></th>
                </tr>
              </thead>
            </table>
            <div className="max-h-160 overflow-y-auto">
              <table className="w-full text-sm">
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground w-12">{i + 1}</td>
                      <td className="px-4 py-3 w-20">
                        {s.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.imageUrl} alt={s.title} className="h-10 w-16 rounded-md object-cover" />
                        ) : (
                          <div className="flex h-10 w-16 items-center justify-center rounded-md bg-muted">
                            <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{s.title || '—'}</td>
                      <td className="px-4 py-3 text-right w-16">
                        <button
                          onClick={() => handleDelete(s.id)}
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
