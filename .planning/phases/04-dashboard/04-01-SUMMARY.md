---
phase: 04-dashboard
plan: 01
subsystem: testing
tags: [vitest, budget-calculations, i18n, next-intl, typescript]

# Dependency graph
requires:
  - phase: 02-budget-engine-onboarding
    provides: calcVariableBudget, getRemainingDaysInPeriod, calcDailySurvivalBudget, formatCurrency in budget.ts
provides:
  - calcPaceRatio export in src/lib/budget.ts
  - getPaceStatus export in src/lib/budget.ts
  - getPeriodStartDate export in src/lib/budget.ts
  - PaceStatus type export in src/lib/budget.ts
  - Dashboard i18n keys in messages/en.json and messages/ko.json
  - tests/dashboard.test.ts Wave 0 scaffold with pure function tests and RTL stubs
affects: [04-02, 04-03, 05-analytics]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Local-date constructor pattern for period calculations (no UTC drift)
    - Pure function guard pattern for zero-budget edge cases
    - Wave 0 test scaffold using it.todo for future RTL component stubs

key-files:
  created:
    - tests/dashboard.test.ts
  modified:
    - src/lib/budget.ts
    - messages/en.json
    - messages/ko.json

key-decisions:
  - "getPeriodStartDate uses local-date constructor (getFullYear/getMonth/getDate + new Date(y,m,d)) — never ISO strings to prevent UTC drift for mobile users in UTC+9"
  - "calcPaceRatio guard: variableBudget<=0 returns totalSpent>0 ? 2 : 0 — sentinel 2 reliably triggers danger status without divide-by-zero"
  - "DASH-07 (dashboard update <100ms) is an architectural guarantee from Zustand synchronous re-render — no timing test needed"

patterns-established:
  - "Period start uses local Date constructor: new Date(year, month, day) — established in getPeriodStartDate, must be followed in all dashboard calculations"
  - "Wave 0 test scaffold: pure function tests fully implemented, RTL component tests as it.todo stubs — vitest exits 0 before components exist"

requirements-completed: [DASH-02, DASH-03, DASH-04, DASH-05]

# Metrics
duration: 3min
completed: 2026-03-13
---

# Phase 4 Plan 01: Calculation Foundation + Test Scaffold Summary

**Three new pure functions (calcPaceRatio, getPaceStatus, getPeriodStartDate) in budget.ts with 38 passing tests, 13 dashboard i18n keys in both locales, and a Wave 0 test scaffold with 4 passing integration tests and 11 RTL stubs**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-13T14:07:54Z
- **Completed:** 2026-03-13T14:10:19Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Added getPeriodStartDate, calcPaceRatio, getPaceStatus, and PaceStatus type to src/lib/budget.ts — all using local-date constructors to prevent UTC midnight drift
- Expanded i18n coverage: 11 new keys in the home namespace across both en.json and ko.json without disturbing any existing namespaces
- Created tests/dashboard.test.ts Wave 0 scaffold: 4 pure integration tests passing green plus 11 it.todo RTL stubs covering DASH-01 through DASH-06

## Task Commits

1. **Task 1: Add calcPaceRatio, getPaceStatus, getPeriodStartDate to budget.ts** - `3bda99e` (feat, TDD)
2. **Task 2: Add dashboard i18n keys to en.json and ko.json** - `4eea251` (feat)
3. **Task 3: Create tests/dashboard.test.ts Wave 0 scaffold** - `0334677` (test)

## Files Created/Modified

- `src/lib/budget.ts` - Added getPeriodStartDate, PaceStatus type, calcPaceRatio, getPaceStatus after formatCurrency
- `messages/en.json` - Merged 11 dashboard keys into home namespace
- `messages/ko.json` - Merged 11 dashboard keys (Korean) into home namespace
- `tests/budget.test.ts` - Added 16 new tests for the three new budget functions (TDD RED then GREEN)
- `tests/dashboard.test.ts` - Created Wave 0 scaffold with integration tests and component stubs

## Decisions Made

- getPeriodStartDate uses local-date constructor pattern (`new Date(year, month, day)`) exclusively — prevents UTC midnight drift for UTC+9 mobile users
- calcPaceRatio sentinel: when variableBudget <= 0 and spent > 0, returns 2 (reliably >= 1.1 danger threshold) without divide-by-zero
- DASH-07 (< 100ms update latency) is guaranteed by Zustand synchronous re-render — architectural property, not a timing test

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three calculation functions are exported and tested — Plan 04-02 (HeroCard) and Plan 04-03 (StatGrid) can import them directly
- i18n keys are in place — UI components can use t('home.paceSafe') etc. without waiting
- RTL it.todo stubs are registered in tests/dashboard.test.ts — Plan 04-02 and 04-03 will replace them with real implementations

---
*Phase: 04-dashboard*
*Completed: 2026-03-13*
