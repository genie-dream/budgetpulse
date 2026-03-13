---
phase: 06-tech-debt-fix
plan: 01
subsystem: ui
tags: [pretendard, next-font-local, i18n, next-intl, pwa, woff2]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: layout.tsx with font configuration and PWA scaffold
  - phase: 03-transaction-logging
    provides: transactions/page.tsx with history UI
provides:
  - Self-hosted Pretendard Variable font at public/fonts/PretendardVariable.woff2
  - layout.tsx using next/font/local (offline-capable, correct Korean typeface)
  - transactions/page.tsx wired to useTranslations('history') for title/empty/logFirst keys
  - TransactionsPage.test.tsx with next-intl vi.mock lookup-map stub
affects: [pwa-offline, i18n-expansion, future-locale-additions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Self-hosted variable font via next/font/local with weight range syntax
    - vi.mock('next-intl') lookup-map pattern for RTL tests (matches dashboard.test.tsx)

key-files:
  created:
    - public/fonts/PretendardVariable.woff2
  modified:
    - src/app/layout.tsx
    - src/app/transactions/page.tsx
    - tests/TransactionsPage.test.tsx

key-decisions:
  - "Pretendard v1.3.9 ships as zip only (no standalone woff2) — extracted web/variable/woff2/PretendardVariable.woff2 from zip"
  - "next/font/local src path is relative to layout.tsx: ../../public/fonts/PretendardVariable.woff2"
  - "vi.mock('next-intl') lookup-map style (not key => key passthrough) ensures existing English text assertions keep passing unchanged"
  - "All three History string occurrences replaced: loading state h1, empty state h1, populated state h1"

patterns-established:
  - "next-intl test mock: lookup-map keyed to namespace keys, fallback to key name for unknown keys"

requirements-completed: [PWA-03, TRAN-05, TRAN-06]

# Metrics
duration: 3min
completed: 2026-03-14
---

# Phase 6 Plan 1: Pretendard Font + Transaction i18n Summary

**Self-hosted Pretendard Variable woff2 replaces Inter Google Fonts, and three hardcoded English strings in transactions/page.tsx wired to next-intl useTranslations('history') — 106 tests passing.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-14T01:16:12Z
- **Completed:** 2026-03-14T01:18:42Z
- **Tasks:** 2
- **Files modified:** 3 (+ 1 created)

## Accomplishments

- Downloaded PretendardVariable.woff2 (2MB) from Pretendard v1.3.9 zip and placed at public/fonts/
- Replaced Inter (next/font/google) with localFont (next/font/local) in RootLayout — enables offline font loading for PWA
- Wired useTranslations('history') in transactions/page.tsx replacing all three 'History', 'No transactions yet', and 'Log your first one' hardcoded strings
- Added vi.mock('next-intl') with lookup-map stub to TransactionsPage.test.tsx so existing assertions remain valid

## Task Commits

1. **Task 1: Install Pretendard font and update layout.tsx** - `8b88bd3` (feat)
2. **Task 2: Wire i18n in transactions/page.tsx + fix test mock** - `961bdad` (feat)

## Files Created/Modified

- `public/fonts/PretendardVariable.woff2` - Pretendard Variable font binary for self-hosted serving
- `src/app/layout.tsx` - Switched from Inter (next/font/google) to localFont with Pretendard woff2
- `src/app/transactions/page.tsx` - Added useTranslations('history'); t('title'), t('empty'), t('logFirst') replace hardcoded strings
- `tests/TransactionsPage.test.tsx` - Added vi.mock('next-intl') with lookup-map stub before page import

## Decisions Made

- Pretendard v1.3.9 GitHub release provides only zip bundles, not individual woff2 files. Downloaded zip, extracted `web/variable/woff2/PretendardVariable.woff2` (the variable-weight subset).
- `src` path in `localFont()` is relative to the file calling it (src/app/layout.tsx), so `../../public/fonts/PretendardVariable.woff2` correctly resolves to project root.
- vi.mock lookup-map pattern (rather than `(key) => key` passthrough) is required so tests that check 'History', 'No transactions yet', and 'Log your first one' continue to pass against actual English strings from the map — avoids having to update test assertions.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] GitHub release URL was 404 — used zip extraction instead**
- **Found during:** Task 1 (font download)
- **Issue:** Plan specified direct woff2 URL but Pretendard v1.3.9 only distributes zip archives; curl returned "Not Found" (9 bytes)
- **Fix:** Downloaded full zip (45MB) via GitHub API asset URL, extracted `web/variable/woff2/PretendardVariable.woff2` with `unzip -j`, copied to project
- **Files modified:** public/fonts/PretendardVariable.woff2
- **Verification:** File is 2.0MB (valid woff2 binary), TypeScript compiles cleanly
- **Committed in:** 8b88bd3 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — wrong download URL)
**Impact on plan:** Font was successfully installed; all plan criteria met. No scope creep.

## Issues Encountered

The direct woff2 URL documented in the plan (`/releases/download/v1.3.9/PretendardVariable.woff2`) does not exist — Pretendard v1.3.9 only ships zip archives. Resolved via zip extraction without blocking task completion.

## User Setup Required

None - no external service configuration required. Font is committed to the repository.

## Next Phase Readiness

- Phase 6 Plan 1 complete: Pretendard font self-hosted, transactions i18n wired
- 106 tests passing, 0 TypeScript errors
- Ready for remaining Phase 6 tech debt plans

---
*Phase: 06-tech-debt-fix*
*Completed: 2026-03-14*

## Self-Check: PASSED

- public/fonts/PretendardVariable.woff2: FOUND
- src/app/layout.tsx: FOUND
- src/app/transactions/page.tsx: FOUND
- tests/TransactionsPage.test.tsx: FOUND
- 06-01-SUMMARY.md: FOUND
- Commit 8b88bd3: FOUND
- Commit 961bdad: FOUND
