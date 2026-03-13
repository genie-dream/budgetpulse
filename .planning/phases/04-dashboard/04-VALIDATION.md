---
phase: 4
slug: dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.18 + @testing-library/react ^16.3.2 |
| **Config file** | `vitest.config.mts` |
| **Quick run command** | `npx vitest run tests/budget.test.ts tests/dashboard.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/budget.test.ts tests/dashboard.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 0 | DASH-05 | unit (pure fn) | `npx vitest run tests/budget.test.ts` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 0 | DASH-01, DASH-02, DASH-03, DASH-06 | unit (RTL) | `npx vitest run tests/dashboard.test.ts` | ❌ W0 | ⬜ pending |
| 4-01-03 | 01 | 0 | DASH-01–DASH-06 | i18n setup | `npx vitest run` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 1 | DASH-01 | unit (RTL) | `npx vitest run tests/dashboard.test.ts` | ❌ W0 | ⬜ pending |
| 4-02-02 | 02 | 1 | DASH-05 | unit (RTL) | `npx vitest run tests/dashboard.test.ts` | ❌ W0 | ⬜ pending |
| 4-02-03 | 02 | 1 | DASH-06 | unit (RTL) | `npx vitest run tests/dashboard.test.ts` | ❌ W0 | ⬜ pending |
| 4-03-01 | 03 | 2 | DASH-02, DASH-03, DASH-04 | unit (RTL) | `npx vitest run tests/dashboard.test.ts` | ❌ W0 | ⬜ pending |
| 4-04-01 | 04 | 3 | DASH-01–DASH-06 | integration (RTL) | `npx vitest run` | ❌ W0 | ⬜ pending |
| 4-04-02 | 04 | 3 | DASH-07 | architectural | N/A — Zustand synchronous guarantee | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/dashboard.test.ts` — stubs for DASH-01, DASH-02, DASH-03, DASH-05, DASH-06
- [ ] `src/lib/budget.ts` — add `calcPaceRatio`, `getPaceStatus`, `getPeriodStartDate` functions (needed by component and tests)
- [ ] `messages/en.json` and `messages/ko.json` — add dashboard i18n keys under `"home"` namespace (prevents RTL warnings during test render)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dashboard updates < 100ms after transaction save | DASH-07 | Zustand synchronous re-render — architectural guarantee, no timing test needed | Navigate to dashboard, add a transaction, verify values refresh immediately without visible delay |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
