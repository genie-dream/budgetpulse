# Requirements: BudgetPulse

**Defined:** 2026-03-09
**Core Value:** Always showing the user exactly how much they can spend today — so they never reach month-end broke again.

## v1 Requirements

### Budget Setup

- [x] **BUDG-01**: User can input monthly income
- [x] **BUDG-02**: User can add, edit, and remove fixed expenses (name, amount, category)
- [x] **BUDG-03**: User can set an optional monthly savings goal
- [x] **BUDG-04**: Variable budget auto-calculates: income − fixed expenses − savings goal
- [x] **BUDG-05**: User can set month start day (1–31, e.g. payday-based like 25th)
- [x] **BUDG-06**: User can set currency (KRW default, USD, JPY)

### Onboarding

- [x] **ONBD-01**: First-run onboarding collects income, fixed expenses, and savings goal, then redirects to dashboard

### Transactions

- [x] **TRAN-01**: User can log a transaction with amount and category (required), memo and date (optional)
- [x] **TRAN-02**: Amount input uses mobile numeric keypad (inputmode="numeric" pattern="[0-9]*")
- [x] **TRAN-03**: Transaction logging completes in 3 taps or fewer
- [x] **TRAN-04**: User can delete a transaction via swipe gesture
- [x] **TRAN-05**: User can view transaction history grouped by date
- [x] **TRAN-06**: User can filter transaction history by category

### Dashboard

- [x] **DASH-01**: Dashboard shows variable budget, total spent, remaining budget with progress bar
- [x] **DASH-02**: Dashboard shows daily Survival Budget (remaining budget ÷ remaining days)
- [x] **DASH-03**: Dashboard shows weekly Survival Budget (daily × 7)
- [x] **DASH-04**: Dashboard shows remaining days in the current budget month
- [x] **DASH-05**: Dashboard shows Spending Pace status: safe (paceRatio < 0.9), caution (0.9–1.1), danger (≥ 1.1)
- [x] **DASH-06**: Dashboard shows over-budget state when remainingBudget < 0
- [x] **DASH-07**: Dashboard updates in < 100ms after a transaction is saved

### Analytics

- [x] **ANLX-01**: Category donut chart for current month spending
- [x] **ANLX-02**: Daily spending bar chart
- [x] **ANLX-03**: Monthly summary showing budget vs actual spend
- [x] **ANLX-04**: User can browse analytics for past months

### Settings & Data

- [ ] **SETT-01**: User can update income, fixed expenses, and savings goal at any time
- [x] **SETT-02**: User can export all data as a JSON file (backup)
- [x] **SETT-03**: User can import a JSON file to restore data (with structure validation)

### PWA

- [x] **PWA-01**: App installs on iOS and Android home screen
- [ ] **PWA-02**: Core functionality (dashboard, transaction logging, history) works fully offline
- [x] **PWA-03**: App loads in under 2 seconds on a typical mobile connection

## v2 Requirements

### Auth & Sync

- **AUTH-01**: User can create an account and log in
- **AUTH-02**: Data syncs across devices via cloud storage

### Notifications

- **NOTF-01**: Push notification when spending pace enters danger zone
- **NOTF-02**: End-of-month budget summary notification

### Security

- **SEC-01**: App can be locked with PIN or biometric authentication

### Export

- **EXP-01**: User can export transaction history as CSV

## Out of Scope

| Feature | Reason |
|---------|--------|
| Bank API / auto-import | High complexity, requires OAuth + bank partnerships |
| AI spending analysis | v2.0 feature, requires usage data to be meaningful |
| Family / couple shared budgets | Multi-user scope, v2.0 |
| Multiple budgets | Out of scope for MVP — one budget per user |
| Category customization | Deferred; 9 built-in categories sufficient for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUDG-01 | Phase 2 | Complete |
| BUDG-02 | Phase 2 | Complete |
| BUDG-03 | Phase 2 | Complete |
| BUDG-04 | Phase 2 | Complete |
| BUDG-05 | Phase 2 | Complete |
| BUDG-06 | Phase 2 | Complete |
| ONBD-01 | Phase 2 | Complete |
| TRAN-01 | Phase 3 | Complete |
| TRAN-02 | Phase 3 | Complete |
| TRAN-03 | Phase 3 | Complete |
| TRAN-04 | Phase 3 | Complete |
| TRAN-05 | Phase 3 | Complete |
| TRAN-06 | Phase 3 | Complete |
| DASH-01 | Phase 4 | Complete |
| DASH-02 | Phase 4 | Complete |
| DASH-03 | Phase 4 | Complete |
| DASH-04 | Phase 4 | Complete |
| DASH-05 | Phase 4 | Complete |
| DASH-06 | Phase 4 | Complete |
| DASH-07 | Phase 4 | Complete |
| ANLX-01 | Phase 5 | Complete |
| ANLX-02 | Phase 5 | Complete |
| ANLX-03 | Phase 5 | Complete |
| ANLX-04 | Phase 5 | Complete |
| SETT-01 | Phase 5 | Pending |
| SETT-02 | Phase 5 | Complete |
| SETT-03 | Phase 5 | Complete |
| PWA-01 | Phase 1 | Complete |
| PWA-02 | Phase 5 | Pending |
| PWA-03 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 after roadmap creation*
