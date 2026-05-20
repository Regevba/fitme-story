// redis-lockout.test.ts — G3 hybrid failure lockout
// (ucc-passkey-auth-security-hardening, 2026-05-20).
//
// Uses node:test runner pattern (matches audit-log.test.ts).
// Injects a mock Upstash Redis client via __setRedisForTests.

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import type { Redis } from '@upstash/redis';
import { __setRedisForTests } from './redis-client';
import {
  __THRESHOLDS,
  checkLockout,
  clearFailures,
  recordFailure,
} from './redis-lockout';

// ────────────────────────────────────────────────────────────────────────
// Mock Redis — in-memory KV with TTL tracking.
// ────────────────────────────────────────────────────────────────────────

interface MockEntry {
  value: string | number;
  ttlSeconds?: number;
}

function makeMock(): { redis: Redis; store: Map<string, MockEntry> } {
  const store = new Map<string, MockEntry>();
  const redis = {
    async get(key: string): Promise<string | number | null> {
      const e = store.get(key);
      return e ? e.value : null;
    },
    async set(
      key: string,
      value: string | number,
      opts?: { ex?: number },
    ): Promise<'OK'> {
      store.set(key, { value, ttlSeconds: opts?.ex });
      return 'OK';
    },
    async incr(key: string): Promise<number> {
      const e = store.get(key);
      const current = typeof e?.value === 'number' ? e.value : 0;
      const next = current + 1;
      store.set(key, { value: next, ttlSeconds: e?.ttlSeconds });
      return next;
    },
    async expire(key: string, seconds: number): Promise<number> {
      const e = store.get(key);
      if (!e) return 0;
      store.set(key, { value: e.value, ttlSeconds: seconds });
      return 1;
    },
    async del(...keys: string[]): Promise<number> {
      let n = 0;
      for (const k of keys) if (store.delete(k)) n++;
      return n;
    },
  } as unknown as Redis;
  return { redis, store };
}

function setup(): { store: Map<string, MockEntry>; reset: () => void } {
  const { redis, store } = makeMock();
  __setRedisForTests(redis);
  return {
    store,
    reset: () => __setRedisForTests(null),
  };
}

const EMAIL = 'regvash21@gmail.com';
const IP_V4 = '1.2.3.4';
const IP_V4_CLASS = 'ipv4-1.2.3.0/24';
const EMAIL_KEY_FAILS = `ucc:lockout:email:${EMAIL}:fails`;
const EMAIL_KEY_LOCK = `ucc:lockout:email:${EMAIL}:locked`;
const IP_KEY_FAILS = `ucc:lockout:ip:${IP_V4_CLASS}:fails`;
const IP_KEY_LOCK = `ucc:lockout:ip:${IP_V4_CLASS}:locked`;

// ────────────────────────────────────────────────────────────────────────
// Cases
// ────────────────────────────────────────────────────────────────────────

test('lockout — counter increments + TTL set on first INCR only', async () => {
  const { store, reset } = setup();
  try {
    await recordFailure(EMAIL, null);
    assert.equal(store.get(EMAIL_KEY_FAILS)?.value, 1);
    assert.equal(store.get(EMAIL_KEY_FAILS)?.ttlSeconds, __THRESHOLDS.EMAIL_FAIL_TTL_SECONDS);

    // Second failure: counter increments, TTL not re-applied (still 900)
    await recordFailure(EMAIL, null);
    assert.equal(store.get(EMAIL_KEY_FAILS)?.value, 2);
    assert.equal(store.get(EMAIL_KEY_FAILS)?.ttlSeconds, __THRESHOLDS.EMAIL_FAIL_TTL_SECONDS);
  } finally {
    reset();
  }
});

test('lockout — per-email threshold triggers lockout sentinel', async () => {
  const { store, reset } = setup();
  try {
    // 9 failures: counter at 9, no lockout
    for (let i = 0; i < 9; i++) await recordFailure(EMAIL, null);
    assert.equal(store.get(EMAIL_KEY_FAILS)?.value, 9);
    assert.equal(store.has(EMAIL_KEY_LOCK), false);

    // 10th failure: lockout fires
    await recordFailure(EMAIL, null);
    assert.equal(store.get(EMAIL_KEY_FAILS)?.value, 10);
    assert.equal(store.get(EMAIL_KEY_LOCK)?.value, '1');
    assert.equal(store.get(EMAIL_KEY_LOCK)?.ttlSeconds, __THRESHOLDS.EMAIL_FAIL_TTL_SECONDS);
  } finally {
    reset();
  }
});

test('lockout — per-IP threshold triggers (independent from email)', async () => {
  const { store, reset } = setup();
  try {
    // Different emails, same IP — IP counter accumulates
    for (let i = 0; i < 20; i++) {
      await recordFailure(`attacker${i}@example.com`, IP_V4);
    }
    assert.equal(store.get(IP_KEY_FAILS)?.value, 20);
    assert.equal(store.get(IP_KEY_LOCK)?.value, '1');
    assert.equal(store.get(IP_KEY_LOCK)?.ttlSeconds, __THRESHOLDS.IP_FAIL_TTL_SECONDS);
  } finally {
    reset();
  }
});

test('lockout — checkLockout returns email_locked when email sentinel set', async () => {
  const { store, reset } = setup();
  try {
    store.set(EMAIL_KEY_LOCK, { value: '1', ttlSeconds: 900 });
    const result = await checkLockout(EMAIL, null);
    assert.equal(result.locked, true);
    assert.equal(result.reason, 'email_locked');
  } finally {
    reset();
  }
});

test('lockout — checkLockout returns ip_locked when IP sentinel set', async () => {
  const { store, reset } = setup();
  try {
    store.set(IP_KEY_LOCK, { value: '1', ttlSeconds: 1800 });
    const result = await checkLockout(EMAIL, IP_V4);
    assert.equal(result.locked, true);
    assert.equal(result.reason, 'ip_locked');
  } finally {
    reset();
  }
});

test('lockout — email_locked takes precedence over ip_locked', async () => {
  const { store, reset } = setup();
  try {
    store.set(EMAIL_KEY_LOCK, { value: '1' });
    store.set(IP_KEY_LOCK, { value: '1' });
    const result = await checkLockout(EMAIL, IP_V4);
    assert.equal(result.locked, true);
    assert.equal(result.reason, 'email_locked');
  } finally {
    reset();
  }
});

test('lockout — checkLockout returns unlocked when neither sentinel set', async () => {
  const { reset } = setup();
  try {
    const result = await checkLockout(EMAIL, IP_V4);
    assert.equal(result.locked, false);
    assert.equal(result.reason, null);
  } finally {
    reset();
  }
});

test('lockout — clearFailures deletes both fails + locked keys per dimension', async () => {
  const { store, reset } = setup();
  try {
    store.set(EMAIL_KEY_FAILS, { value: 5 });
    store.set(EMAIL_KEY_LOCK, { value: '1' });
    store.set(IP_KEY_FAILS, { value: 8 });
    store.set(IP_KEY_LOCK, { value: '1' });

    // Clear email only — IP keys must remain
    await clearFailures(EMAIL, null);
    assert.equal(store.has(EMAIL_KEY_FAILS), false);
    assert.equal(store.has(EMAIL_KEY_LOCK), false);
    assert.equal(store.get(IP_KEY_FAILS)?.value, 8);
    assert.equal(store.get(IP_KEY_LOCK)?.value, '1');

    // Now clear IP
    await clearFailures(null, IP_V4);
    assert.equal(store.has(IP_KEY_FAILS), false);
    assert.equal(store.has(IP_KEY_LOCK), false);
  } finally {
    reset();
  }
});

test('lockout — clearFailures with both args clears all four keys', async () => {
  const { store, reset } = setup();
  try {
    store.set(EMAIL_KEY_FAILS, { value: 3 });
    store.set(EMAIL_KEY_LOCK, { value: '1' });
    store.set(IP_KEY_FAILS, { value: 4 });
    store.set(IP_KEY_LOCK, { value: '1' });

    await clearFailures(EMAIL, IP_V4);
    assert.equal(store.size, 0);
  } finally {
    reset();
  }
});

test('lockout — IPv6 truncation produces ipv6-XXXX:XXXX:XXXX::/48 class', async () => {
  const { store, reset } = setup();
  try {
    const ipv6 = '2001:db8:abcd:1234:5678::1';
    const expectedClass = 'ipv6-2001:db8:abcd::/48';

    await recordFailure(null, ipv6);
    assert.equal(store.get(`ucc:lockout:ip:${expectedClass}:fails`)?.value, 1);

    // checkLockout uses the same truncation
    store.set(`ucc:lockout:ip:${expectedClass}:locked`, { value: '1' });
    const result = await checkLockout(null, ipv6);
    assert.equal(result.locked, true);
    assert.equal(result.reason, 'ip_locked');
  } finally {
    reset();
  }
});
