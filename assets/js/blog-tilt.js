/* ============================================================
   blog-tilt.js
   Mouse-reactive 3D tilt on glass cards.
   Sets --tilt-x and --tilt-y CSS custom properties on each
   [data-tilt] element, capped at +/- 6 degrees.
   No-ops when prefers-reduced-motion: reduce.
   Idempotent: safe to call multiple times.
   ============================================================ */
(function () {
  "use strict";

  var MAX_TILT_DEG = 6;
  var ATTR = "data-tilt-bound";
  var SELECTOR = "[data-tilt]";

  function isReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function attach(card) {
    if (card.getAttribute(ATTR) === "true") return;
    card.setAttribute(ATTR, "true");

    var frameId = null;
    var pendingX = 0;
    var pendingY = 0;

    function apply() {
      frameId = null;
      card.style.setProperty("--tilt-x", pendingX.toFixed(2) + "deg");
      card.style.setProperty("--tilt-y", pendingY.toFixed(2) + "deg");
    }

    function onMove(e) {
      if (isReducedMotion()) return;
      var rect = card.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) / (rect.width / 2);   // -1..1
      var dy = (e.clientY - cy) / (rect.height / 2);  // -1..1
      pendingX = Math.max(-1, Math.min(1, dx)) * MAX_TILT_DEG;
      pendingY = Math.max(-1, Math.min(1, -dy)) * MAX_TILT_DEG;  // invert Y so up-tilt is positive
      if (frameId === null) frameId = window.requestAnimationFrame(apply);
    }

    function onLeave() {
      pendingX = 0;
      pendingY = 0;
      if (frameId === null) frameId = window.requestAnimationFrame(apply);
    }

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
  }

  function init() {
    var cards = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < cards.length; i++) attach(cards[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
