---
title: "Sister Isles"
slug: "sister-isles"
cover: "/work/sister-isles-cover.svg"
summary: "A cozy multiplayer life-sim where every island is its own hibernating Durable Object: stateful serverless that mostly doesn't exist until you say its name."
role: "Solo developer"
stack: ["Phaser 3", "TypeScript", "Vite", "Cloudflare Workers", "Durable Objects", "D1", "Cloudflare Access"]
category: "games"
featured: false
order: 3
---

A whimsical co-op life-sim about little islands of characters, still in progress. The interesting half is the backend: each island is its own Cloudflare Durable Object, a tiny stateful server addressed by name that hibernates when nobody's around and wakes up still remembering who was connected (sessions are serialized onto the sockets so they survive the sleep). Identity comes from Cloudflare Access, persistent records live in D1, and a UUID guard in the request path keeps callers from conjuring objects they shouldn't. *(In progress; not yet public.)*
