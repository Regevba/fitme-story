// audit-log writer tests — Redis-backed flow.
//
// Replaces the v7.8.1 fs-backed test suite. Uses an in-memory mock Redis
// injected via __setRedisForTests so the same test file covers:
//   - logAuthEvent round-trip via Redis LIST
//   - PII redaction at write time (credential_id, ip, ua, session_id)
//   - operator_label stays RAW in Redis (read by AuditLogPanel)
//   - sanitizeForPublicExport hashes operator_label before cron-blob write
//   - LTRIM cap enforcement at AUDIT_LOG_MAX_EVENTS
//   - logAuthEvent never throws when Redis is unavailable
//   - readAuthEvents returns [] when Redis is unavailable
//
// node:test runner — matches the existing util.test.ts / round-trip.test.ts /
// load-events.test.ts pattern.

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import type { Redis } from '@upstash/redis';
import { __setRedisForTests } from './redis-client';
import { logAuthEvent, readAuthEvents } from './audit-log';
import {
  AUDIT_LOG_KEY,
  AUDIT_LOG_MAX_EVENTS,
  sanitizeForPublicExport,
} from './redis-audit-log';

// ────────────────────────────────────────────────────────────────────────
// Mock Redis — in-memory LIST backed by a Map.
// ────────────────────────────────────────────────────────────────────────

interface MockState {
  lists: Map<string, string[]>;
  throwOnLpush: boolean;
}

function makeMock(): { redis: Redis; state: MockState } {
  const state: MockState = {
    lists: new Map(),
    throwOnLpush: false,
  };

  const redis = {
    lpush: async (key: string, ...values: string[]) => {
      if (state.throwOnLpush) throw new Error('mock: redis unavailable');
      const list = state.lists.get(key) ?? [];
      // Upstash REST LPUSH is left-side push → newest at index 0.
      list.unshift(...values);
      state.lists.set(key, list);
      return list.length;
    },
    ltrim: async (key: string, start: number, stop: number) => {
      const list = state.lists.get(key) ?? [];
      // LTRIM keeps indices start..stop inclusive (matches Redis spec).
      const trimmed = list.slice(start, stop + 1);
      state.lists.set(key, trimmed);
      return 'OK';
    },
    lrange: async <T,>(key: string, start: number, stop: number): Promise<T[]> => {
      const list = state.lists.get(key) ?? [];
      // Stop -1 is valid Redis syntax meaning "to end"; treat as full slice.
      const end = stop === -1 ? list.length : stop + 1;
      return list.slice(start, end) as unknown as T[];
    },
    del: async (key: string) => {
      const existed = state.lists.has(key) ? 1 : 0;
      state.lists.delete(key);
      return existed;
    },
  } as unknown as Redis;

  return { redis, state };
}

function freshMock(): MockState {
  const { redis, state } = makeMock();
  __setRedisForTests(redis);
  // Belt-and-suspenders: also force-clear UCC_AUDIT_BLOB_ENDPOINT so the
  // optional Stage 2 fetch doesn't fire during tests.
  delete process.env.UCC_AUDIT_BLOB_ENDPOINT;
  return state;
}

// ────────────────────────────────────────────────────────────────────────
// Round-trip
// ────────────────────────────────────────────────────────────────────────

test('logAuthEvent → readAuthEvents round-trips one event', async () => {
  freshMock();
  await logAuthEvent({
    event_type: 'auth_passkey_authenticate_succeeded',
    operator_label: 'op-mbp@example.com',
    outcome: 'success',
    credential_id: 'rawCredentialIDABC123',
    ip: '203.0.113.42',
    user_agent: 'Mozilla/5.0 (Macintosh) Safari/605',
    session_id: 'sid-secret-xyz',
    duration_ms: 412,
  });
  const events = (await readAuthEvents()) as Array<Record<string, unknown>>;
  assert.equal(events.length, 1);
  assert.equal(events[0].event_type, 'auth_passkey_authenticate_succeeded');
  assert.equal(events[0].outcome, 'success');
  assert.equal(events[0].duration_ms, 412);
});

// ────────────────────────────────────────────────────────────────────────
// F-AUTH-LATENCY-SERVER-METRIC (v7.9.1) — server-side latency field
// ────────────────────────────────────────────────────────────────────────

test('duration_ms_server round-trips alongside duration_ms', async () => {
  freshMock();
  await logAuthEvent({
    event_type: 'auth_passkey_authenticate_succeeded',
    operator_label: 'op@example.com',
    outcome: 'success',
    duration_ms: 540,       // wall-time (Date.now) — existing, backward-compat
    duration_ms_server: 7,  // monotonic server-handler time (performance.now)
  });
  const events = (await readAuthEvents()) as Array<Record<string, unknown>>;
  assert.equal(events.length, 1);
  assert.equal(events[0].duration_ms, 540, 'wall-time field preserved');
  assert.equal(
    events[0].duration_ms_server,
    7,
    'server-side latency field must round-trip for server-overhead kill-criteria',
  );
});

// ────────────────────────────────────────────────────────────────────────
// PII redaction at write time
// ────────────────────────────────────────────────────────────────────────

test('redactInput strips raw credential_id / ip / ua / session_id from Redis-stored record', async () => {
  const state = freshMock();
  const SECRET_ID = 'rawCredentialIDXYZ987';
  const SECRET_IP = '198.51.100.77';
  const SECRET_UA = 'PrivacyShouldNotLog';
  const SECRET_SID = 'sid-keep-this-secret';
  await logAuthEvent({
    event_type: 'auth_passkey_authenticate_succeeded',
    operator_label: 'op@example.com',
    outcome: 'success',
    credential_id: SECRET_ID,
    ip: SECRET_IP,
    user_agent: SECRET_UA,
    session_id: SECRET_SID,
  });
  // Inspect the raw stored line directly so we catch any serialization leak.
  const raw = state.lists.get(AUDIT_LOG_KEY)?.[0] ?? '';
  assert.ok(!raw.includes(SECRET_ID), 'raw credential_id leaked into Redis');
  assert.ok(!raw.includes(SECRET_IP), 'raw IP leaked into Redis');
  assert.ok(!raw.includes(SECRET_UA), 'raw user_agent leaked into Redis');
  assert.ok(!raw.includes(SECRET_SID), 'raw session_id leaked into Redis');
  assert.ok(raw.includes('sha256:'), 'expected sha256-prefixed hash');
  assert.ok(raw.includes('ipv4-198.51.100.0/24'), 'expected truncated IP class');
});

test('operator_label STAYS RAW in Redis (panel consumes for authenticated operators)', async () => {
  const state = freshMock();
  const RAW_EMAIL = 'regvash21@example.com';
  await logAuthEvent({
    event_type: 'auth_passkey_authenticate_succeeded',
    operator_label: RAW_EMAIL,
    outcome: 'success',
  });
  const raw = state.lists.get(AUDIT_LOG_KEY)?.[0] ?? '';
  assert.ok(
    raw.includes(RAW_EMAIL),
    'operator_label MUST stay raw in Redis for AuditLogPanel display',
  );
});

// ────────────────────────────────────────────────────────────────────────
// Sanitization at cron-write boundary
// ────────────────────────────────────────────────────────────────────────

test('sanitizeForPublicExport drops operator_label and adds operator_label_hash', () => {
  const sanitized = sanitizeForPublicExport({
    timestamp: '2026-05-17T06:00:00Z',
    event_type: 'auth_passkey_authenticate_succeeded',
    operator_label: 'regvash21@example.com',
    outcome: 'success',
    credential_id_hash: 'sha256:abcd1234',
  });
  assert.equal(
    sanitized.operator_label,
    undefined,
    'operator_label must be stripped before public-blob export',
  );
  assert.ok(
    typeof sanitized.operator_label_hash === 'string' &&
      (sanitized.operator_label_hash as string).startsWith('sha256:'),
    'operator_label_hash must be sha256-prefixed',
  );
  // Other fields unchanged.
  assert.equal(sanitized.event_type, 'auth_passkey_authenticate_succeeded');
  assert.equal(sanitized.outcome, 'success');
  assert.equal(sanitized.credential_id_hash, 'sha256:abcd1234');
});

test('sanitizeForPublicExport handles missing operator_label safely', () => {
  const sanitized = sanitizeForPublicExport({
    timestamp: '2026-05-17T06:00:00Z',
    event_type: 'auth_session_expired',
    outcome: 'success',
  });
  assert.equal(sanitized.operator_label, undefined);
  assert.equal(sanitized.operator_label_hash, undefined);
});

// ────────────────────────────────────────────────────────────────────────
// LTRIM cap enforcement
// ────────────────────────────────────────────────────────────────────────

test('LTRIM enforces AUDIT_LOG_MAX_EVENTS cap on every write', async () => {
  const state = freshMock();
  // Write MAX + 5 events. Use a small loop — we trust the LTRIM logic, we
  // just want to confirm the bound. (Don't actually push 10005 events in
  // a unit test; assert the cap by inspecting list length after sufficient
  // pushes.)
  const writes = AUDIT_LOG_MAX_EVENTS + 5;
  for (let i = 0; i < writes; i++) {
    await logAuthEvent({
      event_type: 'auth_session_minted',
      operator_label: `op-${i}@example.com`,
      outcome: 'success',
    });
  }
  const stored = state.lists.get(AUDIT_LOG_KEY) ?? [];
  assert.equal(
    stored.length,
    AUDIT_LOG_MAX_EVENTS,
    `expected list to be capped at ${AUDIT_LOG_MAX_EVENTS}, got ${stored.length}`,
  );
  // Verify the OLDEST events were dropped (FIFO from the tail).
  const newest = JSON.parse(stored[0]);
  assert.equal(newest.operator_label, `op-${writes - 1}@example.com`);
});

// ────────────────────────────────────────────────────────────────────────
// Resilience — auth path must never fail on audit-log delivery
// ────────────────────────────────────────────────────────────────────────

test('logAuthEvent swallows Redis errors and never throws', async () => {
  const state = freshMock();
  state.throwOnLpush = true;
  // Must not throw.
  await logAuthEvent({
    event_type: 'auth_passkey_authenticate_failed',
    operator_label: 'op@example.com',
    outcome: 'error',
    reason: 'assertion_invalid',
  });
  // List should be empty (write failed).
  assert.equal((state.lists.get(AUDIT_LOG_KEY) ?? []).length, 0);
});

test('readAuthEvents returns [] when Redis throws', async () => {
  const state = freshMock();
  state.throwOnLpush = true; // Will also influence subsequent lrange via the mock if we wanted
  // Force a separate failure on lrange by injecting a custom mock.
  __setRedisForTests({
    lrange: async () => {
      throw new Error('mock: redis unavailable on read');
    },
  } as unknown as Redis);
  const events = await readAuthEvents();
  assert.deepEqual(events, []);
});

// ────────────────────────────────────────────────────────────────────────
// Failure reason vocabulary preserved
// ────────────────────────────────────────────────────────────────────────

test('failure event preserves the reason vocabulary', async () => {
  freshMock();
  await logAuthEvent({
    event_type: 'auth_passkey_authenticate_failed',
    operator_label: 'op@example.com',
    outcome: 'error',
    reason: 'counter_replay',
  });
  const events = (await readAuthEvents()) as Array<{ reason: string }>;
  assert.equal(events[0].reason, 'counter_replay');
});
