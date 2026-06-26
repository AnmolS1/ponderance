/* crease-theme.js — pre-paint theme init (no flash).
 *
 * Loaded render-blocking in <head> (classic, NOT type=module) so it runs before
 * first paint and sets data-theme on <html> before any body content renders.
 * External + self-hosted to satisfy CSP `script-src 'self'` and the CI
 * no-inline-script gate. The rest of the theme behaviour (toggle, fold-out
 * menu, live OS-follow) lives in the deferred /scripts/crease.js.
 *
 * Storage key "cp-theme" ("light" | "dark"): an explicit toggle choice persists
 * and overrides the system; with nothing stored we follow prefers-color-scheme.
 * A ?theme=light|dark query param wins (used by the responsive validation
 * harness to force a theme per route).
 */
(function () {
  var root = document.documentElement;
  var KEY = 'cp-theme';

  function systemPref() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function resolve() {
    var q = null;
    try { q = new URLSearchParams(location.search).get('theme'); } catch (e) {}
    if (q === 'light' || q === 'dark') return q;
    var s = stored();
    return (s === 'light' || s === 'dark') ? s : systemPref();
  }

  var theme = resolve();
  root.setAttribute('data-theme', theme);

  // Keep the browser-chrome colour honest before the deferred script loads.
  var m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', theme === 'dark' ? '#0E1A24' : '#EEF0EC');
})();
