/* ============================================================
   Header tooltip + mobile overflow + active-page detection
   Vanilla JS, no dependencies. Idempotent.
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var header = document.getElementById('app-header');
    if (!header) return;

    // Active-page detection: mark the icon whose href matches
    // the current page (with or without hash).
    var path = window.location.pathname.replace(/\/$/, '');
    var hash = window.location.hash;
    header.querySelectorAll('.ah-icon').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (!href) return;
      var target = href.split('#')[0].replace(/\/$/, '');
      if (target && target === path) {
        a.setAttribute('aria-current', 'page');
      }
      // Also handle in-page anchors for the home page
      if (path.endsWith('index.html') || path === '') {
        if (hash && href.endsWith(hash)) {
          a.setAttribute('aria-current', 'page');
        }
      }
    });

    // Avatar click → scroll to top
    var avatar = header.querySelector('.ah-avatar');
    if (avatar) {
      avatar.addEventListener('click', function (e) {
        if (path === '' || path.endsWith('index.html')) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // otherwise let the link to index.html proceed
      });
    }

    // Mobile overflow popover
    var more = header.querySelector('.ah-more');
    var popover = header.querySelector('.ah-popover');
    if (more && popover) {
      more.addEventListener('click', function (e) {
        e.stopPropagation();
        popover.classList.toggle('open');
      });
      document.addEventListener('click', function (e) {
        if (!popover.contains(e.target) && e.target !== more) {
          popover.classList.remove('open');
        }
      });
      // Close on Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') popover.classList.remove('open');
      });
    }

    // Hero-linked reveal: on the landing page the pill starts invisible
    // (see header.css) and fades in 1:1 with scroll progress through
    // #hero, landing at full opacity once the hero is fully scrolled past.
    var hero = document.getElementById('hero');
    if (hero) {
      var ticking = false;
      var updateHeaderVisibility = function () {
        var heroHeight = hero.offsetHeight || 1;
        var scrollY = window.scrollY || window.pageYOffset;
        var progress = Math.min(Math.max(scrollY / heroHeight, 0), 1);
        header.style.opacity = String(progress);
        header.style.pointerEvents = progress > 0.05 ? 'auto' : 'none';
        ticking = false;
      };
      var onScroll = function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateHeaderVisibility);
        }
      };
      updateHeaderVisibility();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
    }

    // Touch: tap an icon to show its tooltip for 2s
    if ('ontouchstart' in window) {
      header.querySelectorAll('.ah-icon').forEach(function (a) {
        var timer = null;
        a.addEventListener('touchstart', function () {
          header.querySelectorAll('.ah-tooltip').forEach(function (t) { t.style.opacity = ''; });
          var tip = a.querySelector('.ah-tooltip');
          if (!tip) return;
          tip.style.opacity = '1';
          tip.style.transform = 'translateX(-50%) translateY(0)';
          clearTimeout(timer);
          timer = setTimeout(function () {
            tip.style.opacity = '';
            tip.style.transform = '';
          }, 2000);
        }, { passive: true });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
