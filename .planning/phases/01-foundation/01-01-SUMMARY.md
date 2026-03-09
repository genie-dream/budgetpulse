---
phase: 01-foundation
plan: "01"
subsystem: infra
tags: [next.js, typescript, vitest, tailwind, zustand, dexie, recharts]

# Dependency graph
requires: []
provides:
  - "Next.js 16 App Router scaffold with TypeScript and Tailwind CSS"
  - "Vitest configured for jsdom + React + path aliases"
  - "src/types/index.ts: BudgetConfig, Transaction, FixedExpense, Category, CurrencyCode, Settings"
  - "src/lib/constants.ts: CATEGORIES (9 entries), DEFAULT_CURRENCY, DEFAULT_MONTH_START_DAY"
  - "Wave 0 test stubs: tests/db.test.ts, tests/manifest.test.ts, tests/BottomNav.test.tsx"
affects: [01-02, 01-03, 01-04, all-phases]

# Tech tracking
tech-stack:
  added:
    - "next@16.1.6 (App Router)"
    - "react@19.2.3"
    - "typescript@5"
    - "tailwindcss@4"
    - "zustand@5"
    - "dexie@4"
    - "recharts@3"
    - "lucide-react"
    - "next-intl@4"
    - "next-themes@0.4"
    - "vitest@4"
    - "@vitejs/plugin-react"
    - "@testing-library/react"
    - "fake-indexeddb"
    - "jsdom"
    - "vite-tsconfig-paths"
  patterns:
    - "All shared TypeScript types exported from single src/types/index.ts barrel"
    - "Category type as string union literal (not enum) for DX"
    - "Wave 0 test stubs with it.todo so runner is green before implementation"
    - "vitest.config.mts at project root with jsdom environment"

key-files:
  created:
    - "src/types/index.ts"
    - "src/lib/constants.ts"
    - "vitest.config.mts"
    - "tests/db.test.ts"
    - "tests/manifest.test.ts"
    - "tests/BottomNav.test.tsx"
    - "package.json"
    - "tsconfig.json"
  modified: []

key-decisions:
  - "Scaffold into project root (budget/) not into a subdirectory — git repo was already initialized at root"
  - "Use it.todo for Wave 0 stubs so vitest exits 0 before implementation plans run"
  - "Skipped next-pwa per plan note — abandoned package; manifest.ts pattern used in Phase 1, @serwist/next deferred to Phase 5"
  - "Category as string union type (not enum) for JSON serialization compatibility with Dexie"

patterns-established:
  - "Import types: always from @/types (path alias)"
  - "Import constants: always from @/lib/constants"
  - "Wave 0 stub pattern: it.todo stubs compile and run green before implementation exists"

requirements-completed: [PWA-01, PWA-03]

# Metrics
duration: 4min
completed: "2026-03-09"
---

# Phase 1 Plan 01: Foundation Scaffold Summary

**Next.js 16 App Router scaffold with all dependencies installed, Vitest configured for jsdom, and shared TypeScript type contracts (BudgetConfig, Transaction, Category, CATEGORIES) exported as the foundation for all subsequent plans.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-09T14:34:09Z
- **Completed:** 2026-03-09T14:37:51Z
- **Tasks:** 2
- **Files modified:** 8 created

## Accomplishments
- Full Next.js scaffold with TypeScript, Tailwind CSS, App Router, src-dir layout
- All production and dev dependencies installed (zustand, dexie, recharts, lucide-react, next-intl, next-themes, vitest, testing-library, fake-indexeddb)
- Vitest configured with jsdom environment and path alias support via vite-tsconfig-paths
- All shared TypeScript interfaces exported from src/types/index.ts
- 9-category CATEGORIES array and defaults in src/lib/constants.ts
- Wave 0 test stubs in tests/ directory — all todo, no failures

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold project and install all dependencies** - `4e6e1dc` (chore)
2. **Task 2: Define TypeScript type contracts and constants** - `b743d13` (feat)

**Plan metadata:** _(final commit below)_

## Files Created/Modified
- `package.json` - Next.js project with all dependencies + test script
- `tsconfig.json` - TypeScript config with @/ path aliases
- `vitest.config.mts` - Vitest with jsdom, React, tsconfigPaths plugins
- `src/types/index.ts` - BudgetConfig, Transaction, FixedExpense, Category, CurrencyCode, Settings
- `src/lib/constants.ts` - CATEGORIES (9), DEFAULT_CURRENCY='KRW', DEFAULT_MONTH_START_DAY=1
- `tests/db.test.ts` - Wave 0 stub for Dexie schema (Plan 02)
- `tests/manifest.test.ts` - Wave 0 stub for PWA manifest (Plan 04)
- `tests/BottomNav.test.tsx` - Wave 0 stub for BottomNav component (Plan 03)

## Decisions Made
- Scaffolded into project root (budget/) rather than a budgetpulse/ subdirectory because git was already initialized at the root level with .planning/ in place.
- Used it.todo stubs for Wave 0 tests so vitest exits 0 immediately without waiting for implementation.
- Skipped next-pwa (abandoned) per plan note — native manifest.ts approach for installability.
- Category type as string union (not TypeScript enum) for clean JSON serialization with Dexie IndexedDB.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Scaffolded into project root instead of subdirectory**
- **Found during:** Task 1 (scaffold and install)
- **Issue:** `npx create-next-app@latest budgetpulse` would create a subdirectory, but git repo was already initialized at `/Users/genie-dream/projects/budget` with `.planning/` in place — a subdirectory would break relative paths in all plans
- **Fix:** Scaffolded into `/tmp/budgetpulse`, then rsync'd files (excluding .git) to project root
- **Files modified:** All scaffold files at project root
- **Verification:** `npm run build` exits 0, `npm test -- --run` exits 0
- **Committed in:** 4e6e1dc (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking)
**Impact on plan:** Required workaround due to existing git repo at project root. No scope creep, all plan outcomes achieved.

## Issues Encountered
- create-next-app refused to scaffold in non-empty directory (existing .moai/, .planning/, doc files). Worked around via /tmp scaffold + rsync.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Foundation scaffold complete. Plans 02 (DB schema), 03 (App Shell), 04 (PWA manifest) can all proceed in parallel since types and constants are defined.
- All imports from `@/types` and `@/lib/constants` will resolve correctly via tsconfig path aliases.
- Wave 0 test stubs are in place — each subsequent plan fills them in with real implementations.

---
*Phase: 01-foundation*
*Completed: 2026-03-09*
