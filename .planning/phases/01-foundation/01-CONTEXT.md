# Phase 1: Foundation - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

App shell, Next.js PWA scaffold, IndexedDB schema, routing structure, and all infrastructure that feature phases build on. This phase delivers a working, installable skeleton — not features. Dashboard, transactions, and analytics content come in later phases.

</domain>

<decisions>
## Implementation Decisions

### UI Language & i18n
- English default, Korean available via toggle
- i18n infrastructure (next-intl or similar) set up in Phase 1 — not retrofitted later
- Language toggle lives in the Settings page (alongside theme toggle)
- Category names use emoji + text, both following the language setting: 🍔 Food (EN) / 🍔 식비 (KO)

### Dark Mode
- Dark mode default (Architecture doc colors: #0F172A background, #1E293B surface)
- Light mode available via toggle in Settings page (alongside language toggle)
- Both theme and language preference persisted to localStorage/Zustand

### Bottom Navigation
- 5 tabs: Home / Add / History / Analytics / Settings
- Icon + label for all tabs (clearer for first-time users)
- Add tab ("+") is visually distinct — prominent center button with raised/colored treatment (FAB-style)

### PWA Icon & Branding
- Design a real SVG icon in Phase 1 (coin/pulse/wallet concept, blue #3B82F6 on dark #0F172A)
- PWA manifest keeps: theme_color #3B82F6, background_color #0F172A
- Icon must export at 192×192 and 512×512 as PNG for manifest

### Claude's Discretion
- Exact icon visual design (coin, pulse wave, or wallet — Claude picks what looks sharpest)
- Exact FAB-style treatment for the Add button (size, shadow, ring, elevation)
- Placeholder page content for feature pages (History, Analytics, Settings) — minimal skeleton screens
- Loading skeleton approach for future data-heavy screens
- Error boundary strategy

</decisions>

<specifics>
## Specific Ideas

- Architecture doc specifies Pretendard font for amounts (Bold 32–48px) — wire up font loading in Phase 1
- Safe area support from day one: `env(safe-area-inset-top/bottom)` on BottomNav and full-screen containers
- Dexie.js schema must define compound index `[date+category]` for efficient transaction queries later
- Architecture doc file structure is the reference: `src/app/`, `src/components/`, `src/stores/`, `src/lib/`, `src/hooks/`, `src/types/`

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — greenfield project

### Established Patterns
- Stack is fully decided: Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand, Dexie.js, next-pwa, Lucide React, Recharts
- Init command: `npx create-next-app@latest budgetpulse --typescript --tailwind --app --src-dir`
- Dependencies: `zustand dexie recharts lucide-react next-pwa`

### Integration Points
- All feature phases depend on: Dexie.js DB instance (`src/lib/db.ts`), TypeScript types (`src/types/index.ts`), Zustand stores (`src/stores/`), bottom nav routing
- i18n messages files must be in place before any UI text is hardcoded in feature phases

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-09*
