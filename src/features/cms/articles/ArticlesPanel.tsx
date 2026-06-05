import { useRef, useState } from 'react'
import { useArticles, useCreateArticle, useDeleteArticle } from './useArticles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MediaPickerDialog } from '@/components/MediaPickerDialog'
import { toast } from 'sonner'
import { Trash2, Plus, FileText, Calendar } from 'lucide-react'

export function ArticlesPanel() {
  const { data: articles = [], isLoading } = useArticles()
  const create = useCreateArticle()
  const remove = useDeleteArticle()
  const [open, setOpen] = useState(false)
  const imageUrlRef = useRef<HTMLInputElement>(null)

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this article?')) return
    try { await remove.mutateAsync(id); toast.success('Article deleted') }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Articles</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Content shown in the "Latest from Goshen" section on the homepage.
          </p>
        </div>
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
                <Input name="title" required placeholder="Judul artikel…" />
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
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No articles yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Click "Add Article" to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
            >
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {a.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image_url} alt={a.title} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.title}</p>
                {a.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{a.description}</p>
                )}
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(a.published_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </div>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
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
