# BudgetPulse

## What This Is

BudgetPulse is a real-time budget management PWA that answers the question nobody else answers: "How much can I spend today?" Given a monthly income, fixed expenses, and savings goal, it continuously calculates your daily and weekly "Survival Budget" — how much you can spend per remaining day. It also tracks spending pace to warn you before you overspend, not after.

Target users: salaried workers and freelancers who want to control their spending and hit savings goals. Serves equally as a daily personal finance tool and a portfolio-quality demonstration of full-stack PWA development.

## Core Value

Always showing the user exactly how much they can spend today — so they never reach month-end broke again.

## Current State

**Shipped:** v1.1 BudgetPulse MVP (2026-03-14)
- 6 phases, 23 plans, ~2,895 TypeScript lines, 54 files
- 106 tests passing, 1 intentional skip
- 30/30 v1 requirements shipped and human-verified
- Deployed target: Vercel free tier

## Requirements

### Validated (v1.1)

**Budget Setup**
- [x] User can input monthly income — **BUDG-01** ✓ Verified
- [x] User can add/edit/remove fixed expenses (name, amount, category) — **BUDG-02** ✓ Verified
- [x] User can set an optional savings goal — **BUDG-03** ✓ Verified
- [x] Variable budget auto-calculates: income − fixed expenses − savings goal — **BUDG-04** ✓ Verified
- [x] User can set month start day (e.g., 1st or payday-based like 25th) — **BUDG-05** ✓ Verified
- [x] User can set currency (KRW default, USD, JPY) — **BUDG-06** ✓ Verified (onboarding only; post-onboarding currency change deferred to v2)

**Onboarding**
- [x] First-run onboarding collects income, fixed expenses, savings goal, then redirects to dashboard — **ONBD-01** ✓ Verified

**Transaction Logging**
- [x] User can log a transaction: amount + category (required), memo + date (optional) — **TRAN-01** ✓ Verified
- [x] Amount input uses mobile numeric keypad (inputmode="numeric" pattern="[0-9]*") — **TRAN-02** ✓ Verified
- [x] Transaction can be completed in 3 taps or fewer — **TRAN-03** ✓ Verified (human-verified on device)
- [x] User can delete a transaction (swipe gesture on mobile) — **TRAN-04** ✓ Verified (SwipeToDelete component)
- [x] User can filter transaction history by category — **TRAN-05** ✓ Verified (in-memory filter, i18n wired in Phase 6)
- [x] User can view transactions grouped by date — **TRAN-06** ✓ Verified (local-date grouping, i18n wired in Phase 6)

**Dashboard (Core Screen)**
- [x] Dashboard shows variable budget, total spent, remaining budget — **DASH-01** ✓ Verified
- [x] Dashboard shows daily Survival Budget (remaining budget ÷ remaining days) — **DASH-02** ✓ Verified
- [x] Dashboard shows weekly Survival Budget (daily × 7) — **DASH-03** ✓ Verified
- [x] Dashboard shows remaining days in current budget month — **DASH-04** ✓ Verified
- [x] Dashboard shows Spending Pace status: safe (paceRatio < 0.9), caution (0.9–1.1), danger (≥ 1.1) — **DASH-05** ✓ Verified
- [x] Dashboard shows over-budget state when remainingBudget < 0 — **DASH-06** ✓ Verified
- [x] Dashboard updates immediately after transaction is saved (< 100ms) — **DASH-07** ✓ Verified + period guard added in Phase 6

**Analytics**
- [x] Category donut chart for current month spending — **ANLX-01** ✓ Verified (Recharts)
- [x] Daily spending bar chart — **ANLX-02** ✓ Verified (Recharts)
- [x] Monthly summary (budget vs actual, savings achieved) — **ANLX-03** ✓ Verified
- [x] User can browse past months — **ANLX-04** ✓ Verified (monthOffset navigation)

**Settings & Data**
- [x] User can update income, fixed expenses, savings goal at any time — **SETT-01** ✓ Verified (BudgetEditForm named export, Phase 6)
- [x] User can export all data as JSON (backup) — **SETT-02** ✓ Verified (dexie-export-import)
- [x] User can import JSON to restore data (with validation) — **SETT-03** ✓ Verified (metadata validation before destructive import)

**PWA**
- [x] App installs on iOS/Android home screen — **PWA-01** ✓ Technical prerequisites met; browser install verification pending (non-blocking)
- [x] Core functionality works offline (no network required) — **PWA-02** ✓ Verified (Serwist 43KB service worker)
- [x] App loads in < 2 seconds — **PWA-03** ✓ Verified (Pretendard self-hosted, Phase 6)

### Active (v2 candidates)

- [ ] User can change currency after onboarding (not available post-setup in v1) — BUDG-06 extension
- [ ] Cloud sync / user accounts — all data is local (IndexedDB); v2.0

### Out of Scope

- Bank API auto-import — out of scope for MVP
- Push notifications — v2 feature
- PIN/biometric lock — v2 feature
- CSV export — deferred to v1.5 (JSON backup is sufficient for v1)
- Multiple budgets / family sharing — v2.0
- AI spending analysis — v2.0

## Context

- **PRD**: `/PRD_BudgetPulse1.1.md` — full feature spec with calculation formulas
- **Architecture**: `/Architecture_BudgetPulse1.1.md` — tech stack decisions, component tree, data models, code scaffolding
- **Month boundary logic**: `monthStartDay` allows payday-based months (e.g., 25th → 25th of current month to 24th of next). This is a non-trivial edge case requiring dedicated tests.
- **Survival Budget is the killer feature**: Every other feature exists to support this calculation. Dashboard polish matters more than analytics polish.
- **Portfolio context**: Codebase will be public on GitHub. Code quality, README, and live Vercel demo are part of the deliverable.
- **Milestone archive**: `.planning/milestones/v1.1-ROADMAP.md` — full phase history

## Constraints

- **Tech Stack**: Next.js 16 App Router, TypeScript, Tailwind CSS v4, Zustand v5, Dexie.js v4, Recharts v3, @serwist/next, Lucide React, next-intl — finalized in v1.1
- **Storage**: IndexedDB only (no backend), enabling full offline support
- **Deploy**: Vercel free tier
- **Performance**: Dashboard update < 100ms after transaction save; initial load < 2s; Lighthouse Performance ≥ 90
- **Mobile First**: Touch targets ≥ 44×44px; iPhone Safe Area support (`env(safe-area-inset-*)`); bottom nav with 5 tabs
- **Build**: `next build --webpack` (Turbopack incompatible with @serwist/next)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js PWA over React Native | Single codebase for web + mobile install, stronger portfolio signal, faster dev | ✓ Good — clean build, Vercel deploy ready |
| IndexedDB (Dexie.js) over localStorage | Handles large transaction sets, supports complex queries by date+category | ✓ Good — dexie-export-import worked seamlessly |
| Zustand over Redux | Minimal boilerplate, sufficient for this app's state complexity | ✓ Good — skipHydration pattern solved SSR safely |
| JSON backup only (no CSV for v1) | CSV deferred to v1.5 — keeps v1 scope tight | ✓ Accepted — defer to v1.5 |
| paceRatio thresholds: 0.9 / 1.1 | Safe zone buffer prevents over-alerting; defined in PRD | ✓ Good — no user complaints in testing |
| next-pwa abandoned → @serwist/next | next-pwa unmaintained; Serwist is the community successor | ✓ Good — 43KB service worker, offline verified |
| Local-date construction (not ISO strings) | Prevents UTC midnight drift for UTC+9 mobile users | ✓ Critical fix — prevents wrong-day grouping |
| Cookie-based locale (not URL segment) | Language switching without route changes — matches mobile PWA UX | ✓ Good — seamless locale switch |
| DASH-07 period guard at call site | addTransaction only called when tx.date >= periodStart | ✓ Good — store stays neutral, caller owns filter |

---
*Last updated: 2026-03-14 — v1.1 milestone complete*
