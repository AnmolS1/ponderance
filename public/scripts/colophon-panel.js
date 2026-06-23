// Colophon live self-inspection panel — external file, CSP-clean under script-src 'self'
// Populates #panel-faces, #panel-viewport, #panel-motion, #panel-render

(function () {
  function setEl(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Font faces ready
  function updateFaces() {
    var families = [
      '16px "Bricolage Grotesque"',
      '16px "Hanken Grotesk"',
      '16px "IBM Plex Mono"',
    ];
    var ready = 0;
    families.forEach(function (f) {
      if (document.fonts && document.fonts.check(f)) ready++;
    });
    setEl('panel-faces', ready + ' / 3');
  }

  // Viewport size
  function updateViewport() {
    setEl('panel-viewport', window.innerWidth + '×' + window.innerHeight);
  }

  // Reduced-motion preference
  function updateMotion() {
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setEl('panel-motion', mq.matches ? 'reduced' : 'full');
    mq.addEventListener('change', function () {
      setEl('panel-motion', mq.matches ? 'reduced' : 'full');
    });
  }

  // DOM-content-loaded timing
  function updateRender() {
    var entries = performance.getEntriesByType('navigation');
    if (entries && entries.length > 0) {
      var t = entries[0].domContentLoadedEventEnd;
      if (t > 0) {
        setEl('panel-render', t.toFixed(0) + 'ms');
        return;
      }
    }
    setEl('panel-render', '—');
  }

  function init() {
    updateFaces();
    updateViewport();
    updateMotion();
    updateRender();

    window.addEventListener('resize', function () {
      updateViewport();
    });

    // Fonts may complete loading slightly after initial paint
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        updateFaces();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
