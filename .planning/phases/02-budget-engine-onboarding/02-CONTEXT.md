# Phase 2: Budget Engine + Onboarding - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

First-run onboarding flow that collects income, fixed expenses, and savings goal, calculates the variable budget, and redirects to the dashboard. Also includes the Survival Budget calculation engine and currency/month-start-day settings support. Dashboard display and transaction logging are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Onboarding flow structure
- Multi-step wizard: 3 screens — Income → Fixed Expenses → Savings Goal
- Progress indicator at top of each step
- Back button on steps 2 and 3 (step 1 has no back)
- On completion: redirect straight to dashboard (no summary screen)
- First-time detection via `budgetStore.isOnboarded` flag — already in place

### Fixed expenses step
- Inline add form on the same screen (no modal, no sub-screen)
- Blank slate — no pre-populated examples
- User fills name, amount, category inline and taps "Add"
- Added expenses list below the form
- Skip allowed: "I have no fixed expenses" button to proceed with 0 expenses
- Delete via swipe gesture (consistent with Phase 3 transaction delete)
- Edit via tap on row (inline edit)

### Live calculation preview
- Variable budget calculates and displays live on every step
- Placement: sticky bottom bar, just above the Next/Finish button
- Shows: "Variable Budget: ₩1,200,000" (currency symbol from detected/selected currency)
- If negative: show value in red + brief warning text "Expenses exceed income" — user can still proceed (not blocked)

### Currency exposure
- Default: KRW (silent, no prompt for KRW users)
- If device locale suggests USD or JPY → show currency picker on step 1 of onboarding
- Otherwise currency lives in Settings only

### Month start day
- Default: 1st (no prompt in onboarding)
- Settings-only — user changes payday date in Settings after onboarding
- Survival Budget calculation must handle non-1st start days correctly (key edge case)

### Claude's Discretion
- Exact progress indicator style (dots, steps, percentage bar)
- Inline form field layout within the fixed expenses step
- Animation/transition between wizard steps
- Loading state while saving to Dexie and redirecting

</decisions>

<specifics>
## Specific Ideas

- Survival Budget formula: `income − sum(fixedExpenses) − savingsGoal`
- Daily Survival Budget: `variableBudget ÷ remainingDays` where remaining days accounts for `monthStartDay` (e.g., 25th to 24th of next month)
- `monthStartDay` edge case is non-trivial and requires dedicated unit tests — noted in STATE.md
- Live preview currency symbol must match the active currency setting (₩, $, ¥)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/stores/budgetStore.ts`: `isOnboarded` flag already exists — use for first-run detection and redirect logic
- `src/stores/settingsStore.ts`: language + theme state — locale-based currency detection reads from here
- `src/lib/db.ts`: `budgetConfigs` table ready — save `BudgetConfig` on onboarding completion
- `src/types/index.ts`: `BudgetConfig`, `FixedExpense`, `CurrencyCode` all fully typed — use as-is
- `src/lib/constants.ts`: `CATEGORIES` array with emoji + label — use for expense category dropdown in onboarding
- `src/app/onboarding/page.tsx`: placeholder ready to fill

### Established Patterns
- Zustand with `skipHydration: true` for SSR-safe stores — follow this for any new state
- Dexie is source of truth for persisted data; Zustand is display cache
- Cookie-based locale for i18n (next-intl); don't use URL segments
- Mobile-first: touch targets ≥ 44×44px, safe area insets, swipe gestures for delete

### Integration Points
- After onboarding completion: set `budgetStore.isOnboarded = true`, save `BudgetConfig` to Dexie, redirect to `/` (dashboard)
- `app/layout.tsx` or root page should check `isOnboarded` and redirect unauthenticated users to `/onboarding`
- Currency symbol used in live preview must be consistent with `settingsStore.currency` or the newly selected currency
- Month start day calculation: utility function in `src/lib/` — shared with dashboard in Phase 4

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-budget-engine-onboarding*
*Context gathered: 2026-03-10*
