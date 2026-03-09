# Phase 1: Foundation - Research

**Researched:** 2026-03-09
**Domain:** Next.js PWA scaffold, Dexie.js IndexedDB, Zustand, next-intl, Tailwind v4 dark mode
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand, Dexie.js, next-pwa, Lucide React, Recharts
- Init command: `npx create-next-app@latest budgetpulse --typescript --tailwind --app --src-dir`
- Dependencies: `zustand dexie recharts lucide-react next-pwa`
- UI Language: English default, Korean available via toggle
- i18n infrastructure (next-intl or similar) set up in Phase 1 — not retrofitted later
- Language toggle lives in the Settings page
- Category names use emoji + text following language setting
- Dark mode is default (background #0F172A, surface #1E293B)
- Light mode available via toggle in Settings page
- Theme and language preference persisted to localStorage/Zustand
- 5 bottom nav tabs: Home / Add / History / Analytics / Settings
- Add tab is visually distinct — FAB-style center button
- PWA icon: coin/pulse/wallet concept, blue #3B82F6 on dark #0F172A
- PWA manifest: theme_color #3B82F6, background_color #0F172A
- Icons exported at 192x192 and 512x512 PNG
- Pretendard font for amounts (Bold 32–48px)
- Safe area support from day one: `env(safe-area-inset-top/bottom)` on BottomNav and containers
- Dexie.js schema must define compound index `[date+category]`
- File structure reference: `src/app/`, `src/components/`, `src/stores/`, `src/lib/`, `src/hooks/`, `src/types/`
- i18n messages files in place before any UI text is hardcoded

### Claude's Discretion
- Exact icon visual design (coin, pulse wave, or wallet)
- Exact FAB-style treatment for the Add button (size, shadow, ring, elevation)
- Placeholder page content for feature pages (History, Analytics, Settings)
- Loading skeleton approach for future data-heavy screens
- Error boundary strategy

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PWA-01 | App installs on iOS and Android home screen | Official Next.js PWA guide: `app/manifest.ts` + HTTPS + valid icons is sufficient for installability. No third-party library required for install prompt. iOS requires user gesture via Share menu; Android shows native banner. |
| PWA-03 | App loads in under 2 seconds on a typical mobile connection | Next.js App Router with SSG/SSR, next/font for zero-FOUT Pretendard loading, Tailwind CSS purging, Vercel CDN edge delivery, no heavy runtime at load time. Vitest smoke test can assert bundle size stays under threshold. |
</phase_requirements>

---

## Summary

BudgetPulse Phase 1 establishes the complete infrastructure skeleton: Next.js App Router scaffold with PWA installability, Dexie.js IndexedDB schema, Zustand stores, next-intl i18n wiring, and the Tailwind v4 dark-mode-first visual shell with bottom navigation.

The most significant research finding is a **version drift warning**: the locked stack specifies "Next.js 14" but `create-next-app@latest` today produces Next.js 16.1.6 with Tailwind v4.2.1 (not v3). Tailwind v4 has a materially different dark mode configuration (no `tailwind.config.js` dark key; uses CSS `@custom-variant` directive instead). The locked decision to use `next-pwa` is also risky: the original `shadowwalker/next-pwa` package has not been maintained for 4 years. The official Next.js documentation recommends either hand-rolling a minimal service worker for installability only, or using `@serwist/next` for full offline support.

**Primary recommendation:** Use Next.js App Router with the official manifest.ts approach for PWA installability (no library needed), implement Tailwind v4 dark mode via CSS custom variants, use `@serwist/next` instead of the abandoned `next-pwa`, and wire next-intl v4 in "without routing" mode (locale from cookie/Zustand).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | React framework + App Router | Official docs, Vercel deploy target |
| typescript | bundled | Type safety | Locked decision |
| tailwindcss | 4.2.1 | Utility CSS + dark mode | Locked decision |
| zustand | 5.0.11 | Client state management | Locked decision |
| dexie | 4.3.0 | IndexedDB wrapper | Locked decision |
| next-intl | 4.8.3 | i18n without locale routing | Official next-intl recommendation for single-domain i18n |
| lucide-react | 0.577.0 | Icons | Locked decision |
| recharts | (latest) | Charts | Locked decision (Phase 5, installed now) |

### PWA
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none — native) | — | manifest.ts + sw.js for installability | When only install prompt is needed (Phase 1) |
| @serwist/next | 9.5.6 | Service worker + offline caching | When offline caching needed (Phase 5) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-themes | 0.4.6 | Dark/light toggle via HTML attribute | Pairs with Tailwind v4 @custom-variant dark mode |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @serwist/next | shadowwalker/next-pwa | next-pwa abandoned 4 years ago; serwist is the official successor |
| @serwist/next | Manual sw.js | Manual is sufficient for Phase 1 installability; serwist adds offline (Phase 5) |
| next-intl (no routing) | next-intl (with routing) | Routing mode adds URL locale segments (/en, /ko) — unnecessary for a mobile PWA with settings toggle |

**Installation:**
```bash
npx create-next-app@latest budgetpulse --typescript --tailwind --app --src-dir

npm install zustand dexie recharts lucide-react next-intl next-themes
npm install @serwist/next
npm install -D serwist vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

> NOTE: The locked decision says `npm install next-pwa` but `next-pwa` (shadowwalker) is abandoned. Use `@serwist/next` instead for service worker support. For Phase 1 (installability only), even serwist is optional — a hand-written `public/sw.js` and `app/manifest.ts` is sufficient.

---

## Architecture Patterns

### Recommended Project Structure
```
budgetpulse/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout: font, i18n provider, metadata, theme
│   │   ├── manifest.ts         # PWA manifest (Next.js native)
│   │   ├── page.tsx            # Dashboard (redirect or placeholder)
│   │   ├── transactions/page.tsx
│   │   ├── add/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── settings/page.tsx
│   │   └── onboarding/page.tsx
│   ├── components/
│   │   └── layout/
│   │       ├── BottomNav.tsx   # 5-tab nav with FAB Add button
│   │       ├── Header.tsx
│   │       └── PageContainer.tsx
│   ├── stores/
│   │   ├── budgetStore.ts      # BudgetConfig, isOnboarded
│   │   ├── transactionStore.ts # Transaction[], loading state
│   │   └── settingsStore.ts    # language, theme
│   ├── lib/
│   │   ├── db.ts               # Dexie.js instance
│   │   ├── constants.ts        # Categories, defaults
│   │   └── formatters.ts       # Currency, date
│   ├── hooks/                  # (placeholder files)
│   ├── types/
│   │   └── index.ts            # All TypeScript types
│   └── i18n/
│       └── request.ts          # next-intl config
├── messages/
│   ├── en.json
│   └── ko.json
├── public/
│   ├── sw.js                   # Minimal service worker for installability
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── tests/
│   └── db.test.ts              # Dexie schema smoke test
├── vitest.config.mts
└── next.config.ts
```

### Pattern 1: Next.js Native PWA Manifest
**What:** Define manifest in `app/manifest.ts` (TypeScript export). Next.js automatically serves it at `/manifest.webmanifest` and injects the link tag.
**When to use:** Always. This is the official Next.js approach since 2024 — no external plugin needed for the manifest.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/progressive-web-apps
// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BudgetPulse',
    short_name: 'BudgetPulse',
    description: 'Real-time budget management — know your daily spending limit',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#3B82F6',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

### Pattern 2: Tailwind v4 Dark Mode with next-themes
**What:** Tailwind v4 removed `darkMode: 'class'` from `tailwind.config.js`. Dark mode is now declared as a CSS custom variant in `globals.css`. Pair with `next-themes` which sets a `data-theme` attribute on `<html>`.
**When to use:** Any project using Tailwind v4 + toggle-based dark mode.
**Example:**
```css
/* Source: https://tailwindcss.com/docs/dark-mode + verified community pattern */
/* globals.css */
@import "tailwindcss";

@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```
```typescript
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Pattern 3: Dexie.js Schema with Compound Index
**What:** Extend `Dexie` class, call `this.version(1).stores()` with the schema string. Compound index `[date+category]` enables efficient queries like "all transactions in month X by category".
**When to use:** Define schema once in `src/lib/db.ts`; export singleton `db`.
**Example:**
```typescript
// Source: https://dexie.org/docs/Compound-Index + Architecture doc
// src/lib/db.ts
import Dexie, { Table } from 'dexie'
import type { BudgetConfig, Transaction } from '@/types'

class BudgetPulseDB extends Dexie {
  budgetConfigs!: Table<BudgetConfig>
  transactions!: Table<Transaction>

  constructor() {
    super('BudgetPulseDB')
    this.version(1).stores({
      budgetConfigs: 'id, createdAt',
      transactions: 'id, date, category, [date+category]',
    })
  }
}

export const db = new BudgetPulseDB()
```

### Pattern 4: next-intl Without i18n Routing (Cookie-Based Locale)
**What:** next-intl v4 supports a "without routing" mode where locale comes from any source (cookie, Zustand, user setting) rather than URL segments.
**When to use:** Mobile PWA where URL-based locale (/en, /ko) would be confusing and unnecessary.
**Example:**
```typescript
// Source: https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value ?? 'en'
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```
```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin()
export default withNextIntl({})
```

### Pattern 5: Zustand v5 Persist Middleware (SSR-Safe)
**What:** Zustand v5 uses double-parentheses `create<T>()()` syntax. Persist middleware syncs to localStorage. Must handle SSR hydration mismatch on first render.
**When to use:** Settings store (language, theme) and budget config store.
**Example:**
```typescript
// Source: https://zustand.docs.pmnd.rs/reference/middlewares/persist
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SettingsStore {
  language: 'en' | 'ko'
  setLanguage: (lang: 'en' | 'ko') => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'budgetpulse-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

### Pattern 6: Pretendard Font via next/font/local
**What:** Load Pretendard Variable woff2 from `public/fonts/` using `next/font/local`. Assign a CSS variable. Apply to `<html>` in layout. Reference variable in Tailwind config.
**When to use:** Phase 1 root layout setup. Eliminates FOUT and layout shift.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/getting-started/fonts
// app/layout.tsx
import localFont from 'next/font/local'

const pretendard = localFont({
  src: '../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={pretendard.variable}>
      <body className={pretendard.className}>{children}</body>
    </html>
  )
}
```

### Pattern 7: iOS Safe Area via CSS env()
**What:** Use CSS environment variables for notch and home indicator padding. Required on BottomNav and full-screen containers.
**When to use:** Any fixed-position bottom bar or full-screen overlay.
**Example:**
```css
/* Source: Architecture_BudgetPulse1.1.md + MDN CSS env() */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}
.page-container {
  padding-top: env(safe-area-inset-top);
}
```
In Tailwind, use arbitrary values: `pb-[env(safe-area-inset-bottom)]` or define a CSS variable in globals.

### Anti-Patterns to Avoid
- **Using `shadowwalker/next-pwa`:** Package is 4 years unmaintained. Service workers generated by it may conflict with Next.js App Router. Use the official manifest.ts approach instead.
- **Hardcoding UI text before i18n is wired:** Once feature phases add text, retrofitting next-intl is painful. Wire `en.json` and `ko.json` and `useTranslations()` in Phase 1.
- **Using Tailwind v3 dark mode config in a v4 project:** `darkMode: 'class'` in `tailwind.config.js` does nothing in Tailwind v4 and will cause dark classes to silently not apply.
- **Calling `db` at module load in SSR context:** Dexie/IndexedDB only exists in the browser. Instantiate `db` with a guard or use dynamic import to avoid SSR errors in Next.js.
- **Zustand store accessing localStorage during SSR:** `persist` with `localStorage` will throw on server. Use `skipHydration: true` and call `rehydrate()` in a `useEffect`, or check for `typeof window !== 'undefined'`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark/light toggle | Custom ThemeContext + class swap | `next-themes` | Handles SSR flash, `prefers-color-scheme`, hydration mismatch |
| Font loading | Manual `<link>` tags | `next/font/local` | Automatic size-adjust fallback, zero FOUT, subsets |
| PWA manifest | Static JSON in `public/` | `app/manifest.ts` | Next.js injects the link tag automatically; TypeScript types validate the schema |
| Service worker for offline | Custom fetch event handler | `@serwist/next` (Phase 5) | Workbox precaching, runtime caching strategies, complex edge cases |
| i18n message lookup | `JSON.parse` + key map | `next-intl` | Pluralization, number formatting, date formatting, TypeScript type safety for message keys |
| IndexedDB queries | Raw `IDBRequest` | `dexie` | Compound indexes, promise-based API, reactive hooks via `dexie-react-hooks` |

**Key insight:** Every item above has a non-obvious correctness problem (SSR flash, FOUT, service worker update lifecycle, pluralization edge cases, IDBCursor API complexity) that libraries have already solved with years of real-world use.

---

## Common Pitfalls

### Pitfall 1: Next.js Version Drift
**What goes wrong:** The locked decision says "Next.js 14" but `create-next-app@latest` today scaffolds Next.js 16.1.6. The architecture doc's `next.config.js` syntax and `tailwind.config.ts` patterns may be outdated.
**Why it happens:** Version numbers in architecture documents lag behind current releases.
**How to avoid:** Use `create-next-app@latest` — it produces a working scaffold for the current version. Next.js 16 is backward-compatible with Next.js 14 App Router patterns. The CONTEXT.md stack is valid; just the version number is stale.
**Warning signs:** `tailwind.config.ts` with `darkMode: 'class'` in a Tailwind v4 project — dark mode will silently not work.

### Pitfall 2: Tailwind v4 Dark Mode Config
**What goes wrong:** Tailwind v4 (installed by `create-next-app@latest`) removed `darkMode: 'class'` from `tailwind.config.js`. If you add it anyway, dark classes compile but the selector never activates.
**Why it happens:** All Tailwind v3 tutorials and the architecture doc show the old config.
**How to avoid:** In `globals.css`, add `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));` and configure `next-themes` with `attribute="data-theme"`.
**Warning signs:** `dark:bg-slate-900` classes exist in markup but the background never changes when theme is toggled.

### Pitfall 3: Dexie / IndexedDB in SSR Context
**What goes wrong:** `import { db } from '@/lib/db'` at the top of a Server Component (or any module that runs on the server) throws `ReferenceError: indexedDB is not defined`.
**Why it happens:** IndexedDB is a browser API. Next.js Server Components and API routes run in Node.js.
**How to avoid:** Only import `db` in Client Components (`'use client'`), custom hooks, or wrap usage with `typeof window !== 'undefined'`. Never call `db` in `app/layout.tsx` at module scope.
**Warning signs:** Build or runtime error mentioning `indexedDB is not defined`.

### Pitfall 4: Zustand Hydration Mismatch
**What goes wrong:** Zustand's persist middleware reads localStorage on the client but not on the server, producing a React hydration mismatch warning. In some cases, it causes a visible flash of wrong state (e.g., light mode flash on a dark-default app).
**Why it happens:** SSR renders with initial state; client re-renders with persisted state.
**How to avoid:** Use `skipHydration: true` in persist options and call `useStore.persist.rehydrate()` inside a `useEffect` in the root layout.
**Warning signs:** React warning "Hydration failed because the server rendered HTML didn't match the client."

### Pitfall 5: iOS PWA Install Requirements
**What goes wrong:** PWA install banner appears on Android but not iOS. iOS users see no install prompt.
**Why it happens:** iOS Safari does not support `beforeinstallprompt`. iOS users must manually tap Share > Add to Home Screen.
**How to avoid:** Add an `InstallPrompt` component that detects iOS (`/iPad|iPhone|iPod/.test(navigator.userAgent)`) and shows manual instructions. The app must be served over HTTPS (Vercel provides this automatically).
**Warning signs:** Lighthouse PWA audit passes on desktop but iOS users report no install option.

### Pitfall 6: Service Worker File Location
**What goes wrong:** Service worker at `src/app/sw.ts` (App Router route) is treated as a Next.js route, not a service worker. Registration fails.
**Why it happens:** Developers try to co-locate the service worker in the `app/` directory.
**How to avoid:** Service worker must be at `public/sw.js` (or generated to `public/sw.js` by Serwist). Register from a Client Component using `navigator.serviceWorker.register('/sw.js')`.
**Warning signs:** `ServiceWorker registration failed: DOMException: Failed to register`.

### Pitfall 7: Compound Index Query Syntax in Dexie
**What goes wrong:** Querying `[date+category]` with `.where('date').equals(x)` does not use the compound index; it uses the single-field date index instead. This is correct but misses the optimization.
**Why it happens:** Developers don't know compound index query syntax.
**How to avoid:** To use the compound index, pass an array: `.where('[date+category]').equals([dateValue, categoryValue])`. The compound index is primarily valuable for Phase 3+ when filtering transactions by both date range and category simultaneously.
**Warning signs:** Slow queries when filtering by date + category on large transaction sets.

---

## Code Examples

Verified patterns from official sources:

### Minimal Service Worker for Installability (Phase 1)
```javascript
// Source: https://nextjs.org/docs/app/guides/progressive-web-apps
// public/sw.js — minimal, satisfies PWA installability criteria
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// Cache-first for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached ?? fetch(event.request)
    })
  )
})
```

### BottomNav with Safe Area and FAB Add Button
```typescript
// src/components/layout/BottomNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, History, BarChart2, Settings } from 'lucide-react'

const tabs = [
  { href: '/',             icon: Home,      label: 'Home' },
  { href: '/transactions', icon: History,   label: 'History' },
  { href: '/add',          icon: Plus,      label: 'Add',  isFab: true },
  { href: '/analytics',    icon: BarChart2, label: 'Analytics' },
  { href: '/settings',     icon: Settings,  label: 'Settings' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-end justify-around h-16">
        {tabs.map(({ href, icon: Icon, label, isFab }) =>
          isFab ? (
            <Link key={href} href={href} className="relative -top-4">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 shadow-lg ring-4 ring-slate-800">
                <Icon className="w-6 h-6 text-white" />
              </span>
              <span className="sr-only">{label}</span>
            </Link>
          ) : (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs ${
                pathname === href ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        )}
      </div>
    </nav>
  )
}
```

### Vitest Config for Next.js App Router
```typescript
// Source: https://nextjs.org/docs/app/guides/testing/vitest
// vitest.config.mts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

### Dexie DB Schema Smoke Test
```typescript
// tests/db.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../src/lib/db'

describe('BudgetPulseDB schema', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('opens database with correct version', async () => {
    expect(db.verno).toBe(1)
  })

  it('has budgetConfigs and transactions tables', () => {
    expect(db.tables.map(t => t.name)).toContain('budgetConfigs')
    expect(db.tables.map(t => t.name)).toContain('transactions')
  })

  it('can write and read a transaction', async () => {
    const id = await db.transactions.add({
      id: 'test-1',
      amount: 5000,
      category: 'food',
      date: new Date('2026-03-09'),
      createdAt: new Date(),
    })
    const record = await db.transactions.get(id)
    expect(record?.amount).toBe(5000)
  })
})
```
> Requires `fake-indexeddb` package for Vitest: `npm install -D fake-indexeddb`

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| shadowwalker/next-pwa | @serwist/next OR native manifest.ts | 2023-2024 | next-pwa abandoned; serwist is the active fork |
| `tailwind.config.js darkMode: 'class'` | `@custom-variant dark` in CSS | Tailwind v4 (2025) | Config-based dark mode silently does nothing in v4 |
| next-pwa `manifest.json` in `public/` | `app/manifest.ts` TypeScript export | Next.js 13.3+ | Native manifest support with type checking |
| Zustand `create<T>` (v4) | `create<T>()()` double call (v5) | Zustand v5 (2024) | Required for proper TypeScript inference with middleware |
| `localStorage` for IndexedDB-level data | `Dexie.js` | Always best practice | Dexie handles schema migrations, compound indexes, query API |

**Deprecated/outdated:**
- `shadowwalker/next-pwa`: Do not use — last published 4 years ago, not compatible with App Router reliably
- `tailwind.config.js darkMode: 'class'`: No effect in Tailwind v4 — use `@custom-variant` in CSS
- Zustand v4 single-call `create<T>(...)`: Works but types degrade with middleware in v5

---

## Open Questions

1. **next-pwa vs @serwist/next vs native**
   - What we know: Locked decision says `next-pwa`; next-pwa is abandoned; official Next.js docs show native manifest.ts + manual sw.js is sufficient for PWA-01 (installability); serwist is needed for PWA-02 (offline, Phase 5)
   - What's unclear: Whether the planner should swap the locked `next-pwa` dependency for `@serwist/next` now or defer to Phase 5
   - Recommendation: For Phase 1, use native manifest.ts + minimal `public/sw.js`. Install `@serwist/next` in Phase 5 when offline caching (PWA-02) is implemented. Do NOT install shadowwalker/next-pwa.

2. **Next.js 14 vs 16**
   - What we know: `create-next-app@latest` installs Next.js 16.1.6; the locked decision says "Next.js 14 App Router"
   - What's unclear: Whether to pin to v14 or accept v16
   - Recommendation: Use Next.js 16 (current). All App Router patterns from the architecture doc are compatible. Next.js 16 is stable and is what Vercel optimizes for.

3. **fake-indexeddb for Vitest**
   - What we know: Dexie requires a real or fake IndexedDB environment; jsdom does not include IndexedDB
   - What's unclear: Whether `fake-indexeddb` is stable enough for schema tests
   - Recommendation: Use `fake-indexeddb@5` (`npm install -D fake-indexeddb`). It is the standard Dexie testing companion and maintained by the Dexie team.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (latest) + @testing-library/react |
| Config file | `vitest.config.mts` — Wave 0 |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test -- --run --reporter=verbose` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PWA-01 | `app/manifest.ts` exports valid manifest with icons, start_url, display:standalone | unit | `npm test -- --run tests/manifest.test.ts` | Wave 0 |
| PWA-01 | BottomNav renders 5 tabs with correct hrefs | unit | `npm test -- --run tests/BottomNav.test.tsx` | Wave 0 |
| PWA-03 | Dexie DB opens, schema version=1, tables exist, can write+read | unit | `npm test -- --run tests/db.test.ts` | Wave 0 |
| PWA-03 | `npm run build` completes without errors | smoke | `npm run build` | N/A (existing) |

> PWA-01 install prompt on real iOS/Android device requires manual verification — cannot be automated in Vitest.
> PWA-03 "under 2 seconds" load time requires Lighthouse CI or manual Vercel Speed Insights check — Vitest covers the schema readiness prerequisite.

### Sampling Rate
- **Per task commit:** `npm test -- --run`
- **Per wave merge:** `npm test -- --run --reporter=verbose`
- **Phase gate:** Full suite green + `npm run build` clean before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/manifest.test.ts` — covers PWA-01 manifest validity
- [ ] `tests/BottomNav.test.tsx` — covers PWA-01 navigation structure
- [ ] `tests/db.test.ts` — covers PWA-03 schema readiness
- [ ] `vitest.config.mts` — framework config
- [ ] `package.json` test script — `"test": "vitest"`
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths fake-indexeddb`

---

## Sources

### Primary (HIGH confidence)
- [nextjs.org/docs/app/guides/progressive-web-apps](https://nextjs.org/docs/app/guides/progressive-web-apps) — Official PWA guide, manifest.ts pattern, service worker registration, iOS install instructions. Fetched 2026-03-09.
- [nextjs.org/docs/app/guides/testing/vitest](https://nextjs.org/docs/app/guides/testing/vitest) — Official Vitest setup for Next.js. Fetched 2026-03-09.
- [serwist.pages.dev/docs/next/getting-started](https://serwist.pages.dev/docs/next/getting-started) — @serwist/next installation and configuration. Fetched 2026-03-09.
- [next-intl.dev/docs/getting-started/app-router/without-i18n-routing](https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing) — next-intl without routing setup. Fetched 2026-03-09.
- [zustand.docs.pmnd.rs/reference/middlewares/persist](https://zustand.docs.pmnd.rs/reference/middlewares/persist) — Zustand v5 persist middleware.
- npm registry — verified versions: next@16.1.6, dexie@4.3.0, zustand@5.0.11, next-intl@4.8.3, @serwist/next@9.5.6, tailwindcss@4.2.1, lucide-react@0.577.0, next-themes@0.4.6

### Secondary (MEDIUM confidence)
- [dexie.org/docs/Compound-Index](https://dexie.org/docs/Compound-Index) — Compound index syntax `[field1+field2]` confirmed via search results
- [tailwindcss.com/docs/dark-mode](https://tailwindcss.com/docs/dark-mode) — Tailwind v4 dark mode uses `@custom-variant` directive (confirmed via multiple sources)

### Tertiary (LOW confidence)
- Medium articles on Pretendard + Next.js local font setup — pattern confirmed in official next/font docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm versions verified from registry, official docs consulted
- Architecture: HIGH — derived from Architecture_BudgetPulse1.1.md + official docs
- Pitfalls: HIGH (next-pwa deprecation, Tailwind v4 dark mode) / MEDIUM (Dexie SSR, Zustand hydration — standard known issues)
- PWA installability: HIGH — official Next.js docs

**Research date:** 2026-03-09
**Valid until:** 2026-06-09 (90 days — Next.js, Tailwind, Serwist are actively developed; re-verify before major upgrades)
