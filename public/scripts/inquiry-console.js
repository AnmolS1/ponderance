// Inquiry console client island — external file, CSP-clean under script-src 'self'
// Intercepts form submit, POSTs to /api/inquiry via fetch, shows status in #console-status

(function () {
  var form   = document.getElementById('inquiry-form');
  var status = document.getElementById('console-status');
  var btn    = form && form.querySelector('button[type="submit"]');

  if (!form || !status) return;

  function setStatus(msg, color) {
    status.textContent = msg;
    status.style.color = color || '#9fd1a0';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Guard: Turnstile must have run
    var tsInput = form.querySelector('[name="cf-turnstile-response"]');
    if (!tsInput || !tsInput.value) {
      setStatus('# please complete the security check first', '#D9A521');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'sending…';
    }
    setStatus('# transmitting…');

    var data = new FormData(form);

    fetch('/api/inquiry', { method: 'POST', body: data })
      .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, body: j }; }); })
      .then(function (result) {
        if (result.ok && result.body.ok) {
          setStatus("# sent — I'll be in touch soon");
          form.reset();
          // Reset Turnstile widget if available
          if (window.turnstile) window.turnstile.reset();
        } else {
          var msg = {
            invalid_name:    '# name is required (max 200 chars)',
            invalid_email:   '# valid email required',
            message_too_long:'# message too long (max 5000 chars)',
            missing_captcha: '# security check incomplete',
            captcha_failed:  '# security check failed — please try again',
            rate_limited:    '# too many submissions — try again in an hour',
            send_failed:     '# something went wrong on our end — email hello@ponderance.dev',
          }[result.body.error] || '# an unexpected error occurred';
          setStatus(msg, '#E84A27');
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'RUN →';
          }
        }
      })
      .catch(function () {
        setStatus('# network error — check your connection', '#E84A27');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'RUN →';
        }
      });
  });
})();
