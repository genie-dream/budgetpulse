---
phase: 02-budget-engine-onboarding
plan: "03"
subsystem: ui
tags: [react, nextjs, zustand, dexie, tailwind, onboarding, wizard]

# Dependency graph
requires:
  - phase: 02-budget-engine-onboarding/02-01
    provides: calcVariableBudget, formatCurrency, detectCurrencyFromLocale
  - phase: 02-budget-engine-onboarding/02-02
    provides: budgetStore (setConfig, setOnboarded), settingsStore (setCurrency), db.budgetConfigs.put
provides:
  - 3-step onboarding wizard (income, fixed expenses, savings goal)
  - SwipeToDelete reusable component
  - ProgressIndicator component
  - LiveBudgetBar sticky component with negative budget state
  - OnboardingWizard orchestrator with Dexie + Zustand + router.replace submit
  - StepIncome with locale-based currency picker (USD/JPY only)
  - StepFixedExpenses with inline add/edit/delete and swipe-to-delete
  - StepSavingsGoal optional input
  - onboarding/page.tsx with hydration guard and symmetric redirect
affects:
  - phase 3 (transaction logging will reuse SwipeToDelete)
  - phase 4 (dashboard reads from budgetStore.config set by wizard)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - onFinishHydration pattern for Zustand skipHydration stores in Next.js pages
    - Manual touch event swipe detection without external gesture library
    - Inline form with edit-mode toggling by item ID
    - Derive variableBudget on every render (no memoization needed for small arrays)

key-files:
  created:
    - src/components/ui/SwipeToDelete.tsx
    - src/components/onboarding/OnboardingWizard.tsx
    - src/components/onboarding/ProgressIndicator.tsx
    - src/components/onboarding/LiveBudgetBar.tsx
    - src/components/onboarding/StepIncome.tsx
    - src/components/onboarding/StepFixedExpenses.tsx
    - src/components/onboarding/StepSavingsGoal.tsx
  modified:
    - src/app/onboarding/page.tsx

key-decisions:
  - "onFinishHydration + hasHydrated check used in onboarding page to avoid reading stale isOnboarded before Zustand persist rehydrates"
  - "Currency picker only shown when detectCurrencyFromLocale returns USD or JPY — KRW locale silently defaults per CONTEXT.md"
  - "SwipeToDelete uses horizontal-dominant guard (|deltaX| > |deltaY| AND |deltaX| > 60px) to avoid scroll interference"
  - "handleFinish uses router.replace('/') not push — prevents back-button returning to completed onboarding"
  - "db.budgetConfigs.put() (upsert) over add() to handle re-save edge case confirmed in 02-02"

patterns-established:
  - "Swipe gesture: track touchStart/touchEnd refs, compare horizontal vs vertical delta, threshold 60px"
  - "Hydration guard: useEffect onFinishHydration + hasHydrated() for stores with skipHydration: true"
  - "Step wizard: local useState only, derive computed values (variableBudget) inline, no context"

requirements-completed: [BUDG-01, BUDG-02, BUDG-03, BUDG-04, BUDG-06, ONBD-01]

# Metrics
duration: 3min
completed: 2026-03-09
---

# Phase 2 Plan 03: Onboarding Wizard UI Summary

**3-step onboarding wizard (income + fixed expenses + savings) with live variable budget preview, swipe-to-delete, and Dexie/Zustand persistence on finish**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-09T15:52:37Z
- **Completed:** 2026-03-09T15:55:28Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Complete 3-step wizard with ProgressIndicator, LiveBudgetBar, and back/next/finish CTAs
- SwipeToDelete reusable component using manual touch events (no external library)
- StepFixedExpenses with inline add form, tap-to-edit, and swipe-to-delete expense rows
- StepIncome with locale-aware currency picker shown only for USD/JPY device locales
- onboarding/page.tsx with hydration-safe redirect guard using onFinishHydration pattern
- Full TypeScript clean compile, all 36 existing tests pass, `npm run build` exits 0

## Task Commits

1. **Task 1: SwipeToDelete, OnboardingWizard, ProgressIndicator, LiveBudgetBar** - `f62ec50` (feat)
2. **Task 2: StepIncome, StepFixedExpenses, StepSavingsGoal, onboarding page** - `72e6cd9` (feat)

## Files Created/Modified

- `src/components/ui/SwipeToDelete.tsx` - Reusable swipe-to-delete wrapper with manual touch events
- `src/components/onboarding/OnboardingWizard.tsx` - Top-level wizard with step state, form data, and handleFinish
- `src/components/onboarding/ProgressIndicator.tsx` - Three-dot step counter
- `src/components/onboarding/LiveBudgetBar.tsx` - Sticky bottom bar with negative budget red state
- `src/components/onboarding/StepIncome.tsx` - Income input with conditional currency picker
- `src/components/onboarding/StepFixedExpenses.tsx` - Inline add/edit/delete with SwipeToDelete rows
- `src/components/onboarding/StepSavingsGoal.tsx` - Optional savings goal input
- `src/app/onboarding/page.tsx` - Route entry: hydration guard + onboarded redirect

## Decisions Made

- Used `onFinishHydration` + `hasHydrated()` pattern in onboarding page to avoid reading stale `isOnboarded` before Zustand persist rehydrates (skipHydration stores require explicit hydration check)
- Currency picker conditionally shown: `detectCurrencyFromLocale()` returns USD or JPY → show picker; KRW locale → silent default per CONTEXT.md
- SwipeToDelete uses `|deltaX| > |deltaY| AND |deltaX| > 60px` guard to prevent triggering on vertical scroll gestures
- `router.replace('/')` not `push` in `handleFinish` to prevent user swiping back to a completed onboarding
- Inline edit mode in StepFixedExpenses uses `editingId` state — tapping a row pre-fills the shared form; saving replaces item in array by ID

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 8 onboarding files exist and compile cleanly
- SwipeToDelete is ready for reuse in Phase 3 transaction logging
- BudgetConfig is persisted to Dexie and Zustand on wizard completion — Phase 4 dashboard can read `useBudgetStore().config` immediately
- No blockers

---
*Phase: 02-budget-engine-onboarding*
*Completed: 2026-03-09*
