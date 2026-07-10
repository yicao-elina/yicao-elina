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

test("blog.html has 2 meta-tiles with tilt and spotlight", async () => {
  const html = await getHtml();
  const tileCount = (html.match(/class="meta-tile"/g) || []).length;
  assert.equal(tileCount, 2, "exactly 2 .meta-tile elements");
  assert.ok(/class="meta-tile"[^>]*data-tilt/.test(html), "meta-tile has data-tilt");
  assert.ok(/class="meta-tile"[^>]*data-spotlight/.test(html), "meta-tile has data-spotlight");
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
  const rowCount = (html.match(/class="timeline-row"/g) || []).length;
  assert.equal(rowCount, 8, "exactly 8 timeline rows");
  const techRows = (html.match(/data-cat="technical"/g) || []).length;
  const lifeRows = (html.match(/data-cat="life"/g) || []).length;
  assert.ok(techRows >= 4, "at least 4 technical rows");
  assert.ok(lifeRows >= 4, "at least 4 life rows");
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

test("blog.html links the 3 new assets (marked, timeline, write)", async () => {
  const html = await getHtml();
  assert.ok(find(html, "assets/js/marked.min.js"), "marked.min.js linked");
  assert.ok(find(html, "assets/js/blog-timeline.js"), "blog-timeline.js linked");
  assert.ok(find(html, "assets/js/blog-write.js"), "blog-write.js linked");
});

test("blog.html has a 'Write' nav link", async () => {
  const html = await getHtml();
  assert.ok(/<a href="#write"[^>]*>Write<\/a>/.test(html), "'Write' nav link present");
});

test("marked.min.js exists, is non-empty, and contains the marked license header", async () => {
  const res = await fetch(BASE + "/assets/js/marked.min.js");
  assert.equal(res.status, 200, "marked.min.js must return 200");
  const body = await res.text();
  assert.ok(body.length > 1000, "marked.min.js is non-trivial in size");
  assert.ok(/MIT/.test(body) && /marked v12/.test(body), "marked.min.js has MIT license + v12 header");
});
