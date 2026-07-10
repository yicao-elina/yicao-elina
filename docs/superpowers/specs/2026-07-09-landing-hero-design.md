# Landing Hero — Design Spec

**Date:** 2026-07-09
**Status:** Design (awaiting user approval before writing the implementation plan)
**Author:** Yi Cao, in collaboration with Claude
**Scope:** Single-section hero at the top of `index.html`. No other pages are touched.

---

## 1. Positioning & slogans

### The four ideas in the brief
The brief is a positioning statement with four tangled ideas. The slogan must lead with one and let the others echo underneath.

| # | Anchor | What it claims |
|---|---|---|
| 1 | **Domain** | Atoms, materials, the physical world |
| 2 | **Process** | Understanding → 0-to-1 building |
| 3 | **Epistemic** | Code as a way to *truly* understand the world |
| 4 | **Identity** | Dreamer *and* engineer of the physical world |

### Decision: lead with **Identity**
The "dreamer + engineer" pairing is what makes Yi Cao's brand distinct in a research portfolio landscape that is full of "AI + X" taglines. The domain (materials) and process (understand → build) become supporting copy rather than the headline.

### Lead slogan
> **An engineer of atoms. A dreamer in code.**

Two lines, deliberate line break between "atoms." and "A dreamer." The first line is in ink (#1d1d1f); the second line is in the existing accent green (#49bf9d). The green is the visual hook that ties the slogan to the rest of the site.

### Sub-slogan
> **Coding for materials, from understanding to 0-to-1.**

Sits 12px below the lead. 18px / 400 / SF Pro Text, ink-muted-48 (#7a7a7a). Max 32ch wide so it wraps to 2 lines on narrower viewports.

### Brand voice notes
- Direct, technical, warm. No exclamation points. No emojis.
- The voice of the existing "Vision" cards ("ML is not a black box — it's a transparent, evolving partner in science") is the calibrating reference.
- Avoid: "passionate," "driven," "revolutionary," "unlock," "transform."
- Prefer: "build," "engineer," "code," "matter," "atoms," "discover," "0-to-1."

---

## 2. High-level hero architecture

### What the hero is
- A single `<section id="hero">` at the top of `index.html`, above the existing `<nav>`.
- Occupies one full viewport on desktop (`min-height: 100vh; padding-top: 88px;` to clear the nav), and stacks vertically on mobile.
- The existing `<header id="header">` block is **removed** in favor of the new hero.

### What the hero is not
- Not a separate page. No "Enter" button, no `/hero` route.
- Not a scroll-jacking experience. Once you scroll past, the rest of the page behaves exactly as it does today.

### Layout on desktop (≥ 1024px)
Two columns inside a `max-width: 1280px` container.

- **Left column (≈ 42% width, min 420px)** — the personal card.
- **Right column (≈ 58% width)** — the 3×2 portfolio grid.
- 64px gap between columns.
- Container has 48px horizontal padding on desktop, 24px on mobile.

### Layout on mobile (< 1024px)
- Personal card on top, full width.
- 48px vertical gap.
- Portfolio grid below, full width, single column (the 3-cols × 2-rows desktop grid collapses to 2-cols × 3-rows on tablet, 1-col on phone).

### Z-index stack
| z | Element |
|---|---|
| 0  | `.hero-mesh` (the gradient backdrop) |
| 1  | `.hero-content` (the personal card and the portfolio grid) |
| 100 | The existing `#nav` (unchanged) |

### Background mesh (the lvyovo atmosphere, quieted)
- A fixed full-bleed `<div class="hero-mesh">` anchored to the top of the page.
- Two soft radial gradients, stacked on a base of `#fafafc`:
  - Top-left: teal `#49bf9d` at 14% opacity, ~60vw radius, blurred 80px.
  - Bottom-right: warm amber `#f5b942` at 12% opacity, ~70vw radius, blurred 100px.
- `mesh-drift` keyframe animates each gradient by ±40–50px over 32–40s, ease-in-out, alternate, infinite. The drift is *very* slow — most visitors won't consciously see it.
- `prefers-reduced-motion: reduce` → mesh drift is disabled via a `.no-motion` class set by JS.

### The motion budget
The entire hero uses exactly three effects:
1. **Mesh drift** — see above.
2. **Mouse-reactive tilt on portfolio tiles** — see §4.
3. **Hover transitions** — 200ms ease on background, border, shadow, and the → arrow.

No scroll-triggered animations, no parallax, no scroll-jacking, no auto-marquee.

---

## 3. Personal card (left column)

### DOM structure
```html
<aside class="personal-card" aria-label="About Yi Cao">
  <img class="pc-avatar" src="images/avatar.jpeg" alt="" />
  <h1 class="pc-name">Yi Cao</h1>
  <p class="pc-slogan">
    <span class="pc-slogan-line1">An engineer of atoms.</span>
    <span class="pc-slogan-line2">A dreamer in code.</span>
  </p>
  <p class="pc-sub">Coding for materials, from understanding to 0-to-1.</p>
  <p class="pc-byline">PhD researcher, ChemBE · Johns Hopkins</p>
  <ul class="pc-social" aria-label="Social links">
    <li><a href="https://github.com/yicao-elina" aria-label="GitHub">…</a></li>
    <li><a href="https://www.linkedin.com/in/yi-cao-1368ab292/" aria-label="LinkedIn">…</a></li>
    <li><a href="mailto:ycao73@jh.edu" aria-label="Email">…</a></li>
  </ul>
  <div class="pc-ctas">
    <a class="pc-cta pc-cta-primary" href="#two">Read research</a>
    <a class="pc-cta pc-cta-ghost" href="CAO_Yi_CV.pdf" target="_blank" rel="noopener">View CV</a>
  </div>
</aside>
```

### Tokens
| Token | Value |
|---|---|
| Background | `rgba(255, 255, 255, 0.55)` |
| Backdrop | `blur(24px) saturate(180%)` |
| Border | `1px solid rgba(255, 255, 255, 0.6)` |
| Border radius | `24px` |
| Shadow | `0 12px 40px rgba(0, 0, 0, 0.10)` |
| Padding (desktop) | `40px` |
| Padding (mobile) | `28px` |
| Internal vertical rhythm | `12px` between adjacent elements; `20px` between major groups |

### Type sizes
| Element | Size | Weight | Color | Tracking | Line height |
|---|---|---|---|---|---|
| `.pc-name` | 32px | 600 (SF Pro Display) | `#1d1d1f` | `-0.28px` | 1.15 |
| `.pc-slogan-line1` | 44px | 600 (SF Pro Display) | `#1d1d1f` | `-0.28px` | 1.05 |
| `.pc-slogan-line2` | 44px | 600 (SF Pro Display) | `#49bf9d` | `-0.28px` | 1.05 |
| `.pc-sub` | 18px | 400 (SF Pro Text) | `#7a7a7a` | 0 | 1.47 |
| `.pc-byline` | 14px | 400 (SF Pro Text) | `#333333` | 0 | 1.43 |
| `.pc-cta` | 16px | 500 (SF Pro Text) | varies | 0 | 1.0 |

On screens < 640px: `.pc-slogan-line1` and `.pc-slogan-line2` drop to 32px.

### Avatar
- Round, 112px.
- 2px solid `rgba(73, 191, 157, 0.6)` ring.
- Sits at the top of the card, horizontally centered within its own block (the card is otherwise left-aligned text).

### Social icons
- Three circular icon buttons in a row, 36px × 36px.
- Background: `rgba(0, 0, 0, 0.04)`. Color: `#1d1d1f`.
- 8px gap.
- Hover: background shifts to `rgba(73, 191, 157, 0.10)`, color stays `#1d1d1f`, 200ms ease.
- Focus: 2px solid `#49bf9d` outline.
- Icons are inline SVGs (no icon font dependency). Three icons, ~600 bytes each.

### CTAs
- Two pill buttons, side by side, equal width.
- **Primary (`#49bf9d` filled, white text)**: "Read research" → `#two`.
- **Ghost (transparent, `#49bf9d` border + text)**: "View CV" → `CAO_Yi_CV.pdf`, target=`_blank`.
- Padding: `11px 22px`, `border-radius: 9999px`.
- Hover: `transform: scale(0.95)` on active, shadow softens to `0 4px 16px rgba(73, 191, 157, 0.20)`.
- Focus: 2px solid `#0071e3` outline.
- On mobile: full width each, stacked vertically with `12px` gap (vs. the `12px` horizontal gap on desktop).

### Card behavior
- The personal card does **not** tilt. It is a stable identity anchor; only the right-side portfolio tiles tilt.
- No entrance animation. The card is rendered immediately on page load.

### Fallback for browsers without `backdrop-filter`
- `@supports not (backdrop-filter: blur(1px))` → background becomes `rgba(255, 255, 255, 0.92)` (opaque enough to read).
- Same fallback applies to the portfolio tiles.

---

## 4. Portfolio strip (right column)

### DOM structure
```html
<section class="portfolio" aria-label="Selected work">
  <div class="portfolio-grid" data-tilt-container>
    <a class="tile" href="…" data-tilt>
      <img class="tile-img" src="images/thumbs/replican-paper.png" alt="" />
      <div class="tile-body">
        <h3 class="tile-title">RepliCan</h3>
        <p class="tile-sub">COLM 2026 · Evaluating LLM agents on scientific reproducibility.</p>
        <span class="tile-arrow" aria-hidden="true">→</span>
      </div>
    </a>
    <a class="tile" …>ARIA</a>
    <a class="tile" …>GPU Agentic Workflow</a>
    <a class="tile" …>ML Force Fields (tutorial)</a>
    <a class="tile" …>DFT Convergence Tips (tutorial)</a>
    <!-- bottom-right cell intentionally empty; the mesh shows through -->
  </div>
</section>
```

### Grid (desktop ≥ 1024px)
- 3 columns × 2 rows.
- Gap: `20px`.
- Bottom-right cell (row 2, column 3) is intentionally empty — the mesh shows through. This is a deliberate negative-space beat, not a bug.

### Grid (tablet 640–1023px)
- 2 columns × 3 rows.
- The bottom-right cell (row 3, column 2) is intentionally empty — same as desktop.

### Grid (mobile < 640px)
- 1 column.
- 5 tiles stacked.

### Per-tile tokens
| Token | Value |
|---|---|
| Background | `rgba(255, 255, 255, 0.55)` |
| Backdrop | `blur(24px) saturate(180%)` |
| Border | `1px solid rgba(255, 255, 255, 0.6)` |
| Border radius | `16px` |
| Default shadow | `0 4px 16px rgba(0, 0, 0, 0.06)` |
| Hover shadow | `0 12px 32px rgba(0, 0, 0, 0.12)` |
| Thumbnail aspect | 4:3, full tile width |
| Thumbnail radius | `16px 16px 0 0` (top corners only) |
| Body padding | `20px` |

### Per-tile type
| Element | Size | Weight | Color | Tracking | Line height |
|---|---|---|---|---|---|
| `.tile-title` | 18px | 600 (SF Pro Text) | `#1d1d1f` | `-0.224px` | 1.24 |
| `.tile-sub` | 13px | 400 (SF Pro Text) | `#7a7a7a` | 0 | 1.43 |
| `.tile-arrow` | 18px | 400 | `#49bf9d` | 0 | 1.0 |

### Tilt interaction (the lvyovo-style effect)
- On `mousemove` over a `.tile`, JS sets two CSS custom properties `--tilt-x` and `--tilt-y` based on cursor position relative to the tile center.
- Range: -6° to +6° on each axis.
- `transform: perspective(800px) rotateX(var(--tilt-y)) rotateY(var(--tilt-x)) translateY(-4px);` on hover.
- `transition: transform 200ms ease-out;` — smooth follow, no jitter.
- The shadow softens and grows in sync with the lift.
- `requestAnimationFrame` batches the property writes; the JS never touches layout directly.
- The card lifts on hover even when the mouse is stationary (e.g. on touch) — fallback `transform: translateY(-4px)` with the same 200ms ease.
- `prefers-reduced-motion: reduce` → tilt is disabled; only the static lift remains.

### Tile arrow
- Hidden by default (`opacity: 0`).
- Revealed on hover: `opacity: 1`, 200ms ease.
- Sits in the bottom-right of `.tile-body`, absolute-positioned.
- Decorative; the whole `.tile` is the click target.

### The five curated tiles
| # | Title | Subtitle | Href | Thumbnail |
|---|---|---|---|---|
| 1 | RepliCan | COLM 2026 · Evaluating LLM agents on scientific reproducibility. | `https://openreview.net/forum?id=SK5NpcSf9f` (target=_blank) | `images/thumbs/replican-paper.png` |
| 2 | ARIA | KDD 2026 · Causal-aware framework for trustworthy materials discovery. | `#two` (the existing Research section) | `images/thumbs/aria-paper.png` |
| 3 | GPU Agentic Workflow | Qualcomm · Summer 2026 · Agentic, KG-assisted debugging on GPU stack. | `https://www.linkedin.com/feed/update/urn:li:activity:7437471139364343808/` (target=_blank) | `images/qualcomm-intern.jpeg` |
| 4 | ML Force Fields (tutorial) | Blog · Hands-on with MACE and ASE — from DFT to production MD. | `blog/mlff-tutorial.html` | (use a generic 2D-material thumb — `images/thumbs/03-2D-material.jpg`) |
| 5 | DFT Convergence Tips | Blog · Quantum ESPRESSO SCF-convergence strategies that actually work. | `blog/dft-convergence.html` | (use `images/thumbs/02-Thermoelctric-thumb.png` or similar existing thumb) |

If a thumbnail is missing, the tile falls back to a tinted gradient block (teal-to-amber, low opacity) with the title in the center. No broken-image icons.

### Why this mix
Two papers, two blog posts, one industry build. The papers are the *understanding*, the blog posts are the *teaching*, the Qualcomm build is the *0-to-1*. This mirrors the sub-slogan ("from understanding to 0-to-1") in the tile selection itself.

### Accessibility for the tilt
- The tile is an `<a>` with a real `href`. Keyboard focus shows a 2px solid `#49bf9d` outline and applies the same `translateY(-4px)` lift.
- `prefers-reduced-motion: reduce` removes the tilt entirely; the lift and the arrow still work.
- Screen readers read the `<h3 class="tile-title">` and the `<p class="tile-sub">`; the tilt is invisible to them.

---

## 5. Integration into `index.html`

### What changes in `index.html`
1. **Add** `<section id="hero">…</section>` immediately after `<body class="is-preload">`, before the existing `<nav id="nav">`.
2. **Add** `<link rel="stylesheet" href="assets/css/hero.css">` to the `<head>`, after the existing `assets/css/main.css` link.
3. **Add** `<script src="assets/js/hero-tilt.js" defer></script>` and `<script src="assets/js/hero-mesh.js" defer></script>` to the existing scripts block at the bottom of the file.
4. **Remove** the existing `<header id="header">…</header>` block entirely (lines 202–210 of the current file). Its content (avatar, name, JHU one-liner) is now expressed by the new personal card.

### What does NOT change in `index.html`
- The existing nav bar.
- The existing `#news` strip (the "second act" right after the hero).
- Any other section.
- Any of the existing inline `<style>` blocks (dropdown menu, news strip, vision expand-cards).
- The existing jQuery stack.

### What changes in the file system
| File | Action | Approx size |
|---|---|---|
| `index.html` | Edit (add hero, remove old header, add 2 scripts, 1 stylesheet) | +90 / -10 lines |
| `assets/css/hero.css` | New | ~6 KB |
| `assets/js/hero-tilt.js` | New | ~1.5 KB |
| `assets/js/hero-mesh.js` | New | ~0.5 KB |

No new images, no new fonts, no new dependencies. Total new code: ~8 KB.

---

## 6. YAGNI — what this design explicitly does NOT do

These are deliberate exclusions. Each is here to prevent scope creep during implementation.

- **No dark mode.** The hero is light-on-light. The existing site doesn't ship dark mode; adding it for the hero only would be inconsistent.
- **No new fonts.** SF Pro Display + SF Pro Text only, with `system-ui, -apple-system` fallback as in the rest of the site. No Google Fonts, no Inter.
- **No new accent colors.** `#49bf9d` (existing green) + `#f5b942` (the new warm accent, used *only* in the mesh backdrop, not in any text or interactive element) + the ink scale. No new brand color.
- **No auto-marquee.** The portfolio is a static grid. Tasteskill's marquee is striking, but for a personal hero it competes with the personal card for attention.
- **No scroll-triggered animations.** No parallax on the hero, no reveal-on-scroll, no scroll-jacking.
- **No new icon font.** Icons are inline SVGs. The site already uses Font Awesome for some things; the hero does not add to that.
- **No scroll-progress indicator, no animated SVG, no WebGL.** The page is a research portfolio, not a tech demo.
- **No 3D card flip.** The tilt is a 6° rotation, not a flip. Flips break when a screen reader or a screen-recorder visits.
- **No AI-generated background art.** The mesh is two CSS gradients, not a generated image. The hero is a static site, not a build pipeline.
- **No multi-page spread.** The hero lives on `index.html` only. Blog, presentations, and inner pages keep their existing layouts.

---

## 7. Open questions for the implementation plan

These are explicitly NOT design questions. They will be resolved in the writing-plans phase, not now.

1. **What concrete file diffs** in `index.html` are required? (Line numbers, exact text to add/remove.) The plan will produce them.
2. **How to test the tilt** without visual judgment — what manual QA steps confirm the effect works in Safari, Chrome, Firefox, and at mobile breakpoints?
3. **How to verify** the mesh doesn't introduce a flash of unstyled content on slow connections.
4. **Whether to add `aria-hidden="true"`** to the mesh `<div>` and whether to mark the hero `<section>` as `aria-labelledby="hero-title"` (where the title is "An engineer of atoms. A dreamer in code.").
5. **What the GitHub commit message** should be. Convention: `feat(hero): add landing hero with glassmorphic card and 3×2 portfolio grid`.
6. **Whether to update the SPEC list** in `docs/superpowers/specs/` after implementation, or leave the spec frozen and treat the implementation as the source of truth for what shipped.
7. **Visual QA procedure**: open in Chrome DevTools at 1440px, 1024px, 768px, 414px widths; check that the personal card stays readable on each, and that the tile grid lays out as specified.

---

## 8. Approval gate

This spec is the boundary between design and implementation. Per the brainstorming workflow:

1. User reviews this document.
2. If the user requests changes, I edit and re-run the spec self-review loop.
3. Once approved, the **writing-plans** skill is invoked next. No implementation skill is invoked from here.
4. Implementation skill (likely a static-site builder / file-editing agent) is invoked from the plan, not from the spec.

The terminal state of the brainstorming skill is the writing-plans invocation. This spec is the input to that.
