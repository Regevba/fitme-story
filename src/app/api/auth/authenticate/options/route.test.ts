// FIT-156 (T8) — POST /api/auth/authenticate/options route-handler tests.
//
// Exercises the real handler against an in-memory Redis (via __setRedisForTests)
// and the real @simplewebauthn option generator. Covers conditional-UI (no
// email) + email-scoped allowCredentials filtering + challenge persistence.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { POST } from './route';
import { installMockRedis } from '@/lib/auth/test-support/mock-redis';
import { jsonRequest, makeCredential } from '@/lib/auth/test-support/route-helpers';
import { storeCredential } from '@/lib/auth/redis-store';

test('authenticate/options — conditional UI (no email) returns options + synthetic challengeKey', async () => {
  const { store, reset } = installMockRedis();
  try {
    const res = await POST(jsonRequest({}));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.options.challenge, 'challenge present');
    assert.match(body.challengeKey, /^conditional:/);
    // Challenge persisted under the synthetic key.
    assert.ok(store.get(`ucc:challenge:${body.challengeKey}`), 'challenge stored');
    // Conditional path has no allowCredentials.
    assert.equal(body.options.allowCredentials, undefined);
  } finally {
    reset();
  }
});

test('authenticate/options — email-scoped returns allowCredentials excluding revoked', async () => {
  const { store, reset } = installMockRedis();
  try {
    const email = 'operator@example.com';
    await storeCredential(makeCredential({ credentialID: 'YWN0aXZl', ownerEmail: email }));
    await storeCredential(
      makeCredential({ credentialID: 'cmV2b2tlZA', ownerEmail: email, revokedAt: 123 }),
    );

    const res = await POST(jsonRequest({ email }));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.challengeKey, email);
    const ids = body.options.allowCredentials.map((c: { id: string }) => c.id);
    assert.deepEqual(ids, ['YWN0aXZl'], 'only the non-revoked credential is offered');
    assert.ok(store.get(`ucc:challenge:${email}`), 'challenge stored under email key');
  } finally {
    reset();
  }
});

test('authenticate/options — malformed JSON body degrades to conditional UI', async () => {
  const { reset } = installMockRedis();
  try {
    const res = await POST(jsonRequest('{not-json'));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.match(body.challengeKey, /^conditional:/);
  } finally {
    reset();
  }
});
