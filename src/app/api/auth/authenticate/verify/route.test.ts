// FIT-156 (T8) — POST /api/auth/authenticate/verify route-handler tests.
//
// Covers the deterministic pre-crypto gates: bad JSON, missing fields, G3
// lockout (429), no-pending-challenge (400), unknown-credential (401), and the
// assertion-rejection path (garbage response → verify throws → 500). A real
// signed assertion is out of scope for a portable unit test (see round-trip.
// test.ts note) — FIT-155 Playwright smoke covers the signed happy path.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { POST } from './route';
import { installMockRedis } from '@/lib/auth/test-support/mock-redis';
import { jsonRequest, makeCredential } from '@/lib/auth/test-support/route-helpers';
import { setChallenge } from '@/lib/auth/redis-ttl-store';
import { storeCredential } from '@/lib/auth/redis-store';

const EMAIL = 'operator@example.com';
const CHALLENGE = 'stored-challenge-value';

function emailLockKey(email: string): string {
  return `ucc:lockout:email:${email.toLowerCase()}:locked`;
}

test('authenticate/verify — malformed JSON → 400 invalid_json', async () => {
  const { reset } = installMockRedis();
  try {
    const res = await POST(jsonRequest('{bad'));
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'invalid_json');
  } finally {
    reset();
  }
});

test('authenticate/verify — missing fields → 400 missing_fields', async () => {
  const { reset } = installMockRedis();
  try {
    const res = await POST(jsonRequest({ challengeKey: EMAIL })); // no response
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'missing_fields');
  } finally {
    reset();
  }
});

test('authenticate/verify — locked out → 429 locked_out', async () => {
  const { store, reset } = installMockRedis();
  try {
    store.set(emailLockKey(EMAIL), { value: '1' }); // seed lockout sentinel
    const res = await POST(
      jsonRequest({ challengeKey: EMAIL, email: EMAIL, response: { id: 'x' } }),
    );
    assert.equal(res.status, 429);
    assert.equal((await res.json()).error, 'locked_out');
  } finally {
    reset();
  }
});

test('authenticate/verify — no pending challenge → 400 no_pending_challenge', async () => {
  const { reset } = installMockRedis();
  try {
    const res = await POST(
      jsonRequest({ challengeKey: EMAIL, email: EMAIL, response: { id: 'x' } }),
    );
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'no_pending_challenge');
  } finally {
    reset();
  }
});

test('authenticate/verify — unknown credential → 401', async () => {
  const { reset } = installMockRedis();
  try {
    await setChallenge(EMAIL, CHALLENGE);
    const res = await POST(
      jsonRequest({ challengeKey: EMAIL, email: EMAIL, response: { id: 'no-such-cred' } }),
    );
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error, 'unknown_credential');
  } finally {
    reset();
  }
});

test('authenticate/verify — garbage assertion (cred present) → 500 server_error', async () => {
  const { reset } = installMockRedis();
  try {
    await setChallenge(EMAIL, CHALLENGE);
    const cred = makeCredential({ credentialID: 'Y3JlZC0x', ownerEmail: EMAIL });
    await storeCredential(cred);
    const res = await POST(
      jsonRequest({
        challengeKey: EMAIL,
        email: EMAIL,
        response: {
          id: cred.credentialID,
          rawId: cred.credentialID,
          response: { authenticatorData: '', clientDataJSON: '', signature: '' },
          type: 'public-key',
          clientExtensionResults: {},
        },
      }),
    );
    // verifyAuthenticationResponse throws on this garbage → caught → 500.
    assert.equal(res.status, 500);
    assert.equal((await res.json()).error, 'server_error');
  } finally {
    reset();
  }
});
