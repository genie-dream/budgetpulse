---
phase: 3
slug: transaction-logging
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.18 with jsdom |
| **Config file** | `vitest.config.mts` |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 0 | TRAN-01 | unit | `npm test -- --run tests/transactions.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 0 | TRAN-01 | unit | `npm test -- --run tests/transactions.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 0 | TRAN-02 | unit (RTL) | `npm test -- --run tests/AddPage.test.tsx` | ❌ W0 | ⬜ pending |
| 3-01-04 | 01 | 0 | TRAN-03 | unit (RTL) | `npm test -- --run tests/AddPage.test.tsx` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 0 | TRAN-04 | unit (RTL) | `npm test -- --run tests/SwipeToDelete.test.tsx` | ❌ W0 | ⬜ pending |
| 3-02-02 | 02 | 0 | TRAN-05 | unit (RTL) | `npm test -- --run tests/TransactionsPage.test.tsx` | ❌ W0 | ⬜ pending |
| 3-02-03 | 02 | 0 | TRAN-05 | unit | `npm test -- --run tests/transactions.test.ts` | ❌ W0 | ⬜ pending |
| 3-02-04 | 02 | 0 | TRAN-06 | unit (RTL) | `npm test -- --run tests/TransactionsPage.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/transactions.test.ts` — stubs for TRAN-01 Dexie writes, `groupByDate`, `smartDateLabel` helpers
- [ ] `tests/AddPage.test.tsx` — stubs for TRAN-02, TRAN-03 (RTL render tests with jsdom)
- [ ] `tests/SwipeToDelete.test.tsx` — stubs for TRAN-04 (touch event simulation)
- [ ] `tests/TransactionsPage.test.tsx` — stubs for TRAN-05, TRAN-06 (RTL with fake-indexeddb)

Note: All test infra (vitest, jsdom, fake-indexeddb, @testing-library/react) already installed. No new devDependencies needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Amount field auto-focuses on mount (iOS) | TRAN-03 | iOS autoFocus quirk requires real device | Open /add on iPhone, verify numeric keyboard appears immediately without tapping |
| 3-tap flow from main screen | TRAN-03 | Touch interaction sequence | From home: tap FAB → enter amount → tap category → tap Save |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
