#!/usr/bin/env bash
# Gate validator: assert _headers file in dist has the full security header set
set -e

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
HEADERS_FILE="$REPO/dist/client/_headers"

if [ ! -f "$HEADERS_FILE" ]; then
  echo "FAIL: _headers not found at $HEADERS_FILE"
  exit 1
fi

echo "Checking $HEADERS_FILE..."

FAIL=0

check_header() {
  local name="$1"
  local expected="$2"
  if grep -qF "$expected" "$HEADERS_FILE"; then
    echo "  ✓ $name"
  else
    echo "  ✗ MISSING or WRONG: $name"
    echo "    Expected to find: $expected"
    FAIL=1
  fi
}

check_header "CSP default-src"          "default-src 'none'"
check_header "CSP script-src self"      "script-src 'self'"
check_header "CSP Turnstile script-src" "https://challenges.cloudflare.com"
check_header "CSP frame-ancestors"      "frame-ancestors 'none'"
check_header "CSP frame-src Turnstile"  "frame-src https://challenges.cloudflare.com"
check_header "CSP upgrade-insecure"     "upgrade-insecure-requests"
check_header "HSTS"                     "Strict-Transport-Security: max-age=31536000; includeSubDomains"
check_header "X-Frame-Options"          "X-Frame-Options: DENY"
check_header "X-Content-Type-Options"   "X-Content-Type-Options: nosniff"
check_header "Referrer-Policy"          "Referrer-Policy: strict-origin-when-cross-origin"
check_header "COOP"                     "Cross-Origin-Opener-Policy: same-origin"
check_header "CORP"                     "Cross-Origin-Resource-Policy: same-origin"
check_header "Permissions-Policy"       "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()"

# Assert no wildcard ACAO
if grep -q "Access-Control-Allow-Origin: \*" "$HEADERS_FILE"; then
  echo "  ✗ FAIL: wildcard ACAO found in _headers"
  FAIL=1
else
  echo "  ✓ No wildcard Access-Control-Allow-Origin"
fi

# Assert no Domain= on Set-Cookie
if grep -qi "Domain=" "$HEADERS_FILE"; then
  echo "  ✗ FAIL: Domain= found in _headers (must be host-only)"
  FAIL=1
else
  echo "  ✓ No Domain= in _headers cookies"
fi

if [ "$FAIL" -eq 1 ]; then
  echo "FAIL: Security header gate failed"
  exit 1
fi

echo "PASS: All security headers present and correct"
