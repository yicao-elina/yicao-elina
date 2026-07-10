/* ============================================================
   blog-mesh.js
   Gating logic for the blog mesh backdrop.
   - Adds body.no-motion when prefers-reduced-motion: reduce.
     CSS uses this to disable the mesh-drift keyframe and the
     spotlight glow.
   - Pauses the mesh animation while the tab is hidden (battery).
   Idempotent.
   ============================================================ */
(function () {
  "use strict";

  var REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

  function applyMotionPreference() {
    var reduced =
      window.matchMedia && window.matchMedia(REDUCED_MOTION).matches;
    if (reduced) {
      document.body.classList.add("no-motion");
    } else {
      document.body.classList.remove("no-motion");
    }
  }

  function applyVisibility() {
    var meshes = document.querySelectorAll(".blog-mesh");
    var hidden = document.visibilityState === "hidden";
    for (var i = 0; i < meshes.length; i++) {
      if (hidden) {
        meshes[i].classList.add("is-paused");
      } else {
        meshes[i].classList.remove("is-paused");
      }
    }
  }

  function init() {
    applyMotionPreference();
    applyVisibility();

    if (window.matchMedia) {
      var mq = window.matchMedia(REDUCED_MOTION);
      // Both modern and legacy addListener APIs.
      if (mq.addEventListener) mq.addEventListener("change", applyMotionPreference);
      else if (mq.addListener) mq.addListener(applyMotionPreference);
    }
    document.addEventListener("visibilitychange", applyVisibility);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
