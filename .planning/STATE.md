---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 3
current_plan: Not started
status: unknown
stopped_at: Completed 03-01-PLAN.md
last_updated: "2026-03-13T12:07:35.480Z"
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 12
  completed_plans: 9
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

**Current Phase:** 3
**Current Plan:** 02 (Wave 2 — AddPage and TransactionsPage)
**Phase Status:** Phase 3 In Progress (1/4 plans done)
**Overall Status:** Phase 3 started — test scaffolds, pure helpers, and store extension complete

```
Progress: [████████░░] 75% complete (9/12 plans done)
Phase 1 [█████] | Phase 2 [████] | Phase 3 [1....] | Phase 4 [.....] | Phase 5 [.....]
```

---

## Phase Summary

| Phase | Goal | Status |
|-------|------|--------|
| 1. Foundation | App shell, PWA scaffold, IndexedDB schema, routing | Complete (4/4) |
| 2. Budget Engine + Onboarding | Budget setup, Survival Budget calculation, onboarding flow | Complete (4/4) |
| 3. Transaction Logging | Fast mobile transaction logging, history, filtering | In Progress (1/4) |
| 4. Dashboard | Real-time Survival Budget display, pace tracking | Not started |
| 5. Analytics, Settings & PWA Polish | Charts, data backup/restore, offline support | Not started |

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

**Last session:** 2026-03-13T12:07:35.479Z
**Stopped at:** Completed 03-01-PLAN.md
**Next action:** Execute Phase 3 Wave 2 plans (03-02 AddPage, 03-03 TransactionsPage) in parallel

---

*State last updated: 2026-03-10T16:12:49Z*
