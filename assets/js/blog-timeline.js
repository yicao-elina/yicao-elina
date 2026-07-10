/* ============================================================
   blog-timeline.js
   Click handler for timeline filter chips.
   Writes body[data-timeline-filter] to one of "all", "technical",
   "life" and updates aria-pressed on every chip. CSS handles
   hiding the non-matching rows (see blog.css).
   No animations are introduced, so no reduced-motion guard is
   needed inside this file.
   Idempotent: bound on DOMContentLoaded only.
   ============================================================ */
(function () {
  "use strict";

  var CHIP_SELECTOR = "[data-filter-chip]";
  var VALID_FILTERS = { all: 1, technical: 1, life: 1 };

  function setFilter(body, chips, filter) {
    if (!VALID_FILTERS[filter]) return;
    body.dataset.timelineFilter = filter;
    for (var i = 0; i < chips.length; i++) {
      var chip = chips[i];
      var pressed = chip.dataset.filter === filter ? "true" : "false";
      chip.setAttribute("aria-pressed", pressed);
    }
  }

  function init() {
    var chips = document.querySelectorAll(CHIP_SELECTOR);
    if (chips.length === 0) return;
    var body = document.body;

    // Default: "all", with the matching chip marked pressed.
    if (!body.dataset.timelineFilter) {
      setFilter(body, chips, "all");
    } else {
      setFilter(body, chips, body.dataset.timelineFilter);
    }

    for (var i = 0; i < chips.length; i++) {
      (function (chip) {
        chip.addEventListener("click", function () {
          setFilter(body, chips, chip.dataset.filter);
        });
      })(chips[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
