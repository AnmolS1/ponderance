#!/usr/bin/env bash
# Gate validator: assert wrangler.jsonc has exactly 2 routes, no wildcards
set -e

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
WRANGLER="$REPO/wrangler.jsonc"

if [ ! -f "$WRANGLER" ]; then
  echo "FAIL: wrangler.jsonc not found at $WRANGLER"
  exit 1
fi

echo "Parsing $WRANGLER..."

# Strip JSONC comments and validate with Node
node --input-type=module << 'EOF'
import { readFileSync } from 'fs';
import { resolve } from 'path';

const wranglerPath = resolve(process.cwd(), 'wrangler.jsonc');
const raw = readFileSync(wranglerPath, 'utf-8');

// Strip // line comments (not inside strings — good enough for this controlled file)
const stripped = raw.replace(/\/\/[^\n]*/g, '');
let config;
try {
  config = JSON.parse(stripped);
} catch (e) {
  console.error('FAIL: wrangler.jsonc is not valid JSON after stripping comments:', e.message);
  process.exit(1);
}

const routes = config.routes;
if (!Array.isArray(routes)) {
  console.error('FAIL: config.routes is not an array');
  process.exit(1);
}

if (routes.length !== 2) {
  console.error(`FAIL: expected exactly 2 routes, got ${routes.length}`);
  process.exit(1);
}

const wildcard = routes.find(r => r.pattern && r.pattern.includes('*'));
if (wildcard) {
  console.error(`FAIL: route pattern contains wildcard: ${wildcard.pattern}`);
  process.exit(1);
}

const patterns = routes.map(r => r.pattern);
const expected = ['ponderance.dev', 'www.ponderance.dev'];
const missing = expected.filter(p => !patterns.includes(p));
if (missing.length > 0) {
  console.error(`FAIL: missing required route patterns: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`PASS: routes.length === 2, no wildcards`);
console.log(`  Route 1: ${routes[0].pattern} (custom_domain: ${routes[0].custom_domain})`);
console.log(`  Route 2: ${routes[1].pattern} (custom_domain: ${routes[1].custom_domain})`);
EOF
