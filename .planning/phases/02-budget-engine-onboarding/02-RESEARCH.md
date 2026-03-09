# Phase 2: Budget Engine + Onboarding - Research

**Researched:** 2026-03-10
**Domain:** Next.js 16 App Router multi-step wizard, Zustand v5, Dexie.js v4, budget calculation engine
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Onboarding flow structure**
- Multi-step wizard: 3 screens — Income → Fixed Expenses → Savings Goal
- Progress indicator at top of each step
- Back button on steps 2 and 3 (step 1 has no back)
- On completion: redirect straight to dashboard (no summary screen)
- First-time detection via `budgetStore.isOnboarded` flag — already in place

**Fixed expenses step**
- Inline add form on the same screen (no modal, no sub-screen)
- Blank slate — no pre-populated examples
- User fills name, amount, category inline and taps "Add"
- Added expenses list below the form
- Skip allowed: "I have no fixed expenses" button to proceed with 0 expenses
- Delete via swipe gesture (consistent with Phase 3 transaction delete)
- Edit via tap on row (inline edit)

**Live calculation preview**
- Variable budget calculates and displays live on every step
- Placement: sticky bottom bar, just above the Next/Finish button
- Shows: "Variable Budget: ₩1,200,000" (currency symbol from detected/selected currency)
- If negative: show value in red + brief warning text "Expenses exceed income" — user can still proceed (not blocked)

**Currency exposure**
- Default: KRW (silent, no prompt for KRW users)
- If device locale suggests USD or JPY → show currency picker on step 1 of onboarding
- Otherwise currency lives in Settings only

**Month start day**
- Default: 1st (no prompt in onboarding)
- Settings-only — user changes payday date in Settings after onboarding
- Survival Budget calculation must handle non-1st start days correctly (key edge case)

### Claude's Discretion
- Exact progress indicator style (dots, steps, percentage bar)
- Inline form field layout within the fixed expenses step
- Animation/transition between wizard steps
- Loading state while saving to Dexie and redirecting

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUDG-01 | User can input monthly income | Step 1 of onboarding wizard; numeric input with inputmode="numeric"; stored in BudgetConfig.income |
| BUDG-02 | User can add, edit, and remove fixed expenses (name, amount, category) | Step 2 inline form; CATEGORIES from constants.ts; stored in BudgetConfig.fixedExpenses[]; swipe-delete pattern |
| BUDG-03 | User can set an optional monthly savings goal | Step 3 of wizard; stored in BudgetConfig.savingsGoal; 0 is valid (optional) |
| BUDG-04 | Variable budget auto-calculates: income − fixed expenses − savings goal | Pure utility function in src/lib/budget.ts; live preview on each step; negative state shown in red |
| BUDG-05 | User can set month start day (1–31) | Settings-only in this phase; monthStartDay defaults to 1 in BudgetConfig; dailySurvivalBudget utility must handle non-1st correctly |
| BUDG-06 | User can set currency (KRW default, USD, JPY) | Locale-detection on step 1 for USD/JPY users; settingsStore.currency extended; currency symbol map |
| ONBD-01 | First-run onboarding collects income, fixed expenses, and savings goal, then redirects to dashboard | isOnboarded flag check in root page; redirect to /onboarding if false; set flag + write Dexie + redirect on completion |
</phase_requirements>

---

## Summary

Phase 2 builds on Phase 1's foundation by implementing the budget configuration wizard and the core calculation engine. The codebase already has all necessary types (`BudgetConfig`, `FixedExpense`, `CurrencyCode`), a Dexie schema with the `budgetConfigs` table, and a `budgetStore.isOnboarded` flag ready for redirect logic. The primary implementation surface is: (1) a 3-step wizard at `/onboarding`, (2) a pure calculation utility in `src/lib/budget.ts`, and (3) first-run redirect logic at the root page.

The most technically non-trivial part of this phase is the `monthStartDay` calculation for Daily Survival Budget. When a user's month starts on, say, the 25th, "remaining days" must span across calendar months (e.g., March 25 to April 24 = 31-day budget period). This requires careful date arithmetic and is called out in STATE.md as requiring dedicated unit tests. The calculation logic should live in `src/lib/budget.ts` so it is shared with Phase 4 (dashboard).

The settingsStore currently lacks a `currency` field — it needs to be extended to store `CurrencyCode`. The locale-based currency detection should read `navigator.language` on the client and be performed within the onboarding Step 1 component. The currency symbol map (`KRW → ₩`, `USD → $`, `JPY → ¥`) should live in `src/lib/constants.ts` alongside `CATEGORIES`.

**Primary recommendation:** Implement `src/lib/budget.ts` as the calculation engine first (pure functions, fully unit-tested), then build the wizard UI on top — this ensures the core feature is correct before any UI complexity is added.

---

## Standard Stack

### Core (already installed — no new packages needed for this phase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.1.6 | Page routing, SSR, redirect | Already in use |
| Zustand | ^5.0.11 | Client state for wizard steps and budget cache | Already in use, skipHydration pattern established |
| Dexie.js | ^4.3.0 | Persist BudgetConfig to IndexedDB | Already in use, budgetConfigs table exists |
| Tailwind CSS v4 | ^4 | All styling | Already in use |
| Vitest | ^4.0.18 | Unit tests for calculation engine | Already configured with jsdom + fake-indexeddb |
| fake-indexeddb | ^6.2.5 | Test Dexie operations without a real browser | Already a devDependency |

### No new dependencies required

All functionality for Phase 2 is achievable with the existing stack. Do not install additional libraries.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Root page — add isOnboarded redirect logic here
│   └── onboarding/
│       └── page.tsx                # Replace placeholder with full wizard
├── components/
│   └── onboarding/
│       ├── OnboardingWizard.tsx    # Orchestrator: tracks currentStep state
│       ├── StepIncome.tsx          # Step 1: income input + optional currency picker
│       ├── StepFixedExpenses.tsx   # Step 2: inline add/edit/delete list
│       ├── StepSavingsGoal.tsx     # Step 3: savings goal input
│       ├── ProgressIndicator.tsx   # Dots or step counter (Claude's discretion)
│       └── LiveBudgetBar.tsx       # Sticky bottom bar showing variable budget
├── lib/
│   ├── budget.ts                   # Pure calculation engine (NEW)
│   ├── constants.ts                # Add CURRENCY_SYMBOLS map here
│   ├── db.ts                       # Unchanged
│   └── locale.ts                   # Locale-to-currency detection utility (NEW)
├── stores/
│   ├── budgetStore.ts              # Unchanged
│   └── settingsStore.ts            # Extend with currency field + setCurrency action
└── types/
    └── index.ts                    # Unchanged (CurrencyCode already defined)
tests/
├── budget.test.ts                  # Unit tests for calculation engine (NEW)
├── db.test.ts                      # Existing
├── BottomNav.test.tsx              # Existing
├── manifest.test.ts                # Existing
└── setup.ts                        # Existing
```

### Pattern 1: Wizard State with Local React State (not Zustand)

**What:** The onboarding wizard tracks `currentStep`, `income`, `fixedExpenses`, and `savingsGoal` in local `useState` within `OnboardingWizard.tsx`. Only on final submission does it write to Zustand and Dexie.

**When to use:** Ephemeral multi-step form state that is not needed after submission. Avoids polluting the global store with incomplete wizard data.

**Example:**
```typescript
// OnboardingWizard.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBudgetStore } from '@/stores/budgetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { db } from '@/lib/db'
import { calcVariableBudget } from '@/lib/budget'
import type { FixedExpense, CurrencyCode } from '@/types'

type Step = 1 | 2 | 3

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [income, setIncome] = useState(0)
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [savingsGoal, setSavingsGoal] = useState(0)
  const [currency, setCurrencyLocal] = useState<CurrencyCode>('KRW')

  const variableBudget = calcVariableBudget(income, fixedExpenses, savingsGoal)

  const handleFinish = async () => {
    const config = {
      id: crypto.randomUUID(),
      income,
      fixedExpenses,
      savingsGoal,
      monthStartDay: 1,
      currency,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.budgetConfigs.add(config)
    useBudgetStore.getState().setConfig(config)
    useBudgetStore.getState().setOnboarded(true)
    useSettingsStore.getState().setCurrency(currency)
    router.push('/')
  }
  // ...
}
```

### Pattern 2: isOnboarded Redirect in Root Page

**What:** The root page (`/`) checks `budgetStore.isOnboarded` after store rehydration and redirects to `/onboarding` if false. Because Zustand uses `skipHydration: true`, the check must happen client-side in a `useEffect`.

**When to use:** First-run detection for any feature gated behind onboarding completion.

**Example:**
```typescript
// src/app/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBudgetStore } from '@/stores/budgetStore'

export default function DashboardPage() {
  const router = useRouter()
  const isOnboarded = useBudgetStore((s) => s.isOnboarded)

  useEffect(() => {
    // Store is rehydrated by ServiceWorkerRegistration before this runs
    if (!isOnboarded) {
      router.replace('/onboarding')
    }
  }, [isOnboarded, router])

  if (!isOnboarded) return null // Prevent flash of dashboard content

  return <div>Dashboard (Phase 4)</div>
}
```

**Critical subtlety:** `ServiceWorkerRegistration` calls `useBudgetStore.persist.rehydrate()` on mount in `layout.tsx`. The `useEffect` in the page runs after hydration, so `isOnboarded` will be the persisted value, not the SSR default of `false`. This means the redirect is reliable without a loader/spinner.

### Pattern 3: Pure Calculation Engine in src/lib/budget.ts

**What:** All budget math is implemented as pure, side-effect-free functions. No React, no Dexie, no Zustand — just inputs and outputs.

**When to use:** Any calculation that will be called from multiple places (live preview, dashboard, tests).

**Example:**
```typescript
// src/lib/budget.ts
import type { FixedExpense } from '@/types'

export function calcVariableBudget(
  income: number,
  fixedExpenses: FixedExpense[],
  savingsGoal: number
): number {
  const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
  return income - totalFixed - savingsGoal
}

/**
 * Returns the number of remaining days in the current budget period.
 * Budget period: from monthStartDay of current month to (monthStartDay - 1) of next month.
 * If today is before the start day this calendar month, the period started last month.
 */
export function getRemainingDaysInPeriod(
  today: Date,
  monthStartDay: number
): number {
  const todayDate = today.getDate()
  let periodEnd: Date

  if (todayDate >= monthStartDay) {
    // Period started this month, ends on (monthStartDay - 1) of next month
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, monthStartDay)
    periodEnd = new Date(nextMonth.getTime() - 1) // day before next period start
  } else {
    // Period started last month, ends on (monthStartDay - 1) of this month
    periodEnd = new Date(today.getFullYear(), today.getMonth(), monthStartDay - 1)
  }

  const msPerDay = 1000 * 60 * 60 * 24
  const diff = Math.floor((periodEnd.getTime() - today.setHours(0, 0, 0, 0)) / msPerDay)
  return Math.max(diff + 1, 1) // at least 1 day remaining
}

export function calcDailySurvivalBudget(
  variableBudget: number,
  remainingDays: number
): number {
  if (remainingDays <= 0) return 0
  return Math.floor(variableBudget / remainingDays)
}
```

### Pattern 4: Extending settingsStore with Currency

**What:** The existing `settingsStore` only has `language` and `theme`. Add `currency: CurrencyCode` and `setCurrency` following the established pattern.

**Example:**
```typescript
// settingsStore.ts additions
interface SettingsStore extends Settings {
  // existing...
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
}
// persist state addition:
currency: 'KRW',
setCurrency: (currency) => set({ currency }),
```

**Note:** The persisted key `'budgetpulse-settings'` already exists in localStorage. Adding a new field with a default value (`'KRW'`) is backward-compatible — Zustand's `persist` middleware merges the stored state with the initial state, so existing users without the key will get the default without a hydration error.

### Pattern 5: Locale-Based Currency Detection

**What:** On Step 1 of onboarding, detect the browser's primary locale. If it suggests USD (en-US) or JPY (ja), show a currency picker. Otherwise, silently use KRW.

**Example:**
```typescript
// src/lib/locale.ts
import type { CurrencyCode } from '@/types'

export function detectCurrencyFromLocale(): CurrencyCode {
  if (typeof navigator === 'undefined') return 'KRW'
  const locale = navigator.language || 'ko'
  if (locale.startsWith('ja')) return 'JPY'
  if (locale === 'en-US' || locale.startsWith('en-US')) return 'USD'
  return 'KRW'
}
```

### Anti-Patterns to Avoid

- **Using `router.push` instead of `router.replace` for the onboarding redirect:** Using `push` adds the dashboard to history — pressing Back from onboarding would re-trigger the redirect loop. Use `router.replace('/')` after completing onboarding.
- **Storing wizard step state in Zustand:** Onboarding state is ephemeral. Local `useState` is correct. Don't create a `onboardingStore`.
- **Checking `isOnboarded` in a Server Component:** The store uses `skipHydration: true` and reads from `localStorage`. This is unavailable server-side. Always check in a Client Component with `useEffect`.
- **Floating-point arithmetic for currency amounts:** KRW is integer-only. USD and JPY display can also avoid decimals for simplicity in this phase. Use `Math.floor` for daily budget calculation.
- **Blocking completion when variable budget is negative:** Per the user decision, the user can still proceed with a negative variable budget — show a warning but do not disable the Next/Finish button.
- **Swipe-delete without a library:** The project establishes swipe-delete in Phase 2 (fixed expenses) and Phase 3 (transactions). This is the first occurrence — implement manually with `onTouchStart`/`onTouchEnd` or use CSS `transform` with a reveal-delete button, since no gesture library is in the stack. Keep it consistent so Phase 3 can reuse the same component.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB operations | Custom IDB wrapper | Dexie.js (already installed) | Transaction safety, schema versioning, TypeScript types |
| UUID generation | Custom ID generator | `crypto.randomUUID()` | Browser-native, available in all modern targets |
| Client store persistence | Custom localStorage serialization | Zustand `persist` middleware (already in use) | Handles SSR safety, skipHydration, merge on rehydration |
| Number formatting with currency | Custom formatter | `Intl.NumberFormat` (native) | Handles KRW (no decimals), USD, JPY with correct symbols and grouping |

**Key insight:** `Intl.NumberFormat` handles the currency symbol correctly for all three currencies — KRW, USD, JPY — and respects locale conventions. Use it for all display formatting rather than a manual symbol map.

```typescript
// Example: format currency amount
export function formatCurrency(amount: number, currency: CurrencyCode, locale = 'en'): string {
  return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0, // KRW and JPY are integer currencies; USD simplified for this app
  }).format(amount)
}
// KRW → ₩1,200,000  |  USD → $1,200  |  JPY → ¥150,000
```

---

## Common Pitfalls

### Pitfall 1: Zustand Hydration Race Condition on Root Page

**What goes wrong:** The root page reads `isOnboarded` from Zustand, which is `false` (SSR default) because rehydration hasn't happened yet. The user is redirected to `/onboarding` even after completing it.

**Why it happens:** `skipHydration: true` means the store is NOT automatically rehydrated on mount. `ServiceWorkerRegistration` calls `rehydrate()` in its own `useEffect`. If the page's `useEffect` runs in the same render cycle before `ServiceWorkerRegistration`'s effect, `isOnboarded` is still `false`.

**How to avoid:** Subscribe to the store's hydrated state, or add a small `hasHydrated` flag to `budgetStore`. The simplest reliable approach: check `budgetStore.persist.hasHydrated()` before acting, OR render a blank screen (return null) until hydrated.

```typescript
// Option A: hasHydrated check
const [hydrated, setHydrated] = useState(false)
useEffect(() => {
  const unsub = useBudgetStore.persist.onFinishHydration(() => setHydrated(true))
  if (useBudgetStore.persist.hasHydrated()) setHydrated(true)
  return unsub
}, [])
```

**Warning signs:** User who completed onboarding gets sent back to `/onboarding` on next visit.

### Pitfall 2: monthStartDay Date Arithmetic Edge Cases

**What goes wrong:** `getRemainingDaysInPeriod` returns incorrect values for:
- Start day = 31 (February, April, June, September, November don't have 31 days)
- Today IS the start day (should return full period length, not 0)
- Last day of period (should return 1, not 0)

**Why it happens:** Naive `new Date(year, month, 31)` in JavaScript auto-rolls to the next month (e.g., `new Date(2026, 1, 31)` = March 3). This silently corrupts the period end.

**How to avoid:** Use `Math.min(monthStartDay, daysInMonth)` when constructing dates. Write explicit unit tests for:
- start day = 25, today = March 25 (first day of period)
- start day = 25, today = March 24 (last day of period)
- start day = 25, today = March 1 (mid-period)
- start day = 31, today = February 28 (month has no day 31)

**Warning signs:** Survival Budget shows 0 or negative days.

### Pitfall 3: Inline Swipe-Delete Implementation Conflicts with Scroll

**What goes wrong:** Touch events for swipe-to-delete on fixed expense rows intercept vertical scroll on the list, making the page unscrollable on mobile when the list gets long.

**Why it happens:** `touchstart`/`touchmove` events on list items compete with the browser's native scroll behavior.

**How to avoid:** Only activate the swipe gesture when the horizontal delta exceeds the vertical delta (i.e., user is clearly swiping sideways, not scrolling). Check `deltaX > deltaY` before calling `e.preventDefault()`.

**Warning signs:** Scrolling the fixed expenses list scrolls each row instead of the page.

### Pitfall 4: SettingsStore Currency Missing in Existing Persisted State

**What goes wrong:** An existing user (from Phase 1 testing) has `budgetpulse-settings` in localStorage without a `currency` key. After adding currency to the store, the persisted merge might not supply the default.

**Why it happens:** Zustand `persist` does a shallow merge — existing keys from storage override initial state keys. A missing key in storage gets the initial state default. This is actually correct behavior, but only if the initial state includes the field.

**How to avoid:** Ensure `currency: 'KRW'` is in the initial state object of `settingsStore`. This is the default and will apply for any user whose persisted state doesn't have the field.

**Warning signs:** `settingsStore.currency` is `undefined` at runtime; currency symbol shows as `undefined` in the UI.

### Pitfall 5: onboarding redirect visible for a frame (layout flash)

**What goes wrong:** On first load, the dashboard renders briefly before the `useEffect` redirect fires. The user sees a flash of the empty dashboard before being sent to `/onboarding`.

**Why it happens:** React renders the component tree before effects run. The redirect happens asynchronously.

**How to avoid:** Return `null` (or a blank loading state) from `DashboardPage` when `isOnboarded` is false or when hydration isn't complete. This is a one-liner guard at the top of the component.

---

## Code Examples

Verified patterns using existing project conventions:

### Saving BudgetConfig to Dexie on Wizard Completion
```typescript
// Source: existing pattern from db.ts + types/index.ts
const config: BudgetConfig = {
  id: crypto.randomUUID(),
  income,
  fixedExpenses,
  savingsGoal,
  monthStartDay: 1,         // default; Settings-only in this phase
  currency,
  createdAt: new Date(),
  updatedAt: new Date(),
}
await db.budgetConfigs.add(config)
```

### Currency Symbol Display (using Intl.NumberFormat)
```typescript
// Native browser API — no library needed
function formatCurrency(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat(currency === 'KRW' ? 'ko-KR' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
// Returns: "₩1,200,000" / "$1,200" / "¥150,000"
```

### Mobile-Safe Numeric Input (per BUDG-01 pattern from REQUIREMENTS.md)
```tsx
<input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  className="min-h-[44px] ..."  // minimum touch target
  value={income === 0 ? '' : String(income)}
  onChange={(e) => setIncome(Number(e.target.value.replace(/\D/g, '')))}
/>
```

### Test Pattern (following existing db.test.ts style)
```typescript
// tests/budget.test.ts
import { describe, it, expect } from 'vitest'
import { calcVariableBudget, getRemainingDaysInPeriod } from '../src/lib/budget'

describe('calcVariableBudget', () => {
  it('returns income minus fixed expenses minus savings goal', () => {
    const expenses = [
      { id: '1', name: 'Rent', amount: 500000, category: 'housing' as const },
    ]
    expect(calcVariableBudget(2000000, expenses, 200000)).toBe(1300000)
  })

  it('returns negative value when expenses exceed income', () => {
    expect(calcVariableBudget(100000, [], 200000)).toBe(-100000)
  })
})

describe('getRemainingDaysInPeriod', () => {
  it('handles monthStartDay = 25, today = March 25 (first day of period)', () => {
    const today = new Date('2026-03-25')
    // Period: March 25 to April 24 = 31 days; today is day 1, so 31 remain
    expect(getRemainingDaysInPeriod(today, 25)).toBe(31)
  })

  it('handles monthStartDay = 25, today = March 24 (last day of period)', () => {
    const today = new Date('2026-03-24')
    expect(getRemainingDaysInPeriod(today, 25)).toBe(1)
  })

  it('handles monthStartDay = 1 (standard calendar month)', () => {
    const today = new Date('2026-03-10')
    // March has 31 days; day 10, so days 10-31 = 22 remaining
    expect(getRemainingDaysInPeriod(today, 1)).toBe(22)
  })
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `router.push` for auth redirects | `router.replace` | N/A (always correct) | Prevents back-button loops |
| Manual localStorage for store persistence | Zustand `persist` middleware | Established in Phase 1 | SSR-safe, skipHydration pattern |
| URL-segment i18n (`/en/page`) | Cookie-based locale (next-intl) | Established in Phase 1 | No route changes for language switch |

**Patterns established in Phase 1 that this phase follows:**
- `skipHydration: true` on all Zustand stores — do not deviate
- Dexie as source of truth, Zustand as display cache — budget config saves to Dexie first, then Zustand
- `'use client'` directive on all interactive components
- Tailwind v4 with `data-theme` attribute for dark mode (not `darkMode: class`)

---

## Open Questions

1. **Swipe-delete gesture implementation**
   - What we know: Delete via swipe is required for fixed expenses (BUDG-02). No gesture library is installed.
   - What's unclear: Should Phase 2 implement a reusable `SwipeToDelete` component that Phase 3 transactions will also use, or implement it ad-hoc in each phase?
   - Recommendation: Implement a reusable `src/components/ui/SwipeToDelete.tsx` in this phase. Phase 3 will use the same component, avoiding a rewrite.

2. **onboarding redirect from `/onboarding` when already onboarded**
   - What we know: The root page redirects to `/onboarding` if not onboarded.
   - What's unclear: Should `/onboarding` redirect back to `/` if the user IS already onboarded (e.g., direct URL navigation)?
   - Recommendation: Yes — add a symmetric guard in `OnboardingPage` that redirects to `/` if `isOnboarded` is already true. Prevents re-running onboarding and potentially creating duplicate `BudgetConfig` records in Dexie.

3. **Multiple BudgetConfig records in Dexie**
   - What we know: `db.budgetConfigs.add(config)` adds a new record each time.
   - What's unclear: Should the app use `put` (upsert) or `add`? What if the user somehow reaches onboarding twice?
   - Recommendation: Use `db.budgetConfigs.put(config)` (upsert by `id`). Also on initialization, read `budgetConfigs.orderBy('createdAt').last()` to get the most recent config — this is defensive against edge cases.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `vitest.config.mts` (exists) |
| Quick run command | `npx vitest run tests/budget.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUDG-04 | `calcVariableBudget` returns income − fixed − savings | unit | `npx vitest run tests/budget.test.ts` | ❌ Wave 0 |
| BUDG-05 | `getRemainingDaysInPeriod` handles non-1st monthStartDay, edge cases | unit | `npx vitest run tests/budget.test.ts` | ❌ Wave 0 |
| BUDG-05 | `getRemainingDaysInPeriod` handles start day = 31 in short months | unit | `npx vitest run tests/budget.test.ts` | ❌ Wave 0 |
| BUDG-04 | Live preview shows negative value when expenses exceed income | manual | n/a — UI visual state | manual-only |
| ONBD-01 | First-run redirect to /onboarding when isOnboarded = false | unit | `npx vitest run tests/budget.test.ts` | ❌ Wave 0 |
| BUDG-06 | `detectCurrencyFromLocale` returns correct currency for ja/en-US locales | unit | `npx vitest run tests/budget.test.ts` | ❌ Wave 0 |
| BUDG-02 | BudgetConfig with fixedExpenses can be added to Dexie | integration | `npx vitest run tests/db.test.ts` | ✅ (extend) |

### Sampling Rate

- **Per task commit:** `npx vitest run tests/budget.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/budget.test.ts` — covers BUDG-04, BUDG-05, BUDG-06, ONBD-01 calculation logic
- [ ] `src/lib/budget.ts` — the module under test (pure functions, no DOM)

*(Existing `tests/setup.ts`, `tests/db.test.ts`, `vitest.config.mts` are all present and require no changes for Wave 0.)*

---

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection — all existing files read at `/Users/genie-dream/projects/budget/src/`
- `package.json` — confirmed installed library versions
- `vitest.config.mts` — confirmed test environment (jsdom, fake-indexeddb)
- `src/types/index.ts` — confirmed BudgetConfig, FixedExpense, CurrencyCode types
- `src/stores/budgetStore.ts` — confirmed isOnboarded flag and skipHydration pattern
- `src/lib/db.ts` — confirmed budgetConfigs table schema
- `src/lib/constants.ts` — confirmed CATEGORIES array structure
- `.planning/phases/02-budget-engine-onboarding/02-CONTEXT.md` — all user decisions

### Secondary (MEDIUM confidence)

- Zustand v5 persist middleware behavior (skipHydration, hasHydrated, onFinishHydration) — consistent with published Zustand v5 docs
- `Intl.NumberFormat` with `style: 'currency'` for KRW/USD/JPY — standard browser API, well-documented
- Next.js 16 App Router `router.replace` vs `router.push` for redirects — standard Next.js pattern

### Tertiary (LOW confidence)

- None — all findings are grounded in direct codebase inspection and standard browser/library APIs

---

## Metadata

**Confidence breakdown:**
- Calculation engine design: HIGH — types and schema fully defined in existing code
- Wizard architecture: HIGH — patterns established in Phase 1, existing placeholder at /onboarding
- monthStartDay edge cases: HIGH — identified in STATE.md, date arithmetic is deterministic
- Redirect pattern: MEDIUM — hydration race condition identified; `onFinishHydration` API needs validation against Zustand v5 docs during implementation
- Swipe gesture: MEDIUM — no library installed; manual touch event implementation is established pattern but implementation complexity is non-trivial

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable stack, no fast-moving dependencies)
