# Recent Work cards redesign (glass cards + working Details toggle + icon links)

## Context

The `#two` "Recent Work" section on `index.html` renders each publication/experience as a full-width horizontal row (thumbnail left, text right). The ARIA row in particular renders far too tall (oversized thumbnail + a lot of dead white space), and its "Details" button does nothing — clicking it never expands the abstract.

Root cause of the toggle bug: `spring-card.js` looks for a **direct child** of `[data-spring]` matching `.spring-header` (or falls back to the first child). The current "Details" `<button>` is nested two levels deep inside `.row-body`, so it's never found; the script silently falls back to using the thumbnail image column as the click target instead. That's why "Details" looks broken.

Separately, the user wants Recent Work to adopt the same glass-morphism card treatment already used on `blog.html` (`.glass-card`, tilt via `data-tilt`/`blog-tilt.js`, cursor-glow via `data-spotlight`/`blog-spotlight.js`), replace the ad-hoc `[PDF (Coming Soon)]`-style text links with small icon links, and make the whole card default-navigate to the paper (or best available link) on click — sourced from `CV-202607.tex` merged with the links already in `index.html`.

Decisions locked in with the user:
- Applies to **all 8** Recent Work entries, not just ARIA.
- When CV and `index.html` disagree on links for the same item, **keep both** (e.g. both OpenReview and arXiv).
- Whole-card click priority: **paper link > project website > GitHub > conference site**.
- For the two non-paper "experience" entries (Qualcomm, Viva Biotech), whole-card click goes to **LinkedIn post / company site** respectively.
- Layout: **2-column grid of vertical cards** (image top, text below), matching `blog.html`'s card shape — not the current single-column horizontal row.

## Goals

- Compact, consistent glass card per Recent Work entry, 2-up grid (1-up on mobile).
- "Details" toggle actually expands/collapses the abstract/why-it-matters copy, for the cards that have it.
- Small icon-link row per card (paper/PDF, arXiv, website, GitHub, LinkedIn — whichever apply), reusing the existing `.ah-icon`/`.ah-tooltip` hover-tooltip component from the header pill.
- Clicking anywhere on the card (that isn't an icon link or the Details button) opens the card's primary link in a new tab.

## Non-goals

- No new abstract/"why it matters" copy will be invented for cards that don't already have one (Migration, Atomic Switch, Self-Healing Perovskites) — they simply have no Details toggle.
- Not touching the `#three` Work Experience gallery cards, the `#news` strip, or `blog.html` itself.

## Per-card data (source of truth for implementation)

| # | Card | Image | Icons (order) | Primary click-through | Details content |
|---|------|-------|----------------|------------------------|-------------------|
| 1 | RepliCan (COLM 2026) | `images/thumbs/replican-paper.png` | OpenReview (paper), arXiv, Website, GitHub, LinkedIn | OpenReview `https://openreview.net/forum?id=SK5NpcSf9f` | existing abstract/why-it-matters (keep verbatim) |
| 2 | ARIA (KDD 2026) | `images/thumbs/aria-paper.png` | **local PDF** (see note), GitHub, KDD 2026 site | local PDF `research/kdd26/ARIA-KDD2026.pdf` (renamed, see below) | existing abstract/why-it-matters (keep verbatim) |
| 3 | DUAL-X (AAAI 2026) | `images/thumbs/06-Material-Explanable-AI-thumb.png` | OpenReview (paper), local teaser PDF, XAI4Science site | OpenReview `https://openreview.net/forum?id=K95Tt6fYud` | existing abstract/why-it-matters (keep verbatim) |
| 4 | Migration (NeurIPS 2025) | `images/thumbs/03-2D-material.jpg` | OpenReview (paper), arXiv, GitHub, LinkedIn | OpenReview `https://openreview.net/forum?id=RnITjvwxke` | none (no toggle) |
| 5 | Atomic Switch (under review) | `images/thumbs/02-Thermoelctric-thumb.png` | Project website | Project website `https://yicao-elina.github.io/ClancyLab-Thermoelectrics/` | none (no toggle) |
| 6 | Self-Healing Perovskites | `images/thumbs/01-Defect-thumb.png` | DOI (paper), GitHub, LinkedIn | DOI `https://doi.org/10.1039/D5CP01641J` | none (no toggle) |
| 7 | Qualcomm (experience) | `images/qualcomm-intern.jpeg` | LinkedIn, company site | LinkedIn post `https://www.linkedin.com/feed/update/urn:li:activity:7437471139364343808/` | existing "What I built."/"Stack." copy (keep verbatim) |
| 8 | Viva Biotech (experience) | `images/thumbs/viva-yi.png` | Company site | `https://www.vivabiotech.com` | existing "What I built."/"Stack." copy (keep verbatim) |

New links introduced (not currently on the site anywhere):
- RepliCan: arXiv `https://arxiv.org/abs/2605.00803`, GitHub `https://github.com/JHU-CLSP/AutoMat`, Website `https://jhu-clsp.github.io/AutoMat/` (from CV).
- ARIA: GitHub `https://github.com/yicao-elina/LLM4Chem-Explainable-synthesis.git` (from CV); local PDF (see note below, currently unlinked anywhere on the site).
- Migration: OpenReview `https://openreview.net/forum?id=RnITjvwxke`, GitHub `https://github.com/yicao-elina/MigrationBench`, LinkedIn post (existing long URL, already in current markup but currently the *only* link — now becomes one of several icons).
- Self-Healing Perovskites: GitHub `https://github.com/pclancy-lab/perovskites_space.git` (from CV); its existing LinkedIn post link carries over unchanged.

**Note on ARIA's PDF**: `research/kdd26/KDD_2026___ARIA (2).pdf` exists in the repo but is linked nowhere on the site. As part of implementation, rename it to `research/kdd26/ARIA-KDD2026.pdf` (plain `mv`, avoids spaces/parens in the URL) and use it as ARIA's paper link/primary click-through. This replaces the current "Project page →" link to `research/kdd26/` in ARIA's Details panel — that bare directory has no `index.html`, so it never resolved to a real page; the PDF is the actual usable asset in that folder.

**Note on DUAL-X's GitHub**: CV lists `https://github.com/yicao-elina/MigrationBench` under the DUAL-X entry, but that repo is clearly the Migration/NeurIPS benchmark (matches its own website/description). Treating this as a CV copy-paste slip: the MigrationBench GitHub icon appears only on the Migration card (#4), not on DUAL-X (#3).

## DOM structure (per card)

```html
<article class="glass-card research-card" data-tilt data-spotlight data-spring>
  <a class="image fit thumb" href="{primary}" target="_blank" rel="noopener">
    <img src="{thumb}" alt="" />
  </a>
  <h3><a href="{primary}" target="_blank" rel="noopener">{Title}</a></h3>
  <p class="card-authors">{Authors}</p>
  <p class="card-venue"><em>{Venue}</em> <span class="news-pill">Accepted</span></p> <!-- pill only for RepliCan & ARIA, matching current content -->
  <p class="card-desc">{one-line description}</p>
  <div class="card-links">
    <a class="ah-icon" href="{url}" target="_blank" rel="noopener" data-tooltip="{Label}">
      <i class="{fa-class}"></i><span class="ah-tooltip">{Label}</span>
    </a>
    <!-- repeat per icon -->
  </div>
  <!-- omitted entirely for cards 4/5/6 -->
  <button class="spring-header" type="button" aria-label="Toggle paper details"><span class="chev">▸</span> Details</button>
  <div class="spring-panel">
    <p><strong>Abstract.</strong> …</p>
    <p><strong>Why it matters.</strong> …</p>
  </div>
</article>
```

`card-desc` text: reuse each item's existing one-line description already in `index.html` verbatim; for RepliCan (which currently has none) reuse the one-liner already written for it in the `#news` strip ("Evaluating LLM agents on scientific reproducibility in computational materials science.").

## CSS changes (`assets/css/main-override.css`)

- Replace `.recent-work-list` single-column grid with `grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));` (same pattern already used by `#three .features` and `#news .news-strip` in this file).
- Remove the old `.recent-work-list .row` / `.row-body` / 3-column-grid rules (lines ~396-467 in the current file) since the new markup uses `.glass-card` directly instead of `.row`.
- Add `.research-card .card-authors`, `.card-venue`, `.card-desc` (typography only — sizes/colors matching the removed `.row-body` text styles: authors normal body, venue `em` + optional pill, desc `0.9em`/`#666`).
- Add `.research-card .card-links { display:flex; gap:6px; flex-wrap:wrap; margin: 4px 0 10px; }`. Icons reuse `.ah-icon`/`.ah-tooltip` as-is from `header.css` (already generic, not scoped to the header); shrink to `28px` via a `.research-card .ah-icon { width:28px; height:28px; font-size:15px; }` override so 4-5 icons fit comfortably in a compact card footer.
- Reuse `.glass-card` wholesale by linking `assets/css/blog.css` on `index.html` (it's not currently linked there) instead of duplicating ~150 lines of CSS into `main-override.css`. Checked `blog.css` for collisions: everything outside `.glass-card`/`.btn-teal` is scoped to classes/ids that don't exist on `index.html` (`.blog-mesh`, `.meta-tile*`, `.timeline*`, `#technical-tips`, etc.) or to `body.no-motion`/`body[data-timeline-filter]` (both harmless no-ops without matching elements) — safe to link directly, no port-and-duplicate needed.
- `.spring-header` (the button) keeps using the existing `.chev` rotate animation already defined for `.row-header-toggle`; rename/alias that rule to target `.research-card .spring-header .chev` instead (or keep `.row-header-toggle` as an additional class on the button so no CSS renaming is needed).

## JS changes

1. **`assets/js/spring-card.js`**: relax the header/panel lookup from `:scope > .spring-header` / `:scope > .spring-panel` to plain `.spring-header` / `.spring-panel` (descendant match). This is a strict superset of the current behavior — any existing direct-child usage still matches — so no regressions elsewhere. This is the actual fix for the "Details doesn't collapse" bug.
2. **New `assets/js/research-card-link.js`**: for each `.research-card`, attach a click listener on the article; if `e.target.closest('a, button')` is truthy, do nothing (let the real link/button handle it); otherwise `window.open(card.querySelector(':scope > a.image, :scope > h3 a').href, '_blank', 'noopener')`. Keeps keyboard/no-JS users functional via the real `<a>` elements (image + title), while mouse users can click anywhere on the card.
3. `data-tilt` / `data-spotlight` behaviors need no changes — already generic (`blog-tilt.js`, `blog-spotlight.js` bind to any `[data-tilt]`/`[data-spotlight]` element).

## Accessibility

- Title and thumbnail remain real `<a href>` elements — keyboard/screen-reader users can reach and activate the primary link without any JS.
- Details button keeps `aria-expanded`/`aria-hidden` wiring already implemented in `spring-card.js` (untouched, just now correctly targeted).
- Icon links keep individual `aria-label`/tooltip text via existing `.ah-tooltip` pattern.

## Verification

- Visual check in browser (chrome-devtools MCP, as used earlier this session) at desktop and mobile widths: 2-column grid collapsing to 1 column, cards visibly smaller than the current ARIA row.
- Click "Details" on RepliCan/ARIA/DUAL-X/Qualcomm/Viva cards — panel expands/collapses (compare to today where it silently does nothing due to the direct-child bug).
- Click a card body (not on an icon/button) for at least 2 cards — confirm it opens the expected primary link in a new tab.
- Click each icon on at least 2 cards — confirm no double-navigation (card-level handler must not fire when the click lands on a real `<a>`).
- Confirm the renamed ARIA PDF file opens correctly from its new path.
