// src/lib/auth/redis-lockout.ts
//
// G3 — Hybrid failure lockout (ucc-passkey-auth-security-hardening, 2026-05-20).
//
// Per-email + per-IP fixed-window failure counters with sentinel-flag
// lockout in Upstash Redis. Both dimensions check + record in parallel
// (single round-trip via Promise.all). Adds ≤ 2 ms to the auth path
// (one extra Redis GET per request).
//
// Window semantics: EXPIRE is set on the FIRST INCR only — produces a
// fixed window from the time of first failure, NOT a sliding window.
// Successful auth via clearFailures() resets the window early.
//
// Key layout:
//   ucc:lockout:email:<lc-email>:fails   — counter, 15-min TTL
//   ucc:lockout:email:<lc-email>:locked  — sentinel; presence = locked
//   ucc:lockout:ip:<ip-class>:fails      — counter, 30-min TTL
//   ucc:lockout:ip:<ip-class>:locked     — sentinel; presence = locked
//
// IP class uses ipClassFromRaw (audit-log-redactors.ts) — IPv4 /24, IPv6 /48.
// Both consumers (audit-log + lockout) MUST see the same truncation.

import { getRedis } from './redis-client';
import { logAuthEvent } from './audit-log';
import { ipClassFromRaw } from './audit-log-redactors';

const EMAIL_FAIL_TTL_SECONDS = 900; // 15 min
const EMAIL_LOCK_THRESHOLD = 10;
const IP_FAIL_TTL_SECONDS = 1800; // 30 min
const IP_LOCK_THRESHOLD = 20;

export interface LockoutCheckResult {
  locked: boolean;
  reason: 'email_locked' | 'ip_locked' | null;
}

function emailFailKey(email: string): string {
  return `ucc:lockout:email:${email}:fails`;
}
function emailLockKey(email: string): string {
  return `ucc:lockout:email:${email}:locked`;
}
function ipFailKey(ipClass: string): string {
  return `ucc:lockout:ip:${ipClass}:fails`;
}
function ipLockKey(ipClass: string): string {
  return `ucc:lockout:ip:${ipClass}:locked`;
}

/**
 * Check whether a request is currently locked out. Email lockout takes
 * precedence over IP lockout when both apply (more specific signal first).
 * Either input may be null — null sides skip the corresponding check.
 *
 * Returns `{locked: false, reason: null}` if neither lockout sentinel is set.
 */
export async function checkLockout(
  email: string | null,
  rawIp: string | null,
): Promise<LockoutCheckResult> {
  const emailLc = email?.trim().toLowerCase() ?? null;
  const ipClass = rawIp ? ipClassFromRaw(rawIp) : null;
  const redis = getRedis();

  const [emailLocked, ipLocked] = await Promise.all([
    emailLc ? redis.get(emailLockKey(emailLc)) : null,
    ipClass ? redis.get(ipLockKey(ipClass)) : null,
  ]);

  if (emailLocked) return { locked: true, reason: 'email_locked' };
  if (ipLocked) return { locked: true, reason: 'ip_locked' };
  return { locked: false, reason: null };
}

/**
 * Record a single auth failure. Increments per-email and per-IP counters.
 * When either threshold is crossed, sets the matching sentinel (with the
 * same TTL as the fail counter) and emits an `auth_lockout_triggered`
 * audit event with the specific reason.
 *
 * Email and IP counters are independent: hitting the per-email threshold
 * doesn't affect the per-IP counter and vice versa. Both branches log
 * separately if they trigger.
 */
export async function recordFailure(
  email: string | null,
  rawIp: string | null,
): Promise<void> {
  const emailLc = email?.trim().toLowerCase() ?? null;
  const ipClass = rawIp ? ipClassFromRaw(rawIp) : null;
  const redis = getRedis();

  if (emailLc) {
    const failKey = emailFailKey(emailLc);
    const fails = await redis.incr(failKey);
    if (fails === 1) await redis.expire(failKey, EMAIL_FAIL_TTL_SECONDS);
    if (fails >= EMAIL_LOCK_THRESHOLD) {
      await redis.set(emailLockKey(emailLc), '1', { ex: EMAIL_FAIL_TTL_SECONDS });
      await logAuthEvent({
        event_type: 'auth_lockout_triggered',
        operator_label: emailLc,
        outcome: 'success',
        reason: 'email_threshold',
      });
    }
  }

  if (ipClass) {
    const failKey = ipFailKey(ipClass);
    const fails = await redis.incr(failKey);
    if (fails === 1) await redis.expire(failKey, IP_FAIL_TTL_SECONDS);
    if (fails >= IP_LOCK_THRESHOLD) {
      await redis.set(ipLockKey(ipClass), '1', { ex: IP_FAIL_TTL_SECONDS });
      await logAuthEvent({
        event_type: 'auth_lockout_triggered',
        operator_label: emailLc ?? 'unknown',
        outcome: 'success',
        reason: 'ip_threshold',
        ip: rawIp ?? undefined,
      });
    }
  }
}

/**
 * Clear all failure state for the given email and/or IP. Called from:
 *   1. The success branch of authenticate/verify (resets a partial-failure
 *      counter so a successful sign-in unwinds prior failures).
 *   2. The CLI `scripts/clear-lockout.ts` (operator emergency clear).
 *
 * Either input may be null — null sides leave their counters untouched.
 * No audit event emitted from this function directly; the CLI script
 * emits its own `auth_lockout_cleared reason:manual_clear` event.
 */
export async function clearFailures(
  email: string | null,
  rawIp: string | null,
): Promise<void> {
  const emailLc = email?.trim().toLowerCase() ?? null;
  const ipClass = rawIp ? ipClassFromRaw(rawIp) : null;
  const keys: string[] = [];

  if (emailLc) {
    keys.push(emailFailKey(emailLc), emailLockKey(emailLc));
  }
  if (ipClass) {
    keys.push(ipFailKey(ipClass), ipLockKey(ipClass));
  }

  if (keys.length > 0) {
    const redis = getRedis();
    await redis.del(...keys);
  }
}

// Exported for tests. Production code should not depend on these.
export const __THRESHOLDS = {
  EMAIL_FAIL_TTL_SECONDS,
  EMAIL_LOCK_THRESHOLD,
  IP_FAIL_TTL_SECONDS,
  IP_LOCK_THRESHOLD,
} as const;
