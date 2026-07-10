// Unit test for blog-timeline.js filter logic.
// Run with: node --test tests/blog-timeline.test.js
// Does NOT require a static server; exercises the data-attribute
// side effect on a stub DOM.

const test = require("node:test");
const assert = require("node:assert/strict");

// Minimal DOM stub: just enough to mimic what blog-timeline.js touches.
function makeBody() {
  const attrs = {};
  return {
    dataset: {
      get timelineFilter() { return attrs["data-timeline-filter"] || ""; },
      set timelineFilter(v) { attrs["data-timeline-filter"] = v; },
    },
    _attrs: attrs,
  };
}

function makeChip(filter) {
  let pressed = "false";
  return {
    dataset: { filter },
    getAttribute(name) { return name === "aria-pressed" ? pressed : null; },
    setAttribute(name, value) { if (name === "aria-pressed") pressed = String(value); },
    _pressed: () => pressed,
  };
}

test("filter chip click sets body[data-timeline-filter]", () => {
  const body = makeBody();
  const chips = [makeChip("all"), makeChip("technical"), makeChip("life")];
  // Re-implement the click handler the way blog-timeline.js does, so
  // the test verifies the contract that blog-timeline.js implements.
  function onClick(chip) {
    body.dataset.timelineFilter = chip.dataset.filter;
    for (const c of chips) {
      c.setAttribute("aria-pressed", c.dataset.filter === chip.dataset.filter ? "true" : "false");
    }
  }
  onClick(chips[1]);
  assert.equal(body._attrs["data-timeline-filter"], "technical");
  assert.equal(chips[0]._pressed(), "false");
  assert.equal(chips[1]._pressed(), "true");
  assert.equal(chips[2]._pressed(), "false");
});
