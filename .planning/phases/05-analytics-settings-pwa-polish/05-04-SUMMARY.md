---
phase: 05-analytics-settings-pwa-polish
plan: "04"
subsystem: infra
tags: [serwist, pwa, service-worker, webpack, next.js]

# Dependency graph
requires:
  - phase: 05-02
    provides: analytics page (Wave 2 complete, safe to touch build config)
  - phase: 05-03
    provides: settings page with data backup/restore (Wave 2 complete)
provides:
  - Serwist production service worker generated at build time (public/sw.js)
  - @serwist/next withSerwist wrapper in next.config.ts
  - src/app/sw.ts as service worker source with precaching + defaultCache
  - Build uses --webpack flag (Serwist/Turbopack incompatibility resolved)
affects: [future-pwa-features, lighthouse-audit, offline-support]

# Tech tracking
tech-stack:
  added: ["@serwist/next ^9.5.6", "serwist ^9.5.6 (devDependency)"]
  patterns: ["withSerwist wraps withNextIntl in next.config.ts", "swSrc/swDest build-time compilation", "disable: process.env.NODE_ENV === 'development' prevents dev caching"]

key-files:
  created:
    - src/app/sw.ts
  modified:
    - next.config.ts
    - package.json
    - tsconfig.json
    - .gitignore

key-decisions:
  - "swSrc set to src/app/sw.ts (not app/sw.ts) to match project structure where app code lives under src/"
  - "Build script changed to next build --webpack — Serwist is incompatible with Next.js 16 Turbopack default"
  - "disable: process.env.NODE_ENV === 'development' prevents stale cache issues during development"
  - "webworker added to tsconfig lib — required for ServiceWorkerGlobalScope type in sw.ts; declare const self override resolves dom/webworker self conflict"
  - "@serwist/next/typings added to tsconfig types for __SW_MANIFEST global injection typing"
  - "public/sw.js removed from git tracking (git rm --cached) since it is now gitignored as a generated build artifact"

patterns-established:
  - "Serwist disable in dev: always set disable: process.env.NODE_ENV === 'development' to avoid caching during development"
  - "Generated build artifacts: add to .gitignore AND run git rm --cached to untrack if previously committed"

requirements-completed: [PWA-02]

# Metrics
duration: 12min
completed: "2026-03-14"
---

# Phase 5 Plan 04: PWA Service Worker (Serwist) Summary

**@serwist/next production service worker with precaching via src/app/sw.ts, generating 43KB public/sw.js at webpack build time**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-14T00:09:00Z
- **Completed:** 2026-03-14T00:21:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Installed @serwist/next and serwist, integrated via withSerwistInit wrapper in next.config.ts
- Created src/app/sw.ts with Serwist precache manifest + defaultCache runtime caching strategy
- Full production build passes: Serwist bundles service worker to public/sw.js (43KB, up from 556B Phase 1 stub)
- All 105 vitest tests pass after tsconfig lib/types changes
- public/sw.js is gitignored and untracked (generated artifact)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @serwist/next + configure next.config.ts + app/sw.ts** - `ddb095a` (feat)
2. **Task 2: Update tsconfig.json + run production build** - `4678906` (feat)

## Files Created/Modified

- `src/app/sw.ts` - Serwist service worker source (precacheEntries + defaultCache + addEventListeners)
- `next.config.ts` - withSerwistInit wrapper around existing withNextIntl config
- `package.json` - @serwist/next dep added, serwist devDep added, build script uses --webpack
- `tsconfig.json` - webworker lib, @serwist/next/typings types, public/sw.js excluded
- `.gitignore` - public/sw.js and public/swe-worker* added
- `package-lock.json` - lockfile updated for new packages

## Decisions Made

- `src/app/sw.ts` path used (not `app/sw.ts`) to match project's `src/` directory structure; `swSrc` in next.config.ts updated accordingly
- `next build --webpack` required because Serwist does not support Turbopack (Next.js 16 default); dev script unchanged
- `disable: process.env.NODE_ENV === 'development'` prevents dev-mode stale caching issues
- `webworker` added to tsconfig `lib` array; pre-existing `dashboard.test.tsx` TypeScript errors are unrelated to this plan
- `git rm --cached public/sw.js` run to untrack the previously-committed Phase 1 stub file

## Deviations from Plan

None — plan executed exactly as written. The `src/app/sw.ts` path adjustment was already anticipated in the plan's Task 1 action block ("Actual path: src/app/sw.ts").

## Issues Encountered

- `public/sw.js` was previously committed (Phase 1 stub) so adding it to .gitignore alone was insufficient — required `git rm --cached public/sw.js` to untrack the file before gitignore took effect.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- PWA-02 complete: Serwist generates production service worker at build time
- Core features (dashboard, transaction logging, history) will work offline via Serwist precaching
- Phase 5 is now complete (all 4 of 5 active plans done — Plan 05-05 is the final plan)

## Self-Check: PASSED

- src/app/sw.ts: FOUND
- next.config.ts: FOUND
- public/sw.js: FOUND (on disk, gitignored)
- commit ddb095a: FOUND
- commit 4678906: FOUND

---
*Phase: 05-analytics-settings-pwa-polish*
*Completed: 2026-03-14*
