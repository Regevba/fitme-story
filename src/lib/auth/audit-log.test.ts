// T24c — audit log writer tests.

import { test } from 'node:test';
import * as assert from 'node:assert';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const tmpFile = path.join(os.tmpdir(), `ucc-audit-test-${Date.now()}.jsonl`);
process.env.UCC_AUDIT_LIVE_PATH = tmpFile;
process.env.UCC_AUDIT_BLOB_ENDPOINT = '';

import { logAuthEvent, readAuthEvents } from './audit-log';

test('logAuthEvent writes one JSONL line per call', async () => {
  await fs.rm(tmpFile, { force: true });
  await logAuthEvent({
    event_type: 'auth_passkey_authenticate_succeeded',
    operator_label: 'op-mbp',
    outcome: 'success',
    credential_id: 'rawCredentialIDABC123',
    ip: '203.0.113.42',
    user_agent: 'Mozilla/5.0 (Macintosh) Safari/605',
    session_id: 'sid-secret-xyz',
    duration_ms: 412,
  });
  const lines = await readAuthEvents();
  assert.strictEqual(lines.length, 1);
});

test('PII fields are redacted (raw credential_id, raw ip, raw ua, raw session_id are absent)', async () => {
  await fs.rm(tmpFile, { force: true });
  const SECRET_ID = 'rawCredentialIDXYZ987';
  const SECRET_IP = '198.51.100.77';
  const SECRET_UA = 'PrivacyShouldNotLog';
  const SECRET_SID = 'sid-keep-this-secret';
  await logAuthEvent({
    event_type: 'auth_passkey_authenticate_succeeded',
    operator_label: 'op',
    outcome: 'success',
    credential_id: SECRET_ID,
    ip: SECRET_IP,
    user_agent: SECRET_UA,
    session_id: SECRET_SID,
  });
  const raw = await fs.readFile(tmpFile, 'utf8');
  assert.ok(!raw.includes(SECRET_ID), 'raw credential_id leaked');
  assert.ok(!raw.includes(SECRET_IP), 'raw IP leaked');
  assert.ok(!raw.includes(SECRET_UA), 'raw UA leaked');
  assert.ok(!raw.includes(SECRET_SID), 'raw session_id leaked');
  assert.ok(raw.includes('sha256:'), 'expected sha256-prefixed hash');
  assert.ok(raw.includes('ipv4-198.51.100.0/24'), 'expected truncated IP class');
});

test('failure event preserves the reason vocabulary', async () => {
  await fs.rm(tmpFile, { force: true });
  await logAuthEvent({
    event_type: 'auth_passkey_authenticate_failed',
    operator_label: 'op',
    outcome: 'error',
    reason: 'counter_replay',
  });
  const lines = (await readAuthEvents()) as Array<{ reason: string }>;
  assert.strictEqual(lines[0].reason, 'counter_replay');
});
