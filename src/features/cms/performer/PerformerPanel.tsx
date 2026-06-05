import { useState, useEffect } from 'react'
import { usePerformerPage, useSavePerformerPage } from './usePerformer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MediaPickerDialog } from '@/components/MediaPickerDialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const SLUGS = [
  { slug: 'musician',        label: 'Musician' },
  { slug: 'vocalist',        label: 'Vocalist' },
  { slug: 'master-ceremony', label: 'Master of Ceremony' },
]

const EMPTY_FORM = {
  isPublished: false,
  heroImageUrl: '', productGridTitle: '', videosSectionTitle: '',
  mainVideoTitle: '', mainVideoSubtitle: '', mainVideoThumbnailUrl: '', mainVideoUrl: '',
}

export function PerformerPanel() {
  const [activeSlug, setActiveSlug] = useState(SLUGS[0].slug)
  const { data: page, isLoading } = usePerformerPage(activeSlug)
  const save = useSavePerformerPage(activeSlug)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!page) { setForm(EMPTY_FORM); return }
    setForm({
      isPublished: page.isPublished,
      heroImageUrl: page.heroImageUrl ?? '',
      productGridTitle: page.productGridTitle ?? '',
      videosSectionTitle: page.videosSectionTitle ?? '',
      mainVideoTitle: page.mainVideo?.title ?? '',
      mainVideoSubtitle: page.mainVideo?.subtitle ?? '',
      mainVideoThumbnailUrl: page.mainVideo?.thumbnailUrl ?? '',
      mainVideoUrl: page.mainVideo?.videoUrl ?? '',
    })
  }, [page])

  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    try {
      await save.mutateAsync({
        isPublished: form.isPublished,
        heroImageUrl: form.heroImageUrl,
        productGridTitle: form.productGridTitle,
        videosSectionTitle: form.videosSectionTitle,
        mainVideo: {
          isMain: true, sortOrder: 0,
          title: form.mainVideoTitle,
          subtitle: form.mainVideoSubtitle,
          thumbnailUrl: form.mainVideoThumbnailUrl,
          videoUrl: form.mainVideoUrl,
        },
      })
      toast.success('Saved')
    } catch { toast.error('Failed to save') }
  }

  const activeLabel = SLUGS.find((s) => s.slug === activeSlug)?.label ?? ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Performer</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Edit performer page content per segment.
          </p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={save.isPending || isLoading}>
          {save.isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Slug tabs */}
      <div className="flex border-b">
        {SLUGS.map(({ slug, label }) => (
          <button
            key={slug}
            onClick={() => setActiveSlug(slug)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeSlug === slug
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-9 animate-pulse rounded-md bg-muted" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Published toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              />
              <div className={cn(
                'w-10 h-5 rounded-full transition-colors',
                form.isPublished ? 'bg-primary' : 'bg-muted-foreground/30'
              )} />
              <div className={cn(
                'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                form.isPublished ? 'translate-x-5' : 'translate-x-0'
              )} />
            </div>
            <span className="text-sm font-medium">
              {form.isPublished ? `${activeLabel} published` : `${activeLabel} unpublished`}
            </span>
          </label>

          {/* General */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">General</p>
            <div className="space-y-1.5">
              <Label>Hero Image</Label>
              <div className="flex gap-2">
                <Input
                  value={form.heroImageUrl}
                  onChange={set('heroImageUrl')}
                  placeholder="https://…"
                  className="flex-1"
                />
                <MediaPickerDialog onSelect={(url) => setForm((f) => ({ ...f, heroImageUrl: url }))} />
              </div>
              {form.heroImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.heroImageUrl} alt="" className="mt-2 h-28 w-full rounded-lg object-cover" />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Product Grid Title</Label>
              <Input value={form.productGridTitle} onChange={set('productGridTitle')} />
            </div>
            <div className="space-y-1.5">
              <Label>Videos Section Title</Label>
              <Input value={form.videosSectionTitle} onChange={set('videosSectionTitle')} />
            </div>
          </div>

          {/* Main Video */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Main Video</p>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.mainVideoTitle} onChange={set('mainVideoTitle')} />
            </div>
            <div className="space-y-1.5">
              <Label>Subtitle</Label>
              <Input value={form.mainVideoSubtitle} onChange={set('mainVideoSubtitle')} />
            </div>
            <div className="space-y-1.5">
              <Label>Thumbnail</Label>
              <div className="flex gap-2">
                <Input
                  value={form.mainVideoThumbnailUrl}
                  onChange={set('mainVideoThumbnailUrl')}
                  placeholder="https://…"
                  className="flex-1"
                />
                <MediaPickerDialog onSelect={(url) => setForm((f) => ({ ...f, mainVideoThumbnailUrl: url }))} />
              </div>
              {form.mainVideoThumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.mainVideoThumbnailUrl} alt="" className="mt-2 h-24 w-full rounded-lg object-cover" />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Video URL</Label>
              <Input value={form.mainVideoUrl} onChange={set('mainVideoUrl')} placeholder="https://youtube.com/…" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
