/* ============================================================
   hero-atom-cursor.js
   The "dreaming atom" cursor for the hero personal-card.

   Idle      — atom occasionally morphs into a chip / folded protein /
               battery (the infinite possibilities of an atom in dreams).
   engineer  — atom crystallises into a lattice + radiates EM waves.
   dreamer   — gold excitation + ripple water-waves + rising gold
               dream-motes + the atom morphs into a higher-level material
               (semiconductor / drug molecule / battery) + the card
               flushes with layered concentric golden ripples centred on
               the word, fading over 3s after the pointer leaves.

   Guards: no-op without .personal-card; skipped on coarse pointers
   (touch); under prefers-reduced-motion the atom shows but does not
   morph, emit waves/ripples/motes, or shimmer. Native cursor is hidden
   only via body.atom-cursor-ready (set here), so it stays visible if JS
   is off. Idempotent.
   ============================================================ */
(function () {
  "use strict";

  var REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
  var COARSE = "(pointer: coarse)";

  /* Idle dream-forms (basic) and dreamer material-forms (higher-level). */
  var DREAM_FORMS = ["chip", "protein", "battery"];
  var MATERIAL_FORMS = ["semiconductor", "drug", "battery"];
  var MORPH_HOLD_MS = 3600;
  var SYMBOL_HOLD_MS = 2300;
  var RIPPLE_INTERVAL_MS = 1300;
  var TIDE_FADE_OUT_MS = 3000;
  var MOTE_COUNT = 5;

  /* Inline SVGs for each form (currentColor = form color). */
  var SVG = {
    chip:
      '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="10" y="10" width="16" height="16" rx="2.5"/>' +
      '<rect x="14.5" y="14.5" width="7" height="7" rx="1" fill="rgba(73,191,157,0.16)" stroke-width="1.1"/>' +
      '<path d="M13.5 10V6.5M18 10V6.5M22.5 10V6.5M13.5 26V29.5M18 26V29.5M22.5 26V29.5M10 13.5H6.5M10 18H6.5M10 22.5H6.5M26 13.5H29.5M26 18H29.5M26 22.5H29.5"/>' +
      '<circle cx="18" cy="18" r="1.2" fill="#f5b942" stroke="none"/></svg>',
    protein:
      '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M5 25 C9 13 14 13 18 21 C22 29 27 11 31 17"/>' +
      '<circle cx="5" cy="25" r="1.7" fill="#f5b942" stroke="none"/>' +
      '<circle cx="18" cy="21" r="1.7" fill="currentColor" stroke="none"/>' +
      '<circle cx="31" cy="17" r="1.7" fill="#f5b942" stroke="none"/></svg>',
    battery:
      '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="7.5" y="11" width="20" height="14" rx="2.2"/>' +
      '<path d="M27.5 15 h3 v6 h-3"/>' +
      '<rect x="10.5" y="14" width="3.2" height="8" rx="1" fill="rgba(73,191,157,0.55)" stroke="none"/>' +
      '<rect x="15" y="14" width="3.2" height="8" rx="1" fill="rgba(245,185,66,0.5)" stroke="none"/>' +
      '<circle cx="22.5" cy="18" r="1" fill="#f5b942" stroke="none"/></svg>',
    crystal:
      '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M18 4 L30.1 11 L30.1 25 L18 32 L5.9 25 L5.9 11 Z"/>' +
      '<path d="M18 18 L18 4 M18 18 L30.1 11 M18 18 L30.1 25 M18 18 L18 32 M18 18 L5.9 25 M18 18 L5.9 11"/>' +
      '<path d="M18 4 L30.1 25 L5.9 25 Z" fill="rgba(73,191,157,0.10)" stroke-width="1"/>' +
      '<circle cx="18" cy="4" r="1.7" fill="currentColor" stroke="none"/>' +
      '<circle cx="30.1" cy="11" r="1.7" fill="currentColor" stroke="none"/>' +
      '<circle cx="30.1" cy="25" r="1.7" fill="currentColor" stroke="none"/>' +
      '<circle cx="18" cy="32" r="1.7" fill="currentColor" stroke="none"/>' +
      '<circle cx="5.9" cy="25" r="1.7" fill="currentColor" stroke="none"/>' +
      '<circle cx="5.9" cy="11" r="1.7" fill="currentColor" stroke="none"/>' +
      '<circle cx="18" cy="18" r="2.1" fill="#f5b942" stroke="none"/></svg>',
    semiconductor:
      '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="18" cy="18" r="11" fill="rgba(73,191,157,0.07)"/>' +
      '<path d="M10 22 H26"/>' +                              /* valence band  */
      '<path d="M10 14 H26"/>' +                              /* conduction band */
      '<path d="M18 22 V14" stroke-dasharray="2 2"/>' +       /* band gap      */
      '<path d="M16.8 15.2 L18 13.6 L19.2 15.2"/>' +          /* jump arrow     */
      '<circle cx="18" cy="18" r="1.5" fill="#f5b942" stroke="none"/></svg>',
    drug:
      '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M13 9 L18.2 12 L18.2 18 L13 21 L7.8 18 L7.8 12 Z"/>' +   /* ring 1 */
      '<path d="M18.2 12 L23.4 9 L28.6 12 L28.6 18 L23.4 21 L18.2 18"/>' + /* ring 2 (fused) */
      '<path d="M13 11.4 L17 13.6" stroke-width="1.1"/>' +               /* double-bond hint */
      '<path d="M23.4 21 L23.4 27"/>' +                                  /* substituent */
      '<circle cx="23.4" cy="27" r="1.6" fill="#f5b942" stroke="none"/>' + /* heteroatom */
      '<circle cx="7.8" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>'
  };

  function init() {
    var card = document.querySelector(".personal-card");
    if (!card) return;
    if (!window.matchMedia) return;
    if (window.matchMedia(COARSE).matches) return;

    var reduced = window.matchMedia(REDUCED_MOTION).matches;

    /* ---- Build the cursor: atom + dream forms + materials + crystal + emwave ---- */
    var cursor = document.createElement("div");
    cursor.className = "atom-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML =
      '<div class="atom-form atom-form-atom is-active">' +
        '<span class="atom-nucleus"></span>' +
        '<span class="atom-orbit atom-orbit-1"><span class="atom-electron-track"><span class="atom-electron"></span></span></span>' +
        '<span class="atom-orbit atom-orbit-2"><span class="atom-electron-track"><span class="atom-electron"></span></span></span>' +
        '<span class="atom-orbit atom-orbit-3"><span class="atom-electron-track"><span class="atom-electron"></span></span></span>' +
      '</div>' +
      '<div class="atom-form atom-form-chip">' + SVG.chip + '</div>' +
      '<div class="atom-form atom-form-protein">' + SVG.protein + '</div>' +
      '<div class="atom-form atom-form-battery">' + SVG.battery + '</div>' +
      '<div class="atom-form atom-form-crystal">' + SVG.crystal + '</div>' +
      '<div class="atom-form atom-form-semiconductor">' + SVG.semiconductor + '</div>' +
      '<div class="atom-form atom-form-drug">' + SVG.drug + '</div>' +
      '<div class="atom-emwave" aria-hidden="true"><span></span><span></span><span></span></div>';
    document.body.appendChild(cursor);
    document.body.classList.add("atom-cursor-ready");

    /* ---- Card golden afterglow: layered wash + concentric ripples ---- */
    var tide = document.createElement("div");
    tide.className = "pc-gold-tide";
    var ripples = document.createElement("div");
    ripples.className = "pc-gold-ripples";
    tide.setAttribute("aria-hidden", "true");
    ripples.setAttribute("aria-hidden", "true");
    card.appendChild(tide);
    card.appendChild(ripples);

    /* ---- Pointer follow ---- */
    var targetX = -200, targetY = -200, curX = targetX, curY = targetY;
    var raf = null;
    function applyTransform(x, y) {
      cursor.style.transform = "translate3d(" + x + "px," + y + "px,0) translate(-50%,-50%)";
    }
    function render() {
      curX += (targetX - curX) * 0.25;
      curY += (targetY - curY) * 0.25;
      applyTransform(curX, curY);
      if (Math.abs(targetX - curX) > 0.4 || Math.abs(targetY - curY) > 0.4) {
        raf = requestAnimationFrame(render);
      } else { raf = null; }
    }
    function ping() { if (!raf && !reduced) raf = requestAnimationFrame(render); }
    function onMove(e) {
      targetX = e.clientX; targetY = e.clientY;
      if (reduced) { applyTransform(targetX, targetY); } else { ping(); }
    }

    /* ---- Form switching ---- */
    function showForm(name) {
      var forms = cursor.querySelectorAll(".atom-form");
      for (var i = 0; i < forms.length; i++) {
        forms[i].classList.toggle("is-active", forms[i].className.indexOf("atom-form-" + name) !== -1);
      }
    }

    /* ---- Generic morph timer (shared by idle + dreamer cycles) ---- */
    var morphTimer = null;
    function clearMorph() { if (morphTimer) { window.clearTimeout(morphTimer); morphTimer = null; } }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    /* Idle: atom → random dream form → atom → ... */
    function scheduleIdleMorph() {
      if (reduced) return;
      morphTimer = window.setTimeout(function () {
        showForm(pick(DREAM_FORMS));
        morphTimer = window.setTimeout(function () {
          showForm("atom");
          morphTimer = null;
          scheduleIdleMorph();
        }, SYMBOL_HOLD_MS);
      }, MORPH_HOLD_MS);
    }
    function resumeIdle() { if (!morphTimer && !reduced) scheduleIdleMorph(); }

    /* Dreamer: continuous random morph among higher-level materials */
    function startMaterialCycle() {
      function step() {
        showForm(pick(MATERIAL_FORMS));
        morphTimer = window.setTimeout(step, SYMBOL_HOLD_MS + Math.random() * 700);
      }
      step();
    }

    /* ---- "engineer": crystallise + EM waves ---- */
    var engineer = card.querySelector(".pc-engineer");
    function enterEngineer() {
      clearMorph();
      showForm("crystal");
      cursor.classList.add("is-engineer");
    }
    function leaveEngineer() {
      cursor.classList.remove("is-engineer");
      showForm("atom");
      resumeIdle();
    }

    /* ---- "dreamer": gold heat + ripples + motes + material morph + tide ---- */
    var dreamer = card.querySelector(".pc-dreamer");
    var rippleTimer = null;

    function setTideCenter() {
      if (!dreamer) return;
      var d = dreamer.getBoundingClientRect();
      var c = card.getBoundingClientRect();
      var rx = ((d.left + d.width / 2) - c.left) / c.width * 100;
      var ry = ((d.top + d.height / 2) - c.top) / c.height * 100;
      card.style.setProperty("--rx", rx + "%");
      card.style.setProperty("--ry", ry + "%");
    }

    function spawnRipple() {
      if (reduced || !dreamer) return;
      var r = document.createElement("span");
      r.className = "pc-ripple";
      dreamer.appendChild(r);
      window.setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 1750);
    }
    function spawnMotes() {
      if (reduced || !dreamer) return;
      for (var i = 0; i < MOTE_COUNT; i++) {
        (function (idx) {
          window.setTimeout(function () {
            if (!dreamer.classList.contains("is-excited")) return;
            var m = document.createElement("span");
            m.className = "pc-mote";
            m.style.setProperty("--mx", ((Math.random() - 0.5) * 60) + "px");
            m.style.left = (38 + Math.random() * 24) + "%";
            dreamer.appendChild(m);
            window.setTimeout(function () { if (m.parentNode) m.parentNode.removeChild(m); }, 2700);
          }, idx * 220);
        })(i);
      }
    }

    function enterDreamer() {
      clearMorph();
      setTideCenter();
      cursor.classList.add("is-excited");
      dreamer.classList.add("is-excited");
      tide.style.transitionDuration = "700ms";
      ripples.style.transitionDuration = "700ms";
      tide.classList.add("is-on");
      ripples.classList.add("is-on");
      spawnRipple();
      spawnMotes();
      rippleTimer = window.setInterval(spawnRipple, RIPPLE_INTERVAL_MS);
      if (!reduced) startMaterialCycle();
    }
    function leaveDreamer() {
      cursor.classList.remove("is-excited");
      dreamer.classList.remove("is-excited");
      if (rippleTimer) { window.clearInterval(rippleTimer); rippleTimer = null; }
      tide.style.transitionDuration = TIDE_FADE_OUT_MS + "ms";
      ripples.style.transitionDuration = TIDE_FADE_OUT_MS + "ms";
      tide.classList.remove("is-on");
      ripples.classList.remove("is-on");
      clearMorph();
      showForm("atom");
      resumeIdle();
    }

    /* ---- Card enter/leave ---- */
    function show() { cursor.classList.add("is-on"); resumeIdle(); }
    function hide() {
      cursor.classList.remove("is-on");
      cursor.classList.remove("is-engineer");
      cursor.classList.remove("is-excited");
      if (dreamer) {
        dreamer.classList.remove("is-excited");
        if (rippleTimer) { window.clearInterval(rippleTimer); rippleTimer = null; }
      }
      tide.style.transitionDuration = TIDE_FADE_OUT_MS + "ms";
      ripples.style.transitionDuration = TIDE_FADE_OUT_MS + "ms";
      tide.classList.remove("is-on");
      ripples.classList.remove("is-on");
      clearMorph();
      showForm("atom");
    }

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseenter", function (e) {
      targetX = curX = e.clientX;
      targetY = curY = e.clientY;
      applyTransform(curX, curY);
      show();
    });
    card.addEventListener("mouseleave", hide);

    if (engineer) {
      engineer.addEventListener("mouseenter", enterEngineer);
      engineer.addEventListener("mouseleave", leaveEngineer);
    }
    if (dreamer) {
      dreamer.addEventListener("mouseenter", enterDreamer);
      dreamer.addEventListener("mouseleave", leaveDreamer);
    }

    /* ---- Avatar light-up halo + electron rings ---- */
    initAvatar(card, cursor);
  }

  function initAvatar(card, cursor) {
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
      ring.innerHTML = '<span class="avatar-electron-track"><span class="avatar-electron"></span></span>';
      wrap.insertBefore(ring, wrap.firstChild);
    }
    wrap.insertBefore(aura, wrap.firstChild);

    function lightUp() { wrap.classList.add("is-lit"); cursor.classList.add("is-excited"); }
    function dim() { wrap.classList.remove("is-lit"); cursor.classList.remove("is-excited"); }

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