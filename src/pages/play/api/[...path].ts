export const prerender = false;

import type { APIRoute } from 'astro';
// Astro v6 REMOVED `Astro.locals.runtime.env` — it is now a getter that THROWS.
// See the comment in `src/pages/api/inquiry.ts`, which documents the silent 500
// that cost an afternoon. Bindings come from the runtime module.
import { env as workerEnv } from 'cloudflare:workers';

/**
 * `/play/api/*` → the `ponderance-play` Worker, over the `PLAY` service binding.
 *
 * This route is the *entire* public surface of the game's backend. `deadhead`
 * runs as a second Worker with **no route of its own**, reachable only through
 * this binding, which is what keeps `scripts/validate/wrangler-routes.sh` at
 * exactly two routes with no wildcards — the game is same-origin and
 * path-routed, never `taxi.ponderance.dev`.
 *
 * Same-origin is not an aesthetic choice. It is what satisfies
 * `connect-src 'self'` for the game's WebSocket without touching the CSP at
 * all: per the WebSockets Standard the handshake URL is rewritten to `https://`
 * before it reaches Fetch, and CSP3 §6.7.2.8 additionally matches `'self'`
 * against `wss:`. (MDN carries a stale note claiming otherwise, linking a w3c
 * issue closed since 2015. Ignore it. Do not add `wss:` to the policy.)
 *
 * Three rules, each of which otherwise costs an afternoon:
 *
 * 1. **Forward the original `Request`. Do not rebuild it.** `env.PLAY.fetch()`
 *    preserves `Upgrade: websocket` only if it is handed the same object. A
 *    reconstructed Request drops it and workerd rejects the 101 with
 *    `TypeError: Worker tried to return a WebSocket in a response to a request
 *    which did not contain the header "Upgrade: websocket"`.
 *
 * 2. **Never `clone()` the response.** workerd throws `Cannot clone a response
 *    to a WebSocket handshake.` So: no response logging middleware here, ever.
 *
 * 3. **Do not strip the `/play/api` prefix.** The play Worker normalises it
 *    itself (`packages/server/src/routes.ts` → `routePath()`), so that both
 *    `curl localhost:8787/health` against a bare `wrangler dev` and
 *    `/play/api/health` in production hit the same route. Rewriting the URL
 *    here would mean rebuilding the Request, which is rule 1.
 *
 * Local development needs **one** dev server, not two — CSP matches host *and*
 * port, so a page on `:4321` talking to a Worker on `:8787` is blocked exactly
 * as production would block a cross-origin socket. Use the multi-config form:
 *
 *     npm run build
 *     npx wrangler@4.123.0 dev -c dist/server/wrangler.json \
 *                             -c ../deadhead/packages/server/wrangler.jsonc
 *
 * The pinned version is deliberate: this repo's wrangler is `4.104.0`, whose
 * bundled workerd predates the play Worker's `compatibility_date`
 * (`2026-08-18`) and refuses to boot it. A newer wrangler runs an older
 * compatibility date happily; the reverse is not true.
 */
interface PlayEnv {
  PLAY: Fetcher;
}

/**
 * `ALL`, not `GET`. Auth (`B-03`) posts here, score submission (`B-07`) posts
 * here, and the WebSocket handshake is a `GET` carrying an `Upgrade` header —
 * a method-specific export would 404 two of the three, weeks after this file
 * stopped being the suspect.
 */
export const ALL: APIRoute = ({ request }) => {
  const env = workerEnv as unknown as PlayEnv;

  // A missing binding here means the deploy config lost the `services` entry in
  // the adapter's merge. Answer with something diagnosable rather than letting
  // `undefined.fetch` throw an opaque 500 — the same failure mode, and the same
  // invisibility, as the `locals.runtime.env` regression.
  if (!env.PLAY) {
    return new Response(JSON.stringify({ error: 'play_binding_missing' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  // Rules 1 and 2, in one line each way: the request goes through untouched and
  // the response comes back untouched.
  return env.PLAY.fetch(request);
};
