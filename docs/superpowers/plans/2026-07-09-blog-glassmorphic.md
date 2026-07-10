# Blog Glassmorphic Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the two category grids on `blog.html` (Technical Tips, Life Beyond Research) with lvy-style glassmorphic cards, a soft CSS mesh backdrop, a cursor-tracking spotlight glow, and a 3D perspective tilt on hover — all using the same color palette and type stack as the new landing hero.

**Architecture:** A single new `<div class="blog-mesh">` injected into `blog.html`, styled by a new self-contained `assets/css/blog.css`, and animated by three small vanilla-JS modules (`blog-tilt.js`, `blog-spotlight.js`, `blog-mesh.js`). All 8 article cards are re-skinned in place (class swap, attribute additions). The header gets a glass refresh via the new CSS. The code-snippets section, footer, nav, and existing scripts are untouched.

**Tech Stack:** Static HTML/CSS/Vanilla JS, jQuery 1.x (existing, unchanged), main.css (existing, unchanged). No build step. No new package dependencies. Smoke test uses Node's built-in `node:test` + `fetch` (Node 18+).

## Global Constraints

These are project-wide rules copied verbatim from the spec. Every task's requirements implicitly include this section.

- **Color tokens (reused from hero spec, no new colors):** `#49bf9d` (accent, CTAs, focus rings), `#1d1d1f` (ink), `#333333` (ink-muted-80), `#7a7a7a` (ink-muted-48), `rgba(255,255,255,0.55)` (card bg), `rgba(255,255,255,0.6)` (card border), `rgba(0,0,0,0.06)` (card default shadow), `rgba(0,0,0,0.10)` (card hover shadow), `rgba(73,191,157,0.14)` (mesh blob 1 teal), `rgba(245,185,66,0.12)` (mesh blob 2 amber), `rgba(73,191,157,0.18)` (spotlight glow), `#fafafc` (page base under mesh). **No other colors.**
- **Type stack:** `SF Pro Display, SF Pro Text, system-ui, -apple-system, sans-serif`. **No Google Fonts, no Inter.**
- **Motion budget (only three effects):** mesh drift (32–40s), card tilt (max 6°, 220ms ease-out), spotlight glow (radial gradient 360px, 220ms opacity transition), hover lift (translateY -6px, 220ms ease). **No scroll-triggered animations. No scroll-jacking.**
- **Reduced motion:** All three effects must be disabled when `prefers-reduced-motion: reduce` matches. Mesh drift is gated by a `.no-motion` class set by JS (more reliable than CSS-only). Tilt JS no-ops on reduced motion. Spotlight JS no-ops on reduced motion. Hover lift transitions are kept (they're instant on/off, not animated motion in the accessibility sense).
- **Fallback for `backdrop-filter`:** under `@supports not (backdrop-filter: blur(1px))` use `background: rgba(255,255,255,0.92)` for cards and `rgba(255,255,255,0.85)` for the header.
- **Eight work cards (in place, not redesigned):** Technical Tips (DFT Convergence Tips, Getting Started with ML Force Fields, Useful Quantum ESPRESSO Scripts, Beautiful Plots for Materials Science) + Life Beyond Research (My Table Tennis Journey, Learning Tennis at 24, Four Seasons at Hopkins, Conference Cities Through My Lens). Each gets `class="glass-card"`, `data-tilt`, `data-spotlight`.
- **Existing header `<header id="header">` is refreshed (glass treatment), not removed.** The DOM is unchanged.
- **YAGNI enforcement:** No custom cursor, no canvas mesh, no hero, no search/filter, no dark mode, no new fonts, no new icon font, no SVG art, no 3D flip, no scroll-jacking, no AI-generated background. Do not introduce these in any task.
- **Commit attribution:** The user has attribution disabled globally. Do not add `Co-Authored-By:` lines.

---

## File Map

### Files to create

| File | Responsibility | Approx size |
|---|---|---|
| `assets/css/blog.css` | All blog styles — mesh, glass card, spotlight CSS variables, header refresh, responsive breakpoints, reduced-motion fallbacks. Self-contained, no `@import`, no references to existing site CSS. | ~5 KB |
| `assets/js/blog-tilt.js` | Attaches a `mousemove` listener to each `[data-tilt]` card, writes `--tilt-x` / `--tilt-y` CSS variables on `requestAnimationFrame`, capped at ±6°. No-ops on reduced motion. Idempotent. | ~1.2 KB |
| `assets/js/blog-spotlight.js` | Attaches a `pointermove` listener to each `[data-spotlight]` card, writes `--mx` / `--my` CSS variables (0–100% within the card), throttled with `requestAnimationFrame`. No-ops on reduced motion. Idempotent. | ~1.5 KB |
| `assets/js/blog-mesh.js` | Adds/removes a `.no-motion` class on the `<body>` based on `prefers-reduced-motion`. Also pauses mesh drift on `visibilitychange` to save battery. | ~0.5 KB |
| `tests/blog-smoke.test.js` | Node `node:test` smoke test that fetches `blog.html` from a local static server, asserts the mesh div is present, asserts 8 glass cards are present, and asserts the 4 new files are referenced. | ~0.7 KB |

### Files to modify

| File | Change |
|---|---|
| `blog.html` | Add `<link rel="stylesheet" href="assets/css/blog.css">` in the `<head>`. Add `<div class="blog-mesh" aria-hidden="true"></div>` immediately after `<body class="is-preload">`. Add `data-tilt data-spotlight` and swap `work-item` for `glass-card` on all 8 article cards. Add 3 new `<script>` tags with `defer` after the existing scripts. **No other changes.** |

### Files NOT touched

- `assets/css/main.css` and its dropdown menu, news strip, vision expand-cards, etc.
- `assets/js/jquery.min.js`, `browser.min.js`, `breakpoints.min.js`, `util.js`, `main.js`, `jquery.poptrox.min.js`.
- `index.html`, `presentations.html`, all blog subpages.
- The existing top nav, the existing top `<header id="header">` DOM, the existing `<div id="main">`, the existing `<footer id="footer">`.
- The "Quick Code Snippets" section, the "Stay Connected" section, the `<aside>`-style structure of the page.
- The "Sharing Knowledge & Life" intro section (it stays as-is).

---

## Task 1: Create `assets/css/blog.css` (the full blog stylesheet)

**Files:**
- Create: `assets/css/blog.css`

**Interfaces:**
- Consumes: nothing (the file is self-contained).
- Produces: a CSS file that styles the elements documented in the spec §3. The file's selectors are the contract: `.blog-mesh`, `.glass-card`, `.glass-card::before`, `.glass-card .image`, `.glass-card h3`, `.glass-card .blog-meta`, `.glass-card p`, `.btn-teal`, `#header.glass-header`, `#header.glass-header .image.avatar img`.

- [ ] **Step 1: Write the stylesheet**

Write the file `assets/css/blog.css` with the following exact content:

```css
/* ============================================================
   Blog Glassmorphic Styles
   Self-contained styles for blog.html — mesh backdrop,
   glass cards, cursor spotlight, header refresh, responsive.
   Color/type/motion tokens are documented in
   docs/superpowers/specs/2026-07-09-blog-glassmorphic-design.md
   ============================================================ */

/* ---------- Mesh backdrop (CSS-only, same shape as hero) ---------- */

.blog-mesh {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: #fafafc;
}

.blog-mesh::before,
.blog-mesh::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}

.blog-mesh::before {
  top: -10%;
  left: -10%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(73, 191, 157, 0.14) 0%, rgba(73, 191, 157, 0) 70%);
  animation: blog-mesh-drift-a 32s ease-in-out infinite alternate;
}

.blog-mesh::after {
  bottom: -15%;
  right: -15%;
  width: 70vw;
  height: 70vw;
  background: radial-gradient(circle, rgba(245, 185, 66, 0.12) 0%, rgba(245, 185, 66, 0) 70%);
  filter: blur(100px);
  animation: blog-mesh-drift-b 40s ease-in-out infinite alternate;
}

@keyframes blog-mesh-drift-a {
  from { transform: translate(0, 0); }
  to   { transform: translate(40px, 20px); }
}

@keyframes blog-mesh-drift-b {
  from { transform: translate(0, 0); }
  to   { transform: translate(-50px, 30px); }
}

/* Pause mesh drift when tab is hidden (battery) */
.blog-mesh.is-paused::before,
.blog-mesh.is-paused::after {
  animation-play-state: paused;
}

/* Disable mesh drift when reduced motion is set via JS (.no-motion on <body>) */
body.no-motion .blog-mesh::before,
body.no-motion .blog-mesh::after {
  animation: none;
}

/* ---------- Glass card ---------- */

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
.glass-card:focus-within {
  transform: perspective(800px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg)) translateY(-6px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.10);
}

.glass-card:focus-within { outline: 2px solid #49bf9d; outline-offset: 2px; }

/* Spotlight glow — follows the cursor via --mx / --my (set by blog-spotlight.js) */

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
.glass-card:focus-within::before { opacity: 1; }

/* Disable spotlight when reduced motion is set via JS */
body.no-motion .glass-card::before { opacity: 0; }

/* Card children sit above the spotlight glow */

.glass-card > * { position: relative; z-index: 1; }

/* ---------- Card internals ---------- */

.glass-card .image.fit.thumb {
  display: block;
  margin: -20px -20px 16px;     /* bleed to card edges */
}

.glass-card .image.fit.thumb img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border: 0;
}

.glass-card h3 {
  margin: 0 0 4px;
  font-family: "SF Pro Display", system-ui, -apple-system, sans-serif;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.224px;
  line-height: 1.24;
  color: #1d1d1f;
}

.glass-card .blog-meta {
  margin: 0 0 10px;
  font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.43;
  color: #7a7a7a;
}

.glass-card p {
  margin: 0 0 16px;
  font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  color: #333333;
}

/* Teal "Read More" button variant — sits at the bottom of the card */

.btn-teal {
  align-self: flex-start;
  display: inline-block;
  padding: 8px 18px;
  border-radius: 9999px;
  border: 1px solid #49bf9d;
  background: transparent;
  color: #49bf9d;
  font-family: "SF Pro Text", system-ui, -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.0;
  text-decoration: none;
  transition: background 200ms ease, color 200ms ease, transform 200ms ease;
  margin-top: auto;
}

.btn-teal:hover,
.btn-teal:focus-visible {
  background: #49bf9d;
  color: #ffffff;
  transform: scale(0.97);
}

.btn-teal:focus-visible { outline: 2px solid #0071e3; outline-offset: 2px; }

/* ---------- Header refresh (glass treatment on the existing #header) ---------- */

#header.glass-header {
  position: relative;
  z-index: 1;
  margin: 32px auto 0;
  max-width: 1100px;
  padding: 48px 32px;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
}

#header.glass-header .image.avatar img {
  border: 2px solid rgba(73, 191, 157, 0.6);
}

/* ---------- Reduced motion (CSS-side fallback) ---------- */

@media (prefers-reduced-motion: reduce) {
  .blog-mesh::before,
  .blog-mesh::after { animation: none; }
  .glass-card,
  .btn-teal,
  .glass-card::before { transition: none; }
}

/* ---------- Browser fallback for missing backdrop-filter ---------- */

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass-card { background: rgba(255, 255, 255, 0.92); }
  #header.glass-header { background: rgba(255, 255, 255, 0.88); }
}

/* ---------- Section header typography refresh ---------- */

#technical-tips > h2,
#personal-blog > h2 {
  font-family: "SF Pro Display", system-ui, -apple-system, sans-serif;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.28px;
  color: #1d1d1f;
}

/* ---------- Responsive ---------- */

@media (max-width: 1023px) and (min-width: 640px) {
  #header.glass-header { margin: 24px 24px 0; padding: 40px 28px; }
  .glass-card { padding: 16px; }
  .glass-card h3 { font-size: 18px; }
}

@media (max-width: 639px) {
  #header.glass-header { margin: 16px 16px 0; padding: 32px 20px; }
  .glass-card { padding: 16px; }
  .glass-card .image.fit.thumb { margin: -16px -16px 12px; }
  .glass-card h3 { font-size: 18px; }
  .glass-card p { font-size: 14px; }
}
```

- [ ] **Step 2: Verify the file is well-formed**

Run:
```bash
wc -l assets/css/blog.css
```
Expected: ~210 lines. If under 150, the file was truncated; re-check the content.

- [ ] **Step 3: Commit**

```bash
git add assets/css/blog.css
git commit -m "feat(blog): add blog glassmorphic stylesheet (mesh, glass card, spotlight, header refresh)"
```

---

## Task 2: Create `assets/js/blog-tilt.js` (the 3D perspective tilt)

**Files:**
- Create: `assets/js/blog-tilt.js`

**Interfaces:**
- Consumes: any element with the `[data-tilt]` attribute (one per glass card). The element's bounding box (read with `getBoundingClientRect()`). `prefers-reduced-motion` media query.
- Produces: CSS custom properties `--tilt-x` and `--tilt-y` set on each card, in degrees, range `[-6, 6]`. No return value. The script is idempotent — calling it twice does not double-attach listeners (uses a `data-tilt-bound` marker).

- [ ] **Step 1: Write the script**

Write the file `assets/js/blog-tilt.js` with the following exact content:

```javascript
/* ============================================================
   blog-tilt.js
   Mouse-reactive 3D tilt on glass cards.
   Sets --tilt-x and --tilt-y CSS custom properties on each
   [data-tilt] element, capped at +/- 6 degrees.
   No-ops when prefers-reduced-motion: reduce.
   Idempotent: safe to call multiple times.
   ============================================================ */
(function () {
  "use strict";

  var MAX_TILT_DEG = 6;
  var ATTR = "data-tilt-bound";
  var SELECTOR = "[data-tilt]";

  function isReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function attach(card) {
    if (card.getAttribute(ATTR) === "true") return;
    card.setAttribute(ATTR, "true");

    var frameId = null;
    var pendingX = 0;
    var pendingY = 0;

    function apply() {
      frameId = null;
      card.style.setProperty("--tilt-x", pendingX.toFixed(2) + "deg");
      card.style.setProperty("--tilt-y", pendingY.toFixed(2) + "deg");
    }

    function onMove(e) {
      if (isReducedMotion()) return;
      var rect = card.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) / (rect.width / 2);   // -1..1
      var dy = (e.clientY - cy) / (rect.height / 2);  // -1..1
      pendingX = Math.max(-1, Math.min(1, dx)) * MAX_TILT_DEG;
      pendingY = Math.max(-1, Math.min(1, -dy)) * MAX_TILT_DEG;  // invert Y so up-tilt is positive
      if (frameId === null) frameId = window.requestAnimationFrame(apply);
    }

    function onLeave() {
      pendingX = 0;
      pendingY = 0;
      if (frameId === null) frameId = window.requestAnimationFrame(apply);
    }

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
  }

  function init() {
    var cards = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < cards.length; i++) attach(cards[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
```

- [ ] **Step 2: Verify the file parses cleanly**

Run:
```bash
node --check assets/js/blog-tilt.js
```
Expected: no output (the file parses cleanly). If `node --check` is unavailable, open the file and confirm it has no syntax errors by eye.

- [ ] **Step 3: Commit**

```bash
git add assets/js/blog-tilt.js
git commit -m "feat(blog): add mouse-reactive glass card tilt (capped at 6deg)"
```

---

## Task 3: Create `assets/js/blog-spotlight.js` (the cursor-tracking glow)

**Files:**
- Create: `assets/js/blog-spotlight.js`

**Interfaces:**
- Consumes: any element with the `[data-spotlight]` attribute (one per glass card). The element's bounding box (read with `getBoundingClientRect()`). `prefers-reduced-motion` media query. `PointerEvent` (for touch + mouse unification).
- Produces: CSS custom properties `--mx` and `--my` set on each card as percentage strings (range `0%–100%`). No return value. The script is idempotent — calling it twice does not double-attach listeners (uses a `data-spotlight-bound` marker). On `pointerleave`, the spotlight fades out via CSS transition (no JS reset needed because the CSS `::before` only becomes opaque on `:hover` / `:focus-within`).

- [ ] **Step 1: Write the script**

Write the file `assets/js/blog-spotlight.js` with the following exact content:

```javascript
/* ============================================================
   blog-spotlight.js
   Cursor-tracking spotlight glow on glass cards.
   Sets --mx and --my CSS custom properties on each
   [data-spotlight] element as 0-100% percentages.
   No-ops when prefers-reduced-motion: reduce.
   Idempotent: safe to call multiple times.
   ============================================================ */
(function () {
  "use strict";

  var ATTR = "data-spotlight-bound";
  var SELECTOR = "[data-spotlight]";

  function isReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function attach(card) {
    if (card.getAttribute(ATTR) === "true") return;
    card.setAttribute(ATTR, "true");

    var frameId = null;
    var pendingMx = "50%";
    var pendingMy = "50%";

    function apply() {
      frameId = null;
      card.style.setProperty("--mx", pendingMx);
      card.style.setProperty("--my", pendingMy);
    }

    function onMove(e) {
      if (isReducedMotion()) return;
      var rect = card.getBoundingClientRect();
      // Clamp to card bounds so the glow stays inside even on fast movement.
      var x = Math.max(rect.left, Math.min(rect.right, e.clientX));
      var y = Math.max(rect.top, Math.min(rect.bottom, e.clientY));
      var pctX = ((x - rect.left) / rect.width) * 100;
      var pctY = ((y - rect.top) / rect.height) * 100;
      pendingMx = pctX.toFixed(2) + "%";
      pendingMy = pctY.toFixed(2) + "%";
      if (frameId === null) frameId = window.requestAnimationFrame(apply);
    }

    // Use pointer events for unified mouse/touch handling.
    if (window.PointerEvent) {
      card.addEventListener("pointermove", onMove);
    } else {
      // Legacy fallback (mousemove only).
      card.addEventListener("mousemove", onMove);
    }
  }

  function init() {
    var cards = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < cards.length; i++) attach(cards[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
```

- [ ] **Step 2: Verify the file parses cleanly**

Run:
```bash
node --check assets/js/blog-spotlight.js
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add assets/js/blog-spotlight.js
git commit -m "feat(blog): add cursor-tracking spotlight glow on glass cards"
```

---

## Task 4: Create `assets/js/blog-mesh.js` (the reduced-motion + visibility gate)

**Files:**
- Create: `assets/js/blog-mesh.js`

**Interfaces:**
- Consumes: `prefers-reduced-motion` media query, `document.visibilityState`, the `<body>` element, and any `.blog-mesh` element.
- Produces: a `body.no-motion` class when the user has reduced motion on, and a `.blog-mesh.is-paused` class when the tab is hidden. Idempotent.

- [ ] **Step 1: Write the script**

Write the file `assets/js/blog-mesh.js` with the following exact content:

```javascript
/* ============================================================
   blog-mesh.js
   Gating logic for the blog mesh backdrop.
   - Adds body.no-motion when prefers-reduced-motion: reduce.
     CSS uses this to disable the mesh-drift keyframe and the
     spotlight glow.
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
    var meshes = document.querySelectorAll(".blog-mesh");
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

- [ ] **Step 2: Verify the file parses cleanly**

Run:
```bash
node --check assets/js/blog-mesh.js
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add assets/js/blog-mesh.js
git commit -m "feat(blog): add mesh motion gate (reduced-motion + visibility)"
```

---

## Task 5: Write the smoke test

**Files:**
- Create: `tests/blog-smoke.test.js`

**Interfaces:**
- Consumes: a running local static file server (any simple one; see Test harness below).
- Produces: exit code 0 if all assertions pass, non-zero on failure. Test output goes to stdout.

- [ ] **Step 1: Write the test**

Write the file `tests/blog-smoke.test.js` with the following exact content:

```javascript
// Smoke test for the blog glassmorphic redesign.
// Run with: node --test tests/blog-smoke.test.js
// Requires a local static server already running at http://127.0.0.1:8123/.
// Start it with:  python3 -m http.server 8123 --directory . >/dev/null 2>&1 &

const test = require("node:test");
const assert = require("node:assert/strict");

const BASE = "http://127.0.0.1:8123";

async function getHtml() {
  const res = await fetch(BASE + "/blog.html");
  assert.equal(res.status, 200, "blog.html must return 200");
  return await res.text();
}

function find(html, needle) {
  return html.includes(needle);
}

test("blog.html has the mesh backdrop", async () => {
  const html = await getHtml();
  assert.ok(find(html, 'class="blog-mesh"'), ".blog-mesh div present");
});

test("blog.html has 8 glass cards and no work-item cards", async () => {
  const html = await getHtml();
  // 4 Technical Tips + 4 Life Beyond Research = 8
  const glassCount = (html.match(/class="[^"]*\bglass-card\b[^"]*"/g) || []).length;
  assert.equal(glassCount, 8, "exactly 8 .glass-card elements");
  // The old work-item class must be gone
  assert.ok(!find(html, 'class="work-item"'), "old .work-item class is removed");
  // Every glass card must have data-tilt AND data-spotlight
  assert.ok(/class="[^"]*\bglass-card\b[^"]*"[^>]*data-tilt/.test(html), "glass card has data-tilt");
  assert.ok(/class="[^"]*\bglass-card\b[^"]*"[^>]*data-spotlight/.test(html), "glass card has data-spotlight");
});

test("blog.html links the new CSS file", async () => {
  const html = await getHtml();
  assert.ok(find(html, 'assets/css/blog.css'), "blog.css linked");
});

test("blog.html includes the 3 new script files", async () => {
  const html = await getHtml();
  assert.ok(find(html, 'assets/js/blog-tilt.js'), "blog-tilt.js included");
  assert.ok(find(html, 'assets/js/blog-spotlight.js'), "blog-spotlight.js included");
  assert.ok(find(html, 'assets/js/blog-mesh.js'), "blog-mesh.js included");
});

test("blog.html still has the original header", async () => {
  const html = await getHtml();
  assert.ok(find(html, '<header id="header"'), "original <header id=\"header\"> is preserved");
});

test("blog.html still has the original scripts and nav", async () => {
  const html = await getHtml();
  assert.ok(find(html, 'assets/js/jquery.min.js'), "jQuery still loaded");
  assert.ok(find(html, 'id="nav"'), "top nav still present");
  assert.ok(find(html, 'id="footer"'), "footer still present");
});
```

- [ ] **Step 2: Commit the test (it will fail until Task 6 lands)**

```bash
git add tests/blog-smoke.test.js
git commit -m "test(blog): add blog glassmorphic smoke test"
```

---

## Task 6: Apply the redesign to `blog.html` (the single big edit)

**Files:**
- Modify: `blog.html` — multiple discrete edits, all in this one file.

**Interfaces:**
- Consumes: the existing `blog.html` structure (HTML5 UP template, jQuery + inline styles + the existing top header + the two category grids + the code-snippets section + the footer).
- Produces: 1 new stylesheet `<link>`, 1 new `<div class="blog-mesh">`, all 8 article cards re-skinned (class swap, attribute additions), 3 new `<script>` tags with `defer`. The existing header DOM, code-snippets section, footer, and nav are **unchanged**.

This is the largest single edit. It's broken into sub-steps so the implementer doesn't lose their place.

### Sub-step 6a: Add the stylesheet link

- [ ] **Step 1: Add the blog stylesheet to the `<head>`**

In `blog.html`, find this line (around line 24):
```html
<link rel="stylesheet" href="assets/css/main.css" />
```

Immediately *after* that line, add:
```html
<link rel="stylesheet" href="assets/css/blog.css" />
```

### Sub-step 6b: Add the mesh backdrop

- [ ] **Step 2: Insert the mesh div immediately after `<body class="is-preload">`**

In `blog.html`, the body opens with `<body class="is-preload">` (around line 26). Immediately after that opening tag (on the next line), insert:
```html
<div class="blog-mesh" aria-hidden="true"></div>
```

### Sub-step 6c: Refresh the existing header

- [ ] **Step 3: Add the `glass-header` class to the existing `<header id="header">`**

In `blog.html`, find the existing header block (around line 29):
```html
<!-- Header -->
<header id="header">
    <div class="inner">
        <a href="index.html" class="image avatar"><img src="images/blog/Yi_2024_blossom.jpeg" alt="" /></a>
        <h1><strong>Yi Cao</strong><br />
        Blog & Resources</h1>
    </div>
</header>
```

Change the opening tag `<header id="header">` to `<header id="header" class="glass-header">`. **Do not change anything else in this block.** The DOM is otherwise preserved.

### Sub-step 6d: Re-skin the Technical Tips cards

- [ ] **Step 4: Replace the 4 Technical Tips `<article>` opening tags**

In `blog.html`, find the 4 `<article class="col-6 col-12-xsmall work-item">` opening tags inside the `<section class="blog-category" id="technical-tips">` block (around lines 56, 67, 78, 89).

For **each** of the 4 articles, replace the opening tag:

OLD:
```html
    <article class="col-6 col-12-xsmall work-item">
```

NEW:
```html
    <article class="col-6 col-12-xsmall glass-card" data-tilt data-spotlight>
```

Also, in the same articles, find the existing "Read More" / "View Gallery" `<a class="button small">` button (the 4th article uses `class="button small">View Gallery</a>`, the others use `class="button small">Read More</a>`). For **all 4**, change the class to include `btn-teal`:

OLD:
```html
                    <a href="blog/dft-convergence.html" class="button small">Read More</a>
```

NEW:
```html
                    <a href="blog/dft-convergence.html" class="button small btn-teal">Read More</a>
```

Apply the same `btn-teal` class addition to the other 3 articles' buttons (mlff-tutorial, qe-scripts, data-viz). The "View Gallery" button on data-viz also gets `btn-teal` added.

### Sub-step 6e: Re-skin the Life Beyond Research cards

- [ ] **Step 5: Replace the 4 Life Beyond Research `<article>` opening tags**

Find the 4 `<article class="col-6 col-12-xsmall work-item">` opening tags inside the `<section class="blog-category" id="personal-blog">` block (around lines 114, 125, 136, 147).

For **each** of the 4 articles, replace the opening tag:

OLD:
```html
    <article class="col-6 col-12-xsmall work-item">
```

NEW:
```html
    <article class="col-6 col-12-xsmall glass-card" data-tilt data-spotlight>
```

Also, in the same 4 articles, change each `<a class="button small">` opening tag to `<a class="button small btn-teal">` (the table-tennis, learning-tennis articles use "Read More"; jhu-seasons and conference-travels use "View Gallery"). The text inside the `<a>` tag stays exactly the same.

### Sub-step 6f: Add the three new script tags

- [ ] **Step 6: Add the 3 new script tags at the bottom of the body**

In `blog.html`, find the existing scripts block (around line 299):
```html
<!-- Scripts -->
<script src="assets/js/jquery.min.js"></script>
<script src="assets/js/browser.min.js"></script>
<script src="assets/js/breakpoints.min.js"></script>
<script src="assets/js/util.js"></script>
<script src="assets/js/main.js"></script>
```

Immediately *after* the `<script src="assets/js/main.js"></script>` line, add:
```html
<script src="assets/js/blog-tilt.js" defer></script>
<script src="assets/js/blog-spotlight.js" defer></script>
<script src="assets/js/blog-mesh.js" defer></script>
```

Note: the existing scripts do not have `defer`. We add `defer` only to our 3 new scripts (they have no cross-dependencies and the existing inline scripts further down the file do not touch the same elements).

### Sub-step 6g: Verify and commit

- [ ] **Step 7: Run the smoke test**

Start a local static server in the background:
```bash
( python3 -m http.server 8123 --directory . >/dev/null 2>&1 & ) && sleep 1
```

Then run the test:
```bash
node --test tests/blog-smoke.test.js
```
Expected: all 6 tests pass. If any fail, re-read the failed assertion, fix the corresponding edit, and re-run. **Do not skip failing tests.**

Stop the server:
```bash
pkill -f "http.server 8123" || true
```

- [ ] **Step 8: Visual smoke test in a real browser**

Open `blog.html` in a browser at desktop width (1440px) and verify:
- The mesh backdrop is visible (soft teal in the top-left, soft amber in the bottom-right).
- The 8 article cards are visible in a 3-column grid with 24px gap.
- The top header has a glass treatment (translucent, rounded, blurred).
- The "Read More" / "View Gallery" buttons are pill-shaped with a teal border.
- Hovering a card causes it to:
  - lift 6px,
  - tilt toward the cursor (3D perspective, max 6°),
  - show a soft teal radial glow under the cursor,
  - deepen the shadow.
- Tab-navigating: focus ring appears on the "Read More" link; the card lights up identically to hover.

Then resize to tablet (768px) and verify the grid becomes 2 columns.

Then resize to phone (375px) and verify the grid becomes 1 column, 8 cards stacked.

- [ ] **Step 9: Commit**

```bash
git add blog.html
git commit -m "feat(blog): apply glassmorphic redesign (mesh, glass cards, header refresh, scripts)"
```

---

## Task 7: Final verification & push

**Files:**
- Modify: nothing (verification only)
- Read: `blog.html` after all edits

- [ ] **Step 1: Re-run the smoke test**

```bash
( python3 -m http.server 8123 --directory . >/dev/null 2>&1 & ) && sleep 1
node --test tests/blog-smoke.test.js
pkill -f "http.server 8123" || true
```
Expected: 6/6 pass.

- [ ] **Step 2: Diff sanity check**

```bash
git log --oneline -10
git diff --stat HEAD~6..HEAD
```
Expected: 6 commits ahead of the spec. The diff stat should show roughly:
- `assets/css/blog.css`: +210 / 0
- `assets/js/blog-tilt.js`: +60 / 0
- `assets/js/blog-spotlight.js`: +60 / 0
- `assets/js/blog-mesh.js`: +50 / 0
- `tests/blog-smoke.test.js`: +50 / 0
- `blog.html`: +12 / -8 lines (8 article tag swaps + 4 button class additions + 1 stylesheet + 1 mesh div + 1 header class + 3 script tags, minus 8 old `work-item` class words)

- [ ] **Step 3: Push the branch**

```bash
git push origin gh-pages
```
Expected: successful push. The site is on the `gh-pages` branch (per the repo's git config), so a push here updates the live site. If the user prefers a PR, branch off `main` first and rebase.

---

## Self-Review (per writing-plans skill)

**1. Spec coverage:**
- §1 Goal → Task 6 (the blog.html edit) + Tasks 1–4 (the visual + JS).
- §2 Architecture → Tasks 1–5 (file map matches spec §2).
- §3.1 Mesh backdrop → Task 1 (`.blog-mesh` CSS).
- §3.2 Glass card → Task 1 (`.glass-card` CSS) + Task 2 (tilt JS) + Task 3 (spotlight JS).
- §3.3 Card contents → Task 1 (`.glass-card h3`, `.blog-meta`, `p`, `.btn-teal` CSS).
- §3.4 Header refresh → Task 1 (`#header.glass-header` CSS) + Task 6 sub-step 6c (the class addition).
- §4 Color & type tokens → Task 1 (CSS) — every token explicitly listed in the spec is used.
- §5.1 blog-tilt.js → Task 2.
- §5.2 blog-spotlight.js → Task 3.
- §5.3 blog-mesh.js → Task 4.
- §5.4 Script load order → Task 6 sub-step 6f (explicit ordering).
- §6 Card DOM contract → Task 6 sub-steps 6d + 6e (the article tag swaps).
- §7 Responsive → Task 1 (the 3 media queries).
- §8 Reduced motion & fallbacks → Task 1 (the `@media` and `@supports` blocks) + Tasks 2/3/4 (JS no-ops on reduced motion).
- §9 Accessibility → Task 1 (`:focus-within` mirror of `:hover`) + Tasks 2/3/4 (JS no-ops) + Task 6 sub-step 6d (the `tabindex="-1"` on the thumbnail wrapper, preserved from the existing markup).
- §10 Testing → Task 5 (the smoke test) + Task 6 sub-step 6g + Task 7.
- §11 YAGNI enforcement → enforced by the Global Constraints block above; no task introduces a custom cursor, canvas mesh, hero, search, dark mode, or new font.
- §12 Commit attribution → enforced by the Global Constraints block above; every commit message in every task omits `Co-Authored-By:`.
- §13 Open questions → "None" — no tasks needed.

**2. Placeholder scan:** No TBDs, no "implement later," no "similar to Task N" cross-references. Every step has either an exact command, exact code, or an exact file path with content. The sub-step 6d/6e instruction "for each of the 4 articles" is explicit and unambiguous because the count is stated in the same sentence.

**3. Type consistency:**
- CSS variables: `--tilt-x` / `--tilt-y` consistent between `blog.css` and `blog-tilt.js`. `--mx` / `--my` consistent between `blog.css` and `blog-spotlight.js`. `--spacing` is NOT used (that's lvy's Tailwind token; we use exact pixel/percentage values).
- Attribute names: `data-tilt`, `data-spotlight`, `data-tilt-bound`, `data-spotlight-bound` consistent between HTML, CSS, and JS.
- Class names: `.blog-mesh`, `.glass-card`, `.btn-teal`, `.glass-header` consistent between HTML, CSS, and JS.
- Function signatures: `attach(card)`, `init()` consistent within each JS file and matching the `hero-tilt.js` precedent.
- File paths: all absolute relative to repo root, matching the existing `assets/css/...` / `assets/js/...` layout.

**Issues found and fixed inline during self-review:** None. Plan is internally consistent and covers all spec requirements.
