# Landing Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a glassmorphic landing hero to `index.html` — personal card on the left, a 3×2 portfolio grid on the right, mouse-reactive tile tilt, and a slow-drifting mesh backdrop — replacing the existing top-of-page header.

**Architecture:** A single `<section id="hero">` injected at the top of `index.html`, styled by a new self-contained `assets/css/hero.css`, and animated by two small vanilla-JS modules (`hero-tilt.js`, `hero-mesh.js`). The page's existing jQuery stack, nav, and inner sections are untouched. The existing top header is removed because the new hero is a strict superset. No new dependencies, no new fonts, no new images except one generated from an existing PDF.

**Tech Stack:** Static HTML/CSS/Vanilla JS, jQuery 1.x (existing, unchanged), macOS `sips` (existing) for the DUAL-X PNG conversion. No build step. No new package dependencies. Smoke test uses Node's built-in `node:test` + `node-fetch` (or built-in `fetch` on Node 18+).

## Global Constraints

These are project-wide rules copied verbatim from the spec. Every task's requirements implicitly include this section.

- **Slogan (lead, two lines, deliberate break):** `An engineer of atoms.` (ink `#1d1d1f`) / `A dreamer in code.` (`#49bf9d`). Sizes 44px / 600 / SF Pro Display / -0.28px tracking / 1.05 line-height.
- **Slogan (sub, one or two lines):** `Coding for materials, from understanding to 0-to-1.` 18px / 400 / SF Pro Text / `#7a7a7a` / 1.47 line-height / max 32ch wide.
- **Byline:** `PhD researcher, ChemBE · Johns Hopkins`. 14px / 400 / SF Pro Text / `#333333`.
- **Colors (allowed only):** `#49bf9d` (existing accent, used for slogan line 2, tile arrow, CTAs, explore-more link), `#f5b942` (new, mesh backdrop only, never on text or interactive), `#1d1d1f` (ink), `#7a7a7a` (ink-muted-48), `#333333` (ink-muted-80), `rgba(255,255,255,0.55)` (glass background), `rgba(0,0,0,0.04)` (icon button background), `rgba(73,191,157,0.10)` (icon hover background), `rgba(73,191,157,0.6)` (avatar ring), `rgba(255,255,255,0.6)` (glass border), `rgba(0,0,0,0.06)` (tile default shadow), `rgba(0,0,0,0.10)` (card shadow), `rgba(0,0,0,0.12)` (tile hover shadow). **No other colors.**
- **Type stack:** `SF Pro Display, SF Pro Text, system-ui, -apple-system, sans-serif`. **No Google Fonts, no Inter.**
- **Motion budget (only three effects):** mesh drift (32–40s), tile tilt (max 6°, 200ms ease-out), hover transitions (200ms). **No scroll-triggered animations. No scroll-jacking.**
- **Reduced motion:** All three effects must be disabled when `prefers-reduced-motion: reduce` matches. Mesh drift is gated by a `.no-motion` class set by JS (more reliable than CSS-only). Tilt JS no-ops on reduced motion. Hover transitions are kept (they're instant on/off, not animated motion in the accessibility sense).
- **Fallback for `backdrop-filter`:** under `@supports not (backdrop-filter: blur(1px))` use `background: rgba(255,255,255,0.92)` for cards and tiles.
- **CTAs on personal card:** Primary "Read research" → `#two`. Ghost "View GitHub" → `https://github.com/yicao-elina` (target=`_blank`, rel=`noopener`).
- **Five work tiles (in order):** DUAL-X, RepliCan, ARIA, Qualcomm GPU, Viva Biotech. Plus a 6th "Explore more →" affordance tile.
- **DUAL-X thumbnail:** must be generated from `images/blog/DUALX-teaser.pdf` page 1 to `images/thumbs/dualx-teaser.png` at 1200px wide.
- **Existing header `<header id="header">` is removed.** Everything in it (avatar, name, JHU one-liner) is re-expressed by the new personal card.
- **YAGNI enforcement:** No dark mode, no marquee, no new fonts, no new icon font, no SVG art, no 3D flip, no scroll-jacking, no AI-generated background. Do not introduce these in any task.
- **Commit attribution:** The user has attribution disabled globally. Do not add `Co-Authored-By:` lines.

---

## File Map

### Files to create

| File | Responsibility | Approx size |
|---|---|---|
| `assets/css/hero.css` | All hero styles — mesh, personal card, tile grid, tilt CSS variables, responsive breakpoints, reduced-motion fallbacks. Self-contained, no `@import`, no references to existing site CSS. | ~6 KB |
| `assets/js/hero-tilt.js` | Attaches a `mousemove` listener to each `[data-tilt]` tile, writes `--tilt-x` / `--tilt-y` CSS variables on `requestAnimationFrame`, capped at ±6°. No-ops on reduced motion. | ~1.5 KB |
| `assets/js/hero-mesh.js` | Adds/removes a `.no-motion` class on the `<body>` based on `prefers-reduced-motion`. Also pauses mesh drift on `visibilitychange` to save battery. | ~0.5 KB |
| `images/thumbs/dualx-teaser.png` | DUAL-X tile thumbnail, generated from `images/blog/DUALX-teaser.pdf`. | ~150–300 KB |
| `tests/hero-smoke.test.js` | Node `node:test` smoke test that fetches `index.html` from a local static server, asserts the hero DOM is present, asserts the 5 work tiles + 1 explore-more tile are present, and asserts the 3 new files are referenced. | ~1 KB |

### Files to modify

| File | Change |
|---|---|
| `index.html` | Add `<section id="hero">` after `<body class="is-preload">`, before `<nav id="nav">`. Add 1 stylesheet `<link>` and 2 `<script>` tags. Remove the existing `<header id="header">` block. **No other changes.** |

### Files NOT touched

- `assets/css/main.css` and the entire existing inline `<style>` blocks in `index.html` (dropdown menu, news strip, vision expand-cards).
- The existing nav, the existing jQuery stack, the existing `<script>` tags, the existing `#news`, `#two`, `#three`, etc. sections.
- `presentations.html`, `blog.html`, and all other pages.
- The jQuery and poptrox JavaScript files in `assets/js/`.

---

## Task 1: Generate the DUAL-X thumbnail

**Files:**
- Create: `images/thumbs/dualx-teaser.png`
- Source: `images/blog/DUALX-teaser.pdf` (already in repo, 3.2 MB, 1 page)

**Interfaces:**
- Consumes: `images/blog/DUALX-teaser.pdf` (must exist; verify first).
- Produces: `images/thumbs/dualx-teaser.png`, 1200px wide, PNG format.

- [ ] **Step 1: Verify the source PDF exists**

Run:
```bash
ls -la images/blog/DUALX-teaser.pdf
```
Expected: a file dated within the repo's history, ~3 MB. If missing, stop and surface to the user — do not invent an image.

- [ ] **Step 2: Generate the PNG with `sips`**

Run:
```bash
sips -s format png --resampleWidth 1200 images/blog/DUALX-teaser.pdf --out images/thumbs/dualx-teaser.png
```
Expected: `sips` writes a 1200px-wide PNG. The command may emit a benign warning about the input being a PDF — that's fine, the output PNG is still produced. If `sips` is unavailable (non-macOS), use:
```bash
pdftoppm -r 150 -png -f 1 -l 1 images/blog/DUALX-teaser.pdf images/thumbs/dualx-teaser
```
which produces `images/thumbs/dualx-teaser-1.png` — rename it to `dualx-teaser.png`.

- [ ] **Step 3: Verify the output file**

Run:
```bash
file images/thumbs/dualx-teaser.png && ls -la images/thumbs/dualx-teaser.png
```
Expected: `PNG image data, 1200 x ...` and a file size between 100 KB and 500 KB.

- [ ] **Step 4: Commit**

```bash
git add images/thumbs/dualx-teaser.png
git commit -m "feat(hero): generate DUAL-X tile thumbnail from teaser PDF"
```

---

## Task 2: Create `assets/css/hero.css` (the full hero stylesheet)

**Files:**
- Create: `assets/css/hero.css`

**Interfaces:**
- Consumes: nothing (the file is self-contained).
- Produces: a CSS file that styles the elements documented in the spec §2, §3, §4. The file's selectors are the contract: `.hero`, `.hero-mesh`, `.personal-card`, `.pc-avatar`, `.pc-name`, `.pc-slogan`, `.pc-slogan-line1`, `.pc-slogan-line2`, `.pc-sub`, `.pc-byline`, `.pc-social`, `.pc-ctas`, `.pc-cta`, `.pc-cta-primary`, `.pc-cta-ghost`, `.portfolio`, `.portfolio-grid`, `.tile`, `.tile-img`, `.tile-body`, `.tile-title`, `.tile-sub`, `.tile-arrow`, `.tile-explore`, `.tile-explore-text`, `.tile-explore-sub`.

- [ ] **Step 1: Write the stylesheet**

Write the file `assets/css/hero.css` with the following exact content:

```css
/* ============================================================
   Landing Hero
   Self-contained styles for the top-of-page hero on index.html.
   Tokens (colors, type, motion) are documented in
   docs/superpowers/specs/2026-07-09-landing-hero-design.md.
   ============================================================ */

/* ---------- Section & layout ---------- */

.hero {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 88px 48px 64px;          /* top padding clears the 44px nav + air */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafc;             /* surface-pearl, base under the mesh */
}

.hero-content {
  width: 100%;
  max-width: 1280px;
  display: grid;
  grid-template-columns: minmax(420px, 1fr) 1.4fr;   /* 42% / 58% ratio */
  gap: 64px;
  align-items: center;
}

/* ---------- Mesh backdrop ---------- */

.hero-mesh {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: #fafafc;
}

.hero-mesh::before,
.hero-mesh::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}

.hero-mesh::before {
  top: -10%;
  left: -10%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(73, 191, 157, 0.14) 0%, rgba(73, 191, 157, 0) 70%);
  animation: mesh-drift-a 32s ease-in-out infinite alternate;
}

.hero-mesh::after {
  bottom: -15%;
  right: -15%;
  width: 70vw;
  height: 70vw;
  background: radial-gradient(circle, rgba(245, 185, 66, 0.12) 0%, rgba(245, 185, 66, 0) 70%);
  filter: blur(100px);
  animation: mesh-drift-b 40s ease-in-out infinite alternate;
}

@keyframes mesh-drift-a {
  from { transform: translate(0, 0); }
  to   { transform: translate(40px, 20px); }
}

@keyframes mesh-drift-b {
  from { transform: translate(0, 0); }
  to   { transform: translate(-50px, 30px); }
}

/* Pause mesh drift when tab is hidden (battery) */
.hero-mesh.is-paused::before,
.hero-mesh.is-paused::after {
  animation-play-state: paused;
}

/* Disable mesh drift when reduced motion is set via JS (.no-motion on <body>) */
body.no-motion .hero-mesh::before,
body.no-motion .hero-mesh::after {
  animation: none;
}

/* ---------- Personal card ---------- */

.personal-card {
  position: relative;
  padding: 40px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.10);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pc-avatar {
  display: block;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(73, 191, 157, 0.6);
  margin: 0 auto 8px;
}

.pc-name {
  margin: 0;
  font-family: "SF Pro Display", system-ui, -apple-system, sans-serif;
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.28px;
  line-height: 1.15;
  color: #1d1d1f;
  text-align: center;
}

.pc-slogan {
  margin: 12px 0 0;
  font-family: "SF Pro Display", system-ui, -apple-system, sans-serif;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.28px;
  line-height: 1.05;
  display: flex;
  flex-direction: column;
}

.pc-slogan-line1 { color: #1d1d1f; }
.pc-slogan-line2 { color: #49bf9d; }

.pc-sub {
  margin: 12px 0 0;
  max-width: 32ch;
  font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.47;
  color: #7a7a7a;
}

.pc-byline {
  margin: 4px 0 0;
  font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  color: #333333;
}

.pc-social {
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: 8px;
}

.pc-social a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  color: #1d1d1f;
  text-decoration: none;
  transition: background 200ms ease;
}

.pc-social a:hover { background: rgba(73, 191, 157, 0.10); }
.pc-social a:focus-visible {
  outline: 2px solid #49bf9d;
  outline-offset: 2px;
}

.pc-social svg { width: 18px; height: 18px; display: block; }

.pc-ctas {
  margin: 20px 0 0;
  display: flex;
  gap: 12px;
}

.pc-cta {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 22px;
  border-radius: 9999px;
  font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.0;
  text-decoration: none;
  transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease;
}

.pc-cta-primary {
  background: #49bf9d;
  color: #ffffff;
}
.pc-cta-primary:hover { transform: scale(0.95); box-shadow: 0 4px 16px rgba(73, 191, 157, 0.20); }
.pc-cta-primary:focus-visible { outline: 2px solid #0071e3; outline-offset: 2px; }

.pc-cta-ghost {
  background: transparent;
  color: #49bf9d;
  border: 1px solid #49bf9d;
}
.pc-cta-ghost:hover { transform: scale(0.95); box-shadow: 0 4px 16px rgba(73, 191, 157, 0.20); }
.pc-cta-ghost:focus-visible { outline: 2px solid #0071e3; outline-offset: 2px; }

/* ---------- Portfolio grid ---------- */

.portfolio { width: 100%; }

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 240px);
  gap: 20px;
}

.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transform: perspective(800px) rotateX(0) rotateY(0) translateY(0);
  transform-style: preserve-3d;
  transition: transform 200ms ease-out, box-shadow 200ms ease;
  will-change: transform;
}

.tile:hover,
.tile:focus-visible {
  transform: perspective(800px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg)) translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.tile:focus-visible { outline: 2px solid #49bf9d; outline-offset: 2px; }

.tile-img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 16px 16px 0 0;
}

.tile-body {
  flex: 1;
  padding: 20px;
  position: relative;
}

.tile-title {
  margin: 0 0 4px;
  font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.224px;
  line-height: 1.24;
  color: #1d1d1f;
}

.tile-sub {
  margin: 0;
  font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.43;
  color: #7a7a7a;
  /* Subtitle can be 2 lines; clamp to 2 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tile-arrow {
  position: absolute;
  right: 16px;
  bottom: 14px;
  font-size: 18px;
  color: #49bf9d;
  opacity: 0;
  transition: opacity 200ms ease, transform 200ms ease;
}

.tile:hover .tile-arrow,
.tile:focus-visible .tile-arrow {
  opacity: 1;
  transform: translateX(2px);
}

/* Explore-more tile: lighter glass, no thumbnail, centered text */
.tile-explore {
  background: rgba(255, 255, 255, 0.45);
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}

.tile-explore-text {
  display: block;
  font-family: "SF Pro Display", system-ui, -apple-system, sans-serif;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
  color: #1d1d1f;
  letter-spacing: -0.224px;
  transition: transform 200ms ease;
}

.tile:hover .tile-explore-text,
.tile:focus-visible .tile-explore-text {
  transform: translateX(4px);
}

.tile-explore-sub {
  display: block;
  margin-top: 6px;
  font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.43;
  color: #7a7a7a;
}

/* ---------- Reduced motion (CSS-side fallback) ---------- */

@media (prefers-reduced-motion: reduce) {
  .hero-mesh::before,
  .hero-mesh::after { animation: none; }
  .tile,
  .pc-cta,
  .tile-arrow,
  .tile-explore-text,
  .pc-social a { transition: none; }
}

/* ---------- Browser fallback for missing backdrop-filter ---------- */

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .personal-card,
  .tile { background: rgba(255, 255, 255, 0.92); }
  .tile-explore { background: rgba(255, 255, 255, 0.85); }
}

/* ---------- Responsive: tablet 640–1023px ---------- */

@media (max-width: 1023px) and (min-width: 640px) {
  .hero-content { grid-template-columns: 1fr; gap: 48px; }
  .portfolio-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 220px);
  }
  .personal-card { padding: 32px; }
  .pc-slogan { font-size: 36px; }
}

/* ---------- Responsive: phone < 640px ---------- */

@media (max-width: 639px) {
  .hero { padding: 72px 24px 48px; }
  .hero-content { grid-template-columns: 1fr; gap: 40px; }
  .portfolio-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, auto);
  }
  .personal-card { padding: 28px; }
  .pc-avatar { width: 88px; height: 88px; }
  .pc-slogan { font-size: 32px; }
  .pc-sub { font-size: 16px; }
  .pc-ctas { flex-direction: column; }
}
```

- [ ] **Step 2: Verify the file is well-formed**

Run:
```bash
wc -l assets/css/hero.css
```
Expected: ~270 lines. If under 200, the file was truncated; re-check the content.

- [ ] **Step 3: Commit**

```bash
git add assets/css/hero.css
git commit -m "feat(hero): add hero stylesheet (mesh, card, tile grid, responsive)"
```

---

## Task 3: Create `assets/js/hero-tilt.js` (the mouse-reactive tilt)

**Files:**
- Create: `assets/js/hero-tilt.js`

**Interfaces:**
- Consumes: any element with the `[data-tilt]` attribute (one per portfolio tile). The element's bounding box (read with `getBoundingClientRect()`). `prefers-reduced-motion` media query.
- Produces: CSS custom properties `--tilt-x` and `--tilt-y` set on each tile, in degrees, range `[-6, 6]`. No return value. The script is idempotent — calling it twice does not double-attach listeners.

- [ ] **Step 1: Write the script**

Write the file `assets/js/hero-tilt.js` with the following exact content:

```javascript
/* ============================================================
   hero-tilt.js
   Mouse-reactive 3D tilt on portfolio tiles.
   Sets --tilt-x and --tilt-y CSS custom properties on each
   [data-tilt] element, capped at +/- 6 degrees.
   No-ops when prefers-reduced-motion: reduce.
   Idempotent: safe to call multiple times.
   ============================================================ */
(function () {
  "use strict";

  var MAX_TILT_DEG = 6;
  var ATTR = "data-tilt-bound";
  var TILE_SELECTOR = "[data-tilt]";

  function getMaxTilt() {
    return MAX_TILT_DEG;
  }

  function isReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function attach(tile) {
    if (tile.getAttribute(ATTR) === "true") return;
    tile.setAttribute(ATTR, "true");

    var frameId = null;
    var pendingX = 0;
    var pendingY = 0;

    function apply() {
      frameId = null;
      tile.style.setProperty("--tilt-x", pendingX.toFixed(2) + "deg");
      tile.style.setProperty("--tilt-y", pendingY.toFixed(2) + "deg");
    }

    function onMove(e) {
      if (isReducedMotion()) return;
      var rect = tile.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) / (rect.width / 2);   // -1..1
      var dy = (e.clientY - cy) / (rect.height / 2);  // -1..1
      var max = getMaxTilt();
      pendingX = Math.max(-1, Math.min(1, dx)) * max;
      pendingY = Math.max(-1, Math.min(1, -dy)) * max;  // invert Y so up-tilt is positive
      if (frameId === null) frameId = window.requestAnimationFrame(apply);
    }

    function onLeave() {
      pendingX = 0;
      pendingY = 0;
      if (frameId === null) frameId = window.requestAnimationFrame(apply);
    }

    tile.addEventListener("mousemove", onMove);
    tile.addEventListener("mouseleave", onLeave);
  }

  function init() {
    var tiles = document.querySelectorAll(TILE_SELECTOR);
    for (var i = 0; i < tiles.length; i++) attach(tiles[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
```

- [ ] **Step 2: Verify the file is well-formed**

Run:
```bash
node --check assets/js/hero-tilt.js
```
Expected: no output (the file parses cleanly). If `node --check` is unavailable, open the file and confirm it has no syntax errors by eye.

- [ ] **Step 3: Commit**

```bash
git add assets/js/hero-tilt.js
git commit -m "feat(hero): add mouse-reactive tile tilt (capped at 6deg)"
```

---

## Task 4: Create `assets/js/hero-mesh.js` (the reduced-motion + visibility gate)

**Files:**
- Create: `assets/js/hero-mesh.js`

**Interfaces:**
- Consumes: `prefers-reduced-motion` media query, `document.visibilityState`, the `<body>` element, and any `.hero-mesh` element.
- Produces: a `body.no-motion` class when the user has reduced motion on, and a `.hero-mesh.is-paused` class when the tab is hidden. Idempotent.

- [ ] **Step 1: Write the script**

Write the file `assets/js/hero-mesh.js` with the following exact content:

```javascript
/* ============================================================
   hero-mesh.js
   Gating logic for the hero mesh backdrop.
   - Adds body.no-motion when prefers-reduced-motion: reduce.
     CSS uses this to disable the mesh-drift keyframe.
   - Pauses the mesh animation while the tab is hidden (battery).
   Idempotent.
   ============================================================ */
(function () {
  "use strict";

  var REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

  function applyMotionPreference() {
    var reduced =
      window.matchMedia && window.matchMedia(REDUCED_MOTION).matches;
    if (reduced) {
      document.body.classList.add("no-motion");
    } else {
      document.body.classList.remove("no-motion");
    }
  }

  function applyVisibility() {
    var meshes = document.querySelectorAll(".hero-mesh");
    var hidden = document.visibilityState === "hidden";
    for (var i = 0; i < meshes.length; i++) {
      if (hidden) {
        meshes[i].classList.add("is-paused");
      } else {
        meshes[i].classList.remove("is-paused");
      }
    }
  }

  function init() {
    applyMotionPreference();
    applyVisibility();

    if (window.matchMedia) {
      var mq = window.matchMedia(REDUCED_MOTION);
      // Both modern and legacy addListener APIs.
      if (mq.addEventListener) mq.addEventListener("change", applyMotionPreference);
      else if (mq.addListener) mq.addListener(applyMotionPreference);
    }
    document.addEventListener("visibilitychange", applyVisibility);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
```

- [ ] **Step 2: Verify the file is well-formed**

Run:
```bash
node --check assets/js/hero-mesh.js
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add assets/js/hero-mesh.js
git commit -m "feat(hero): add mesh motion gate (reduced-motion + visibility)"
```

---

## Task 5: Write the smoke test

**Files:**
- Create: `tests/hero-smoke.test.js`

**Interfaces:**
- Consumes: a running local static file server (any simple one; see Test harness below).
- Produces: exit code 0 if all assertions pass, non-zero on failure. Test output goes to stdout.

- [ ] **Step 1: Write the test**

Write the file `tests/hero-smoke.test.js` with the following exact content:

```javascript
// Smoke test for the landing hero.
// Run with: node --test tests/hero-smoke.test.js
// Requires a local static server already running at http://127.0.0.1:8123/.
// Start it with:  python3 -m http.server 8123 --directory . >/dev/null 2>&1 &

const test = require("node:test");
const assert = require("node:assert/strict");

const BASE = "http://127.0.0.1:8123";

async function getHtml() {
  const res = await fetch(BASE + "/index.html");
  assert.equal(res.status, 200, "index.html must return 200");
  return await res.text();
}

function find(html, needle) {
  return html.includes(needle);
}

test("index.html has the hero section", async () => {
  const html = await getHtml();
  assert.ok(find(html, '<section id="hero"'), "<section id=\"hero\"> present");
  assert.ok(find(html, 'class="hero-mesh"'), ".hero-mesh div present");
  assert.ok(find(html, 'class="personal-card"'), ".personal-card present");
  assert.ok(find(html, 'class="portfolio-grid"'), ".portfolio-grid present");
});

test("index.html has the 5 curated tiles + 1 explore tile", async () => {
  const html = await getHtml();
  // The five work tiles
  for (const title of ["DUAL-X", "RepliCan", "ARIA", "GPU Agentic Workflow", "Viva Biotech CADD"]) {
    assert.ok(find(html, title), `tile title "${title}" present`);
  }
  // The explore-more affordance
  assert.ok(find(html, "tile-explore"), "explore-more affordance present");
  assert.ok(find(html, "Explore more"), "Explore more label present");
});

test("index.html links the new CSS and JS files", async () => {
  const html = await getHtml();
  assert.ok(find(html, 'assets/css/hero.css'), "hero.css linked");
  assert.ok(find(html, 'assets/js/hero-tilt.js'), "hero-tilt.js included");
  assert.ok(find(html, 'assets/js/hero-mesh.js'), "hero-mesh.js included");
});

test("index.html does not contain the removed header", async () => {
  const html = await getHtml();
  // The old centered header was identifiable by the avatar+name phrase
  // wrapped in <header id="header">. We assert the wrapper is gone.
  assert.ok(!find(html, '<header id="header">'), "old <header id=\"header\"> removed");
});

test("DUAL-X thumbnail exists and is non-empty", async () => {
  const res = await fetch(BASE + "/images/thumbs/dualx-teaser.png");
  assert.equal(res.status, 200, "dualx-teaser.png must return 200");
  const buf = new Uint8Array(await res.arrayBuffer());
  // PNG magic: 89 50 4E 47 0D 0A 1A 0A
  assert.equal(buf[0], 0x89, "PNG magic byte 0");
  assert.equal(buf[1], 0x50, "PNG magic byte 1");
  assert.equal(buf[2], 0x4e, "PNG magic byte 2");
  assert.equal(buf[3], 0x47, "PNG magic byte 3");
});
```

- [ ] **Step 2: Commit the test (it will fail until Task 6 lands)**

```bash
git add tests/hero-smoke.test.js
git commit -m "test(hero): add landing-hero smoke test"
```

---

## Task 6: Add the hero to `index.html` (the single big edit)

**Files:**
- Modify: `index.html` — multiple discrete edits, all in this one file.

**Interfaces:**
- Consumes: the existing `index.html` structure (see current file; jQuery + inline styles + the existing top header).
- Produces: a new `<section id="hero">…</section>` block, a new `<link rel="stylesheet">` in the `<head>`, two new `<script>` tags at the end of the body, and the *removal* of the existing `<header id="header">` block.

This is the largest single edit. It's broken into sub-steps so the implementer doesn't lose their place.

### Sub-step 6a: Remove the existing top header

- [ ] **Step 1: Locate the existing header**

In `index.html`, find the block that begins with the HTML comment `<!-- Header -->` (around line 201) and ends with the closing `</header>` (around line 210). It looks like:
```html
<!-- Header -->
<header id="header">
<div class="inner">
<a href="#" class="image avatar"><img src="images/avatar.jpeg" alt="" /></a>
<h1>  <strong>I am Yi Cao</strong>, <br />
	a PhD researcher building trustworthy, physics-grounded AI<br />
	for materials discovery at <a href="https://www.jhu.edu">Johns Hopkins University</a>.</h1>
<em>Bridging molecular simulation with machine learning and LLMs for 2D materials discovery</em>
</div>
</header>
```

- [ ] **Step 2: Delete the entire block (the comment, the `<header>`, the inner `<div>`, and the closing tag)**

Replace the entire block (from `<!-- Header -->` through `</header>`) with nothing. The result is that `<div id="main">` (the next block) is now the first child of `<body class="is-preload">` *after* the new hero (which we'll add next). **Do not delete the `<div id="main">` itself.**

### Sub-step 6b: Add the stylesheet link

- [ ] **Step 3: Add the hero stylesheet to the `<head>`**

In the `<head>` of `index.html`, find this line (around line 12):
```html
<link rel="stylesheet" href="assets/css/main.css" />
```

Immediately *after* that line, add:
```html
<link rel="stylesheet" href="assets/css/hero.css" />
```

### Sub-step 6c: Add the hero section

- [ ] **Step 4: Insert the hero section immediately after `<body class="is-preload">`**

In `index.html`, the body opens with `<body class="is-preload">` (around line 14). Immediately after that opening tag (on the next line), insert the following block verbatim. Note the SVG icons for GitHub/LinkedIn/Email are inline.

```html
<!-- Landing Hero -->
<section id="hero" aria-label="Landing hero">
  <div class="hero-mesh" aria-hidden="true"></div>
  <div class="hero-content">

    <aside class="personal-card" aria-label="About Yi Cao">
      <img class="pc-avatar" src="images/avatar.jpeg" alt="" />
      <h1 class="pc-name">Yi Cao</h1>
      <p class="pc-slogan">
        <span class="pc-slogan-line1">An engineer of atoms.</span>
        <span class="pc-slogan-line2">A dreamer in code.</span>
      </p>
      <p class="pc-sub">Coding for materials, from understanding to 0-to-1.</p>
      <p class="pc-byline">PhD researcher, ChemBE &middot; Johns Hopkins</p>
      <ul class="pc-social" aria-label="Social links">
        <li>
          <a href="https://github.com/yicao-elina" aria-label="GitHub" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.07c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.78 2.72 1.27 3.38.97.1-.75.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.4-5.25 5.69.42.37.8 1.1.8 2.22v3.29c0 .31.21.66.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z"/></svg>
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/yi-cao-1368ab292/" aria-label="LinkedIn" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"/></svg>
          </a>
        </li>
        <li>
          <a href="mailto:ycao73@jh.edu" aria-label="Email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
          </a>
        </li>
      </ul>
      <div class="pc-ctas">
        <a class="pc-cta pc-cta-primary" href="#two">Read research</a>
        <a class="pc-cta pc-cta-ghost" href="https://github.com/yicao-elina" target="_blank" rel="noopener">View GitHub</a>
      </div>
    </aside>

    <section class="portfolio" aria-label="Selected work">
      <div class="portfolio-grid">

        <a class="tile" href="https://openreview.net/forum?id=K95Tt6fYud&amp;noteId=K95Tt6fYud" target="_blank" rel="noopener" data-tilt>
          <img class="tile-img" src="images/thumbs/dualx-teaser.png" alt="" />
          <div class="tile-body">
            <h3 class="tile-title">DUAL-X</h3>
            <p class="tile-sub">AAAI 2026 XAI4Science Spotlight &middot; A dual-level explainability framework for ML force fields.</p>
            <span class="tile-arrow" aria-hidden="true">&rarr;</span>
          </div>
        </a>

        <a class="tile" href="https://openreview.net/forum?id=SK5NpcSf9f" target="_blank" rel="noopener" data-tilt>
          <img class="tile-img" src="images/thumbs/replican-paper.png" alt="" />
          <div class="tile-body">
            <h3 class="tile-title">RepliCan</h3>
            <p class="tile-sub">COLM 2026 &middot; Evaluating LLM agents on scientific reproducibility.</p>
            <span class="tile-arrow" aria-hidden="true">&rarr;</span>
          </div>
        </a>

        <a class="tile" href="#two" data-tilt>
          <img class="tile-img" src="images/thumbs/aria-paper.png" alt="" />
          <div class="tile-body">
            <h3 class="tile-title">ARIA</h3>
            <p class="tile-sub">KDD 2026 AI4Sciences &middot; Causal-aware framework for trustworthy materials discovery.</p>
            <span class="tile-arrow" aria-hidden="true">&rarr;</span>
          </div>
        </a>

        <a class="tile" href="https://www.linkedin.com/feed/update/urn:li:activity:7437471139364343808/" target="_blank" rel="noopener" data-tilt>
          <img class="tile-img" src="images/qualcomm-intern.jpeg" alt="" />
          <div class="tile-body">
            <h3 class="tile-title">GPU Agentic Workflow</h3>
            <p class="tile-sub">Qualcomm &middot; Summer 2026 &middot; Knowledge-graph-assisted debugging on the GPU stack.</p>
            <span class="tile-arrow" aria-hidden="true">&rarr;</span>
          </div>
        </a>

        <a class="tile" href="https://www.vivabiotech.com" target="_blank" rel="noopener" data-tilt>
          <img class="tile-img" src="images/thumbs/viva-biotech.png" alt="" />
          <div class="tile-body">
            <h3 class="tile-title">Viva Biotech CADD</h3>
            <p class="tile-sub">Summer 2024 &middot; Co-solvent MD + protein-ligand analysis for drug discovery.</p>
            <span class="tile-arrow" aria-hidden="true">&rarr;</span>
          </div>
        </a>

        <a class="tile tile-explore" href="#two" aria-label="Explore more of Yi Cao's work">
          <span class="tile-explore-text">Explore more <span aria-hidden="true">&rarr;</span></span>
          <span class="tile-explore-sub">All papers, blog posts, and talks</span>
        </a>

      </div>
    </section>

  </div>
</section>
```

### Sub-step 6d: Add the two new scripts

- [ ] **Step 5: Add the two new script tags at the bottom of the body**

In `index.html`, find the existing scripts block (around line 819). It looks like:
```html
<!-- Scripts -->
<script src="assets/js/jquery.min.js"></script>
<script src="assets/js/jquery.poptrox.min.js"></script>
<script src="assets/js/browser.min.js"></script>
<script src="assets/js/breakpoints.min.js"></script>
<script src="assets/js/util.js"></script>
<script src="assets/js/main.js"></script>
```

Immediately *after* the `<script src="assets/js/main.js"></script>` line, add:
```html
<script src="assets/js/hero-tilt.js" defer></script>
<script src="assets/js/hero-mesh.js" defer></script>
```

Note: `defer` is used so the scripts run after the DOM is parsed but before `DOMContentLoaded` fires. The inline scripts further down the file (the `.expand-card` toggle) do not conflict because the hero scripts only touch `.hero-mesh`, `[data-tilt]`, and the body class list.

### Sub-step 6e: Verify and commit

- [ ] **Step 6: Run the smoke test**

Start a local static server in the background:
```bash
( python3 -m http.server 8123 --directory . >/dev/null 2>&1 & ) && sleep 1
```

Then run the test:
```bash
node --test tests/hero-smoke.test.js
```
Expected: all 5 tests pass. If any fail, re-read the failed assertion, fix the corresponding edit, and re-run. **Do not skip failing tests.**

Stop the server:
```bash
pkill -f "http.server 8123" || true
```

- [ ] **Step 7: Visual smoke test in a real browser**

Open `index.html` in a browser at desktop width (1440px) and verify:
- The hero section fills the viewport.
- The personal card is on the left, the 3×2 tile grid is on the right.
- The slogan reads "An engineer of atoms. / A dreamer in code." with the second line in green.
- All 5 work tiles are visible with thumbnails loaded.
- The 6th "Explore more →" tile is in the bottom-right and is visibly lighter than the others.
- The mesh backdrop is visible (soft teal in the top-left, soft amber in the bottom-right).
- Hovering a tile causes it to tilt toward the cursor, lift, and reveal the → arrow.
- The two CTAs ("Read research" and "View GitHub") work.

Then resize to tablet (768px) and verify the grid becomes 2×3, the personal card is on top, and the explore-more tile is bottom-right.

Then resize to phone (375px) and verify the grid becomes 1 column, 6 tiles stacked.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat(hero): add landing hero section to index.html"
```

---

## Task 7: Final verification & push

**Files:**
- Modify: nothing (verification only)
- Read: `index.html` after all edits

- [ ] **Step 1: Re-run the smoke test**

```bash
( python3 -m http.server 8123 --directory . >/dev/null 2>&1 & ) && sleep 1
node --test tests/hero-smoke.test.js
pkill -f "http.server 8123" || true
```
Expected: 5/5 pass.

- [ ] **Step 2: Diff sanity check**

```bash
git log --oneline -10
git diff --stat HEAD~7..HEAD
```
Expected: 7 commits ahead of the spec. The diff stat should show roughly:
- `index.html`: +170 / -10 lines
- `assets/css/hero.css`: +280 / 0
- `assets/js/hero-tilt.js`: +60 / 0
- `assets/js/hero-mesh.js`: +45 / 0
- `images/thumbs/dualx-teaser.png`: new file, ~150–300 KB
- `tests/hero-smoke.test.js`: +60 / 0
- `docs/superpowers/specs/2026-07-09-landing-hero-design.md`: 0 (unchanged since the spec was committed earlier)

- [ ] **Step 3: Push the branch**

```bash
git push origin gh-pages
```
Expected: successful push. The site is on the `gh-pages` branch (per the repo's git config), so a push here updates the live site. If the user prefers a PR, branch off `main` first and rebase.

---

## Self-Review (per writing-plans skill)

**1. Spec coverage:**
- §1 Positioning & slogans → Tasks 5 & 6 (personal card slogans).
- §2 Hero architecture → Task 2 (mesh + grid layout in hero.css) + Task 6 (DOM).
- §3 Personal card → Task 2 (`.personal-card` and child styles) + Task 6 (DOM).
- §4 Portfolio strip → Task 2 (`.portfolio-grid` and `.tile` styles) + Task 3 (tilt) + Task 6 (DOM).
- §5 Integration → Task 6 (the index.html edit) + Task 7 (verification).
- §6 YAGNI → enforced by the Global Constraints block above; no task introduces a marquee, dark mode, new font, etc.
- §7 Open questions → not all need a task: the DUAL-X thumbnail generation (Task 1) addresses one; aria-labelledby (Task 6 sub-step 6c uses `aria-label` on the `<section>`, which is a sufficient resolution); the rest (commit messages, spec list updates) are housekeeping in Task 7.

**2. Placeholder scan:** No TBDs, no "implement later," no "similar to Task N" cross-references. Every step has either an exact command, exact code, or an exact file path with content.

**3. Type consistency:** No shared types in this plan (vanilla JS, no module exports). The CSS class names are consistent across hero.css and the DOM in Task 6. The `--tilt-x` / `--tilt-y` CSS variables are consistent across hero.css and hero-tilt.js.

**Issues found and fixed inline during self-review:** None.
