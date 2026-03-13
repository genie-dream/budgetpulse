---
phase: 05-analytics-settings-pwa-polish
plan: 02
subsystem: analytics
tags: [recharts, typescript, react, next-intl, dexie, zustand]

# Dependency graph
requires:
  - phase: 05-01
    provides: analyticsHelpers.ts pure functions — aggregateByCategory, aggregateByDay, getPeriodEndDate; CategoryTotal and DailyTotal interfaces
  - phase: 04-dashboard
    provides: Zustand hydration guard pattern (onFinishHydration + hasHydrated), getPeriodStartDate, calcVariableBudget, formatCurrency
  - phase: 01-foundation
    provides: Dexie db singleton, Transaction type, CurrencyCode type
provides:
  - DonutChart component (PieChart with innerRadius donut, CATEGORY_COLORS, custom tooltip)
  - DailyBarChart component (daily spend bars, zero-fill, custom tooltip)
  - MonthSummary component (budget vs actual card with savings/over-budget state)
  - AnalyticsPage replacing stub — monthOffset navigation, Dexie period query, full chart wiring
affects: [05-03-settings, 05-04-pwa-serwist]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Recharts v3 ContentType closure pattern — makeTooltip(currency) factory returns a function typed as TooltipContentProps (default generics) to satisfy ContentType<ValueType, NameType> constraint without losing custom props
    - Hydration guard pattern from DashboardPage applied consistently to AnalyticsPage (onFinishHydration + hasHydrated)
    - Dexie period query pattern: db.transactions.where('date').between(periodStart, periodEnd, true, true).toArray()

key-files:
  created:
    - src/components/analytics/DonutChart.tsx
    - src/components/analytics/DailyBarChart.tsx
    - src/components/analytics/MonthSummary.tsx
  modified:
    - src/app/analytics/page.tsx
    - messages/en.json
    - messages/ko.json

key-decisions:
  - "Recharts v3 custom Tooltip uses closure factory (makeTooltip/makeBarTooltip) returning function typed as TooltipContentProps (default generics) — extending TooltipContentProps<number, string> caused ContentType<ValueType, NameType> assignability errors"
  - "monthOffset state: 0=current period, -1=previous — referenceDate derived via setMonth(getMonth()+offset), then getPeriodStartDate applied for correct payday-based period boundary"
  - "Next button disabled when monthOffset >= 0 — prevents future-period navigation"

patterns-established:
  - "Analytics components receive pre-computed data as props — no Dexie or store calls inside chart components (same page-owned data pattern as TransactionsPage)"
  - "Recharts TooltipContentProps default generics (no <number, string> constraint) required for ContentType compatibility in v3"

requirements-completed: [ANLX-01, ANLX-02, ANLX-03, ANLX-04]

# Metrics
duration: 4min
completed: 2026-03-13
---

# Phase 5 Plan 02: Analytics Page Summary

**Recharts v3 DonutChart + DailyBarChart + MonthSummary components wired into AnalyticsPage with Dexie period query and month navigation**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-13T15:13:45Z
- **Completed:** 2026-03-13T15:17:14Z
- **Tasks:** 2
- **Files modified:** 6 (3 created components, 1 replaced page, 2 i18n files)

## Accomplishments

- Created DonutChart with PieChart innerRadius/outerRadius donut shape, category color map, and custom tooltip using Recharts v3 closure pattern
- Created DailyBarChart with full day-range bar chart and formatted day-amount tooltip
- Created MonthSummary card showing variable budget, total spent, and savings with red over-budget state
- Replaced analytics page stub with full AnalyticsPage: Zustand hydration guard, monthOffset state for navigation, Dexie between() period query, useMemo derived chart data
- All 105 vitest tests pass, Next.js build succeeds, TypeScript strict mode clean

## Task Commits

1. **Task 1: DonutChart + DailyBarChart + i18n keys** - `65c380c` (feat)
2. **Task 2: MonthSummary + AnalyticsPage wiring** - `7631daf` (feat)

**Plan metadata:** (docs commit after SUMMARY)

## Files Created/Modified

- `src/components/analytics/DonutChart.tsx` — PieChart donut with CATEGORY_COLORS, empty state, Recharts v3 closure tooltip pattern
- `src/components/analytics/DailyBarChart.tsx` — BarChart with day-labeled axes, custom tooltip, empty state
- `src/components/analytics/MonthSummary.tsx` — Budget vs actual card with green savings / red over-budget display
- `src/app/analytics/page.tsx` — Full AnalyticsPage replacing stub: monthOffset navigation, hydration guard, Dexie period query
- `messages/en.json` — Added analytics i18n keys (byCategory, dailySpending, monthlySummary, budget, spent, saved, noSpending, previousMonth, nextMonth)
- `messages/ko.json` — Added equivalent Korean analytics translations

## Decisions Made

- Recharts v3 ContentType uses default generics `<ValueType, NameType>` — attempted `TooltipContentProps<number, string>` caused TypeScript assignability error. Fixed via closure factory pattern: `makeTooltip(currency)` returns `(props: TooltipContentProps) => ReactNode` satisfying the unconstrained generic requirement.
- `monthOffset` approach (0=current, negative=past) allows referenceDate computation via `setMonth(getMonth()+offset)`, then `getPeriodStartDate` applies payday-based boundary logic correctly.
- `Next month` button disabled when `monthOffset >= 0` — prevents navigation into future periods.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Recharts v3 TooltipContentProps generic type mismatch**
- **Found during:** Task 1 (DonutChart + DailyBarChart components)
- **Issue:** `extends TooltipContentProps<number, string>` and passing as `ContentType` prop caused TypeScript error — Recharts v3 `ContentType<ValueType, NameType>` expects unresolved generics, not constrained `<number, string>`
- **Fix:** Changed to closure factory pattern — `makeTooltip(currency)` returns `(props: TooltipContentProps) => ReactNode` with default generics
- **Files modified:** `src/components/analytics/DonutChart.tsx`, `src/components/analytics/DailyBarChart.tsx`
- **Verification:** `npx tsc --noEmit` exits with only pre-existing dashboard.test.tsx errors (out of scope)
- **Committed in:** `65c380c` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Fix required for TypeScript strict mode compliance. Pattern is the correct Recharts v3 approach — no scope creep.

## Issues Encountered

Pre-existing TypeScript errors in `tests/dashboard.test.tsx` (noted in Plan 05-01 SUMMARY as out of scope for Phase 5). No new errors introduced.

## User Setup Required

None - no external service configuration required.

## Self-Check: PASSED

- `src/components/analytics/DonutChart.tsx` exists
- `src/components/analytics/DailyBarChart.tsx` exists
- `src/components/analytics/MonthSummary.tsx` exists
- `src/app/analytics/page.tsx` updated
- Task commits 65c380c and 7631daf verified in git log
- `npx vitest run` — 105 passed, 1 todo, 0 failures
- `npm run build` — succeeded, /analytics route builds

## Next Phase Readiness

- Analytics tab is fully functional with three chart components
- Plan 05-03 (Settings page) can proceed — it uses the same Zustand/Dexie patterns established here
- No blockers

---
*Phase: 05-analytics-settings-pwa-polish*
*Completed: 2026-03-13*
