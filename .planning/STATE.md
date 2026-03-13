---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 06
current_plan: 01
status: in_progress
stopped_at: Completed 06-01-PLAN.md
last_updated: "2026-03-13T16:19:59.981Z"
progress:
  total_phases: 6
  completed_phases: 6
  total_plans: 23
  completed_plans: 23
  percent: 100
---

# STATE: BudgetPulse

*Project memory — updated at each session boundary*

---

## Project Reference

**Core Value:** Always showing the user exactly how much they can spend today — so they never reach month-end broke again.
**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Zustand v5, Dexie.js v4, Recharts v3, Lucide React, next-intl, next-themes
**Deploy Target:** Vercel free tier
**Storage:** IndexedDB only (no backend)

---

## Current Position

**Current Phase:** 05
**Current Plan:** Not started
**Phase Status:** Phase 5 Complete (5/5 plans done)
**Overall Status:** All 21 plans across all 5 phases complete. BudgetPulse v1 fully implemented and human-verified.

```
Progress: [██████████] 100% complete (21/21 plans done)
Phase 1 [████] | Phase 2 [████] | Phase 3 [████] | Phase 4 [████] | Phase 5 [█████]
```

---

## Phase Summary

| Phase | Goal | Status |
|-------|------|--------|
| 1. Foundation | App shell, PWA scaffold, IndexedDB schema, routing | Complete (4/4) |
| 2. Budget Engine + Onboarding | Budget setup, Survival Budget calculation, onboarding flow | Complete (4/4) |
| 3. Transaction Logging | Fast mobile transaction logging, history, filtering | Complete (4/4) |
| 4. Dashboard | Real-time Survival Budget display, pace tracking | Complete (4/4) |
| 5. Analytics, Settings & PWA Polish | Charts, data backup/restore, offline support | Complete (5/5) |

---

## Accumulated Context

### Key Decisions (from PROJECT.md)

- Next.js PWA chosen over React Native for single codebase + stronger portfolio signal
- IndexedDB (Dexie.js) over localStorage for large transaction sets and complex queries
- Zustand for state management (minimal boilerplate)
- JSON backup only for v1 (CSV deferred to v1.5)
- paceRatio thresholds: safe < 0.9, caution 0.9-1.1, danger >= 1.1

### Decisions from Plan 01-01

- Scaffold into project root (budget/) not a subdirectory — git repo already initialized at root
- Wave 0 test stubs use it.todo so vitest exits 0 before implementation plans run
- Category type as string union (not enum) for Dexie JSON serialization compatibility
- Skipped next-pwa (abandoned package) — native manifest.ts for Phase 1, @serwist/next deferred to Phase 5

### Decisions from Plan 01-02

- transactionStore is in-memory only (no persist) — Dexie is source of truth for transactions; Zustand is a display cache
- budgetStore and settingsStore both use skipHydration: true to prevent SSR/client hydration mismatch
- Cookie-based locale (not URL segment) for language switching without route changes — matches mobile PWA UX
- Exported BudgetPulseDB class alongside db singleton so tests can inspect schema via db.table().schema.indexes

### Decisions from Plan 01-03

- Tailwind v4 dark mode uses @custom-variant dark in globals.css with data-theme="dark" selector (not darkMode: class which is v3)
- @testing-library/jest-dom added to devDependencies — required for toBeInTheDocument matcher in test suite
- BottomNav created during Task 1 to resolve layout.tsx build-time import error (Rule 3 auto-fix)

### Decisions from Plan 01-04

- Pretendard font not downloaded (network unavailable during execution) — Inter (next/font/google) used as temporary substitute with TODO comment in layout.tsx for easy swap
- sharp installed as devDependency for reproducible icon generation from SVG source via scripts/generate-icons.mjs
- ServiceWorkerRegistration client component placed early in layout body to register SW and rehydrate Zustand stores immediately on mount

### Decisions from Plan 02-01

- Intl.NumberFormat ja-JP returns fullwidth yen ￥ (U+FFE5), not halfwidth ¥ (U+00A5) — tests use actual Intl runtime output
- getRemainingDaysInPeriod with startDay=31 in January yields 29 days (Jan 31 → Feb 28 inclusive), not 1 — plan comment was incorrect; must_have truths (>= 1) are satisfied
- formatCurrency lives in src/lib/budget.ts; detectCurrencyFromLocale in src/lib/locale.ts — pure calc module pattern established
- SSR guard in detectCurrencyFromLocale: `if (typeof navigator === 'undefined') return 'KRW'`

### Decisions from Plan 02-02

- jsdom localStorage mock added to tests/setup.ts — jsdom without a URL throws SecurityError; centralized mock ensures Zustand persist works in all test files without per-file workarounds
- vitest.config.mts environmentOptions.jsdom.url set to 'http://localhost' as belt-and-suspenders
- db.budgetConfigs.put() (upsert) confirmed over add() per RESEARCH.md for onboarding wizard re-save scenario
- currency: 'KRW' default in settingsStore is backward-compatible — Zustand persist shallow-merges so existing stored states without the key receive KRW

### Decisions from Plan 02-03

- onFinishHydration + hasHydrated() check used in onboarding page for stores with skipHydration: true — avoids reading stale isOnboarded before Zustand persist rehydrates
- Currency picker shown only when detectCurrencyFromLocale() returns USD or JPY — KRW locale silently defaults per CONTEXT.md "Default: KRW (silent)"
- SwipeToDelete uses horizontal-dominant guard (|deltaX| > |deltaY| AND |deltaX| > 60px) to prevent triggering on vertical scroll gestures
- router.replace('/') not push() in handleFinish — prevents back-button returning to already-completed onboarding
- editingId state in StepFixedExpenses — tapping a row pre-fills the shared inline form; Save replaces item in array by ID

### Decisions from Plan 02-04

- Two separate useEffects in DashboardPage: effect 1 subscribes to onFinishHydration/hasHydrated() to set hydrated flag, effect 2 reacts to hydrated+isOnboarded to fire redirect — avoids stale closure issues with a single combined effect
- return null when !hydrated OR !isOnboarded prevents any flash of dashboard content before redirect fires
- router.replace('/onboarding') not router.push() — prevents back button cycling user back into completed onboarding
- Human verification approved via automated Playwright browser testing covering all scenarios (first-run redirect, full 3-step wizard, returning user no-redirect, symmetric /onboarding guard)

### Decisions from Plan 03-01

- BudgetPulseDB constructor updated to accept optional name param (default 'BudgetPulseDB') — enables per-test DB isolation without singleton state leakage between tests
- groupByDate uses local date keys (getFullYear/getMonth/getDate) not toISOString() to prevent UTC midnight drift on mobile (critical for UTC+9 users)
- lastUsedCategory defaults to 'food' (first CATEGORIES entry), in-memory only (no persist middleware per CONTEXT.md)

### Decisions from Plan 03-02

- CategoryChips is pure presentational (labelEn only) for v1 — locale-aware labels deferred to later plan
- amount input uses type=text inputMode=numeric (not type=number) to avoid browser spinner arrows on mobile
- settingsStore hydration guard uses persist.onFinishHydration + persist.hasHydrated() — consistent with onboarding page pattern
- tCommon('back') used for back button aria-label — avoids redundant key in 'add' namespace

### Decisions from Plan 03-04

- Human verification approved all 4 UX test flows (A through D) — 3-tap flow, history grouping, category filter, swipe-to-delete — all confirmed working
- Automated gate (58/58 tests, clean build) ran before human checkpoint as verification precondition

### Decisions from Plan 03-03

- TransactionRow receives onDelete as prop from page — no Dexie or store calls inside the component (page-owned delete handler pattern)
- Category filter uses in-memory transactions.filter() on Zustand store — no Dexie re-fetch on chip tap per RESEARCH.md Pitfall 5
- Test mock uses mutable _txStore.value object to allow per-test db control without vi.fn() hoisting issues in vi.mock() factory
- Daily total in DateGroupHeader and transaction row both display same resolvedCurrency (defaults to 'KRW' before hydration)

### Decisions from Plan 04-01

- getPeriodStartDate uses local-date constructor (new Date(y,m,d)) — never ISO strings to prevent UTC drift for UTC+9 mobile users
- calcPaceRatio sentinel: variableBudget<=0 with spent>0 returns 2 to reliably trigger danger status without divide-by-zero
- DASH-07 (<100ms update) is architectural guarantee from Zustand synchronous re-render — no timing test needed
- Wave 0 test scaffold uses it.todo for RTL component stubs so vitest exits 0 before HeroCard/StatGrid components exist

### Decisions from Plan 04-02

- HeroCard displays Math.abs(remainingBudget) — absolute value shown, negative state conveyed via text-red-500 and "Over budget" label (not minus sign in number)
- StatGrid stub created as Rule 3 auto-fix — dashboard.test.tsx pre-emptively imported StatGrid blocking full test suite; full impl is Plan 04-03 scope
- RTL tests in dashboard.test.tsx (.tsx extension required for JSX); dashboard.test.ts retained for pure function tests only
- data-testid added to hero-amount and progress-bar-fill elements for unambiguous RTL querySelector queries

### Decisions from Plan 04-03

- StatGrid is purely presentational — dailySurvival and weeklySurvival received pre-clamped (>=0) from caller, no internal clamping needed
- Card order: Daily Survival (top-left), Weekly Survival (top-right), Total Spent (bottom-left), Remaining Days (bottom-right) — matches plan spec
- dashboard.test.ts Wave 0 stub removed; dashboard.test.tsx was the authoritative test file from Plan 04-02

### Decisions from Plan 04-04

- Current-period Dexie query scoped via getPeriodStartDate(new Date(), config.monthStartDay) — avoids all-time totalSpent inflation
- dailySurvival uses Math.max(0, remainingBudget) as input to calcDailySurvivalBudget — survival budget is never negative
- resolvedCurrency defaults to 'KRW' before hydration — same defensive pattern as TransactionsPage
- return null guard when !hydrated OR !isOnboarded — prevents any flash of incorrect data before redirect fires
- Human verification approved all 4 UX scenarios (A: normal state, B: real-time update, C: over-budget, D: pace badge colors)

### Decisions from Plan 05-01

- aggregateByDay uses local-date keys (getFullYear/getMonth/getDate) not toISOString() to avoid UTC midnight drift for UTC+9 mobile users — matches transactionHelpers.groupByDate pattern
- getPeriodEndDate monthStartDay=1 special-case uses new Date(y, m+1, 0) trick (day 0 = last day of current month)
- getPeriodEndDate general case: end day = monthStartDay-1 in the following month, clamped via Math.min to handle short months (Feb with monthStartDay=31)
- tests/settings.test.ts and tests/sw.test.ts use it.todo stubs so Wave 2/3/4 plans have automated verify targets from day one (established pattern from Plan 01-01)
- CategoryTotal.name = labelEn (same as id, English only for v1) — locale-aware labels deferred per CategoryChips decision

### Decisions from Plan 05-02

- Recharts v3 ContentType uses closure factory pattern (makeTooltip/makeBarTooltip returning TooltipContentProps with default generics, not <number, string>) — extending TooltipContentProps<number, string> caused ContentType<ValueType, NameType> assignability errors
- monthOffset state (0=current, negative=past) drives referenceDate via setMonth(getMonth()+offset), then getPeriodStartDate applies payday-based period boundary — Next button disabled when monthOffset >= 0

### Decisions from Plan 05-03

- dexie-export-import installed without peer dependency conflicts against Dexie v4 — no --legacy-peer-deps needed
- peakImportFile validates backup metadata before destructive importInto — prevents crash on malformed backup files
- DataManagement uses window.confirm for import consent — avoids custom modal complexity for v1
- BudgetEditForm reuses StepFixedExpenses inline form pattern with SwipeToDelete for UX consistency with onboarding

### Decisions from Plan 05-05

- Human verification approved all 5 test scenarios (Analytics, Settings budget edit, Export/Import, Offline mode, Service Worker) — all 30 BudgetPulse v1 requirements confirmed working
- BudgetPulse v1 is complete and ready for Vercel deployment

### Decisions from Plan 05-04

- swSrc set to src/app/sw.ts (not app/sw.ts) — matches project src/ directory structure; withSerwistInit swSrc updated accordingly
- Build script changed to next build --webpack — Serwist is incompatible with Next.js 16 Turbopack default (dev script unchanged)
- disable: process.env.NODE_ENV === 'development' in withSerwistInit — prevents stale cache issues during development
- webworker added to tsconfig lib array for ServiceWorkerGlobalScope type in sw.ts; declare const self override resolves dom/webworker self conflict
- @serwist/next/typings added to tsconfig types for __SW_MANIFEST global injection typing
- public/sw.js removed from git tracking via git rm --cached — previously committed Phase 1 stub must be untracked before gitignore takes effect

### Decisions from Plan 06-01

- Pretendard v1.3.9 GitHub release ships only as zip archives — no standalone woff2; extracted web/variable/woff2/PretendardVariable.woff2 from Pretendard-1.3.9.zip (2MB variable font)
- next/font/local src path is relative to the calling file (src/app/layout.tsx), so ../../public/fonts/PretendardVariable.woff2 resolves correctly to project root
- vi.mock('next-intl') uses lookup-map style (not key => key passthrough) so existing English text assertions in TransactionsPage.test.tsx pass unchanged
- All three 'History' occurrences replaced with t('title'): loading state h1, empty state h1, populated state h1

### Decisions from Plan 06-02

- DASH-07 period filter lives at the call site in add/page.tsx handleSave (not in transactionStore) — store is neutral and unfiltered; filter is caller's responsibility
- Defensive fallback: new Date(0) epoch when budget config is null in add/page.tsx — includes all transactions until budget is configured
- BudgetEditForm changed from default export to named export — aligns with plan 05-03 spec for import consistency

### Critical Implementation Notes

- `monthStartDay` allows payday-based months (e.g. 25th to 24th). Non-trivial edge case requiring dedicated tests.
- Survival Budget is the killer feature — dashboard polish matters more than analytics polish
- Dashboard update < 100ms after transaction save is a hard performance requirement
- Mobile-first: touch targets >= 44x44px, iPhone Safe Area support, bottom nav with 5 tabs
- Lighthouse Performance >= 90

### Todos

- [x] Run `/gsd:plan-phase 1` to plan Phase 1: Foundation
- [x] Read Architecture doc at `/Architecture_BudgetPulse1.1.md` before Phase 1 planning
- [x] Execute Plan 01-02: IndexedDB schema (Dexie)
- [x] Execute Plan 01-03: App shell + BottomNav
- [x] Execute Plan 01-04: PWA manifest — all tasks complete, human verification approved

### Blockers

None.

---

## Session Continuity

**Last session:** 2026-03-13T16:19:59.979Z
**Stopped at:** Completed 06-01-PLAN.md
**Next action:** BudgetPulse v1 complete — deploy to Vercel

---

*State last updated: 2026-03-14T00:20:00Z*
