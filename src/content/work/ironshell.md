---
title: "IronShell: STL repair"
slug: "ironshell"
cover: "/work/ironshell-cover.svg"
summary: "A web service that repairs broken 3D-print meshes: the seven-headed problem of making a model watertight and manifold, behind a job queue."
role: "Solo developer"
stack: ["TypeScript", "Node", "PostgreSQL", "S3", "Kubernetes", "Docker"]
category: "infra"
repo: "https://github.com/AnmolS1/IronShell"
featured: false
order: 5
---

Upload a broken STL, get back one that'll actually print. The repair engine names and fixes the specific ways a mesh lies about being solid (holes, non-manifold edges, inverted normals, degenerate faces, self-intersections) and lets you choose the goal: preserve geometry, optimize printability, or minimize triangles. It's built as a real pipeline, with a Postgres-backed job queue, S3 for the files, batch jobs, and a Kubernetes deployment, plus a touch I like where the API returns the indices of every face it modified so the frontend can highlight the repairs like a diff.
