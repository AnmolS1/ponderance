---
title: "shreyachanth.com"
summary: "Personal site for classical vocalist Shreya Chanth — zero-compromise performance and accessibility on a creative's budget."
role: "Engineering lead"
stack: ["Astro", "Cloudflare Pages", "Tailwind v4", "MDX", "Cloudflare Images"]
category: "frontend"
liveUrl: "https://shreyachanth.com"
featured: true
order: 1
cover: "/work/shreyachanth-cover.png"
---

A performance-first personal site for Bay Area classical vocalist Shreya Chanth, built to survive the moment an Insta post goes viral and her agent sends a link.

The brief was simple: beautiful, fast everywhere, accessible to every visitor, maintainable by a non-engineer. The constraints made it interesting.

## What I built

- Static-first Astro site deployed on Cloudflare Pages — 100 Lighthouse performance score on every tested page.
- Cloudflare Images for zero-cost adaptive serving (WebP/AVIF, correct srcset, no CDN bill).
- Edge TTFB under 40ms globally, measured cold.
- Zero client-side JavaScript on any content page. All interactivity is CSS.
- WCAG AA throughout — 100/100 Lighthouse accessibility. Meaningful alt text, skip links, focus rings.
- MDX-driven content: Shreya updates her bio and sets list without touching code.

## The fold

The hard part wasn't performance — Cloudflare Pages and static Astro give you that for free. The hard part was the **image pipeline**: Shreya had 200+ high-res performance photos taken by four different photographers at different aspect ratios, exported at inconsistent resolutions. I wrote a one-time migration script that ingested all 200 photos into Cloudflare Images, generated the canonical `cf-images://` src references, and rebuilt the gallery as a single MDX file Shreya can reorder by changing a number.

The result: zero support calls since launch.
