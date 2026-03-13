# Phase 3: Transaction Logging - Research

**Researched:** 2026-03-13
**Domain:** Next.js 16 App Router / React 19 / Dexie.js v4 / Zustand v5 / mobile-first PWA forms
**Confidence:** HIGH

## Summary

Phase 3 builds on a fully established infrastructure: Dexie v4 with a transactions table and compound index already provisioned, a complete transactionStore with all CRUD actions wired, SwipeToDelete component fully implemented, and both `/add` and `/transactions` pages as empty placeholders awaiting replacement. All architectural patterns (skipHydration, Dexie-as-source-of-truth, next-intl for strings, Tailwind v4 dark theme) are already proven in Phase 2.

The two new pages to build are: (1) the Add Transaction form at `/add` with auto-focused amount field, horizontal category chip row, collapsible details, and save-then-navigate flow; and (2) the Transaction History page at `/transactions` with date-grouped sticky headers, per-day totals, a horizontal category filter chip row using the `[date+category]` compound index, and swipe-to-delete on each row. A small Zustand slice for `lastUsedCategory` persistence needs to be added following existing store patterns.

The core implementation risk is the 3-tap UX contract (TRAN-03): the amount field must auto-focus immediately when the page mounts to avoid requiring an extra tap. On iOS Safari, `autoFocus` on an input does not reliably open the software keyboard unless the focus is triggered from a user gesture; however, since the user navigates to `/add` by tapping the FAB, the page-load focus should be considered gesture-triggered and will open the keyboard. This is a well-known iOS quirk to verify during testing.

**Primary recommendation:** Build the Add form first (TRAN-01, TRAN-02, TRAN-03), then the History page (TRAN-04, TRAN-05, TRAN-06). Both pages are self-contained replacements of existing placeholder files. No new dependencies required.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Quick logging flow**
- Amount field auto-focused when Add form opens — keyboard appears immediately, no extra tap to focus
- Category row visible below the amount field without scrolling — available as tap 2
- Memo and date are collapsed by default; expandable via an "Add details" link below the category row
- After tapping Save: navigate to dashboard (home screen) so user sees the updated Survival Budget immediately

**Amount entry style**
- Native OS numeric keyboard via `inputmode="numeric" pattern="[0-9]*"` — satisfies TRAN-02, no custom keypad needed
- Currency-aware input: KRW accepts integers only; USD and JPY allow decimals
- Currency symbol prefixed to the input field (e.g., ₩1,200, $9.99) — symbol sourced from `settingsStore.currency`

**Category selection on Add form**
- Horizontal scrollable row of emoji+label chips displayed below the amount field
- Last used category pre-selected when form opens — persisted so repeat entries need no re-selection
- Selected chip: filled blue background (#3B82F6) + white text
- Unselected chips: dark surface chip (slate-700/800)

**History list display**
- Each transaction row shows: category emoji icon + category label, amount (large/prominent), memo if present, time-of-day
- Date group headers: sticky section header with smart labels ('Today', 'Yesterday', then 'Mar 8' format) + daily total on the right side
- Category filter: horizontal scrollable chips at top of History page — 'All' chip plus one chip per category the user has actually used
- Filtering triggered instantly on chip tap; uses Dexie's `[date+category]` compound index
- Empty state: illustration + "No transactions yet" + "Log your first one" CTA button that links to `/add`

### Claude's Discretion
- Exact illustration/icon for the empty state (wallet, receipt, or similar)
- Animation/transition when the Add form opens or after save
- Loading state while Dexie write completes before navigation
- Exact spacing, typography sizing, and border radius for chips and transaction rows

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TRAN-01 | User can log a transaction with amount and category (required), memo and date (optional) | Add form replaces placeholder at `/add`; `db.transactions.add()` + `transactionStore.addTransaction()` wired in sequence |
| TRAN-02 | Amount input uses mobile numeric keypad (`inputmode="numeric" pattern="[0-9]*"`) | Native HTML attribute — no library needed; confirmed to suppress text keyboard on iOS/Android |
| TRAN-03 | Transaction logging completes in 3 taps or fewer | FAB tap (1) → auto-focus opens keyboard → type amount (no tap) → category chip (2) → Save (3); auto-focus is the critical enabler |
| TRAN-04 | User can delete a transaction via swipe gesture | `SwipeToDelete` component fully implemented at `src/components/ui/SwipeToDelete.tsx` — wrap each history row |
| TRAN-05 | User can view transaction history grouped by date | Load all transactions from Dexie, sort descending by `date`, group by ISO date string, render sticky date headers |
| TRAN-06 | User can filter transaction history by category | `[date+category]` compound index on `db.transactions`; category filter chip row triggers Dexie query |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Dexie.js | ^4.3.0 (installed) | IndexedDB queries for transaction persistence and filtering | Already provisioned with correct schema + compound index |
| Zustand | ^5.0.11 (installed) | In-memory display cache + lastUsedCategory persistence | Established pattern from Phase 2 |
| React 19 / Next.js 16 App Router | Installed | Page components, hooks, routing | Project foundation |
| next-intl | ^4.8.3 (installed) | `useTranslations` for all new UI strings | Established pattern; messages keys already partially present in `en.json` |
| Tailwind CSS v4 | Installed | Mobile-first styling, chip design, sticky headers | Project standard |
| Lucide React | Installed | Icons for empty state, detail toggle, etc. | Project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `SwipeToDelete` (internal) | Implemented | Swipe-left-to-reveal-delete UX | Wrap every TransactionRow in History page |
| `formatCurrency` (internal) | `src/lib/budget.ts` | Currency formatting for amounts and daily totals | Every numeric display in both pages |
| `CATEGORIES` (internal) | `src/lib/constants.ts` | Source of truth for chips on both Add and History pages | Category chip rendering |
| `fake-indexeddb` | ^6.2.5 (devDep, installed) | In-memory IndexedDB for vitest | All Dexie tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `inputmode="numeric"` | Custom numeric keypad | Custom keypad violates TRAN-02 decision — locked |
| Full-screen page for Add | Modal / bottom sheet | Decided as full-screen page in CONTEXT.md — locked |
| Dexie compound index for filtering | Client-side JS filter | Dexie index is faster, already indexed — use it |

**Installation:** No new dependencies required. All packages already installed.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── add/
│   │   └── page.tsx          # Replace placeholder with AddTransactionPage
│   └── transactions/
│       └── page.tsx          # Replace placeholder with TransactionHistoryPage
├── components/
│   ├── transactions/
│   │   ├── CategoryChips.tsx   # Shared chip row (used on both pages)
│   │   ├── TransactionRow.tsx  # Single row with SwipeToDelete wrapper
│   │   └── DateGroupHeader.tsx # Sticky date header + daily total
│   └── ui/
│       └── SwipeToDelete.tsx   # Already implemented
└── stores/
    └── transactionStore.ts     # Add lastUsedCategory slice here
```

Note: `CategoryChips.tsx` handles the chip row for the Add form (all 9 CATEGORIES) and a variant for History filter ('All' + used categories). They share the same visual design — consider a single component with a prop for available categories.

### Pattern 1: Dexie Load on Mount + Store Hydration
**What:** On page mount, read from Dexie into Zustand, then render from Zustand.
**When to use:** Both `/add` (needs lastUsedCategory) and `/transactions` (needs full transaction list).
**Example:**
```typescript
// Source: established in Phase 2 (onboarding page pattern)
useEffect(() => {
  db.transactions.orderBy('date').reverse().toArray().then((txns) => {
    transactionStore.getState().setTransactions(txns)
  })
}, [])
```

### Pattern 2: Dexie Write then Store Update then Navigate
**What:** Write to Dexie first (source of truth), then update Zustand cache, then navigate.
**When to use:** Save on Add form (TRAN-01 integration point).
```typescript
// Source: integration point documented in CONTEXT.md
const tx: Transaction = { id: crypto.randomUUID(), amount, category, memo, date, createdAt: new Date() }
await db.transactions.add(tx)
useTransactionStore.getState().addTransaction(tx)
router.push('/')
```

### Pattern 3: Dexie Filtered Query via Compound Index
**What:** Use the `[date+category]` index for category-filtered queries, falling back to full `orderBy('date').reverse()` for 'All'.
**When to use:** Category filter chip tap on History page.
```typescript
// Source: Dexie v4 compound index pattern; index defined in db.ts line 13
const txns = selectedCategory === 'all'
  ? await db.transactions.orderBy('date').reverse().toArray()
  : await db.transactions.where('category').equals(selectedCategory).sortBy('date')
      .then(arr => arr.reverse())
```

Note: The compound `[date+category]` index enables queries filtered by both date range AND category simultaneously, which matters for analytics (Phase 5) but for Phase 3 simple category filtering, `where('category').equals()` on its own index is sufficient and simpler.

### Pattern 4: Date Grouping for History
**What:** Group a flat sorted array into `Map<string, Transaction[]>` keyed by ISO date.
**When to use:** Rendering the grouped history list.
```typescript
// Pure transformation — no library needed
function groupByDate(txns: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>()
  for (const tx of txns) {
    const key = tx.date.toISOString().slice(0, 10) // 'YYYY-MM-DD'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(tx)
  }
  return map
}
```

### Pattern 5: Smart Date Label
**What:** Convert ISO date string to 'Today', 'Yesterday', or locale-formatted 'Mar 8'.
**When to use:** Date group header labels on History page.
```typescript
function smartDateLabel(isoDate: string, locale: string): string {
  const today = new Date()
  const date = new Date(isoDate)
  const todayKey = today.toISOString().slice(0, 10)
  const yesterdayKey = new Date(today.getTime() - 86400000).toISOString().slice(0, 10)
  if (isoDate === todayKey) return 'Today'
  if (isoDate === yesterdayKey) return 'Yesterday'
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}
```

### Pattern 6: lastUsedCategory in Zustand
**What:** Persist the last used category in Zustand (not Dexie) using localStorage persist.
**When to use:** Pre-selecting category chip on Add form.
```typescript
// Follow existing settingsStore pattern with skipHydration: true
// Add to transactionStore OR create a small uiStore
// CONTEXT.md says: "simple Zustand store entry (no Dexie table needed)"
interface TransactionStore {
  // ... existing
  lastUsedCategory: Category
  setLastUsedCategory: (cat: Category) => void
}
```
Decision: Add `lastUsedCategory` to the existing `transactionStore` to avoid a new file. It does not need `persist` middleware since it's in-memory only and resets on app data clear (CONTEXT.md: "reset only if app data is cleared"). Use `'food'` as the initial default (first category in CATEGORIES).

### Anti-Patterns to Avoid
- **Calling `router.push('/')` before `db.transactions.add()` resolves:** Dexie writes are async — always `await` before navigating. Otherwise dashboard (Phase 4) reads stale data.
- **Filtering transactions in JS after fetching all:** Use Dexie index queries — more efficient and the infrastructure is already built.
- **Using `new Date()` for date group keys with timezone offset:** `date.toISOString()` returns UTC. Use local-time date string for grouping to avoid off-by-one errors near midnight.
- **Forgetting `'use client'` directive on Add/History pages:** Both use hooks (useState, useEffect, useRouter) — they must be Client Components.
- **Reading settingsStore.currency before hydration:** settingsStore uses `skipHydration: true`. Call `useSettingsStore.getState().manuallyApplyInitialState()` in `onFinishHydration` callback, or read after the hydration flag is set (established Phase 2 pattern).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Swipe-to-delete gesture | Custom touch handler | `SwipeToDelete` (already in `src/components/ui/SwipeToDelete.tsx`) | Already handles horizontal dominance guard, 60px threshold, iOS scroll conflict |
| Currency formatting | `'₩' + amount.toLocaleString()` | `formatCurrency(amount, currency)` from `src/lib/budget.ts` | Handles KRW/USD/JPY symbol placement, locale, decimal rules |
| IndexedDB queries | Raw indexedDB API calls | `db.transactions.*` Dexie methods | Dexie v4 API is already configured with correct indexes |
| Category list | Hardcoded emoji strings | `CATEGORIES` from `src/lib/constants.ts` | Single source of truth; used across all phases |
| UUID generation | Random string generation | `crypto.randomUUID()` | Web Crypto API — available in all browsers, no import needed |

**Key insight:** Phase 3 is primarily UI wiring, not infrastructure. The hard parts (IndexedDB, swipe gesture, currency, categories) are all done.

---

## Common Pitfalls

### Pitfall 1: iOS autoFocus Keyboard Pop-Up
**What goes wrong:** `autoFocus` on the amount `<input>` may not trigger the software keyboard on iOS Safari when the page renders from a Next.js client navigation.
**Why it happens:** iOS only opens the software keyboard in response to a trusted user interaction event. Next.js client-side navigation does not always qualify.
**How to avoid:** Use a `useEffect` with `inputRef.current?.focus()` after mount. Since the user tapped the FAB to navigate (a real gesture), the focus call in the first render frame is usually accepted by iOS. If it is not, add a `setTimeout(() => inputRef.current?.focus(), 50)` as a fallback.
**Warning signs:** In testing, the keyboard doesn't appear when navigating to `/add` via the FAB. Test on real device, not emulator.

### Pitfall 2: KRW Amount Parsing — No Decimals
**What goes wrong:** If the amount input value is parsed with `parseFloat`, a KRW user typing "1200" gets `1200.0` which is fine, but the validation logic must reject decimal input for KRW.
**Why it happens:** `inputmode="numeric"` does not enforce integer-only; the user can still type "." on some keyboards.
**How to avoid:** For KRW: `Math.round(parseFloat(value))` and reject/strip any `.` in the string. For USD/JPY: `parseFloat(value)` with appropriate decimal places. CONTEXT.md: "KRW accepts integers only; USD and JPY allow decimals."
**Warning signs:** KRW amounts stored as `1200.5` in Dexie.

### Pitfall 3: Date Object in Dexie vs. String Key
**What goes wrong:** `Transaction.date` is typed as `Date` (a JS Date object stored in IndexedDB). When grouping transactions by date, comparing `tx.date.toISOString()` may yield UTC dates that differ from local dates near midnight.
**Why it happens:** `new Date().toISOString()` always returns UTC. A transaction logged at 11pm KST on March 13 is stored as `2026-03-13T14:00:00Z` in UTC — correct for KST grouping — but a UTC+offset timezone could misplace it.
**How to avoid:** Use `new Date(tx.date.getFullYear(), tx.date.getMonth(), tx.date.getDate()).toISOString().slice(0,10)` for grouping key to use local date components.
**Warning signs:** Transactions appearing in wrong date group in history, especially around midnight.

### Pitfall 4: settingsStore Not Hydrated on Mount
**What goes wrong:** `useSettingsStore((s) => s.currency)` returns the default 'KRW' before Zustand has hydrated from localStorage, causing the currency symbol to flash from ₩ to $ if user set USD.
**Why it happens:** `settingsStore` uses `skipHydration: true` — hydration must be triggered manually.
**How to avoid:** Use `onFinishHydration` pattern established in Phase 2 (`src/app/onboarding/page.tsx`). For Add form, simply not rendering the currency prefix until hydrated is acceptable given the quick form interaction.
**Warning signs:** Currency symbol flash on mount.

### Pitfall 5: History Page Fetching All Transactions on Every Filter Change
**What goes wrong:** Re-fetching all transactions from Dexie on every category chip tap causes visible lag on large datasets.
**Why it happens:** Naive implementation re-queries without caching.
**How to avoid:** Load all transactions once on mount into `transactionStore.transactions`. Filter the in-memory array for category changes. Only re-fetch from Dexie when a new transaction is added. The Dexie compound index is the fast path for Phase 5 analytics aggregation, not needed for Phase 3 simple UI filtering.
**Warning signs:** Visible lag (>100ms) when switching category chips.

---

## Code Examples

### Add Transaction — Core Save Handler
```typescript
// Source: CONTEXT.md integration notes + established Phase 2 Dexie pattern
async function handleSave() {
  if (!amountValue || !selectedCategory) return
  const amount = currency === 'KRW'
    ? Math.round(parseFloat(amountValue))
    : parseFloat(amountValue)
  const tx: Transaction = {
    id: crypto.randomUUID(),
    amount,
    category: selectedCategory,
    memo: memo.trim() || undefined,
    date: selectedDate ?? new Date(),
    createdAt: new Date(),
  }
  await db.transactions.add(tx)
  useTransactionStore.getState().addTransaction(tx)
  useTransactionStore.getState().setLastUsedCategory(selectedCategory)
  router.push('/')
}
```

### Category Chip Component (shared across Add and History)
```typescript
// Source: CONTEXT.md decisions — selected: #3B82F6 bg + white text; unselected: slate-700/800
interface CategoryChipsProps {
  categories: typeof CATEGORIES
  selected: Category | 'all'
  onSelect: (id: Category | 'all') => void
  showAll?: boolean
}

// Scroll container: overflow-x-auto, flex, gap-2, px-4, py-3
// Chip: px-3 py-1.5 rounded-full text-sm font-medium min-h-[44px] flex items-center gap-1.5
// Selected: bg-blue-500 text-white
// Unselected: bg-slate-700 text-slate-300
```

### Dexie Category Filter (History page)
```typescript
// Source: CONTEXT.md — "uses Dexie's [date+category] compound index"
// For Phase 3 simplicity, use per-category index (sufficient)
const loadTransactions = async (filter: Category | 'all') => {
  const txns = filter === 'all'
    ? await db.transactions.orderBy('date').reverse().toArray()
    : await db.transactions
        .where('category').equals(filter)
        .toArray()
        .then(arr => arr.sort((a, b) => b.date.getTime() - a.date.getTime()))
  useTransactionStore.getState().setTransactions(txns)
}
```

### Auto-Focus Amount Input
```typescript
// Source: iOS autoFocus workaround pattern
const amountRef = useRef<HTMLInputElement>(null)
useEffect(() => {
  // Timeout helps iOS accept focus as gesture-triggered
  const t = setTimeout(() => amountRef.current?.focus(), 50)
  return () => clearTimeout(t)
}, [])

// In JSX:
<input
  ref={amountRef}
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  value={amountValue}
  onChange={(e) => setAmountValue(e.target.value)}
  className="..."
  placeholder="0"
/>
```

### i18n Keys Needed (additions to messages/en.json + ko.json)
```json
// Add to existing "add" namespace:
{
  "add": {
    "title": "Add Transaction",       // exists
    "amount": "Amount",               // exists
    "category": "Category",           // exists
    "memo": "Memo (optional)",        // exists
    "date": "Date",                   // exists
    "addDetails": "Add details",
    "save": "Save"
  },
  "history": {
    "title": "History",               // exists
    "empty": "No transactions yet",   // exists
    "logFirst": "Log your first one",
    "today": "Today",
    "yesterday": "Yesterday",
    "all": "All",
    "deleteConfirm": "Delete"
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Dexie v3 Promise API | Dexie v4 (same API, better TypeScript generics) | Dexie v4 (2023) | No API change for Phase 3 usage |
| `type="number"` for numeric input | `type="text" inputmode="numeric" pattern="[0-9]*"` | iOS 8+ / current best practice | Prevents iOS zoom on focus, allows custom formatting |
| Manual date formatting | `Intl.DateTimeFormat` / `toLocaleDateString` | Always available in modern browsers | No extra library for date display |

**Deprecated/outdated:**
- `type="number"` for mobile amount inputs: causes iOS font size zoom, fractional spinners, and locale decimal symbol conflicts. Always use `type="text" inputmode="numeric"`.

---

## Open Questions

1. **Currency symbol prefix vs. suffix for JPY**
   - What we know: `formatCurrency(1200, 'JPY')` returns `'¥1,200'` via `Intl.NumberFormat ja-JP`
   - What's unclear: For the Add form, the user types the bare number while seeing the symbol prefix. For JPY this is natural (¥1200). No issue expected.
   - Recommendation: Display `formatCurrency(0, currency).replace('0', '').trim()` to extract the symbol for the prefix, or hard-code the three symbols (₩, $, ¥).

2. **Empty state illustration asset**
   - What we know: CONTEXT.md defers this to Claude's discretion (wallet, receipt, or similar)
   - What's unclear: Whether to use an SVG inline, a Lucide icon composition, or a placeholder
   - Recommendation: Use Lucide's `Receipt` icon (size 48, text-slate-600) as the empty state illustration — no asset to download, consistent with project icon library.

3. **Transaction row time display**
   - What we know: CONTEXT.md says rows show "time-of-day"
   - What's unclear: `Transaction.date` is a Date object — is it the date of the transaction (user-selected date) or the createdAt timestamp?
   - Recommendation: Display `tx.createdAt` time-of-day for the row (when the entry was logged), and `tx.date` for grouping (which date the expense belongs to). This matches common expense app patterns.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 with jsdom |
| Config file | `vitest.config.mts` |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test -- --run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TRAN-01 | `db.transactions.add()` persists a transaction with all fields | unit | `npm test -- --run tests/transactions.test.ts` | Wave 0 |
| TRAN-01 | `transactionStore.addTransaction()` prepends to array | unit | `npm test -- --run tests/transactions.test.ts` | Wave 0 |
| TRAN-02 | Amount input has `inputmode="numeric"` and `pattern="[0-9]*"` | unit (RTL) | `npm test -- --run tests/AddPage.test.tsx` | Wave 0 |
| TRAN-03 | Add form renders with category chips visible without scrolling | unit (RTL) | `npm test -- --run tests/AddPage.test.tsx` | Wave 0 |
| TRAN-04 | SwipeToDelete.onDelete is called after swipe simulation | unit (RTL) | `npm test -- --run tests/SwipeToDelete.test.tsx` | Wave 0 |
| TRAN-05 | History page groups transactions by date, shows sticky headers | unit (RTL) | `npm test -- --run tests/TransactionsPage.test.tsx` | Wave 0 |
| TRAN-05 | `groupByDate()` helper groups correctly | unit | `npm test -- --run tests/transactions.test.ts` | Wave 0 |
| TRAN-05 | `smartDateLabel()` returns 'Today', 'Yesterday', formatted date | unit | `npm test -- --run tests/transactions.test.ts` | Wave 0 |
| TRAN-06 | Category filter chip tap triggers Dexie query and re-renders filtered list | unit (RTL) | `npm test -- --run tests/TransactionsPage.test.tsx` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --run`
- **Per wave merge:** `npm test -- --run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/transactions.test.ts` — covers TRAN-01 Dexie writes, `groupByDate`, `smartDateLabel` helpers
- [ ] `tests/AddPage.test.tsx` — covers TRAN-02, TRAN-03 (RTL render tests with jsdom)
- [ ] `tests/SwipeToDelete.test.tsx` — covers TRAN-04 (touch event simulation)
- [ ] `tests/TransactionsPage.test.tsx` — covers TRAN-05, TRAN-06 (RTL with fake-indexeddb)

Note: All test infra (vitest, jsdom, fake-indexeddb, @testing-library/react) already installed. No new devDependencies needed.

---

## Sources

### Primary (HIGH confidence)
- Codebase direct inspection — `src/lib/db.ts`, `src/stores/transactionStore.ts`, `src/components/ui/SwipeToDelete.tsx`, `src/lib/budget.ts`, `src/lib/constants.ts`, `src/types/index.ts`, `src/app/add/page.tsx`, `src/app/transactions/page.tsx`
- `package.json` — confirmed all dependency versions
- `.planning/phases/03-transaction-logging/03-CONTEXT.md` — locked implementation decisions
- `vitest.config.mts` — test runner configuration confirmed

### Secondary (MEDIUM confidence)
- Dexie v4 compound index query patterns — verified against existing `db.ts` schema definition and Phase 2 test patterns in `tests/db.test.ts`
- `inputmode="numeric" pattern="[0-9]*"` — established web standard for mobile numeric input without triggering text keyboard

### Tertiary (LOW confidence)
- iOS autoFocus + setTimeout workaround — community-known iOS Safari behavior; recommend testing on real device during verification

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed installed and in use
- Architecture: HIGH — patterns directly extrapolated from existing Phase 2 code
- Pitfalls: MEDIUM-HIGH — iOS autoFocus and date timezone pitfalls are well-known but should be verified on device
- Test map: HIGH — test framework and infra fully confirmed

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable stack, no fast-moving dependencies)
