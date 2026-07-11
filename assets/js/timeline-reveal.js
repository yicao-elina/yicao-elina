/* ============================================================
   timeline-reveal.js
   Education & Research Timeline entrance choreography:
     1. When #skills-timeline .timeline-container scrolls into
        view, add `.t-draw` so the mint spine draws downward
        (scaleY 0 → 1) and its flowing band starts travelling.
     2. Then add `.t-in` to each .t-item with a per-index delay so
        the blocks emerge one after another (node pops, card
        slides in from its side).
   Honors prefers-reduced-motion (reveals instantly). No-ops if
   IntersectionObserver is unavailable. Idempotent.
   Card tilt + spotlight are handled by blog-tilt.js /
   blog-spotlight.js via the data-tilt / data-spotlight attrs
   already on each .t-content.
   ============================================================ */
(function () {
  "use strict";

  var ATTR = "data-timeline-bound";
  var STAGGER_MS = 120;

  function isReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function init() {
    var container = document.querySelector("#skills-timeline .timeline-container");
    if (!container || container.getAttribute(ATTR) === "true") return;
    container.setAttribute(ATTR, "true");

    var items = container.querySelectorAll(".t-item");

    function reveal() {
      container.classList.add("t-draw");
      var step = isReducedMotion() ? 0 : STAGGER_MS;
      for (var i = 0; i < items.length; i++) {
        (function (el, idx) {
          if (idx === 0) {
            el.classList.add("t-in");
          } else {
            setTimeout(function () { el.classList.add("t-in"); }, step * idx);
          }
        })(items[i], i);
      }
    }

    if (isReducedMotion() || !("IntersectionObserver" in window)) {
      reveal();
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal();
          io.disconnect();
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -60px 0px" });

    io.observe(container);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();