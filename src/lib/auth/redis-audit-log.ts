// src/lib/auth/redis-audit-log.ts
//
// Audit-log primary store — Upstash Redis LIST (`ucc:audit-log:events`).
//
// Replaces the dead local-fs Stage 1 in audit-log.ts which silently failed
// in Vercel production (function fs is read-only). Each event is LPUSH'd
// onto the head of the list; LTRIM enforces a bounded cap so the list
// can't grow unboundedly under Upstash free-tier memory limits.
//
// READS return events newest-first (LRANGE 0..N-1) — natural for the
// AuditLogPanel UI which renders most-recent activity at the top.
//
// The cron route (/api/cron/sync-audit-log) reads the full list, sanitizes
// PII (hashes operator_label), then writes the JSONL to a public Vercel Blob
// for daily FT2 sync. Redis stays the live source of truth; the blob is
// a derived export for cross-repo consumption.
//
// Discovered 2026-05-17 — see ucc-passkey-auth-audit-log-redis-fix.

import { getRedis } from './redis-client';
import { sha256Truncated } from './util';

export const AUDIT_LOG_KEY = 'ucc:audit-log:events';
export const AUDIT_LOG_MAX_EVENTS = 10_000;

// Strip / hash any field that could leak PII to a publicly-readable export
// (Vercel Blob is access:public + deterministic URL). Today the only raw-PII
// field still in records (after redactInput at write time) is operator_label.
// If new raw-PII fields are added to AuthEventInput, extend this in lockstep.
//
// Exported so the cron route consumes it AND so the test suite can assert
// the hash-only-no-raw contract directly.
export function sanitizeForPublicExport(
  event: Record<string, unknown>,
): Record<string, unknown> {
  const { operator_label, ...rest } = event;
  return {
    ...rest,
    operator_label_hash:
      typeof operator_label === 'string' && operator_label.length > 0
        ? sha256Truncated(operator_label, 12)
        : undefined,
  };
}

// Push one event to the head of the list and enforce the cap.
// Failure is rethrown — the caller decides whether to swallow (auth path
// must not fail because of audit-log delivery; see logAuthEvent).
export async function pushEvent(record: object): Promise<void> {
  const redis = getRedis();
  await redis.lpush(AUDIT_LOG_KEY, JSON.stringify(record));
  // LTRIM keeps indices 0..MAX-1, dropping anything older. Cheap O(N)
  // op on the trailing tail; only runs when the list overflows the cap.
  await redis.ltrim(AUDIT_LOG_KEY, 0, AUDIT_LOG_MAX_EVENTS - 1);
}

// Read up to `count` most-recent events as parsed JSON.
// LRANGE indices are inclusive: 0 = newest, count-1 = oldest of slice.
export async function readEvents(count = 50): Promise<unknown[]> {
  const redis = getRedis();
  const raw = await redis.lrange<string>(AUDIT_LOG_KEY, 0, count - 1);
  return raw
    .map((line) => {
      // Upstash REST client may already JSON.parse strings — handle both.
      if (typeof line !== 'string') return line;
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter((v) => v !== null);
}

// Read ALL stored events (for cron blob export). Caller is responsible
// for any sanitization before writing to a public surface.
export async function readAllEvents(): Promise<unknown[]> {
  return readEvents(AUDIT_LOG_MAX_EVENTS);
}

// Explicit trim helper — primarily for tests that need to assert cap
// enforcement without spamming LPUSH MAX+1 times.
export async function trimEvents(maxCount = AUDIT_LOG_MAX_EVENTS): Promise<void> {
  const redis = getRedis();
  await redis.ltrim(AUDIT_LOG_KEY, 0, maxCount - 1);
}

// Test seam — clear the list. NEVER called from production code.
export async function __clearForTests(): Promise<void> {
  const redis = getRedis();
  await redis.del(AUDIT_LOG_KEY);
}
