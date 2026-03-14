# Milestones

## v1.1 BudgetPulse MVP (Shipped: 2026-03-14)

**Phases completed:** 6 phases, 23 plans
**Timeline:** 2026-03-09 → 2026-03-14 (5 days)
**Codebase:** ~2,895 TypeScript lines across 54 files
**Tests:** 106 passing, 1 intentional skip
**Requirements:** 30/30 v1 requirements shipped

**Key accomplishments:**
1. Next.js 16 PWA scaffold with Dexie.js IndexedDB, Zustand stores, next-intl i18n, and 5-tab app shell with iPhone Safe Area support
2. Pure Survival Budget engine (calcVariableBudget, getRemainingDaysInPeriod, calcPaceRatio) + 3-step onboarding wizard with live budget preview and SwipeToDelete
3. 3-tap mobile transaction logging with numeric keypad, category chips, date-grouped history, and swipe-to-delete — human-verified on device
4. Real-time dashboard: Survival Budget display, spending pace indicator (safe/caution/danger), over-budget state — all 7 DASH requirements human-verified
5. Analytics charts (Recharts donut + bar), settings budget edit, JSON backup/restore, and Serwist PWA offline support (43KB service worker)
6. Tech debt closure: Pretendard self-hosted font, i18n wiring, period-aware backdated transaction guard, BudgetEditForm named export

**Audit:** v1.1 — tech_debt (29/30 req satisfied; PWA-01 browser verification pending; 14 non-blocking items)

---

