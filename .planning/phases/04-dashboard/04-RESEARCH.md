# Phase 4: Dashboard - Research

**Researched:** 2026-03-13
**Domain:** React/Next.js component composition, Zustand reactive state, real-time UI updates
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hero number & layout**
- Remaining Budget is the hero — the month's remaining budget is the dominant, largest number on screen
- Label below the hero number: "remaining this month"
- Progress bar is embedded inside the hero card, directly below the number and label
- Below the hero card: a 2-column stat grid with 4 cards — Daily Survival Budget, Weekly Survival Budget, Total Spent, Remaining Days
- Visual hierarchy: hero card → 2×2 stat grid

**Progress bar**
- Measures spent vs variable budget (0% at month start, 100% when variable budget is fully spent)
- Color reacts to pace status: green-500 when safe (paceRatio < 0.9), amber-400 when caution (0.9–1.1), red-500 when danger (>= 1.1)
- Progress bar lives inside the hero card, not as a standalone section

**Pace indicator**
- Lives as a small pill/badge on the hero card (corner placement)
- Labels: "Safe" / "Caution" / "Danger" with a matching colored dot
- At danger pace: badge turns red + remaining budget number turns red — no animation, no full-card color change (subtle treatment)
- At caution pace: badge turns amber
- At safe pace: badge is green or neutral (not alarming)

**Over-budget state (remainingBudget < 0)**
- Hero number shows the negative value in red (e.g., -₩50,000) with an "Over budget" label replacing "remaining this month"
- Progress bar is fully filled and red (100% + danger color)
- Pace badge shows "Danger" in red
- Daily Survival Budget and Weekly Survival Budget stat cards both show ₩0 (clamped at 0, not negative)
- Total Spent and Remaining Days cards display normally

### Claude's Discretion
- Exact badge corner positioning (top-right vs top-left of hero card)
- Progress bar height and border-radius
- Spacing between hero card and 2-col grid
- Exact typography sizing for stat card labels vs values
- Loading/skeleton state while Zustand stores hydrate

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | Dashboard shows variable budget, total spent, remaining budget with progress bar | Hero card pattern; Zustand subscription; calcVariableBudget exists |
| DASH-02 | Dashboard shows daily Survival Budget (remaining budget ÷ remaining days) | calcDailySurvivalBudget exists in budget.ts; clamped at 0 for over-budget |
| DASH-03 | Dashboard shows weekly Survival Budget (daily × 7) | Derived from DASH-02 result; same clamp applies |
| DASH-04 | Dashboard shows remaining days in the current budget month | getRemainingDaysInPeriod exists; reads monthStartDay from budgetStore config |
| DASH-05 | Dashboard shows Spending Pace status: safe/caution/danger | New calcPaceRatio function needed in budget.ts; thresholds 0.9/1.1 locked |
| DASH-06 | Dashboard shows over-budget state when remainingBudget < 0 | Conditional rendering; survival values clamped to 0; label swap |
| DASH-07 | Dashboard updates in < 100ms after a transaction is saved | Zustand in-memory store subscription — synchronous re-render; no async Dexie fetch per render |
</phase_requirements>

---

## Summary

Phase 4 is a pure UI composition phase. All domain logic functions already exist in `src/lib/budget.ts` — the only new calculation needed is `calcPaceRatio`. The dashboard subscribes to two Zustand stores (`budgetStore` and `transactionStore`) and derives all displayed values synchronously from in-memory state. Because `transactionStore` has no `persist` middleware, every `addTransaction` / `removeTransaction` call triggers an immediate React re-render — DASH-07 (< 100ms update) is satisfied architecturally without any special optimization.

The component tree for this phase is shallow: one page component (`src/app/page.tsx`) housing two presentational sub-components — a `HeroCard` and a `StatGrid`. No new routing, no new stores, no Dexie interaction at render time. The only async work happens once on mount: loading the current-period transactions from Dexie into the `transactionStore` (mirrors the existing pattern from `transactions/page.tsx`).

i18n string keys for dashboard labels do not yet exist in `messages/en.json` and `messages/ko.json`; a Wave 0 gap task must add them before component implementation begins.

**Primary recommendation:** Replace `src/app/page.tsx` placeholder with full dashboard UI. Compose two new presentational components (`HeroCard`, `StatGrid`). Add `calcPaceRatio` to `budget.ts`. Add i18n keys to both message files. Mirror the hydration guard and Dexie-on-mount patterns from `transactions/page.tsx`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19 | 19.2.3 | Component model | Project baseline |
| Next.js | 16.1.6 | App Router page | Project baseline |
| Zustand | ^5.0.11 | Reactive state subscriptions | Established; `useTransactionStore`, `useBudgetStore`, `useSettingsStore` already in use |
| Tailwind CSS v4 | ^4 | Utility-class styling | Project baseline; dark-mode via `data-theme="dark"` |
| next-intl | ^4.8.3 | UI string translations | All UI strings go through `useTranslations` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | ^0.577.0 | Icon for pace dot or badge decoration | Only if a small decorative icon is needed; not required |
| Dexie | ^4.3.0 | One-time on-mount transaction load | Same pattern as TransactionsPage — load current period from Dexie once, then rely on Zustand cache |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand subscription for real-time updates | Polling or Dexie live queries | Zustand is already the in-memory cache; Dexie live queries would add unnecessary complexity and latency |
| Native CSS progress bar (div with width%) | `<progress>` HTML element | Native `<progress>` has poor cross-browser style control; a `div` with `style={{ width: pct+'%' }}` is the established mobile pattern and matches the color-reactivity requirement |

**Installation:** No new packages needed for this phase.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   └── page.tsx                    # Dashboard page (replace placeholder)
├── components/
│   └── dashboard/
│       ├── HeroCard.tsx            # Hero card: remaining budget + progress bar + pace badge
│       └── StatGrid.tsx            # 2×2 grid: daily/weekly survival, total spent, remaining days
└── lib/
    └── budget.ts                   # Add: calcPaceRatio
messages/
├── en.json                         # Add dashboard keys
└── ko.json                         # Add dashboard keys
tests/
└── dashboard.test.ts               # Unit: calcPaceRatio; integration: DashboardPage render
```

### Pattern 1: Hydration Guard + Dexie On-Mount

**What:** On mount, wait for persisted stores (budgetStore, settingsStore) to finish hydration, then load current-period transactions from Dexie into transactionStore.
**When to use:** Any page that reads persisted Zustand stores with `skipHydration: true`.

```typescript
// Established project pattern — mirrors src/app/transactions/page.tsx
useEffect(() => {
  const unsub = useBudgetStore.persist.onFinishHydration(() => setBudgetHydrated(true))
  if (useBudgetStore.persist.hasHydrated()) setBudgetHydrated(true)
  return unsub
}, [])

useEffect(() => {
  const unsub = useSettingsStore.persist.onFinishHydration(() => setSettingsHydrated(true))
  if (useSettingsStore.persist.hasHydrated()) setSettingsHydrated(true)
  return unsub
}, [])

// Load current-period transactions once
useEffect(() => {
  if (!budgetHydrated || !config) return
  const periodStart = getPeriodStart(new Date(), config.monthStartDay)
  db.transactions
    .where('date').aboveOrEqual(periodStart)
    .toArray()
    .then((txns) => useTransactionStore.getState().setTransactions(txns))
}, [budgetHydrated, config])
```

**Note:** The dashboard must filter transactions to the current budget period (not all-time). The period start date is derived from `monthStartDay` and today's date. `transactions/page.tsx` loads all transactions — dashboard must scope to the current period.

### Pattern 2: Pure Derivation from Zustand Snapshot

**What:** All dashboard numbers derive synchronously from the Zustand store snapshot on each render. No `useMemo` required given calculation complexity is O(n) over a month's transactions (typically < 200 items).
**When to use:** When displayed values are derived from in-memory state and recalculation is cheap.

```typescript
const transactions = useTransactionStore((s) => s.transactions)
const config = useBudgetStore((s) => s.config)
const currency = useSettingsStore((s) => s.currency)

// All values derived synchronously — triggers re-render when transactions change
const variableBudget = config
  ? calcVariableBudget(config.income, config.fixedExpenses, config.savingsGoal)
  : 0
const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0)
const remainingBudget = variableBudget - totalSpent
const remainingDays = config
  ? getRemainingDaysInPeriod(new Date(), config.monthStartDay)
  : 1
const dailySurvival = Math.max(0, calcDailySurvivalBudget(
  Math.max(0, remainingBudget),
  remainingDays
))
const weeklySurvival = dailySurvival * 7
const paceRatio = calcPaceRatio(totalSpent, variableBudget, config?.monthStartDay ?? 1)
```

### Pattern 3: Pace Status Derivation

**What:** `calcPaceRatio` is a new pure function to add to `budget.ts`. paceRatio = `totalSpent / (variableBudget * (daysElapsed / totalDaysInPeriod))`.

```typescript
// New function to add to src/lib/budget.ts
export type PaceStatus = 'safe' | 'caution' | 'danger'

export function calcPaceRatio(
  totalSpent: number,
  variableBudget: number,
  monthStartDay: number,
  today: Date = new Date(),
): number {
  if (variableBudget <= 0) return totalSpent > 0 ? 2 : 0
  const totalDays = getRemainingDaysInPeriod(getPeriodStart(today, monthStartDay), monthStartDay)
  // daysElapsed = totalDays in period - remainingDays + 1
  const remainingDays = getRemainingDaysInPeriod(today, monthStartDay)
  const daysElapsed = totalDays - remainingDays + 1
  const expectedSpent = variableBudget * (daysElapsed / totalDays)
  if (expectedSpent === 0) return 0
  return totalSpent / expectedSpent
}

export function getPaceStatus(paceRatio: number): PaceStatus {
  if (paceRatio < 0.9) return 'safe'
  if (paceRatio < 1.1) return 'caution'
  return 'danger'
}
```

**Critical edge case:** When `variableBudget <= 0`, paceRatio must be handled. If already over-budget from fixed expenses, the user is perpetually at danger regardless of spending. The function should return a high value (e.g., 2) so the UI shows danger.

**Note on period total days:** `getRemainingDaysInPeriod` takes today and returns remaining days inclusive of today. To get total days in period, call it with the period start date. A helper `getPeriodStart(today, monthStartDay)` must be written or the total can be computed differently. A simpler approach: total days in period = daysElapsed + remainingDays - 1. See Open Questions.

### Pattern 4: Progress Bar Width Clamping

**What:** Progress bar `style={{ width }}` must be clamped to 0–100%. Over-budget state shows 100%.

```typescript
const progressPct = Math.min(100, Math.max(0,
  variableBudget > 0 ? (totalSpent / variableBudget) * 100 : 100
))
```

### Anti-Patterns to Avoid

- **Re-fetching Dexie on every transaction store change:** The dashboard should load from Dexie once on mount and then rely on the Zustand in-memory store for updates. Re-fetching on each `transactions` change would break the < 100ms requirement.
- **Rendering dashboard content before hydration:** `return null` when `!budgetHydrated || !settingsHydrated`. This prevents flash of wrong data (₩0 budget, wrong currency).
- **Filtering transactions server-side via Dexie on render:** The TransactionsPage filters by category in-memory; the DashboardPage should filter by current period in-memory from the already-loaded `transactions` array. Avoid per-render Dexie queries.
- **Using negative remainingBudget as input to calcDailySurvivalBudget:** The context specifies survival budget shows ₩0 when over-budget. Clamp `remainingBudget` to `Math.max(0, remainingBudget)` before passing to the function.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | Custom number formatter | `formatCurrency(amount, currency)` in `budget.ts` | Already handles KRW/USD/JPY locale conventions including fullwidth ¥ for JPY |
| Remaining days calculation | Date arithmetic inline in component | `getRemainingDaysInPeriod(today, monthStartDay)` in `budget.ts` | Handles monthStartDay clamping, payday edge cases, and leap years — tested |
| Daily survival budget | Inline division | `calcDailySurvivalBudget(budget, days)` in `budget.ts` | Handles division-by-zero guard, floors result |
| Variable budget | Inline subtraction | `calcVariableBudget(income, expenses, savings)` in `budget.ts` | Tested; single source of truth |
| Hydration guard | Custom store polling | `persist.onFinishHydration` + `persist.hasHydrated()` | Established project pattern; avoids stale closure and race conditions |

**Key insight:** Phase 4 is primarily UI work. The calculation layer is complete. The risk of hand-rolling any of these is introducing subtle bugs (e.g., UTC drift in date calculations, division by zero in survival budget).

---

## Common Pitfalls

### Pitfall 1: Loading All-Time Transactions Instead of Current-Period Transactions

**What goes wrong:** Dashboard `totalSpent` includes transactions from previous budget months, inflating the figure.
**Why it happens:** `transactions/page.tsx` uses `db.transactions.orderBy('date').reverse().toArray()` (no date filter). If the dashboard copies that pattern, it loads everything.
**How to avoid:** Filter on mount using `db.transactions.where('date').aboveOrEqual(periodStart).toArray()` where `periodStart` is derived from `monthStartDay`. Must wait for `budgetStore` hydration to know `monthStartDay` before loading.
**Warning signs:** `totalSpent` is much higher than expected; progress bar is full on first open.

### Pitfall 2: UTC Midnight Drift in Period Start Calculation

**What goes wrong:** Period boundary dates computed via `new Date('2026-03-25')` (ISO string) are at UTC midnight, which can be March 24 in UTC+9 environments.
**Why it happens:** `new Date(isoString)` without timezone is UTC. Mobile users in Korea/Japan will see wrong period boundaries.
**How to avoid:** Use `new Date(year, month - 1, day)` (local date constructor) when computing period start, matching the pattern in `getRemainingDaysInPeriod` which uses `today.getFullYear()`, `today.getMonth()`, `today.getDate()`.
**Warning signs:** Transactions from the previous budget month appear in the current period for UTC+9 users.

### Pitfall 3: paceRatio Division by Zero or Negative variableBudget

**What goes wrong:** `calcPaceRatio` crashes or returns `Infinity` / `NaN` when `variableBudget` is 0 or negative (possible if fixed expenses exceed income).
**Why it happens:** The formula divides by `variableBudget`. No guard.
**How to avoid:** Add explicit guard: `if (variableBudget <= 0) return totalSpent > 0 ? 2 : 0`. This ensures the UI always shows a valid status.
**Warning signs:** Dashboard renders "NaN" or crashes on load for users with over-committed budgets.

### Pitfall 4: Hydration Flash Before Two Stores Are Ready

**What goes wrong:** Dashboard renders with `config = null` (budgetStore not yet hydrated) and shows ₩0 for everything, then jumps to real values — visible flash on fast devices.
**Why it happens:** Two separate stores with `skipHydration: true` hydrate independently. The first one finishing triggers a render before the second is done.
**How to avoid:** Keep a combined `hydrated` flag: `const hydrated = budgetHydrated && settingsHydrated`. Return `null` (or skeleton) until both are true.
**Warning signs:** A brief flash of "₩0 remaining" on dashboard load.

### Pitfall 5: calcDailySurvivalBudget Uses Total variableBudget Instead of remainingBudget

**What goes wrong:** The daily survival budget shows a higher-than-correct value because it divides the full variable budget by remaining days, ignoring spending already done.
**Why it happens:** Misreading the function signature. `calcDailySurvivalBudget` takes `variableBudget` as its first argument in the current implementation — but for the dashboard, this should be `remainingBudget` (what's left, not the full monthly budget).
**How to avoid:** Pass `Math.max(0, remainingBudget)` (not `variableBudget`) as the first argument. The function is named "survival" — it should answer "how much do I have per day to survive the rest of the period."
**Warning signs:** Daily survival budget is higher than remaining budget divided by remaining days.

---

## Code Examples

### Period Start Helper (new, needed for Dexie filter)

```typescript
// Pattern: compute period start date using local date constructor (no UTC drift)
function getPeriodStartDate(today: Date, monthStartDay: number): Date {
  const year = today.getFullYear()
  const month = today.getMonth()
  const dayOfMonth = today.getDate()
  const clampedStart = Math.min(monthStartDay, new Date(year, month + 1, 0).getDate())

  if (dayOfMonth >= clampedStart) {
    // Period started this calendar month
    return new Date(year, month, clampedStart)
  } else {
    // Period started last calendar month
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const prevClamp = Math.min(monthStartDay, new Date(prevYear, prevMonth + 1, 0).getDate())
    return new Date(prevYear, prevMonth, prevClamp)
  }
}
```

### Dexie Current-Period Query

```typescript
// Load only current period transactions — avoids inflated totalSpent
const periodStart = getPeriodStartDate(new Date(), config.monthStartDay)
const txns = await db.transactions
  .where('date')
  .aboveOrEqual(periodStart)
  .toArray()
useTransactionStore.getState().setTransactions(txns)
```

### Tailwind v4 Conditional Color Classes

```typescript
// Tailwind v4 safe-list note: dynamic class names must be complete strings
// Do NOT construct partial strings like `text-${color}-500`
const paceColor =
  status === 'safe' ? 'text-green-500' :
  status === 'caution' ? 'text-amber-400' :
  'text-red-500'

const progressColor =
  status === 'safe' ? 'bg-green-500' :
  status === 'caution' ? 'bg-amber-400' :
  'bg-red-500'
```

**Critical:** Tailwind v4 purges classes that are assembled at runtime from partial strings. Always use complete class strings in conditional expressions.

### Progress Bar (native div pattern)

```typescript
// No library needed — a div with dynamic width percentage
<div className="w-full bg-slate-700 rounded-full overflow-hidden" style={{ height: '6px' }}>
  <div
    className={`h-full transition-none ${progressColor}`}
    style={{ width: `${progressPct}%` }}
  />
</div>
// transition-none avoids animation on fast update (< 100ms requirement)
```

### i18n Keys to Add (messages/en.json "home" namespace)

```json
"home": {
  "remainingThisMonth": "remaining this month",
  "overBudget": "Over budget",
  "variableBudget": "Variable Budget",
  "totalSpent": "Total Spent",
  "remainingDays": "Remaining Days",
  "dailySurvival": "Daily",
  "weeklySurvival": "Weekly",
  "paceLabel": "Pace",
  "paceSafe": "Safe",
  "paceCaution": "Caution",
  "paceDanger": "Danger",
  "days": "days"
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React class-based lifecycle | React hooks (useEffect, useState) | React 16.8+ | All project code uses hooks — no class components |
| Zustand v4 `persist` hydration via `onRehydrateStorage` | Zustand v5 `persist.onFinishHydration` + `persist.hasHydrated()` | Zustand v5 | Project already uses v5 API; do not use `onRehydrateStorage` |
| Tailwind darkMode: 'class' | @custom-variant dark in globals.css with data-theme="dark" | Tailwind v4 | Project uses v4 variant system; `dark:` utilities work only with the data-theme attribute on html element |

**Deprecated/outdated:**
- `darkMode: 'class'` in tailwind.config: replaced by `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))` in globals.css (v4 project decision from Plan 01-03)
- `onRehydrateStorage` callback: replaced by `onFinishHydration` in Zustand v5

---

## Open Questions

1. **Total days in budget period for paceRatio denominator**
   - What we know: `getRemainingDaysInPeriod(today, monthStartDay)` returns remaining days. The formula needs total days.
   - What's unclear: There is no existing `getTotalDaysInPeriod` helper. Options: (a) call `getRemainingDaysInPeriod(periodStartDate, monthStartDay)` to get total days, (b) compute `daysElapsed + remainingDays - 1`.
   - Recommendation: Option (b) is simpler. `daysElapsed = (today - periodStart) / 86400000 + 1` (integer days), `totalDays = daysElapsed + remainingDays - 1`. The `getPeriodStartDate` helper above enables option (b). Planner should include the helper as a task.

2. **Whether transactionStore needs a period-scoping flag**
   - What we know: `transactionStore.transactions` is loaded once per page mount. TransactionsPage loads ALL transactions; DashboardPage needs only current-period transactions.
   - What's unclear: If a user navigates TransactionsPage → Dashboard within the same session, `transactionStore` already holds all-time transactions from the previous page's load.
   - Recommendation: On DashboardPage mount, always reload from Dexie with the period filter — do not trust whatever is in the store from a prior page. This is a separate `useEffect` keyed on `budgetHydrated`.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 + @testing-library/react ^16.3.2 |
| Config file | `vitest.config.mts` |
| Quick run command | `npx vitest run tests/budget.test.ts tests/dashboard.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Hero card renders variableBudget, totalSpent, remainingBudget, and progress bar | unit (RTL) | `npx vitest run tests/dashboard.test.ts` | ❌ Wave 0 |
| DASH-02 | Daily survival budget displays correctly (remaining ÷ days, floored) | unit (pure fn) | `npx vitest run tests/budget.test.ts` | ❌ Wave 0 (calcPaceRatio + calcDailySurvival with remainingBudget input) |
| DASH-03 | Weekly survival = daily × 7 | unit (RTL) | `npx vitest run tests/dashboard.test.ts` | ❌ Wave 0 |
| DASH-04 | Remaining days derived from monthStartDay displays correctly | unit (pure fn) | `npx vitest run tests/budget.test.ts` | ✅ (getRemainingDaysInPeriod tests exist) |
| DASH-05 | calcPaceRatio returns correct ratio; getPaceStatus returns safe/caution/danger | unit (pure fn) | `npx vitest run tests/budget.test.ts` | ❌ Wave 0 |
| DASH-06 | Over-budget state: negative remainingBudget shows red hero, ₩0 survival, "Over budget" label | unit (RTL) | `npx vitest run tests/dashboard.test.ts` | ❌ Wave 0 |
| DASH-07 | < 100ms update after transaction save | architectural (no test needed) | N/A — Zustand synchronous re-render guarantee | N/A |

**DASH-07 note:** The < 100ms guarantee is architectural. Zustand's `set()` is synchronous and triggers React's batched re-render immediately — no Playwright or timing test is necessary. Document this in tests as a comment.

### Sampling Rate
- **Per task commit:** `npx vitest run tests/budget.test.ts tests/dashboard.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/dashboard.test.ts` — covers DASH-01, DASH-02, DASH-03, DASH-05, DASH-06
- [ ] `src/lib/budget.ts` additions: `calcPaceRatio`, `getPaceStatus`, `getPeriodStartDate` — needed by both component and tests
- [ ] `messages/en.json` and `messages/ko.json` dashboard keys — needed before RTL component tests render without missing translation warnings

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: `src/lib/budget.ts`, `src/stores/*.ts`, `src/app/page.tsx`, `src/app/transactions/page.tsx`, `tests/budget.test.ts`, `tests/TransactionsPage.test.tsx`
- `package.json` — exact library versions confirmed
- `vitest.config.mts` — test environment confirmed (jsdom, globalThis, setupFiles)

### Secondary (MEDIUM confidence)
- Tailwind v4 dynamic class name purging behavior — confirmed by project decision in Plan 01-03 ("Tailwind v4 dark mode uses @custom-variant") and standard Tailwind v4 documentation

### Tertiary (LOW confidence)
- None — all findings verified directly from codebase

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified from package.json
- Architecture: HIGH — patterns verified from existing page implementations
- Pitfalls: HIGH — identified from actual code patterns and edge cases in the existing tests
- Validation: HIGH — test framework verified from vitest.config.mts and existing test files

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable stack; no fast-moving dependencies in this phase)
