// load-events + computeAuditStats tests — Redis-backed.
//
// Rewrites the v7.8.1 fs-backed test suite. Uses an in-memory mock Redis
// injected via __setRedisForTests. Fixtures are LPUSH'd into Redis in
// reverse insertion order so the newest-first contract of LRANGE 0..N-1
// holds, matching what loadAuthEvents returns.

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import type { Redis } from '@upstash/redis';
import { __setRedisForTests } from './redis-client';
import { loadAuthEvents, computeAuditStats } from './load-events';
import { AUDIT_LOG_KEY } from './redis-audit-log';

const SECONDS = 1000;
const HOUR = 60 * 60 * SECONDS;
const DAY = 24 * HOUR;

interface MockState {
  lists: Map<string, string[]>;
}

function makeMock(): { redis: Redis; state: MockState } {
  const state: MockState = { lists: new Map() };
  const redis = {
    lpush: async (key: string, ...values: string[]) => {
      const list = state.lists.get(key) ?? [];
      list.unshift(...values);
      state.lists.set(key, list);
      return list.length;
    },
    ltrim: async () => 'OK',
    lrange: async <T,>(key: string, start: number, stop: number): Promise<T[]> => {
      const list = state.lists.get(key) ?? [];
      const end = stop === -1 ? list.length : stop + 1;
      return list.slice(start, end) as unknown as T[];
    },
    del: async (key: string) => {
      state.lists.delete(key);
      return 1;
    },
  } as unknown as Redis;
  return { redis, state };
}

// Seed Redis with events. Caller passes events in chronological order
// (OLDEST first); this function LPUSHes them so the resulting list has
// NEWEST at index 0, matching production behavior.
function seedEvents(state: MockState, events: object[]): void {
  const list: string[] = [];
  for (const ev of events) {
    list.unshift(JSON.stringify(ev));
  }
  state.lists.set(AUDIT_LOG_KEY, list);
}

function freshMock(): MockState {
  const { redis, state } = makeMock();
  __setRedisForTests(redis);
  return state;
}

function fixture(date: number, type: string, extras: Record<string, unknown> = {}) {
  return {
    timestamp: new Date(date).toISOString(),
    event_type: type,
    schema_version: 1,
    operator_label: 'op@example.com',
    outcome: type.endsWith('_failed') ? 'error' : 'success',
    ...extras,
  };
}

test('loadAuthEvents returns newest first (Redis LPUSH/LRANGE contract)', async () => {
  const state = freshMock();
  const t1 = Date.now() - 2 * HOUR;
  const t2 = Date.now() - 1 * HOUR;
  // Chronological order: t1 (older) then t2 (newer).
  seedEvents(state, [
    fixture(t1, 'auth_passkey_authenticate_succeeded'),
    fixture(t2, 'auth_passkey_authenticate_failed'),
  ]);
  const events = await loadAuthEvents();
  assert.equal(events.length, 2);
  // Newest first: t2 should be index 0.
  assert.equal(events[0].event_type, 'auth_passkey_authenticate_failed');
  assert.equal(events[1].event_type, 'auth_passkey_authenticate_succeeded');
});

test('loadAuthEvents respects limit param', async () => {
  const state = freshMock();
  const now = Date.now();
  seedEvents(state, [
    fixture(now - 3 * HOUR, 'auth_passkey_authenticate_succeeded'),
    fixture(now - 2 * HOUR, 'auth_passkey_authenticate_succeeded'),
    fixture(now - 1 * HOUR, 'auth_passkey_authenticate_succeeded'),
  ]);
  const events = await loadAuthEvents(2);
  assert.equal(events.length, 2);
});

test('loadAuthEvents returns [] when Redis throws', async () => {
  __setRedisForTests({
    lrange: async () => {
      throw new Error('mock: redis unavailable');
    },
  } as unknown as Redis);
  const events = await loadAuthEvents();
  assert.deepEqual(events, []);
});

test('computeAuditStats counts registered + 7d auths + 7d fails', async () => {
  const state = freshMock();
  const now = Date.now();
  seedEvents(state, [
    fixture(now - 30 * DAY, 'auth_passkey_authenticate_succeeded'),
    fixture(now - 4 * HOUR, 'auth_passkey_authenticate_failed'),
    fixture(now - 3 * HOUR, 'auth_passkey_authenticate_succeeded'),
    fixture(now - 2 * HOUR, 'auth_passkey_authenticate_succeeded'),
    fixture(now - 1 * HOUR, 'auth_passkey_register_completed'),
  ]);
  const events = await loadAuthEvents();
  const stats = await computeAuditStats(events);
  assert.equal(stats.registeredCount, 1);
  assert.equal(stats.authsLast7d, 2);
  assert.equal(stats.failsLast7d, 1);
});

test('suspicious banner triggers on 3+ fails in last hour', async () => {
  const state = freshMock();
  const now = Date.now();
  seedEvents(state, [
    fixture(now - 30 * SECONDS, 'auth_passkey_authenticate_failed'),
    fixture(now - 20 * SECONDS, 'auth_passkey_authenticate_failed'),
    fixture(now - 10 * SECONDS, 'auth_passkey_authenticate_failed'),
  ]);
  const events = await loadAuthEvents();
  const stats = await computeAuditStats(events);
  assert.ok(stats.suspiciousReasons.some((r) => r.includes('failed sign-ins')));
});

test('suspicious banner triggers on revoke in last 24h', async () => {
  const state = freshMock();
  const now = Date.now();
  seedEvents(state, [fixture(now - 2 * HOUR, 'auth_passkey_revoked')]);
  const events = await loadAuthEvents();
  const stats = await computeAuditStats(events);
  assert.ok(stats.suspiciousReasons.some((r) => r.toLowerCase().includes('revoked')));
});
