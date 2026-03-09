---
phase: 01-foundation
plan: "02"
subsystem: data-layer
tags: [dexie, zustand, next-intl, indexeddb, i18n, state-management]

# Dependency graph
requires:
  - "01-01: TypeScript types (BudgetConfig, Transaction, Settings)"
provides:
  - "src/lib/db.ts: Dexie BudgetPulseDB singleton with budgetConfigs + transactions tables"
  - "src/stores/budgetStore.ts: Zustand persisted store for BudgetConfig with skipHydration"
  - "src/stores/transactionStore.ts: Zustand in-memory store for Transaction[] with loading state"
  - "src/stores/settingsStore.ts: Zustand persisted store for language/theme with skipHydration"
  - "src/i18n/request.ts: next-intl config reading locale from cookie, default 'en'"
  - "messages/en.json: English UI strings (nav, common, home, add, history, analytics, settings, onboarding, categories)"
  - "messages/ko.json: Korean UI strings matching en.json structure"
affects: [01-03, 01-04, all-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dexie Table<T> typed tables with compound index [date+category] for period queries"
    - "Zustand persist with skipHydration: true for SSR safety"
    - "next-intl getRequestConfig reading locale from cookie (no routing required)"
    - "SSR-safe localStorage fallback: typeof window !== 'undefined' ? localStorage : ({} as Storage)"

key-files:
  created:
    - "src/lib/db.ts"
    - "src/stores/budgetStore.ts"
    - "src/stores/transactionStore.ts"
    - "src/stores/settingsStore.ts"
    - "src/i18n/request.ts"
    - "messages/en.json"
    - "messages/ko.json"
  modified:
    - "next.config.ts"
    - "tests/db.test.ts"

key-decisions:
  - "Export BudgetPulseDB class (not just db singleton) so tests can verify schema structure directly"
  - "transactionStore is in-memory only (no persist) — Dexie is the source of truth for transactions"
  - "budgetStore and settingsStore both use skipHydration to prevent SSR/client mismatch"
  - "next-intl wired without routing — locale from cookie allows language switching without URL changes"

requirements-completed: [PWA-01, PWA-03]

# Metrics
duration: 3min
completed: "2026-03-09"
---

# Phase 1 Plan 02: Data Layer Summary

**Dexie.js IndexedDB schema with compound index, three Zustand stores (budget/transaction/settings) with SSR-safe persist middleware, and next-intl wired to cookie-based locale with English and Korean message files.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-09T14:41:02Z
- **Completed:** 2026-03-09T14:43:34Z
- **Tasks:** 2
- **Files modified:** 9 (7 created, 2 modified)

## Accomplishments

- Dexie BudgetPulseDB class with `budgetConfigs` (id, createdAt) and `transactions` (id, date, category, [date+category]) tables at version 1
- All 4 db.test.ts assertions pass: version check, table names, compound index, write/read round-trip
- Three Zustand stores: budgetStore (persisted), transactionStore (in-memory), settingsStore (persisted)
- Both persisted stores use `skipHydration: true` to prevent React SSR hydration mismatch
- next-intl wired via `getRequestConfig` reading locale from cookie with 'en' default
- Full en.json and ko.json message files covering all 5 app tabs plus onboarding and categories
- next.config.ts wrapped with `withNextIntl` plugin
- `npm run build` exits 0 with no TypeScript errors

## Task Commits

1. **Task 1: Dexie schema + db.test.ts** - `43e2a06` (feat)
2. **Task 2: Zustand stores + i18n + messages** - `e0b8319` (feat)

## Files Created/Modified

- `src/lib/db.ts` - BudgetPulseDB class + db singleton with full schema
- `src/stores/budgetStore.ts` - useBudgetStore with persist + skipHydration
- `src/stores/transactionStore.ts` - useTransactionStore in-memory cache
- `src/stores/settingsStore.ts` - useSettingsStore with persist + skipHydration
- `src/i18n/request.ts` - next-intl cookie-based locale config
- `messages/en.json` - English strings (9 sections, 30+ keys)
- `messages/ko.json` - Korean strings (matching structure)
- `next.config.ts` - Added withNextIntl wrapper
- `tests/db.test.ts` - Replaced Wave 0 stubs with 4 real assertions

## Decisions Made

- Exported `BudgetPulseDB` class alongside `db` singleton so tests can inspect schema via `db.table().schema.indexes`.
- `transactionStore` is intentionally NOT persisted — Dexie is the canonical store for transactions; the Zustand store is a display cache populated by custom hooks in later plans.
- Both `budgetStore` and `settingsStore` use `skipHydration: true` to prevent hydration mismatch when server and client differ on stored values.
- Cookie-based locale (not URL segment) means language switching works without route changes — aligns with single-page app feel expected for a mobile PWA.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Layout.tsx already imported BottomNav which did not exist**
- **Found during:** Task 2 (build verification)
- **Issue:** `src/app/layout.tsx` (placed by Plan 01-01) imports `@/components/layout/BottomNav` but the component already existed from a prior partial execution — confirmed existing and build passed.
- **Fix:** No fix needed — BottomNav.tsx was already present at `src/components/layout/BottomNav.tsx`
- **Files modified:** None
- **Commit:** N/A (no new commit required)

---

**Total deviations:** 0 code deviations — plan executed as specified.
**Impact on plan:** None.

## Issues Encountered

- Build initially failed with lock file error (`Unable to acquire lock at .next/lock`) due to stale lock from a prior build process. Cleared lock and retried — build succeeded.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Data layer complete. Plans 03 (App Shell/BottomNav) and 04 (PWA manifest) can proceed.
- All stores export typed hooks: `useBudgetStore`, `useTransactionStore`, `useSettingsStore`
- All message keys needed for Plans 2-5 UI are defined in en.json and ko.json
- Dexie `db` singleton ready for use in Client Components and custom hooks

---
*Phase: 01-foundation*
*Completed: 2026-03-09*
