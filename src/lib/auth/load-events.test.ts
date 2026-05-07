// T24d — load-events + computeAuditStats tests.

import { test } from 'node:test';
import * as assert from 'node:assert';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const tmpFile = path.join(os.tmpdir(), `ucc-load-events-${Date.now()}.jsonl`);
process.env.UCC_AUDIT_LIVE_PATH = tmpFile;

import { loadAuthEvents, computeAuditStats } from './load-events';

const SECONDS = 1000;
const HOUR = 60 * 60 * SECONDS;
const DAY = 24 * HOUR;

function fixture(date: number, type: string, extras: Record<string, unknown> = {}) {
  return JSON.stringify({
    timestamp: new Date(date).toISOString(),
    event_type: type,
    schema_version: 1,
    operator_label: 'op',
    outcome: type.endsWith('_failed') ? 'error' : 'success',
    ...extras,
  });
}

test('loadAuthEvents returns newest first', async () => {
  const t1 = Date.now() - 2 * HOUR;
  const t2 = Date.now() - 1 * HOUR;
  await fs.writeFile(
    tmpFile,
    fixture(t1, 'auth_passkey_authenticate_succeeded') + '\n' +
      fixture(t2, 'auth_passkey_authenticate_failed') + '\n',
  );
  const events = await loadAuthEvents();
  assert.strictEqual(events.length, 2);
  assert.strictEqual(events[0].event_type, 'auth_passkey_authenticate_failed');
});

test('computeAuditStats counts registered + 7d auths + 7d fails', async () => {
  const now = Date.now();
  const lines = [
    fixture(now - 1 * HOUR, 'auth_passkey_register_completed'),
    fixture(now - 2 * HOUR, 'auth_passkey_authenticate_succeeded'),
    fixture(now - 3 * HOUR, 'auth_passkey_authenticate_succeeded'),
    fixture(now - 4 * HOUR, 'auth_passkey_authenticate_failed'),
    fixture(now - 30 * DAY, 'auth_passkey_authenticate_succeeded'),
  ];
  await fs.writeFile(tmpFile, lines.join('\n') + '\n');
  const events = await loadAuthEvents();
  const stats = await computeAuditStats(events);
  assert.strictEqual(stats.registeredCount, 1);
  assert.strictEqual(stats.authsLast7d, 2);
  assert.strictEqual(stats.failsLast7d, 1);
});

test('suspicious banner triggers on 3+ fails in last hour', async () => {
  const now = Date.now();
  const lines = [
    fixture(now - 10 * SECONDS, 'auth_passkey_authenticate_failed'),
    fixture(now - 20 * SECONDS, 'auth_passkey_authenticate_failed'),
    fixture(now - 30 * SECONDS, 'auth_passkey_authenticate_failed'),
  ];
  await fs.writeFile(tmpFile, lines.join('\n') + '\n');
  const events = await loadAuthEvents();
  const stats = await computeAuditStats(events);
  assert.ok(stats.suspiciousReasons.some((r) => r.includes('failed sign-ins')));
});

test('suspicious banner triggers on revoke in last 24h', async () => {
  const now = Date.now();
  const lines = [
    fixture(now - 2 * HOUR, 'auth_passkey_revoked'),
  ];
  await fs.writeFile(tmpFile, lines.join('\n') + '\n');
  const events = await loadAuthEvents();
  const stats = await computeAuditStats(events);
  assert.ok(stats.suspiciousReasons.some((r) => r.toLowerCase().includes('revoked')));
});
