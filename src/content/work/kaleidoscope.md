---
title: "Kaleidoscope"
slug: "kaleidoscope"
cover: "/work/kaleidoscope-cover.svg"
summary: "A drawing toy that mirrors every stroke across a set of rotated axes, so a few scribbles fall out as a full mandala. Stalled for years as a prototype, now rebuilt from scratch for the browser and for the phone."
role: "Solo developer"
stack: ["TypeScript", "Canvas", "Cloudflare Workers", "Hono", "D1 / R2", "Swift", "Core Graphics"]
category: "frontend"
repo: "https://github.com/AnmolS1/kaleidoscope"
liveUrl: "https://kaleidoscope.ponderance.dev"
featured: false
order: 14
---

You scribble on the canvas and every stroke gets mirrored across a set of rotated axes, so a few lazy lines come out as a full mandala. That part's the same as the toy I built years ago and then abandoned. This is the rebuild.

The old version was sixteen fixed mirrors, jQuery, and a button that saved a flat jpg. Now you can change how many ways the canvas folds, switch between true mirror symmetry and plain rotation, and the strokes are kept as actual data instead of pixels, so undo works, the exports come out crisp at any size, you get a real SVG if you want one, and a saved piece is a few kilobytes instead of a giant image. Draw and download as much as you like, no account. Sign in and you can save a piece to a gallery, where it gets its own link, and pull up someone else's to keep drawing on top of it.

It runs entirely on Cloudflare, so it's basically free to leave up and it doesn't fall over if a few hundred people show up at once.

There's a native iPhone app now as well, and the part I'm happiest with is that the symmetry math didn't get written twice. The engine was ported to Swift and then pinned to the web one by a test that renders the same drawing through both and compares the output byte for byte, so a stroke made on the phone and the same stroke made in a browser are provably the same picture rather than approximately the same picture. On top of that it draws through Core Graphics instead of a canvas, signs in with Apple or Google, saves to the same gallery the web app uses, and puts a home-screen widget on your phone that shows a random piece from it. A later pass took the whole thing through VoiceOver and Dynamic Type, which for a drawing app mostly meant admitting that a mandala needs a written description, so the gallery generates one.

The whole thing sat on my someday list for years. Took me long enough.

*(Live at kaleidoscope.ponderance.dev.)*
