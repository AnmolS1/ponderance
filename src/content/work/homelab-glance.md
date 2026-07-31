---
title: "homelab-glance"
slug: "homelab-glance"
cover: "/work/homelab-glance-cover.svg"
summary: "Live homelab stats in a Mac menu bar and on an iPhone home screen, fed by one resilient FastAPI aggregator that degrades a card at a time instead of going blank."
role: "Solo developer"
stack: ["Python", "FastAPI", "httpx", "Swift", "SwiftUI", "WidgetKit"]
category: "infra"
repo: "https://github.com/AnmolS1/homelab-glance"
featured: false
order: 6
---

One FastAPI aggregator polls a dozen homelab services concurrently, merges them into a single snapshot under one lock, so readers never catch a torn read, and hands the whole thing over as one JSON document. The design rule it's built around: when a source goes down, its card keeps its last-good values and gets a `stale` flag, so one dead service never blanks the rest of the dashboard. Containers get found rather than configured, too. Anything it recognises, Jellyfin or Sonarr or qBittorrent, gets a card with the details that service actually has, and everything else gets a generic one with state, CPU, memory and logs, so adding a container to the server is not also a job in the app.

The front end started as two scripts, an Übersicht widget on the Mac desktop and a Scriptable one on my phone, and both are gone now. In their place is a native app that runs on iOS and macOS from the same SwiftUI codebase, with home-screen widgets, a menu-bar panel, and buttons that start and stop containers instead of only reporting on them. The aggregator half is still open source and still the interesting half. It is the piece that has to be honest about what it does not know, and the app is mostly a careful way of showing that.
