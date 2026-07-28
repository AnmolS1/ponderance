export const prerender = false;

import type { APIRoute } from 'astro';
// Astro v6 REMOVED `Astro.locals.runtime.env` — it is now a getter that THROWS, so the
// old `locals.runtime.env` line 500'd on every POST (empty body, no worker log, because
// the throw happens on the first statement of the handler). Bindings come from the
// runtime module now. Reproduce any regression here with:
//   curl -X POST https://ponderance.dev/api/inquiry -H 'Origin: https://ponderance.dev' -F name=x -F email=x@y.z -F message=z
// — without the Origin header Astro's CSRF check returns 403 and you never reach this code.
import { env as workerEnv } from 'cloudflare:workers';
import { SUPPORT_IDS } from '../../data/support';

interface Env {
  RATE_LIMIT: KVNamespace;
  RESEND_API_KEY: string;
  INQUIRY_DEST_EMAIL: string;
  TURNSTILE_SECRET_KEY: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  // Cast: the generated Cloudflare.Env carries the wrangler.jsonc bindings (RATE_LIMIT)
  // but not the secrets, which are set with `wrangler secret put`.
  const env = workerEnv as unknown as Env;

  // Parse multipart or urlencoded form body
  let body: FormData;
  try {
    body = await request.formData();
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  // Honeypot: bots fill the hidden company field; humans never see it
  if (body.get('company')) {
    return json({ ok: true }); // silent discard
  }

  // Extract and sanitise fields
  const name    = String(body.get('name')    ?? '').trim();
  const email   = String(body.get('email')   ?? '').trim();
  const project = String(body.get('project') ?? '').trim();
  const message = String(body.get('message') ?? '').trim();
  const token   = String(body.get('cf-turnstile-response') ?? '');

  // A /support/<app> page posts its product id here so the mail is labelled with the
  // app it is about. Membership in the registry is the test: anything else — absent,
  // garbage, or invented by a bot — falls through to the commissions path untouched,
  // so this field can never become a new way to make the endpoint 400.
  const app = String(body.get('app') ?? '').trim();
  const isSupport = SUPPORT_IDS.includes(app);

  // Field validation
  if (!name || name.length > 200)
    return json({ error: 'invalid_name' }, 400);
  if (!email || !email.includes('@') || email.length > 254)
    return json({ error: 'invalid_email' }, 400);
  if (message.length > 5000)
    return json({ error: 'message_too_long' }, 400);

  // Turnstile server-side verification
  if (!token)
    return json({ error: 'missing_captcha' }, 400);

  const tsForm = new FormData();
  tsForm.append('secret', env.TURNSTILE_SECRET_KEY);
  tsForm.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  if (ip) tsForm.append('remoteip', ip);

  const tsRes  = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: tsForm,
  });
  // Keep the error codes. They are the only thing that distinguishes a misconfigured
  // secret (`invalid-input-secret`) from an expired/reused token (`timeout-or-duplicate`)
  // from a genuinely bad one (`invalid-input-response`) — and without them a support
  // form that rejects everyone looks identical to one working as intended. The codes are
  // documented, non-sensitive values; returning them costs nothing and makes this
  // diagnosable from the browser instead of requiring a deploy to find out.
  const tsData = await tsRes.json() as { success: boolean; 'error-codes'?: string[] };
  if (!tsData.success) {
    const codes = tsData['error-codes'] ?? [];
    console.warn(`[inquiry] turnstile verify failed: ${codes.join(',') || 'no codes'}`);
    return json({ error: 'captcha_failed', codes, diag: { keys: Object.keys(env), tsLen: String(env.TURNSTILE_SECRET_KEY ?? '').length, reLen: String(env.RESEND_API_KEY ?? '').length, kv: typeof env.RATE_LIMIT } }, 403);
  }

  // KV rate limiting: 5 per IP per hour
  const rateKey = `ip:${ip || 'unknown'}`;
  const countStr = await env.RATE_LIMIT.get(rateKey);
  const count = countStr ? parseInt(countStr, 10) : 0;
  if (count >= 5)
    return json({ error: 'rate_limited' }, 429);
  await env.RATE_LIMIT.put(rateKey, String(count + 1), { expirationTtl: 3600 });

  // Send inquiry email via Resend
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'ponderance.dev <noreply@ponderance.dev>',
      to: [env.INQUIRY_DEST_EMAIL],
      reply_to: email,
      subject: isSupport ? `Support · ${app} — ${name}` : `Commission inquiry from ${name}`,
      text: [
        isSupport ? `App: ${app}` : '',
        `Name: ${name}`,
        `Email: ${email}`,
        project ? `Project: ${project}` : '',
        '',
        message,
      ].filter(Boolean).join('\n'),
    }),
  });

  if (!resendRes.ok)
    return json({ error: 'send_failed' }, 502);

  return json({ ok: true });
};

// Return 405 for anything other than POST
export const GET: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
