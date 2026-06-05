import { useRef, useState, useMemo } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { useArticles, useCreateArticle, useDeleteArticle } from './useArticles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MediaPickerDialog } from '@/components/MediaPickerDialog'
import { toast } from 'sonner'
import { Trash2, Plus, FileText, Search } from 'lucide-react'

type SortKey = 'newest' | 'oldest' | 'az' | 'za'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az',     label: 'Title A–Z' },
  { value: 'za',     label: 'Title Z–A' },
]

export function ArticlesPanel() {
  const { data: articles = [], isLoading } = useArticles()
  const create = useCreateArticle()
  const remove = useDeleteArticle()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const imageUrlRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    let result = articles.filter(a =>
      !q || a.title.toLowerCase().includes(q) || (a.description ?? '').toLowerCase().includes(q)
    )
    switch (sort) {
      case 'newest': result = [...result].sort((a, b) => b.id - a.id); break
      case 'oldest': result = [...result].sort((a, b) => a.id - b.id); break
      case 'az':     result = [...result].sort((a, b) => a.title.localeCompare(b.title)); break
      case 'za':     result = [...result].sort((a, b) => b.title.localeCompare(a.title)); break
    }
    return result
  }, [articles, query, sort])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this article?')) return
    try { await remove.mutateAsync(id); toast.success('Article deleted') }
    catch { toast.error('Failed to delete') }
  }

  return (
    <PageShell
      title="Articles"
      subtitle="Content shown in the 'Latest from Goshen' section on the homepage."
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" />Add Article</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Article</DialogTitle></DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                try {
                  await create.mutateAsync(new FormData(e.currentTarget))
                  toast.success('Article created')
                  setOpen(false)
                } catch {
                  toast.error('Failed to create article')
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input name="title" required placeholder="Article title…" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input name="description" placeholder="Short summary…" />
              </div>
              <div className="space-y-1.5">
                <Label>Image</Label>
                <div className="flex gap-2">
                  <Input ref={imageUrlRef} name="image_url" type="url" placeholder="https://…" className="flex-1" />
                  <MediaPickerDialog onSelect={(url) => { if (imageUrlRef.current) imageUrlRef.current.value = url }} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={create.isPending}>
                {create.isPending ? 'Saving…' : 'Create Article'}
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
              placeholder="Search by title or description…"
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
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">No articles yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Click "Add Article" to get started.</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                <tr className="border-b">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-12">#</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-20">Image</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Title</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-36">Published</th>
                  <th className="px-4 py-2.5 w-12"></th>
                </tr>
              </thead>
            </table>
            <div className="max-h-[640px] overflow-y-auto">
              <table className="w-full text-sm">
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No articles match "{query}"
                      </td>
                    </tr>
                  ) : filtered.map((a, i) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground w-12">{i + 1}</td>
                      <td className="px-4 py-3 w-20">
                        {a.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.image_url} alt={a.title} className="h-9 w-14 rounded-md object-cover" />
                        ) : (
                          <div className="h-9 w-14 rounded-md bg-muted" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{a.title}</p>
                        {a.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{a.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground w-36">
                        {new Date(a.published_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 w-12">
                        <button
                          onClick={() => handleDelete(a.id)}
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
