export const prerender = false;

import type { APIRoute } from 'astro';
import { STAMP } from '../stamp.generated';

/**
 * Build stamp (Orrery spec §10, contracts §4) — `orrery-stamp`.
 *
 * Values are baked in at build time by `scripts/gen-stamp.mjs`; the generated
 * module is gitignored, because a stamp that can be hand-edited is a claim
 * rather than a stamp.
 *
 * `no-store` is load-bearing: a cached stamp describes the PREVIOUS deploy,
 * which is exactly the question this endpoint exists to answer.
 */
export const GET: APIRoute = () =>
  new Response(JSON.stringify(STAMP), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
