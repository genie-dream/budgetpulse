# BudgetPulse

## What This Is

BudgetPulse is a real-time budget management PWA that answers the question nobody else answers: "How much can I spend today?" Given a monthly income, fixed expenses, and savings goal, it continuously calculates your daily and weekly "Survival Budget" — how much you can spend per remaining day. It also tracks spending pace to warn you before you overspend, not after.

Target users: salaried workers and freelancers who want to control their spending and hit savings goals. Serves equally as a daily personal finance tool and a portfolio-quality demonstration of full-stack PWA development.

## Core Value

Always showing the user exactly how much they can spend today — so they never reach month-end broke again.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Budget Setup**
- [ ] User can input monthly income
- [ ] User can add/edit/remove fixed expenses (name, amount, category)
- [ ] User can set an optional savings goal
- [ ] Variable budget auto-calculates: income − fixed expenses − savings goal
- [ ] User can set month start day (e.g., 1st or payday-based like 25th)
- [ ] User can set currency (KRW default, USD, JPY)

**Onboarding**
- [ ] First-run onboarding collects income, fixed expenses, savings goal, then redirects to dashboard

**Transaction Logging**
- [ ] User can log a transaction: amount + category (required), memo + date (optional)
- [ ] Amount input uses mobile numeric keypad (inputmode="numeric" pattern="[0-9]*")
- [ ] Transaction can be completed in 3 taps or fewer
- [ ] User can delete a transaction (swipe gesture on mobile)
- [ ] User can filter transaction history by category
- [ ] User can view transactions grouped by date

**Dashboard (Core Screen)**
- [ ] Dashboard shows variable budget, total spent, remaining budget
- [ ] Dashboard shows daily Survival Budget (remaining budget ÷ remaining days)
- [ ] Dashboard shows weekly Survival Budget (daily × 7)
- [ ] Dashboard shows remaining days in current budget month
- [ ] Dashboard shows Spending Pace status: safe (paceRatio < 0.9), caution (0.9–1.1), danger (≥ 1.1)
- [ ] Dashboard shows over-budget state when remainingBudget < 0
- [ ] Dashboard updates immediately after transaction is saved (< 100ms)

**Analytics**
- [ ] Category donut chart for current month spending
- [ ] Daily spending bar chart
- [ ] Monthly summary (budget vs actual, savings achieved)
- [ ] User can browse past months

**Settings & Data**
- [ ] User can update income, fixed expenses, savings goal at any time
- [ ] User can export all data as JSON (backup)
- [ ] User can import JSON to restore data (with validation)

**PWA**
- [ ] App installs on iOS/Android home screen
- [ ] Core functionality works offline (no network required)
- [ ] App loads in < 2 seconds

### Out of Scope

- Cloud sync / user accounts — all data is local (IndexedDB); v2.0
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

## Constraints

- **Tech Stack**: Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand, Dexie.js (IndexedDB), Recharts, next-pwa, Lucide React — decided in Architecture doc
- **Storage**: IndexedDB only (no backend), enabling full offline support
- **Deploy**: Vercel free tier
- **Performance**: Dashboard update < 100ms after transaction save; initial load < 2s; Lighthouse Performance ≥ 90
- **Mobile First**: Touch targets ≥ 44×44px; iPhone Safe Area support (`env(safe-area-inset-*)`); bottom nav with 5 tabs

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js PWA over React Native | Single codebase for web + mobile install, stronger portfolio signal, faster dev | — Pending |
| IndexedDB (Dexie.js) over localStorage | Handles large transaction sets, supports complex queries by date+category | — Pending |
| Zustand over Redux | Minimal boilerplate, sufficient for this app's state complexity | — Pending |
| JSON backup only (no CSV for v1) | CSV deferred to v1.5 — keeps v1 scope tight | — Pending |
| paceRatio thresholds: 0.9 / 1.1 | Safe zone buffer prevents over-alerting; defined in PRD | — Pending |

---
*Last updated: 2026-03-09 after initialization*
