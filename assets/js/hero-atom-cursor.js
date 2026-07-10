/* ============================================================
   hero-atom-cursor.js
   Replaces the native cursor inside the hero personal-card with
   an atom (nucleus + three orbiting electrons). When the pointer
   reaches the word "dreamer" the electrons excite (heat to gold,
   speed up, nucleus swells) and a dreamy mint-gold spark burst
   radiates from the nucleus.

   Guards:
   - No-op on pages without .personal-card.
   - Skips entirely on coarse pointers (touch), so the native
     cursor stays on mobile/tablet.
   - Under prefers-reduced-motion the atom still shows but does
     not orbit and no burst is fired.
   - Native cursor is hidden only via body.atom-cursor-ready,
     which this script sets, so it stays visible if JS is off.
   Idempotent.
   ============================================================ */
(function () {
  "use strict";

  var REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
  var COARSE = "(pointer: coarse)";

  /* Mint, gold, white — matches the hero palette */
  var SPARK_PALETTE = [
    { c: "#49bf9d", g: "rgba(73, 191, 157, 0.85)" },
    { c: "#f5b942", g: "rgba(245, 185, 66, 0.9)" },
    { c: "#ffffff", g: "rgba(255, 255, 255, 0.9)" }
  ];

  var SPARK_COUNT = 14;
  var BURST_COOLDOWN_MS = 600;
  var SPARK_LIFE_MS = 1000;

  function init() {
    var card = document.querySelector(".personal-card");
    if (!card) return;
    if (!window.matchMedia) return;
    if (window.matchMedia(COARSE).matches) return; /* touch device */

    var reduced = window.matchMedia(REDUCED_MOTION).matches;

    var cursor = document.createElement("div");
    cursor.className = "atom-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML =
      '<span class="atom-nucleus"></span>' +
      '<span class="atom-orbit atom-orbit-1"><span class="atom-electron-track"><span class="atom-electron"></span></span></span>' +
      '<span class="atom-orbit atom-orbit-2"><span class="atom-electron-track"><span class="atom-electron"></span></span></span>' +
      '<span class="atom-orbit atom-orbit-3"><span class="atom-electron-track"><span class="atom-electron"></span></span></span>';
    document.body.appendChild(cursor);
    document.body.classList.add("atom-cursor-ready");

    var targetX = -200, targetY = -200, curX = targetX, curY = targetY;
    var raf = null;

    function applyTransform(x, y) {
      cursor.style.transform =
        "translate3d(" + x + "px," + y + "px,0) translate(-50%,-50%)";
    }

    function render() {
      curX += (targetX - curX) * 0.25;
      curY += (targetY - curY) * 0.25;
      applyTransform(curX, curY);
      if (Math.abs(targetX - curX) > 0.4 || Math.abs(targetY - curY) > 0.4) {
        raf = requestAnimationFrame(render);
      } else {
        raf = null;
      }
    }

    function ping() {
      if (!raf && !reduced) raf = requestAnimationFrame(render);
    }

    function onMove(e) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (reduced) {
        applyTransform(targetX, targetY);
      } else {
        ping();
      }
    }

    function show() { cursor.classList.add("is-on"); }
    function hide() {
      cursor.classList.remove("is-on");
      disarm();
    }

    /* ---- "dreamer" excitation + burst ---- */
    var dreamer = card.querySelector(".pc-dreamer");
    var cooldown = false;

    function arm() {
      cursor.classList.add("is-excited");
      if (dreamer) dreamer.classList.add("is-excited");
      if (!reduced) burst();
    }

    function disarm() {
      cursor.classList.remove("is-excited");
      if (dreamer) dreamer.classList.remove("is-excited");
    }

    function burst() {
      if (cooldown) return;
      cooldown = true;
      window.setTimeout(function () { cooldown = false; }, BURST_COOLDOWN_MS);

      for (var i = 0; i < SPARK_COUNT; i++) {
        var spark = document.createElement("span");
        spark.className = "atom-spark";
        var pal = SPARK_PALETTE[i % SPARK_PALETTE.length];
        spark.style.setProperty("--spark", pal.c);
        spark.style.setProperty("--spark-glow", pal.g);
        cursor.appendChild(spark);

        /* Force a reflow so the transition runs from the initial
           (centered, full-size) state toward the outward end state. */
        spark.offsetWidth; /* eslint-disable-line no-unused-expressions */

        var angle = (Math.PI * 2 * i) / SPARK_COUNT + (Math.random() - 0.5) * 0.3;
        var dist = 48 + Math.random() * 38;
        spark.style.transform =
          "translate(" + (Math.cos(angle) * dist) + "px," + (Math.sin(angle) * dist) + "px) scale(0.2)";
        spark.style.opacity = "0";

        (function (s) {
          window.setTimeout(function () {
            if (s.parentNode) s.parentNode.removeChild(s);
          }, SPARK_LIFE_MS);
        })(spark);
      }
    }

    /* ---- Wire events ---- */
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseenter", function (e) {
      targetX = curX = e.clientX;
      targetY = curY = e.clientY;
      applyTransform(curX, curY);
      show();
    });
    card.addEventListener("mouseleave", hide);

    if (dreamer) {
      dreamer.addEventListener("mouseenter", arm);
      dreamer.addEventListener("mouseleave", disarm);
    }

    /* ---- Avatar "light-up" halo + electron rings ----
       Decorative layers are built here (kept out of the HTML) and
       inserted before the <img>. Hovering the avatar lights the
       rings/aura AND excites the atom cursor, so the atom that
       "lit up" the avatar visibly heats to gold at the same moment. */
    initAvatar(card, cursor, reduced);
  }

  function initAvatar(card, cursor, reduced) {
    var wrap = card.querySelector(".pc-avatar-wrap");
    if (!wrap) return;

    var aura = document.createElement("span");
    aura.className = "avatar-aura";
    aura.setAttribute("aria-hidden", "true");

    var rings = ["avatar-ring-1", "avatar-ring-2", "avatar-ring-3"];
    for (var i = 0; i < rings.length; i++) {
      var ring = document.createElement("span");
      ring.className = "avatar-ring " + rings[i];
      ring.setAttribute("aria-hidden", "true");
      ring.innerHTML =
        '<span class="avatar-electron-track"><span class="avatar-electron"></span></span>';
      wrap.insertBefore(ring, wrap.firstChild);
    }
    wrap.insertBefore(aura, wrap.firstChild);

    function lightUp() {
      wrap.classList.add("is-lit");
      cursor.classList.add("is-excited");
    }
    function dim() {
      wrap.classList.remove("is-lit");
      cursor.classList.remove("is-excited");
    }

    var img = wrap.querySelector(".pc-avatar");
    if (img) {
      img.addEventListener("mouseenter", lightUp);
      img.addEventListener("mouseleave", dim);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();