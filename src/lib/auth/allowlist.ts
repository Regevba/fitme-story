// src/lib/auth/allowlist.ts
//
// Email allowlist gate (G1+G2 from the ucc-passkey-auth-security-hardening
// enhancement, 2026-05-20).
//
// UCC_ALLOWED_EMAILS env var is the single source of truth for "which
// emails may register an operator credential". Format: comma-separated,
// case-insensitive, whitespace-trimmed.
//
// Fail-closed: if the env var is unset or empty, registration is blocked
// entirely (callers should distinguish this from "not in list" for
// telemetry separation — see allowlistIsConfigured()).
//
// Authentication (sign-in with an existing passkey) is NOT gated by this
// module. The allowlist applies only at registration time.

const ENV_VAR = 'UCC_ALLOWED_EMAILS';

function parseAllowlist(): Set<string> {
  const raw = process.env[ENV_VAR];
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0),
  );
}

/**
 * Returns true if the given email is in UCC_ALLOWED_EMAILS.
 * Case-insensitive + whitespace-tolerant on both sides.
 * Returns false if email is empty/null/undefined OR if the env var is unset.
 */
export function isEmailAllowed(email: string): boolean {
  if (!email) return false;
  return parseAllowlist().has(email.trim().toLowerCase());
}

/** Returns the number of emails currently configured in UCC_ALLOWED_EMAILS. */
export function allowlistSize(): number {
  return parseAllowlist().size;
}

/**
 * Returns true if UCC_ALLOWED_EMAILS is configured with at least one email.
 * Use this to distinguish "operator misconfigured the env var" (returns false)
 * from "bootstrap token consumed for a non-allowlisted email" (size > 0 but
 * isEmailAllowed returns false). The two cases emit different audit-event
 * reasons (`allowlist_unset` vs `email_not_allowlisted`).
 */
export function allowlistIsConfigured(): boolean {
  return allowlistSize() > 0;
}
