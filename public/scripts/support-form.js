// Support contact form island — external file, CSP-clean under script-src 'self'.
//
// Progressive enhancement only: with JS off (or this file blocked) the form still
// POSTs to /api/inquiry the ordinary way, and the mailto: above it is the guaranteed
// route either way. Nothing on the page depends on this running.

(function () {
  var form = document.getElementById('support-form');
  var status = document.getElementById('support-status');
  if (!form || !status) return;

  var btn = form.querySelector('button[type="submit"]');
  var BTN_LABEL = btn ? btn.textContent : 'Send';

  // The aria-live region is announced on text change; data-state drives the colour.
  function setStatus(msg, state) {
    status.textContent = msg;
    status.setAttribute('data-state', state || 'info');
  }

  function setBusy(busy) {
    if (!btn) return;
    btn.disabled = busy;
    btn.textContent = busy ? 'Sending…' : BTN_LABEL;
  }

  var ERRORS = {
    invalid_name: 'Please add your name (200 characters max).',
    invalid_email: 'That email address does not look right — I need somewhere to reply.',
    message_too_long: 'That message is over the 5000-character limit. Trim it, or email it instead.',
    missing_captcha: 'Please complete the security check first.',
    captcha_failed: 'The security check failed. Reload the page and try once more.',
    rate_limited: 'Too many messages from here in the last hour. Email anmol@ponderance.dev directly.',
    send_failed: 'Something broke on my end. Please email anmol@ponderance.dev directly.',
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var ts = form.querySelector('[name="cf-turnstile-response"]');
    if (!ts || !ts.value) {
      setStatus('Please complete the security check first.', 'error');
      return;
    }

    setBusy(true);
    setStatus('Sending…');

    fetch('/api/inquiry', { method: 'POST', body: new FormData(form) })
      .then(function (res) {
        return res.json().then(function (body) {
          return { ok: res.ok, body: body };
        });
      })
      .then(function (result) {
        setBusy(false);
        if (result.ok && result.body.ok) {
          setStatus('Sent. You will hear back within two business days.', 'ok');
          form.reset();
          if (window.turnstile) window.turnstile.reset();
        } else {
          setStatus(ERRORS[result.body.error] || 'Something went wrong. Please email anmol@ponderance.dev.', 'error');
        }
      })
      .catch(function () {
        setBusy(false);
        setStatus('Network error — check your connection, or email anmol@ponderance.dev.', 'error');
      });
  });
})();
