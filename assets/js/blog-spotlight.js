/* ============================================================
   blog-spotlight.js
   Cursor-tracking spotlight glow on glass cards.
   Sets --mx and --my CSS custom properties on each
   [data-spotlight] element as 0-100% percentages.
   No-ops when prefers-reduced-motion: reduce.
   Idempotent: safe to call multiple times.
   ============================================================ */
(function () {
  "use strict";

  var ATTR = "data-spotlight-bound";
  var SELECTOR = "[data-spotlight]";

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
    var pendingMx = "50%";
    var pendingMy = "50%";

    function apply() {
      frameId = null;
      card.style.setProperty("--mx", pendingMx);
      card.style.setProperty("--my", pendingMy);
    }

    function onMove(e) {
      if (isReducedMotion()) return;
      var rect = card.getBoundingClientRect();
      // Clamp to card bounds so the glow stays inside even on fast movement.
      var x = Math.max(rect.left, Math.min(rect.right, e.clientX));
      var y = Math.max(rect.top, Math.min(rect.bottom, e.clientY));
      var pctX = ((x - rect.left) / rect.width) * 100;
      var pctY = ((y - rect.top) / rect.height) * 100;
      pendingMx = pctX.toFixed(2) + "%";
      pendingMy = pctY.toFixed(2) + "%";
      if (frameId === null) frameId = window.requestAnimationFrame(apply);
    }

    // Use pointer events for unified mouse/touch handling.
    if (window.PointerEvent) {
      card.addEventListener("pointermove", onMove);
    } else {
      // Legacy fallback (mousemove only).
      card.addEventListener("mousemove", onMove);
    }
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
