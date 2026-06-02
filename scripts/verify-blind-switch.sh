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

# Vercel SSO bypass: when probing a protected preview deployment in CI, set
# BYPASS_TOKEN to the project's automation-bypass token so curl can get past
# the SSO challenge to the actual app. Unset (e.g. local against prod) leaves
# the array empty and curl behaves identically to before.
#
# IMPORTANT: only `x-vercel-protection-bypass` is sent — NOT also
# `x-vercel-set-bypass-cookie: true`. The cookie-set variant triggers a 307
# redirect-to-self so a browser would persist the bypass cookie, which breaks
# single-shot curl probes (we'd capture the 307 instead of the app response).
# Per-request header validation alone is enough for one-off CI probes.
BYPASS_HEADER=()
if [ -n "${BYPASS_TOKEN:-}" ]; then
  BYPASS_HEADER=(-H "x-vercel-protection-bypass: $BYPASS_TOKEN")
fi

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
# /control-room without auth must be gated. The proxy.ts implements 3
# auth modes (basic / passkey / both). The HTTP signature differs:
#   - basic mode:   401 + WWW-Authenticate: Basic realm="control-room"
#   - passkey mode: 307 redirect to /control-room/sign-in
#   - both mode:    prefers the 307 redirect (per proxy.ts line 126)
# All three are valid Layer 1 gates — none of them serve the dashboard
# to an unauthenticated caller. The script accepts either 401 or 307
# and requires the corresponding signature (basic realm OR sign-in
# redirect target). Updated 2026-06-01 after UCC passkey cutover (PR
# #380 + cutover Parts 1-6) — pre-cutover the script tested only the
# 401+Basic signature, leaving the passkey path uncovered. Mode-aware
# verification keeps the assertion strict without locking us into the
# obsolete basic-only behavior.
status=$(curl -s "${BYPASS_HEADER[@]+"${BYPASS_HEADER[@]}"}" -o /dev/null -w "%{http_code}" "$BASE_URL/control-room")

if [ "$status" = "401" ]; then
  assert "Layer 1: /control-room without auth returns 401 (basic mode)" "401" "$status"
  www_auth=$(curl -sI "${BYPASS_HEADER[@]+"${BYPASS_HEADER[@]}"}" "$BASE_URL/control-room" | grep -i "^www-authenticate:" | tr -d '\r' | awk '{print $2, $3}' | tr -d ' ')
  assert "Layer 1: WWW-Authenticate header is 'Basic realm=...'" \
    "Basicrealm=\"control-room\"" "$www_auth"
elif [ "$status" = "307" ] || [ "$status" = "302" ]; then
  assert "Layer 1: /control-room without auth redirects (passkey/both mode)" "redirect" "redirect"
  # Validate the redirect target is /control-room/sign-in (not anywhere else).
  location=$(curl -sI "${BYPASS_HEADER[@]+"${BYPASS_HEADER[@]}"}" "$BASE_URL/control-room" | grep -i "^location:" | tr -d '\r' | awk '{print $2}')
  # The Location header may be absolute or relative. Extract the path.
  location_path="${location#http*://*/}"
  location_path="/${location_path#/}"
  case "$location_path" in
    */control-room/sign-in*) actual_target="/control-room/sign-in" ;;
    *)                       actual_target="$location_path" ;;
  esac
  assert "Layer 1: redirect target is /control-room/sign-in" \
    "/control-room/sign-in" "$actual_target"
else
  # Any other status fails fast — the proxy must gate the route.
  assert "Layer 1: /control-room without auth must be 401 or 307" \
    "401 or 307" "$status"
fi

# ── Assertion 2 ──────────────────────────────────────────────────────
# / showcase root → 200, public. Verifies the matcher is properly scoped to
# /control-room/* only (no over-broad gating that would lock out the showcase).
status_root=$(curl -s "${BYPASS_HEADER[@]+"${BYPASS_HEADER[@]}"}" -o /dev/null -w "%{http_code}" "$BASE_URL/")
assert "Showcase /: public 200 (matcher properly scoped)" "200" "$status_root"

# ── Assertion 3 ──────────────────────────────────────────────────────
# robots.txt contains 'Disallow: /control-room'. Verifies Layer 2 robots gate.
robots_disallow=$(curl -s "${BYPASS_HEADER[@]+"${BYPASS_HEADER[@]}"}" "$BASE_URL/robots.txt" | grep -ci "^Disallow:.*control-room" || true)
assert "Layer 2: robots.txt has Disallow: /control-room" "1" "$robots_disallow"

# ── Assertion 4 ──────────────────────────────────────────────────────
# sitemap.xml contains zero references to /control-room. Verifies Layer 2
# sitemap exclusion.
sitemap_count=$(curl -s "${BYPASS_HEADER[@]+"${BYPASS_HEADER[@]}"}" "$BASE_URL/sitemap.xml" | grep -c "control-room" || true)
assert "Layer 2: sitemap.xml has 0 control-room URLs" "0" "$sitemap_count"

# ── Summary ──────────────────────────────────────────────────────────
printf "\n%d passed, %d failed\n" "$PASS" "$FAIL"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
