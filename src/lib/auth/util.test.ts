// T24b — util tests.

import { test } from 'node:test';
import * as assert from 'node:assert';
import { sha256Hex, sha256Truncated, ipClass, uaFamily, newSid, newBootstrapToken } from './util.js';

test('sha256Hex is deterministic + 64 hex chars', () => {
  const a = sha256Hex('hello');
  const b = sha256Hex('hello');
  assert.strictEqual(a, b);
  assert.strictEqual(a.length, 64);
  assert.match(a, /^[0-9a-f]+$/);
});

test('sha256Truncated returns sha256:<2N hex>', () => {
  const t = sha256Truncated('payload', 12);
  assert.match(t, /^sha256:[0-9a-f]{24}$/);
});

test('newSid + newBootstrapToken return distinct base64url strings', () => {
  const a = newSid();
  const b = newSid();
  assert.notStrictEqual(a, b);
  assert.match(a, /^[A-Za-z0-9_-]+$/);
  const t = newBootstrapToken();
  // 32 bytes → 43 base64url chars
  assert.strictEqual(t.length, 43);
});

test('ipClass truncates IPv4 to /24 + IPv6 to /48', () => {
  assert.strictEqual(ipClass('203.0.113.42'), 'ipv4-203.0.113.0/24');
  assert.strictEqual(ipClass('2001:db8:cafe::1'), 'ipv6-2001:db8:cafe::/48');
  assert.strictEqual(ipClass(''), 'unknown');
  assert.strictEqual(ipClass('garbage'), 'unknown');
});

test('uaFamily classifies common browsers', () => {
  assert.strictEqual(
    uaFamily('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'),
    'Safari/macOS',
  );
  assert.strictEqual(
    uaFamily('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120.0.0.0'),
    'Chrome/Windows',
  );
  assert.strictEqual(
    uaFamily('Mozilla/5.0 (Macintosh) Edg/120'),
    'Edge/Windows',
  );
  assert.strictEqual(uaFamily(undefined), 'unknown');
});
