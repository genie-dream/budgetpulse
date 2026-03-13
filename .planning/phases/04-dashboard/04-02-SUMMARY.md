---
phase: 04-dashboard
plan: 02
subsystem: ui
tags: [react, tailwind, rtl, herocard, dashboard, next-intl, vitest]

# Dependency graph
requires:
  - phase: 04-dashboard
    plan: 01
    provides: calcPaceRatio, getPaceStatus, PaceStatus type, formatCurrency, dashboard i18n keys
provides:
  - src/components/dashboard/HeroCard.tsx with HeroCardProps interface
  - src/components/dashboard/StatGrid.tsx stub (full impl deferred to 04-03)
  - tests/dashboard.test.tsx RTL tests for HeroCard (DASH-01, DASH-05, DASH-06)
affects: [04-03, 04-04, 04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Complete Tailwind class strings pattern — all conditional color classes as full literal strings, never assembled via template literals
    - data-testid attributes on interactive elements for reliable RTL queries
    - beforeEach dynamic import pattern for RTL tests when component is being created in same plan
    - StatGrid stub pattern — minimal implementation to unblock test infrastructure before full Plan 04-03 implementation

key-files:
  created:
    - src/components/dashboard/HeroCard.tsx
    - src/components/dashboard/StatGrid.tsx
  modified:
    - tests/dashboard.test.ts
    - tests/dashboard.test.tsx

key-decisions:
  - "HeroCard displays Math.abs(remainingBudget) — absolute value always shown; negative state conveyed through text-red-500 color + 'Over budget' label, not a minus sign"
  - "StatGrid stub created in Plan 04-02 as Rule 3 auto-fix — dashboard.test.tsx was importing StatGrid which blocked the full test suite; full StatGrid implementation is Plan 04-03 scope"
  - "RTL tests moved from dashboard.test.ts to dashboard.test.tsx — JSX requires .tsx extension; .ts kept for pure function tests only"
  - "data-testid used on hero-amount and progress-bar-fill elements for unambiguous RTL queries without relying on text content or class names"

patterns-established:
  - "Complete Tailwind color class strings — 'bg-green-500', 'bg-amber-400', 'bg-red-500' as full literals, never 'bg-' + color fragments"
  - "Progress bar clamping: Math.min(100, Math.max(0, ...)) + override to 100 when remainingBudget < 0"

requirements-completed: [DASH-01, DASH-05, DASH-06]

# Metrics
duration: 4min
completed: 2026-03-13
---

# Phase 4 Plan 02: HeroCard Component Summary

**HeroCard presentational component with remaining budget display, pace-aware progress bar, and status badge — 7 RTL tests green, 94 total tests passing**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-13T14:13:56Z
- **Completed:** 2026-03-13T14:17:46Z
- **Tasks:** 1 (TDD: RED → GREEN)
- **Files modified:** 4

## Accomplishments

- Created `src/components/dashboard/HeroCard.tsx` — answers "how much can I spend today?" at a glance with remaining budget as the dominant number, a pace-aware progress bar, and a pace badge (Safe / Caution / Danger)
- Replaced all 5 `it.todo` HeroCard stubs in `tests/dashboard.test.tsx` with 7 RTL tests covering DASH-01 (remaining budget value), DASH-05 (progress bar width and pace badge labels), and DASH-06 (over-budget red state)
- Created `StatGrid` stub as Rule 3 auto-fix to unblock `dashboard.test.tsx` which pre-emptively imports StatGrid; passes all 5 StatGrid RTL tests already present in the file
- All 94 tests pass; no regressions

## Task Commits

1. **Task 1: Implement HeroCard component with RTL tests** — `d42181a` (feat, TDD RED→GREEN)

## Files Created/Modified

- `src/components/dashboard/HeroCard.tsx` — Presentational hero card, HeroCard export, HeroCardProps interface
- `src/components/dashboard/StatGrid.tsx` — Stub component (full impl in Plan 04-03)
- `tests/dashboard.test.tsx` — 7 HeroCard RTL tests replacing it.todo stubs; 5 StatGrid tests retained
- `tests/dashboard.test.ts` — Simplified to pure function tests only (RTL moved to .tsx)

## Decisions Made

- HeroCard always displays `Math.abs(remainingBudget)` — the absolute value is shown; negative state is conveyed by `text-red-500` color and the "Over budget" label rather than a minus sign in the number
- StatGrid stub created in Plan 04-02 as a Rule 3 auto-fix — `dashboard.test.tsx` was importing StatGrid which blocked the entire test suite; full StatGrid implementation is Plan 04-03 scope
- RTL tests live in `dashboard.test.tsx` (JSX extension required); `dashboard.test.ts` retained only for pure function integration tests
- `data-testid` added to `hero-amount` and `progress-bar-fill` elements for unambiguous RTL querySelector queries

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created StatGrid stub to unblock test infrastructure**
- **Found during:** Task 1 RED phase
- **Issue:** `tests/dashboard.test.tsx` (created externally ahead of Plan 04-03) imports `StatGrid` which does not exist, causing the entire test suite to fail to transform
- **Fix:** Created minimal `StatGrid` implementation at `src/components/dashboard/StatGrid.tsx` that passes all 5 StatGrid RTL tests already present in the file
- **Files modified:** `src/components/dashboard/StatGrid.tsx` (created)
- **Commit:** `d42181a`

**2. [Rule 3 - Blocking] Moved RTL tests to .tsx extension**
- **Found during:** Task 1 RED phase
- **Issue:** `dashboard.test.ts` cannot contain JSX syntax; ESBuild transformer rejects it
- **Fix:** Placed HeroCard RTL tests in `dashboard.test.tsx`; simplified `.ts` file to pure function tests only
- **Files modified:** `tests/dashboard.test.ts`, `tests/dashboard.test.tsx`
- **Commit:** `d42181a`

## Issues Encountered

None beyond the two auto-fixed blocking issues above.

## User Setup Required

None.

## Next Phase Readiness

- HeroCard is fully implemented and tested — Plan 04-03 (StatGrid full implementation) can replace the stub
- StatGrid stub already passes its 5 RTL tests, giving Plan 04-03 a clear green baseline to implement against
- `dashboard.test.tsx` has no more `it.todo` stubs for HeroCard — all DASH-01, DASH-05, DASH-06 requirements verified

---

## Self-Check: PASSED

- `src/components/dashboard/HeroCard.tsx` — FOUND
- `src/components/dashboard/StatGrid.tsx` — FOUND
- `tests/dashboard.test.tsx` — FOUND
- Commit `d42181a` — FOUND (`git log --oneline` confirms)

---
*Phase: 04-dashboard*
*Completed: 2026-03-13*
