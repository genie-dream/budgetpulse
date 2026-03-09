---
phase: 01-foundation
plan: "04"
subsystem: pwa
tags: [pwa, manifest, service-worker, icons, pretendard, next-font, zustand]

# Dependency graph
requires:
  - phase: 01-02
    provides: Zustand stores (budgetStore, settingsStore) with skipHydration for client rehydration
  - phase: 01-03
    provides: layout.tsx with ThemeProvider, BottomNav, and app shell structure
provides:
  - PWA manifest via Next.js native manifest.ts (name, theme_color, icons, standalone display)
  - Minimal service worker (public/sw.js) for PWA installability
  - App icons 192x192 and 512x512 PNG generated from SVG via sharp
  - ServiceWorkerRegistration client component for SW registration and Zustand store rehydration
  - Inter font (temporary Pretendard placeholder) loaded via next/font/google
affects: [phase-5-pwa-polish, serwist-integration]

# Tech tracking
tech-stack:
  added: [sharp (devDependency, icon generation)]
  patterns: [next-font/google for web fonts, next/font/local ready for Pretendard, SW registration via useEffect client component]

key-files:
  created:
    - src/app/manifest.ts
    - public/sw.js
    - public/icons/icon-192.png
    - public/icons/icon-512.png
    - src/components/ServiceWorkerRegistration.tsx
    - scripts/generate-icons.mjs
  modified:
    - src/app/layout.tsx
    - tests/manifest.test.ts

key-decisions:
  - "Pretendard font not downloaded (network unavailable) — using Inter (next/font/google) as temporary substitute with TODO comment in layout.tsx"
  - "sharp installed as devDependency for icon generation via scripts/generate-icons.mjs"
  - "ServiceWorkerRegistration component placed before <main> in layout to register SW early and rehydrate Zustand stores"
  - "Icon uses SVG pulse wave on blue circle (#3B82F6) with dark background (#0F172A) matching app theme"

patterns-established:
  - "Next.js PWA: manifest.ts exports default function for native manifest.webmanifest route"
  - "Service worker registration: client component with useEffect, no library needed for Phase 1"
  - "Icon generation: SVG-to-PNG via sharp script (reproducible, not binary-committed SVG)"

requirements-completed: [PWA-01, PWA-03]

# Metrics
duration: 12min
completed: 2026-03-09
---

# Phase 1 Plan 04: PWA Manifest, Service Worker, and App Icons Summary

**PWA installability: manifest.ts with BudgetPulse branding, minimal service worker, 192/512px icons, and Inter font placeholder for Pretendard**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-09T23:47:00Z
- **Completed:** 2026-03-09T14:58:00Z
- **Tasks:** 3 complete (2 auto + 1 human-verify)
- **Files modified:** 8

## Accomplishments
- Next.js native manifest.ts delivers `/manifest.webmanifest` with all required PWA fields
- Minimal service worker (public/sw.js) satisfies PWA installability requirement
- App icons generated as real PNGs (7KB/24KB) using sharp and SVG pulse wave design
- ServiceWorkerRegistration client component registers SW and rehydrates Zustand stores on mount
- All 10 tests pass (3 manifest + 3 BottomNav + 4 db), npm run build clean

## Task Commits

Each task was committed atomically:

1. **Test (RED): manifest failing tests** - `570639b` (test)
2. **Task 1: PWA manifest, service worker, and app icons** - `5a308ee` (feat)
3. **Task 2: Font placeholder and service worker registration** - `08c1706` (feat)
4. **Task 3: Human verification approved** - `e79703e` (chore)

_Note: TDD tasks have multiple commits (test RED → feat GREEN)_

## Files Created/Modified
- `src/app/manifest.ts` - Next.js manifest function: name, theme_color #3B82F6, background_color #0F172A, standalone, icons
- `public/sw.js` - Minimal service worker with install/activate/fetch handlers
- `public/icons/icon-192.png` - 192x192 app icon (7KB, pulse wave on blue circle)
- `public/icons/icon-512.png` - 512x512 app icon (24KB, same design)
- `src/components/ServiceWorkerRegistration.tsx` - Client component: registers SW, rehydrates Zustand stores
- `scripts/generate-icons.mjs` - Node.js script to regenerate icons via sharp
- `src/app/layout.tsx` - Added Inter font variable, ServiceWorkerRegistration, and TODO for Pretendard
- `tests/manifest.test.ts` - 3 assertions: name/display/start_url, icon sizes, theme colors

## Decisions Made
- Pretendard font not downloaded (no internet access during execution) — using Inter as temporary placeholder. TODO comment in layout.tsx with exact download URL and localFont config ready to swap in.
- sharp installed as devDependency for reproducible icon generation from SVG source.
- ServiceWorkerRegistration placed early in layout body to register SW and trigger Zustand rehydration immediately on first render.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pretendard font network download failed — Inter used as substitute**
- **Found during:** Task 2 (Pretendard font loading)
- **Issue:** `curl` to GitHub releases returned only 9 bytes (redirect to HTML, network blocked). PretendardVariable.woff2 could not be downloaded.
- **Fix:** Applied plan's documented fallback: used `next/font/google` with Inter as temporary substitute. Added detailed TODO comment in layout.tsx with exact download URL and `localFont` config snippet ready to swap in.
- **Files modified:** src/app/layout.tsx
- **Verification:** npm run build exits 0, all 10 tests pass
- **Committed in:** 08c1706 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — network unavailable)
**Impact on plan:** Font fallback is documented and reversible. PWA installability not affected by font choice. Switching to Pretendard requires only: (1) place font file, (2) uncomment localFont block in layout.tsx.

## Issues Encountered
- GitHub releases not reachable during execution — Pretendard download returned 9-byte redirect. Applied plan's specified fallback (Inter + TODO comment).

## User Setup Required
To complete Pretendard font integration after network access is available:
1. Download: `curl -L "https://github.com/orioncactus/pretendard/releases/download/v1.3.9/PretendardVariable.woff2" -o public/fonts/PretendardVariable.woff2`
2. In `src/app/layout.tsx`: replace `import { Inter } from 'next/font/google'` and the `inter` constant with the commented-out `localFont` block
3. Run `npm run build` to verify

## Next Phase Readiness
- PWA installability complete: manifest, service worker, icons all verified by human in Chrome DevTools
- Icon assets in place, referenced correctly in manifest
- Zustand store rehydration wired up — ready for budget engine implementation in Phase 2
- Phase 1 Foundation fully complete — all 4 plans done
- Outstanding: swap Inter for Pretendard when public/fonts/PretendardVariable.woff2 is available (1-line change in layout.tsx)

---
*Phase: 01-foundation*
*Completed: 2026-03-09*
