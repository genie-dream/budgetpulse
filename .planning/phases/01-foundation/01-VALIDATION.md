---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test -- --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run test -- --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | PWA-01 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | PWA-01 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 2 | PWA-03 | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 2 | PWA-03 | unit | `npm run test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/setup.ts` — test setup with fake-indexeddb
- [ ] `vitest.config.ts` — vitest configuration for Next.js
- [ ] `npm install --save-dev vitest @vitejs/plugin-react fake-indexeddb` — install test infrastructure

*Wave 0 must be completed before any automated task verification runs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PWA installability prompt appears | PWA-01 | Requires real browser + HTTPS | Open Chrome DevTools > Application > Manifest; verify installable |
| Lighthouse PWA audit passes | PWA-01 | Requires deployed environment | Run Lighthouse on Vercel preview URL |
| iOS/Android install banner appears | PWA-01 | Device-specific behavior | Test on real device or BrowserStack |
| Page load < 2s on mobile | PWA-01 | Network simulation needed | Chrome DevTools > Lighthouse > Performance |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
