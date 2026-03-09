---
phase: 01-foundation
plan: "03"
subsystem: ui
tags: [next.js, tailwind-v4, next-themes, next-intl, lucide-react, bottom-nav, safe-area, dark-mode, pwa]

# Dependency graph
requires:
  - phase: 01-foundation plan 01-01
    provides: TypeScript types, project scaffold, vitest config
provides:
  - App shell with 5-page routing structure
  - Dark-mode-first UI via Tailwind v4 @custom-variant
  - BottomNav with FAB Add button and safe area insets
  - Header and PageContainer layout components
  - next-intl i18n setup with en/ko message files
  - BottomNav test suite (3/3 passing)
affects: [02-budget-engine, 03-transaction-logging, 04-dashboard, 05-analytics-settings]

# Tech tracking
tech-stack:
  added: ["@testing-library/jest-dom"]
  patterns: ["Tailwind v4 @custom-variant for dark mode", "next-themes with data-theme attribute", "safe-area-inset-* env() for iOS PWA", "Client component navigation with usePathname"]

key-files:
  created:
    - src/app/transactions/page.tsx
    - src/app/add/page.tsx
    - src/app/analytics/page.tsx
    - src/app/settings/page.tsx
    - src/app/onboarding/page.tsx
    - src/components/layout/BottomNav.tsx
    - src/components/layout/Header.tsx
    - src/components/layout/PageContainer.tsx
    - src/i18n/request.ts
    - messages/en.json
    - messages/ko.json
    - tests/setup.ts
  modified:
    - src/app/layout.tsx
    - src/app/globals.css
    - src/app/page.tsx
    - tests/BottomNav.test.tsx
    - vitest.config.mts
    - package.json

key-decisions:
  - "Tailwind v4 dark mode uses @custom-variant not darkMode config — data-theme selector via next-themes"
  - "BottomNav created alongside Task 1 globals/layout to satisfy build-time import (Rule 3 auto-fix)"
  - "@testing-library/jest-dom added for toBeInTheDocument matcher — was missing from devDependencies"

patterns-established:
  - "Dark mode pattern: ThemeProvider attribute=data-theme + @custom-variant dark in globals.css"
  - "Safe area pattern: env(safe-area-inset-*) in inline styles, --sat/--sab/--sal/--sar CSS variables"
  - "Navigation pattern: BottomNav fixed position with FAB center button, active state via usePathname"
  - "Test setup pattern: tests/setup.ts imports jest-dom, referenced in vitest.config.mts setupFiles"

requirements-completed: [PWA-01]

# Metrics
duration: 3min
completed: 2026-03-09
---

# Phase 1 Plan 03: App Shell + BottomNav Summary

**Dark-mode-first app shell with 5-route navigation, FAB BottomNav using Tailwind v4 @custom-variant, and iOS safe area support**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-09T14:41:19Z
- **Completed:** 2026-03-09T14:44:31Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments

- Root layout with ThemeProvider (dark default), NextIntlClientProvider, and BottomNav
- Tailwind v4 dark mode via `@custom-variant dark` — no tailwind.config darkMode needed
- 5-tab BottomNav with FAB-style Add button (blue rounded-full, raised -top-5), safe area padding
- All 5 route pages (/, /transactions, /add, /analytics, /settings, /onboarding) compile and render
- BottomNav test suite 3/3 passing with proper jest-dom setup

## Task Commits

Each task was committed atomically:

1. **Task 1: Root layout, Tailwind v4 dark mode, route pages** - `ac73da5` (feat)
2. **Task 2: BottomNav tests, Header, PageContainer** - `2dac61f` (feat)

**Plan metadata:** (docs commit follows)

_Note: Task 2 is a TDD task — implementation existed from Task 1 auto-fix, tests written and verified GREEN_

## Files Created/Modified

- `src/app/globals.css` - Tailwind v4 @custom-variant dark, base #0F172A, safe area CSS vars
- `src/app/layout.tsx` - Root layout with ThemeProvider, NextIntlClientProvider, BottomNav
- `src/app/page.tsx` - Dashboard placeholder page
- `src/app/transactions/page.tsx` - Transactions history placeholder
- `src/app/add/page.tsx` - Add transaction placeholder
- `src/app/analytics/page.tsx` - Analytics placeholder
- `src/app/settings/page.tsx` - Settings placeholder
- `src/app/onboarding/page.tsx` - Onboarding placeholder
- `src/components/layout/BottomNav.tsx` - 5-tab nav with FAB Add, usePathname active states, safe area
- `src/components/layout/Header.tsx` - Sticky header with safe-area-inset-top
- `src/components/layout/PageContainer.tsx` - Page wrapper with safe area and bottom clearance
- `src/i18n/request.ts` - next-intl server config (cookie-based locale detection)
- `messages/en.json` - English translations
- `messages/ko.json` - Korean translations
- `tests/BottomNav.test.tsx` - 3 assertions: link count, hrefs, FAB label
- `tests/setup.ts` - Jest-dom import for toBeInTheDocument matcher
- `vitest.config.mts` - Added setupFiles reference

## Decisions Made

- **Tailwind v4 dark mode**: Used `@custom-variant dark` in globals.css with `data-theme="dark"` selector (not tailwind.config `darkMode: 'class'` which is a v3 pattern)
- **BottomNav in Task 1 commit**: Created BottomNav early to resolve layout.tsx build-time import error (Rule 3 auto-fix). TDD cycle was still applied — tests written before verifying GREEN in Task 2
- **jest-dom addition**: `@testing-library/jest-dom` was missing — added as devDependency to enable `toBeInTheDocument()` matcher

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created BottomNav during Task 1 to fix build failure**
- **Found during:** Task 1 (root layout)
- **Issue:** layout.tsx imports `@/components/layout/BottomNav` which didn't exist — build failed with Module not found
- **Fix:** Created BottomNav.tsx as part of Task 1 execution before running build verification
- **Files modified:** src/components/layout/BottomNav.tsx
- **Verification:** npm run build exits 0 after creation
- **Committed in:** ac73da5 (Task 1 commit)

**2. [Rule 1 - Bug] Added @testing-library/jest-dom for missing toBeInTheDocument matcher**
- **Found during:** Task 2 (BottomNav test)
- **Issue:** Test failed with "Invalid Chai property: toBeInTheDocument" — jest-dom not installed or configured
- **Fix:** Installed @testing-library/jest-dom, created tests/setup.ts, added setupFiles to vitest.config.mts
- **Files modified:** package.json, vitest.config.mts, tests/setup.ts
- **Verification:** All 3 BottomNav tests pass
- **Committed in:** 2dac61f (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug fix)
**Impact on plan:** Both auto-fixes necessary for build and test correctness. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviations above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- App shell fully navigable: 5 routes compile and render, dark mode active by default
- BottomNav with FAB Add button, safe area insets, active state highlighting
- Layout components (Header, PageContainer) ready for feature phases to use
- next-intl i18n foundation in place for Phase 2+ translations
- Remaining Phase 1 plans: 01-04 (PWA manifest)

---
*Phase: 01-foundation*
*Completed: 2026-03-09*
