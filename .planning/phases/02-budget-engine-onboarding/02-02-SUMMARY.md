---
phase: 02-budget-engine-onboarding
plan: "02"
subsystem: stores
tags: [zustand, dexie, currency, settings, persistence]
dependency_graph:
  requires: [src/types/index.ts, src/lib/db.ts]
  provides: [src/stores/settingsStore.ts, tests/db.test.ts]
  affects: [src/stores/settingsStore.ts, tests/db.test.ts, tests/setup.ts, vitest.config.mts]
tech_stack:
  added: []
  patterns: [zustand-persist, dexie-put-upsert, jsdom-localStorage-mock]
key_files:
  created: [tests/settingsStore.test.ts]
  modified: [src/stores/settingsStore.ts, tests/db.test.ts, tests/setup.ts, vitest.config.mts]
decisions:
  - jsdom localStorage mock added to tests/setup.ts — jsdom without a URL throws SecurityError; mock ensures persist middleware works in all test files
  - vitest.config.mts environmentOptions.jsdom.url set to 'http://localhost' for belt-and-suspenders coverage
  - setCurrency action uses shallow-merge pattern consistent with setLanguage/setTheme
  - db.budgetConfigs.put() (upsert) confirmed correct over add() per RESEARCH.md
metrics:
  duration: "4m 10s"
  completed: "2026-03-10"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 5
---

# Phase 2 Plan 02: Settings Currency Extension and BudgetConfig Persistence Summary

**One-liner:** Extended settingsStore with currency: CurrencyCode (default KRW) + setCurrency action, and verified BudgetConfig with fixedExpenses roundtrips correctly through Dexie put/get.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend settingsStore with currency field | b0a6c88 | src/stores/settingsStore.ts, tests/settingsStore.test.ts, tests/setup.ts, vitest.config.mts |
| 2 | Extend db.test.ts with BudgetConfig persistence test | c0d87f1 | tests/db.test.ts |

---

## What Was Built

### Task 1: settingsStore currency extension

`src/stores/settingsStore.ts` now exports a `useSettingsStore` with:
- `currency: CurrencyCode` — default `'KRW'`, persisted under existing `'budgetpulse-settings'` key
- `setCurrency(currency: CurrencyCode): void` — updates and persists the currency

Backward-compatible: Zustand persist shallow-merges stored state with initial state, so existing users without the `currency` key receive `'KRW'` as default.

### Task 2: BudgetConfig persistence test

`tests/db.test.ts` has a new `'BudgetConfig persistence'` describe block with one test:
- `'can write and read a BudgetConfig with fixedExpenses'` — writes a full BudgetConfig (income, fixedExpenses array, savingsGoal=0, currency) via `db.budgetConfigs.put()` and verifies each field is retrieved correctly.

---

## Test Results

```
Test Files  5 passed (5)
Tests       36 passed (36)
```

All pre-existing tests continue to pass. Two new test files/blocks added (3 + 1 = 4 new test cases).

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] jsdom localStorage unavailable for Zustand persist middleware in tests**

- **Found during:** Task 1 — settingsStore tests
- **Issue:** jsdom without a URL throws `SecurityError: localStorage is not available for opaque origins`. This caused `storage.setItem is not a function` when Zustand's persist middleware tried to write state changes in tests.
- **Fix:** Added a functional `localStorage` mock to `tests/setup.ts` (which runs before any test module imports). Also added `environmentOptions.jsdom.url: 'http://localhost'` to `vitest.config.mts` as belt-and-suspenders.
- **Files modified:** `tests/setup.ts`, `vitest.config.mts`
- **Commit:** b0a6c88

---

## Decisions Made

1. **jsdom localStorage mock in setup.ts** — Centralized mock ensures all current and future tests that touch Zustand persist stores work without per-file workarounds.
2. **db.budgetConfigs.put() over add()** — Confirmed per RESEARCH.md open question: upsert semantics are correct for onboarding wizard that may re-save config.
3. **currency field backward-compatible** — No persist migration needed; Zustand's shallow merge handles the missing-key case gracefully.

---

## Self-Check: PASSED

Files created/modified:
- FOUND: /Users/genie-dream/projects/budget/src/stores/settingsStore.ts
- FOUND: /Users/genie-dream/projects/budget/tests/settingsStore.test.ts
- FOUND: /Users/genie-dream/projects/budget/tests/db.test.ts
- FOUND: /Users/genie-dream/projects/budget/tests/setup.ts
- FOUND: /Users/genie-dream/projects/budget/vitest.config.mts

Commits verified:
- b0a6c88: feat(02-02): extend settingsStore with currency field and setCurrency action
- c0d87f1: feat(02-02): extend db.test.ts with BudgetConfig persistence test
