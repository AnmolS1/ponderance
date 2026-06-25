---
title: "homelab-glance"
slug: "homelab-glance"
cover: "/work/homelab-glance-cover.svg"
summary: "Live homelab stats on a macOS desktop and an iOS home screen, fed by one resilient FastAPI aggregator that degrades a card at a time instead of going blank."
role: "Solo developer"
stack: ["Python", "FastAPI", "httpx", "Übersicht", "Scriptable"]
category: "infra"
repo: "https://github.com/AnmolS1/homelab-glance"
featured: false
order: 6
---

One FastAPI aggregator polls a dozen homelab services concurrently, merges them into a single snapshot under one lock (so readers never catch a torn read), and feeds both an Übersicht widget on the Mac desktop and a Scriptable widget on my phone. The design rule it's built around: when a source goes down, its card keeps its last-good values and gets a `stale` flag, so one dead service never blanks the rest of the dashboard.
