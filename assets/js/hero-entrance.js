/* ============================================================
   hero-entrance.js
   Plays the hero's glassy fly-in (personal card + portfolio tiles)
   on first paint. All timing/stagger/easing lives in hero.css as
   transitions gated by body.hero-ready; this script's only job is
   to flip that class one frame after the initial (hidden) state has
   actually been painted, so the browser runs the transition instead
   of coalescing straight to the end state.
   Skips straight to the end state under prefers-reduced-motion via
   body.no-motion (set synchronously by hero-mesh.js, which must run
   first — see script order in index.html).
   Idempotent; no-ops on pages without a hero.
   ============================================================ */
(function () {
  "use strict";

  function ready() {
    if (!document.getElementById("hero")) return;

    if (document.body.classList.contains("no-motion")) {
      document.body.classList.add("hero-ready");
      return;
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.add("hero-ready");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();
