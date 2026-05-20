// allowlist.test.ts — G1+G2 email allowlist gate (ucc-passkey-auth-security-hardening, 2026-05-20).
//
// Uses node:test runner pattern (matches util.test.ts / audit-log.test.ts).
// Manipulates process.env.UCC_ALLOWED_EMAILS per case + restores after.

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  allowlistIsConfigured,
  allowlistSize,
  isEmailAllowed,
} from './allowlist';

const ENV_VAR = 'UCC_ALLOWED_EMAILS';

function withEnv(value: string | undefined, fn: () => void): void {
  const original = process.env[ENV_VAR];
  if (value === undefined) {
    delete process.env[ENV_VAR];
  } else {
    process.env[ENV_VAR] = value;
  }
  try {
    fn();
  } finally {
    if (original === undefined) {
      delete process.env[ENV_VAR];
    } else {
      process.env[ENV_VAR] = original;
    }
  }
}

test('allowlist — single email exact match', () => {
  withEnv('regvash21@gmail.com', () => {
    assert.equal(isEmailAllowed('regvash21@gmail.com'), true);
    assert.equal(allowlistSize(), 1);
    assert.equal(allowlistIsConfigured(), true);
  });
});

test('allowlist — case-insensitive match (mixed-case stored OR queried)', () => {
  withEnv('regvash21@gmail.com', () => {
    assert.equal(isEmailAllowed('Regvash21@Gmail.com'), true);
    assert.equal(isEmailAllowed('REGVASH21@GMAIL.COM'), true);
  });
  withEnv('Regvash21@Gmail.COM', () => {
    assert.equal(isEmailAllowed('regvash21@gmail.com'), true);
  });
});

test('allowlist — whitespace trimming on both env value and query', () => {
  withEnv(' regvash21@gmail.com , other@example.com ', () => {
    assert.equal(allowlistSize(), 2);
    assert.equal(isEmailAllowed('regvash21@gmail.com'), true);
    assert.equal(isEmailAllowed('other@example.com'), true);
    assert.equal(isEmailAllowed('  regvash21@gmail.com  '), true);
  });
});

test('allowlist — multiple emails comma-separated', () => {
  withEnv('a@example.com,b@example.com,c@example.com', () => {
    assert.equal(allowlistSize(), 3);
    assert.equal(isEmailAllowed('a@example.com'), true);
    assert.equal(isEmailAllowed('b@example.com'), true);
    assert.equal(isEmailAllowed('c@example.com'), true);
    assert.equal(isEmailAllowed('d@example.com'), false);
  });
});

test('allowlist — unset env returns empty Set + isConfigured=false', () => {
  withEnv(undefined, () => {
    assert.equal(allowlistSize(), 0);
    assert.equal(allowlistIsConfigured(), false);
    assert.equal(isEmailAllowed('regvash21@gmail.com'), false);
  });
});

test('allowlist — empty string env behaves like unset (fail-closed)', () => {
  withEnv('', () => {
    assert.equal(allowlistSize(), 0);
    assert.equal(allowlistIsConfigured(), false);
    assert.equal(isEmailAllowed('regvash21@gmail.com'), false);
  });
  withEnv('  ,  ,  ', () => {
    // All-whitespace entries also collapse to empty
    assert.equal(allowlistSize(), 0);
    assert.equal(allowlistIsConfigured(), false);
  });
});

test('allowlist — empty/null/undefined query email returns false', () => {
  withEnv('regvash21@gmail.com', () => {
    assert.equal(isEmailAllowed(''), false);
    assert.equal(isEmailAllowed(null as unknown as string), false);
    assert.equal(isEmailAllowed(undefined as unknown as string), false);
  });
});
