# Requirements: BudgetPulse

**Defined:** 2026-03-09
**Core Value:** Always showing the user exactly how much they can spend today — so they never reach month-end broke again.

## v1 Requirements

### Budget Setup

- [ ] **BUDG-01**: User can input monthly income
- [ ] **BUDG-02**: User can add, edit, and remove fixed expenses (name, amount, category)
- [ ] **BUDG-03**: User can set an optional monthly savings goal
- [ ] **BUDG-04**: Variable budget auto-calculates: income − fixed expenses − savings goal
- [ ] **BUDG-05**: User can set month start day (1–31, e.g. payday-based like 25th)
- [ ] **BUDG-06**: User can set currency (KRW default, USD, JPY)

### Onboarding

- [ ] **ONBD-01**: First-run onboarding collects income, fixed expenses, and savings goal, then redirects to dashboard

### Transactions

- [ ] **TRAN-01**: User can log a transaction with amount and category (required), memo and date (optional)
- [ ] **TRAN-02**: Amount input uses mobile numeric keypad (inputmode="numeric" pattern="[0-9]*")
- [ ] **TRAN-03**: Transaction logging completes in 3 taps or fewer
- [ ] **TRAN-04**: User can delete a transaction via swipe gesture
- [ ] **TRAN-05**: User can view transaction history grouped by date
- [ ] **TRAN-06**: User can filter transaction history by category

### Dashboard

- [ ] **DASH-01**: Dashboard shows variable budget, total spent, remaining budget with progress bar
- [ ] **DASH-02**: Dashboard shows daily Survival Budget (remaining budget ÷ remaining days)
- [ ] **DASH-03**: Dashboard shows weekly Survival Budget (daily × 7)
- [ ] **DASH-04**: Dashboard shows remaining days in the current budget month
- [ ] **DASH-05**: Dashboard shows Spending Pace status: safe (paceRatio < 0.9), caution (0.9–1.1), danger (≥ 1.1)
- [ ] **DASH-06**: Dashboard shows over-budget state when remainingBudget < 0
- [ ] **DASH-07**: Dashboard updates in < 100ms after a transaction is saved

### Analytics

- [ ] **ANLX-01**: Category donut chart for current month spending
- [ ] **ANLX-02**: Daily spending bar chart
- [ ] **ANLX-03**: Monthly summary showing budget vs actual spend
- [ ] **ANLX-04**: User can browse analytics for past months

### Settings & Data

- [ ] **SETT-01**: User can update income, fixed expenses, and savings goal at any time
- [ ] **SETT-02**: User can export all data as a JSON file (backup)
- [ ] **SETT-03**: User can import a JSON file to restore data (with structure validation)

### PWA

- [ ] **PWA-01**: App installs on iOS and Android home screen
- [ ] **PWA-02**: Core functionality (dashboard, transaction logging, history) works fully offline
- [ ] **PWA-03**: App loads in under 2 seconds on a typical mobile connection

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
| BUDG-01 | TBD | Pending |
| BUDG-02 | TBD | Pending |
| BUDG-03 | TBD | Pending |
| BUDG-04 | TBD | Pending |
| BUDG-05 | TBD | Pending |
| BUDG-06 | TBD | Pending |
| ONBD-01 | TBD | Pending |
| TRAN-01 | TBD | Pending |
| TRAN-02 | TBD | Pending |
| TRAN-03 | TBD | Pending |
| TRAN-04 | TBD | Pending |
| TRAN-05 | TBD | Pending |
| TRAN-06 | TBD | Pending |
| DASH-01 | TBD | Pending |
| DASH-02 | TBD | Pending |
| DASH-03 | TBD | Pending |
| DASH-04 | TBD | Pending |
| DASH-05 | TBD | Pending |
| DASH-06 | TBD | Pending |
| DASH-07 | TBD | Pending |
| ANLX-01 | TBD | Pending |
| ANLX-02 | TBD | Pending |
| ANLX-03 | TBD | Pending |
| ANLX-04 | TBD | Pending |
| SETT-01 | TBD | Pending |
| SETT-02 | TBD | Pending |
| SETT-03 | TBD | Pending |
| PWA-01 | TBD | Pending |
| PWA-02 | TBD | Pending |
| PWA-03 | TBD | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 0 (populated during roadmap creation)
- Unmapped: 30 ⚠️

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 after initial definition*
