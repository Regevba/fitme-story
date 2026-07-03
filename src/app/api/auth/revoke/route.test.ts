// FIT-156 (T8) — POST /api/auth/revoke route-handler tests.
//
// Session-gated (defense-in-depth re-check). Mocks next/headers cookies() the
// same way as the devices test, then drives the auth gate + revoke logic +
// session-clear-on-self-revoke against the mock Redis.

import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

import { installMockRedis } from '@/lib/auth/test-support/mock-redis';
import {
  jsonRequest,
  makeCredential,
  TEST_SESSION_SECRET,
} from '@/lib/auth/test-support/route-helpers';
import { sealSession, sessionConfig } from '@/lib/auth/iron-session-config';
import { mintSession, getSession } from '@/lib/auth/redis-ttl-store';
import { storeCredential, getCredential } from '@/lib/auth/redis-store';

process.env.UCC_SESSION_SECRET = TEST_SESSION_SECRET;

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

async function loadPOST() {
  return (await import('./route')).POST;
}

const EMAIL = 'operator@example.com';

/** Seal + mint a live session; returns the sid. */
async function authenticate(sid = 'sid-live', email = EMAIL): Promise<string> {
  await mintSession(sid, email);
  cookieValue = await sealSession({ email, sid });
  return sid;
}

test('revoke — no session cookie → 401 unauthorized', async () => {
  const { reset } = installMockRedis();
  cookieValue = undefined;
  try {
    const POST = await loadPOST();
    const res = await POST(jsonRequest({ credentialID: 'x' }));
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error, 'unauthorized');
  } finally {
    reset();
  }
});

test('revoke — authed + malformed JSON → 400 invalid_json', async () => {
  const { reset } = installMockRedis();
  try {
    await authenticate();
    const POST = await loadPOST();
    const res = await POST(jsonRequest('{bad'));
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'invalid_json');
  } finally {
    cookieValue = undefined;
    reset();
  }
});

test('revoke — authed + missing credentialID → 400', async () => {
  const { reset } = installMockRedis();
  try {
    await authenticate();
    const POST = await loadPOST();
    const res = await POST(jsonRequest({}));
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'missing_credential_id');
  } finally {
    cookieValue = undefined;
    reset();
  }
});

test('revoke — authed + unknown credential → 404', async () => {
  const { reset } = installMockRedis();
  try {
    await authenticate();
    const POST = await loadPOST();
    const res = await POST(jsonRequest({ credentialID: 'no-such-cred' }));
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error, 'unknown_credential');
  } finally {
    cookieValue = undefined;
    reset();
  }
});

test('revoke — authed revoke of own credential → 200 + credential marked revoked + sessions cleared', async () => {
  const { reset } = installMockRedis();
  try {
    const sid = await authenticate();
    const credID = 'b3duLWNyZWQ';
    await storeCredential(makeCredential({ credentialID: credID, ownerEmail: EMAIL }));

    const POST = await loadPOST();
    const res = await POST(jsonRequest({ credentialID: credID }));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });

    const after = await getCredential(credID);
    assert.ok(after?.revokedAt, 'credential marked revoked');
    // Self-revoke clears the operator's sessions (force re-auth everywhere).
    assert.equal(await getSession(sid), null, 'session revoked');
  } finally {
    cookieValue = undefined;
    reset();
  }
});
