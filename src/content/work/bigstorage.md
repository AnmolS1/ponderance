---
title: "BigStorage"
slug: "bigstorage"
cover: "/work/bigstorage-cover.svg"
summary: "A Google Drive clone: auth, file storage, folders, sharing, and trash, on Next.js and AWS."
role: "Solo developer"
stack: ["Next.js", "React", "TypeScript", "Material-UI", "AWS S3", "AWS Cognito", "DynamoDB", "Vercel"]
category: "infra"
featured: false
order: 8
---

A from-scratch Drive clone, built deliberately the hard way. Instead of assuming I knew the right approach for each piece, I worked out the actual best way to do auth retention, uploads, sharing, and the rest, one piece at a time. Cognito for accounts, S3 for files, DynamoDB for metadata, with folder navigation, previews, search, file sharing, and soft-delete trash on top.
