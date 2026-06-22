// scripts/sample-audit-log-contract.test.ts
//
// Tests for the E-15 audit-log canonical sampler's pure core. No Redis needed —
// buildAuditLogSample takes raw events directly.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAuditLogSample, redisConfigured } from './sample-audit-log-contract';

const NOW = new Date('2026-06-22T00:00:00Z');

describe('redisConfigured', () => {
  test('true with Upstash-native vars', () => {
    assert.equal(
      redisConfigured({ UPSTASH_REDIS_REST_URL: 'u', UPSTASH_REDIS_REST_TOKEN: 't' } as NodeJS.ProcessEnv),
      true,
    );
  });
  test('true with legacy KV vars', () => {
    assert.equal(
      redisConfigured({ KV_REST_API_URL: 'u', KV_REST_API_TOKEN: 't' } as NodeJS.ProcessEnv),
      true,
    );
  });
  test('false when token missing', () => {
    assert.equal(redisConfigured({ UPSTASH_REDIS_REST_URL: 'u' } as NodeJS.ProcessEnv), false);
  });
  test('false when nothing set', () => {
    assert.equal(redisConfigured({} as NodeJS.ProcessEnv), false);
  });
});

describe('buildAuditLogSample', () => {
  test('valid events → canonical meta + sanitized records', () => {
    const raw = [
      { event_type: 'sign_in', timestamp: '2026-06-21T10:00:00Z', operator_label: 'regev@example.com' },
      { event_type: 'register', timestamp: '2026-06-21T11:00:00Z' },
    ];
    const { records, meta, error } = buildAuditLogSample(raw, NOW);
    assert.equal(error, null);
    assert.equal(meta?.provenance, 'canonical');
    assert.equal(meta?.producer_repo, 'fitme-story');
    assert.equal(meta?.record_count, 2);
    assert.deepEqual(meta?.required_keys, ['event_type', 'timestamp']);
    // sanitize must strip raw operator_label and replace with a hash field
    assert.equal('operator_label' in records[0], false, 'raw PII must be stripped');
    assert.ok('operator_label_hash' in records[0], 'hashed field must be present');
  });

  test('empty producer output → soft "no events" error, no meta', () => {
    const { meta, error } = buildAuditLogSample([], NOW);
    assert.equal(meta, null);
    assert.match(error ?? '', /no events/);
  });

  test('producer drift (missing required key) → hard error', () => {
    const raw = [{ event_type: 'sign_in' /* timestamp missing */ }];
    const { error } = buildAuditLogSample(raw, NOW);
    assert.match(error ?? '', /producer drift.*timestamp/);
  });

  test('non-object events are filtered out before validation', () => {
    const raw = ['garbage', null, { event_type: 'sign_in', timestamp: '2026-06-21T10:00:00Z' }];
    const { records, error } = buildAuditLogSample(raw, NOW);
    assert.equal(error, null);
    assert.equal(records.length, 1);
  });

  test('meta sampled_at uses +00:00 offset form (matches FT2 sampler)', () => {
    const raw = [{ event_type: 'sign_in', timestamp: '2026-06-21T10:00:00Z' }];
    const { meta } = buildAuditLogSample(raw, NOW);
    assert.match(meta?.sampled_at as string, /\+00:00$/);
  });
});
