---
title: "Calendar OCR"
slug: "calendar-ocr"
cover: "/work/calendar-ocr-cover.svg"
summary: "An iOS app that reads handwritten events off a photo of a paper calendar and adds them to your phone, where the real work is rebuilding the grid, not reading the letters."
role: "Solo developer"
stack: ["Swift", "AVFoundation", "Google Cloud Vision", "iOS Vision", "EventKit"]
category: "ml"
featured: false
order: 11
---

Photograph a handwritten wall calendar, get the events in your phone. Cloud Vision (with an on-device fallback) handles the handwriting, and the harder, more interesting part is reconstructing the calendar's grid: finding the calendar in the frame, correcting perspective, and binding each scrap of text to the right day cell, because "Dentist 3pm" only means something once you know which day it was written in.
