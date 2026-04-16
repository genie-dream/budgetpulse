# Learned Lessons

Engineering lessons captured from real bugs in this project. Add new entries at the top with date + symptom + root cause + fix.

---

## 2026-04-17 — Mobile left-clip on /add page (Android only)

### Symptom

On Android Chrome (and after PWA install), the `/add` page rendered with content shifted right by ~70px: the `₩` currency symbol, the first category chip ("Food"), and the "Add details" label were all clipped off the left edge. Desktop Chrome was fine. Cache clearing and reinstalling the PWA did not help.

### What misled us

Previous commits treated this as a horizontal-scroll symptom and patched around it:
- `e759925` — scroll selected chip into view
- `63e56f9` — adjust `scrollLeft` to unclip chip
- `055b157` — `overflow-x: hidden` on html/body

These all patched **symptoms**, not the root cause. The page was genuinely wider than the viewport; we just kept hiding the overflow instead of asking *why* the page was wider.

### Actual root causes (three stacked)

1. **`<input>` intrinsic min-width in flexbox.** The amount input used `flex-1` with no `min-w-0`, and `<input>` has a default `size=20` attribute that reserves room for ~20 characters. At `text-4xl` (36px) that's ~400px of intrinsic minimum. The flex parent therefore forced the page wider than a 360-412px mobile viewport.
2. **Missing viewport meta tag.** Next.js app router requires `export const viewport` from the root layout. Without it, Android Chrome renders at a 980px desktop viewport, which both magnifies #1 and shifts layout.
3. **`overflow-x: hidden` is unreliable on Android.** Mobile Chrome can still allow horizontal panning when a descendant has intrinsic width greater than the viewport. `overflow-x: clip` is stricter and, combined with `max-width: 100vw`, actually prevents the overflow.

### Fix

```tsx
// src/app/add/page.tsx — constrain input in flex container
<input
  size={1}
  className="flex-1 min-w-0 text-4xl ..."
/>
```

```ts
// src/app/layout.tsx — declare viewport (Next.js 15+ app router)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}
```

```css
/* src/app/globals.css — stricter overflow containment */
html, body {
  overflow-x: clip;
  max-width: 100vw;
}
```

### Takeaways for future PWA / mobile work

- **When "mobile-only" layout bugs appear, check the viewport meta first.** In Next.js 13+ app router, it's `export const viewport` from the root layout, not `<meta>` in `<head>`. Missing it is silent — no error, just desktop-width rendering on mobile.
- **Any `<input>` inside a flex container needs `min-w-0` and usually `size={1}`.** The default `size=20` is a trap: it sets an intrinsic minimum width that ignores the flex parent and can push the whole page wider than the viewport. This is especially dangerous with large font sizes.
- **Prefer `overflow-x: clip` over `overflow-x: hidden` for page-level containment on mobile.** `hidden` creates a scroll container and can still allow programmatic/touch horizontal scroll on Android. `clip` is stricter.
- **If the symptom is "content shifted on mobile," the real question is "what is wider than the viewport?"** Don't reach for `scrollLeft` or `overflow: hidden` patches until you've identified the overflowing element. DevTools → "Find elements causing horizontal scroll" (or `document.body.scrollWidth > window.innerWidth`) answers this in one check.
- **Service Worker caching hides deploys.** After shipping a CSS/layout fix, users on a PWA will keep seeing the old version until the SW updates (usually next load, sometimes not). When verifying a fix on mobile, always clear site data (Chrome → 🔒 icon → site settings → clear data) or uninstall the PWA before testing, otherwise you're testing cached HTML.
- **`overflow-x: hidden` and `scrollLeft` fixes are symptom patches.** Useful short-term, but if you're applying them to prevent clipping, log a TODO to find the overflowing element — the real fix is usually smaller and more robust.

### How to diagnose this class of bug quickly

1. On desktop Chrome, open DevTools → toggle device toolbar → pick a small Android preset (Pixel, 360px wide).
2. In console: `document.body.scrollWidth - window.innerWidth` — if positive, something is overflowing.
3. Find the offender:
   ```js
   [...document.querySelectorAll('*')].filter(el =>
     el.scrollWidth > document.documentElement.clientWidth
   )
   ```
4. Inspect each candidate for: unconstrained `<input>`, `width: 100vw` plus margin, fixed pixel widths, or text content with `white-space: nowrap`.
