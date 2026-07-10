// Smoke test for blog.html, aligned with the shared site template
// (tokens/main/header/main-override/blog.css + app-header + #main
// sections), matching index.html and presentations.html.
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

function classCount(html, className) {
  const classAttrs = html.match(/class="[^"]*"/g) || [];
  return classAttrs.filter((attr) => {
    const tokens = attr.slice('class="'.length, -1).split(/\s+/);
    return tokens.includes(className);
  }).length;
}

test("blog.html has a valid <head>-first document structure", async () => {
  const html = await getHtml();
  const htmlIdx = html.indexOf("<html>");
  const headIdx = html.indexOf("<head>");
  const bodyIdx = html.indexOf("<body");
  assert.ok(htmlIdx < headIdx && headIdx < bodyIdx, "<head> must come right after <html>, before <body>");
  assert.ok(!find(html, '<nav id="nav">'), "legacy <nav id=\"nav\"> text menu is removed");
});

test("blog.html links the full shared stylesheet stack", async () => {
  const html = await getHtml();
  for (const href of [
    "assets/css/tokens.css",
    "assets/css/main.css",
    "assets/css/header.css",
    "assets/css/main-override.css",
    "assets/css/blog.css",
  ]) {
    assert.ok(find(html, href), href + " linked");
  }
});

test("blog.html uses the shared floating glass app-header, not the old avatar header", async () => {
  const html = await getHtml();
  assert.ok(find(html, 'id="app-header"'), "app-header present");
  assert.ok(find(html, 'class="app-header"'), "app-header class present");
  assert.ok(/href="blog\.html" aria-current="page"/.test(html), "Blog icon marked as the current page");
  assert.ok(!find(html, '<header id="header">'), "old avatar <header id=\"header\"> is removed");
});

test("blog.html wraps content in #main with the mesh backdrop", async () => {
  const html = await getHtml();
  assert.ok(find(html, 'class="blog-mesh"'), ".blog-mesh div present");
  assert.ok(find(html, 'id="main"'), "#main wrapper present");
});

test("blog.html has 8 glass cards (article grids) with tilt and spotlight", async () => {
  const html = await getHtml();
  const glassCount = classCount(html, "glass-card") - 2; // exclude the 2 snippet-cards, counted separately
  assert.equal(glassCount, 8, "exactly 8 article .glass-card elements");
  assert.ok(!find(html, 'class="work-item"'), "old .work-item class is removed");
  assert.ok(/class="[^"]*\bglass-card\b[^"]*"[^>]*data-tilt/.test(html), "glass card has data-tilt");
  assert.ok(/class="[^"]*\bglass-card\b[^"]*"[^>]*data-spotlight/.test(html), "glass card has data-spotlight");
});

test("blog.html has 2 meta-tiles with tilt and spotlight", async () => {
  const html = await getHtml();
  const tileCount = classCount(html, "meta-tile");
  assert.equal(tileCount, 2, "exactly 2 .meta-tile elements");
  assert.ok(/class="[^"]*\bmeta-tile\b[^"]*"[^>]*data-tilt/.test(html), "meta-tile has data-tilt");
  assert.ok(/class="[^"]*\bmeta-tile\b[^"]*"[^>]*data-spotlight/.test(html), "meta-tile has data-spotlight");
  assert.ok(/data-cat="technical"/.test(html), "Technical meta-tile has data-cat");
  assert.ok(/data-cat="life"/.test(html), "Life meta-tile has data-cat");
});

test("blog.html has a timeline with 3 filter chips and 8 rows", async () => {
  const html = await getHtml();
  const chipCount = (html.match(/data-filter-chip/g) || []).length;
  assert.equal(chipCount, 3, "exactly 3 filter chips");
  assert.ok(/data-filter="all"/.test(html), "All chip present");
  assert.ok(/data-filter="technical"/.test(html), "Technical chip present");
  assert.ok(/data-filter="life"/.test(html), "Life chip present");
  const rowCount = classCount(html, "timeline-row");
  assert.equal(rowCount, 8, "exactly 8 timeline rows");
  const techRows = (html.match(/data-cat="technical"/g) || []).length;
  const lifeRows = (html.match(/data-cat="life"/g) || []).length;
  assert.ok(techRows >= 4, "at least 4 technical rows");
  assert.ok(lifeRows >= 4, "at least 4 life rows");
});

test("blog.html has 2 code snippet cards styled as glass cards, not raw inline styles", async () => {
  const html = await getHtml();
  const snippetCount = classCount(html, "snippet-card");
  assert.equal(snippetCount, 2, "exactly 2 .snippet-card elements");
  assert.ok(!/style="background: ?#f5f5f5/.test(html), "old inline-styled snippet blocks are removed");
});

test("blog.html has a write tool with all 6 form fields", async () => {
  const html = await getHtml();
  for (const id of [
    "write-title",
    "write-date",
    "write-category",
    "write-tags",
    "write-summary",
    "write-body",
  ]) {
    assert.ok(html.includes('id="' + id + '"'), id + " form field present");
  }
  assert.ok(find(html, 'data-write-download'), "Download button has data-write-download");
  assert.ok(find(html, 'id="write-preview"'), "Live preview region present");
  assert.ok(find(html, 'aria-live="polite"'), "Live preview region is aria-live");
});

test("blog.html includes all required scripts", async () => {
  const html = await getHtml();
  for (const src of [
    "assets/js/jquery.min.js",
    "assets/js/marked.min.js",
    "assets/js/blog-timeline.js",
    "assets/js/blog-write.js",
    "assets/js/blog-tilt.js",
    "assets/js/blog-spotlight.js",
    "assets/js/blog-mesh.js",
    "assets/js/header-tooltip.js",
    "assets/js/reveal-on-scroll.js",
  ]) {
    assert.ok(find(html, src), src + " included");
  }
  assert.ok(find(html, 'id="footer"'), "footer still present");
});

test("marked.min.js exists, is non-empty, and contains the marked license header", async () => {
  const res = await fetch(BASE + "/assets/js/marked.min.js");
  assert.equal(res.status, 200, "marked.min.js must return 200");
  const body = await res.text();
  assert.ok(body.length > 1000, "marked.min.js is non-trivial in size");
  assert.ok(/MIT/.test(body) && /marked v12/.test(body), "marked.min.js has MIT license + v12 header");
});
