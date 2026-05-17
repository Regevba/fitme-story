// src/lib/auth/load-events.ts
//
// Server-side loader for the audit log. Used by the audit page (T17) and
// the AuditLogPanel (T18).
//
// Reads from Upstash Redis LIST `ucc:audit-log:events` via
// redis-audit-log.ts. Redis LPUSH puts newest at HEAD, so readEvents
// already returns newest-first — no manual reverse needed.
//
// Historical note (2026-05-07 → 2026-05-17): originally read from
// cwd/.local/ucc-auth-events.jsonl which silently failed on Vercel
// (function fs is read-only). Migrated to Redis via the
// ucc-passkey-auth-audit-log-redis-fix enhancement.

import type { AuditEvent } from '@/components/control-room/AuditEventRow';
import { AUDIT_LOG_MAX_EVENTS, readEvents } from './redis-audit-log';

export async function loadAuthEvents(limit?: number): Promise<AuditEvent[]> {
  try {
    const count = typeof limit === 'number' ? limit : AUDIT_LOG_MAX_EVENTS;
    const events = (await readEvents(count)) as AuditEvent[];
    return events;
  } catch {
    return [];
  }
}

export interface AuditStats {
  registeredCount: number;
  authsLast7d: number;
  failsLast7d: number;
  suspiciousReasons: string[];
}

export async function computeAuditStats(events: AuditEvent[]): Promise<AuditStats> {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  let registeredCount = 0;
  let authsLast7d = 0;
  let failsLast7d = 0;
  let recentFailsLastHour = 0;
  let revokeLast24h = false;
  let registerFromNewIp = false;

  const seenIpsBefore = new Set<string>();
  for (const e of events) {
    const ts = new Date(e.timestamp).getTime();
    if (ts < thirtyDaysAgo && e.ip_class) seenIpsBefore.add(e.ip_class);
  }

  for (const e of events) {
    const ts = new Date(e.timestamp).getTime();
    if (e.event_type === 'auth_passkey_register_completed') registeredCount++;
    if (e.event_type === 'auth_passkey_authenticate_succeeded' && ts >= sevenDaysAgo)
      authsLast7d++;
    if (e.event_type === 'auth_passkey_authenticate_failed' && ts >= sevenDaysAgo)
      failsLast7d++;
    if (e.event_type === 'auth_passkey_authenticate_failed' && ts >= oneHourAgo)
      recentFailsLastHour++;
    if (e.event_type === 'auth_passkey_revoked' && ts >= oneDayAgo)
      revokeLast24h = true;
    if (
      e.event_type === 'auth_passkey_register_completed' &&
      ts >= oneDayAgo &&
      e.ip_class &&
      !seenIpsBefore.has(e.ip_class)
    ) {
      registerFromNewIp = true;
    }
  }

  const suspiciousReasons: string[] = [];
  if (recentFailsLastHour >= 3)
    suspiciousReasons.push(`${recentFailsLastHour} failed sign-ins in the last hour`);
  if (registerFromNewIp)
    suspiciousReasons.push('A device was registered from an IP/UA family not seen in 30 days');
  if (revokeLast24h) suspiciousReasons.push('A credential was revoked in the last 24 hours');

  return {
    registeredCount,
    authsLast7d,
    failsLast7d,
    suspiciousReasons,
  };
}
