import { useState, useRef } from 'react'
import { useMedia, useUploadMedia, type MediaAsset } from '@/features/cms/media/useMedia'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { ImageIcon, Upload, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  onSelect: (url: string) => void
  trigger?: React.ReactNode
}

export function MediaPickerDialog({ onSelect, trigger }: Props) {
  const { data: assets = [], isLoading } = useMedia()
  const upload = useUploadMedia()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = assets.filter((a) =>
    a.filename.toLowerCase().includes(search.toLowerCase())
  )

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      const asset = await upload.mutateAsync(fd)
      toast.success('Upload successful')
      setSelected(asset.url)
      setSearch('')
    } catch {
      toast.error('Upload failed')
    }
    e.target.value = ''
  }

  const handleConfirm = () => {
    if (!selected) return
    onSelect(selected)
    setOpen(false)
    setSelected(null)
    setSearch('')
  }

  const handleClose = (v: boolean) => {
    setOpen(v)
    if (!v) { setSelected(null); setSearch('') }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {trigger ?? <Button type="button" variant="outline" size="sm">Pick from Library</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pick Media</DialogTitle>
        </DialogHeader>

        {/* Toolbar: search + upload */}
        <div className="flex items-center gap-3 border-b pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename…"
              className="pl-8 text-sm"
            />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {filtered.length} assets
          </span>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={upload.isPending}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {upload.isPending ? 'Uploading…' : 'Upload New'}
          </Button>
        </div>

        {/* Grid */}
        <div className="max-h-[55vh] overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-4 gap-3 p-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="aspect-square animate-pulse rounded-lg bg-muted" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <ImageIcon className="h-8 w-8 opacity-30" />
              <p className="text-sm">{search ? 'No results found' : 'No assets yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 p-1">
              {filtered.map((asset: MediaAsset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setSelected(asset.url)}
                  className={cn(
                    'group space-y-1.5 rounded-lg text-left transition-all',
                  )}
                >
                  <div className={cn(
                    'relative overflow-hidden rounded-lg border-2 transition-all',
                    selected === asset.url
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-transparent hover:border-muted-foreground/30'
                  )}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.filename}
                      className="aspect-square w-full object-cover"
                    />
                    {selected === asset.url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                        <div className="rounded-full bg-primary p-1">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="truncate px-0.5 text-[11px] text-muted-foreground leading-tight">
                    {asset.filename}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleConfirm} disabled={!selected}>
            Use Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
