/* ============================================================
   Springy inline card-open primitive
   Toggles .spring-panel inside any [data-spring] card with a
   spring bezier. Multiple panels may be open at once. Honors
   prefers-reduced-motion. Idempotent.
   ============================================================ */
(function () {
  'use strict';

  var SPRING_MS = 380;
  var FADE_MS = 280;
  var REDUCED_MS = 200;

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function init() {
    var cards = document.querySelectorAll('[data-spring]');
    if (!cards.length) return;

    var dur = reducedMotion() ? REDUCED_MS : SPRING_MS;
    var fade = reducedMotion() ? 150 : FADE_MS;

    cards.forEach(function (card) {
      var header = card.querySelector(':scope > .spring-header, :scope > header.spring-header');
      if (!header) {
        // Fall back to the first non-panel child as the click target
        var first = card.firstElementChild;
        if (first && !first.classList.contains('spring-panel')) header = first;
      }
      var panel = card.querySelector(':scope > .spring-panel');
      if (!header || !panel) return;

      // Initial state
      panel.style.overflow = 'hidden';
      panel.style.maxHeight = '0px';
      panel.style.opacity = '0';
      panel.style.transition = 'max-height ' + dur + 'ms cubic-bezier(.34,1.56,.64,1), opacity ' + fade + 'ms ease';

      // Aria setup
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      card.setAttribute('aria-expanded', 'false');

      var isOpen = function () { return card.getAttribute('aria-expanded') === 'true'; };
      var open = function () {
        card.setAttribute('aria-expanded', 'true');
        header.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.style.opacity = '1';
      };
      var close = function () {
        card.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        // Recalculate in case content size changed
        panel.style.maxHeight = '0px';
        panel.style.opacity = '0';
      };
      var toggle = function () { isOpen() ? close() : open(); };

      header.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;       // allow real links to navigate
        toggle();
      });
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        if (e.key === 'Escape' && isOpen()) { e.preventDefault(); close(); }
      });

      // Default open
      if (card.hasAttribute('data-spring-default-open')) {
        // Wait a frame so layout settles
        requestAnimationFrame(function () { open(); });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
