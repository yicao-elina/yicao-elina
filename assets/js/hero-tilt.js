/* ============================================================
   hero-tilt.js
   Mouse-reactive 3D tilt on portfolio tiles.
   Sets --tilt-x and --tilt-y CSS custom properties on each
   [data-tilt] element, capped at +/- 6 degrees.
   No-ops when prefers-reduced-motion: reduce.
   Idempotent: safe to call multiple times.
   ============================================================ */
(function () {
  "use strict";

  var MAX_TILT_DEG = 6;
  var ATTR = "data-tilt-bound";
  var TILE_SELECTOR = "[data-tilt]";

  function getMaxTilt() {
    return MAX_TILT_DEG;
  }

  function isReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function attach(tile) {
    if (tile.getAttribute(ATTR) === "true") return;
    tile.setAttribute(ATTR, "true");

    var frameId = null;
    var pendingX = 0;
    var pendingY = 0;

    function apply() {
      frameId = null;
      tile.style.setProperty("--tilt-x", pendingX.toFixed(2) + "deg");
      tile.style.setProperty("--tilt-y", pendingY.toFixed(2) + "deg");
    }

    function onMove(e) {
      if (isReducedMotion()) return;
      var rect = tile.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) / (rect.width / 2);   // -1..1
      var dy = (e.clientY - cy) / (rect.height / 2);  // -1..1
      var max = getMaxTilt();
      pendingX = Math.max(-1, Math.min(1, dx)) * max;
      pendingY = Math.max(-1, Math.min(1, -dy)) * max;  // invert Y so up-tilt is positive
      if (frameId === null) frameId = window.requestAnimationFrame(apply);
    }

    function onLeave() {
      pendingX = 0;
      pendingY = 0;
      if (frameId === null) frameId = window.requestAnimationFrame(apply);
    }

    tile.addEventListener("mousemove", onMove);
    tile.addEventListener("mouseleave", onLeave);
  }

  function init() {
    var tiles = document.querySelectorAll(TILE_SELECTOR);
    for (var i = 0; i < tiles.length; i++) attach(tiles[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
