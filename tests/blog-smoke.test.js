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
