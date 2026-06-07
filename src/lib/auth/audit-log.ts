// src/lib/auth/audit-log.ts
//
// T3 — Audit log writer.
//
// Primary store: Upstash Redis LIST `ucc:audit-log:events` via
// redis-audit-log.ts. Bounded at 10k events via LTRIM on each write.
//
// Secondary (optional): best-effort POST to UCC_AUDIT_BLOB_ENDPOINT for
// external log forwarders (Logflare, Axiom, etc.). No-op when unset.
//
// The cron route /api/cron/sync-audit-log reads Redis, sanitizes PII
// (hashes operator_label), and writes a public Vercel Blob for daily
// FT2 sync. Redis stays the live source; the blob is a derived export.
//
// Privacy: never log raw credentialID, raw IP, full UA, raw token.
// SHA-256 hashes for cross-event correlation; IP truncated; UA stripped
// to family. operator_label STAYS RAW in Redis (read by AuditLogPanel
// for authenticated operators viewing their own activity) but is
// hashed at the cron-write boundary before crossing to the public blob.
//
// Historical note (2026-05-07 → 2026-05-17): originally Stage 1 was
// fs.appendFile(cwd/.local/ucc-auth-events.jsonl) — silently failed on
// Vercel function fs (read-only). Stage 2 (UCC_AUDIT_BLOB_ENDPOINT) was
// never provisioned. Audit events written via that broken design landed
// nowhere. Migrated to Redis primary via the
// ucc-passkey-auth-audit-log-redis-fix enhancement.

import { sha256Truncated } from './util';
import { pushEvent, readEvents } from './redis-audit-log';
import { ipClassFromRaw, uaFamilyFromRaw } from './audit-log-redactors';

const SCHEMA_VERSION = 1;

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
  | 'auth_bootstrap_token_issued' // emitted by scripts/issue-bootstrap-token.ts at issuance time
  | 'auth_bootstrap_token_consumed' // emitted by /api/auth/register/options at consumption time
  | 'auth_lockout_triggered' // counter crossed threshold; lockout sentinel set
  | 'auth_lockout_blocked_attempt' // incoming request rejected because lockout is active
  | 'auth_lockout_cleared' // operator cleared via CLI OR sliding window expired
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
  | 'tamper'
  // Hardening enhancement (2026-05-20) — allowlist + lockout reasons
  | 'email_not_allowlisted' // bootstrap token consumed for an email not in UCC_ALLOWED_EMAILS
  | 'allowlist_unset' // registration attempted while UCC_ALLOWED_EMAILS is unset (fail-closed)
  | 'email_threshold' // per-email failure counter ≥ 10
  | 'ip_threshold' // per-IP failure counter ≥ 20
  | 'email_locked' // request rejected; per-email lockout active
  | 'ip_locked' // request rejected; per-IP lockout active
  | 'manual_clear'; // operator ran scripts/clear-lockout.ts

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
  // F-AUTH-LATENCY-SERVER-METRIC (v7.9.1): high-precision, monotonic
  // (performance.now) server-handler execution time. Distinct from duration_ms
  // (Date.now wall-time) — this is the canonical input for kill-criteria sized
  // in server-overhead terms (e.g. the UCC-hardening +1-Redis-GET threshold).
  duration_ms_server?: number;
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

export async function logAuthEvent(input: AuthEventInput): Promise<void> {
  const record = redactInput(input);

  // Stage 1: Redis primary store (bounded LIST via LTRIM).
  // Best-effort — auth must NOT fail because of audit-log delivery.
  try {
    await pushEvent(record);
  } catch {
    // Redis unreachable / quota exhausted — swallow. The auth path's
    // primary state (operators, credentials, sessions) lives in the
    // same Redis instance, so a hard failure here would already have
    // blocked auth upstream. If it didn't, this is a transient blip.
  }

  // Stage 2: optional best-effort external forwarder (Logflare, Axiom).
  // No-op when UCC_AUDIT_BLOB_ENDPOINT is unset (default in prod today).
  const blobEndpoint = getBlobEndpoint();
  if (blobEndpoint) {
    try {
      await fetch(blobEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-ndjson',
          Authorization: `Bearer ${process.env.UCC_AUDIT_BLOB_TOKEN ?? ''}`,
        },
        body: JSON.stringify(record) + '\n',
      });
    } catch {
      // Swallow — auth must not fail because of audit-log delivery.
    }
  }
}

// Read the last N events from Redis. Default 50 matches AuditLogPanel's
// "Recent events" view. Returns parsed records.
export async function readAuthEvents(count = 50): Promise<unknown[]> {
  try {
    return await readEvents(count);
  } catch {
    return [];
  }
}
