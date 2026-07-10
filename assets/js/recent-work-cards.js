/* ============================================================
   recent-work-cards.js
   Behavior for the #two "Recent Work" glass-card list:
   - Only the thumbnail (.rw-thumb) opens the card's primary paper
     link (data-href) on click/Enter. The body text on the right is
     NOT a navigation target — clicking it does nothing, so readers
     can select text / click the Details toggle without jumping away.
   - The Details toggle expands/collapses its sibling .spring-panel
     with the same spring easing as spring-card.js, but decoupled
     from it since these cards don't use the click-header-to-toggle
     pattern (the thumbnail IS the navigation target here).
   Idempotent.
   ============================================================ */
(function () {
  'use strict';

  var SPRING_MS = 380;
  var FADE_MS = 280;
  var REDUCED_MS = 200;

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function initToggles() {
    var dur = reducedMotion() ? REDUCED_MS : SPRING_MS;
    var fade = reducedMotion() ? 150 : FADE_MS;

    document.querySelectorAll('.recent-work-list .rw-card').forEach(function (card) {
      var btn = card.querySelector('.row-header-toggle');
      var panel = card.querySelector('.spring-panel');
      if (!btn || !panel) return;

      panel.style.overflow = 'hidden';
      panel.style.maxHeight = '0px';
      panel.style.opacity = '0';
      panel.style.transition = 'max-height ' + dur + 'ms cubic-bezier(.34,1.56,.64,1), opacity ' + fade + 'ms ease';
      panel.setAttribute('aria-hidden', 'true');

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
          btn.setAttribute('aria-expanded', 'false');
          panel.setAttribute('aria-hidden', 'true');
          panel.style.maxHeight = '0px';
          panel.style.opacity = '0';
        } else {
          btn.setAttribute('aria-expanded', 'true');
          panel.setAttribute('aria-hidden', 'false');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          panel.style.opacity = '1';
        }
      });
    });
  }

  function initCardNav() {
    document.querySelectorAll('.recent-work-list .rw-card[data-href]').forEach(function (card) {
      var href = card.getAttribute('data-href');
      var thumb = card.querySelector('.rw-thumb');
      if (!thumb) return;

      // The thumbnail is the sole navigation affordance; the body text
      // is inert. Move focus/role onto the thumb, off the whole card.
      thumb.setAttribute('role', 'link');
      thumb.setAttribute('tabindex', '0');
      thumb.setAttribute('aria-label', 'Open original paper');

      var go = function () {
        window.open(href, '_blank', 'noopener');
      };

      thumb.addEventListener('click', function (e) {
        e.stopPropagation();
        go();
      });
      thumb.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      });
    });
  }

  function init() {
    initToggles();
    initCardNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
