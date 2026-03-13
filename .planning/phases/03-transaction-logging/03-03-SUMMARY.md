---
phase: 03-transaction-logging
plan: 03
subsystem: transactions-ui
tags: [transactions, history, filtering, swipe-delete, tdd]
dependency_graph:
  requires: [03-01, 03-02]
  provides: [transactions-history-page, transaction-row-component, date-group-header-component]
  affects: [phase-04-dashboard]
tech_stack:
  added: []
  patterns: [swipe-to-delete-wrapper, in-memory-filter, page-owned-delete-handler, tdd-red-green]
key_files:
  created:
    - src/components/transactions/TransactionRow.tsx
    - src/components/transactions/DateGroupHeader.tsx
  modified:
    - src/app/transactions/page.tsx
    - tests/TransactionsPage.test.tsx
    - messages/en.json
    - messages/ko.json
decisions:
  - TransactionRow receives onDelete as prop from page — no Dexie or store calls inside the component
  - Category filter chips derive usedCategories from in-memory store — no Dexie re-fetch on chip tap
  - Daily total header shows same currency value as transaction rows (both rendered at same time)
  - Test mock uses mutable _txStore.value object to allow per-test db control without vi.fn() hoisting issues
  - Delete button always in DOM with opacity:0 style (SwipeToDelete pattern from Phase 2)
metrics:
  duration_seconds: 318
  completed_date: "2026-03-13"
  tasks_completed: 2
  files_modified: 6
---

# Phase 3 Plan 3: Transaction History Page Summary

Transaction history page with date grouping, sticky headers, daily totals, category filter chips, and swipe-to-delete — replacing the placeholder at `/transactions`.

## What Was Built

### TransactionRow component (`src/components/transactions/TransactionRow.tsx`)
Single transaction row that wraps SwipeToDelete. Receives `onDelete: () => void` as a prop from the page — no direct Dexie or store access inside the component. Shows category emoji circle, label, optional memo, formatted currency amount, and time-of-day.

### DateGroupHeader component (`src/components/transactions/DateGroupHeader.tsx`)
Sticky section header for each date group. Uses `smartDateLabel()` for "Today" / "Yesterday" / formatted date label, and `formatCurrency()` for the right-side daily total.

### TransactionsPage (`src/app/transactions/page.tsx`)
Full replacement for the placeholder. Key behaviors:
- Loads transactions from Dexie on mount via `db.transactions.orderBy('date').reverse().toArray()` and populates `transactionStore`
- In-memory filtering: `selectedCategory` state + `transactions.filter()` — no Dexie re-fetch on chip tap
- `usedCategories` derived from current store transactions for dynamic chip list
- `handleDelete` owned by page: deletes from Dexie then calls `removeTransaction` on store
- Empty state: Receipt icon + "No transactions yet" + Link to `/add`

### i18n keys
Added `logFirst`, `today`, `yesterday`, `all` to `history` namespace in `messages/en.json` and `messages/ko.json`.

### Tests (`tests/TransactionsPage.test.tsx`)
Replaced all `it.todo` stubs with 5 real RTL tests covering TRAN-04, TRAN-05, TRAN-06:
1. Empty state renders with CTA link to `/add`
2. Date grouping shows "Today" and "Yesterday" headers
3. Daily total appears in date group header
4. Category chip filter removes non-matching transaction amounts
5. Swipe gesture reveals delete button

## Decisions Made

- **Page-owned delete handler**: `TransactionRow` receives `onDelete: () => void` as a prop. The page creates `() => handleDelete(tx.id)` and passes it. This keeps the component purely presentational.
- **In-memory filter**: `usedCategories` derived from `transactions.map(tx => tx.category)` with dedup. `filtered` computed via `transactions.filter()`. No Dexie calls on chip tap per RESEARCH.md Pitfall 5.
- **Test mock pattern**: `_txStore.value` mutable object allows per-test control without triggering vitest hoisting issues with `vi.fn()` references inside `vi.mock()` factories.
- **Daily total shown with same currency as rows**: Both use `resolvedCurrency` which defaults to `'KRW'` before settingsStore hydration — consistent display.

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

**Test refinements (not deviations):**
- Amount text appears in both transaction row and daily total header — tests use `getAllByText` for ambiguous queries
- Category chip text includes emoji prefix — filter uses `textContent.includes()` not strict equality
- Dexie mock uses mutable object instead of module-level `vi.fn()` to avoid hoisting reference error

## Self-Check

Files verified to exist:
- src/components/transactions/TransactionRow.tsx: FOUND
- src/components/transactions/DateGroupHeader.tsx: FOUND
- src/app/transactions/page.tsx: FOUND (full implementation)
- tests/TransactionsPage.test.tsx: FOUND (5 real tests)
- messages/en.json: FOUND (history.logFirst, today, yesterday, all added)
- messages/ko.json: FOUND (matching Korean translations added)

Commits verified:
- 7a795be: feat(03-03): add TransactionRow and DateGroupHeader components
- f6ea461: test(03-03): add failing RTL tests for TransactionsPage (TRAN-04, TRAN-05, TRAN-06)
- eee16c2: feat(03-03): implement TransactionHistory page with filter and i18n keys

Test results: 58/58 pass, `npm run build` exits 0.

## Self-Check: PASSED
