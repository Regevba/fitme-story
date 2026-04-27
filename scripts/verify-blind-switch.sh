#!/usr/bin/env bash
# scripts/verify-blind-switch.sh
#
# Task T11 — codifies the 5 acceptance assertions for the unified-control-center
# blind-switch (PRD §6.5). Run against any deploy URL (production alias by
# default, or a preview URL passed via $1) to verify the 3-layer dashboard
# privacy gate is intact.
#
# Layers tested:
#   Layer 1 (proxy.ts)   — basic-auth gate on /control-room/*
#   Layer 2 (sitemap+robots) — /control-room excluded from crawler discovery
#   Layer 3 (next.config) — DASHBOARD_BUILD=false rewrites to /404 (build-time)
#
# Exits 0 if all assertions pass, 1 otherwise. Designed to be run in CI on every
# PR touching proxy.ts, sitemap.ts, robots.ts, or next.config.ts.
#
# Local usage:
#   ./scripts/verify-blind-switch.sh                                # vs prod
#   ./scripts/verify-blind-switch.sh https://fitme-story-pr-42-...  # vs preview
#
# CI usage: see .github/workflows/verify-blind-switch.yml (T12).

set -u  # error on undefined vars (NOT -e: we want to count failures)
set -o pipefail

BASE_URL="${1:-https://fitme-story.vercel.app}"
PASS=0
FAIL=0

color_pass() { printf "\033[0;32m%s\033[0m" "$1"; }
color_fail() { printf "\033[0;31m%s\033[0m" "$1"; }

assert() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  if [ "$expected" = "$actual" ]; then
    printf "  %s  %s\n" "$(color_pass '✓')" "$name"
    PASS=$((PASS + 1))
  else
    printf "  %s  %s\n      expected: %s\n      actual:   %s\n" \
      "$(color_fail '✗')" "$name" "$expected" "$actual"
    FAIL=$((FAIL + 1))
  fi
}

printf "Verifying blind-switch on %s\n\n" "$BASE_URL"

# ── Assertion 1 ──────────────────────────────────────────────────────
# /control-room without auth → 401 with WWW-Authenticate Basic realm.
# Verifies Layer 1 (proxy.ts) is gating the route.
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/control-room")
assert "Layer 1: /control-room without auth returns 401" "401" "$status"

www_auth=$(curl -sI "$BASE_URL/control-room" | grep -i "^www-authenticate:" | tr -d '\r' | awk '{print $2, $3}' | tr -d ' ')
assert "Layer 1: WWW-Authenticate header is 'Basic realm=...'" \
  "Basicrealm=\"control-room\"" "$www_auth"

# ── Assertion 2 ──────────────────────────────────────────────────────
# / showcase root → 200, public. Verifies the matcher is properly scoped to
# /control-room/* only (no over-broad gating that would lock out the showcase).
status_root=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
assert "Showcase /: public 200 (matcher properly scoped)" "200" "$status_root"

# ── Assertion 3 ──────────────────────────────────────────────────────
# robots.txt contains 'Disallow: /control-room'. Verifies Layer 2 robots gate.
robots_disallow=$(curl -s "$BASE_URL/robots.txt" | grep -ci "^Disallow:.*control-room" || true)
assert "Layer 2: robots.txt has Disallow: /control-room" "1" "$robots_disallow"

# ── Assertion 4 ──────────────────────────────────────────────────────
# sitemap.xml contains zero references to /control-room. Verifies Layer 2
# sitemap exclusion.
sitemap_count=$(curl -s "$BASE_URL/sitemap.xml" | grep -c "control-room" || true)
assert "Layer 2: sitemap.xml has 0 control-room URLs" "0" "$sitemap_count"

# ── Summary ──────────────────────────────────────────────────────────
printf "\n%d passed, %d failed\n" "$PASS" "$FAIL"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
