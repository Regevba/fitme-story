// src/lib/auth/audit-log.ts
//
// T3 — Audit log writer.
//
// Two-stage write:
//   1) Local JSONL append at fitme-story/.local/ucc-auth-events.jsonl (live source)
//   2) Best-effort POST to a Vercel Blob (non-blocking) for daily GHA pull into FT2
//
// Privacy: never log raw credentialID, raw IP, full UA, raw token. SHA-256 hashes
// for cross-event correlation; IP truncated; UA stripped to family.

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { sha256Truncated } from './util';

const SCHEMA_VERSION = 1;

function getLiveLogPath(): string {
  return (
    process.env.UCC_AUDIT_LIVE_PATH ??
    path.join(process.cwd(), '.local', 'ucc-auth-events.jsonl')
  );
}

function getBlobEndpoint(): string | null {
  return process.env.UCC_AUDIT_BLOB_ENDPOINT || null;
}

export type AuthEventType =
  | 'auth_passkey_register_started'
  | 'auth_passkey_register_completed'
  | 'auth_passkey_register_failed'
  | 'auth_passkey_authenticate_started'
  | 'auth_passkey_authenticate_succeeded'
  | 'auth_passkey_authenticate_failed'
  | 'auth_passkey_revoked'
  | 'auth_session_minted'
  | 'auth_session_expired'
  | 'auth_bootstrap_token_issued'
  | 'auth_basic_authenticated';

export type AuthEventReason =
  | 'user_cancelled'
  | 'no_authenticator'
  | 'attestation_invalid'
  | 'assertion_invalid'
  | 'counter_replay'
  | 'unknown_credential'
  | 'bootstrap_invalid'
  | 'timeout'
  | 'server_error'
  | 'ttl'
  | 'revoked'
  | 'tamper';

export interface AuthEventInput {
  event_type: AuthEventType;
  operator_label: string;
  outcome: 'success' | 'error';
  credential_id?: string; // raw — will be hashed before write
  reason?: AuthEventReason | null;
  ip?: string;
  user_agent?: string;
  session_id?: string; // raw — will be hashed before write
  duration_ms?: number;
  device_type?: 'platform' | 'cross_platform';
  mediation?: 'conditional' | 'required';
  session_ttl_seconds?: number;
  revoked_self?: boolean;
}

function redactInput(input: AuthEventInput) {
  const {
    credential_id,
    session_id,
    ip,
    user_agent,
    ...rest
  } = input;

  return {
    ...rest,
    timestamp: new Date().toISOString(),
    schema_version: SCHEMA_VERSION,
    credential_id_hash: credential_id
      ? sha256Truncated(credential_id, 12)
      : undefined,
    session_id_hash: session_id ? sha256Truncated(session_id, 12) : undefined,
    ip_class: ip ? ipClassFromRaw(ip) : undefined,
    user_agent_family: user_agent ? uaFamilyFromRaw(user_agent) : undefined,
    rp_id: process.env.UCC_RP_ID ?? 'fitme-story.vercel.app',
  };
}

function ipClassFromRaw(rawIp: string): string {
  const ip = rawIp.split(',')[0].trim();
  if (ip.includes(':')) return `ipv6-${ip.split(':').slice(0, 3).join(':')}::/48`;
  const parts = ip.split('.');
  if (parts.length !== 4) return 'unknown';
  return `ipv4-${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
}

function uaFamilyFromRaw(ua: string): string {
  if (/safari/i.test(ua) && /macintosh/i.test(ua)) return 'Safari/macOS';
  if (/safari/i.test(ua) && /iphone|ipad/i.test(ua)) return 'Safari/iOS';
  if (/chrome/i.test(ua) && /macintosh/i.test(ua)) return 'Chrome/macOS';
  if (/chrome/i.test(ua) && /windows/i.test(ua)) return 'Chrome/Windows';
  if (/edg/i.test(ua)) return 'Edge/Windows';
  if (/firefox/i.test(ua)) return 'Firefox';
  return 'other';
}

export async function logAuthEvent(input: AuthEventInput): Promise<void> {
  const record = redactInput(input);
  const line = JSON.stringify(record) + '\n';

  // Stage 1: append to local JSONL (best effort; never throws).
  const livePath = getLiveLogPath();
  try {
    await fs.mkdir(path.dirname(livePath), { recursive: true });
    await fs.appendFile(livePath, line, 'utf8');
  } catch (err) {
    // Local fs may be read-only on Vercel — that's expected; rely on Blob.
    // Don't surface to caller.
  }

  // Stage 2: best-effort POST to Vercel Blob (non-blocking).
  const blobEndpoint = getBlobEndpoint();
  if (blobEndpoint) {
    try {
      await fetch(blobEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-ndjson',
          Authorization: `Bearer ${process.env.UCC_AUDIT_BLOB_TOKEN ?? ''}`,
        },
        body: line,
      });
    } catch {
      // Swallow — auth must not fail because of audit-log delivery.
    }
  }
}

// Test seam — read all events from the live log (used by AuditLogPanel + tests).
export async function readAuthEvents(): Promise<unknown[]> {
  try {
    const raw = await fs.readFile(getLiveLogPath(), 'utf8');
    return raw
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}
