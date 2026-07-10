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
