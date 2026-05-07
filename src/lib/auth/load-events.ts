// src/lib/auth/load-events.ts
//
// Server-side loader for the audit log JSONL. Used by the audit page (T17)
// and the AuditLogPanel (T18). Mirrors the load-ledgers.ts pattern.

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import type { AuditEvent } from '@/components/control-room/AuditEventRow';

function getLiveLogPath(): string {
  return (
    process.env.UCC_AUDIT_LIVE_PATH ??
    path.join(process.cwd(), '.local', 'ucc-auth-events.jsonl')
  );
}

export async function loadAuthEvents(limit?: number): Promise<AuditEvent[]> {
  try {
    const raw = await fs.readFile(getLiveLogPath(), 'utf8');
    const lines = raw.split('\n').filter((l) => l.trim());
    const events = lines
      .map((l): AuditEvent | null => {
        try {
          return JSON.parse(l) as AuditEvent;
        } catch {
          return null;
        }
      })
      .filter((e): e is AuditEvent => e !== null)
      .reverse(); // newest first
    return typeof limit === 'number' ? events.slice(0, limit) : events;
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
