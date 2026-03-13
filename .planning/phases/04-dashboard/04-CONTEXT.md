# Phase 4: Dashboard - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

The dashboard is the app's main screen — it answers "How much can I spend today?" by displaying the user's remaining monthly budget, Survival Budget figures, spending progress, and pace status. Real-time updates after every transaction are required. Analytics charts and settings management are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Hero number & layout
- **Remaining Budget is the hero** — the month's remaining budget is the dominant, largest number on screen
- Label below the hero number: "remaining this month"
- Progress bar is embedded inside the hero card, directly below the number and label
- Below the hero card: a **2-column stat grid** with 4 cards — Daily Survival Budget, Weekly Survival Budget, Total Spent, Remaining Days
- Visual hierarchy: hero card → 2×2 stat grid

### Progress bar
- Measures **spent vs variable budget** (0% at month start, 100% when variable budget is fully spent)
- Color **reacts to pace status**: green-500 when safe (paceRatio < 0.9), amber-400 when caution (0.9–1.1), red-500 when danger (≥ 1.1)
- Progress bar lives inside the hero card, not as a standalone section

### Pace indicator
- Lives as a **small pill/badge on the hero card** (corner placement)
- Labels: "Safe" / "Caution" / "Danger" with a matching colored dot
- At **danger** pace: badge turns red + remaining budget number turns red — no animation, no full-card color change (subtle treatment)
- At **caution** pace: badge turns amber
- At **safe** pace: badge is green or neutral (not alarming)

### Over-budget state (remainingBudget < 0)
- Hero number shows the **negative value in red** (e.g., -₩50,000) with an "Over budget" label replacing "remaining this month"
- Progress bar is fully filled and red (100% + danger color)
- Pace badge shows "Danger" in red
- Daily Survival Budget and Weekly Survival Budget stat cards both show **₩0** (clamped at 0, not negative)
- Total Spent and Remaining Days cards display normally

### Claude's Discretion
- Exact badge corner positioning (top-right vs top-left of hero card)
- Progress bar height and border-radius
- Spacing between hero card and 2-col grid
- Exact typography sizing for stat card labels vs values
- Loading/skeleton state while Zustand stores hydrate

</decisions>

<specifics>
## Specific Ideas

- The 4 stat cards in the 2-col grid: Daily Survival Budget (₩/day), Weekly Survival Budget (₩/week), Total Spent (₩), Remaining Days (N days)
- paceRatio formula: `totalSpent / (variableBudget * (daysElapsed / totalDaysInPeriod))` — already defined in PRD; thresholds are 0.9 / 1.1
- `calcDailySurvivalBudget` exists in `src/lib/budget.ts` — use directly; weekly = daily × 7
- `formatCurrency` in `src/lib/budget.ts` used for all monetary values
- Danger state: red is `red-500` consistent with the pace threshold color convention established in PROJECT.md

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/budget.ts`: `calcVariableBudget`, `getRemainingDaysInPeriod`, `calcDailySurvivalBudget`, `formatCurrency` — all ready to use, no new calculation logic needed except `paceRatio`
- `src/stores/budgetStore.ts`: `config` (income, fixedExpenses, savingsGoal) + `isOnboarded` — source of budget config
- `src/stores/transactionStore.ts`: `transactions` array (in-memory cache) — subscribe for real-time updates; `totalSpent` = sum of `transactions.amount` for current period
- `src/stores/settingsStore.ts`: `currency` — pass to `formatCurrency` for all amounts
- `src/components/layout/PageContainer.tsx`, `Header.tsx` — existing layout wrappers
- `src/app/page.tsx`: placeholder dashboard ready to replace

### Established Patterns
- Zustand `skipHydration: true` with `persist.onFinishHydration` + `persist.hasHydrated()` guard — use this pattern for `budgetStore` and `settingsStore` before rendering
- Dexie is source of truth; Zustand `transactionStore` is in-memory display cache — load current period transactions from Dexie on mount, hydrate store
- `formatCurrency(amount, currency)` for all monetary display
- `useTranslations` (next-intl) for all UI strings
- Mobile-first: touch targets ≥44×44px, safe area insets

### Integration Points
- Dashboard subscribes to `useTransactionStore` — after Phase 3, `addTransaction` and `removeTransaction` already update the in-memory store; dashboard just reads `transactions`
- `totalSpent` = filter transactions to current budget period, then sum amounts
- `remainingBudget` = `variableBudget − totalSpent`
- `paceRatio` = `totalSpent / (variableBudget × (daysElapsed / totalDaysInPeriod))` — new calculation to add to `budget.ts`
- Dashboard update < 100ms: because `transactionStore` is Zustand in-memory, subscribing to `transactions` means re-render happens synchronously on store update — no async Dexie fetch on each render

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-dashboard*
*Context gathered: 2026-03-13*
