import { useState, useMemo } from 'react'
import { useSlider, useCreateSlider, useDeleteSlider, useReorderSlider } from './useSlider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2, Plus, ImageIcon, ChevronLeft, ChevronRight, Search } from 'lucide-react'

export function SliderPanel() {
  const { data: rawItems = [], isLoading } = useSlider()
  const create = useCreateSlider()
  const remove = useDeleteSlider()
  const reorder = useReorderSlider()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const items = [...rawItems].sort((a, b) => a.order_num - b.order_num)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return items.filter(s => !q || s.title.toLowerCase().includes(q))
  }, [items, query])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this slide?')) return
    try { await remove.mutateAsync(id); toast.success('Slide deleted') }
    catch { toast.error('Failed to delete') }
  }

  const handleMove = async (index: number, direction: 'left' | 'right') => {
    const swapIndex = direction === 'left' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= items.length) return

    const a = items[index]
    const b = items[swapIndex]
    try {
      // Swap their order_num values
      await reorder.mutateAsync({ id: a.id, orderNum: b.order_num })
      await reorder.mutateAsync({ id: b.id, orderNum: a.order_num })
    } catch {
      toast.error('Failed to reorder')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Banner</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage banner slide images.
          </p>
        </div>
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
                // Auto-assign as last position
                fd.set('order_num', String(items.length))
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
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-video animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16 text-center">
          <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No slides yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Click "Add Slide" to get started.</p>
        </div>
      ) : (
        <>
          {items.length > 1 && !query && (
            <p className="text-xs text-muted-foreground">
              Use the ← → buttons on each slide to change the display order.
            </p>
          )}
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No banners match "{query}"</p>
          ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {filtered.map((s) => {
              const realIndex = items.findIndex(x => x.id === s.id)
              return (
              <div key={s.id} className="group overflow-hidden rounded-xl border bg-card shadow-sm">
                {s.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.image_url}
                    alt={s.title || `Slide ${realIndex + 1}`}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                {s.title && (
                  <div className="px-2 pt-1.5">
                    <p className="truncate text-xs font-medium">{s.title}</p>
                  </div>
                )}
                <div className="flex items-center justify-between border-t px-2 py-1.5">
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleMove(realIndex, 'left')}
                      disabled={realIndex === 0 || reorder.isPending}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                      title="Move left"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-xs text-muted-foreground">
                      {realIndex + 1}
                    </span>
                    <button
                      onClick={() => handleMove(realIndex, 'right')}
                      disabled={realIndex === items.length - 1 || reorder.isPending}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                      title="Move right"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              )
            })}
          </div>
          )}
        </>
      )}
    </div>
  )
}
