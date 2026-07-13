---
title: "FlatFold: a messenger that keeps nothing"
slug: "flatfold"
cover: "/work/flatfold-cover.svg"
summary: "The weeboweebo family chat, rebuilt into a browser messenger with real end-to-end encryption and a server that keeps no messages, so there's nothing to hand over when someone comes asking."
role: "Solo developer"
stack: ["React", "TypeScript", "Cloudflare Workers", "Durable Objects", "D1", "Web Crypto"]
category: "security"
liveUrl: "https://flatfold.ponderance.dev"
featured: false
order: 13
---

weeboweebo started as a browser chat app so my family could reach my sisters after their school banned phones. This is that project grown up, and renamed. I rebuilt it into FlatFold, an end-to-end encrypted messenger that runs entirely in a browser and is built so the server knows as little about you as it possibly can. Messages are encrypted on your own device with the real Signal machinery, X3DH to open a conversation and a double ratchet to keep it going, all sitting on audited crypto primitives instead of anything I hand-rolled. The server is a Cloudflare Worker with a Durable Object mailbox for each person, and it only ever holds ciphertext, only while you're offline, and it throws that away the moment your other device says the message landed. No message history, no contact lists, no read receipts, no IP logs. The name is an origami term for a crease pattern that folds completely flat, which is about how flat I wanted the server's memory of you to be.

The part I sank the most time into isn't a feature you can point at. There's a transparency page that lists every single field the database stores and says plainly what a subpoena could pull out of it, and a test fails the build if that page ever drifts from the real schema, so it can't quietly start lying. I went down a long hole on sealed sender too, which hides who you're talking to on top of what you're saying, and that meant routing sends through an independent relay run by a different company, so no single party ever sees both your address and your message. And where a messenger that lives in a browser is weaker than a real installed app, because the same server that carries your messages also hands you the code that reads them, I wrote that down on the page instead of hiding it. If I'm going to ask people to trust it, the honest move is to be specific about how far that trust should actually go.
