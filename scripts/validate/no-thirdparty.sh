#!/usr/bin/env bash
# Gate validator: assert zero third-party CDN origins in built dist/
# Allowed exception: challenges.cloudflare.com (Turnstile, added explicitly)
set -e

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
DIST="$REPO/dist"

if [ ! -d "$DIST" ]; then
  echo "FAIL: dist/ not found — run npm run build first"
  exit 1
fi

echo "Checking $DIST for banned third-party origins..."

PATTERNS="googleapis\.com|gstatic\.com|jsdelivr\.net|unpkg\.com|fontsource\.io|fonts\.gstatic|fonts\.googleapis"

HITS=$(grep -rE "$PATTERNS" "$DIST" --include="*.html" --include="*.js" --include="*.css" --include="*.mjs" 2>/dev/null | wc -l | tr -d ' ')

if [ "$HITS" -gt 0 ]; then
  echo "FAIL: $HITS banned third-party origin references found:"
  grep -rE "$PATTERNS" "$DIST" --include="*.html" --include="*.js" --include="*.css" --include="*.mjs" | head -20
  exit 1
fi

echo "PASS: No banned third-party origins in dist/ (0 hits)"
