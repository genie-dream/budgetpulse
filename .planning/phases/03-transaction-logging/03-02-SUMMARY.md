---
phase: 03-transaction-logging
plan: 02
subsystem: transaction-logging
tags: [add-page, category-chips, dexie, rtl-tests, i18n]
dependency_graph:
  requires: [03-01]
  provides: [add-transaction-page, CategoryChips-component]
  affects: [03-03-transactions-page]
tech_stack:
  added: []
  patterns: [skipHydration-hydration-guard, ios-autofocus-defer, tdd-red-green]
key_files:
  created:
    - src/components/transactions/CategoryChips.tsx
  modified:
    - src/app/add/page.tsx
    - tests/AddPage.test.tsx
    - messages/en.json
    - messages/ko.json
decisions:
  - CategoryChips is pure presentational (no i18n/locale prop) — labelEn only for v1; locale-aware labels deferred to later plan
  - settingsStore hydration guard uses persist.onFinishHydration + persist.hasHydrated() — consistent with onboarding page pattern
  - amount input uses type=text inputMode=numeric (not type=number) to avoid browser spinner arrows on mobile
  - tCommon used for back button label to avoid adding redundant key to add namespace
metrics:
  duration: ~10 minutes
  completed_date: "2026-03-13"
  tasks_completed: 2
  files_changed: 5
---

# Phase 3 Plan 02: Add Transaction Page Summary

**One-liner:** Full-screen add transaction form with CategoryChips component, numeric keyboard, 3-tap flow, Dexie persistence, and RTL tests replacing todo stubs.

---

## What Was Built

### CategoryChips Component (`src/components/transactions/CategoryChips.tsx`)

A horizontal scrollable chip row shared by Add and History pages:
- Renders a chip per category with emoji + labelEn
- `selected` prop drives bg-blue-500/text-white vs bg-slate-700/text-slate-300 visual state
- `showAll` prop prepends an 'All' chip (id: 'all') for History page filter use
- All chips meet 44px min-height touch target
- Container uses `overflow-x-auto` with `flex` (no wrapping)

### AddTransactionPage (`src/app/add/page.tsx`)

Full-screen transaction logging form:
- **Header:** ArrowLeft back button + "Add Transaction" title from i18n
- **Amount input:** `type="text" inputMode="numeric" pattern="[0-9]*"` with 50ms deferred auto-focus (iOS workaround)
- **Currency prefix:** ₩/$/¥ symbol sourced from settingsStore after hydration guard
- **CategoryChips row:** All 9 categories, pre-selects `lastUsedCategory` from transactionStore
- **Add details toggle:** ChevronDown/Up expands memo input + date picker
- **Save button:** Full-width blue, disabled when amount empty/zero
- **Save flow:** `await db.transactions.add(tx)` → `addTransaction(tx)` → `setLastUsedCategory()` → `router.push('/')`

### i18n Keys Added

Both `messages/en.json` and `messages/ko.json` — `add` namespace:
- `addDetails`: "Add details" / "상세 추가"
- `save`: "Save" / "저장"

(memo and date were already present)

### RTL Tests (`tests/AddPage.test.tsx`)

Replaced 4 `it.todo` stubs with 9 passing RTL tests covering:
- Chip count rendering (9 chips, 10 with showAll)
- All chip rendering with showAll prop
- Selected chip CSS classes
- Unselected chip CSS classes
- onSelect callback with correct category id
- onSelect callback with 'all' id
- Touch target min-h-[44px] on all chips
- Emoji + label display
- Container overflow-x-auto without flex-wrap

---

## Verification Results

- `npm run build` exits 0 — TypeScript clean, all 10 routes compiled
- `npm test -- --run` exits 0 — 53 tests pass, 5 todo (TransactionsPage placeholders for plan 03-03)
- `src/app/add/page.tsx` is 173 lines (minimum 80 required)
- `src/components/transactions/CategoryChips.tsx` exported and reusable
- `messages/en.json` and `messages/ko.json` updated with addDetails/save keys

---

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written with one minor deviation:

**1. [Rule 2 - Correctness] Used tCommon for back button label**
- **Found during:** Task 2
- **Issue:** `t('back')` referenced `add` namespace which has no `back` key; `common.back` already existed
- **Fix:** Added `tCommon = useTranslations('common')` and used `tCommon('back')` for the back button aria-label
- **Files modified:** src/app/add/page.tsx
- **Rationale:** Avoids redundant i18n key duplication; follows DRY principle

---

## Self-Check

- [x] `src/components/transactions/CategoryChips.tsx` — exists
- [x] `src/app/add/page.tsx` — 173 lines, full implementation
- [x] `tests/AddPage.test.tsx` — 9 tests passing
- [x] `messages/en.json` — addDetails + save keys present
- [x] `messages/ko.json` — addDetails + save keys present
- [x] Commit 83e15d1: feat(03-02): implement CategoryChips component with RTL tests
- [x] Commit 2cb9a25: feat(03-02): implement Add Transaction page with save flow and i18n

## Self-Check: PASSED
