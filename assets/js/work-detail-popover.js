/* ============================================================
   work-detail-popover.js
   "Details" buttons in the Work Experience cards open a small
   glass popover that floats next to the button. The popover is
   portalled to <body> (position: fixed) so it is never clipped
   by the glass card's overflow:hidden / transform.

   Behavior:
     - Click a [data-we-detail] button -> open its popover near it.
     - Click the same button again -> close (toggle).
     - Click outside the popover, or press Esc -> close.
     - Only one popover open at a time.
     - Repositions on scroll / resize (rAF-throttled).
   Content for each popover is cloned from a <template id> named by
   the button's data-we-detail attribute. Idempotent + reduced-motion
   friendly (just no transition).
   ============================================================ */
(function () {
  "use strict";

  var BOUND_ATTR = "data-we-popover-bound";
  var popover = null;
  var activeBtn = null;
  var reframe = null;

  function ensurePopover() {
    if (popover) return popover;
    popover = document.createElement("div");
    popover.className = "we-popover";
    popover.setAttribute("role", "dialog");
    popover.setAttribute("aria-modal", "false");
    popover.setAttribute("aria-label", "Role details");
    popover.hidden = true;
    document.body.appendChild(popover);
    return popover;
  }

  function close() {
    if (!popover || popover.hidden) return;
    popover.classList.remove("is-open");
    popover.hidden = true;
    if (activeBtn) {
      activeBtn.setAttribute("aria-expanded", "false");
      activeBtn = null;
    }
    document.removeEventListener("click", onDocClick, true);
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("scroll", scheduleReposition, { passive: true });
    window.removeEventListener("resize", scheduleReposition);
  }

  function reposition() {
    reframe = null;
    if (!activeBtn || !popover || popover.hidden) return;
    var rect = activeBtn.getBoundingClientRect();
    var pw = popover.offsetWidth;
    var ph = popover.offsetHeight;
    var gap = 10;

    var left = rect.left;
    var maxLeft = window.innerWidth - pw - 12;
    if (left > maxLeft) left = maxLeft;
    if (left < 12) left = 12;

    var top = rect.bottom + gap;
    if (top + ph > window.innerHeight - 12 && rect.top - ph - gap > 12) {
      top = rect.top - ph - gap; // not enough room below -> open above
    }
    popover.style.left = Math.round(left) + "px";
    popover.style.top = Math.round(top) + "px";
  }

  function scheduleReposition() {
    if (reframe) return;
    reframe = window.requestAnimationFrame(reposition);
  }

  function open(btn) {
    var tplId = btn.getAttribute("data-we-detail");
    var tpl = tplId ? document.getElementById(tplId) : null;
    if (!tpl) return;
    ensurePopover();
    popover.innerHTML = "";
    popover.appendChild(document.importNode(tpl.content, true));
    activeBtn = btn;
    btn.setAttribute("aria-expanded", "true");
    popover.hidden = false;
    void popover.offsetWidth; // reflow so the transition runs
    popover.classList.add("is-open");
    reposition();
    document.addEventListener("click", onDocClick, true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", scheduleReposition, { passive: true });
    window.addEventListener("resize", scheduleReposition);
  }

  function onDocClick(e) {
    if (!activeBtn) return;
    // Clicking the active button is handled by onBtnClick (toggle). Don't close here.
    if (e.target === activeBtn || activeBtn.contains(e.target)) return;
    // Clicks inside the popover keep it open.
    if (popover.contains(e.target)) return;
    close();
  }

  function onKey(e) {
    if (e.key === "Escape") close();
  }

  function onBtnClick(e) {
    e.preventDefault();
    var btn = e.currentTarget;
    if (activeBtn === btn && popover && !popover.hidden) {
      close();
    } else {
      if (activeBtn && popover && !popover.hidden) close();
      open(btn);
    }
  }

  function init() {
    if (document.body.getAttribute(BOUND_ATTR) === "true") return;
    var btns = document.querySelectorAll("[data-we-detail]");
    if (!btns.length) return;
    document.body.setAttribute(BOUND_ATTR, "true");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", onBtnClick);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();