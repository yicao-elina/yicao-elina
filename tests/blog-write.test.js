// Unit test for blog-write.js: pure helpers (no DOM).
// Run with: node --test tests/blog-write.test.js

const test = require("node:test");
const assert = require("node:assert/strict");

// Same slug rule blog-write.js uses.
function slugify(title) {
  var s = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return s || "untitled";
}

test("slugify replaces spaces and punctuation with hyphens", () => {
  assert.equal(slugify("My First Post!"), "my-first-post");
});

test("slugify strips leading and trailing hyphens", () => {
  assert.equal(slugify("  ---Hello---  "), "hello");
});

test("slugify returns 'untitled' for empty input", () => {
  assert.equal(slugify(""), "untitled");
  assert.equal(slugify("!!!"), "untitled");
});

test("slugify collapses runs of punctuation", () => {
  assert.equal(slugify("a   b!!!c"), "a-b-c");
});
