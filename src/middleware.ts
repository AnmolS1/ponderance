import { defineMiddleware } from "astro:middleware";

const ALLOWED_ORIGINS = new Set([
  "https://ponderance.dev",
  "https://www.ponderance.dev",
]);

export const onRequest = defineMiddleware(async (context, next) => {
  // CORS only for the API endpoint
  if (!context.url.pathname.startsWith("/api/")) {
    return next();
  }

  const origin = context.request.headers.get("Origin");

  // Preflight
  if (context.request.method === "OPTIONS") {
    const headers = new Headers();
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type");
      headers.set("Access-Control-Max-Age", "86400");
    }
    return new Response(null, { status: 204, headers });
  }

  const response = await next();
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  return response;
});
