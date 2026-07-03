// FIT-156 (T8) — GET /api/auth/devices route-handler tests.
//
// Session-gated route. Mocks next/headers `cookies()` (which throws outside a
// Next request scope) via node:test module mocking, driving a real sealed
// iron-session cookie + real session/credential storage through the mock Redis.

import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

import { installMockRedis } from '@/lib/auth/test-support/mock-redis';
import {
  getRequest,
  makeCredential,
  TEST_SESSION_SECRET,
} from '@/lib/auth/test-support/route-helpers';
import { sealSession, sessionConfig } from '@/lib/auth/iron-session-config';
import { mintSession } from '@/lib/auth/redis-ttl-store';
import { storeCredential } from '@/lib/auth/redis-store';

process.env.UCC_SESSION_SECRET = TEST_SESSION_SECRET;

// Mutable cookie the mocked cookies().get() returns; set per-test.
let cookieValue: string | undefined;
mock.module('next/headers', {
  namedExports: {
    cookies: async () => ({
      get: (name: string) =>
        cookieValue !== undefined && name === sessionConfig.cookieName
          ? { value: cookieValue }
          : undefined,
    }),
  },
});

// Imported inside each test (after the sync module mock is registered). tsx
// compiles .test.ts as CJS where top-level await is unavailable; the import
// cache means this resolves once and the mock still applies.
async function loadGET() {
  return (await import('./route')).GET;
}

const EMAIL = 'operator@example.com';

test('devices — no session cookie → 401 unauthorized', async () => {
  const { reset } = installMockRedis();
  cookieValue = undefined;
  try {
    const GET = await loadGET();
    const res = await GET(getRequest());
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error, 'unauthorized');
  } finally {
    reset();
  }
});

test('devices — valid cookie but session not in store → 401 session_not_found', async () => {
  const { reset } = installMockRedis();
  try {
    cookieValue = await sealSession({ email: EMAIL, sid: 'sid-orphan' });
    // deliberately do NOT mintSession → getSession returns null
    const GET = await loadGET();
    const res = await GET(getRequest());
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error, 'session_not_found');
  } finally {
    cookieValue = undefined;
    reset();
  }
});

test('devices — authed → 200 lists credentials with publicKey stripped', async () => {
  const { reset } = installMockRedis();
  try {
    const sid = 'sid-live';
    await mintSession(sid, EMAIL);
    cookieValue = await sealSession({ email: EMAIL, sid });
    await storeCredential(makeCredential({ credentialID: 'ZGV2LTE', ownerEmail: EMAIL, label: 'Laptop' }));
    await storeCredential(makeCredential({ credentialID: 'ZGV2LTI', ownerEmail: EMAIL, label: 'Phone' }));

    const GET = await loadGET();
    const res = await GET(getRequest());
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.credentials.length, 2);
    const labels = body.credentials.map((c: { label: string }) => c.label).sort();
    assert.deepEqual(labels, ['Laptop', 'Phone']);
    // publicKey must not leak to the dashboard payload.
    assert.ok(body.credentials.every((c: Record<string, unknown>) => !('publicKey' in c)));
  } finally {
    cookieValue = undefined;
    reset();
  }
});
