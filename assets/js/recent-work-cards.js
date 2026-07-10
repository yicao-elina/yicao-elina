/* ============================================================
   recent-work-cards.js
   Behavior for the #two "Recent Work" glass-card list:
   - Whole-card click/Enter opens the card's primary paper link
     (data-href), except when the click lands on a real <a>/<button>
     inside it (icon links, the Details toggle).
   - The Details toggle expands/collapses its sibling .spring-panel
     with the same spring easing as spring-card.js, but decoupled
     from it since these cards don't use the click-header-to-toggle
     pattern (the header IS the card-level navigation target here).
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
      card.setAttribute('role', 'link');

      var go = function () {
        window.open(card.getAttribute('data-href'), '_blank', 'noopener');
      };

      card.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        go();
      });
      card.addEventListener('keydown', function (e) {
        if (e.target !== card) return;
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
