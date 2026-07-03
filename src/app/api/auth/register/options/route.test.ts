// FIT-156 (T8) — POST /api/auth/register/options route-handler tests.
//
// Covers the bootstrap-token gate + G1/G2 allowlist gates + happy-path option
// generation. Bootstrap records are seeded through the real ttl-store so the
// consume path (single-use + expiry) is exercised, not stubbed.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { POST } from './route';
import { installMockRedis } from '@/lib/auth/test-support/mock-redis';
import { jsonRequest, withAuthEnv } from '@/lib/auth/test-support/route-helpers';
import { storeBootstrap } from '@/lib/auth/redis-ttl-store';
import { sha256Hex } from '@/lib/auth/util';

const EMAIL = 'operator@example.com';
const TOKEN = 'bootstrap-token-abc';

async function seedBootstrap(email = EMAIL, token = TOKEN): Promise<void> {
  await storeBootstrap(sha256Hex(token), email);
}

test('register/options — malformed JSON → 400 invalid_json', async () => {
  const { reset } = installMockRedis();
  try {
    const res = await POST(jsonRequest('{bad'));
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'invalid_json');
  } finally {
    reset();
  }
});

test('register/options — missing bootstrapToken → 400', async () => {
  const { reset } = installMockRedis();
  try {
    const res = await POST(jsonRequest({}));
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'missing_bootstrap_token');
  } finally {
    reset();
  }
});

test('register/options — unknown bootstrap token → 401 bootstrap_invalid', async () => {
  const { reset } = installMockRedis();
  try {
    const res = await POST(jsonRequest({ bootstrapToken: 'never-issued' }));
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error, 'bootstrap_invalid');
  } finally {
    reset();
  }
});

test('register/options — allowlist unset → 403 allowlist_unset', async () => {
  const { reset } = installMockRedis();
  const restoreEnv = withAuthEnv({ allowedEmails: '' });
  try {
    await seedBootstrap();
    const res = await POST(jsonRequest({ bootstrapToken: TOKEN }));
    assert.equal(res.status, 403);
    assert.equal((await res.json()).error, 'allowlist_unset');
  } finally {
    restoreEnv();
    reset();
  }
});

test('register/options — email not allowlisted → 403 email_not_allowlisted', async () => {
  const { reset } = installMockRedis();
  const restoreEnv = withAuthEnv({ allowedEmails: 'someone-else@example.com' });
  try {
    await seedBootstrap();
    const res = await POST(jsonRequest({ bootstrapToken: TOKEN }));
    assert.equal(res.status, 403);
    assert.equal((await res.json()).error, 'email_not_allowlisted');
  } finally {
    restoreEnv();
    reset();
  }
});

test('register/options — allowlisted operator → 200 registration options', async () => {
  const { store, reset } = installMockRedis();
  const restoreEnv = withAuthEnv({ allowedEmails: `${EMAIL}, other@example.com` });
  try {
    await seedBootstrap();
    const res = await POST(jsonRequest({ bootstrapToken: TOKEN }));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.options.challenge, 'challenge present');
    assert.equal(body.options.user.name, EMAIL);
    // Challenge persisted for the assertion round-trip.
    assert.ok(store.get(`ucc:challenge:${EMAIL}`), 'challenge stored under email key');
  } finally {
    restoreEnv();
    reset();
  }
});
