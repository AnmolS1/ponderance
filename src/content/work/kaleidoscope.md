---
title: "Kaleidoscope"
slug: "kaleidoscope"
cover: "/work/kaleidoscope-cover.svg"
summary: "A browser drawing toy that mirrors every stroke across a set of rotated axes, so a few scribbles fall out as a full mandala. Stalled for years as a prototype, now rebuilt from scratch and live."
role: "Solo developer"
stack: ["TypeScript", "Canvas", "Cloudflare Workers", "Hono", "D1 / R2"]
category: "frontend"
repo: "https://github.com/AnmolS1/kaleidoscope"
liveUrl: "https://kaleidoscope.ponderance.dev"
featured: false
order: 14
---

You scribble on the canvas and every stroke gets mirrored across a set of rotated axes, so a few lazy lines come out as a full mandala. That part's the same as the toy I built years ago and then abandoned. This is the rebuild.

The old version was sixteen fixed mirrors, jQuery, and a button that saved a flat jpg. Now you can change how many ways the canvas folds, switch between true mirror symmetry and plain rotation, and the strokes are kept as actual data instead of pixels, so undo works, the exports come out crisp at any size, you get a real SVG if you want one, and a saved piece is a few kilobytes instead of a giant image. Draw and download as much as you like, no account. Sign in and you can save a piece to a gallery, where it gets its own link, and pull up someone else's to keep drawing on top of it.

It runs entirely on Cloudflare, so it's basically free to leave up and it doesn't fall over if a few hundred people show up at once. The whole thing sat on my someday list for years. Took me long enough.

*(Live at kaleidoscope.ponderance.dev.)*
