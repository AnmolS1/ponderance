// Legal pages enhancement — external file, CSP-clean under script-src 'self'.
// Two jobs, both optional: a scroll-spy that crane-highlights the in-view clause in the
// clause index, and (privacy page only) a live "what this page knows about you" readout.
// The pages are fully usable with this file absent: the index is plain anchor links and the
// panel carries static fallback text. Nothing here is sent anywhere — it is read in-browser.

(function () {
  function setEl(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ── Scroll-spy: highlight the clause currently in view in the index nav ──────────────
  function initScrollSpy() {
    var clauses = Array.prototype.slice.call(document.querySelectorAll('.clause[id]'));
    if (!clauses.length || !('IntersectionObserver' in window)) return;

    // Map clause id → every index link that points at it (rail + chips + jump-menu).
    var linksFor = {};
    clauses.forEach(function (c) {
      linksFor[c.id] = Array.prototype.slice.call(
        document.querySelectorAll('[data-spy-link="' + c.id + '"]')
      );
    });

    function setActive(id) {
      clauses.forEach(function (c) {
        var on = c.id === id;
        (linksFor[c.id] || []).forEach(function (a) {
          if (on) {
            a.setAttribute('aria-current', 'true');
            a.classList.add('is-active');
          } else {
            a.removeAttribute('aria-current');
            a.classList.remove('is-active');
          }
        });
      });
    }

    var visible = {};
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) visible[e.target.id] = e.intersectionRatio;
          else delete visible[e.target.id];
        });
        // Choose the clause nearest the top that is on screen, by document order.
        var top = null;
        clauses.forEach(function (c) {
          if (visible[c.id] != null && top === null) top = c.id;
        });
        if (top) setActive(top);
      },
      // Bias the band toward the upper third so the "active" clause is the one being read.
      { rootMargin: '-10% 0px -70% 0px', threshold: [0, 1] }
    );
    clauses.forEach(function (c) {
      observer.observe(c);
    });
  }

  // ── Privacy panel: measured locally, never transmitted ───────────────────────────────
  function initPanel() {
    if (!document.getElementById('legal-cookies')) return; // privacy page only

    var cookieCount = 0;
    try {
      var raw = document.cookie ? document.cookie.split(';') : [];
      cookieCount = raw.filter(function (c) {
        return c.trim().length > 0;
      }).length;
    } catch (e) {
      cookieCount = 0;
    }
    setEl('legal-cookies', String(cookieCount));
    setEl('legal-trackers', '0');
    setEl('legal-analytics', 'cookieless');

    var region = '—';
    try {
      region = Intl.DateTimeFormat().resolvedOptions().timeZone || '—';
    } catch (e) {
      region = '—';
    }
    setEl('legal-region', region);
  }

  function init() {
    initScrollSpy();
    initPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
