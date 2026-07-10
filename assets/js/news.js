/* ============================================================
   News timeline year filter
   Hides year groups + their entries whose data-year doesn't
   match the active filter. Idempotent.
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var page = document.querySelector('.news-page');
    if (!page) return;

    var filters = page.querySelectorAll('.news-filter');
    var years = page.querySelectorAll('.news-year');
    var entries = page.querySelectorAll('.news-entry');

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var year = btn.getAttribute('data-year');
        filters.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');

        entries.forEach(function (e) {
          var matches = (year === 'all') || (e.getAttribute('data-year') === year);
          e.style.display = matches ? '' : 'none';
        });
        years.forEach(function (y) {
          var matches = (year === 'all') || (y.getAttribute('data-year') === year);
          y.style.display = matches ? '' : 'none';
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
