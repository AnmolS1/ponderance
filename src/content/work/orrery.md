---
title: "Orrery"
slug: "orrery"
cover: "/work/orrery-cover.svg"
ogImage: "/work/orrery-og.png"
summary: "A live map of everything under Ponderance: every app and site a node, every link between them a bridge that goes red when the two ends drift, all of it derived from the code so it can't quietly go stale."
role: "Solo developer"
stack: ["TypeScript", "Astro", "Cloudflare Workers", "D1", "KV", "R2", "Hono", "Cytoscape", "GitHub Apps", "Cloudflare Access"]
category: "infra"
featured: false
order: 21
---

Orrery is a map of everything under Ponderance, drawn as one big board you can zoom out of and scroll around. Every app, every site, every workshop post and legal page is a node, and the lines between them are the things that are supposed to stay in agreement, like an app and the privacy page that describes it, or a project and the shared design spec it pulls its themes from, or one of these old workshop posts and the code it was actually about, which by now is usually wrong. The name is the old mechanical kind, a desk model of orbits you can spin, which is roughly what it feels like with ponderance.dev sitting in the middle and everything else circling it.

The rule I care about is that nothing on the board is typed by hand. Every node and every line is derived from the real repositories and the live services, so it can't drift from reality the way a document I'd have to remember to update always does. A line goes red when the two ends disagree, a support page that still says something's free after it grew a paid tier, or a worker whose deployed commit is behind the branch I thought was live, and it stays red until the actual thing is fixed, not until I tell it to be quiet. It even keeps a node for itself, so if the machinery that's supposed to keep the board honest quietly stops running, the board is the first place that admits it. I built it because I've shipped enough by now that holding all of it in my head, or in any one coding session, stopped working.

*(In progress; not yet public.)*
