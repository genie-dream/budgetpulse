# Phase 3: Transaction Logging - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can log spending quickly (amount + category in 3 taps or fewer) and browse their full transaction history grouped by date with category filtering. Dashboard display and analytics are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Quick logging flow
- Amount field auto-focused when Add form opens — keyboard appears immediately, no extra tap to focus
- Category row visible below the amount field without scrolling — available as tap 2
- Memo and date are collapsed by default; expandable via an "Add details" link below the category row
- After tapping Save: navigate to dashboard (home screen) so user sees the updated Survival Budget immediately

### Amount entry style
- Native OS numeric keyboard via `inputmode="numeric" pattern="[0-9]*"` — satisfies TRAN-02, no custom keypad needed
- Currency-aware input: KRW accepts integers only; USD and JPY allow decimals
- Currency symbol prefixed to the input field (e.g., ₩1,200, $9.99) — symbol sourced from `settingsStore.currency`

### Category selection on Add form
- Horizontal scrollable row of emoji+label chips displayed below the amount field
- Last used category pre-selected when form opens — persisted so repeat entries need no re-selection
- Selected chip: filled blue background (#3B82F6) + white text
- Unselected chips: dark surface chip (slate-700/800)

### History list display
- Each transaction row shows: category emoji icon + category label, amount (large/prominent), memo if present, time-of-day
- Date group headers: sticky section header with smart labels ('Today', 'Yesterday', then 'Mar 8' format) + daily total on the right side
- Category filter: horizontal scrollable chips at top of History page — 'All' chip plus one chip per category the user has actually used
- Filtering triggered instantly on chip tap; uses in-memory filter on the already-loaded `transactions` array (avoids Dexie re-fetch flicker on mobile)
- Empty state: illustration + "No transactions yet" + "Log your first one" CTA button that links to `/add`

### Claude's Discretion
- Exact illustration/icon for the empty state (wallet, receipt, or similar)
- Animation/transition when the Add form opens or after save
- Loading state while Dexie write completes before navigation
- Exact spacing, typography sizing, and border radius for chips and transaction rows

</decisions>

<specifics>
## Specific Ideas

- "3 taps or fewer" path: tap FAB (tap 1) → form opens auto-focused → type amount (no tap) → tap category chip (tap 2) → tap Save (tap 3) ✓
- The Add form is a full-screen page at `/add` (not a modal/sheet) — BottomNav already routes there as the center FAB
- Last-used category persistence: simple Zustand store entry (no Dexie table needed), reset only if app data is cleared
- Daily total in date group header reinforces awareness of per-day spending — core product value

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/SwipeToDelete.tsx`: fully implemented — swipe left ≥60px reveals red delete button. Wrap each transaction row with this component (TRAN-04)
- `src/stores/transactionStore.ts`: `addTransaction`, `removeTransaction`, `setTransactions`, `setLoading` — all ready. In-memory display cache, Dexie is source of truth
- `src/lib/db.ts`: `db.transactions` table with `id, date, category, [date+category]` compound index — ready for all TRAN queries
- `src/types/index.ts`: `Transaction` type fully typed: `{ id, amount, category, memo?, date, createdAt }`
- `src/lib/constants.ts`: `CATEGORIES` array — 9 categories, each with `id`, `labelEn`, `labelKo`, `emoji` — use for chip rendering
- `src/app/add/page.tsx`: placeholder ready to replace with Add form
- `src/app/transactions/page.tsx`: placeholder ready to replace with History page
- `src/lib/budget.ts`: `formatCurrency` exists — use for displaying amounts in rows and chips

### Established Patterns
- Zustand with `skipHydration: true` for SSR-safe stores — follow for any new state (e.g., lastUsedCategory)
- Dexie is source of truth; Zustand is display cache — load transactions from Dexie on mount, hydrate store
- Cookie-based locale (next-intl) already set up — use `useTranslations` for any new UI strings
- Mobile-first: touch targets ≥44×44px, safe area insets, swipe gestures for delete

### Integration Points
- After `db.transactions.add(transaction)`: call `transactionStore.addTransaction()` to update in-memory cache; then `router.push('/')` to return to dashboard
- Dashboard (Phase 4) will subscribe to `transactionStore.transactions` for real-time Survival Budget recalculation
- Category chip filter on History page: in-memory filter (`transactions.filter(tx => tx.category === selected)`) on the cached array — no Dexie re-query on chip tap
- `formatCurrency` in `src/lib/budget.ts` used for: amount prefix symbol on Add form, amounts in history rows, daily totals in date group headers

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-transaction-logging*
*Context gathered: 2026-03-10*
