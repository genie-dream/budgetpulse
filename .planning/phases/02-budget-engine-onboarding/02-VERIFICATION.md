---
phase: 02-budget-engine-onboarding
verified: 2026-03-10T01:20:00Z
status: human_needed
score: 20/20 must-haves verified
human_verification:
  - test: "First-time user flow: clear localStorage, navigate to /, complete 3-step wizard"
    expected: "Redirected to /onboarding; wizard shows 3 steps; LiveBudgetBar updates live; finishing redirects to /"
    why_human: "UI interaction, redirect timing, swipe gesture, and live budget update cannot be verified programmatically"
  - test: "Negative budget warning: income=100000, add fixed expense of 500000"
    expected: "LiveBudgetBar shows negative value in RED with 'Expenses exceed income' text; Next button still works"
    why_human: "Visual red state and interaction flow require browser rendering"
  - test: "Returning user: after completing onboarding, navigate to /"
    expected: "Dashboard placeholder loads directly — NO redirect to /onboarding"
    why_human: "localStorage-dependent hydration behavior requires a real browser session"
  - test: "Symmetric guard: returning user navigates to /onboarding"
    expected: "Immediately redirected back to /"
    why_human: "Requires real browser with persisted Zustand state"
  - test: "Swipe-to-delete: on Step 2, add a fixed expense, swipe the row left"
    expected: "Red delete button slides in; tapping it removes the expense"
    why_human: "Touch event simulation is not reliable in jsdom; requires mobile browser or DevTools touch emulation"
---

# Phase 2: Budget Engine + Onboarding Verification Report

**Phase Goal:** Build the budget calculation engine (pure functions) and onboarding wizard (UI) so a first-time user can configure income, fixed expenses, savings goal, and arrive at a working dashboard redirect.
**Verified:** 2026-03-10T01:20:00Z
**Status:** human_needed — all automated checks pass; 5 items require human browser verification
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | calcVariableBudget returns income − fixed − savings goal | VERIFIED | `src/lib/budget.ts` line 22-23; tests pass 4/4 cases |
| 2  | calcVariableBudget returns negative when expenses exceed income | VERIFIED | Test: `calcVariableBudget(100_000, [], 200_000) === -100_000` passes |
| 3  | getRemainingDaysInPeriod handles non-1st monthStartDay (e.g. 25th) | VERIFIED | 6 test cases in `tests/budget.test.ts`; all pass |
| 4  | getRemainingDaysInPeriod handles monthStartDay=31 in short months | VERIFIED | `toBeGreaterThanOrEqual(1)` — returns 1+ for Feb with startDay=31 |
| 5  | calcDailySurvivalBudget floors the result and guards div-by-zero | VERIFIED | 3 tests pass including `Math.floor` and `remainingDays=0 → 0` |
| 6  | detectCurrencyFromLocale returns JPY/USD/KRW correctly | VERIFIED | 6 locale tests pass including SSR guard |
| 7  | formatCurrency formats KRW/USD/JPY with correct symbol | VERIFIED | 3 tests pass; JPY correctly uses fullwidth yen (U+FFE5: ￥) |
| 8  | settingsStore has currency: CurrencyCode defaulting to KRW | VERIFIED | `settingsStore.ts` line 18: `currency: 'KRW'`; setCurrency action at line 21 |
| 9  | BudgetConfig with fixedExpenses persists to Dexie | VERIFIED | `tests/db.test.ts` BudgetConfig persistence describe block; 1 test passes |
| 10 | Step 1 collects income via numeric input (inputmode=numeric) | VERIFIED | `StepIncome.tsx` line 51: `inputMode="numeric" pattern="[0-9]*"` |
| 11 | Step 1 shows currency picker only for USD/JPY locale | VERIFIED | `StepIncome.tsx` lines 24-31: `showCurrencyPicker` only if detected === 'USD' or 'JPY' |
| 12 | Step 2 has inline add form for fixed expenses | VERIFIED | `StepFixedExpenses.tsx`: name, amount, category inputs + Add button |
| 13 | Step 2 has swipe-to-delete on added expenses | VERIFIED | `StepFixedExpenses.tsx` lines 162-183: each row wrapped in `<SwipeToDelete>` |
| 14 | Step 2 has "I have no fixed expenses" skip button | VERIFIED | `StepFixedExpenses.tsx` lines 187-194 |
| 15 | Step 3 collects optional savings goal | VERIFIED | `StepSavingsGoal.tsx`: numeric input, "Monthly Savings Goal (optional)" label |
| 16 | LiveBudgetBar shows variable budget on every step | VERIFIED | `OnboardingWizard.tsx` line 100: `<LiveBudgetBar variableBudget={variableBudget} ...>` always rendered |
| 17 | LiveBudgetBar shows red + warning when negative | VERIFIED | `LiveBudgetBar.tsx` lines 14, 17-24: isNegative → text-red-400 + "Expenses exceed income" |
| 18 | Back button only on steps 2 and 3 | VERIFIED | `OnboardingWizard.tsx` line 104: `{step > 1 && <button ... Back>}` |
| 19 | Next/Finish button never disabled (only Finish disabled when submitting) | VERIFIED | Next button has no disabled prop; Finish disabled only when `isSubmitting` |
| 20 | First-time user at / is redirected to /onboarding | VERIFIED | `src/app/page.tsx`: onFinishHydration + `if (hydrated && !isOnboarded) router.replace('/onboarding')` |

**Score:** 20/20 truths verified by static analysis and test execution

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/budget.ts` | Pure calc functions: calcVariableBudget, getRemainingDaysInPeriod, calcDailySurvivalBudget, formatCurrency | VERIFIED | 104 lines, all 4 functions exported |
| `src/lib/locale.ts` | detectCurrencyFromLocale | VERIFIED | 22 lines, exported with SSR guard |
| `tests/budget.test.ts` | Unit tests for all calc and locale functions | VERIFIED | 22 tests across 5 describe blocks, all passing |
| `src/stores/settingsStore.ts` | Extended with currency: CurrencyCode + setCurrency | VERIFIED | currency: 'KRW' default, setCurrency action, CurrencyCode type imported |
| `tests/db.test.ts` | BudgetConfig persistence test | VERIFIED | 'BudgetConfig persistence' describe block with put/get test |
| `src/components/onboarding/OnboardingWizard.tsx` | Wizard orchestrator with step state and handleFinish | VERIFIED | 131 lines, full implementation |
| `src/components/onboarding/StepIncome.tsx` | Income input + conditional currency picker | VERIFIED | 83 lines, locale-detection on mount |
| `src/components/onboarding/StepFixedExpenses.tsx` | Inline add/edit/delete with SwipeToDelete | VERIFIED | 197 lines, full implementation |
| `src/components/onboarding/StepSavingsGoal.tsx` | Optional savings goal input | VERIFIED | 48 lines, numeric input |
| `src/components/onboarding/ProgressIndicator.tsx` | Step counter dots | VERIFIED | 28 lines, three dots, filled for current/completed |
| `src/components/onboarding/LiveBudgetBar.tsx` | Sticky bar with negative state | VERIFIED | 27 lines, red text + "Expenses exceed income" warning |
| `src/components/ui/SwipeToDelete.tsx` | Reusable swipe-to-delete wrapper | VERIFIED | 78 lines, manual touch events, 60px threshold, horizontal dominance guard |
| `src/app/onboarding/page.tsx` | Route entry: hydration guard + symmetric redirect | VERIFIED | 42 lines, onFinishHydration pattern, redirects if isOnboarded |
| `src/app/page.tsx` | Root page: hydration-safe redirect to /onboarding | VERIFIED | 36 lines, two-effect pattern, returns null before hydration |

---

## Key Link Verification

### Plan 01 (budget engine) links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `tests/budget.test.ts` | `src/lib/budget.ts` | `import { calcVariableBudget, ... } from '../src/lib/budget'` | WIRED | Line 3-8 of test file |
| `tests/budget.test.ts` | `src/lib/locale.ts` | `import { detectCurrencyFromLocale } from '../src/lib/locale'` | WIRED | Line 9 of test file |

### Plan 02 (stores) links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/stores/settingsStore.ts` | `src/types/index.ts` | `import type { Settings, CurrencyCode }` | WIRED | Line 4 of settingsStore.ts |

### Plan 03 (onboarding UI) links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `OnboardingWizard.tsx` | `src/lib/budget.ts` | `import { calcVariableBudget }` | WIRED | Line 5; used at line 30 |
| `OnboardingWizard.tsx` | `src/lib/db.ts` | `import { db }` | WIRED | Line 6; `db.budgetConfigs.put(config)` at line 45 |
| `OnboardingWizard.tsx` | `src/stores/budgetStore.ts` | `useBudgetStore.getState().setConfig / setOnboarded` | WIRED | Lines 46-47 |
| `OnboardingWizard.tsx` | `src/stores/settingsStore.ts` | `useSettingsStore.getState().setCurrency(currency)` | WIRED | Line 48 |
| `StepIncome.tsx` | `src/lib/locale.ts` | `import { detectCurrencyFromLocale }` | WIRED | Line 4; used in useEffect line 25 |
| `LiveBudgetBar.tsx` | `src/lib/budget.ts` | `import { formatCurrency }` | WIRED | Line 1; used at line 21 |
| `src/app/onboarding/page.tsx` | `src/stores/budgetStore.ts` | `isOnboarded guard — router.replace('/')` | WIRED | Line 26-28 |

### Plan 04 (root redirect) links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/page.tsx` | `src/stores/budgetStore.ts` | `useBudgetStore.persist.onFinishHydration + isOnboarded` | WIRED | Lines 9, 13 |
| `src/app/page.tsx` | `/onboarding` | `router.replace('/onboarding')` | WIRED | Line 21 |

---

## Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|---------------|-------------|--------|----------|
| BUDG-01 | 02-02, 02-03 | User can input monthly income | SATISFIED | `StepIncome.tsx`: numeric input; stored in BudgetConfig.income |
| BUDG-02 | 02-02, 02-03 | User can add, edit, and remove fixed expenses | SATISFIED | `StepFixedExpenses.tsx`: inline add, tap-to-edit, swipe-to-delete |
| BUDG-03 | 02-02, 02-03 | User can set optional savings goal | SATISFIED | `StepSavingsGoal.tsx`: optional numeric input; 0 = no savings |
| BUDG-04 | 02-01, 02-03 | Variable budget auto-calculates | SATISFIED | `calcVariableBudget` in budget.ts; derived inline in OnboardingWizard; shown in LiveBudgetBar |
| BUDG-05 | 02-01, 02-04 | User can set month start day (1-31, payday-based) | SATISFIED (partial scope) | `getRemainingDaysInPeriod` fully handles non-1st start days; monthStartDay defaults to 1 in onboarding per CONTEXT.md ("Settings-only — user changes payday date in Settings after onboarding"). The calculation engine is complete; the settings UI is Phase 5. |
| BUDG-06 | 02-01, 02-02, 02-03 | User can set currency (KRW default, USD, JPY) | SATISFIED | `detectCurrencyFromLocale` + currency picker in StepIncome; settingsStore.currency; formatCurrency |
| ONBD-01 | 02-03, 02-04 | First-run onboarding collects income, fixed expenses, savings goal, redirects to dashboard | SATISFIED | 3-step wizard collects all fields; handleFinish persists to Dexie + Zustand; router.replace('/'); root page redirects new users to /onboarding |

**Orphaned requirements check:** REQUIREMENTS.md traceability maps BUDG-01 through BUDG-06 and ONBD-01 to Phase 2. All 7 are claimed across the 4 plans. No orphaned requirements.

**Note on BUDG-05 scope:** The CONTEXT.md decision document explicitly states "Month start day — Default: 1st (no prompt in onboarding) — Settings-only — user changes payday date in Settings after onboarding." The requirement is for the user to be able to set it; the calculation engine supports all values 1-31 with edge case handling. The settings UI entry point is deferred to Phase 5 (SETT-01). BUDG-05 is satisfied at the engine level for Phase 2.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/onboarding/StepFixedExpenses.tsx` | 190 | `onClick={() => {/* fixedExpenses already [] */}}` — no-op handler | Info | The skip button does nothing programmatically; the user proceeds by clicking Next. This is intentional per the plan spec: "implement it as a text link that simply does nothing." Not a blocker. |
| `src/app/page.tsx` | 33 | "Dashboard coming in Phase 4" — placeholder text | Info | Intentional per plan spec; Phase 4 will replace with real dashboard content. |
| `src/app/layout.tsx` | 2 | `TODO: Replace Inter with Pretendard` | Info | Pre-existing from Phase 1; not introduced in Phase 2. |

No blocker anti-patterns. No stub implementations. All components have substantive logic.

---

## Human Verification Required

### 1. First-Time User Flow

**Test:** Clear localStorage (DevTools → Application → Local Storage → delete all under localhost:3000). Navigate to http://localhost:3000.
**Expected:**
- Redirected automatically to http://localhost:3000/onboarding
- Step 1 (Income) shows with progress dots, 3 dots with first filled
- Enter income 2000000 — LiveBudgetBar shows "Variable Budget: ₩2,000,000" updating in real time
- Click "Next" — Step 2 shows; Back button visible
- Add expense "Rent" 500000 Housing — expense appears in list below form
- Click "Next" — Step 3 shows
- Enter savings goal 200000 — LiveBudgetBar shows ₩1,300,000
- Click "Finish" — redirected to http://localhost:3000/ showing "Dashboard coming in Phase 4"

**Why human:** Redirect timing, React state-driven LiveBudgetBar updates, and step transitions require a live browser.

### 2. Negative Budget Warning

**Test:** Clear localStorage, navigate to /onboarding. Enter income = 100000. Add fixed expense of 500000.
**Expected:** LiveBudgetBar shows the negative value in RED text with "Expenses exceed income" below it. The "Next" button is still clickable (not disabled).
**Why human:** Visual CSS color rendering (text-red-400) and button enabled/disabled state require browser rendering.

### 3. Returning User — No Redirect

**Test:** After completing onboarding (Test 1), navigate to http://localhost:3000.
**Expected:** Dashboard placeholder loads directly. No redirect to /onboarding.
**Why human:** Depends on persisted localStorage state; the hydration timing behavior requires a real browser with real localStorage.

### 4. Symmetric Guard

**Test:** As a returning user (isOnboarded = true in localStorage), navigate directly to http://localhost:3000/onboarding.
**Expected:** Immediately redirected back to http://localhost:3000/.
**Why human:** Requires persisted state and real Zustand persist hydration cycle.

### 5. Swipe-to-Delete Gesture

**Test:** On Step 2, add a fixed expense. On a mobile device or with Chrome DevTools touch emulation, swipe the expense row left.
**Expected:** Red "Delete" button slides in from the right (translateX(-80px) on row). Tapping "Delete" removes the expense from the list.
**Why human:** Touch event simulation is unreliable in jsdom. Requires actual touch events or DevTools device emulation.

---

## Gaps Summary

No gaps found. All 20 observable truths are verified by static code analysis and the test suite (36/36 tests passing, `npx tsc --noEmit` exits 0). The 5 human verification items are UI/interaction behaviors that cannot be confirmed programmatically.

The only noteworthy scope clarification is BUDG-05 (month start day): the CONTEXT.md deliberately restricts the onboarding wizard to a hardcoded default of 1, with a settings UI planned for Phase 5. The calculation engine (`getRemainingDaysInPeriod`) fully implements the payday-based period logic including edge cases for startDay=31 in short months. This is the correct Phase 2 scope.

---

_Verified: 2026-03-10T01:20:00Z_
_Verifier: Claude (gsd-verifier)_
