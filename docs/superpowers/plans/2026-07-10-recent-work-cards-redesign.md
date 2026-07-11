# Recent Work Cards Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the oversized, broken-toggle Recent Work rows on `index.html` with a 2-column grid of compact glass-morphism cards (matching `blog.html`'s `.glass-card`), small icon links per paper, a working Details expand/collapse, and whole-card click-through to the paper (or best available link).

**Architecture:** Static HTML/CSS/JS site, no build step. Each Recent Work entry becomes an `<article class="glass-card research-card">` inside `.recent-work-list` (a CSS grid, `repeat(auto-fit, minmax(320px, 1fr))`). Visual styling comes from linking the already-existing `assets/css/blog.css` into `index.html` (its `.glass-card`/tilt/spotlight rules are generic, not scoped to `blog.html`). Interaction comes from three JS files: the existing `blog-tilt.js`/`blog-spotlight.js` (untouched, already generic), `spring-card.js` (one-line selector fix for the Details toggle bug), and a new `research-card-link.js` (whole-card click-through). Tests follow this repo's existing convention: plain `node:test` smoke tests that fetch HTML/CSS/JS from a local static server and assert on string content (see `tests/hero-smoke.test.js`, `tests/blog-smoke.test.js`) — there is no headless-browser test runner in this repo, so interactive behavior (does the panel actually expand, does the click open a new tab) is verified manually with the chrome-devtools MCP browser tools in the final task.

**Tech Stack:** Plain HTML/CSS/JS (no framework, no bundler). Font Awesome 5 Free (already vendored at `assets/css/fontawesome-all.min.css`). Node's built-in test runner (`node --test`), fetching against `python3 -m http.server 8123`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-10-recent-work-cards-redesign.md` — read it before starting; this plan implements it exactly.
- Applies to all 8 Recent Work entries (RepliCan, ARIA, DUAL-X, Migration/NeurIPS, Atomic Switch, Self-Healing Perovskites, Qualcomm, Viva Biotech), not just ARIA.
- No new abstract/"why it matters" copy is invented for Migration, Atomic Switch, or Self-Healing Perovskites — they get no Details toggle.
- Click-through priority: paper link > project website > GitHub > conference site. Qualcomm → LinkedIn post. Viva Biotech → company site.
- Every `<a>` to an external URL uses `target="_blank" rel="noopener"` (existing site convention).
- Do not touch `#three` (Work Experience gallery), `#news`, or `blog.html` itself.
- Commit after every task (this repo's git history shows small, frequent commits — follow that pattern). Do not use `--no-verify`.

---

### Task 1: Rename the ARIA PDF asset and start the smoke test file

**Files:**
- Rename: `research/kdd26/KDD_2026___ARIA (2).pdf` → `research/kdd26/ARIA-KDD2026.pdf`
- Create: `tests/recent-work-smoke.test.js`

**Interfaces:**
- Produces: the file path `research/kdd26/ARIA-KDD2026.pdf`, which Task 4 will link as ARIA's paper/primary click-through.
- Produces: `tests/recent-work-smoke.test.js` with a `getHtml()`/`getText()`/`find()` helper trio that every later task appends tests to (same shape as `tests/hero-smoke.test.js`).

- [ ] **Step 1: Rename the file**

```bash
mv "research/kdd26/KDD_2026___ARIA (2).pdf" "research/kdd26/ARIA-KDD2026.pdf"
```

- [ ] **Step 2: Write the failing test**

Create `tests/recent-work-smoke.test.js`:

```js
// Smoke test for the Recent Work glass-card redesign.
// Run with: node --test tests/recent-work-smoke.test.js
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

async function getText(path) {
  const res = await fetch(BASE + path);
  return { status: res.status, text: await res.text() };
}

function find(html, needle) {
  return html.includes(needle);
}

test("ARIA PDF is available at its renamed path", async () => {
  const res = await fetch(BASE + "/research/kdd26/ARIA-KDD2026.pdf");
  assert.equal(res.status, 200, "renamed ARIA PDF must return 200");
});
```

- [ ] **Step 3: Start the local static server (if not already running)**

```bash
python3 -m http.server 8123 --directory /Users/alina/Documents/yicao-elina >/dev/null 2>&1 &
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/recent-work-smoke.test.js`
Expected: `# pass 1`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add "research/kdd26/ARIA-KDD2026.pdf" tests/recent-work-smoke.test.js
git rm --cached "research/kdd26/KDD_2026___ARIA (2).pdf" 2>/dev/null || true
git add -A research/kdd26/
git commit -m "chore: rename ARIA PDF to a URL-safe filename, add recent-work smoke test"
```

---

### Task 2: Fix the Details toggle bug in `spring-card.js`

**Files:**
- Modify: `assets/js/spring-card.js:26,32`
- Modify: `tests/recent-work-smoke.test.js` (append)

**Interfaces:**
- Consumes: nothing new.
- Produces: `spring-card.js` now finds `.spring-header`/`.spring-panel` anywhere inside a `[data-spring]` element (not only as a direct child). Task 4's card markup relies on this — its Details `<button class="spring-header ...">` sits inside the card's flow, not as the very first child.

**Root cause:** `card.querySelector(':scope > .spring-header, :scope > header.spring-header')` only matches a direct child of `[data-spring]`. The current "Details" button is nested inside `.row-body`, so it's never found, and the code silently falls back to using the first child (the thumbnail) as the toggle target.

- [ ] **Step 1: Write the failing test**

Append to `tests/recent-work-smoke.test.js`:

```js
test("spring-card.js finds .spring-header/.spring-panel as descendants, not only direct children", async () => {
  const { status, text } = await getText("/assets/js/spring-card.js");
  assert.equal(status, 200, "spring-card.js must return 200");
  assert.ok(!find(text, ":scope > .spring-header"), "no more direct-child-only header lookup");
  assert.ok(!find(text, ":scope > .spring-panel"), "no more direct-child-only panel lookup");
  assert.ok(find(text, ".spring-header"), "still looks up .spring-header");
  assert.ok(find(text, ".spring-panel"), "still looks up .spring-panel");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/recent-work-smoke.test.js`
Expected: FAIL on the new test — `:scope > .spring-header` is still present in the file.

- [ ] **Step 3: Fix the selectors**

In `assets/js/spring-card.js`, change:

```js
      var header = card.querySelector(':scope > .spring-header, :scope > header.spring-header');
```

to:

```js
      var header = card.querySelector('.spring-header, header.spring-header');
```

and change:

```js
      var panel = card.querySelector(':scope > .spring-panel');
```

to:

```js
      var panel = card.querySelector('.spring-panel');
```

This is a strict superset of the old behavior — a direct child still matches a plain descendant selector — so any other page using `[data-spring]` (e.g. the `#experience` exp-cards, or the sentinel fixture at the bottom of `index.html`) keeps working exactly as before.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/recent-work-smoke.test.js`
Expected: `# pass 2`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add assets/js/spring-card.js tests/recent-work-smoke.test.js
git commit -m "fix: spring-card.js finds header/panel as descendants, not just direct children"
```

---

### Task 3: Add `research-card-link.js` (whole-card click-through)

**Files:**
- Create: `assets/js/research-card-link.js`
- Modify: `tests/recent-work-smoke.test.js` (append)

**Interfaces:**
- Consumes: nothing new (works on any `.research-card` element already in the DOM).
- Produces: clicking anywhere on a `.research-card` that isn't a real `<a>` or `<button>` opens that card's primary link (`:scope > a.image` or `:scope > h3 a`, whichever is found first) in a new tab. Task 4's `<script src="assets/js/research-card-link.js" defer>` tag depends on this file existing at this path.

- [ ] **Step 1: Write the failing test**

Append to `tests/recent-work-smoke.test.js`:

```js
test("research-card-link.js exists and wires whole-card click-through", async () => {
  const { status, text } = await getText("/assets/js/research-card-link.js");
  assert.equal(status, 200, "research-card-link.js must return 200");
  assert.ok(find(text, ".research-card"), "targets .research-card");
  assert.ok(find(text, "closest('a, button')"), "ignores clicks on real links/buttons");
  assert.ok(find(text, "window.open"), "opens the primary link in a new tab");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/recent-work-smoke.test.js`
Expected: FAIL — `assets/js/research-card-link.js` returns 404.

- [ ] **Step 3: Create the file**

Create `assets/js/research-card-link.js`:

```js
/* ============================================================
   research-card-link.js
   Makes an entire .research-card clickable: navigates to the card's
   primary link (its thumbnail or title anchor's href) unless the
   click landed on a real <a> or <button> descendant, which keeps
   handling its own behavior (icon links, the spring-header Details
   toggle). Idempotent.
   ============================================================ */
(function () {
  'use strict';

  var SELECTOR = '.research-card';

  function primaryHref(card) {
    var link = card.querySelector(':scope > a.image, :scope > h3 a');
    return link ? link.href : null;
  }

  function attach(card) {
    var href = primaryHref(card);
    if (!href) return;

    card.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return;
      window.open(href, '_blank', 'noopener');
    });
  }

  function init() {
    var cards = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < cards.length; i++) attach(cards[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/recent-work-smoke.test.js`
Expected: `# pass 3`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add assets/js/research-card-link.js tests/recent-work-smoke.test.js
git commit -m "feat: add whole-card click-through for research cards"
```

---

### Task 4: Rebuild the Recent Work markup in `index.html`

**Files:**
- Modify: `index.html` (the `<head>` stylesheet links, the `<div class="recent-work-list">...</div>` block inside `<section id="two">`, and the closing `<script>` tags)
- Modify: `tests/recent-work-smoke.test.js` (append)

**Interfaces:**
- Consumes: `assets/js/spring-card.js` (Task 2), `assets/js/research-card-link.js` (Task 3), `research/kdd26/ARIA-KDD2026.pdf` (Task 1), `assets/css/blog.css` (existing, unmodified).
- Produces: 8 `article.glass-card.research-card` elements inside `.recent-work-list`, which Task 5's CSS targets.

- [ ] **Step 1: Write the failing tests**

Append to `tests/recent-work-smoke.test.js`:

```js
function twoSectionHtml(html) {
  return html.split('<section id="two">')[1].split('</section>')[0];
}

test("index.html links blog.css and the new research-card-link.js", async () => {
  const html = await getHtml();
  assert.ok(find(html, "assets/css/blog.css"), "blog.css linked");
  assert.ok(find(html, "assets/js/research-card-link.js"), "research-card-link.js included");
});

test("Recent Work has exactly 8 glass research cards", async () => {
  const html = await getHtml();
  const count = (html.match(/class="glass-card research-card"/g) || []).length;
  assert.equal(count, 8, "exactly 8 .research-card entries");
});

test("Recent Work no longer uses the old row/row-body layout or placeholder links", async () => {
  const html = await getHtml();
  const two = twoSectionHtml(html);
  assert.ok(!find(two, 'class="col-3 col-12-small"'), "old col-3 image column removed");
  assert.ok(!find(two, 'row-body'), "old row-body wrapper removed");
  assert.ok(!find(two, "PDF (Coming Soon)"), "no more placeholder PDF text");
  assert.ok(!find(two, "Code (Coming Soon)"), "no more placeholder Code text");
});

test("ARIA card links to its real PDF and GitHub, not the old placeholder project page", async () => {
  const html = await getHtml();
  const two = twoSectionHtml(html);
  assert.ok(find(two, "research/kdd26/ARIA-KDD2026.pdf"), "ARIA PDF linked");
  assert.ok(find(two, "github.com/yicao-elina/LLM4Chem-Explainable-synthesis"), "ARIA GitHub linked");
  assert.ok(!find(two, 'href="research/kdd26/"'), "old placeholder project-page link removed");
});

test("Exactly 5 research cards have a Details toggle", async () => {
  const html = await getHtml();
  const two = twoSectionHtml(html);
  const toggleCount = (two.match(/class="spring-header row-header-toggle"/g) || []).length;
  assert.equal(toggleCount, 5, "RepliCan, ARIA, DUAL-X, Qualcomm, Viva have Details; the other 3 do not");
});

test("Self-Healing Perovskites card includes its LinkedIn post link", async () => {
  const html = await getHtml();
  const two = twoSectionHtml(html);
  assert.ok(find(two, "yi-cao-1368ab292_low-energy-pathways-lead-to-self-healing-activity-7347982325105737729-CBUi"), "LinkedIn post link present");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/recent-work-smoke.test.js`
Expected: the 6 new tests FAIL (old markup still in place); the 3 from Tasks 1-3 still PASS.

- [ ] **Step 3: Link `blog.css` in `<head>`**

In `index.html`, change:

```html
<link rel="stylesheet" href="assets/css/hero.css" />
<link rel="stylesheet" href="assets/css/main-override.css" />
<link rel="stylesheet" href="assets/css/header.css" />
```

to:

```html
<link rel="stylesheet" href="assets/css/hero.css" />
<link rel="stylesheet" href="assets/css/main-override.css" />
<link rel="stylesheet" href="assets/css/header.css" />
<link rel="stylesheet" href="assets/css/blog.css" />
```

- [ ] **Step 4: Replace the `<div class="recent-work-list">...</div>` block**

Find the block starting at `<div class="recent-work-list">` and ending at its matching `</div>` (currently holding the 8 `<div class="row" ...>` entries) inside `<section id="two">`, and replace the entire block with:

```html
<div class="recent-work-list">

    <!-- 1: RepliCan (COLM 2026) -->
    <article class="glass-card research-card" data-tilt data-spotlight data-spring>
        <a class="image fit thumb" href="https://openreview.net/forum?id=SK5NpcSf9f" target="_blank" rel="noopener">
            <img src="images/thumbs/replican-paper.png" alt="RepliCan" />
        </a>
        <h3><a href="https://openreview.net/forum?id=SK5NpcSf9f" target="_blank" rel="noopener">RepliCan: Evaluating LLM Agents on Scientific Reproducibility in Computational Materials Science</a></h3>
        <p class="card-authors">Ziyang Huang, Yi Cao, Ali K. Shargh, Jing Luo, Ruidong Mei, Mohd Zaki, Zhan Liu, William Jurayj, Somdatta Goswami, Michael Shields, Jaafar El-Awady, Paulette Clancy, William Gantt Walden, Nicholas Andrews, Benjamin Van Durme, Daniel Khashabi</p>
        <p class="card-venue"><em>Accepted to COLM Conference (2026)</em> <span class="news-pill">Accepted</span></p>
        <p class="card-desc">Evaluating LLM agents on scientific reproducibility in computational materials science.</p>
        <div class="card-links">
            <a class="ah-icon" href="https://openreview.net/forum?id=SK5NpcSf9f" target="_blank" rel="noopener" data-tooltip="OpenReview"><i class="fas fa-book"></i><span class="ah-tooltip">OpenReview</span></a>
            <a class="ah-icon" href="https://arxiv.org/abs/2605.00803" target="_blank" rel="noopener" data-tooltip="arXiv"><i class="far fa-file-alt"></i><span class="ah-tooltip">arXiv</span></a>
            <a class="ah-icon" href="https://jhu-clsp.github.io/AutoMat/" target="_blank" rel="noopener" data-tooltip="Website"><i class="fas fa-globe"></i><span class="ah-tooltip">Website</span></a>
            <a class="ah-icon" href="https://github.com/JHU-CLSP/AutoMat" target="_blank" rel="noopener" data-tooltip="GitHub"><i class="fab fa-github"></i><span class="ah-tooltip">GitHub</span></a>
            <a class="ah-icon" href="https://www.linkedin.com/feed/update/urn:li:activity:7464350390478651392/" target="_blank" rel="noopener" data-tooltip="LinkedIn"><i class="fab fa-linkedin-in"></i><span class="ah-tooltip">LinkedIn</span></a>
        </div>
        <button class="spring-header row-header-toggle" type="button" aria-label="Toggle paper details"><span class="chev">▸</span> Details</button>
        <div class="spring-panel">
            <p><strong>Abstract.</strong> RepliCan is a benchmark for evaluating LLM agents on scientific reproducibility in computational materials science. Agents receive the artifacts of a published paper and must reproduce the reported result; we score both fidelity and faithfulness to the original workflow.</p>
            <p><strong>Why it matters.</strong> The first benchmark to put LLM "reproducibility" under the same microscope for materials science that we already use for ML benchmarks.</p>
        </div>
    </article>

    <!-- 2: ARIA (KDD 2026) -->
    <article class="glass-card research-card" data-tilt data-spotlight data-spring>
        <a class="image fit thumb" href="research/kdd26/ARIA-KDD2026.pdf" target="_blank" rel="noopener">
            <img src="images/thumbs/aria-paper.png" alt="ARIA" />
        </a>
        <h3><a href="research/kdd26/ARIA-KDD2026.pdf" target="_blank" rel="noopener">ARIA: A Causal-Aware Framework for Rescuing LLM Reasoning in Trustworthy Materials Discovery</a></h3>
        <p class="card-authors">Yi Cao, Liaoyaqi Wang, Jieneng Chen, Benjamin Van Durme, Alan Yuille, Paulette Clancy*</p>
        <p class="card-venue"><em>Accepted to KDD Conference, AI4Sciences Track (2026)</em> <span class="news-pill">Accepted</span></p>
        <p class="card-desc">Causal-aware KG-LLM integration framework that mitigates "contextual tunneling" and improves scientific reasoning.</p>
        <div class="card-links">
            <a class="ah-icon" href="research/kdd26/ARIA-KDD2026.pdf" target="_blank" rel="noopener" data-tooltip="PDF"><i class="far fa-file-pdf"></i><span class="ah-tooltip">PDF</span></a>
            <a class="ah-icon" href="https://github.com/yicao-elina/LLM4Chem-Explainable-synthesis.git" target="_blank" rel="noopener" data-tooltip="GitHub"><i class="fab fa-github"></i><span class="ah-tooltip">GitHub</span></a>
            <a class="ah-icon" href="https://kdd2026.kdd.org/" target="_blank" rel="noopener" data-tooltip="KDD 2026"><i class="fas fa-globe"></i><span class="ah-tooltip">KDD 2026</span></a>
        </div>
        <button class="spring-header row-header-toggle" type="button" aria-label="Toggle paper details"><span class="chev">▸</span> Details</button>
        <div class="spring-panel">
            <p><strong>Abstract.</strong> ARIA (Adaptive Reasoning with Interpreted Atoms) is a causal-aware framework for rescuing LLM reasoning in trustworthy materials discovery. It combines rigid knowledge-graph retrieval, a contextual-tower contextualization module, and a tiered fallback hierarchy (Direct Match → Analogical → Fallback) to keep LLM suggestions chemically grounded.</p>
            <p><strong>Why it matters.</strong> Born out of the 2025 LLM Hackathon Visionary Award, ARIA is the first framework to combine KG retrieval with causal-aware hierarchical reasoning for materials science.</p>
        </div>
    </article>

    <!-- 3: DUAL-X (AAAI 2026) -->
    <article class="glass-card research-card" data-tilt data-spotlight data-spring data-spring-default-open="true">
        <a class="image fit thumb" href="https://openreview.net/forum?id=K95Tt6fYud" target="_blank" rel="noopener">
            <img src="images/thumbs/06-Material-Explanable-AI-thumb.png" alt="DUAL-X" />
        </a>
        <h3><a href="https://openreview.net/forum?id=K95Tt6fYud" target="_blank" rel="noopener">What is Your Force Field Really Learning? Gaining Scientific Intuition with a Dual-Level Explainability Framework</a></h3>
        <p class="card-authors">Yi Cao, Peter Mastracco, Jieneng Chen, Alan Yuille, Paulette Clancy*</p>
        <p class="card-venue"><em>AAAI Conference Workshop (XAI4Science), Spotlight (2026)</em></p>
        <p class="card-desc">Dual-level explainability framework bridging model reasoning with human understanding in scientific AI.</p>
        <div class="card-links">
            <a class="ah-icon" href="https://openreview.net/forum?id=K95Tt6fYud" target="_blank" rel="noopener" data-tooltip="OpenReview"><i class="fas fa-book"></i><span class="ah-tooltip">OpenReview</span></a>
            <a class="ah-icon" href="images/blog/DUALX-teaser.pdf" target="_blank" rel="noopener" data-tooltip="PDF"><i class="far fa-file-pdf"></i><span class="ah-tooltip">PDF</span></a>
            <a class="ah-icon" href="https://xai4science.github.io/" target="_blank" rel="noopener" data-tooltip="XAI4Science"><i class="fas fa-globe"></i><span class="ah-tooltip">XAI4Science</span></a>
        </div>
        <button class="spring-header row-header-toggle" type="button" aria-label="Toggle paper details"><span class="chev">▸</span> Details</button>
        <div class="spring-panel">
            <p><strong>Abstract.</strong> We present DUAL-X, a closed-loop optimization framework that integrates interpretable, human-centric rationale extraction with gradient-based attribution to give MLFF (machine-learned force field) predictions a SHAP-like audit trail — connecting atomic-position contribution scores back to chemically meaningful descriptors (SOAP, SNAP, environment descriptors).</p>
            <p><strong>Why it matters.</strong> The AAAI 2026 XAI4Science track spotlights methods that open the "black box" for scientific ML; DUAL-X is the first framework to ship a practical, end-to-end XAI recipe for materials MD models.</p>
        </div>
    </article>

    <!-- 4: Migration (NeurIPS 2025 AI4Mat) -->
    <article class="glass-card research-card" data-tilt data-spotlight>
        <a class="image fit thumb" href="https://openreview.net/forum?id=RnITjvwxke" target="_blank" rel="noopener">
            <img src="images/thumbs/03-2D-material.jpg" alt="Migration benchmark" />
        </a>
        <h3><a href="https://openreview.net/forum?id=RnITjvwxke" target="_blank" rel="noopener">Migration as a Probe: A Generalizable Benchmark Framework for Specialist vs. Generalist Machine-Learned Force Fields</a></h3>
        <p class="card-authors">Yi Cao and Paulette Clancy*</p>
        <p class="card-venue"><em>NeurIPS Conference Workshop (AI4Mat), Spotlight (2025)</em></p>
        <p class="card-desc">Comprehensive benchmarking framework for evaluating MLFF generalization in materials science.</p>
        <div class="card-links">
            <a class="ah-icon" href="https://openreview.net/forum?id=RnITjvwxke" target="_blank" rel="noopener" data-tooltip="OpenReview"><i class="fas fa-book"></i><span class="ah-tooltip">OpenReview</span></a>
            <a class="ah-icon" href="https://arxiv.org/abs/2509.00090" target="_blank" rel="noopener" data-tooltip="arXiv"><i class="far fa-file-alt"></i><span class="ah-tooltip">arXiv</span></a>
            <a class="ah-icon" href="https://github.com/yicao-elina/MigrationBench" target="_blank" rel="noopener" data-tooltip="GitHub"><i class="fab fa-github"></i><span class="ah-tooltip">GitHub</span></a>
            <a class="ah-icon" href="https://www.linkedin.com/posts/yi-cao-1368ab292_neurips2025-ai4science-ai4mat-activity-7403636953461719040-FNeY?utm_source=share&amp;utm_medium=member_desktop&amp;rcm=ACoAAEb3tPoBgmt_8xQYwQpEY2DbQllFRcSwlU4" target="_blank" rel="noopener" data-tooltip="LinkedIn"><i class="fab fa-linkedin-in"></i><span class="ah-tooltip">LinkedIn</span></a>
        </div>
    </article>

    <!-- 5: Atomic Switch (under review) -->
    <article class="glass-card research-card" data-tilt data-spotlight>
        <a class="image fit thumb" href="https://yicao-elina.github.io/ClancyLab-Thermoelectrics/" target="_blank" rel="noopener">
            <img src="images/thumbs/02-Thermoelctric-thumb.png" alt="Atomic Switch" />
        </a>
        <h3><a href="https://yicao-elina.github.io/ClancyLab-Thermoelectrics/" target="_blank" rel="noopener">Atomic Switch Control via Two-Mode Intercalation for Tunable 2D Materials</a></h3>
        <p class="card-authors">Yi Cao, Victor Wu, and Paulette Clancy*</p>
        <p class="card-venue"><em>npj 2D Materials and Applications, Under Review (2025)</em></p>
        <p class="card-desc">Investigating two-mode intercalation for tunable electronic properties in 2D materials.</p>
        <div class="card-links">
            <a class="ah-icon" href="https://yicao-elina.github.io/ClancyLab-Thermoelectrics/" target="_blank" rel="noopener" data-tooltip="Website"><i class="fas fa-globe"></i><span class="ah-tooltip">Website</span></a>
        </div>
    </article>

    <!-- 6: Self-Healing Perovskites -->
    <article class="glass-card research-card" data-tilt data-spotlight>
        <a class="image fit thumb" href="https://doi.org/10.1039/D5CP01641J" target="_blank" rel="noopener">
            <img src="images/thumbs/01-Defect-thumb.png" alt="Self-Healing Perovskites" />
        </a>
        <h3><a href="https://doi.org/10.1039/D5CP01641J" target="_blank" rel="noopener">Low-energy pathways lead to self-healing defects in CsPbBr₃</a></h3>
        <p class="card-authors">Kumar Miskin, Yi Cao, Madaline Marland, Farhan Shaikh, David T. Moore, John Marohn, Paulette Clancy*</p>
        <p class="card-venue"><em>Phys. Chem. Chem. Phys., 27(29), 15446-15459 (2025)</em></p>
        <p class="card-desc">Computational discovery of self-healing mechanisms with implications for rational material design.</p>
        <div class="card-links">
            <a class="ah-icon" href="https://doi.org/10.1039/D5CP01641J" target="_blank" rel="noopener" data-tooltip="DOI"><i class="fas fa-book"></i><span class="ah-tooltip">DOI</span></a>
            <a class="ah-icon" href="https://github.com/pclancy-lab/perovskites_space.git" target="_blank" rel="noopener" data-tooltip="GitHub"><i class="fab fa-github"></i><span class="ah-tooltip">GitHub</span></a>
            <a class="ah-icon" href="https://www.linkedin.com/posts/yi-cao-1368ab292_low-energy-pathways-lead-to-self-healing-activity-7347982325105737729-CBUi" target="_blank" rel="noopener" data-tooltip="LinkedIn"><i class="fab fa-linkedin-in"></i><span class="ah-tooltip">LinkedIn</span></a>
        </div>
    </article>

    <!-- 7: Qualcomm GPU Agentic Workflow -->
    <article class="glass-card research-card" data-tilt data-spotlight data-spring>
        <a class="image fit thumb" href="https://www.linkedin.com/feed/update/urn:li:activity:7437471139364343808/" target="_blank" rel="noopener">
            <img src="images/qualcomm-intern.jpeg" alt="Qualcomm GPU Agentic Workflow" />
        </a>
        <h3><a href="https://www.linkedin.com/feed/update/urn:li:activity:7437471139364343808/" target="_blank" rel="noopener">Qualcomm GPU Agentic Workflow</a></h3>
        <p class="card-authors">Yi Cao</p>
        <p class="card-venue"><em>Engineering Intern, GPU High-Level Modeling &middot; Qualcomm, San Diego, CA &middot; May - Aug 2026</em></p>
        <p class="card-desc">Knowledge-graph-assisted, agentic causal reasoning workflow for the GPU High-Level Modeling team.</p>
        <div class="card-links">
            <a class="ah-icon" href="https://www.linkedin.com/feed/update/urn:li:activity:7437471139364343808/" target="_blank" rel="noopener" data-tooltip="LinkedIn"><i class="fab fa-linkedin-in"></i><span class="ah-tooltip">LinkedIn</span></a>
            <a class="ah-icon" href="https://www.qualcomm.com" target="_blank" rel="noopener" data-tooltip="Qualcomm"><i class="fas fa-globe"></i><span class="ah-tooltip">Qualcomm</span></a>
        </div>
        <button class="spring-header row-header-toggle" type="button" aria-label="Toggle details"><span class="chev">▸</span> Details</button>
        <div class="spring-panel">
            <p><strong>What I built.</strong> A knowledge-graph-assisted, agentic causal reasoning workflow for the GPU High-Level Modeling team. The workflow ingests heterogeneous sources (papers, design docs, internal wikis), extracts a typed causal graph, and answers engineering questions with explainable evidence paths.</p>
            <p><strong>Stack.</strong> Python, LangGraph, NetworkX, a custom entity-resolution layer over our internal docs index, and a ReAct-style agent that ranks candidate evidence paths by causal distance to the question.</p>
        </div>
    </article>

    <!-- 8: Viva Biotech CADD -->
    <article class="glass-card research-card" data-tilt data-spotlight data-spring>
        <a class="image fit thumb" href="https://www.vivabiotech.com" target="_blank" rel="noopener">
            <img src="images/thumbs/viva-yi.png" alt="Viva Biotech CADD" />
        </a>
        <h3><a href="https://www.vivabiotech.com" target="_blank" rel="noopener">Viva Biotech CADD</a></h3>
        <p class="card-authors">Yi Cao</p>
        <p class="card-venue"><em>Computational Drug Design Intern &middot; Viva Biotech, Shanghai, China &middot; Jun - Jul 2024</em></p>
        <p class="card-desc">Co-solvent MD + protein-ligand analysis pipeline for early-stage drug discovery.</p>
        <div class="card-links">
            <a class="ah-icon" href="https://www.vivabiotech.com" target="_blank" rel="noopener" data-tooltip="Website"><i class="fas fa-globe"></i><span class="ah-tooltip">Website</span></a>
        </div>
        <button class="spring-header row-header-toggle" type="button" aria-label="Toggle details"><span class="chev">▸</span> Details</button>
        <div class="spring-panel">
            <p><strong>What I built.</strong> A co-solvent MD + protein-ligand analysis pipeline for early-stage drug discovery. The pipeline screens co-solvent choices by predicted protein-ligand binding affinity shifts, with a parallel workflow for ADMET-style property checks on the candidate ligands.</p>
            <p><strong>Stack.</strong> GROMACS, MDAnalysis, scikit-learn for the affinity-shift predictor, and an internal dashboard for chemists to inspect MD trajectories and binding-pocket hotspots.</p>
        </div>
    </article>

</div>
```

- [ ] **Step 5: Add the new script tag**

Near the bottom of `index.html`, change:

```html
<script src="assets/js/header-tooltip.js" defer></script>
<script src="assets/js/spring-card.js" defer></script>
```

to:

```html
<script src="assets/js/header-tooltip.js" defer></script>
<script src="assets/js/blog-tilt.js" defer></script>
<script src="assets/js/blog-spotlight.js" defer></script>
<script src="assets/js/spring-card.js" defer></script>
<script src="assets/js/research-card-link.js" defer></script>
```

(`blog-tilt.js`/`blog-spotlight.js` are the existing, already-generic scripts from `blog.html` — they bind to any `[data-tilt]`/`[data-spotlight]` element on the page, which is why the new cards use those same attributes.)

- [ ] **Step 6: Run tests to verify they pass**

Run: `node --test tests/recent-work-smoke.test.js`
Expected: `# pass 9`, `# fail 0`

- [ ] **Step 7: Commit**

```bash
git add index.html tests/recent-work-smoke.test.js
git commit -m "feat: rebuild Recent Work as glass research cards with icon links"
```

---

### Task 5: Rewrite the Recent Work CSS in `main-override.css`

**Files:**
- Modify: `assets/css/main-override.css:195-242` (Recent work grid + old `.row` rules)
- Modify: `assets/css/main-override.css:369-372` (dead mobile `.row` override, inside the `@media screen and (max-width: 768px)` block)
- Modify: `assets/css/main-override.css:400-455` (spring header/panel rules, currently scoped to `.row`)
- Modify: `assets/css/main-override.css:463-465` (stale comment referencing the old `.row` thumb rules)
- Modify: `tests/recent-work-smoke.test.js` (append)

**Interfaces:**
- Consumes: `.research-card`/`.card-authors`/`.card-venue`/`.card-desc`/`.card-links` classes from Task 4's markup; `.ah-icon`/`.ah-tooltip` from `header.css` (unmodified, already generic); `.glass-card` from `blog.css` (unmodified, linked in Task 4).
- Produces: final visual styling. No later task consumes new CSS class names from this task.

- [ ] **Step 1: Write the failing test**

Append to `tests/recent-work-smoke.test.js`:

```js
test("main-override.css no longer scopes Recent Work rules to the old .row class", async () => {
  const { text } = await getText("/assets/css/main-override.css");
  assert.ok(!find(text, ".recent-work-list .row"), "old .row-scoped Recent Work rules removed");
  assert.ok(find(text, ".recent-work-list .research-card"), "new .research-card-scoped rules present");
  assert.ok(find(text, "repeat(auto-fit, minmax(320px, 1fr))"), "2-up auto-fit grid present");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/recent-work-smoke.test.js`
Expected: FAIL — old `.row`-scoped rules are still present, new grid rule isn't.

- [ ] **Step 3: Replace the "Recent work (#two): paper entries" block**

In `assets/css/main-override.css`, change (lines 195-242):

```css
/* ---------- Recent work (#two): paper entries ---------- */

.recent-work-list {
  display: grid;
  gap: 24px;
  margin-top: 1.5em;
}

.recent-work-list .row {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(20, 30, 45, 0.08);
  border-radius: 18px;
  padding: 28px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 24px -12px rgba(20, 30, 45, 0.12);
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 28px;
  align-items: start;
}

.recent-work-list .row > a:first-child {
  display: block;
  border-radius: 12px;
  overflow: hidden;
  border: 0;
}

.recent-work-list .row > a:first-child img {
  width: 100%;
  display: block;
  border-radius: 12px;
}

.recent-work-list h3 {
  margin: 0 0 6px;
  color: #141e2d;
  font-size: 1.3em;
}

.recent-work-list h4 {
  margin: 0 0 12px;
  color: #2a8a6e;
  font-size: 0.95em;
  font-weight: 600;
  letter-spacing: 0.01em;
}
```

to:

```css
/* ---------- Recent work (#two): glass research cards ---------- */

.recent-work-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 1.5em;
}

.research-card .card-authors {
  margin: 0 0 6px;
}

.research-card .card-venue {
  margin: 0 0 8px;
  font-size: 0.9em;
}

.research-card .card-desc {
  margin: 0 0 12px;
  font-size: 0.9em;
  color: #666;
}

.research-card .card-links {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 0 0 10px;
}

.research-card .ah-icon {
  width: 28px;
  height: 28px;
  font-size: 15px;
}
```

(`.recent-work-list h3`/`h4` are dropped — `.glass-card h3` from `blog.css` already styles the title, and no card uses an `h4` anymore.)

- [ ] **Step 4: Remove the dead mobile override**

In the `@media screen and (max-width: 768px)` block, change:

```css
  #main h2,
  #main header.major h2 { font-size: 1.7em; }

  .recent-work-list .row {
    grid-template-columns: 1fr;
    padding: 20px;
  }
}
```

to:

```css
  #main h2,
  #main header.major h2 { font-size: 1.7em; }
}
```

(The `repeat(auto-fit, minmax(320px, 1fr))` grid from Step 3 already collapses to one column on narrow viewports on its own — no media query needed.)

- [ ] **Step 5: Rescope the spring header/panel rules from `.row` to `.research-card`**

Change:

```css
/* ---------- Recent Work (#two): bumped thumbs + spring header ---------- */

.recent-work-list .row {
  cursor: pointer;
}
.recent-work-list .row.spring-open {
  background: rgba(255, 255, 255, 0.82);   /* slightly stronger glass when open */
}
.recent-work-list .row > a:first-child img,
.recent-work-list .row .col-3 a img,
.recent-work-list .row .col-3 .image.fit > img {
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

to:

```css
/* ---------- Recent Work (#two): spring header + panel on research cards ---------- */

.recent-work-list .research-card[aria-expanded="true"] {
  background: rgba(255, 255, 255, 0.82);   /* slightly stronger glass when open */
}
.recent-work-list .research-card .row-header-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-text);
  font-size: 13px;
  color: var(--mint);
  margin: 0 0 12px;
  text-decoration: none;
  border: 0;
  background: none;
  cursor: pointer;
  padding: 0;
}
.recent-work-list .research-card .row-header-toggle:hover { color: var(--mint-bright); }
.recent-work-list .research-card .row-header-toggle .chev {
  display: inline-block;
  transition: transform 200ms var(--ease-spring);
}
.recent-work-list .research-card[aria-expanded="true"] .row-header-toggle .chev { transform: rotate(90deg); }
.recent-work-list .research-card .spring-panel {
  padding-top: 16px;
  border-top: 1px solid var(--glass-border-strong);
  color: var(--graphite);
  font-size: 15px;
  line-height: 1.6;
}
.recent-work-list .research-card .spring-panel p { margin: 0 0 12px; }
```

Notes on what changed and why:
- Dropped the `.row > a:first-child img` / `.col-3 …` thumb-sizing overrides — `blog.css`'s `.glass-card .image.fit.thumb img` (16:10 `aspect-ratio`, `object-fit: cover`, edge-to-edge bleed) already handles this for the new cards.
- Dropped `.row > .row-body { min-width: 0; }` — there is no `.row-body` wrapper anymore; cards are flat, `.glass-card`'s own `display: flex; flex-direction: column` handles the internal layout.
- Fixed a pre-existing latent bug along the way: `.row.spring-open` was never actually toggled by `spring-card.js` (it sets the `aria-expanded` attribute, not a `.spring-open` class), so that "stronger glass when open" background never applied. Replaced with the `[aria-expanded="true"]` attribute selector that `spring-card.js` actually sets.
- Dropped `grid-column: 1 / -1` on `.spring-panel` — the old `.row` was itself a 2-column CSS grid (image | text), so the panel needed to span both columns. `.research-card` is a single-column flex column, so there's no second column to span.

- [ ] **Step 6: Update the stale comment above the Work Gallery thumb rules**

In the comment above `#three .image.fit`, change:

```css
   NOTE: scoped to #three (the Strata work gallery) and any section
   that uses the .col-3 / .col-9 row pattern, NOT the redesigned
   .recent-work-list .row which has its own thumb rules in Task 4. */
```

to:

```css
   NOTE: scoped to #three (the Strata work gallery) and any section
   that uses the .col-3 / .col-9 row pattern, NOT the Recent Work
   .research-card cards, which get their thumb sizing from
   .glass-card in blog.css instead. */
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `node --test tests/recent-work-smoke.test.js`
Expected: `# pass 10`, `# fail 0`

- [ ] **Step 8: Commit**

```bash
git add assets/css/main-override.css tests/recent-work-smoke.test.js
git commit -m "style: rewrite Recent Work CSS for the 2-up glass card grid"
```

---

### Task 6: Manual browser verification and final full test run

**Files:** none (verification only)

**Interfaces:** none.

- [ ] **Step 1: Ensure the local static server is running**

```bash
curl -sI http://127.0.0.1:8123/index.html | head -1
```

Expected: `HTTP/1.0 200 OK`. If not running:

```bash
python3 -m http.server 8123 --directory /Users/alina/Documents/yicao-elina >/dev/null 2>&1 &
```

- [ ] **Step 2: Open the page and confirm the 2-column grid**

Use the chrome-devtools MCP tools (`mcp__plugin_ecc_chrome-devtools__new_page`, `navigate_page`, `evaluate_script`, `take_screenshot`):

```
new_page → http://127.0.0.1:8123/index.html
evaluate_script:
  () => {
    const grid = document.querySelector('.recent-work-list');
    const cards = grid.querySelectorAll('.research-card');
    return { cardCount: cards.length, columns: getComputedStyle(grid).gridTemplateColumns };
  }
```

Expected: `cardCount: 8`, `columns` shows two (or more, on very wide viewports) track values — not a single-column value.

- [ ] **Step 3: Confirm the Details toggle actually expands and collapses**

```
evaluate_script:
  () => {
    const card = document.querySelector('.research-card[aria-expanded]');
    card.scrollIntoView({ block: 'center' });
    return card.getAttribute('aria-expanded');
  }
```

Expected: `"false"` initially. Then click the card's "Details" button (use `computer` click at its on-screen coordinates, found via a screenshot or `find`), and re-run the same script.

Expected: `aria-expanded` is now `"true"`, and a screenshot shows the abstract/"why it matters" (or "What I built"/"Stack") text visible below the icon row. Click Details again and confirm it collapses back to `"false"` with the text hidden.

- [ ] **Step 4: Confirm whole-card click-through**

```
evaluate_script:
  () => {
    const card = document.querySelectorAll('.research-card')[3]; // Migration card, no Details button
    const rect = card.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + 40 };
  }
```

Click at that point using `computer` (`left_click`), landing on empty card space (not the icon row, not the title link). Confirm a new tab opens to `https://openreview.net/forum?id=RnITjvwxke` (the Migration card's primary link). Close the new tab.

- [ ] **Step 5: Confirm icon clicks don't double-navigate**

Click one of the small icon links (e.g. the GitHub icon on the RepliCan card). Confirm exactly one new tab opens, to `https://github.com/JHU-CLSP/AutoMat` — not two tabs, and not the card's primary OpenReview link.

- [ ] **Step 6: Confirm mobile collapse to 1 column**

```
mcp__plugin_ecc_chrome-devtools__resize_page → width: 400, height: 800
evaluate_script:
  () => getComputedStyle(document.querySelector('.recent-work-list')).gridTemplateColumns
```

Expected: a single track value (one column).

- [ ] **Step 7: Confirm the renamed ARIA PDF opens**

Resize back to a desktop width, click the ARIA card's PDF icon (or the card body itself, since PDF is its primary link). Confirm a new tab opens `research/kdd26/ARIA-KDD2026.pdf` and it renders as a valid PDF (not a 404).

- [ ] **Step 8: Run the full test suite**

```bash
node --test tests/*.test.js
```

Expected: all suites pass, including the new `tests/recent-work-smoke.test.js` (10 tests) alongside the pre-existing `hero-smoke.test.js`, `blog-smoke.test.js`, `blog-timeline.test.js`, `blog-write.test.js`.

- [ ] **Step 9: Stop the local test server**

```bash
pkill -f "http.server 8123"
```

No commit for this task — it's verification-only. If any step in Task 6 surfaces a bug, fix it in the relevant earlier task's files, re-run that task's tests, and re-commit before continuing.
