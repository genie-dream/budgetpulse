# ROADMAP: BudgetPulse

**Project:** BudgetPulse
**Core Value:** Always showing the user exactly how much they can spend today — so they never reach month-end broke again.
**Granularity:** Standard
**Total v1 Requirements:** 30
**Coverage:** 30/30

---

## Phases

- [x] **Phase 1: Foundation** - Next.js PWA scaffold with IndexedDB data layer, routing shell, and TypeScript foundation (completed 2026-03-09)
- [x] **Phase 2: Budget Engine + Onboarding** - Budget setup, Survival Budget calculation, month boundary logic, and first-run onboarding (completed 2026-03-09)
- [x] **Phase 3: Transaction Logging** - Fast mobile-friendly transaction logging with history browsing and filtering (completed 2026-03-13)
- [ ] **Phase 4: Dashboard** - Real-time Survival Budget display, spending pace status, and over-budget states
- [ ] **Phase 5: Analytics, Settings & PWA Polish** - Spending charts, past-month browsing, data backup/restore, offline support, and performance

---

## Phase Details

### Phase 1: Foundation

**Goal**: The app shell exists, loads fast, and all infrastructure is in place for feature development to begin
**Depends on**: Nothing (first phase)
**Requirements**: PWA-01, PWA-03
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` serves the app at localhost with all 5 bottom nav tabs visible
  2. The app can be built and deployed to Vercel without errors
  3. IndexedDB schema (budget config, transactions) is defined and readable/writable via Dexie.js
  4. The app passes Lighthouse PWA audit with installability criteria met on iOS and Android
  5. Initial page load completes in under 2 seconds on a simulated mobile connection
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — Scaffold project, install dependencies, define TypeScript type contracts
- [ ] 01-02-PLAN.md — Dexie.js schema, Zustand stores, next-intl i18n wiring and message files
- [ ] 01-03-PLAN.md — App shell: root layout, dark mode, 5-route pages, BottomNav with FAB Add button
- [ ] 01-04-PLAN.md — PWA manifest, service worker, app icons, Pretendard font loading

### Phase 2: Budget Engine + Onboarding

**Goal**: A new user can configure their budget in one flow and the Survival Budget calculation is correct for all edge cases
**Depends on**: Phase 1
**Requirements**: BUDG-01, BUDG-02, BUDG-03, BUDG-04, BUDG-05, BUDG-06, ONBD-01
**Success Criteria** (what must be TRUE):
  1. A first-time user is presented with the onboarding flow and not the dashboard
  2. After completing onboarding (income, fixed expenses, savings goal), the user lands on the dashboard with a calculated variable budget
  3. Variable budget correctly computes: income − sum(fixed expenses) − savings goal
  4. Daily Survival Budget recalculates correctly when month start day is set to a non-1st date (e.g. 25th)
  5. Currency symbol displays correctly for KRW, USD, and JPY throughout the app
**Plans**: 4 plans

Plans:
- [ ] 02-01-PLAN.md — TDD: pure calculation engine (calcVariableBudget, getRemainingDaysInPeriod, formatCurrency, detectCurrencyFromLocale)
- [ ] 02-02-PLAN.md — Extend settingsStore with currency field + BudgetConfig persistence test
- [ ] 02-03-PLAN.md — 3-step onboarding wizard UI (Income, Fixed Expenses, Savings Goal) with LiveBudgetBar and SwipeToDelete
- [ ] 02-04-PLAN.md — Root page redirect guard + human verification of full first-run flow

### Phase 3: Transaction Logging

**Goal**: Users can log spending quickly on mobile and browse their full transaction history
**Depends on**: Phase 2
**Requirements**: TRAN-01, TRAN-02, TRAN-03, TRAN-04, TRAN-05, TRAN-06
**Success Criteria** (what must be TRUE):
  1. A user can log a transaction (amount + category) in 3 taps or fewer from the main screen
  2. The amount input shows a numeric keypad on mobile (no text keyboard appears)
  3. A user can delete a transaction by swiping it in the history list
  4. Transaction history is grouped by date and shows entries in reverse-chronological order
  5. Filtering by category shows only transactions matching that category
**Plans**: 4 plans

Plans:
- [ ] 03-01-PLAN.md — TDD: helper utilities (groupByDate, smartDateLabel), test scaffolds, transactionStore lastUsedCategory extension
- [ ] 03-02-PLAN.md — Add Transaction page (/add) with auto-focus, category chips, save flow, i18n keys
- [ ] 03-03-PLAN.md — Transaction History page (/transactions) with date groups, filter chips, swipe-to-delete, empty state
- [ ] 03-04-PLAN.md — Human verification of complete 3-tap flow, swipe-to-delete, and category filter

### Phase 4: Dashboard

**Goal**: The dashboard answers "how much can I spend today?" with real-time accuracy after every transaction
**Depends on**: Phase 3
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07
**Success Criteria** (what must be TRUE):
  1. Dashboard displays variable budget, total spent, remaining budget, and a progress bar simultaneously
  2. Daily and weekly Survival Budget values are visible and update after each transaction
  3. Remaining days in the current budget month displays correctly, including payday-based months
  4. Spending pace indicator shows safe (green), caution (yellow), or danger (red) based on paceRatio thresholds
  5. When remaining budget goes negative, the dashboard shows a distinct over-budget state
  6. After saving a transaction, all dashboard values refresh within 100ms without a full page reload
**Plans**: 4 plans

Plans:
- [ ] 04-01-PLAN.md — TDD: calcPaceRatio, getPaceStatus, getPeriodStartDate in budget.ts + i18n dashboard keys + test scaffold
- [ ] 04-02-PLAN.md — HeroCard component: remaining budget hero, pace badge, progress bar (DASH-01, DASH-05, DASH-06)
- [ ] 04-03-PLAN.md — StatGrid component: daily/weekly survival, total spent, remaining days (DASH-02, DASH-03, DASH-04)
- [ ] 04-04-PLAN.md — Dashboard page wiring: hydration guards, Dexie current-period load, human verification

### Phase 5: Analytics, Settings & PWA Polish

**Goal**: Users can understand their spending history, manage their data, and use the app fully offline
**Depends on**: Phase 4
**Requirements**: ANLX-01, ANLX-02, ANLX-03, ANLX-04, SETT-01, SETT-02, SETT-03, PWA-02
**Success Criteria** (what must be TRUE):
  1. Analytics screen shows a donut chart of spending by category and a bar chart of daily spending for the current month
  2. User can navigate to a previous month and see its analytics and summary (budget vs actual, savings achieved)
  3. User can update income, fixed expenses, or savings goal from Settings and the dashboard recalculates immediately
  4. User can export all app data as a JSON file and re-import it on the same or different device with validation
  5. Dashboard and transaction logging work fully with no network connection (airplane mode)
**Plans**: TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete   | 2026-03-09 |
| 2. Budget Engine + Onboarding | 4/4 | Complete   | 2026-03-09 |
| 3. Transaction Logging | 4/4 | Complete   | 2026-03-13 |
| 4. Dashboard | 3/4 | In Progress|  |
| 5. Analytics, Settings & PWA Polish | 0/? | Not started | - |

---

## Coverage Map

| Requirement | Phase |
|-------------|-------|
| PWA-01 | Phase 1 |
| PWA-03 | Phase 1 |
| BUDG-01 | Phase 2 |
| BUDG-02 | Phase 2 |
| BUDG-03 | Phase 2 |
| BUDG-04 | Phase 2 |
| BUDG-05 | Phase 2 |
| BUDG-06 | Phase 2 |
| ONBD-01 | Phase 2 |
| TRAN-01 | Phase 3 |
| TRAN-02 | Phase 3 |
| TRAN-03 | Phase 3 |
| TRAN-04 | Phase 3 |
| TRAN-05 | Phase 3 |
| TRAN-06 | Phase 3 |
| DASH-01 | Phase 4 |
| DASH-02 | Phase 4 |
| DASH-03 | Phase 4 |
| DASH-04 | Phase 4 |
| DASH-05 | Phase 4 |
| DASH-06 | Phase 4 |
| DASH-07 | Phase 4 |
| ANLX-01 | Phase 5 |
| ANLX-02 | Phase 5 |
| ANLX-03 | Phase 5 |
| ANLX-04 | Phase 5 |
| SETT-01 | Phase 5 |
| SETT-02 | Phase 5 |
| SETT-03 | Phase 5 |
| PWA-02 | Phase 5 |

**Total mapped: 30/30**

---

*Roadmap created: 2026-03-09*
*Phase 1 plans created: 2026-03-09*
*Phase 2 plans created: 2026-03-10*
*Phase 3 plans created: 2026-03-13*
*Phase 4 plans created: 2026-03-13*
