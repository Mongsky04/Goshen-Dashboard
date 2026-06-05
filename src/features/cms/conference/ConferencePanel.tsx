import { useState, useEffect } from 'react'
import { useConferencePage, useSaveConferencePage } from './useConference'
import { BannerPicker } from '@/features/cms/slider/BannerPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MediaPickerDialog } from '@/components/MediaPickerDialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PageShell } from '@/components/layout/PageShell'

const SLUGS = [
  { slug: 'enterprise',       label: 'Enterprise' },
  { slug: 'government',       label: 'Government' },
  { slug: 'higher-education', label: 'Higher Education' },
  { slug: 'hospitality',      label: 'Hospitality' },
]

const EMPTY_FORM = {
  isPublished: false,
  heroImageUrl: '', badgeText: '', headline: '', subText: '',
  titleProductGrid: '', titleWorkspace: '', titleSolutions: '', titleContact: '',
  workspaceDescription: '',
}

export function ConferencePanel() {
  const [activeSlug, setActiveSlug] = useState(SLUGS[0].slug)
  const { data: page, isLoading } = useConferencePage(activeSlug)
  const save = useSaveConferencePage(activeSlug)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!page) { setForm(EMPTY_FORM); return }
    setForm({
      isPublished: page.isPublished,
      heroImageUrl: page.hero?.heroImageUrl ?? '',
      badgeText: page.hero?.badgeText ?? '',
      headline: page.hero?.headline ?? '',
      subText: page.hero?.subText ?? '',
      titleProductGrid: page.titles?.productGrid ?? '',
      titleWorkspace: page.titles?.workspace ?? '',
      titleSolutions: page.titles?.solutions ?? '',
      titleContact: page.titles?.contact ?? '',
      workspaceDescription: page.workspaceDescription ?? '',
    })
  }, [page])

  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    try {
      await save.mutateAsync({
        isPublished: form.isPublished,
        hero: { heroImageUrl: form.heroImageUrl, badgeText: form.badgeText, headline: form.headline, subText: form.subText },
        titles: { productGrid: form.titleProductGrid, workspace: form.titleWorkspace, solutions: form.titleSolutions, contact: form.titleContact },
        workspaceDescription: form.workspaceDescription,
      })
      toast.success('Saved')
    } catch { toast.error('Failed to save') }
  }

  const activeLabel = SLUGS.find((s) => s.slug === activeSlug)?.label ?? ''

  return (
    <PageShell
      title="Conference"
      subtitle="Edit conference page content per segment."
      action={
        <Button size="sm" onClick={handleSave} disabled={save.isPending || isLoading}>
          {save.isPending ? 'Saving…' : 'Save'}
        </Button>
      }
    >
      <div className="space-y-6">
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
          {[...Array(6)].map((_, i) => <div key={i} className="h-9 animate-pulse rounded-md bg-muted" />)}
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

          {/* Hero */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hero</p>
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
              <Label>Badge Text</Label>
              <Input value={form.badgeText} onChange={set('badgeText')} placeholder="mis: Solusi Enterprise" />
            </div>
            <div className="space-y-1.5">
              <Label>Headline</Label>
              <Input value={form.headline} onChange={set('headline')} placeholder="Judul utama…" />
            </div>
            <div className="space-y-1.5">
              <Label>Sub Text</Label>
              <Input value={form.subText} onChange={set('subText')} placeholder="Deskripsi singkat…" />
            </div>
          </div>

          {/* Section Titles */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Section Titles</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Product Grid</Label>
                <Input value={form.titleProductGrid} onChange={set('titleProductGrid')} />
              </div>
              <div className="space-y-1.5">
                <Label>Workspace</Label>
                <Input value={form.titleWorkspace} onChange={set('titleWorkspace')} />
              </div>
              <div className="space-y-1.5">
                <Label>Solutions</Label>
                <Input value={form.titleSolutions} onChange={set('titleSolutions')} />
              </div>
              <div className="space-y-1.5">
                <Label>Contact</Label>
                <Input value={form.titleContact} onChange={set('titleContact')} />
              </div>
            </div>
          </div>

          {/* Workspace */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Workspace</p>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.workspaceDescription} onChange={set('workspaceDescription')} />
            </div>
          </div>

          {/* Banner */}
          <div className="rounded-xl border bg-card p-5">
            <BannerPicker
              slug={`conference-${activeSlug}`}
              multiple={false}
              title="Page Banner"
              description="Select 1 banner from the catalog to display on this page."
            />
          </div>
        </div>
      )}
      </div>
    </PageShell>
  )
}
