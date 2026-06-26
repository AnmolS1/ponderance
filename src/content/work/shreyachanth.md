---
title: "Shreya Chanth"
slug: "shreyachanth"
cover: "/work/shreyachanth-cover.svg"
summary: "A production portfolio and lead-capture site for a fitness coach: the design, the build, and the serverless plumbing behind the contact form."
role: "Designer & full-stack developer (solo)"
stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Cloudflare Pages", "Pages Functions", "R2", "Resend", "Turnstile"]
category: "frontend"
repo: "https://github.com/AnmolS1/shreyachanth"
liveUrl: "https://shreyachanth.com"
featured: true
order: 1
---

This is the one that has to actually work, for a real client, in front of real visitors. It's a fitness coach's site. The front is the easy half to describe (React, Vite, Tailwind, deployed to Cloudflare Pages), and the half I'm more interested in is the back. The contact form and the Instagram feed both run on Cloudflare Pages Functions, so there's no server I babysit. The form posts to a function that talks to Resend for delivery, and a second function proxies Instagram so the page never ships a token to the browser. Media is self-hosted in R2 instead of leaning on a third party, and Turnstile keeps the contact form from becoming a spam funnel. I kept one rule the whole way through: the approved design prototype is the single source of truth, and every visual decision gets settled against it instead of against my mood that day.
