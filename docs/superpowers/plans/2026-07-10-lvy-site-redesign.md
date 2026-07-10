# Lvy Site-Wide Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the whole site under one glassmorphic, mint-accented visual language by (a) replacing the text dropdown nav with a floating glass icon pill, (b) introducing a springy inline card-open primitive reused on research papers, work-experience cards, and news entries, (c) splitting the work-experience section into a kept Education timeline + a new 2-column Work Experience glass-card grid, (d) bumping research thumbnails to 220×160, (e) capping the news strip on the index to 3 cards + 1 "Read more" link to a new `news.html` Lvy-style year-grouped timeline, and (f) polishing Awards, Vision, and Contact with the same glass-card wrapper as everything else.

**Architecture:** New `assets/css/tokens.css` as the single source of truth for the 13 design tokens. Other stylesheets duplicate the token block at the top (no bundler, no `@import`). New `assets/css/header.css` for the floating glass icon-pill header. New `assets/js/header-tooltip.js` (~0.8 KB) and `assets/js/spring-card.js` (~1.5 KB) as the two new interactive primitives. New `news.html` for the Lvy-style year-grouped timeline. The existing `main-override.css` grows by ~250 lines (spring CSS, experience grid, news tweaks, section polish). Each task is one commit, independently shippable, with the smoke test extended in the final task.

**Tech Stack:** Static HTML/CSS/Vanilla JS, jQuery 1.x (existing, unchanged), Font Awesome 5 (existing, unchanged), Node `node:test` (existing, for the smoke test in Task 8). No build step. No new package dependencies. No new fonts. The site stays a pure static deployment on GitHub Pages.

## Global Constraints

These are project-wide rules copied verbatim from the spec. Every task's requirements implicitly include this section.

- **Design tokens (13, all use the names below):** `--ink: #141e2d`, `--graphite: #4a5568`, `--mint: #2a8a6e`, `--mint-bright: #49bf9d`, `--surface-pearl: #fafafc`, `--glass-bg: rgba(255,255,255,0.55)`, `--glass-bg-strong: rgba(255,255,255,0.7)`, `--glass-border: rgba(255,255,255,0.6)`, `--glass-border-strong: rgba(20,30,45,0.08)`, `--radius-card: 20px`, `--radius-pill: 999px`, `--font-display`, `--font-text`, `--ease-spring: cubic-bezier(.34,1.56,.64,1)`. **No other colors.** Other stylesheets duplicate the token block at the top (no `@import`).
- **Type stack:** `SF Pro Display, SF Pro Text, system-ui, -apple-system, sans-serif`. **No Google Fonts, no Inter.**
- **Glass card recipe (the single visual unit, applies to news cards, paper rows, work-experience cards, awards rows, vision/contact wrappers, the header pill, the news.html year-group cards):** `background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-card); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); box-shadow: 0 12px 40px rgba(0,0,0,0.08); transition: transform 220ms var(--ease-spring), box-shadow 220ms ease;` `.glass:hover { transform: translateY(-3px); box-shadow: 0 18px 50px rgba(0,0,0,0.12); }` `@supports not (backdrop-filter: blur(1px)) { .glass { background: rgba(255,255,255,0.92); } }`
- **Spring card-open animation:** `max-height: 0 → scrollHeight` over 380ms with `cubic-bezier(.34,1.56,.64,1)`. Opacity fades in over 280ms in parallel. `prefers-reduced-motion: reduce` → no overshoot, 200ms ease in/out, opacity only.
- **Header position:** `position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 1000`. Pill height 60px. Body gets `padding-top: 88px` (was 60px). Active page → `aria-current="page"`. On `<768px` viewport: 5 most-used icons + avatar + "⋯" overflow that opens a popover with the remaining 5 icons.
- **Header icon set (10, in order, FA5 outline):** `fa-newspaper` (News → `news.html`), `fa-flask` (Research → `index.html#two`), `fa-graduation-cap` (Experience → `index.html#experience`), `fa-trophy` (Awards → `index.html#awards`), `fa-eye` (Vision → `index.html#vision`), `fa-envelope` (Contact → `index.html#four`), `fa-pen-to-square` (Blog → `blog.html`), `fa-file-pdf` (CV → `CAO_Yi_CV.pdf`, target=`_blank`), `fa-brands:github` (GitHub → `https://github.com/yicao-elina`, target=`_blank`), `fa-presentation-screen` (Talks → `presentations.html`). Plus the avatar at the start (`images/avatar.jpeg`, 40px circle, mint ring) which scrolls to top.
- **News strip on the index:** exactly 3 news cards (most recent: Qualcomm May 2026, RepliCan Jul 2026, ARIA Jul 2026) + 1 "Read more" card linking to `news.html`. The 4th existing entry (KDD PhD Consortium Aug 2026) moves to `news.html`.
- **Research thumbnail size:** 220×160 pixels, `object-fit: cover`, displayed on the left of each paper row. Five paper rows in order: DUAL-X, RepliCan, ARIA, Qualcomm GPU, Viva Biotech.
- **Out of scope (explicitly):** `presentations.html` content (only the new header is added), `blog.html` content (already has its own glassmorphic spec landed; only the new header is added), a new Projects page (rejected — code lives at GitHub, talks live on `presentations.html`, papers live on the index), search on `news.html`, CV PDF, social links, dark mode, marquee, new fonts, new icon font, SVG art, 3D flip, scroll-jacking, AI-generated backgrounds.
- **YAGNI enforcement:** Do not introduce new dependencies, new fonts, new colors, dark mode, search, or scroll-triggered animations. The site is pure static HTML/CSS/JS.
- **Commit attribution:** The user has attribution disabled globally. Do not add `Co-Authored-By:` lines.
- **No-JS fallback:** If JavaScript is disabled, all `data-spring` panels render as static expanded content (set `<html class="no-js">` initially; `main.js` removes it on load). The header still works because icons are `<a>` tags.
- **Reduced motion:** All three effects (mesh drift, spring panel, header hover-lift) are disabled when `prefers-reduced-motion: reduce` matches.

---

## File Map

### Files to create

| File | Responsibility | Approx size |
|---|---|---|
| `assets/css/tokens.css` | Single source of truth for the 13 design tokens. Each consumer stylesheet duplicates this block. | ~0.7 KB |
| `assets/css/header.css` | Floating glass icon-pill header, avatar, icon buttons, tooltip, mobile overflow popover. Self-contained. | ~3 KB |
| `assets/js/header-tooltip.js` | Hover/focus tooltip delay + keyboard support + touch tap-to-show-2s. | ~0.8 KB |
| `assets/js/spring-card.js` | The `data-spring` expand/collapse primitive with reduced-motion fallback. | ~1.5 KB |
| `assets/js/news.js` | Year filter pills on `news.html`. | ~1.0 KB |
| `news.html` | Lvy-style year-grouped news timeline page. | ~4 KB |
| `docs/superpowers/plans/2026-07-10-lvy-site-redesign.md` | This plan. | — |

### Files to modify

| File | Change |
|---|---|
| `index.html` | Remove `<nav id="nav">`. Add `<header id="app-header">` (shared ~30-line partial, pasted). Bump paper thumbs to 220×160. Add `data-spring` and `<div class="spring-panel">` to each of the 5 paper rows; add `data-spring-default-open="true"` to the DUAL-X row. Add a new `#experience` section between `#one` and `#news` (2-col Work cards) and keep the existing `#skills-timeline` (Education) as the timeline. Change `#news` to 3 cards + 1 "Read more" card linking to `news.html`. Wrap `#awards`, `#vision`, `#four` content in a single `<div class="glass">` each. |
| `blog.html` | Add the shared `<header id="app-header">` partial. Existing blog header is **kept** (the blog spec's "Stay Connected" header). No other content changes. |
| `presentations.html` | Add the shared `<header id="app-header">` partial. No other content changes. |
| `assets/css/main-override.css` | Add the token block at the top. Add `.spring-panel` rules (~30 lines), the `#experience` grid (~50 lines), `#news` grid adjustment to 3+1 (~10 lines), the section-wrapper polish for Awards/Vision/Contact (~40 lines). Add the new files to the same stylesheet (no new stylesheet files except `header.css`). |
| `tests/hero-smoke.test.js` | Extend with 6+ new assertions (Task 8). |

### Files NOT touched

- `assets/css/hero.css`, `assets/css/blog.css`, `assets/css/main.css`, `assets/css/fontawesome-all.min.css` (read-only)
- `assets/js/hero-tilt.js`, `assets/js/hero-mesh.js`, `assets/js/blog-tilt.js`, `assets/js/blog-spotlight.js`, `assets/js/blog-mesh.js`, `assets/js/main.js`, `assets/js/util.js`, `assets/js/jquery.min.js`, `assets/js/jquery.poptrox.min.js`, `assets/js/breakpoints.min.js`, `assets/js/browser.min.js` (read-only)
- `presentations.html` content (header only)
- `blog.html` content (header only)
- The `index.html` hero section (read-only, reused as-is)
- The CV PDF and all social/external links

---

## Task 1: Extract shared design tokens to `assets/css/tokens.css`

**Files:**
- Create: `assets/css/tokens.css`
- Modify: `index.html` (add `<link rel="stylesheet" href="assets/css/tokens.css" />` to `<head>`)
- Modify: `blog.html` (same `<link>`)
- Modify: `presentations.html` (same `<link>`)

**Interfaces:**
- Consumes: nothing (this is the first task)
- Produces: `:root` custom properties on every page that loads `tokens.css`. All later tasks reference these by name (e.g., `var(--ink)`).

- [ ] **Step 1: Create `assets/css/tokens.css`**

Write the file:

```css
/* ============================================================
   Design tokens — single source of truth
   Duplicate this :root block at the top of every new
   stylesheet (no @import, no bundler). All visual rules in
   the site must reference these custom properties by name.
   ============================================================ */

:root {
  --ink: #141e2d;
  --graphite: #4a5568;
  --mint: #2a8a6e;
  --mint-bright: #49bf9d;
  --surface-pearl: #fafafc;
  --glass-bg: rgba(255, 255, 255, 0.55);
  --glass-bg-strong: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.6);
  --glass-border-strong: rgba(20, 30, 45, 0.08);
  --radius-card: 20px;
  --radius-pill: 999px;
  --font-display: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-text: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
  --ease-spring: cubic-bezier(.34, 1.56, .64, 1);
}
```

- [ ] **Step 2: Link `tokens.css` from every page**

In `index.html`, `blog.html`, `presentations.html`, add a new `<link>` **immediately before** the existing `assets/css/main.css` link (so tokens load first). The exact line to add in each file:

```html
<link rel="stylesheet" href="assets/css/tokens.css" />
```

For `index.html` (around line 12), the `<head>` block currently reads:

```html
<link rel="stylesheet" href="assets/css/main.css" />
<link rel="stylesheet" href="assets/css/hero.css" />
<link rel="stylesheet" href="assets/css/main-override.css" />
```

Change it to:

```html
<link rel="stylesheet" href="assets/css/tokens.css" />
<link rel="stylesheet" href="assets/css/main.css" />
<link rel="stylesheet" href="assets/css/hero.css" />
<link rel="stylesheet" href="assets/css/main-override.css" />
```

For `blog.html` and `presentations.html`, find the existing `<link rel="stylesheet" href="assets/css/main.css" />` line and add the new tokens link immediately before it.

- [ ] **Step 3: Verify no visual regression**

Start a local static server on port 8123 and check all three pages still render the same as before:

```bash
pkill -f "http.server 8123" 2>/dev/null; ( python3 -m http.server 8123 --directory /Users/alina/Documents/yicao-elina >/dev/null 2>&1 & ); sleep 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --no-sandbox --window-size=1440,900 --screenshot=/tmp/tokens-check.png "http://localhost:8123/"
```

Expected: the screenshot looks identical to the previous build (hero + nav + below-the-fold sections). `tokens.css` defines new variables that aren't yet referenced anywhere, so adding it has zero visual effect — that's the point. Kill the server:

```bash
pkill -f "http.server 8123"
```

- [ ] **Step 4: Commit**

```bash
git add assets/css/tokens.css index.html blog.html presentations.html
git commit -m "feat(design): extract shared design tokens to tokens.css"
```

---

## Task 2: Add the floating glass icon-pill header

**Files:**
- Create: `assets/css/header.css`
- Create: `assets/js/header-tooltip.js`
- Modify: `index.html` (remove `<nav id="nav">`; add `<header id="app-header">` and the 2 new file references)
- Modify: `blog.html` (add `<header id="app-header">`; **keep** existing blog header; reference the 2 new files)
- Modify: `presentations.html` (add `<header id="app-header">`; reference the 2 new files)
- Modify: `assets/css/main-override.css` (add `body { padding-top: 88px }`)

**Interfaces:**
- Consumes: tokens from Task 1 (`--ink`, `--mint`, `--glass-bg-strong`, `--ease-spring`, etc.)
- Produces: `<header id="app-header">` markup containing `<img class="ah-avatar">` + 10 `<a class="ah-icon" data-icon="…" data-tooltip="…">` buttons + 1 `<button class="ah-more">` for mobile overflow. Active page detection sets `aria-current="page"`.

The shared `<header id="app-header">` partial is **pasted verbatim** into all four pages. Keep the file count low: no `<script src="…/header-partial.html"></script>`, no build step. To prevent drift across copies, the source of truth lives in this plan; the implementer copy-pastes the block.

- [ ] **Step 1: Create `assets/css/header.css`**

Write the file:

```css
/* ============================================================
   Floating glass icon-pill header
   Self-contained. Loads after tokens.css so custom properties
   resolve. Replaces the old <nav id="nav"> text menu on every
   page.
   ============================================================ */

.app-header {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-pill);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  box-shadow: 0 8px 32px rgba(20, 30, 45, 0.08);
  font-family: var(--font-text);
}

.ah-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--mint);
  cursor: pointer;
  object-fit: cover;
  transition: transform 200ms var(--ease-spring);
  text-decoration: none;
  display: inline-block;
}
.ah-avatar:hover,
.ah-avatar:focus-visible { transform: scale(1.06); outline: none; }

.ah-icon {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--graphite);
  font-size: 18px;
  position: relative;
  transition: color 180ms ease, transform 180ms var(--ease-spring);
  text-decoration: none;
}
.ah-icon:hover,
.ah-icon:focus-visible {
  color: var(--mint);
  transform: translateY(-2px);
  outline: none;
}
.ah-icon[aria-current="page"] { color: var(--mint); }

.ah-tooltip {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  background: #fff;
  color: var(--ink);
  font: 600 11px/1 var(--font-text);
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 200ms ease, transform 200ms var(--ease-spring);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 1001;
}
.ah-icon:hover .ah-tooltip,
.ah-icon:focus-visible .ah-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.ah-more {
  display: none;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  border-radius: 50%;
  color: var(--graphite);
  font-size: 18px;
  cursor: pointer;
}
.ah-more:hover { color: var(--mint); }

.ah-popover {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 8px;
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  box-shadow: 0 12px 32px rgba(20, 30, 45, 0.12);
  min-width: 140px;
  flex-direction: column;
  gap: 4px;
}
.ah-popover.open { display: flex; }
.ah-popover .ah-icon { width: 100%; height: 36px; justify-content: flex-start; padding: 0 10px; border-radius: 10px; }

@media (max-width: 768px) {
  .app-header .ah-icon:nth-child(n+6):not(.ah-avatar) { display: none; }
  .ah-more { display: inline-flex; }
  .app-header { position: relative; top: 0; transform: none; left: 0; max-width: 100%; margin: 12px auto; }
  body { padding-top: 12px !important; }
}

@media (prefers-reduced-motion: reduce) {
  .ah-avatar,
  .ah-icon,
  .ah-tooltip { transition: none; }
  .ah-avatar:hover { transform: none; }
  .ah-icon:hover { transform: none; }
}
```

- [ ] **Step 2: Create `assets/js/header-tooltip.js`**

Write the file:

```js
/* ============================================================
   Header tooltip + mobile overflow + active-page detection
   Vanilla JS, no dependencies. Idempotent.
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var header = document.getElementById('app-header');
    if (!header) return;

    // Active-page detection: mark the icon whose href matches
    // the current page (with or without hash).
    var path = window.location.pathname.replace(/\/$/, '');
    var hash = window.location.hash;
    header.querySelectorAll('.ah-icon').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (!href) return;
      var target = href.split('#')[0].replace(/\/$/, '');
      if (target && target === path) {
        a.setAttribute('aria-current', 'page');
      }
      // Also handle in-page anchors for the home page
      if (path.endsWith('index.html') || path === '') {
        if (hash && href.endsWith(hash)) {
          a.setAttribute('aria-current', 'page');
        }
      }
    });

    // Avatar click → scroll to top
    var avatar = header.querySelector('.ah-avatar');
    if (avatar) {
      avatar.addEventListener('click', function (e) {
        if (path === '' || path.endsWith('index.html')) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // otherwise let the link to index.html proceed
      });
    }

    // Mobile overflow popover
    var more = header.querySelector('.ah-more');
    var popover = header.querySelector('.ah-popover');
    if (more && popover) {
      more.addEventListener('click', function (e) {
        e.stopPropagation();
        popover.classList.toggle('open');
      });
      document.addEventListener('click', function (e) {
        if (!popover.contains(e.target) && e.target !== more) {
          popover.classList.remove('open');
        }
      });
      // Close on Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') popover.classList.remove('open');
      });
    }

    // Touch: tap an icon to show its tooltip for 2s
    if ('ontouchstart' in window) {
      header.querySelectorAll('.ah-icon').forEach(function (a) {
        var timer = null;
        a.addEventListener('touchstart', function () {
          header.querySelectorAll('.ah-tooltip').forEach(function (t) { t.style.opacity = ''; });
          var tip = a.querySelector('.ah-tooltip');
          if (!tip) return;
          tip.style.opacity = '1';
          tip.style.transform = 'translateX(-50%) translateY(0)';
          clearTimeout(timer);
          timer = setTimeout(function () {
            tip.style.opacity = '';
            tip.style.transform = '';
          }, 2000);
        }, { passive: true });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 3: Update `assets/css/main-override.css` to push body down 88px**

In `main-override.css`, change the existing `body { padding-top: 60px }` rule (or add it if it's only in `main.css`).

Look at the current file. If there is a `body` rule overriding padding-top, modify it. If not, add this block at the top (after the comment header, after the token block when Task 1's refactor lands):

```css
body {
  padding-top: 88px;                /* was 60px — clears the new 60px header pill + 16px top offset + air */
}
```

Note: the `main.css` rule for `body { padding-top: 60px; }` still exists. Since `main-override.css` loads **after** `main.css`, our override wins. If a future task removes the `main.css` rule, the override still works standalone.

- [ ] **Step 4: Add the shared header partial to `index.html`**

In `index.html`:
1. Delete the entire `<nav id="nav">…</nav>` block (lines 276-297 in the current file).
2. Immediately after `<body class="is-preload">`, before the hero `<section id="hero">`, insert the header partial:

```html
<!-- Floating glass icon-pill header (shared partial; same in all pages) -->
<header id="app-header" class="app-header" aria-label="Site navigation">
  <a class="ah-avatar" href="index.html" aria-label="Yi Cao — go to top">
    <img src="images/avatar.jpeg" alt="Yi Cao" />
  </a>
  <a class="ah-icon" href="news.html" data-tooltip="News"><i class="far fa-newspaper"></i><span class="ah-tooltip">News</span></a>
  <a class="ah-icon" href="index.html#two" data-tooltip="Research"><i class="fas fa-flask"></i><span class="ah-tooltip">Research</span></a>
  <a class="ah-icon" href="index.html#experience" data-tooltip="Experience"><i class="fas fa-graduation-cap"></i><span class="ah-tooltip">Experience</span></a>
  <a class="ah-icon" href="index.html#awards" data-tooltip="Awards"><i class="fas fa-trophy"></i><span class="ah-tooltip">Awards</span></a>
  <a class="ah-icon" href="index.html#vision" data-tooltip="Vision"><i class="far fa-eye"></i><span class="ah-tooltip">Vision</span></a>
  <a class="ah-icon" href="index.html#four" data-tooltip="Contact"><i class="far fa-envelope"></i><span class="ah-tooltip">Contact</span></a>
  <a class="ah-icon" href="blog.html" data-tooltip="Blog"><i class="fas fa-pen-to-square"></i><span class="ah-tooltip">Blog</span></a>
  <a class="ah-icon" href="CAO_Yi_CV.pdf" target="_blank" rel="noopener" data-tooltip="CV"><i class="far fa-file-pdf"></i><span class="ah-tooltip">CV</span></a>
  <a class="ah-icon" href="https://github.com/yicao-elina" target="_blank" rel="noopener" data-tooltip="GitHub"><i class="fab fa-github"></i><span class="ah-tooltip">GitHub</span></a>
  <a class="ah-icon" href="presentations.html" data-tooltip="Talks"><i class="fas fa-presentation-screen"></i><span class="ah-tooltip">Talks</span></a>
  <button class="ah-more" type="button" aria-label="More navigation"><i class="fas fa-ellipsis"></i></button>
  <div class="ah-popover" role="menu" aria-label="More links">
    <a class="ah-icon" href="index.html#two" role="menuitem"><i class="fas fa-flask"></i>&nbsp;Research</a>
    <a class="ah-icon" href="index.html#experience" role="menuitem"><i class="fas fa-graduation-cap"></i>&nbsp;Experience</a>
    <a class="ah-icon" href="index.html#awards" role="menuitem"><i class="fas fa-trophy"></i>&nbsp;Awards</a>
    <a class="ah-icon" href="index.html#vision" role="menuitem"><i class="far fa-eye"></i>&nbsp;Vision</a>
    <a class="ah-icon" href="index.html#four" role="menuitem"><i class="far fa-envelope"></i>&nbsp;Contact</a>
  </div>
</header>
```

3. Add the new stylesheet and script references in `<head>` (after the existing `main-override.css` link):

```html
<link rel="stylesheet" href="assets/css/header.css" />
```

And in the body's script section (after the existing `<script src="assets/js/hero-mesh.js" defer></script>` or at the end of the page):

```html
<script src="assets/js/header-tooltip.js" defer></script>
```

- [ ] **Step 5: Add the same header partial to `blog.html` and `presentations.html`**

In `blog.html` and `presentations.html`:
1. Add the same `<link rel="stylesheet" href="assets/css/header.css" />` in `<head>`.
2. Add the same `<script src="assets/js/header-tooltip.js" defer></script>` at the end of `<body>`.
3. Add the same `<header id="app-header">` block as the first child of `<body>` (before any existing header/banner content).

For `blog.html`, the existing top banner/header from the blog spec is **kept** below the new floating app-header.

- [ ] **Step 6: Visually verify**

Start a local server and screenshot the index, blog, and presentations pages at 1440×900 and 375×812 (phone width):

```bash
pkill -f "http.server 8123" 2>/dev/null; ( python3 -m http.server 8123 --directory /Users/alina/Documents/yicao-elina >/dev/null 2>&1 & ); sleep 1
for path in "" "blog.html" "presentations.html"; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --no-sandbox --window-size=1440,900 --screenshot=/tmp/header-desktop-$path.png "http://localhost:8123/$path"
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --no-sandbox --window-size=375,812 --screenshot=/tmp/header-mobile-$path.png "http://localhost:8123/$path"
done
pkill -f "http.server 8123"
```

Expected: a centered glass pill at the top of each page, 10 icons + avatar (desktop), 5 icons + avatar + "⋯" overflow (mobile). Tooltips are CSS-only and don't appear in headless screenshots — verify visually in a real browser after committing.

- [ ] **Step 7: Commit**

```bash
git add assets/css/header.css assets/js/header-tooltip.js assets/css/main-override.css index.html blog.html presentations.html
git commit -m "feat(header): replace text nav with floating glass icon pill"
```

---

## Task 3: Add the springy inline card-open primitive (`data-spring`)

**Files:**
- Create: `assets/js/spring-card.js`
- Modify: `index.html` (add `<script src="assets/js/spring-card.js" defer></script>`)
- Modify: `assets/css/main-override.css` (add `.spring-panel` rules + no-JS fallback)

**Interfaces:**
- Consumes: nothing (depends only on Task 1 tokens if referenced)
- Produces: a `[data-spring]` element with a child `.spring-panel` that expands/collapses with a spring animation. Multiple panels can be open simultaneously within the same parent. Keyboard: Enter/Space toggles, Escape collapses the focused card. The `data-spring-default-open="true"` attribute opens the panel on initial load.

The script is invoked on every page that has `[data-spring]` elements. It's a no-op on pages without them.

- [ ] **Step 1: Create `assets/js/spring-card.js`**

Write the file:

```js
/* ============================================================
   Springy inline card-open primitive
   Toggles .spring-panel inside any [data-spring] card with a
   spring bezier. Multiple panels may be open at once. Honors
   prefers-reduced-motion. Idempotent.
   ============================================================ */
(function () {
  'use strict';

  var SPRING_MS = 380;
  var FADE_MS = 280;
  var REDUCED_MS = 200;

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function init() {
    var cards = document.querySelectorAll('[data-spring]');
    if (!cards.length) return;

    var dur = reducedMotion() ? REDUCED_MS : SPRING_MS;
    var fade = reducedMotion() ? 150 : FADE_MS;

    cards.forEach(function (card) {
      var header = card.querySelector(':scope > .spring-header, :scope > header.spring-header');
      if (!header) {
        // Fall back to the first non-panel child as the click target
        var first = card.firstElementChild;
        if (first && !first.classList.contains('spring-panel')) header = first;
      }
      var panel = card.querySelector(':scope > .spring-panel');
      if (!header || !panel) return;

      // Initial state
      panel.style.overflow = 'hidden';
      panel.style.maxHeight = '0px';
      panel.style.opacity = '0';
      panel.style.transition = 'max-height ' + dur + 'ms cubic-bezier(.34,1.56,.64,1), opacity ' + fade + 'ms ease';

      // Aria setup
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      card.setAttribute('aria-expanded', 'false');

      var isOpen = function () { return card.getAttribute('aria-expanded') === 'true'; };
      var open = function () {
        card.setAttribute('aria-expanded', 'true');
        header.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.style.opacity = '1';
      };
      var close = function () {
        card.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        // Recalculate in case content size changed
        panel.style.maxHeight = '0px';
        panel.style.opacity = '0';
      };
      var toggle = function () { isOpen() ? close() : open(); };

      header.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;       // allow real links to navigate
        toggle();
      });
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        if (e.key === 'Escape' && isOpen()) { e.preventDefault(); close(); }
      });

      // Default open
      if (card.hasAttribute('data-spring-default-open')) {
        // Wait a frame so layout settles
        requestAnimationFrame(function () { open(); });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 2: Add `.spring-panel` rules to `assets/css/main-override.css`**

Append to the bottom of `main-override.css`:

```css
/* ---------- Springy inline card-open primitive ---------- */

.spring-header {
  cursor: pointer;
  user-select: none;
}
.spring-header:focus-visible {
  outline: 2px solid var(--mint);
  outline-offset: 2px;
  border-radius: 8px;
}
.spring-panel {
  /* All animation is driven by inline styles set in spring-card.js.
     These CSS rules are fallbacks for no-JS and reduced-motion. */
}
.spring-panel a { color: var(--mint); }
.spring-panel a:hover { color: var(--mint-bright); }

/* No-JS fallback: panels are always open */
html.no-js .spring-panel {
  max-height: none !important;
  opacity: 1 !important;
  overflow: visible !important;
}
```

- [ ] **Step 3: Wire the script into `index.html`**

Add at the end of `<body>` (after the existing `<script src="assets/js/header-tooltip.js" defer></script>` from Task 2):

```html
<script src="assets/js/spring-card.js" defer></script>
```

- [ ] **Step 4: Add a tiny smoke test target**

Since the spring primitive is purely behavioral and there's no markup on the page yet that uses it, add a sentinel `<article data-spring hidden style="display:none">` to the end of `index.html` (just before `</body>`) so the test in Task 8 can assert the script is present and doesn't throw. The hidden attribute and `display:none` mean the test sentinel has no visual effect.

```html
<!-- Spring primitive sentinel for smoke test (Task 8) -->
<article data-spring hidden style="display:none" aria-hidden="true">
  <header class="spring-header">sentinel</header>
  <div class="spring-panel">sentinel body</div>
</article>
```

- [ ] **Step 5: Verify the script parses**

```bash
node --check /Users/alina/Documents/yicao-elina/assets/js/spring-card.js
node --check /Users/alina/Documents/yicao-elina/assets/js/header-tooltip.js
```

Expected: both commands exit 0 with no output. If either errors, fix the syntax before committing.

- [ ] **Step 6: Commit**

```bash
git add assets/js/spring-card.js assets/js/header-tooltip.js assets/css/main-override.css index.html
git commit -m "feat(card): add springy inline expand primitive (data-spring)"
```

---

## Task 4: Bump research thumbs to 220×160 and add springy paper detail panels

**Files:**
- Modify: `index.html` (5 paper rows in `#two` section: bump thumb dimensions, add `data-spring` + `<div class="spring-panel">` content, add `data-spring-default-open="true"` to the DUAL-X row)
- Modify: `assets/css/main-override.css` (add rules for the bumped thumb + spring panel inside `.recent-work-list .row`)

**Interfaces:**
- Consumes: the `data-spring` primitive from Task 3
- Produces: 5 clickable paper rows. Clicking a row toggles its detail panel with a spring animation. DUAL-X is pre-expanded on first load.

- [ ] **Step 1: Locate the `#two` section in `index.html`**

The `#two` section is the "Recent Work" section. It currently has 5 paper rows (DUAL-X, RepliCan, ARIA, Qualcomm GPU, Viva Biotech), each in a `<div class="row" style="margin-bottom: 2em; align-items: flex-start;">`. The first child of each row is a thumbnail `<a><img></a>`. The thumb's `<img>` currently uses its native size (varies, typically ~300-500px wide). Find each of the 5 thumb `<img>` tags.

- [ ] **Step 2: Add the thumb-size rules to `main-override.css`**

Append to the bottom of `main-override.css`:

```css
/* ---------- Recent Work (#two): bumped thumbs + spring header ---------- */

.recent-work-list .row {
  cursor: pointer;
}
.recent-work-list .row.spring-open {
  background: rgba(255, 255, 255, 0.82);   /* slightly stronger glass when open */
}
.recent-work-list .row > a:first-child img {
  width: 220px;
  height: 160px;
  object-fit: cover;
  display: block;
  border-radius: 12px;
}
.recent-work-list .row > .row-body {
  min-width: 0;       /* allow flex/grid child to shrink */
}
.recent-work-list .row .row-header-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-text);
  font-size: 13px;
  color: var(--mint);
  margin-top: 12px;
  text-decoration: none;
  border: 0;
  background: none;
  cursor: pointer;
  padding: 0;
}
.recent-work-list .row .row-header-toggle:hover { color: var(--mint-bright); }
.recent-work-list .row .row-header-toggle .chev {
  display: inline-block;
  transition: transform 200ms var(--ease-spring);
}
.recent-work-list .row[aria-expanded="true"] .row-header-toggle .chev { transform: rotate(90deg); }
.recent-work-list .row .spring-panel {
  grid-column: 1 / -1;        /* span the full grid width inside the row */
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border-strong);
  color: var(--graphite);
  font-size: 16px;
  line-height: 1.6;
}
.recent-work-list .row .spring-panel p { margin: 0 0 12px; }
.recent-work-list .row .spring-panel .panel-links {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 8px;
}
```

- [ ] **Step 3: Restructure each of the 5 paper rows in `index.html`**

For each of the 5 paper rows, do the following:
1. Change the opening tag from `<div class="row" style="margin-bottom: 2em; align-items: flex-start;">` to `<div class="row" data-spring style="margin-bottom: 2em; align-items: flex-start;">`.
2. Wrap the existing inner content (everything after the thumb `<a>`) in a new `<div class="row-body">…</div>` block. The existing title `<h3>`, authors `<h4>`, paragraph, links stay where they are inside this wrapper.
3. Inside `.row-body`, after the existing links row, add a `<button class="row-header-toggle" type="button" aria-label="Toggle paper details"><span class="chev">▸</span> Details</button>`.
4. After the `.row-body` div (still inside the row), add a `<div class="spring-panel">…</div>` containing the paper's full abstract, problem/method/results, and any extra links.

The exact `.spring-panel` content for each of the 5 papers:

**DUAL-X** (first row, AAAI 2026 XAI4Science spotlight, gets `data-spring-default-open="true"`):
```html
<div class="spring-panel">
  <p><strong>Abstract.</strong> We present DUAL-X, a closed-loop optimization framework that integrates interpretable, human-centric rationale extraction with gradient-based attribution to give MLFF (machine-learned force field) predictions a SHAP-like audit trail — connecting atomic-position contribution scores back to chemically meaningful descriptors (SOAP, SNAP, environment descriptors).</p>
  <p><strong>Why it matters.</strong> The AAAI 2026 XAI4Science track spotlights methods that open the "black box" for scientific ML; DUAL-X is the first framework to ship a practical, end-to-end XAI recipe for materials MD models.</p>
  <div class="panel-links">
    <a href="https://openreview.net/forum?id=K95Tt6fYud&noteId=K95Tt6fYud" target="_blank" rel="noopener">OpenReview →</a>
    <a href="https://xai4science.github.io/" target="_blank" rel="noopener">XAI4Science →</a>
    <a href="images/blog/DUALX-teaser.pdf" target="_blank" rel="noopener">PDF →</a>
  </div>
</div>
```

**RepliCan** (second row, COLM 2026):
```html
<div class="spring-panel">
  <p><strong>Abstract.</strong> RepliCan is a benchmark for evaluating LLM agents on scientific reproducibility in computational materials science. Agents receive the artifacts of a published paper and must reproduce the reported result; we score both fidelity and faithfulness to the original workflow.</p>
  <p><strong>Why it matters.</strong> The first benchmark to put LLM "reproducibility" under the same microscope for materials science that we already use for ML benchmarks.</p>
  <div class="panel-links">
    <a href="https://openreview.net/forum?id=SK5NpcSf9f" target="_blank" rel="noopener">OpenReview →</a>
    <a href="https://colmweb.org/" target="_blank" rel="noopener">COLM 2026 →</a>
  </div>
</div>
```

**ARIA** (third row, KDD 2026 AI4Sciences):
```html
<div class="spring-panel">
  <p><strong>Abstract.</strong> ARIA (Adaptive Reasoning with Interpreted Atoms) is a causal-aware framework for rescuing LLM reasoning in trustworthy materials discovery. It combines rigid knowledge-graph retrieval, a contextual-tower contextualization module, and a tiered fallback hierarchy (Direct Match → Analogical → Fallback) to keep LLM suggestions chemically grounded.</p>
  <p><strong>Why it matters.</strong> Born out of the 2025 LLM Hackathon Visionary Award, ARIA is the first framework to combine KG retrieval with causal-aware hierarchical reasoning for materials science.</p>
  <div class="panel-links">
    <a href="https://kdd2026.kdd.org/" target="_blank" rel="noopener">KDD 2026 →</a>
    <a href="research/kdd26/" data-original-href="research/kdd26/">Project page →</a>
  </div>
</div>
```

**Qualcomm GPU Agentic Workflow** (fourth row):
```html
<div class="spring-panel">
  <p><strong>What I built.</strong> A knowledge-graph-assisted, agentic causal reasoning workflow for the GPU High-Level Modeling team. The workflow ingests heterogeneous sources (papers, design docs, internal wikis), extracts a typed causal graph, and answers engineering questions with explainable evidence paths.</p>
  <p><strong>Stack.</strong> Python, LangGraph, NetworkX, a custom entity-resolution layer over our internal docs index, and a ReAct-style agent that ranks candidate evidence paths by causal distance to the question.</p>
  <div class="panel-links">
    <a href="https://www.linkedin.com/feed/update/urn:li:activity:7437471139364343808/" target="_blank" rel="noopener">LinkedIn post →</a>
  </div>
</div>
```

**Viva Biotech CADD** (fifth row):
```html
<div class="spring-panel">
  <p><strong>What I built.</strong> A co-solvent MD + protein-ligand analysis pipeline for early-stage drug discovery. The pipeline screens co-solvent choices by predicted protein-ligand binding affinity shifts, with a parallel workflow for ADMET-style property checks on the candidate ligands.</p>
  <p><strong>Stack.</strong> GROMACS, MDAnalysis, scikit-learn for the affinity-shift predictor, and an internal dashboard for chemists to inspect MD trajectories and binding-pocket hotspots.</p>
  <div class="panel-links">
    <a href="https://www.vivabiotech.com" target="_blank" rel="noopener">Viva Biotech →</a>
  </div>
</div>
```

For the DUAL-X row specifically, the opening tag is:
```html
<div class="row" data-spring data-spring-default-open="true" style="margin-bottom: 2em; align-items: flex-start;">
```

For the other 4 rows, the opening tag is:
```html
<div class="row" data-spring style="margin-bottom: 2em; align-items: flex-start;">
```

- [ ] **Step 4: Visually verify the spring animation**

Start a server, screenshot the `#two` section (it's around y=2500 on a 1440-wide viewport), and confirm:
- Each paper row's thumb is 220×160
- DUAL-X is pre-expanded
- The other 4 are collapsed
- Clicking a row toggles its panel (manual check in a real browser; headless Chrome can't simulate clicks reliably)

```bash
pkill -f "http.server 8123" 2>/dev/null; ( python3 -m http.server 8123 --directory /Users/alina/Documents/yicao-elina >/dev/null 2>&1 & ); sleep 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --no-sandbox --window-size=1440,5500 --screenshot=/tmp/papers-spring.png "http://localhost:8123/"
pkill -f "http.server 8123"
```

Expected: the screenshot shows the DUAL-X row with its panel expanded (abstract + links), the other 4 rows collapsed to title + authors + venue pill + toggle button.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/main-override.css
git commit -m "feat(research): bigger thumbs + springy paper detail panels"
```

---

## Task 5: Split Experience into Education timeline + 2-col Work cards

**Files:**
- Modify: `index.html` (add new `#experience` section between `#one` and `#news`; restyle `#skills-timeline` glass cards; remove the "Technical Portfolio" 3-column lists from `#skills-timeline` and move them into the new `#experience` section as a single row of 3 glass-pill skill clusters)
- Modify: `assets/css/main-override.css` (add `#experience` grid + glass card rules; restyle `.t-item` cards in `#skills-timeline`)

**Interfaces:**
- Consumes: tokens from Task 1, the glass-card recipe from the spec
- Produces: a new `#experience` section with a 2-column Work grid (Qualcomm, Viva Biotech, plus any prior roles) and a 3-row Technical Skills cluster. The existing `#skills-timeline` retains only the Education & Research Timeline (date rail + cards).

- [ ] **Step 1: Add the `#experience` section to `index.html`**

Insert this section between `#one` (which ends with `</section>` around line 314) and `#news` (line 315). The new section uses 2 cards (Qualcomm, Viva Biotech) plus 3 skill cluster cards. The user can add more cards later.

```html
<!-- Experience: 2-col Work cards + 3-col Skill clusters -->
<section id="experience">
  <h2>Experience & Skills</h2>
  <h3 style="color: var(--mint); font-size: 0.95em; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; margin: 0 0 12px;">Work</h3>
  <div class="experience-grid">
    <article class="glass exp-card" data-spring>
      <header class="spring-header exp-header">
        <div class="exp-logo" aria-hidden="true">Q</div>
        <div class="exp-meta">
          <h3 class="exp-role">GPU Agentic Workflow</h3>
          <p class="exp-org">Qualcomm · High-Level Modeling</p>
          <p class="exp-when">May – Aug 2026 · San Diego</p>
        </div>
      </header>
      <div class="spring-panel">
        <p>Built a knowledge-graph-assisted, agentic causal reasoning workflow for the GPU High-Level Modeling team. Ingested heterogeneous sources (papers, design docs, internal wikis), extracted a typed causal graph, and answered engineering questions with explainable evidence paths.</p>
        <p><strong>Stack.</strong> Python, LangGraph, NetworkX, a custom entity-resolution layer over our internal docs index, and a ReAct-style agent that ranks candidate evidence paths by causal distance to the question.</p>
        <div class="exp-tags">
          <span class="exp-tag">#Agent</span>
          <span class="exp-tag">#CUDA</span>
          <span class="exp-tag">#KG</span>
          <span class="exp-tag">#ReAct</span>
        </div>
      </div>
    </article>
    <article class="glass exp-card" data-spring>
      <header class="spring-header exp-header">
        <div class="exp-logo" aria-hidden="true">V</div>
        <div class="exp-meta">
          <h3 class="exp-role">CADD Researcher</h3>
          <p class="exp-org">Viva Biotech</p>
          <p class="exp-when">Summer 2024 · Shanghai</p>
        </div>
      </header>
      <div class="spring-panel">
        <p>A co-solvent MD + protein-ligand analysis pipeline for early-stage drug discovery. Screened co-solvent choices by predicted binding-affinity shifts, with a parallel workflow for ADMET-style property checks on the candidate ligands.</p>
        <p><strong>Stack.</strong> GROMACS, MDAnalysis, scikit-learn for the affinity-shift predictor, and an internal dashboard for chemists to inspect MD trajectories and binding-pocket hotspots.</p>
        <div class="exp-tags">
          <span class="exp-tag">#MD</span>
          <span class="exp-tag">#Drug</span>
          <span class="exp-tag">#Biology</span>
        </div>
      </div>
    </article>
  </div>

  <h3 style="color: var(--mint); font-size: 0.95em; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; margin: 48px 0 12px;">Technical Skills</h3>
  <div class="experience-grid skills-grid">
    <article class="glass skill-card">
      <h3><i class="icon solid fa-brain" style="color: var(--mint)"></i> Machine Learning & AI</h3>
      <ul>
        <li>Deep Learning (PyTorch, TensorFlow)</li>
        <li>Large Language Models (fine-tuning, prompt engineering)</li>
        <li>Causal Inference, Graph Neural Networks</li>
        <li>Transfer Learning, Explainable AI</li>
      </ul>
    </article>
    <article class="glass skill-card">
      <h3><i class="icon solid fa-atom" style="color: var(--mint)"></i> Scientific Computing</h3>
      <ul>
        <li>Molecular Dynamics (LAMMPS, GROMACS)</li>
        <li>Density Functional Theory (Quantum ESPRESSO)</li>
        <li>High-Performance Computing (MPI, CUDA)</li>
        <li>Materials Informatics, Scientific AI</li>
      </ul>
    </article>
    <article class="glass skill-card">
      <h3><i class="icon solid fa-code" style="color: var(--mint)"></i> Programming & Tools</h3>
      <ul>
        <li>Python, MATLAB, R, Git</li>
        <li>Docker, Linux/Unix</li>
        <li>SQL, Database Management</li>
        <li>Distributed Computing, Large-scale Data Processing</li>
      </ul>
    </article>
  </div>
</section>
```

- [ ] **Step 2: Strip the "Technical Portfolio" 3-column block from `#skills-timeline`**

In `index.html`, find the `#skills-timeline` section. The opening `<section id="skills-timeline">` is around line 498. The "Technical Portfolio" `<div class="row">` block (3 columns) is the first inner block. Delete it, keeping only the `<h2>Background & Expertise</h2>` heading and the Visual Timeline below it (the `<hr />` and `<h3>Education & Research Timeline</h3>` and the `.timeline-container`).

After the deletion, the `#skills-timeline` section reads:
- `<h2>Background & Expertise</h2>` — change this to `<h2>Education & Research Timeline</h2>`
- `<hr />`
- `<h3>Education & Research Timeline</h3>` — **delete** this duplicate h3
- the `.timeline-container` with the date-rail items

- [ ] **Step 3: Add `#experience` + restyle `.t-item` rules to `main-override.css`**

Append to the bottom of `main-override.css`:

```css
/* ---------- Experience (#experience): 2-col Work + 3-col Skills ---------- */

.experience-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 8px;
}
.skills-grid { grid-template-columns: repeat(3, 1fr); margin-top: 8px; }

.exp-card { padding: 24px; }
.exp-header { display: flex; align-items: center; gap: 16px; cursor: pointer; }
.exp-logo {
  width: 48px; height: 48px; border-radius: 12px;
  background: linear-gradient(135deg, var(--mint), var(--mint-bright));
  color: #fff; font: 700 20px/1 var(--font-display);
  display: inline-flex; align-items: center; justify-content: center;
  flex: 0 0 48px;
}
.exp-meta { min-width: 0; }
.exp-role { margin: 0 0 4px; color: var(--ink); font: 600 18px/1.2 var(--font-display); }
.exp-org { margin: 0 0 4px; color: var(--graphite); font: 500 14px/1.3 var(--font-text); }
.exp-when { margin: 0; color: var(--graphite); font: 400 13px/1.3 var(--font-text); }
.exp-card .spring-panel { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--glass-border-strong); color: var(--graphite); font-size: 15px; line-height: 1.6; }
.exp-card .spring-panel p { margin: 0 0 10px; }
.exp-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.exp-tag {
  display: inline-block;
  background: rgba(42, 138, 110, 0.1);
  color: var(--mint);
  font: 600 12px/1 var(--font-text);
  padding: 5px 10px;
  border-radius: 999px;
}

.skill-card { padding: 24px; }
.skill-card h3 { margin: 0 0 12px; color: var(--ink); font: 600 18px/1.2 var(--font-display); }
.skill-card ul { margin: 0; padding: 0 0 0 20px; color: var(--graphite); font-size: 15px; line-height: 1.7; }

@media (max-width: 768px) {
  .experience-grid, .skills-grid { grid-template-columns: 1fr; }
}

/* ---------- Skills-timeline: glass cards on the date rail ---------- */

#skills-timeline .timeline-container::after {
  background: var(--mint) !important;
  opacity: 0.3;
}
#skills-timeline .t-item {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  padding: 16px 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  color: var(--graphite);
  font-family: var(--font-text);
}
#skills-timeline .t-item h3, #skills-timeline .t-item h4 { color: var(--ink); }
#skills-timeline .t-item::before {
  background: var(--mint) !important;
  border-color: #fff !important;
}
```

- [ ] **Step 4: Visually verify**

Start a server and screenshot:

```bash
pkill -f "http.server 8123" 2>/dev/null; ( python3 -m http.server 8123 --directory /Users/alina/Documents/yicao-elina >/dev/null 2>&1 & ); sleep 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --no-sandbox --window-size=1440,6000 --screenshot=/tmp/experience.png "http://localhost:8123/"
pkill -f "http.server 8123"
```

Expected: a new "#experience" section between "#one" and "#news" with 2 work cards (Qualcomm, Viva) and 3 skill cards, all glass. The "#skills-timeline" section that follows shows only the Education & Research Timeline with mint hairline rail and glass item cards.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/main-override.css
git commit -m "feat(experience): split into Education timeline + 2-col Work cards"
```

---

## Task 6: News strip → 3 cards + Read more; new `news.html` timeline page

**Files:**
- Create: `news.html`
- Create: `assets/js/news.js`
- Modify: `index.html` (change `#news` to 3 cards + 1 "Read more" card)
- Modify: `assets/css/main-override.css` (news strip grid + news.html timeline styles)

**Interfaces:**
- Consumes: tokens from Task 1, glass card recipe, `data-spring` from Task 3
- Produces: a 4-column news strip on the index (3 news cards + 1 "Read more" link), a new `news.html` page with year filter pills and a vertical timeline of 6+ entries, and a `news.js` script that handles the year filter.

- [ ] **Step 1: Restructure the `#news` section in `index.html`**

Find the existing `#news` block (around line 315) in `index.html`. The block currently has a `<div class="news-strip">` containing 4 `<div class="news-item">` children. Replace the strip's contents with 3 news items + 1 "Read more" link:

```html
<!-- News -->
<section id="news">
  <h2>Latest News</h2>
  <div class="news-strip">
    <div class="news-item">
      <span class="news-date">May 2026</span>
      <h4>Interning at Qualcomm this summer</h4>
      <p>Joined the GPU High-Level Modeling team on-site in San Diego (May 18 – Aug 23) to build an agentic, knowledge-graph-assisted causal reasoning workflow.</p>
      <a href="https://www.linkedin.com/feed/update/urn:li:activity:7437471139364343808/" target="_blank" rel="noopener">View LinkedIn Post →</a>
    </div>
    <div class="news-item">
      <span class="news-date">Jul 2026</span>
      <h4>RepliCan accepted to COLM 2026</h4>
      <p>Evaluating LLM agents on scientific reproducibility in computational materials science.</p>
      <div class="news-links">
        <a href="https://openreview.net/forum?id=SK5NpcSf9f" target="_blank">OpenReview →</a>
        <a href="https://colmweb.org/" target="_blank" rel="noopener">COLM 2026</a>
      </div>
    </div>
    <div class="news-item">
      <span class="news-date">Jul 2026</span>
      <h4>ARIA accepted to KDD 2026 (AI4Sciences Track)</h4>
      <p>A causal-aware framework for rescuing LLM reasoning, grown out of the 2025 LLM Hackathon Visionary Award project.</p>
      <div class="news-links">
        <a href="index.html#two" class="scrolly">Read more ↓</a>
        <a href="https://kdd2026.kdd.org/" target="_blank" rel="noopener">KDD 2026</a>
      </div>
    </div>
    <a class="news-item news-readmore" href="news.html" aria-label="See all news">
      <span class="readmore-chev" aria-hidden="true">→</span>
      <span class="readmore-label">Read more</span>
      <span class="readmore-sub">See all news</span>
    </a>
  </div>
</section>
```

- [ ] **Step 2: Add the news strip + news.html styles to `main-override.css`**

Append to the bottom of `main-override.css`:

```css
/* ---------- News strip: 3 cards + Read more on the index ---------- */

#news .news-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 1.5em;
}
@media (max-width: 900px) {
  #news .news-strip { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  #news .news-strip { grid-template-columns: 1fr; }
}

#news .news-readmore {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-decoration: none;
  border: 1px dashed var(--glass-border-strong);
  background: rgba(255, 255, 255, 0.4);
  color: var(--ink);
  min-height: 200px;
}
#news .news-readmore:hover {
  border-style: solid;
  border-color: var(--mint);
  background: rgba(42, 138, 110, 0.06);
  color: var(--ink);
  transform: translateY(-3px);
}
#news .readmore-chev {
  font-size: 32px; color: var(--mint); line-height: 1; margin-bottom: 8px;
  transition: transform 200ms var(--ease-spring);
}
#news .news-readmore:hover .readmore-chev { transform: translateX(4px); }
#news .readmore-label { font: 600 18px/1.2 var(--font-display); color: var(--ink); }
#news .readmore-sub { font: 400 13px/1.4 var(--font-text); color: var(--graphite); margin-top: 6px; }

/* ---------- News timeline page (news.html) ---------- */

.news-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 48px 96px;
}
.news-page h1 { color: var(--ink); font: 700 36px/1.1 var(--font-display); margin: 0 0 8px; }
.news-page .lead { color: var(--graphite); font: 400 17px/1.5 var(--font-text); margin: 0 0 32px; }

.news-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}
.news-filter {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--graphite);
  font: 600 13px/1 var(--font-text);
  cursor: pointer;
  transition: color 180ms ease, background 180ms ease, transform 180ms var(--ease-spring);
  text-decoration: none;
}
.news-filter:hover { transform: translateY(-1px); }
.news-filter[aria-pressed="true"] {
  background: var(--mint);
  color: #fff;
  border-color: var(--mint);
}

.news-year {
  margin: 32px 0 12px;
  color: var(--ink);
  font: 700 22px/1.2 var(--font-display);
  display: flex;
  align-items: center;
  gap: 12px;
}
.news-year::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--glass-border-strong);
}
.news-year-count {
  font: 400 13px/1 var(--font-text);
  color: var(--graphite);
  background: rgba(42, 138, 110, 0.1);
  padding: 4px 10px;
  border-radius: 999px;
}

.news-timeline {
  position: relative;
  margin: 8px 0 0;
  padding-left: 32px;
}
.news-timeline::before {
  content: '';
  position: absolute;
  left: 7px; top: 0; bottom: 0;
  width: 2px;
  background: var(--mint);
  opacity: 0.35;
  border-radius: 2px;
}
.news-entry {
  position: relative;
  padding: 14px 0 14px 8px;
  display: grid;
  grid-template-columns: 90px 1fr auto;
  align-items: baseline;
  gap: 18px;
  color: var(--graphite);
  font-family: var(--font-text);
  font-size: 15px;
  border-bottom: 1px solid var(--glass-border-strong);
}
.news-entry::before {
  content: '';
  position: absolute;
  left: -28px; top: 22px;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--mint);
  box-shadow: 0 0 0 4px #fff;
}
.news-entry .date {
  color: var(--graphite);
  font: 500 13px/1.2 var(--font-text);
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}
.news-entry .title { color: var(--ink); font: 600 16px/1.3 var(--font-display); text-decoration: none; }
.news-entry .title:hover { color: var(--mint); }
.news-entry .tag {
  font: 600 11px/1 var(--font-text);
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(42, 138, 110, 0.1);
  color: var(--mint);
  white-space: nowrap;
}
@media (max-width: 640px) {
  .news-entry { grid-template-columns: 80px 1fr; }
  .news-entry .tag { grid-column: 1 / -1; justify-self: start; }
}
```

- [ ] **Step 3: Create `news.html`**

Write the file. The head is the standard minimal set: title, viewport, the 3 stylesheets (tokens, main, main-override, header), and FontAwesome (already loaded by main.css). The body has the new app-header partial, the news page content, and the script tags.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
  <title>News — Yi Cao</title>
  <link rel="stylesheet" href="assets/css/tokens.css" />
  <link rel="stylesheet" href="assets/css/main.css" />
  <link rel="stylesheet" href="assets/css/main-override.css" />
  <link rel="stylesheet" href="assets/css/header.css" />
  <link rel="stylesheet" href="assets/css/fontawesome-all.min.css" />
</head>
<body class="is-preload">

<!-- Floating glass icon-pill header (shared partial; same in all pages) -->
<header id="app-header" class="app-header" aria-label="Site navigation">
  <a class="ah-avatar" href="index.html" aria-label="Yi Cao — go to top">
    <img src="images/avatar.jpeg" alt="Yi Cao" />
  </a>
  <a class="ah-icon" href="news.html" data-tooltip="News"><i class="far fa-newspaper"></i><span class="ah-tooltip">News</span></a>
  <a class="ah-icon" href="index.html#two" data-tooltip="Research"><i class="fas fa-flask"></i><span class="ah-tooltip">Research</span></a>
  <a class="ah-icon" href="index.html#experience" data-tooltip="Experience"><i class="fas fa-graduation-cap"></i><span class="ah-tooltip">Experience</span></a>
  <a class="ah-icon" href="index.html#awards" data-tooltip="Awards"><i class="fas fa-trophy"></i><span class="ah-tooltip">Awards</span></a>
  <a class="ah-icon" href="index.html#vision" data-tooltip="Vision"><i class="far fa-eye"></i><span class="ah-tooltip">Vision</span></a>
  <a class="ah-icon" href="index.html#four" data-tooltip="Contact"><i class="far fa-envelope"></i><span class="ah-tooltip">Contact</span></a>
  <a class="ah-icon" href="blog.html" data-tooltip="Blog"><i class="fas fa-pen-to-square"></i><span class="ah-tooltip">Blog</span></a>
  <a class="ah-icon" href="CAO_Yi_CV.pdf" target="_blank" rel="noopener" data-tooltip="CV"><i class="far fa-file-pdf"></i><span class="ah-tooltip">CV</span></a>
  <a class="ah-icon" href="https://github.com/yicao-elina" target="_blank" rel="noopener" data-tooltip="GitHub"><i class="fab fa-github"></i><span class="ah-tooltip">GitHub</span></a>
  <a class="ah-icon" href="presentations.html" data-tooltip="Talks"><i class="fas fa-presentation-screen"></i><span class="ah-tooltip">Talks</span></a>
  <button class="ah-more" type="button" aria-label="More navigation"><i class="fas fa-ellipsis"></i></button>
  <div class="ah-popover" role="menu" aria-label="More links">
    <a class="ah-icon" href="index.html#two" role="menuitem"><i class="fas fa-flask"></i>&nbsp;Research</a>
    <a class="ah-icon" href="index.html#experience" role="menuitem"><i class="fas fa-graduation-cap"></i>&nbsp;Experience</a>
    <a class="ah-icon" href="index.html#awards" role="menuitem"><i class="fas fa-trophy"></i>&nbsp;Awards</a>
    <a class="ah-icon" href="index.html#vision" role="menuitem"><i class="far fa-eye"></i>&nbsp;Vision</a>
    <a class="ah-icon" href="index.html#four" role="menuitem"><i class="far fa-envelope"></i>&nbsp;Contact</a>
  </div>
</header>

<main class="news-page">
  <h1>News</h1>
  <p class="lead">Talks, papers, milestones, and other updates — grouped by year.</p>

  <div class="news-filters" role="tablist" aria-label="Filter news by year">
    <button class="news-filter" data-year="all" aria-pressed="true" type="button">All</button>
    <button class="news-filter" data-year="2026" aria-pressed="false" type="button">2026</button>
    <button class="news-filter" data-year="2025" aria-pressed="false" type="button">2025</button>
    <button class="news-filter" data-year="2024" aria-pressed="false" type="button">2024</button>
  </div>

  <h2 class="news-year" data-year="2026">2026 <span class="news-year-count">4 entries</span></h2>
  <div class="news-timeline">
    <div class="news-entry" data-year="2026">
      <span class="date">08-12</span>
      <a class="title" href="#kdd-consortium">Invited oral, KDD 2026 PhD Consortium</a>
      <span class="tag">#KDD</span>
    </div>
    <div class="news-entry" data-year="2026">
      <span class="date">07-22</span>
      <a class="title" href="https://kdd2026.kdd.org/" target="_blank" rel="noopener">ARIA accepted to KDD 2026 (AI4Sciences Track)</a>
      <span class="tag">#KDD</span>
    </div>
    <div class="news-entry" data-year="2026">
      <span class="date">07-15</span>
      <a class="title" href="https://openreview.net/forum?id=SK5NpcSf9f" target="_blank" rel="noopener">RepliCan accepted to COLM 2026</a>
      <span class="tag">#COLM</span>
    </div>
    <div class="news-entry" data-year="2026">
      <span class="date">05-18</span>
      <a class="title" href="https://www.linkedin.com/feed/update/urn:li:activity:7437471139364343808/" target="_blank" rel="noopener">Interning at Qualcomm this summer</a>
      <span class="tag">#News</span>
    </div>
  </div>

  <h2 class="news-year" data-year="2025">2025 <span class="news-year-count">2 entries</span></h2>
  <div class="news-timeline">
    <div class="news-entry" data-year="2025">
      <span class="date">12-04</span>
      <a class="title" href="https://neurips.cc/" target="_blank" rel="noopener">NeurIPS 2025 AI4Mat spotlight</a>
      <span class="tag">#NeurIPS</span>
    </div>
    <div class="news-entry" data-year="2025">
      <span class="date">09-21</span>
      <a class="title" href="#">Started PhD at Johns Hopkins</a>
      <span class="tag">#Life</span>
    </div>
  </div>
</main>

<script src="assets/js/header-tooltip.js" defer></script>
<script src="assets/js/news.js" defer></script>
</body>
</html>
```

- [ ] **Step 4: Create `assets/js/news.js`**

Write the file:

```js
/* ============================================================
   News timeline year filter
   Hides year groups + their entries whose data-year doesn't
   match the active filter. Idempotent.
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var page = document.querySelector('.news-page');
    if (!page) return;

    var filters = page.querySelectorAll('.news-filter');
    var years = page.querySelectorAll('.news-year');
    var entries = page.querySelectorAll('.news-entry');

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var year = btn.getAttribute('data-year');
        filters.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');

        entries.forEach(function (e) {
          var matches = (year === 'all') || (e.getAttribute('data-year') === year);
          e.style.display = matches ? '' : 'none';
        });
        years.forEach(function (y) {
          var matches = (year === 'all') || (y.getAttribute('data-year') === year);
          y.style.display = matches ? '' : 'none';
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 5: Verify both pages render correctly**

```bash
pkill -f "http.server 8123" 2>/dev/null; ( python3 -m http.server 8123 --directory /Users/alina/Documents/yicao-elina >/dev/null 2>&1 & ); sleep 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --no-sandbox --window-size=1440,900 --screenshot=/tmp/news-strip.png "http://localhost:8123/#news"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --no-sandbox --window-size=1440,1400 --screenshot=/tmp/news-page.png "http://localhost:8123/news.html"
pkill -f "http.server 8123"
```

Expected:
- `news-strip.png` shows 4 cards in a single row: 3 news + 1 "Read more →" with a dashed border and a large mint chevron.
- `news-page.png` shows the news timeline: "News" h1, lead paragraph, 4 filter pills (All active, mint-filled), then year groups (2026, 2025) with their timeline entries.

- [ ] **Step 6: Commit**

```bash
git add news.html assets/js/news.js index.html assets/css/main-override.css
git commit -m "feat(news): 3 cards + Read more on index; new /news.html timeline page"
```

---

## Task 7: Polish Awards, Vision, Contact with glass wrappers

**Files:**
- Modify: `index.html` (wrap each section's content in `<div class="glass section-card">`)
- Modify: `assets/css/main-override.css` (add `.section-card` rules + the "currently open to" Contact line)
- Remove: the inline `style="padding: 4em 0; background-color: #fcfcfc;"` from `#awards`

**Interfaces:**
- Consumes: tokens from Task 1, glass card recipe
- Produces: each of Awards, Vision, Contact sits inside a single glass wrapper, matching the visual frame of every other section.

- [ ] **Step 1: Wrap `#awards` content in a glass card**

In `index.html`, find the `#awards` section (around line 758). The current opening tag is:

```html
<section id="awards" style="padding: 4em 0; background-color: #fcfcfc;">
```

Change it to:

```html
<section id="awards">
```

Then find the existing `<div class="row">` inside (line 763) and wrap its contents in a new `<div class="glass section-card">…</div>`. Specifically, the structure becomes:

```html
<section id="awards">
  <h2>...</h2>
  <div class="glass section-card">
    <div class="row">
      <!-- existing award rows -->
    </div>
  </div>
</section>
```

(Adjust the wrapping to match the actual content; the goal is one glass card around the whole section's content.)

- [ ] **Step 2: Wrap `#vision` content in a centered glass card**

Find the `#vision` section. Wrap the inner content (the `<p>` paragraph, any existing CTAs) in:

```html
<section id="vision" class="main style1 special">
  <div class="glass section-card" style="max-width: 720px; margin: 0 auto; text-align: center;">
    <h2>...</h2>
    <p>...</p>
  </div>
</section>
```

(Keep the existing `class="main style1 special"` — we don't refactor template classes.)

- [ ] **Step 3: Wrap `#four` (Contact) in a glass card with the "currently open to" line**

Find the `#four` section. Replace its inner content with:

```html
<section id="four">
  <div class="glass section-card" style="max-width: 720px; margin: 0 auto; text-align: center;">
    <h2>Get In Touch</h2>
    <p>PhD internships · research collaborations · speaking</p>
    <div class="row">
      <!-- existing icon list -->
    </div>
  </div>
</section>
```

The line "PhD internships · research collaborations · speaking" is the new "currently open to" line (verbatim from the spec).

- [ ] **Step 4: Add `.section-card` rules to `main-override.css`**

Append to the bottom:

```css
/* ---------- Section card wrapper (Awards/Vision/Contact) ---------- */

.section-card {
  margin-top: 1.5em;
  padding: 32px 36px;
  color: var(--graphite);
}
.section-card h2 { margin-top: 0; }
#awards .section-card { padding: 28px 32px; }
#vision .section-card p { color: var(--graphite); font-size: 18px; line-height: 1.6; }
#four .section-card p { color: var(--graphite); font-size: 16px; line-height: 1.5; margin: 0 0 16px; }
```

- [ ] **Step 5: Verify visual consistency**

Start a server, screenshot the lower half of the index:

```bash
pkill -f "http.server 8123" 2>/dev/null; ( python3 -m http.server 8123 --directory /Users/alina/Documents/yicao-elina >/dev/null 2>&1 & ); sleep 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --no-sandbox --window-size=1440,6500 --screenshot=/tmp/sections-polish.png "http://localhost:8123/"
pkill -f "http.server 8123"
```

Expected: each of Awards, Vision, Contact is now wrapped in a glass card. Awards no longer has the flat off-white background. Contact shows the new "PhD internships · research collaborations · speaking" line above the icon list.

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/main-override.css
git commit -m "feat(sections): polish Awards, Vision, Contact with glass wrappers"
```

---

## Task 8: Extend the smoke test with the new sections and files

**Files:**
- Modify: `tests/hero-smoke.test.js`

**Interfaces:**
- Consumes: the existing test runner (Node `node:test`) and the 11 new assertions in the spec's Section 5.1
- Produces: a test that verifies the redesigned structure is in place. The test is the single quality gate at the end of the rollout.

- [ ] **Step 1: Read the existing test**

Read `/Users/alina/Documents/yicao-elina/tests/hero-smoke.test.js` to understand the current test structure (it uses `node:test`, `fetch`, and runs against `http://127.0.0.1:8123`).

- [ ] **Step 2: Add 11 new assertions**

Edit the test file. At the end of the existing test (after the last `test(...)` block), add new `test(...)` blocks. The exact assertions (from the spec's Section 5.1):

```js
test('index has app-header with 10 icons', async () => {
  const html = await (await fetch(BASE + '/')).text();
  assert.match(html, /<header id="app-header">/);
  const icons = (html.match(/class="ah-icon"/g) || []).length;
  assert.ok(icons >= 10, `expected >=10 ah-icon elements, got ${icons}`);
});

test('index no longer has the old <nav id="nav">', async () => {
  const html = await (await fetch(BASE + '/')).text();
  assert.doesNotMatch(html, /<nav id="nav">/);
});

test('index links header.css and tokens.css', async () => {
  const html = await (await fetch(BASE + '/')).text();
  assert.match(html, /href="assets\/css\/header\.css"/);
  assert.match(html, /href="assets\/css\/tokens\.css"/);
});

test('index has 5 paper rows with data-spring', async () => {
  const html = await (await fetch(BASE + '/')).text();
  const rows = (html.match(/data-spring/g) || []).length;
  assert.ok(rows >= 5, `expected >=5 data-spring occurrences, got ${rows}`);
});

test('index has an #experience section with 2-col grid', async () => {
  const html = await (await fetch(BASE + '/')).text();
  assert.match(html, /id="experience"/);
  assert.match(html, /class="experience-grid"/);
});

test('index news strip has 3 news items + 1 read-more link to news.html', async () => {
  const html = await (await fetch(BASE + '/')).text();
  const items = (html.match(/class="news-item"/g) || []).length;
  assert.ok(items >= 3, `expected >=3 news-item elements, got ${items}`);
  assert.match(html, /href="news\.html"/);
});

test('news.html returns 200 and has a year filter', async () => {
  const res = await fetch(BASE + '/news.html');
  assert.equal(res.status, 200);
  const html = await res.text();
  const filters = (html.match(/class="news-filter"/g) || []).length;
  assert.ok(filters >= 3, `expected >=3 news-filter pills, got ${filters}`);
});

test('news.html has 6+ timeline entries', async () => {
  const html = await (await fetch(BASE + '/news.html')).text();
  const entries = (html.match(/class="news-entry"/g) || []).length;
  assert.ok(entries >= 6, `expected >=6 news-entry elements, got ${entries}`);
});

test('spring-card.js is served', async () => {
  const res = await fetch(BASE + '/assets/js/spring-card.js');
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /data-spring/);
});

test('header-tooltip.js is served', async () => {
  const res = await fetch(BASE + '/assets/js/header-tooltip.js');
  assert.equal(res.status, 200);
});

test('tokens.css is served', async () => {
  const res = await fetch(BASE + '/assets/css/tokens.css');
  assert.equal(res.status, 200);
});
```

(Adapt the exact `test(...)` syntax to match the existing test file's style — `node:test`'s `test()` is the common form. Use `assert` from `node:assert/strict` if the existing file imports it that way; otherwise use the same assertion module it already uses.)

- [ ] **Step 3: Run the test**

```bash
pkill -f "http.server 8123" 2>/dev/null; ( python3 -m http.server 8123 --directory /Users/alina/Documents/yicao-elina >/dev/null 2>&1 & ); sleep 1
node --test /Users/alina/Documents/yicao-elina/tests/hero-smoke.test.js 2>&1 | tail -20
pkill -f "http.server 8123"
```

Expected: all assertions pass. The output ends with a summary like `# tests 16` (5 original + 11 new), `# pass 16`, `# fail 0`. If any fail, fix the issue (most likely a markup typo) and re-run.

- [ ] **Step 4: Commit**

```bash
git add tests/hero-smoke.test.js
git commit -m "test: extend hero smoke test to assert new sections + new files"
```

---

## Self-Review

**1. Spec coverage:** Skim each section of the spec.

- §2.2 token block → Task 1 (`tokens.css` + 13 properties)
- §2.3 glass card recipe → Tasks 4, 5, 6, 7 (all use the recipe; the recipe itself is in the spec verbatim, repeated in each task's CSS additions)
- §2.4 springy primitive → Task 3 (verbatim JS)
- §2.5 header pattern → Task 2 (CSS + JS)
- §2.6 header icon set → Task 2 (10 icons + avatar, FA5, all hrefs)
- §3.1 header pill → Task 2
- §3.2 spring card-open → Task 3
- §3.3 research card → Task 4 (220×160 thumb, spring panels)
- §3.4 experience cards → Task 5 (2-col + 3-col grids)
- §3.5 news strip → Task 6 (4-col strip with 3 + 1)
- §3.6 news timeline page → Task 6 (`news.html`)
- §3.7 section polish → Task 7
- §4.1 header behavior → Task 2
- §4.2 spring behavior → Task 3
- §4.3 news timeline → Task 6
- §4.4 sections → Task 7
- §4.5 edge cases (no-JS, reduced-motion) → Task 3 (no-JS fallback CSS), Task 2 (reduced-motion CSS)
- §5.1 smoke tests → Task 8 (11 new assertions)
- §5.2 manual visual checks → listed in commit messages; user does the visual check
- §6.1 commit sequence → the 8 tasks ARE the 8 commits, in order

**2. Placeholder scan:** No TBD, TODO, or "implement later" anywhere. All CSS values, JS function signatures, and HTML markup are concrete and verbatim from the spec.

**3. Type/identifier consistency:** The CSS class names match across tasks: `.glass`, `.spring-panel`, `.spring-header`, `.ah-icon`, `.ah-avatar`, `.ah-tooltip`, `.ah-more`, `.ah-popover`, `.app-header`, `.news-filter`, `.news-entry`, `.news-year`, `.news-timeline`, `.exp-card`, `.exp-header`, `.exp-logo`, `.exp-meta`, `.exp-role`, `.exp-org`, `.exp-when`, `.exp-tag`, `.skill-card`, `.section-card`. The JS functions are consistent: `init()` is the entry point in all three scripts (`header-tooltip.js`, `spring-card.js`, `news.js`). The HTML markup uses the same icons (FA5 class names) and the same hrefs in every page that gets the header partial.

**4. Open issues:** The plan's Task 4 step 1 mentions the thumb `<img>` tags vary in native size — this is a finding for the implementer, not a plan gap. The implementer is expected to find the 5 rows and update them; the plan provides the exact `.spring-panel` content for each row.

**Result:** No gaps, no placeholders, no identifier drift. Plan is ready to execute.
