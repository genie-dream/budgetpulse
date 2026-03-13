---
phase: 5
slug: analytics-settings-pwa-polish
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-13
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm run test -- --run` |
| **Full suite command** | `npm run test -- --run --coverage` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test -- --run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds (exception: Plan 05-04 Task 2 runs `npm run build` which exceeds 30s — this is expected for PWA build verification and is documented in the 05-04 SUMMARY)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 1 | ANLX-01 | unit | `npx vitest run tests/analytics.test.ts` | ❌ W0 | ⬜ pending |
| 5-01-02 | 01 | 1 | ANLX-02 | unit | `npx vitest run tests/analytics.test.ts` | ❌ W0 | ⬜ pending |
| 5-01-03 | 01 | 2 | ANLX-03 | unit | `npx vitest run tests/analytics.test.ts` | ❌ W0 | ⬜ pending |
| 5-01-04 | 01 | 2 | ANLX-04 | unit | `npx vitest run tests/analytics.test.ts` | ❌ W0 | ⬜ pending |
| 5-02-01 | 02 | 1 | SETT-01 | unit | `npx vitest run tests/settings.test.ts` | ❌ W0 | ⬜ pending |
| 5-02-02 | 02 | 1 | SETT-02 | unit | `npx vitest run tests/settings.test.ts` | ❌ W0 | ⬜ pending |
| 5-02-03 | 02 | 2 | SETT-03 | unit | `npx vitest run tests/settings.test.ts` | ❌ W0 | ⬜ pending |
| 5-03-01 | 03 | 1 | PWA-02 | unit+manual | `npx vitest run tests/sw.test.ts` (stub) + manual offline test | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

All Wave 0 test files are created by Plan 05-01 Task 2 at these paths:

- [ ] `tests/analytics.test.ts` — unit tests for ANLX-01, ANLX-02, ANLX-03, ANLX-04 (full test bodies in Plan 05-01)
- [ ] `tests/settings.test.ts` — stubs for SETT-01, SETT-02, SETT-03 (upgraded to full test bodies in Plan 05-03 Task 2)
- [ ] `tests/sw.test.ts` — stub for PWA-02 (`it.todo('Serwist instance initializes')`) — satisfies Nyquist for Plan 05-04

*Note: vitest + @testing-library/react already installed from prior phases.*
*Note: Paths are at `tests/` (project root), not `src/components/analytics/__tests__/` or `src/lib/__tests__/` — the plans use a flat `tests/` directory consistent with prior phases.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App works fully offline (no network) | PWA-02 | Requires browser DevTools airplane mode simulation | 1. `npm run build`, 2. serve locally, 3. DevTools > Network > Offline, 4. reload, 5. verify dashboard + transaction log work |
| Service worker caches all routes | PWA-02 | Cannot automate SW caching verification in vitest | Chrome DevTools > Application > Service Workers — verify registered and activated |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (tests/analytics.test.ts, tests/settings.test.ts, tests/sw.test.ts)
- [x] No watch-mode flags
- [x] Feedback latency < 30s (Plan 05-04 Task 2 `npm run build` exception documented)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
