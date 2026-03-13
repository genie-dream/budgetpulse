---
phase: 06-tech-debt-fix
plan: 02
subsystem: transaction-add, settings
tags: [dash-07, period-filter, named-export, tech-debt]
dependency_graph:
  requires: []
  provides: [DASH-07-fix, BudgetEditForm-named-export]
  affects: [dashboard-totalSpent-accuracy, settings-import-consistency]
tech_stack:
  added: []
  patterns: [period-aware-store-update, call-site-filter, named-export]
key_files:
  created: []
  modified:
    - src/app/add/page.tsx
    - tests/transactions.test.ts
    - src/components/settings/BudgetEditForm.tsx
    - src/app/settings/page.tsx
decisions:
  - DASH-07 filter lives at call site in handleSave (not in store) — store remains neutral and unfiltered
  - Defensive fallback: new Date(0) epoch when config is null — includes all transactions until budget is configured
  - Named export aligns BudgetEditForm with plan 05-03 spec for import consistency across the settings module
metrics:
  duration_seconds: 139
  completed_date: "2026-03-13"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Phase 06 Plan 02: DASH-07 Period Filter + BudgetEditForm Named Export Summary

JWT-style period-aware transaction guard in add/page.tsx plus BudgetEditForm default-to-named export alignment.

## What Was Built

**Task 1: DASH-07 — Period-aware addTransaction in add/page.tsx**

Added a period filter at the call site in `handleSave` so that backdated transactions (with a date before the current budget period start) are persisted to IndexedDB but do NOT update the in-memory Zustand transaction store. This prevents `totalSpent` on the dashboard from being inflated by backdated entries within the same session.

The store itself remains unfiltered (neutral by design). The filter is applied only at the call site:
```
if (tx.date >= periodStart) {
  useTransactionStore.getState().addTransaction(tx)
}
```

A new test in `tests/transactions.test.ts` documents this architectural contract: the store is neutral (accepts any date when called directly), confirming that the filtering responsibility lies with the caller.

**Task 2: BudgetEditForm named export alignment**

Changed `BudgetEditForm` from `export default function` to `export function` (named export), and updated the corresponding import in `settings/page.tsx` from a default import to a named import. This aligns with the plan 05-03 spec and consistent codebase naming conventions.

## Verification

- `npx vitest run`: 106 tests passing, 1 skipped (sw.test.ts — intentional), 0 failures
- `npx tsc --noEmit`: exits 0, no errors
- `add/page.tsx` contains `getPeriodStartDate` import and the `tx.date >= periodStart` guard
- `BudgetEditForm.tsx`: `export function BudgetEditForm` (no `default`)
- `settings/page.tsx`: `import { BudgetEditForm } from '@/components/settings/BudgetEditForm'`

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 91b3122 | feat(06-02): DASH-07 period-aware addTransaction in add/page.tsx |
| 2 | 66899a3 | refactor(06-02): BudgetEditForm default export to named export |

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

Files exist:
- src/app/add/page.tsx: FOUND
- tests/transactions.test.ts: FOUND
- src/components/settings/BudgetEditForm.tsx: FOUND
- src/app/settings/page.tsx: FOUND

Commits exist:
- 91b3122: FOUND
- 66899a3: FOUND
