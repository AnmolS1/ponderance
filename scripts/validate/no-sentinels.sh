#!/usr/bin/env bash
# Gate validator: assert no `TODO_` placeholder reaches a served page.
# The registry keeps unfilled values (the DMCA agent, until it is registered) as `TODO_*`
# sentinels so one grep finds them; the pages must render a fallback instead of printing one.
# Scans dist/client only: dist/server bundles the registry itself, sentinels and all.
set -e

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
CLIENT="$REPO/dist/client"

if [ ! -d "$CLIENT" ]; then
  echo "FAIL: dist/client not found — run npm run build first"
  exit 1
fi

PAGES=$(find "$CLIENT" -name "*.html" | wc -l | tr -d ' ')
if [ "$PAGES" -eq 0 ]; then
  echo "FAIL: no HTML pages in $CLIENT — nothing was checked"
  exit 1
fi

echo "Checking $PAGES page(s) and assets in $CLIENT for TODO_ sentinels..."

HITS=$(grep -rl 'TODO_' "$CLIENT" 2>/dev/null || true)

if [ -n "$HITS" ]; then
  echo "FAIL: TODO_ sentinel found in built output:"
  echo "$HITS"
  grep -rho '.\{0,60\}TODO_[A-Z_]*.\{0,20\}' "$CLIENT" | head -10
  exit 1
fi

echo "PASS: No TODO_ sentinels in dist/client ($PAGES pages)"
