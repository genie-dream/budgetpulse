# Phase 6: Tech Debt Fix - Research

**Researched:** 2026-03-14
**Domain:** Next.js 16 / next/font/local, next-intl, Zustand store logic, TypeScript named exports
**Confidence:** HIGH

## Summary

Phase 6 closes four discrete tech debt items identified in the v1.0 audit. Each item is isolated: a font swap in `layout.tsx`, i18n wiring in `transactions/page.tsx`, a Zustand store logic correction in `transactionStore.ts`, and an export style fix in `BudgetEditForm.tsx`. No new dependencies are needed. All fixes are surgical — they touch one file each, with a single exception being the BudgetEditForm task which also touches its import site (`settings/page.tsx`).

The largest risk is the DASH-07 fix: `transactionStore.addTransaction` currently has no knowledge of the current budget period. The fix requires that a backdated transaction (where `tx.date < periodStart`) is excluded from the in-memory array, preventing `totalSpent` inflation within a session. The cleanest approach is to read `periodStart` from `budgetStore` inside `addTransaction`, but since `transactionStore` must not import `budgetStore` (circular risk), the filter should be applied at the call site in `add/page.tsx` — or `addTransaction` should receive a `periodStart` parameter.

The i18n fix is straightforward: `transactions/page.tsx` does not yet call `useTranslations('history')`, but the keys `title`, `empty`, and `logFirst` already exist in both `en.json` and `ko.json`. Adding the hook and replacing three hardcoded strings is the full scope. The existing `TransactionsPage.test.tsx` does not mock `next-intl`, so a `vi.mock('next-intl', ...)` stub must be added there to prevent test breakage.

**Primary recommendation:** Fix all four items in separate tasks; no library additions required.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PWA-03 | App loads < 2s on mobile | Pretendard local font avoids Google Fonts network round-trip; `next/font/local` with `display: swap` and pre-loaded woff2 is the correct pattern |
| TRAN-05 | User can view transaction history grouped by date | i18n fix wires existing `history.title` / `history.empty` keys — functional behavior unchanged |
| TRAN-06 | User can filter transaction history by category | Same file as TRAN-05 — fix `useTranslations` call; filter logic untouched |
| DASH-07 | Dashboard updates < 100ms after a transaction is saved | Backdated filter prevents `totalSpent` inflation; architectural 100ms guarantee preserved since Zustand sync re-render is unchanged |
</phase_requirements>

---

## Standard Stack

### Core (already installed — no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next/font/local | 16.1.6 (built-in) | Load self-hosted woff2 with automatic `font-face` generation | Zero FOUT, no external DNS lookup, works offline (PWA) |
| next-intl | installed | `useTranslations` hook for component strings | Already in use; keys already defined in en.json / ko.json |
| zustand | 5.x (installed) | In-memory transaction store | Already in use; `addTransaction` logic is what needs fixing |

### No New Dependencies

All four fixes use already-installed packages. Do not add any new npm dependencies in this phase.

**Installation:** none required.

---

## Architecture Patterns

### Task 1: Pretendard Font (PWA-03)

**What exists:** `src/app/layout.tsx` already has the correct swap code in a comment block (lines 4–13). The font variable `--font-pretendard` is already wired to the `html` and `body` elements via `inter.variable` and `inter.className`. The only action is to download the font file, place it at `public/fonts/PretendardVariable.woff2`, and uncomment the `localFont` block while removing the `Inter` import.

**Pattern:**
```typescript
// Source: Next.js official docs — next/font/local
import localFont from 'next/font/local'

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
})
```

The `../../public/` path is relative to `src/app/layout.tsx`. With the current directory `src/app/`, `../../` resolves to the project root — this is the standard pattern for `next/font/local` when the font lives in `public/`.

**Variable font range:** `weight: '45 920'` is the correct range for Pretendard Variable (declared in the font's `font-face` definition). This matches the TODO comment already in `layout.tsx`.

**Download URL (verified in TODO comment):**
`https://github.com/orioncactus/pretendard/releases/download/v1.3.9/PretendardVariable.woff2`

**Offline compatibility:** Because the font is self-hosted in `public/`, it is bundled into the Serwist-managed cache at build time (the `__SW_MANIFEST` injection covers all static assets in `public/`). No special service worker change needed.

### Task 2: i18n Fix in transactions/page.tsx (TRAN-05, TRAN-06)

**What exists:**
- `messages/en.json` key `history.title = "History"` — matches hardcoded `'History'` on lines 69, 83, 103
- `messages/en.json` key `history.empty = "No transactions yet"` — matches hardcoded string on line 87
- `messages/en.json` key `history.logFirst = "Log your first one"` — matches CTA text on line 90
- `messages/ko.json` has all three keys translated to Korean

**Pattern (minimal change):**
```typescript
// Add at top of component function:
const t = useTranslations('history')

// Replace:
<h1>History</h1>  →  <h1>{t('title')}</h1>
<h2>No transactions yet</h2>  →  <h2>{t('empty')}</h2>
<Link>Log your first one</Link>  →  <Link>{t('logFirst')}</Link>
```

The `'History'` string appears in three places in the file (loading state header, empty state header, populated list header). All three must be replaced.

**Test impact:** `TransactionsPage.test.tsx` has no `vi.mock('next-intl', ...)` call. After adding `useTranslations` to the component, tests will fail unless the mock is added. The mock pattern from `dashboard.test.tsx` applies:
```typescript
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))
```
With this stub, the test assertions that check for text like `'No transactions yet'` must be updated to check for the translation key `'empty'` instead — OR the stub must return English strings. The simplest approach: make the stub return the English values by returning a lookup function:
```typescript
vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    const map: Record<string, string> = {
      title: 'History',
      empty: 'No transactions yet',
      logFirst: 'Log your first one',
    }
    return map[key] ?? key
  },
}))
```
This avoids changing all existing test assertions.

### Task 3: DASH-07 Backdated Transaction Filter

**Root cause:** `transactionStore.addTransaction` in `src/stores/transactionStore.ts` (line 21-22) blindly prepends any transaction to the in-memory array:
```typescript
addTransaction: (transaction) =>
  set((state) => ({ transactions: [transaction, ...state.transactions] })),
```
The dashboard's Dexie load (in `src/app/page.tsx` lines 57-69) correctly filters by `periodStart`, but `addTransaction` bypasses that filter for newly-added transactions within the same session.

**Fix approach — filter at call site in `add/page.tsx`:**

`transactionStore` must not import `budgetStore` (creates a circular dependency since the dashboard imports both). Instead, the fix belongs in `add/page.tsx`'s `handleSave` function: only call `addTransaction` when the transaction's date falls within the current period.

```typescript
// In add/page.tsx handleSave():
import { getPeriodStartDate } from '@/lib/budget'
import { useBudgetStore } from '@/stores/budgetStore'

// At component level:
const config = useBudgetStore((s) => s.config)

// In handleSave():
const periodStart = config
  ? getPeriodStartDate(new Date(), config.monthStartDay)
  : new Date(0)

await db.transactions.add(tx)
if (tx.date >= periodStart) {
  useTransactionStore.getState().addTransaction(tx)
}
useTransactionStore.getState().setLastUsedCategory(selectedCategory)
router.push('/')
```

**Why not in the store itself:** `transactionStore` is a pure display cache with no knowledge of budget periods. Injecting period awareness into the store would couple two separate concerns. The call-site filter is the cleanest pattern consistent with existing architecture.

**Alternative (also valid):** Add a `periodStart: Date` parameter to `addTransaction` and filter inside the store action. This keeps the filter co-located with the mutation but requires updating the function signature and all callers.

**Existing test coverage:** `tests/transactions.test.ts` covers `useTransactionStore` directly. A unit test for the backdated filter behavior should be added: call `addTransaction` with a backdated transaction and verify `totalSpent` (sum of `transactions`) does not include it. However, since the fix is at the call site in `add/page.tsx`, the test would be an RTL test on `AddPage.test.tsx` or a unit test on the page's `handleSave` logic — both are viable.

### Task 4: BudgetEditForm Named Export

**What exists:** `src/components/settings/BudgetEditForm.tsx` line 30:
```typescript
export default function BudgetEditForm(...) {
```

**What the plan spec requires (05-03):** `export const BudgetEditForm`

**Import site:** `src/app/settings/page.tsx` line 8:
```typescript
import BudgetEditForm from '@/components/settings/BudgetEditForm'
```

**Fix:** Two-file change.

File 1 — `BudgetEditForm.tsx`:
```typescript
// Before:
export default function BudgetEditForm({ config, onSave }: BudgetEditFormProps) {

// After:
export const BudgetEditForm = function({ config, onSave }: BudgetEditFormProps) {
// OR:
export function BudgetEditForm({ config, onSave }: BudgetEditFormProps) {
```

File 2 — `settings/page.tsx`:
```typescript
// Before:
import BudgetEditForm from '@/components/settings/BudgetEditForm'

// After:
import { BudgetEditForm } from '@/components/settings/BudgetEditForm'
```

**No functional change.** The wiring is already correct; this is a consistency fix only. TypeScript will catch the import mismatch at build time if only one file is updated.

**Test coverage:** `tests/settings.test.ts` should be checked for any import of `BudgetEditForm`. If it uses a default import, it must be updated too.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Self-hosted font loading | Custom CSS @font-face in globals.css | `next/font/local` | Automatic font optimization, subset generation, display:swap, offline-compatible via static asset |
| Translation key lookup | Custom i18n map objects in component | `useTranslations('history')` | next-intl is already installed, keys already exist — no new code needed |

---

## Common Pitfalls

### Pitfall 1: Wrong path in `next/font/local` src
**What goes wrong:** `src` is relative to the file that calls `localFont()`, not to the project root. From `src/app/layout.tsx`, the correct path to `public/fonts/PretendardVariable.woff2` is `../../public/fonts/PretendardVariable.woff2` — NOT `/fonts/PretendardVariable.woff2` (which is the URL path, not the filesystem path).
**How to avoid:** Use the exact path from the existing TODO comment in `layout.tsx` which was written with this in mind.

### Pitfall 2: TransactionsPage tests break silently after i18n
**What goes wrong:** `TransactionsPage.test.tsx` renders the component without a `next-intl` provider or mock. After adding `useTranslations`, the render will throw unless mocked. The test file has no `vi.mock('next-intl', ...)`.
**How to avoid:** Add the mock before the page import in `TransactionsPage.test.tsx`. Update assertions that check text content to match what the mock returns (either English strings via lookup, or the key names if using the simplest `(key) => key` stub).

### Pitfall 3: DASH-07 fix breaks the router.push timing
**What goes wrong:** If the backdated-transaction guard in `handleSave` runs after `router.push('/')`, the dashboard may navigate before the store state is updated.
**How to avoid:** Apply the guard before `router.push`. The order in `handleSave` must be: (1) Dexie write, (2) conditional store update, (3) setLastUsedCategory, (4) router.push.

### Pitfall 4: BudgetEditForm — `export function` vs `export const`
**What goes wrong:** `export default function` and `export function` (named) are different. After removing `default`, the settings/page.tsx import must change from default to named import. Forgetting to update `settings/page.tsx` causes a TypeScript error and runtime import failure.
**How to avoid:** Both files must be updated in the same task. Run `npx tsc --noEmit` after the change to verify.

### Pitfall 5: Font file not in git / not in public directory
**What goes wrong:** If `PretendardVariable.woff2` is downloaded but the font file is not committed (or is in `.gitignore`), the production build will fail on Vercel with a font-not-found error.
**How to avoid:** Verify `public/fonts/` is not in `.gitignore`. Large binary files like woff2 are typically committed directly for PWA projects that need offline font support.

---

## Code Examples

### next/font/local — Self-Hosted Variable Font
```typescript
// Source: Next.js official docs — next/font/local
// File: src/app/layout.tsx
import localFont from 'next/font/local'

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
})

// In RootLayout:
<html className={pretendard.variable}>
  <body className={pretendard.className}>
```

### next-intl — useTranslations in a Client Component
```typescript
// Source: next-intl docs
'use client'
import { useTranslations } from 'next-intl'

export default function TransactionsPage() {
  const t = useTranslations('history')
  // ...
  return <h1>{t('title')}</h1>  // renders "History" (en) or "내역" (ko)
}
```

### Zustand — Period-Aware addTransaction at Call Site
```typescript
// File: src/app/add/page.tsx
import { getPeriodStartDate } from '@/lib/budget'
import { useBudgetStore } from '@/stores/budgetStore'

// In component:
const config = useBudgetStore((s) => s.config)

// In handleSave():
const periodStart = config
  ? getPeriodStartDate(new Date(), config.monthStartDay)
  : new Date(0)  // defensive: include if no config

await db.transactions.add(tx)
if (tx.date >= periodStart) {
  useTransactionStore.getState().addTransaction(tx)
}
```

### Named Export Pattern
```typescript
// BudgetEditForm.tsx — named export
export function BudgetEditForm({ config, onSave }: BudgetEditFormProps) { ... }

// settings/page.tsx — named import
import { BudgetEditForm } from '@/components/settings/BudgetEditForm'
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + @testing-library/react |
| Config file | `vitest.config.mts` |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Baseline
Current suite: **105 passed, 1 todo, 1 skipped** (12 test files). All 105 pass. This is the green baseline Phase 6 must preserve.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PWA-03 | Pretendard loads from public/fonts (font file present) | file-exists smoke | `test -f public/fonts/PretendardVariable.woff2` | Wave 0 gap |
| TRAN-05 | Transactions page renders "History" from i18n key | unit (RTL) | `npx vitest run tests/TransactionsPage.test.tsx` | Yes (needs mock update) |
| TRAN-06 | Category filter still works after i18n change | unit (RTL) | `npx vitest run tests/TransactionsPage.test.tsx` | Yes (needs mock update) |
| DASH-07 | Backdated transaction does not inflate totalSpent | unit (store) | `npx vitest run tests/transactions.test.ts` | Wave 0 gap |
| BudgetEditForm export | Named import resolves correctly | TypeScript compile | `npx tsc --noEmit` | N/A (build gate) |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green + `npx tsc --noEmit` clean before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Add `vi.mock('next-intl', ...)` to `tests/TransactionsPage.test.tsx` — required before TRAN-05/TRAN-06 fix lands
- [ ] `tests/transactions.test.ts` — add unit test for backdated transaction filter (covers DASH-07)
- [ ] `public/fonts/PretendardVariable.woff2` — must be present before PWA-03 can be smoke-tested

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|-----------------|-------|
| Inter (Google Fonts) in layout.tsx | Pretendard Variable (self-hosted) | Swap: remove `next/font/google` Inter import, add `next/font/local` |
| Hardcoded 'History' strings in transactions/page.tsx | `useTranslations('history')` | All three occurrences replaced |
| `export default function BudgetEditForm` | `export function BudgetEditForm` | Named export per plan 05-03 spec |
| `addTransaction` appends all transactions | `addTransaction` only called when `tx.date >= periodStart` | DASH-07 edge case fix |

---

## Open Questions

1. **Font file network availability**
   - What we know: The TODO comment in `layout.tsx` provides the exact GitHub release URL (`v1.3.9/PretendardVariable.woff2`)
   - What's unclear: Whether the network is available during Phase 6 execution (it was unavailable during Phase 1)
   - Recommendation: Download via `curl` or `wget` in Task 1; if unavailable, document as blocked and keep Inter as fallback

2. **DASH-07: store-level vs call-site filter**
   - What we know: Both approaches are architecturally valid
   - What's unclear: Whether future callers of `addTransaction` (e.g. import restore in DataManagement) need the same guard
   - Recommendation: The call-site approach in `add/page.tsx` is lower risk for this phase since it only touches the one caller that creates backdated transactions; import restore via Dexie does not call `addTransaction`

3. **`settings.test.ts` — BudgetEditForm import**
   - What we know: `tests/settings.test.ts` is listed as an `it.todo` stub file (from Plan 05-01 decisions)
   - What's unclear: Whether it imports BudgetEditForm by default or named import
   - Recommendation: Read the file before Task 4 execution to check; likely a todo stub with no real imports

---

## Sources

### Primary (HIGH confidence)
- Direct source code read: `src/app/layout.tsx` — TODO comment documents exact font swap instructions
- Direct source code read: `src/app/transactions/page.tsx` — three hardcoded strings identified
- Direct source code read: `src/stores/transactionStore.ts` — `addTransaction` implementation confirmed
- Direct source code read: `src/components/settings/BudgetEditForm.tsx` — `export default` confirmed on line 30
- Direct source code read: `src/app/settings/page.tsx` — default import confirmed on line 8
- Direct source code read: `messages/en.json` and `messages/ko.json` — `history.title`, `history.empty`, `history.logFirst` keys confirmed present
- Direct source code read: `tests/TransactionsPage.test.tsx` — no next-intl mock confirmed; assertions use English strings
- Direct source code read: `tests/dashboard.test.tsx` — `vi.mock('next-intl', ...)` pattern confirmed

### Secondary (MEDIUM confidence)
- `.planning/v1.0-MILESTONE-AUDIT.md` — tech debt items cross-referenced against source code observations
- Next.js 16 `next/font/local` docs (verified via existing TODO comment in layout.tsx which was written against the official pattern)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, no new dependencies
- Architecture: HIGH — all four changes are in-place edits to existing files with clear before/after states confirmed by source reads
- Pitfalls: HIGH — test breakage, font path, and export consistency risks confirmed by reading actual test files and component code

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable stack — no fast-moving dependencies)
