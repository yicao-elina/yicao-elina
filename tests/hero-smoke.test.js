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

// --- New assertions for the redesigned structure (Tasks 1-7) ---

test("index has app-header with 10 icons", async () => {
  const html = await (await fetch(BASE + "/")).text();
  assert.match(html, /<header[^>]*id="app-header"/);
  const icons = (html.match(/class="ah-icon"/g) || []).length;
  assert.ok(icons >= 10, `expected >=10 ah-icon elements, got ${icons}`);
});

test("index no longer has the old <nav id=\"nav\">", async () => {
  const html = await (await fetch(BASE + "/")).text();
  assert.doesNotMatch(html, /<nav id="nav">/);
});

test("index links header.css and tokens.css", async () => {
  const html = await (await fetch(BASE + "/")).text();
  assert.match(html, /href="assets\/css\/header\.css"/);
  assert.match(html, /href="assets\/css\/tokens\.css"/);
});

test("index has 2+ experience rows with data-spring", async () => {
  const html = await (await fetch(BASE + "/")).text();
  const rows = (html.match(/data-spring/g) || []).length;
  assert.ok(rows >= 2, `expected >=2 data-spring occurrences, got ${rows}`);
});

test("index has an #experience section with 2-col grid", async () => {
  const html = await (await fetch(BASE + "/")).text();
  assert.match(html, /id="experience"/);
  assert.match(html, /class="experience-grid"/);
});

test("index news strip has 3 news items + 1 read-more link to news.html", async () => {
  const html = await (await fetch(BASE + "/")).text();
  const items = (html.match(/class="news-item"/g) || []).length;
  assert.ok(items >= 3, `expected >=3 news-item elements, got ${items}`);
  assert.match(html, /href="news\.html"/);
});

test("news.html returns 200 and has a year filter", async () => {
  const res = await fetch(BASE + "/news.html");
  assert.equal(res.status, 200);
  const html = await res.text();
  const filters = (html.match(/class="news-filter"/g) || []).length;
  assert.ok(filters >= 3, `expected >=3 news-filter pills, got ${filters}`);
});

test("news.html has 6+ timeline entries", async () => {
  const html = await (await fetch(BASE + "/news.html")).text();
  const entries = (html.match(/class="news-entry"/g) || []).length;
  assert.ok(entries >= 6, `expected >=6 news-entry elements, got ${entries}`);
});

test("spring-card.js is served", async () => {
  const res = await fetch(BASE + "/assets/js/spring-card.js");
  assert.equal(res.status, 200);
  const body = await res.text();
  assert.match(body, /data-spring/);
});

test("header-tooltip.js is served", async () => {
  const res = await fetch(BASE + "/assets/js/header-tooltip.js");
  assert.equal(res.status, 200);
});

test("tokens.css is served", async () => {
  const res = await fetch(BASE + "/assets/css/tokens.css");
  assert.equal(res.status, 200);
});
