// FIT-156 (T8) — POST /api/auth/register/verify route-handler tests.
//
// Covers the deterministic pre-crypto gates + the attestation-rejection path.
// A real attestation requires a hardware/virtual authenticator (round-trip.
// test.ts note) — the signed happy path is covered by FIT-155 staging smoke.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { POST } from './route';
import { installMockRedis } from '@/lib/auth/test-support/mock-redis';
import { jsonRequest } from '@/lib/auth/test-support/route-helpers';
import { setChallenge } from '@/lib/auth/redis-ttl-store';

const EMAIL = 'operator@example.com';

function emailLockKey(email: string): string {
  return `ucc:lockout:email:${email.toLowerCase()}:locked`;
}

test('register/verify — malformed JSON → 400 invalid_json', async () => {
  const { reset } = installMockRedis();
  try {
    const res = await POST(jsonRequest('{bad'));
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'invalid_json');
  } finally {
    reset();
  }
});

test('register/verify — missing fields → 400 missing_fields', async () => {
  const { reset } = installMockRedis();
  try {
    const res = await POST(jsonRequest({ email: EMAIL })); // no response
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'missing_fields');
  } finally {
    reset();
  }
});

test('register/verify — locked out → 429 locked_out', async () => {
  const { store, reset } = installMockRedis();
  try {
    store.set(emailLockKey(EMAIL), { value: '1' });
    const res = await POST(jsonRequest({ email: EMAIL, response: { id: 'x' } }));
    assert.equal(res.status, 429);
    assert.equal((await res.json()).error, 'locked_out');
  } finally {
    reset();
  }
});

test('register/verify — no pending challenge → 400 no_pending_challenge', async () => {
  const { reset } = installMockRedis();
  try {
    const res = await POST(jsonRequest({ email: EMAIL, response: { id: 'x' } }));
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'no_pending_challenge');
  } finally {
    reset();
  }
});

test('register/verify — garbage attestation (challenge present) → 500 server_error', async () => {
  const { reset } = installMockRedis();
  try {
    await setChallenge(EMAIL, 'stored-challenge');
    const res = await POST(
      jsonRequest({
        email: EMAIL,
        response: {
          id: 'x',
          rawId: 'x',
          response: { attestationObject: '', clientDataJSON: '' },
          type: 'public-key',
          clientExtensionResults: {},
        },
      }),
    );
    assert.equal(res.status, 500);
    assert.equal((await res.json()).error, 'server_error');
  } finally {
    reset();
  }
});
