#!/usr/bin/env bash
# Gate: verify design token CSS and all keyframes are present in built output
set -e

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
CSS_DIR="$REPO/dist/client/_astro"
CSS_COUNT=$(find "$CSS_DIR" -name "*.css" | wc -l | tr -d ' ')

if [ "$CSS_COUNT" -eq 0 ]; then
  echo "FAIL: No CSS files found in dist/client/_astro/"
  exit 1
fi

echo "Checking $CSS_COUNT CSS file(s) in $CSS_DIR ..."
FAIL=0

check() {
  local name="$1"; local needle="$2"
  # Search ALL css files, case-insensitive (minifier lowercases hex values)
  if find "$CSS_DIR" -name "*.css" -exec grep -qiF "$needle" {} \; -print -quit | grep -q .; then
    echo "  ✓ $name"
  else
    echo "  ✗ MISSING: $name"
    echo "    Expected: $needle"
    FAIL=1
  fi
}

# Token colors (minifier lowercases hex, so these match case-insensitively)
check "color-graph token"       "#EEF0EC"
check "color-graphite token"    "#1B2A33"
check "color-crease token"      "#2E5E8C"
check "color-crane token"       "#E84A27"
check "color-sax token"         "#D9A521"
check "color-orbit token"       "#2A2A6E"

# Graph-paper background
check "graph-paper background"  "background-size:32px 32px"

# Keyframe animations
check "craneDraw keyframe"   "craneDraw"
check "facetIn keyframe"     "facetIn"
check "riseIn keyframe"      "riseIn"
check "flapL keyframe"       "flapL"
check "flapR keyframe"       "flapR"
check "blink keyframe"       "blink"
check "twinkle keyframe"     "twinkle"
check "cdrift keyframe"      "cdrift"
check "orbitA keyframe"      "orbitA"
check "orbitB keyframe"      "orbitB"
check "snapIn keyframe"      "snapIn"
check "signal keyframe"      "signal"
check "pulseDot keyframe"    "pulseDot"
check "stampIn keyframe"     "stampIn"
check "growBar keyframe"     "growBar"

# Reduced motion guard
check "reduced-motion gate"  "prefers-reduced-motion"

# Font families
check "Bricolage Grotesque"  "Bricolage Grotesque"
check "Hanken Grotesk"       "Hanken Grotesk"
check "IBM Plex Mono"        "IBM Plex Mono"

if [ "$FAIL" -eq 1 ]; then
  echo "FAIL: Design system gate failed"
  exit 1
fi

echo "PASS: Design system tokens, keyframes, and fonts confirmed in built CSS"
