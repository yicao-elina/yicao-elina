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
