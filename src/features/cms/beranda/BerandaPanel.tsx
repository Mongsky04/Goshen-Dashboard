import { useState } from 'react'
import { SliderPanel } from '@/features/cms/slider/SliderPanel'
import { HomepagePanel } from '@/features/cms/homepage/HomepagePanel'
import { FeaturedPanel } from '@/features/cms/featured/FeaturedPanel'
import { ArticlesPanel } from '@/features/cms/articles/ArticlesPanel'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'banner',   label: 'Banner' },
  { id: 'grid',     label: 'Product Grid' },
  { id: 'featured', label: 'Featured' },
  { id: 'artikel',  label: 'Articles' },
] as const

type Tab = typeof TABS[number]['id']

export function BerandaPanel() {
  const [tab, setTab] = useState<Tab>('banner')

  return (
    <div className="space-y-6">
      <div className="flex border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'banner'   && <SliderPanel />}
      {tab === 'grid'     && <HomepagePanel />}
      {tab === 'featured' && <FeaturedPanel />}
      {tab === 'artikel'  && <ArticlesPanel />}
    </div>
  )
}
