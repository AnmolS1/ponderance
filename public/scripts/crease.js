/* crease.js — chrome behaviour: theme toggle, fold-out mobile menu, live OS-follow.
 *
 * Deferred (loaded type=module at end of body): runs after the pre-paint
 * /scripts/crease-theme.js has already set the initial data-theme, so there is
 * no flash. External + self-hosted (CSP `script-src 'self'`, IIFE, no inline).
 * Storage key "cp-theme" ("light" | "dark").
 */
(function () {
  if (window.__creaseInit) return; // idempotent — safe if loaded twice
  window.__creaseInit = true;

  var root = document.documentElement;
  var KEY = 'cp-theme';

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', theme === 'dark' ? '#0E1A24' : '#EEF0EC');
    document.querySelectorAll('[data-cp-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      b.setAttribute('aria-pressed', String(theme === 'dark'));
    });
  }

  // Sync the toggle's aria state to the theme crease-theme.js already applied.
  apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  // Follow the OS live only while the user hasn't made an explicit choice.
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!stored()) apply(e.matches ? 'dark' : 'light');
    });
  }

  /* ---- Fold-out menu ------------------------------------------------------ */
  function setMenu(open) {
    if (open) root.setAttribute('data-cp-menu-open', '');
    else root.removeAttribute('data-cp-menu-open');
    document.querySelectorAll('[data-cp-burger]').forEach(function (b) {
      b.setAttribute('aria-expanded', String(open));
    });
    document.body.style.overflow = open ? 'hidden' : ''; // lock scroll behind the sheet
  }
  function menuOpen() {
    return root.hasAttribute('data-cp-menu-open');
  }

  /* ---- Delegated events (robust to the chrome being shared across pages) -- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cp-toggle],[data-cp-burger],[data-cp-menu-close],.cp-menu-link');
    if (!t) return;
    if (t.matches('[data-cp-toggle]')) {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(KEY, next); } catch (err) {}
      apply(next);
    } else if (t.matches('[data-cp-burger]')) {
      setMenu(!menuOpen());
    } else if (t.matches('[data-cp-menu-close]') || t.matches('.cp-menu-link')) {
      setMenu(false);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen()) setMenu(false);
  });
})();
