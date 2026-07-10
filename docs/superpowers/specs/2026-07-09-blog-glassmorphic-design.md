# Blog Glassmorphic Redesign — Design Spec

> **Reference visual:** https://lvyovo-wiki.tech/bloggers — a clean grid of glassmorphic cards with a soft cursor-following glow and gentle hover lift. The "magic" comes from a small, reusable recipe, not a large framework.

**Date:** 2026-07-09
**Status:** Draft (awaiting user review)

## 1. Goal

Restyle the two category grids on `blog.html` (Technical Tips, Life Beyond Research) to use lvy-style glassmorphic cards. Add a soft drifting mesh backdrop, a custom cursor-tracking spotlight glow, and a 3D perspective tilt on hover — all while keeping the same color palette and type stack as the new landing hero. No above-the-fold hero, no custom cursor, no fullscreen canvas — the visual win comes from the card material and the cursor feedback, not from new chrome.

**Out of scope:** `index.html`, `presentations.html`, all blog subpages, the existing code-snippets section, the "Stay Connected" footer, and the existing top nav. None of these are touched.

## 2. Architecture

Four new files, one modified file, one test.

| File | Responsibility | Approx size |
|---|---|---|
| `assets/css/blog.css` | All blog styles — mesh, glass card, spotlight CSS variables, header refresh, responsive breakpoints, reduced-motion fallbacks. Self-contained. | ~5 KB |
| `assets/js/blog-tilt.js` | 3D perspective tilt on every `[data-tilt]` card. Same shape as `hero-tilt.js` (capped at ±6°). | ~1.2 KB |
| `assets/js/blog-spotlight.js` | Cursor-tracking radial glow on every `[data-spotlight]` card. Writes `--mx` / `--my` CSS variables (0–100% within the card). | ~1.5 KB |
| `assets/js/blog-mesh.js` | Adds/removes `body.no-motion` based on `prefers-reduced-motion`. Pauses the mesh on `visibilitychange` (battery). Same as `hero-mesh.js`. | ~0.5 KB |
| `tests/blog-smoke.test.js` | Node `node:test` smoke test — fetches `blog.html` from a local static server, asserts mesh + 8 cards + 3 new files are present. | ~0.7 KB |

**Modified file:** `blog.html` — add 1 stylesheet `<link>`, add the `<div class="blog-mesh">` inside `<body>`, add `data-tilt data-spotlight` attributes to all 8 article cards, swap the `work-item` class for `glass-card`, add 3 new `<script>` tags with `defer`.

**Why no `useExisting hero-mesh.js` import:** The site has no ES module bundler; scripts are plain `<script src>` tags. Copying ~0.5 KB of mesh-gate logic into `blog-mesh.js` is cheaper than introducing a module system.

## 3. Visual recipe (lvy-inspired, our colors)

### 3.1 Mesh backdrop (CSS-only)

A `position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; background: #fafafc;` div with two pseudo-element radial gradients:
- `::before` — soft teal, 60vw circle at top-left, blurs at 80px, animates 32s
- `::after` — soft amber, 70vw circle at bottom-right, blurs at 100px, animates 40s

Both pause on `visibilitychange` (battery). Both fully disabled when `body.no-motion` is set by JS (gates the OS-level reduced-motion preference reliably).

### 3.2 Glass card

```css
.glass-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  transform: perspective(800px) rotateX(0) rotateY(0) translateY(0);
  transform-style: preserve-3d;
  transition: transform 220ms ease-out, box-shadow 220ms ease;
  will-change: transform;
  overflow: hidden;
}

.glass-card:hover,
.glass-card:focus-visible {
  transform: perspective(800px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg)) translateY(-6px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.10);
  outline: none;
}

.glass-card:focus-visible { outline: 2px solid #49bf9d; outline-offset: 2px; }
```

The spotlight glow lives on the card's `::before` pseudo-element, sized to overflow the card on all sides and clipped by the card's `border-radius + overflow: hidden`:

```css
.glass-card::before {
  content: "";
  position: absolute;
  inset: -20%;
  border-radius: inherit;
  background: radial-gradient(
    360px circle at var(--mx, 50%) var(--my, 50%),
    rgba(73, 191, 157, 0.18),
    transparent 50%
  );
  opacity: 0;
  transition: opacity 220ms ease;
  pointer-events: none;
  z-index: 0;
}

.glass-card:hover::before,
.glass-card:focus-visible::before { opacity: 1; }
```

### 3.3 Card contents

- Thumbnail: `width: 100%; aspect-ratio: 16/10; object-fit: cover;` — clipped to the card's top corners by the card's `overflow: hidden`.
- h3: SF Pro Display 20px / 600 / -0.224px / `#1d1d1f` / `margin: 16px 0 4px`.
- Date line: 13px / 400 / `#7a7a7a` / fa-calendar icon, same color.
- Paragraph: 15px / 400 / `#333333` / line-height 1.5.
- "Read More" button: keeps the existing `.button.small` class but adds a `.btn-teal` variant — `background: transparent; color: #49bf9d; border: 1px solid #49bf9d;` on default; on hover, fills `#49bf9d` and text turns white, with a 200ms ease.

All card children get `position: relative; z-index: 1;` so they sit *above* the spotlight glow.

### 3.4 Header (refreshed, not redesigned)

The existing `<header id="header">` gets a glass treatment of its own via `assets/css/blog.css`:
- `background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(16px); border-radius: 24px; padding: 48px 32px; margin: 0 auto; max-width: 1100px;`
- The avatar gets a `border: 2px solid rgba(73, 191, 157, 0.6)` ring matching the hero card.

The header DOM is **unchanged**.

## 4. Color & type tokens

Reused from the landing hero spec (`docs/superpowers/specs/2026-07-09-landing-hero-design.md`). No new tokens.

| Token | Value | Use |
|---|---|---|
| Accent | `#49bf9d` | CTA border/fill, focus rings, button hover |
| Ink | `#1d1d1f` | h1, h2, h3 |
| Ink-muted-80 | `#333333` | Body copy |
| Ink-muted-48 | `#7a7a7a` | Date, meta, subtitles |
| Card bg | `rgba(255,255,255,0.55)` | Glass card background |
| Card border | `rgba(255,255,255,0.6)` | Glass card border |
| Card shadow | `rgba(0,0,0,0.06)` → `0.10` | Default → hover |
| Mesh teal | `rgba(73,191,157,0.14)` | Mesh blob 1 |
| Mesh amber | `rgba(245,185,66,0.12)` | Mesh blob 2 |
| Mesh bg | `#fafafc` | Page base |

Type stack: `SF Pro Display, SF Pro Text, system-ui, -apple-system, sans-serif`. No new fonts.

## 5. JS contracts

### 5.1 `blog-tilt.js`

```js
// Attaches mousemove + mouseleave to each [data-tilt] element.
// Writes --tilt-x and --tilt-y CSS custom properties (degrees, range [-6, 6]).
// Inverts Y so up-tilt is positive. requestAnimationFrame coalesces.
// No-ops when prefers-reduced-motion: reduce matches.
// Idempotent: data-tilt-bound marker prevents double-attach.
```

### 5.2 `blog-spotlight.js`

```js
// Attaches pointermove + pointerleave to each [data-spotlight] element.
// Writes --mx and --my CSS custom properties (0-100%, position within the card).
// Throttled with requestAnimationFrame.
// No-ops when prefers-reduced-motion: reduce matches.
// Idempotent.
```

### 5.3 `blog-mesh.js`

```js
// Sets body.no-motion when prefers-reduced-motion: reduce matches.
// Re-evaluates on media query change.
// Pauses .blog-mesh (via .is-paused class) when document.visibilityState === "hidden".
```

### 5.4 Script load order in `blog.html`

```html
<script src="assets/js/jquery.min.js" defer></script>
<script src="assets/js/browser.min.js" defer></script>
<script src="assets/js/breakpoints.min.js" defer></script>
<script src="assets/js/util.js" defer></script>
<script src="assets/js/main.js" defer></script>
<script src="assets/js/blog-tilt.js" defer></script>
<script src="assets/js/blog-spotlight.js" defer></script>
<script src="assets/js/blog-mesh.js" defer></script>
```

All `defer`. None of the 3 new scripts touch the same elements (different selectors: `[data-tilt]`, `[data-spotlight]`, `.blog-mesh` / body class), so order between them doesn't matter.

## 6. Card DOM contract

```html
<article class="glass-card col-6 col-12-xsmall" data-tilt data-spotlight>
  <a href="blog/dft-convergence.html" class="image fit thumb" tabindex="-1">
    <img src="images/blog/dft-tips.png" alt="DFT Tips" />
  </a>
  <h3>DFT Convergence Tips</h3>
  <p class="blog-meta"><i class="far fa-calendar"></i> January 15, 2025</p>
  <p>Practical strategies for achieving convergence in challenging DFT calculations...</p>
  <a href="blog/dft-convergence.html" class="button small btn-teal">Read More</a>
</article>
```

The `data-tilt` and `data-spotlight` attributes are the only new attributes. The thumbnail's wrapping `<a>` has `tabindex="-1"` so it isn't separately focusable — the article's primary focus target is the "Read More" link.

All 8 article cards get the same treatment:
- Technical Tips (4): DFT Convergence Tips, Getting Started with ML Force Fields, Useful Quantum ESPRESSO Scripts, Beautiful Plots for Materials Science
- Life Beyond Research (4): My Table Tennis Journey, Learning Tennis at 24, Four Seasons at Hopkins, Conference Cities Through My Lens

## 7. Responsive

- Desktop (`≥1024px`): 3-column grid (uses existing `col-6 col-12-xsmall` from `main.css`, applied via wrapper class).
- Tablet (`640–1023px`): 2-column grid.
- Phone (`<640px`): 1-column stack.

Implemented in `blog.css` only — no changes to `main.css`.

## 8. Reduced motion & fallbacks

- `@media (prefers-reduced-motion: reduce)` — kill mesh animations, kill tilt, kill spotlight transition. Keep the `translateY(-6px)` hover lift (it's a transition, not continuous motion, and it's the most accessible "this is interactive" cue).
- `body.no-motion` (set by `blog-mesh.js`) — same effect via class, more reliable than CSS-only detection.
- `@supports not (backdrop-filter: blur(1px))` — fall back to `background: rgba(255,255,255,0.92)` (opaque) for older Firefox and any browser without the filter.

## 9. Accessibility

- Cards remain keyboard-navigable: the "Read More" link is the primary focus target, the thumbnail is `tabindex="-1"`, and `:focus-visible` matches `:hover`.
- Mesh `pointer-events: none` — never blocks clicks.
- Spotlight opacity tied to `pointermove` / `pointerleave`, not continuous animation.
- All custom JS respects `prefers-reduced-motion`.
- No reliance on color alone for interactivity (focus rings, button text changes).

## 10. Testing

Single smoke test, `tests/blog-smoke.test.js`, run with `node --test`:

1. `index.html`-style fetch: GET `http://127.0.0.1:8123/blog.html` returns 200.
2. HTML contains `<div class="blog-mesh">`.
3. HTML contains exactly 8 elements with class `glass-card`.
4. HTML links `assets/css/blog.css`.
5. HTML includes all 3 new script tags.
6. HTML still contains the original `<header id="header">` (we're not removing it).
7. HTML does **not** contain any element with class `work-item` (we replaced it).

Plus manual visual smoke test in a real browser at desktop (1440px), tablet (768px), and phone (375px):
- Mesh blobs visible but subtle.
- 8 cards visible in a 3 / 2 / 1 column grid.
- Hovering a card → it lifts 6px, tilts toward the cursor, the spotlight glow appears under the cursor, the shadow deepens.
- Tab-navigating: focus ring appears on the "Read More" link; the card lights up identically to hover state.
- `prefers-reduced-motion: reduce` emulated → mesh frozen, no tilt, no spotlight, but hover lift still works.

## 11. YAGNI — explicitly excluded

- No custom SVG cursor (lvy uses a paw cursor; ours is a research portfolio — a paw is off-brand).
- No fullscreen `<canvas>` generative mesh (the CSS mesh is 90% as good for 0% CPU).
- No "latest post" preview hero (user explicitly said no hero).
- No search / filter / category tabs.
- No dark mode (the existing site has no dark mode).
- No new fonts, no new libraries, no new HTTP requests for images.
- No code-snippets section changes (long code blocks are anti-glassmorphic).

## 12. Commit attribution

Attribution disabled globally. Do not add `Co-Authored-By:` lines. One commit per logical step (CSS, then each JS file, then the blog.html edit, then the test, then verification).

## 13. Open questions

None. All design decisions resolved during brainstorming.
