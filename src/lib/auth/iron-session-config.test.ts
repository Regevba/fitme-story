// T24a — iron-session config tests.

import { test } from 'node:test';
import * as assert from 'node:assert';

process.env.UCC_SESSION_SECRET = 'a'.repeat(48);

import {
  sealSession,
  unsealSession,
  shouldRefresh,
  sessionConfig,
} from './iron-session-config';

test('seal then unseal returns the same payload', async () => {
  const sealed = await sealSession({ email: 'op@example.com', sid: 'sid-123' });
  assert.ok(typeof sealed === 'string' && sealed.length > 32);
  const unsealed = await unsealSession(sealed);
  assert.ok(unsealed);
  assert.strictEqual(unsealed!.email, 'op@example.com');
  assert.strictEqual(unsealed!.sid, 'sid-123');
  assert.ok(typeof unsealed!.iat === 'number');
  assert.ok(unsealed!.exp > unsealed!.iat);
});

test('unsealSession returns null on garbage input', async () => {
  assert.strictEqual(await unsealSession(''), null);
  assert.strictEqual(await unsealSession('not-a-real-cookie'), null);
});

test('sessionConfig exposes correct cookie scope', () => {
  assert.strictEqual(sessionConfig.cookieName, 'ucc-session');
  assert.strictEqual(sessionConfig.cookiePath, '/control-room');
  assert.strictEqual(sessionConfig.ttlSeconds, 24 * 60 * 60);
});

test('shouldRefresh returns true when payload is older than 12h', () => {
  const now = Math.floor(Date.now() / 1000);
  const fresh = { email: 'a@b.c', sid: 'x', iat: now, exp: now + 86400 };
  const stale = { email: 'a@b.c', sid: 'x', iat: now - 13 * 3600, exp: now + 11 * 3600 };
  assert.strictEqual(shouldRefresh(fresh), false);
  assert.strictEqual(shouldRefresh(stale), true);
});
