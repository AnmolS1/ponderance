#!/usr/bin/env bash
# Gate validator: assert self-hosted woff2 fonts present in dist/
# and zero external font requests in built output.
set -e

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
DIST="$REPO/dist"

if [ ! -d "$DIST" ]; then
  echo "FAIL: dist/ not found — run npm run build first"
  exit 1
fi

echo "Checking bundled fonts in $DIST..."

REQUIRED_FONTS=(
  "bricolage-grotesque-wght.woff2"
  "hanken-grotesk-wght.woff2"
  "hanken-grotesk-wght-italic.woff2"
  "ibm-plex-mono-400.woff2"
  "ibm-plex-mono-500.woff2"
  "ibm-plex-mono-600.woff2"
  "ibm-plex-mono-700.woff2"
)

FAIL=0
for font in "${REQUIRED_FONTS[@]}"; do
  if find "$DIST" -name "$font" | grep -q .; then
    echo "  ✓ $font"
  else
    echo "  ✗ MISSING: $font"
    FAIL=1
  fi
done

if [ "$FAIL" -eq 1 ]; then
  echo "FAIL: One or more required fonts missing from dist/"
  exit 1
fi

# Assert no external font CDN requests in built HTML/CSS
EXT_FONTS=$(grep -rE "fonts\.googleapis|fonts\.gstatic|use\.typekit|cloud\.typography|typekit\.net" \
  "$DIST" --include="*.html" --include="*.css" 2>/dev/null | wc -l | tr -d ' ')

if [ "$EXT_FONTS" -gt 0 ]; then
  echo "FAIL: External font requests found in dist/:"
  grep -rE "fonts\.googleapis|fonts\.gstatic|use\.typekit|cloud\.typography|typekit\.net" \
    "$DIST" --include="*.html" --include="*.css"
  exit 1
fi

echo "PASS: All fonts self-hosted, no external font CDN requests"
