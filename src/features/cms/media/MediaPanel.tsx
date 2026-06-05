import { useRef, useState } from 'react'
import { useMedia, useUploadMedia, useDeleteMedia } from './useMedia'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, Trash2, Copy, ImageIcon, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function MediaPanel() {
  const { data: assets = [], isLoading } = useMedia()
  const upload = useUploadMedia()
  const remove = useDeleteMedia()
  const fileRef = useRef<HTMLInputElement>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        await upload.mutateAsync(fd)
      } catch {
        toast.error(`Failed to upload: ${file.name}`)
      }
    }
    toast.success('Upload complete')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleCopy = (url: string, id: number) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('URL copied')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this asset?')) return
    try {
      await remove.mutateAsync(id)
      toast.success('Asset deleted')
    } catch {
      toast.error('Failed to delete asset')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Media Library</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Upload once, use anywhere.
          </p>
        </div>
        <Button size="sm" onClick={() => fileRef.current?.click()} disabled={upload.isPending}>
          <Upload className="mr-1.5 h-4 w-4" />
          {upload.isPending ? 'Uploading…' : 'Upload'}
        </Button>
      </div>

      {/* Hidden file input — multiple */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex h-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
        onClick={() => fileRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-1.5">
          <Upload className="h-5 w-5 opacity-50" />
          <span>Drag &amp; drop or click to upload</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <ImageIcon className="h-10 w-10 opacity-30" />
          <p className="text-sm">No assets yet. Upload images above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group relative overflow-hidden rounded-xl border bg-card shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.filename}
                className="aspect-square w-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-2 transition-colors group-hover:bg-black/50">
                {/* Top: delete button */}
                <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="rounded-md bg-destructive/90 p-1 text-white hover:bg-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* Bottom: filename + copy */}
                <div className="flex items-center justify-between gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="min-w-0 truncate text-[10px] font-medium text-white">
                    {formatBytes(asset.size)}
                  </p>
                  <button
                    onClick={() => handleCopy(asset.url, asset.id)}
                    className={cn(
                      'flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium text-white transition-colors',
                      copiedId === asset.id
                        ? 'bg-green-600/90'
                        : 'bg-black/60 hover:bg-black/80'
                    )}
                  >
                    {copiedId === asset.id ? (
                      <><Check className="h-3 w-3" /> Copied</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Copy URL</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
