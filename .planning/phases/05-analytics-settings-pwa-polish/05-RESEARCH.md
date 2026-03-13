# Phase 5: Analytics, Settings & PWA Polish - Research

**Researched:** 2026-03-13
**Domain:** Recharts v3, @serwist/next, dexie-export-import, Settings/Budget editing
**Confidence:** HIGH

---

## Summary

Phase 5 is the final v1 phase. It has four distinct sub-domains: (1) Analytics charts using Recharts v3 already installed, (2) Settings screen with in-place budget editing piped back through the existing Dexie + Zustand pipeline, (3) JSON backup/restore using dexie-export-import, and (4) PWA offline mode via @serwist/next replacing the Phase 1 stub service worker. All required libraries are either already installed (Recharts v3.8.0) or require a single `npm install` (@serwist/next, dexie-export-import).

The most fragile area is the @serwist/next + Next.js 16 integration. Next.js 16 defaults to Turbopack, but Serwist requires Webpack for the build. The `next build` script must be changed to `next build --webpack`. The dev script remains `next dev` (Turbopack). This is a known requirement, documented officially.

The second fragile area is recharts v3 breaking changes: `activeIndex` prop is removed from Pie/Bar, `activeShape`/`inactiveShape` props are deprecated, and the tooltip type changed from `TooltipProps` to `TooltipContentProps`. All usage must follow v3 conventions from the start.

**Primary recommendation:** Build analytics, settings, export/import first (no environment risk), then tackle @serwist/next as the final wave because it requires modifying `next.config.ts`, `tsconfig.json`, and `.gitignore`.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANLX-01 | Category donut chart for current month spending | Recharts v3 PieChart with innerRadius/outerRadius. Data derived from transactionStore by category aggregation. |
| ANLX-02 | Daily spending bar chart | Recharts v3 BarChart. Data derived from Dexie query grouped by local date key (same pattern as transactionHelpers groupByDate). |
| ANLX-03 | Monthly summary showing budget vs actual spend | Pure calculation with existing calcVariableBudget + totalSpent aggregation from Dexie for the queried month period. |
| ANLX-04 | User can browse analytics for past months | Month navigation state (previousN months offset). Each navigation triggers a new Dexie range query using getPeriodStartDate/getPeriodEndDate for that period. |
| SETT-01 | User can update income, fixed expenses, and savings goal | Reuse onboarding StepIncome/StepFixedExpenses/StepSavings UI. On save: db.budgetConfigs.put() upsert (same as onboarding) then useBudgetStore.setConfig() to sync Zustand. Dashboard recalculates immediately via Zustand subscription. |
| SETT-02 | User can export all data as a JSON file | dexie-export-import exportDB() returns Blob. Create anchor with URL.createObjectURL(blob) + programmatic click for download. |
| SETT-03 | User can import a JSON file to restore data (with structure validation) | Input type=file, FileReader or direct file ref, dexie-export-import importInto() with clearTablesBeforeImport: true. peakImportFile() for pre-validation of JSON structure. |
| PWA-02 | Core functionality works fully offline | @serwist/next 9.x with withSerwist wrapper in next.config.ts, app/sw.ts replaces public/sw.js stub, next build --webpack. |
</phase_requirements>

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.8.0 | PieChart (donut), BarChart | Already installed, v3 is current stable |
| dexie | 4.3.0 | Database queries for analytics/export | Already the project DB layer |
| zustand | 5.0.11 | Settings state + dashboard reactivity | Existing store pattern |
| next-intl | 4.8.3 | i18n keys for analytics/settings labels | Existing pattern |

### New Installs Required
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @serwist/next | 9.5.x | PWA service worker generation + offline | Official @serwist/next for Next.js App Router |
| serwist | 9.5.x (dev) | Service worker runtime (peer dep) | Required by @serwist/next |
| dexie-export-import | 4.x | Export/import Dexie DB to/from Blob | Official Dexie addon with streaming support |

**Installation:**
```bash
npm i @serwist/next && npm i -D serwist
npm i dexie-export-import
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| dexie-export-import | Manual JSON serialize/deserialize | Hand-rolled risks missing Date serialization, Blob types, version migration hooks |
| @serwist/next | Workbox directly | More manual config; @serwist/next is the Next.js-aware wrapper |
| Recharts PieChart | Recharts RadialBarChart | PieChart with innerRadius IS the standard donut; RadialBarChart is for different use case |

---

## Architecture Patterns

### Recommended Project Structure (additions for Phase 5)
```
src/
├── app/
│   ├── analytics/
│   │   └── page.tsx              # Replace stub — AnalyticsPage (client)
│   ├── settings/
│   │   └── page.tsx              # Replace stub — SettingsPage (client)
│   └── sw.ts                     # NEW: Serwist service worker source
├── components/
│   ├── analytics/
│   │   ├── DonutChart.tsx        # PieChart wrapper (category breakdown)
│   │   ├── DailyBarChart.tsx     # BarChart wrapper (daily spend)
│   │   └── MonthSummary.tsx      # Budget vs actual summary card
│   └── settings/
│       ├── BudgetEditForm.tsx    # Edit income/expenses/savings
│       └── DataManagement.tsx    # Export/import buttons
├── lib/
│   └── analyticsHelpers.ts       # Pure functions: aggregateByCategory, aggregateByDay
public/
└── sw.js                         # Serwist OUTPUT (generated, gitignored)
```

### Pattern 1: Month-scoped Dexie Query for Analytics
**What:** Query transactions for an arbitrary budget period using getPeriodStartDate + a computed end date.
**When to use:** ANLX-01, ANLX-02, ANLX-03 (current month) and ANLX-04 (past months).

```typescript
// analyticsHelpers.ts — pure functions
export function getPeriodEndDate(periodStart: Date, monthStartDay: number): Date {
  // End date = (startDay - 1) of the next month after periodStart
  const nextMonth = periodStart.getMonth() + 1
  const year = nextMonth > 11 ? periodStart.getFullYear() + 1 : periodStart.getFullYear()
  const month = nextMonth > 11 ? 0 : nextMonth
  const endDay = Math.min(monthStartDay - 1, daysInMonth(year, month))
  if (endDay <= 0) {
    // monthStartDay=1: period ends last day of periodStart's month
    return new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0)
  }
  return new Date(year, month, endDay)
}

// Usage in page
const start = getPeriodStartDate(referenceDate, config.monthStartDay)
const end = getPeriodEndDate(start, config.monthStartDay)
const txns = await db.transactions
  .where('date')
  .between(start, end, true, true)
  .toArray()
```

### Pattern 2: Recharts v3 Donut Chart (ANLX-01)
**What:** PieChart with innerRadius creates the donut hole. ResponsiveContainer for mobile sizing.
**Key v3 note:** Do NOT use `activeIndex` prop (removed). Do NOT use `activeShape`/`inactiveShape` as props — use `isActive` in the shape callback instead.

```typescript
// Source: recharts v3 API + migration guide
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { TooltipContentProps } from 'recharts'  // v3: was TooltipProps

const CATEGORY_COLORS: Record<Category, string> = {
  food: '#f97316',         // orange-500
  transport: '#3b82f6',    // blue-500
  shopping: '#a855f7',     // purple-500
  entertainment: '#ec4899', // pink-500
  health: '#22c55e',       // green-500
  education: '#eab308',    // yellow-500
  housing: '#14b8a6',      // teal-500
  communication: '#06b6d4', // cyan-500
  other: '#94a3b8',        // slate-400
}

function CustomTooltip({ active, payload }: TooltipContentProps<number, string>) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100">
      <p>{name}: {formatCurrency(value as number, currency)}</p>
    </div>
  )
}

<ResponsiveContainer width="100%" height={220}>
  <PieChart>
    <Pie
      data={chartData}
      dataKey="value"
      nameKey="name"
      innerRadius="55%"
      outerRadius="80%"
      paddingAngle={2}
    >
      {chartData.map((entry) => (
        <Cell key={entry.id} fill={CATEGORY_COLORS[entry.id as Category]} />
      ))}
    </Pie>
    <Tooltip content={<CustomTooltip />} />
  </PieChart>
</ResponsiveContainer>
```

### Pattern 3: Recharts v3 BarChart (ANLX-02)
**What:** Daily spending bars for the current period. XAxis shows day numbers.

```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// data: Array<{ day: string; amount: number }> — derived from daily aggregation
<ResponsiveContainer width="100%" height={180}>
  <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
    <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
    <Bar dataKey="amount" fill="#3b82f6" radius={[3, 3, 0, 0]} />
    <Tooltip content={<CustomBarTooltip />} />
  </BarChart>
</ResponsiveContainer>
```

### Pattern 4: Settings Save — Upsert + Store Sync (SETT-01)
**What:** Save updated BudgetConfig to Dexie (upsert) and sync to Zustand. Dashboard reacts immediately.
**Critical:** Keep `id` and `createdAt` from existing config on update. Only update `updatedAt`.

```typescript
async function handleSaveSettings(updates: Partial<BudgetConfig>) {
  if (!config) return
  const updated: BudgetConfig = {
    ...config,
    ...updates,
    updatedAt: new Date(),
  }
  await db.budgetConfigs.put(updated)       // upsert (same key=id)
  useBudgetStore.getState().setConfig(updated)  // sync Zustand immediately
}
```

### Pattern 5: JSON Export (SETT-02)
**What:** Export Dexie DB to Blob, trigger browser download via anchor + URL.createObjectURL.
**No external download library needed** — native browser anchor trick works on all target platforms.

```typescript
import { exportDB } from 'dexie-export-import'

async function handleExport() {
  const blob = await exportDB(db, { prettyJson: true })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `budgetpulse-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
```

### Pattern 6: JSON Import with Validation (SETT-03)
**What:** Read user-selected file, validate with peakImportFile, confirm with user, then importInto.

```typescript
import { importInto, peakImportFile } from 'dexie-export-import'

async function handleImport(file: File) {
  // Pre-validate structure before destructive import
  const meta = await peakImportFile(file)
  if (!meta.data.databaseName || !meta.data.tables) {
    throw new Error('Invalid backup file structure')
  }
  // Verify expected tables exist
  const tableNames = meta.data.tables.map(t => t.name)
  if (!tableNames.includes('transactions') || !tableNames.includes('budgetConfigs')) {
    throw new Error('Backup file missing required tables')
  }
  await importInto(db, file, { clearTablesBeforeImport: true })
  // Reload store from Dexie after import
  const configs = await db.budgetConfigs.toArray()
  if (configs.length > 0) {
    useBudgetStore.getState().setConfig(configs[configs.length - 1])
  }
}
```

### Pattern 7: @serwist/next Setup (PWA-02)
**What:** Replace public/sw.js stub with a generated Serwist service worker.
**Critical:** `next build --webpack` is required (Serwist cannot use Turbopack).

**next.config.ts changes:**
```typescript
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

export default withSerwist({ /* existing next config */ })
```

**app/sw.ts:**
```typescript
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}
declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()
```

**tsconfig.json additions:**
```json
{
  "compilerOptions": {
    "types": ["@serwist/next/typings"],
    "lib": ["dom", "dom.iterable", "esnext", "webworker"]
  },
  "exclude": ["public/sw.js"]
}
```

**package.json script change:**
```json
"build": "next build --webpack"
```

**.gitignore additions:**
```
public/sw.js
public/swe-worker*
```

### Anti-Patterns to Avoid
- **Using `activeIndex` on PieChart/BarChart:** Removed in recharts v3. Use Tooltip component instead.
- **`TooltipProps` import:** Changed to `TooltipContentProps` in recharts v3.
- **`activeShape`/`inactiveShape` as top-level Pie props:** Deprecated — use `isActive` in shape callback.
- **`db.budgetConfigs.add()` for settings update:** Use `.put()` (upsert) — same pattern already used in onboarding.
- **Importing all transactions into Zustand store before analytics:** Query Dexie per-period directly; do not load all-time data into Zustand (memory + stale-data concern).
- **next dev with Serwist enabled:** Causes caching issues in development. Set `disable: process.env.NODE_ENV === 'development'`.
- **Not revoking blob URL after export download:** Memory leak. Always call `URL.revokeObjectURL(url)` after the click.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dexie DB export to JSON | Manual JSON.stringify loop over tables | dexie-export-import exportDB() | Handles Date serialization, chunking, all Dexie types |
| Dexie DB import with overwrite | Manual db.clear() + bulk add | dexie-export-import importInto({ clearTablesBeforeImport: true }) | Handles transaction safety, table clearing, type restoration |
| Service worker caching strategies | Custom fetch handler logic | @serwist/next defaultCache + precacheEntries | Handles stale-while-revalidate, cache versioning, navigation preload |
| Donut/Bar charts | SVG/Canvas from scratch | Recharts v3 (already installed) | Already in dependencies, battle-tested responsive behavior |

**Key insight:** All four "don't hand-roll" items have either a library already installed (Recharts) or require a single install. The temptation is to write a minimal custom version; resist it — each of these has non-obvious edge cases (Date serialization, SW cache busting, chart touch events).

---

## Common Pitfalls

### Pitfall 1: recharts v3 removed `activeIndex` prop
**What goes wrong:** Build succeeds (TypeScript may not error), chart silently behaves incorrectly or ignores prop.
**Why it happens:** Migration from recharts v2 examples.
**How to avoid:** Never pass `activeIndex` to Pie or Bar. Use Tooltip component for hover state.
**Warning signs:** Active state doesn't work or TypeScript error after strict mode upgrade.

### Pitfall 2: Next.js 16 Turbopack breaks @serwist/next build
**What goes wrong:** `next build` (default Turbopack) fails or produces no sw.js output.
**Why it happens:** Serwist requires webpack's compilation pipeline for manifest injection.
**How to avoid:** Change package.json build script to `"next build --webpack"`. Dev script stays unchanged.
**Warning signs:** public/sw.js not updated after build, `__SW_MANIFEST` undefined at runtime.

### Pitfall 3: tsconfig.json "webworker" lib causes type conflicts
**What goes wrong:** Adding `"webworker"` to lib array conflicts with `"dom"` in some environments.
**Why it happens:** Both lib sets define `self` with different types.
**How to avoid:** Use the `declare const self: ServiceWorkerGlobalScope` override inside sw.ts as shown in Serwist docs. Keep both `"dom"` and `"webworker"` in lib — this is the correct pairing.
**Warning signs:** TypeScript errors in app/sw.ts about `self` type.

### Pitfall 4: Month navigation ANLX-04 — querying "past" periods
**What goes wrong:** Past period end date calculation is wrong, missing transactions on boundary days.
**Why it happens:** The payday-based period boundary logic (monthStartDay) is already complex in budget.ts.
**How to avoid:** Write a `getPeriodEndDate(periodStart, monthStartDay)` helper. Use `db.transactions.where('date').between(start, end, true, true)` (inclusive both ends). Test with monthStartDay=25 scenarios.
**Warning signs:** Last day of month missing from bar chart, first day of next month included incorrectly.

### Pitfall 5: importInto without clearTablesBeforeImport — data duplication
**What goes wrong:** Importing a backup merges with existing data instead of replacing it.
**Why it happens:** Default importInto behavior merges.
**How to avoid:** Always pass `{ clearTablesBeforeImport: true }` for a restore operation. Show user a confirmation dialog before import (data will be overwritten).
**Warning signs:** Transaction count doubles after import.

### Pitfall 6: recharts chart height in flex container
**What goes wrong:** ResponsiveContainer height collapses to 0 inside flex layout.
**Why it happens:** ResponsiveContainer needs an explicit numeric height or a parent with a defined height.
**How to avoid:** Always set `height={number}` on ResponsiveContainer, not `height="100%"` inside a flex column.
**Warning signs:** Charts render as zero-height elements.

### Pitfall 7: analytics.test.tsx — Recharts renders SVG, not DOM text
**What goes wrong:** RTL queries like `getByText('food')` fail even though the chart renders.
**Why it happens:** Recharts renders category labels as SVG `<text>` elements; RTL's `getByText` finds DOM text but may not match SVG text nodes without configuration.
**How to avoid:** Test the data aggregation functions (aggregateByCategory, aggregateByDay) as pure unit tests. For chart components, test data props passed to the chart, not the SVG text output. Use `data-testid` on wrapper divs for "no data" states.
**Warning signs:** RTL queries for chart labels return null even after chart mounts.

---

## Code Examples

### Aggregate by Category (ANLX-01 data prep)
```typescript
// src/lib/analyticsHelpers.ts
import type { Transaction, Category } from '@/types'

export interface CategoryTotal {
  id: Category
  name: string
  value: number
}

export function aggregateByCategory(transactions: Transaction[]): CategoryTotal[] {
  const totals = new Map<Category, number>()
  for (const tx of transactions) {
    totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount)
  }
  return Array.from(totals.entries())
    .filter(([, value]) => value > 0)
    .map(([id, value]) => ({ id, name: id, value }))
    .sort((a, b) => b.value - a.value)
}
```

### Aggregate by Day (ANLX-02 data prep)
```typescript
// src/lib/analyticsHelpers.ts
export interface DailyTotal {
  day: string   // 'DD' format e.g. '01', '15'
  amount: number
}

export function aggregateByDay(
  transactions: Transaction[],
  periodStart: Date,
  periodEnd: Date
): DailyTotal[] {
  // Build a full day range so zero-spend days appear as 0 bars
  const result: DailyTotal[] = []
  const cursor = new Date(periodStart)
  while (cursor <= periodEnd) {
    const dayKey = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`
    const amount = transactions
      .filter(tx => {
        const d = tx.date instanceof Date ? tx.date : new Date(tx.date)
        const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
        return k === dayKey
      })
      .reduce((sum, tx) => sum + tx.amount, 0)
    result.push({ day: String(cursor.getDate()).padStart(2,'0'), amount })
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}
```

### Month Navigation State (ANLX-04)
```typescript
// In AnalyticsPage component
const [monthOffset, setMonthOffset] = useState(0)  // 0 = current, -1 = previous, etc.

// Compute the reference date for the offset
const referenceDate = useMemo(() => {
  const d = new Date()
  d.setMonth(d.getMonth() + monthOffset)
  return d
}, [monthOffset])

const periodStart = config ? getPeriodStartDate(referenceDate, config.monthStartDay) : null
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-pwa (abandoned) | @serwist/next | Phase 1 decision | No breaking change — Phase 1 used native sw.js stub |
| recharts v2 TooltipProps | recharts v3 TooltipContentProps | recharts 3.0 release | Must use new type in custom tooltip components |
| recharts v2 activeIndex prop | No direct prop — use Tooltip | recharts 3.0 release | Active state handled differently |
| Manual SW with skipWaiting/install/activate handlers | Serwist with addEventListeners() | serwist adoption | Eliminates manual handler boilerplate |

**Deprecated/outdated:**
- `public/sw.js` stub: Replace entirely — Serwist outputs to this path during build. Add to .gitignore.
- `activeShape`/`inactiveShape` on Pie: Deprecated in v3 — use shape callback with `isActive` parameter.

---

## Open Questions

1. **dexie-export-import compatibility with Dexie v4**
   - What we know: dexie-export-import is an official Dexie addon maintained in the same monorepo
   - What's unclear: Whether v4.x of dexie-export-import is required (separate from dexie core v4)
   - Recommendation: After `npm i dexie-export-import`, check the installed version and confirm no peer dependency warnings. The npm registry shows v4.x is available alongside Dexie v4.

2. **@serwist/next version 9.5.6 with Next.js 16.1.6**
   - What we know: Serwist 9.5.6 was published within the past month (as of 2026-03-13). Next.js 16.1.6 is installed.
   - What's unclear: Any breaking changes specific to Next.js 16.1.x in the Serwist integration
   - Recommendation: Check CHANGELOG of @serwist/next on first install. If any build error occurs, check serwist GitHub discussions.

3. **tsconfig.json "webworker" lib and existing TypeScript compilation**
   - What we know: Adding `"webworker"` to lib array is required for app/sw.ts but could affect other files
   - What's unclear: Whether existing Next.js app code will see type conflicts
   - Recommendation: Add to tsconfig only if needed; alternatively, create a separate tsconfig.sw.json for the service worker file and reference it from app/sw.ts with `/// <reference lib="webworker" />`.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.mts` |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANLX-01 | aggregateByCategory returns sorted category totals | unit | `npx vitest run tests/analytics.test.ts` | Wave 0 |
| ANLX-02 | aggregateByDay returns full day range with zeros | unit | `npx vitest run tests/analytics.test.ts` | Wave 0 |
| ANLX-03 | Monthly summary shows correct budget vs actual | unit | `npx vitest run tests/analytics.test.ts` | Wave 0 |
| ANLX-04 | Month navigation shifts period query by offset | unit | `npx vitest run tests/analytics.test.ts` | Wave 0 |
| SETT-01 | Settings save updates Dexie and Zustand store | unit (store + db) | `npx vitest run tests/settings.test.ts` | Wave 0 |
| SETT-02 | Export creates downloadable blob (mock exportDB) | unit | `npx vitest run tests/settings.test.ts` | Wave 0 |
| SETT-03 | Import validates structure, calls importInto | unit (mock) | `npx vitest run tests/settings.test.ts` | Wave 0 |
| PWA-02 | sw.ts exports Serwist instance (smoke check) | unit | `npx vitest run tests/sw.test.ts` | Wave 0 |

**Note on chart RTL tests:** ANLX-01/02 chart rendering is covered by pure function tests on the data helpers. Recharts SVG output is not inspected via RTL — this follows the same pattern as dashboard tests (test derived values, not SVG internals).

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/analytics.test.ts` — covers ANLX-01 through ANLX-04 pure function tests
- [ ] `tests/settings.test.ts` — covers SETT-01 through SETT-03
- [ ] `tests/sw.test.ts` — smoke test: import app/sw.ts, verify Serwist instantiation (may require module mock)

---

## Sources

### Primary (HIGH confidence)
- recharts v3 migration guide (github.com/recharts/recharts/wiki/3.0-migration-guide) — breaking changes for PieChart, BarChart, Tooltip
- @serwist/next docs (serwist.pages.dev/docs/next/getting-started) — installation, next.config, sw.ts pattern
- dexie-export-import npm (npmjs.com/package/dexie-export-import) — exportDB, importInto, peakImportFile API
- Installed package.json — confirmed recharts@3.8.0, dexie@4.3.0, zustand@5.0.11, next@16.1.6
- Existing codebase — budgetStore.ts, settingsStore.ts, db.ts, budget.ts confirm all existing patterns

### Secondary (MEDIUM confidence)
- LogRocket blog (blog.logrocket.com/nextjs-16-pwa-offline-support/) — Next.js 16 + Serwist `--webpack` requirement verified against @serwist/next docs
- dexie-export-import README via unpkg — export/import API surface confirmed

### Tertiary (LOW confidence)
- GeeksforGeeks recharts examples — illustrative only; do not use v2-style code from these

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed installed or available with specific versions
- Architecture: HIGH — patterns derived from existing codebase conventions + official docs
- Pitfalls: HIGH for recharts v3 changes (official migration guide) and @serwist/next webpack requirement (official docs + LogRocket verified)
- dexie-export-import API: MEDIUM — primary source is npm README; exact method signatures confirmed from search results

**Research date:** 2026-03-13
**Valid until:** 2026-04-12 (30 days — recharts and @serwist/next are active but stable)
