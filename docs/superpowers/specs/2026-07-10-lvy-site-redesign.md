# Site-Wide Lvy Redesign — Design Spec

**Date:** 2026-07-10
**Status:** Draft (awaiting user review)
**Branch target:** `gh-pages`
**Replaces:** the current text-only `<nav id="nav">` dropdown header, the cramped news strip, the small research thumbnails, and the flat Awards/Vision/Contact sections.

---

## 1. Goal

Bring the whole site under one glassmorphic, mint-accented visual language that already lives on the hero and the blog. Concretely:

1. Replace the current text dropdown nav with a Lvy-style floating glass icon pill (avatar + 10 icon buttons).
2. Introduce a **springy inline expand** primitive (`data-spring`) that becomes the site's recurring "open a card" interaction — used for paper details, work-experience cards, and news entries.
3. Split the work experience into a kept Education timeline + a new 2-column Work Experience glass-card grid.
4. Bump research thumbnails from ~80px square to 220×160 so the figures are readable, and wire each paper row to the springy expand.
5. Cap the news strip on the index to 3 cards + 1 "Read more" link to a new `news.html` Lvy-style year-grouped timeline page.
6. Polish Awards, Vision, and Contact with the same glass-card wrapper so every section on the index shares the same visual grammar.

**Out of scope (explicitly):** `presentations.html` content (only the new header is added), `blog.html` content (already has its own glassmorphic spec), a new Projects page (rejected — code lives at GitHub, talks live on `presentations.html`, papers live on the index), search on `news.html`, CV PDF, social links.

**Reference visuals:** https://lvyovo-wiki.tech/blog (year-grouped timeline), https://lvyovo-wiki.tech/bloggers (glass icon-pill header pattern), https://www.tasteskill.dev/ (hero pattern, already shipped).

---

## 2. Architecture

### 2.1 File changes

| File | Status | Lines (approx) | Purpose |
|---|---|---|---|
| `assets/css/tokens.css` | NEW | ~40 | Single source of truth for the 13 design tokens. Other stylesheets duplicate the token block (we have no bundler) |
| `assets/css/header.css` | NEW | ~140 | Floating glass icon-pill header |
| `assets/css/main-override.css` | EDIT | +~250 (existing ~370) | Spring primitive, experience cards, news tweaks, section polish |
| `assets/js/header-tooltip.js` | NEW | ~0.8 KB | Hover tooltip on each header icon |
| `assets/js/spring-card.js` | NEW | ~1.5 KB | Springy inline expand for any `[data-spring]` card |
| `assets/js/news.js` | NEW | ~1.0 KB | Year filter pills on news.html |
| `index.html` | EDIT | net +~120 | Remove `<nav id="nav">`, add `<header id="app-header">`, add `#experience` section, add `data-spring` to papers, wrap sections in glass |
| `blog.html` | EDIT | net +3 | Add `<header id="app-header">` (keep existing blog header) |
| `presentations.html` | EDIT | net +3 | Add `<header id="app-header">` |
| `news.html` | NEW | ~120 | Year-grouped news timeline page |
| `tests/hero-smoke.test.js` | EDIT | +~50 | ~6 new assertions |

### 2.2 Token block (duplicated into each stylesheet)

```css
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
  --font-display: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
  --font-text: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
  --ease-spring: cubic-bezier(.34, 1.56, .64, 1);
}
```

### 2.3 Glass card recipe (the single visual unit)

```css
.glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-card);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  transition: transform 220ms var(--ease-spring), box-shadow 220ms ease;
}
.glass:hover { transform: translateY(-3px); box-shadow: 0 18px 50px rgba(0, 0, 0, 0.12); }
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: rgba(255, 255, 255, 0.92); }
}
```

This same `.glass` class is used on: news cards, paper rows, work-experience cards, awards rows, vision/contact wrappers, the header pill, the news.html year-group cards.

### 2.4 Springy card-open primitive

`[data-spring]` is the entry point. Markup pattern:

```html
<article class="glass" data-spring>
  <header>...summary...</header>
  <div class="spring-panel" hidden>
    <p>Full detail...</p>
  </div>
</article>
```

`assets/js/spring-card.js` (sketch):
```js
document.querySelectorAll('[data-spring]').forEach(card => {
  const panel = card.querySelector('.spring-panel');
  const header = card.querySelector(':scope > header, :scope > .spring-header');
  if (!panel || !header) return;
  panel.hidden = false;                     // we animate visibility via CSS
  panel.style.maxHeight = '0px';
  panel.style.opacity = '0';
  panel.style.overflow = 'hidden';
  panel.style.transition = 'max-height 380ms var(--ease-spring), opacity 280ms ease';
  card.setAttribute('aria-expanded', 'false');
  header.setAttribute('role', 'button');
  header.setAttribute('tabindex', '0');
  const toggle = () => {
    const open = card.getAttribute('aria-expanded') === 'true';
    card.setAttribute('aria-expanded', String(!open));
    if (open) {
      panel.style.maxHeight = '0px';
      panel.style.opacity = '0';
    } else {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      panel.style.opacity = '1';
    }
  };
  header.addEventListener('click', e => {
    if (e.target.closest('a')) return;       // don't expand if a link was clicked
    toggle();
  });
  header.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
});
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('no-motion');
  // The script's transition var falls back to a 200ms ease in this branch
}
```

`@media (prefers-reduced-motion: reduce)` CSS fallback: panel transition becomes `max-height 200ms ease, opacity 150ms ease`, no overshoot.

### 2.5 Header pattern

`assets/css/header.css` (sketch):
```css
.app-header {
  position: fixed; top: 16px; left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px;
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-pill);
  backdrop-filter: blur(24px) saturate(180%);
  box-shadow: 0 8px 32px rgba(20, 30, 45, 0.08);
}
.app-header .ah-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  border: 2px solid var(--mint); cursor: pointer;
  transition: transform 200ms var(--ease-spring);
}
.app-header .ah-avatar:hover { transform: scale(1.06); }
.app-header .ah-icon {
  width: 36px; height: 36px; display: inline-flex;
  align-items: center; justify-content: center;
  border-radius: 50%; color: var(--graphite);
  font-size: 18px; position: relative;
  transition: color 180ms ease, transform 180ms var(--ease-spring);
  text-decoration: none;
}
.app-header .ah-icon:hover { color: var(--mint); transform: translateY(-2px); }
.app-header .ah-icon[aria-current="page"] { color: var(--mint); }
.app-header .ah-tooltip {
  position: absolute; top: calc(100% + 6px); left: 50%;
  transform: translateX(-50%) translateY(-4px);
  background: #fff; color: var(--ink);
  font: 600 11px/1 var(--font-text);
  padding: 4px 8px; border-radius: 6px;
  white-space: nowrap; pointer-events: none;
  opacity: 0; transition: opacity 200ms ease, transform 200ms var(--ease-spring);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.app-header .ah-icon:hover .ah-tooltip,
.app-header .ah-icon:focus-visible .ah-tooltip { opacity: 1; transform: translateX(-50%) translateY(0); }
.app-header .ah-more { display: none; }       /* shown on <768px */
@media (max-width: 768px) {
  .app-header .ah-icon:nth-child(n+6) { display: none; }
  .app-header .ah-more { display: inline-flex; }
}
```

Body gets `padding-top: 88px` to clear the pill (was 60px for the text nav).

The `<header>` markup is a shared HTML partial. We do not have a build system, so the same ~30-line block is pasted into `index.html`, `blog.html`, `presentations.html`, and `news.html` directly. To prevent drift, the partial lives in a comment in `index.html` referencing the source-of-truth snippet in this spec.

### 2.6 Header icon set (10 icons, FA5 outline)

| Icon | Label | Target |
|---|---|---|
| `fa-newspaper` | News | `news.html` |
| `fa-flask` | Research | `#two` on index, `index.html#two` from other pages |
| `fa-graduation-cap` | Experience | `#experience` on index |
| `fa-trophy` | Awards | `#awards` on index |
| `fa-eye` | Vision | `#vision` on index |
| `fa-envelope` | Contact | `#four` on index |
| `fa-pen-to-square` | Blog | `blog.html` |
| `fa-file-pdf` | CV | `CAO_Yi_CV.pdf` (new tab) |
| `fa-brands:github` | GitHub | `https://github.com/yicao-elina` (new tab) |
| `fa-presentation-screen` | Talks | `presentations.html` |

Plus the avatar (`<img src="images/avatar.jpeg">`) at the start, which scrolls to top.

The Presentation icon is the 10th. To keep the icon set lean, the original dropdown's "Education / Work Gallery" sub-items are gone — Education is now part of `#experience` (Section 4.2), and Work Gallery is now the 2-column Work cards (Section 4.2.2).

### 2.7 File-by-file responsibility

| File | Owns | Does NOT own |
|---|---|---|
| `tokens.css` | The 13 design tokens | Any visual rule that uses them |
| `header.css` | Header pill, avatar, icon buttons, tooltip, mobile overflow | Any other section |
| `main-override.css` | Spring primitive, experience grid, news tweaks, section polish, the rest of the page-section overrides | Header, hero, blog |
| `header-tooltip.js` | Hover/focus tooltip delay + keyboard support | Icon active-state (CSS handles) |
| `spring-card.js` | `data-spring` expand/collapse | Page navigation, modal, scroll behavior |
| `news.js` | Year filter on news.html | News card layout (CSS) |

---

## 3. Visual recipe (Lvy-inspired, our colors)

### 3.1 Header pill

Floating glass pill, 60px tall, 10 icons + 1 avatar. Mint active state. Springy hover (1.06× scale on avatar, 2px lift on icons). The pill background is `rgba(255,255,255,0.65)` — slightly more opaque than content cards — so icons stay readable on a busy mesh background.

### 3.2 Spring card-open

`max-height: 0 → scrollHeight` over 380ms with `cubic-bezier(.34,1.56,.64,1)`. The bezier's second control point (1.56) is what produces the "q弹" overshoot — the panel briefly exceeds its target size then settles. Opacity fades in over 280ms in parallel.

### 3.3 Research card

Left: 220×160 thumb (was ~80px square, 16:9 or 4:3 with `object-fit: cover`). Right: title (ink, 20px, 600), co-authors (graphite, 14px), venue pill + status pill + external links row. On expand: full abstract + problem/method/results paragraphs + code/talk/PDF link row.

### 3.4 Experience cards

2-col on desktop, 1-col on mobile. Each card: 48px company logo (grayscale → color on hover), role title (ink, 18px, 600), date + location (graphite, 13px), 1-2 sentence description, skill pills (mint, 12px, glass-pill). On expand: full project list, what I built, what I learned.

### 3.5 News strip (index)

3 news cards (most recent) + 1 "Read more" card. Grid: `repeat(4, 1fr)` desktop, `repeat(2, 1fr)` tablet, `1fr` mobile. Read more card is centered text, mint chevron, no thumbnail. On click → navigate to `news.html`.

### 3.6 News timeline page

Year filter pills (active = mint fill, inactive = glass), then a vertical timeline. Mint hairline vertical, small mint dots at each entry, date (graphite, 13px, monospace), title (ink, 18px, 600), category tag pill (mint, 11px, right-aligned). On click → springy inline expand showing the entry body.

### 3.7 Section polish

Awards, Vision, Contact each get a single `.glass` wrapper inside the section. The section's existing content stays, but the wrapper gives them the same visual frame as the cards above and below. No new copy.

---

## 4. Behavior

### 4.1 Header

- Click avatar → smooth scroll to top (`scrollTo({ top: 0, behavior: 'smooth' })`)
- Click icon → navigate to target (default link behavior; `#`-anchors use existing jQuery `.scrolly` handler in `main.js`)
- Hover/focus icon → tooltip appears 200ms after mouseenter, hides on mouseleave, keyboard-accessible via `focus-visible`
- Active page → `aria-current="page"` set on the matching icon; CSS highlights in mint
- `<768px` viewport → 5 most-used icons + avatar + "⋯" overflow button. The overflow opens a small popover with the remaining 5 icons.

### 4.2 Spring cards

- Click card header → toggle open/close
- Click a link inside the panel → navigate (event is not preventDefault'd; the script checks `e.target.closest('a')` and skips toggle)
- Keyboard: Enter/Space on the header toggles; Escape collapses
- One card open at a time within the same parent? **No** — multiple can be open. This matches the blog spec's pattern.
- `data-spring-default-open="true"` → opened on initial load (used for the DUAL-X paper to feature the AAAI spotlight)
- `prefers-reduced-motion: reduce` → no overshoot, 200ms ease in/out, opacity only (no max-height animation if `no-motion` is set)

### 4.3 News timeline

- Click year pill → filter timeline to that year. Active year pill = mint fill. Default = "All".
- The filter is purely visual; entries are hidden via `display: none`. No animation needed (the Lvy reference does the same).
- The timeline does NOT have a hero or mesh. Page is intentionally quiet so the timeline reads clearly.

### 4.4 Sections

- Awards: the inline `style="background-color: #fcfcfc"` on `#awards` is **removed**; replaced with a `.glass` wrapper. The flat off-white fights the page surface and is the most jarring inconsistency.
- Vision: paragraph wrapped in a centered 720px-max glass card. The section keeps the "main style1 special" class (we don't refactor template classes) but the visible background is now transparent.
- Contact: icon list wrapped in a glass card; a "currently open to" line is added above the icons (PhD internships, research collaborations, speaking).

### 4.5 Edge cases

- `prefers-reduced-motion: reduce` is respected by: spring panel animation, mesh drift (already handled in `hero-mesh.js` and `blog-mesh.js`), header avatar scale spring, header icon hover lift.
- No JavaScript: the page must still be usable. The header is `<a>` tags (navigation works). The spring cards show their panel content as static (no animation) — fallback in CSS is `panel:not([hidden]) { max-height: none !important; }` when `<html class="no-js">` is set, and `main.js` removes that class on load.
- `noscript` users see the page with the header in place and all spring panels expanded (intentional — better than nothing).
- Mobile (≤768px): spring panels still expand; no max-height cap.
- Touch devices: tap header icon → tooltip appears for 2s then fades (handled in `header-tooltip.js` via touchstart + setTimeout).

---

## 5. Testing

### 5.1 Smoke tests (`tests/hero-smoke.test.js`, extended)

After all commits, the test asserts (against a local static server on port 8123):

1. `/` returns 200 and contains `<header id="app-header">`
2. `/` contains 10 `.ah-icon` elements
3. `/` does NOT contain `<nav id="nav">`
4. `/` contains `assets/css/header.css` and `assets/css/tokens.css` links
5. `/` contains 5 paper rows with `data-spring` attribute
6. `/` contains a `#experience` section with 2-column grid (`grid-template-columns` includes `repeat(2, 1fr)` or similar)
7. `/` `#news` contains 3 `.news-item` and 1 `a[href="news.html"]`
8. `/news.html` returns 200 and contains a year filter (3+ year pills)
9. `/news.html` contains 6+ timeline entries
10. `assets/js/spring-card.js` is served and contains `data-spring`
11. `assets/js/header-tooltip.js` is served

Server start: `python3 -m http.server 8123 --directory /Users/alina/Documents/yicao-elina`. Server stop: `pkill -f "http.server 8123"`.

### 5.2 Manual visual checks (browser)

- 1440px desktop: header pill centered, all 10 icons visible, mesh underneath
- 768px tablet: avatar + 5 icons + overflow
- 375px phone: avatar + 5 icons + overflow opens popover
- Spring expand: click DUAL-X → panel slides open with overshoot; Escape closes; Enter on focused header opens
- News timeline: click "2026" pill → only 2026 entries visible; click "All" → all 6 visible
- Reduced motion: macOS System Settings → Accessibility → Display → Reduce motion ON → spring expands without overshoot, mesh stops drifting, header avatar doesn't scale on hover

### 5.3 Out of scope for tests

- Visual diff / pixel comparison
- Accessibility audit (manual only — we mark up aria-expanded, aria-current, focus-visible, but no axe-core run)
- Performance benchmarks (Lighthouse)
- Cross-browser: target is current Chrome/Safari/Firefox; legacy browsers not tested

---

## 6. Migration / rollout

### 6.1 Commit sequence (8 commits, each independently shippable)

1. `feat(design): extract shared design tokens to assets/css/tokens.css`
2. `feat(header): replace text nav with floating glass icon pill`
3. `feat(card): add springy inline expand primitive (data-spring)`
4. `feat(research): bigger thumbs + springy paper detail panels`
5. `feat(experience): split into Education timeline + 2-col Work cards`
6. `feat(news): 3 cards + Read more on index; new /news.html timeline page`
7. `feat(sections): polish Awards, Vision, Contact with glass wrappers`
8. `test: extend hero smoke test to assert new sections + new files`

Each commit lands on `gh-pages` after two-stage review (spec compliance + code quality). The 8th commit's review is the whole-branch review. The user reviews in a browser between each commit, no automated push.

### 6.2 Rollback

Each commit is reversible with `git revert <hash>`. The hero spec already shipped (commits `36a967e`, `7741fce`, `0b6865b`, `8ef91aa`, `6877ad5`, `760a799`, `d94f5f8`) and is independent of this redesign — none of those commits need to be touched.

### 6.3 Origin/gh-pages push policy

Same as before: no push to origin/gh-pages until the user explicitly approves after a visual review. Local commits only. The user runs `git push origin gh-pages` when ready.

---

## 7. Open questions (resolved)

| # | Question | Resolution |
|---|---|---|
| Q1 | Scope: all 5 things at once, or staged? | All at once (user said "Everything in one pass") |
| Q2 | Header position: top pill, side rail, or scroll-reveal? | Top-center floating pill |
| Q3 | Header icon set: all destinations, core + overflow, or grouped? | All 10 current destinations as icons |
| Q4 | Card-open effect: inline expand, full nav, or modal? | Inline expand with spring |
| Q5 | Research pages: 5 sections, 1 page, or 5 files? | 5 research detail sections on the same page (inline expand) |
| Q6 | News timeline: inline expand, dedicated page, or no expansion? | Dedicated `news.html` page with year filter |
| Q7 | Research thumb size | 220×160 left-thumb |
| Q8 | Projects page | **Dropped** — code lives at GitHub, talks on `presentations.html`, papers on index |
| Q9 | Visual companion? | No, terminal only |

---

## 8. Self-review

- **Placeholder scan:** No TBD/TODO/placeholder. Every value in the spec is concrete (e.g., `--ease-spring: cubic-bezier(.34,1.56,.64,1)`, `padding: 8px 14px`, `220×160`, `repeat(4, 1fr)`).
- **Internal consistency:** Section 2 (architecture) and Section 6 (commits) agree on file list. Section 3 (visual) and Section 4 (behavior) agree on the spring primitive. Section 5 (tests) and Section 6 agree that the test commit is the last one.
- **Scope check:** Five named capabilities in one design, but each is small and has a single commit. The total is ~8 commits, ~10 files touched/created, ~600 net lines. Within a single implementation plan.
- **Ambiguity check:** "Most recent 3 news items" is defined as the first 3 of the existing 4 in the order they currently appear in `index.html` (Qualcomm, RepliCan, ARIA). The 4th (KDD PhD Consortium) moves to `news.html` as the first 2026 entry. The "currently open to" line on Contact is exactly: "PhD internships · research collaborations · speaking".
