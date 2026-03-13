---
phase: 6
slug: tech-debt-fix
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @testing-library/react |
| **Config file** | `vitest.config.mts` |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green + `npx tsc --noEmit` clean
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 6-01-01 | 01 | 0 | PWA-03 | file-exists smoke | `test -f public/fonts/PretendardVariable.woff2` | ❌ W0 | ⬜ pending |
| 6-01-02 | 01 | 1 | PWA-03 | build gate | `npx next build` | N/A | ⬜ pending |
| 6-02-01 | 02 | 0 | TRAN-05/06 | unit (RTL) | `npx vitest run tests/TransactionsPage.test.tsx` | ❌ W0 (needs mock) | ⬜ pending |
| 6-02-02 | 02 | 1 | TRAN-05/06 | unit (RTL) | `npx vitest run tests/TransactionsPage.test.tsx` | ✅ | ⬜ pending |
| 6-03-01 | 03 | 0 | DASH-07 | unit (store) | `npx vitest run tests/transactions.test.ts` | ❌ W0 | ⬜ pending |
| 6-03-02 | 03 | 1 | DASH-07 | unit (store) | `npx vitest run tests/transactions.test.ts` | ✅ | ⬜ pending |
| 6-04-01 | 04 | 1 | - | TypeScript compile | `npx tsc --noEmit` | N/A | ⬜ pending |
| 6-04-02 | 04 | 1 | - | unit | `npx vitest run tests/settings.test.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/TransactionsPage.test.tsx` — add `vi.mock('next-intl', ...)` stub (blocks TRAN-05/TRAN-06 fix)
- [ ] `tests/transactions.test.ts` — add backdated transaction filter unit test (covers DASH-07)
- [ ] `public/fonts/PretendardVariable.woff2` — download font file before PWA-03 smoke test

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Korean UI renders in Pretendard | PWA-03 | Visual font rendering check | Switch language to 한국어, inspect headers for Pretendard typeface |
| App loads < 2s on mobile (simulated) | PWA-03 | Performance perception | Chrome DevTools → Network throttle to "Slow 4G", reload, check LCP |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
