---
phase: 5
slug: analytics-settings-pwa-polish
status: draft
nyquist_compliant: false
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
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 1 | ANLX-01 | unit | `npm run test -- --run src/components/analytics` | ❌ W0 | ⬜ pending |
| 5-01-02 | 01 | 1 | ANLX-02 | unit | `npm run test -- --run src/components/analytics` | ❌ W0 | ⬜ pending |
| 5-01-03 | 01 | 2 | ANLX-03 | unit | `npm run test -- --run src/components/analytics` | ❌ W0 | ⬜ pending |
| 5-01-04 | 01 | 2 | ANLX-04 | unit | `npm run test -- --run src/lib/analytics` | ❌ W0 | ⬜ pending |
| 5-02-01 | 02 | 1 | SETT-01 | unit | `npm run test -- --run src/components/settings` | ❌ W0 | ⬜ pending |
| 5-02-02 | 02 | 1 | SETT-02 | unit | `npm run test -- --run src/components/settings` | ❌ W0 | ⬜ pending |
| 5-02-03 | 02 | 2 | SETT-03 | unit | `npm run test -- --run src/lib/export` | ❌ W0 | ⬜ pending |
| 5-03-01 | 03 | 1 | PWA-02 | manual | N/A — requires offline browser test | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/analytics/__tests__/AnalyticsPage.test.tsx` — stubs for ANLX-01, ANLX-02, ANLX-03, ANLX-04
- [ ] `src/components/settings/__tests__/SettingsPage.test.tsx` — stubs for SETT-01, SETT-02, SETT-03
- [ ] `src/lib/__tests__/export.test.ts` — stubs for SETT-03 (export/import)
- [ ] `src/lib/__tests__/analyticsQueries.test.ts` — stubs for ANLX-04 month navigation

*Note: vitest + @testing-library/react already installed from prior phases.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App works fully offline (no network) | PWA-02 | Requires browser DevTools airplane mode simulation | 1. `npm run build`, 2. serve locally, 3. DevTools > Network > Offline, 4. reload, 5. verify dashboard + transaction log work |
| Service worker caches all routes | PWA-02 | Cannot automate SW caching verification in vitest | Chrome DevTools > Application > Service Workers — verify registered and activated |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
