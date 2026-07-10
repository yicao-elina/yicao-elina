# Blog v2 — Design Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Date:** 2026-07-10
**Status:** Approved (Sections 1-4 approved by user)
**Supersedes:** `docs/superpowers/specs/2026-07-09-blog-glassmorphic-design.md` (v1)

## Goal

Reorganize `blog.html` so the entering page presents a 2-tile binary
category overview, then a chronological timeline (lvy-style), then a
client-side `/write` tool for authoring new posts. Reuse the v1 glass
recipe (mesh, spotlight, tilt, glass card, btn-teal) for the new
surfaces; preserve the existing 8 glass cards as the content under each
category tile; keep the Quick Code Snippets section as-is.

## Architecture (Section 1 — approved)

Five vertical sections, top to bottom:

1. **Header** — existing `<header id="header">` (the v1 glass-header
   experiment was reverted in commit 2b699d3; this is the clean
   HTML5 UP header). Add a "Write" link to the existing nav.
2. **Meta-tiles row** — 2 large glassmorphic tiles in a 1fr 1fr grid.
   Hero image + dark gradient + glass overlay (bottom 45%) + title +
   1-line description + count chip + chevron. Clicking scrolls smoothly
   to that section's glass-card grid.
3. **Existing 8 glass cards** — split into "Technical Tips" (4 cards)
   and "Life Beyond Research" (4 cards) sections. The cards are already
   in `blog.html` and stay as-is.
4. **Chronological timeline** — year-grouped list (2025, 2024) of all
   8 posts, with category filter chips (`All` / `Technical` / `Life`)
   at the top. Each row: date (MM-DD), teal dot, title, optional tag.
5. **Write tool** — frontmatter form (title, date, category, tags,
   summary) + markdown editor on the left, live-rendered preview on the
   right, "Download .md" button. Quick Code Snippets section stays
   after this section. Stay Connected footer follows.

### Files

- **Modify:** `blog.html` (add meta-tiles, timeline, write sections;
  add "Write" nav link; leave existing 8 cards unchanged)
- **Modify:** `assets/css/blog.css` (extend with new sections; no
  removals, no token changes)
- **Create:** `assets/js/blog-timeline.js` (~80 lines, IIFE, vanilla JS)
- **Create:** `assets/js/blog-write.js` (~50 lines, IIFE, vanilla JS)
- **Create:** `assets/js/marked.min.js` (vendored, marked v12, MIT, ~30KB)
- **Modify:** `tests/blog-smoke.test.js` (extend with new DOM assertions)

### JS / CSS contract

- `.glass-card` and `.meta-tile` both use the existing tilt + spotlight
  scripts unchanged (re-attached via `data-tilt` and `data-spotlight`).
- The timeline filter logic is a single click handler that writes
  `body[data-timeline-filter]` and lets CSS hide non-matching rows.
- The write tool's live preview uses `marked.parse()` (vendored
  `marked.min.js`); the download uses a Blob URL with a
  `frontmatter + body` string.
- All new code respects `body.no-motion` (already gated by
  `blog-mesh.js`).
- `@supports not (backdrop-filter)` fallback extended for the new
  glass surfaces.

## Visual Recipe (Section 2 — approved)

### Meta-tile (2 of them)

- Aspect ratio: 16:9.
- Border-radius: 32px (larger than glass-card's 24px for visual
  hierarchy).
- Background: full-bleed hero image. The Technical tile uses
  `images/blog/dft-tips.png` (first Technical card's image). The Life
  tile uses `images/blog/Table_Tennis.jpg` (first Life card's image).
  If the implementer prefers a different representative, they may swap
  but must keep one of the existing 8 card images to avoid introducing
  new assets.
- Dark gradient overlay top→bottom: `linear-gradient(rgba(0,0,0,0)
  → rgba(0,0,0,0.55))` so the bottom text is legible.
- Glass overlay covering the bottom 45%:
  `background: rgba(255,255,255,0.55)`,
  `border-top: 1px solid rgba(255,255,255,0.6)`,
  `backdrop-filter: blur(20px) saturate(180%)` with webkit prefix,
  `border-bottom-left-radius: 32px`,
  `border-bottom-right-radius: 32px`.
- Inside the overlay (24px padding):
  - `<h3>` category name, 28px, SF Pro Display, weight 600, color
    `#1d1d1f`.
  - `<p>` 1-line description, 15px, SF Pro Text, color `#7a7a7a`.
  - Count chip: inline-block pill, padding 4px 10px, border-radius
    9999px, background `rgba(73,191,157,0.14)`, color `#2a8a6e`, 12px,
    weight 500.
  - Chevron `→` (16px), absolutely positioned bottom-right of the
    overlay; on hover it slides 4px right via
    `transition: transform 220ms ease-out`.
- Reuses `.glass-card` spotlight + tilt via `data-tilt data-spotlight`,
  with stronger perspective (1200px vs 800px) and larger max tilt
  (8° vs 6°).
- Hover: card lifts 8px (`translateY(-8px)`), chevron slides right,
  box-shadow grows to `0 20px 48px rgba(0,0,0,0.10)`.
- `data-cat="technical" | "life"` for parity with timeline rows.

### Timeline

- Section heading `<h2>` matches the existing `#technical-tips > h2`
  typography refresh (28px, SF Pro Display, weight 600,
  letter-spacing -0.28px, color `#1d1d1f`).
- Filter chip row, 8px gap, padding 0 0 16px 0:
  - Pill: 12px SF Pro Text, padding 6px 14px, border-radius 9999px.
  - Active: `background: #49bf9d; color: #fff; border-color: #49bf9d`.
  - Inactive: `border: 1px solid rgba(73,191,157,0.4); color: #49bf9d;
    background: transparent`.
  - `data-filter="all" | "technical" | "life"`; the active chip has
    `aria-pressed="true"`.
- Year header: 16px SF Pro Text, weight 600, color `#1d1d1f`,
  `border-bottom: 2px solid #49bf9d`, padding-bottom 6px, margin-top
  32px.
- Timeline row `<a class="timeline-row" data-cat="…">`:
  - `display: flex; gap: 12px; padding: 12px 0; align-items: center`,
    color `#1d1d1f`, text-decoration none, transition
    `background 180ms ease`.
  - Hover: `background: rgba(73,191,157,0.06)`.
  - Date cell: 44px wide, `font-variant-numeric: tabular-nums`, 14px,
    color `#7a7a7a`, weight 500.
  - Dot: 5px circle, `background: #49bf9d`, `flex-shrink: 0`.
  - Title: 15px SF Pro Text, weight 500, color `#1d1d1f`.
  - Optional tag chip: 12px pill, padding 2px 8px, background
    `rgba(73,191,157,0.10)`, color `#2a8a6e`.

### Write tool

- Wrapped in a glass card (max-width 1100px, centered,
  `background: rgba(255,255,255,0.55)`, border, blur, radius 24px).
- Layout: CSS grid `1fr 1.5fr` on desktop, stacked 1fr on mobile.
- Left pane (form + editor):
  - Section heading "Write a Post" (28px, SF Pro Display).
  - 5 form fields, full-width, 10px 14px padding, 12px border-radius,
    `background: rgba(255,255,255,0.7)`,
    `border: 1px solid rgba(0,0,0,0.08)`, font SF Pro Text, 14px.
    - Title (text)
    - Date (date, default = today)
    - Category (select: Technical / Life)
    - Tags (text, comma-separated)
    - Summary (textarea, 2 rows)
  - Body editor: textarea, 16 rows, monospace fallback only on
    `code`-fenced content, otherwise SF Pro Text 14px.
  - "Download .md" button: pill, padding 10px 20px, background
    `#49bf9d`, color white, weight 600, hover `#2a8a6e`.
- Right pane (preview):
  - Padding 24px, `background: rgba(255,255,255,0.45)`, border-radius
    16px, min-height 480px, prose styling:
    - `h1`, `h2`, `h3`: `#1d1d1f`, weights 700/600/600, letter-spacing
      -0.2px.
    - `p`: 15px, color `#333333`, line-height 1.6.
    - `a`: teal `#2a8a6e`, underline on hover.
    - `code`: `background: rgba(0,0,0,0.06)`, padding 1px 4px, radius
      4px, font monospace.
    - `pre code`: 13px, padding 12px, radius 8px, background
      `rgba(0,0,0,0.05)`.
    - `ul`, `ol`: 15px, padding-left 20px.
    - `blockquote`: border-left 3px solid #49bf9d, padding-left 12px,
      color `#7a7a7a`.

## Data Flow & JS Contract (Section 3 — approved)

### `assets/js/blog-timeline.js`

- IIFE with `var`, `"use strict"`.
- On `DOMContentLoaded`, queries
  `[data-filter-chip]` and `[data-timeline-filter-target]` (which is
  `<body>`).
- Click on a chip:
  - `body.dataset.timelineFilter = chip.dataset.filter`
    (`"all"` | `"technical"` | `"life"`).
  - Updates `aria-pressed="true|false"` on all chips.
- CSS handles hiding:
  ```css
  body[data-timeline-filter="technical"] [data-cat="life"] { display: none; }
  body[data-timeline-filter="life"] [data-cat="technical"] { display: none; }
  ```
  (`"all"` shows everything; no CSS rule needed.)
- Reduced-motion aware: no transitions or animations are introduced,
  so no `isReducedMotion()` checks are needed inside this file.
- Idempotent: bound on `DOMContentLoaded` only; safe to re-run.

### `assets/js/blog-write.js`

- IIFE with `var`, `"use strict"`.
- On `DOMContentLoaded`:
  - If `#write-body` and `#write-preview .preview-content` exist,
    bind an `input` listener that calls
    `marked.parse(body, { gfm: true, breaks: true })` and sets
    `innerHTML`.
  - If `[data-write-download]` exists, bind a `click` listener that
    composes the markdown string and triggers the download.
- Markdown string format:
  ```
  ---
  title: <value>
  date: <YYYY-MM-DD>
  category: <technical|life>
  tags: [a, b, c]
  summary: <value>
  ---

  # <title>

  <body>
  ```
- Slug function: `prefix = date`; `slug = title.toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")`; if empty, fall
  back to `"untitled"`. Filename: `${prefix}-${slug}.md`.
- Download flow:
  1. `const blob = new Blob([md], { type: "text/markdown" })`.
  2. `const url = URL.createObjectURL(blob)`.
  3. Create a hidden `<a download="<filename>" href="<url>">`,
     `click()`, then `URL.revokeObjectURL(url)`.

### Marked.js

- Vendored at `assets/js/marked.min.js` (marked v12, MIT, ~30KB).
- Loaded with `<script src="assets/js/marked.min.js" defer>` BEFORE
  `blog-write.js` (so `window.marked` is available when
  `blog-write.js` runs).
- License header comment is preserved at the top of the file.

### Reduced motion

- Filter chip click → no animation defined in CSS; no JS guards needed.
- The form / preview / timeline-row hover states have transitions;
  these are already disabled under `body.no-motion` (see
  `blog.css` line 232 `@media (prefers-reduced-motion: reduce)` and
  the `body.no-motion` rules). No new rules needed in v2.

### Backdrop-filter fallback

- Extend the existing `@supports not (backdrop-filter)` block at
  blog.css line 207 to include opaque fallbacks for `.meta-tile`,
  `.write-tool`, `.write-form`, `.write-preview`.

## Implementation Plan (Section 4 — approved)

7 tasks, each its own subagent + reviewer cycle:

### Task 1: Vendor `assets/js/marked.min.js`

- Download marked v12 minified to `assets/js/marked.min.js`.
- Verify file starts with the marked license header comment.
- Verify size is in the 25-40KB range (sanity).
- Add a one-line comment in `blog.html` above the `<script>` tag
  pointing at the vendored file: `<!-- marked v12 (MIT) -->`.

### Task 2: Extend `assets/css/blog.css`

- Append 5 new sections: `.meta-tile`, `.timeline`, `.filter-chip`,
  `.write-tool`, `.write-preview-prose`.
- Extend the `@supports not (backdrop-filter)` fallback.
- Extend both responsive media queries.
- All new rules use only existing tokens (no new colors / fonts).

### Task 3: Create `assets/js/blog-timeline.js`

- IIFE, vanilla, ~80 lines.
- Filter chip click handler; sets `body[data-timeline-filter]`.
- Idempotent.

### Task 4: Create `assets/js/blog-write.js`

- IIFE, vanilla, ~50 lines.
- Live preview via `marked.parse`.
- Download via Blob URL with frontmatter.
- Idempotent.

### Task 5: Restructure `blog.html`

- Add "Write" link to nav.
- Add `<section class="meta-tiles">` with 2 tiles.
- Add `<section class="timeline">` with filter chips + year groups
  + 8 timeline rows.
- Add `<section class="write-tool" id="write">` with form +
  preview.
- Leave existing 8 cards and Quick Code Snippets unchanged.
- Add new `<script>` tags for marked, blog-timeline, blog-write.

### Task 6: Extend `tests/blog-smoke.test.js`

- Add assertions: 2 meta-tiles, 3 filter chips, 8 timeline rows
  with `data-cat`, write form fields, `marked.min.js` linked, 2 new
  JS files linked.
- Update header assertion (no longer has `glass-header` class).
- All existing assertions must still pass.

### Task 7: Final verification + push

- Run smoke tests.
- Take screenshots at 1440 / 768 / 375 viewports.
- Final whole-branch review.
- Commit, push, confirm CI.

## Global Constraints

- **Reuse hero tokens only** — no new colors beyond the established
  palette:
  `#49bf9d`, `#2a8a6e`, `#1d6a52` (hover-darken of accent), `#1d1d1f`,
  `#333333`, `#7a7a7a`, `rgba(255,255,255,0.55)`, `rgba(255,255,255,0.6)`,
  `rgba(255,255,255,0.45)`, `rgba(255,255,255,0.7)`,
  `rgba(0,0,0,0.08)`, `rgba(0,0,0,0.06)`, `rgba(0,0,0,0.10)`,
  `rgba(73,191,157,0.14)`, `rgba(73,191,157,0.10)`,
  `rgba(73,191,157,0.06)`, `rgba(245,185,66,0.12)`,
  `rgba(73,191,157,0.18)`, `#fafafc`.
- **Type stack** — `SF Pro Display, SF Pro Text, system-ui,
  -apple-system, sans-serif`. No new fonts.
- **No custom cursor, no canvas mesh, no hero, no search/filter for the
  existing glass-card grid, no dark mode, no new fonts, no new
  libraries besides `marked` (MIT).**
- **No mutation of existing tokens** — the 8 glass cards and Quick
  Code Snippets section stay as-is; v2 only adds sections.
- **Commit attribution disabled globally** — do NOT add
  `Co-Authored-By:` lines.
- **Accessibility** — every interactive element has a focus ring
  (`outline: 2px solid #49bf9d; outline-offset: 2px`); filter chips
  have `aria-pressed`; live preview region has
  `aria-live="polite"`.

## Out of scope

- Server-side persistence (the /write tool downloads `.md` files; it
  does not save drafts to localStorage in v2).
- Image upload / cover image (lvy's /write has it; not requested).
- A real publish flow (the user copies the downloaded `.md` into the
  static site workflow by hand).
- A separate `/write.html` page (the tool is in-page).
- Dark mode.
