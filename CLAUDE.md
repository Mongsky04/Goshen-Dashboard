# CLAUDE.md — goshen-dashboard

Admin CMS SPA untuk Goshen Web. Vite + React, port 3001.
Backend: goshen-api di port 8080.

## Stack

| Item   | Value                                              |
| ------ | -------------------------------------------------- |
| Build  | Vite 6                                             |
| Runtime | React 19, TypeScript 5                            |
| Routing | React Router v7                                   |
| State  | Zustand (auth), TanStack Query v5 (server)         |
| UI     | Tailwind v4 + shadcn/ui + lucide-react             |
| Tests  | Vitest + React Testing Library                     |

## Commands

```bash
npm run dev    # → http://localhost:3001
npm run build  # production build
npm test       # vitest run
```

## Architecture

```
src/
├── api/client.ts          # fetch wrapper — Bearer injection + 401 handling
├── store/authStore.ts     # Zustand persist — token + isAuthenticated
├── components/layout/     # DashboardLayout + Sidebar
├── components/ProtectedRoute.tsx
└── features/
    ├── auth/LoginPage.tsx
    └── cms/               # Satu folder per entity (hook + panel)
        ├── products/      { ProductsPanel.tsx, useProducts.ts }
        ├── featured/      { FeaturedPanel.tsx, useFeatured.ts }
        ├── articles/      { ArticlesPanel.tsx, useArticles.ts }
        ├── slider/        { SliderPanel.tsx, useSlider.ts }
        ├── brands/        { BrandsPanel.tsx, useBrands.ts }
        ├── customers/     { CustomersPanel.tsx, useCustomers.ts }
        ├── banners/       { BannersPanel.tsx, useBanners.ts }
        ├── homepage/      { HomepagePanel.tsx, useHomepage.ts }
        ├── conference/    { ConferencePanel.tsx, useConference.ts }
        ├── performer/     { PerformerPanel.tsx, usePerformer.ts }
        └── support/       { SupportPanel.tsx, useSupport.ts }
```

## Auth Flow

1. POST /admin/login → JWT
2. Store JWT di localStorage via Zustand persist
3. api/client.ts auto-inject Authorization: Bearer
4. 401 → logout() → redirect /login

## Panel Pattern

Setiap panel = `useXxx.ts` (TanStack Query hooks) + `XxxPanel.tsx` (UI).
- `useXxx.ts`: `useQuery` untuk fetch, `useMutation` + `invalidateQueries` untuk mutate.
- File upload: gunakan `api.upload(path, formData)` — tidak lewat `api.post`.

## Env

`VITE_API_URL=http://localhost:8080` (default jika tidak diset)

---

## Critical Rules

### API Response Shapes

- `products`, `featured`, `articles` → `pagedResponse` → unwrap **`r.data.data`** (type: `ApiPaged<T>`)
- Semua lainnya (slider, brands, customers, banners, support-cards) → unwrap **`r.data`** (type: `ApiList<T>`)
- `useAllProducts` (homepage picker) pakai key `['products', 'all']` dan `?limit=100` — HARUS beda dari `useProducts` key `['products']` untuk hindari cache collision + wrong shape error.

### JSON Field Names (Conference & Performer)

Backend emit **camelCase** — TypeScript interfaces harus match persis dengan JSON tags di Go handler.

Conference admin (`goshen-api/internal/handler/conference.go`):
- `isPublished`, `heroImageUrl`, `badgeText`, `subText`, `productGrid`, `workspaceDescription`

Performer admin (`goshen-api/internal/handler/performer.go`):
- `isPublished`, `heroImageUrl`, `productGridTitle`, `videosSectionTitle`, `mainVideo`, `thumbnailUrl`, `videoUrl`

### React Router v7

- **JANGAN** panggil `navigate()` di dalam render body — menyebabkan blank screen karena `startTransition`. Gunakan `<Navigate to="..." replace />` component.
- Sidebar `logout()` HARUS diikuti `navigate('/login', { replace: true })` — tanpa ini user tetap di protected route dengan flash sebentar.

### shadcn/ui + Tailwind v4

- `index.css` butuh **dua bagian**: `:root { --background: ... }` DAN `@theme inline { --color-background: var(--background) }` — tanpa mapping `@theme`, class `bg-background`, `bg-primary` dll menjadi transparan.
- Saat tambah shadcn component baru: cek `sonner.tsx` — jangan import dari `next-themes` (tidak diinstall), pakai `theme="light"` langsung.

### Panel Patterns

- **FeaturedPanel** create: hanya butuh `product_id` (dropdown dari `useAllProducts`) + `featured_categories`. Nama/gambar/kategori datang dari product yang di-link — jangan tambah field tersebut ke form.
- **Image guard wajib**: selalu `{item.image_url && <img ...>}` — jangan render `<img>` tanpa kondisi.
- **Conference valid slugs**: `enterprise`, `government`, `higher-education`, `hospitality`
- **Performer valid slugs**: `musician`, `vocalist`, `master-ceremony`
