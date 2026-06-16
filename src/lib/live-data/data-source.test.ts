/**
 * Tests for the live-or-snapshot data source (UCC live-feed Phase 2).
 *
 * Two surfaces:
 *  - Pure extractors (extractJson/extractText/extractKeys) — value-shape +
 *    missing-key + malformed-string handling, no fetch/env.
 *  - Async accessors with NO FT2_STATE_BLOB_URL — must short-circuit to null/[]
 *    WITHOUT fetching, which is the zero-behavior-change fallback contract.
 */

import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  extractJson,
  extractText,
  extractKeys,
  getBundleJson,
  getBundleText,
  listBundleKeys,
  getDataOrigin,
  isLiveConfigured,
  type StateBundle,
} from './data-source';

const bundle: StateBundle = {
  schema_version: 1,
  generated_at: '2026-06-16T00:00:00Z',
  commit_sha: 'abc1234',
  files: {
    'shared/health-status.json': { version: '1.2' }, // pre-parsed object
    'shared/external-sync-status.json': '{"version":"1.1"}', // raw JSON string
    'shared/bad.json': '{not valid json', // malformed string
    'integrity/gate-coverage-ft2.jsonl': '{"gate":"X"}\n{"gate":"Y"}\n', // raw text
    'features/garmin.json': { feature: 'garmin', current_phase: 'complete' },
    'features/ucc.json': { feature: 'ucc', current_phase: 'complete' },
  },
};

describe('pure extractors', () => {
  test('extractJson — pre-parsed object', () => {
    assert.deepEqual(extractJson(bundle, 'shared/health-status.json'), { version: '1.2' });
  });
  test('extractJson — raw JSON string is parsed', () => {
    assert.deepEqual(extractJson(bundle, 'shared/external-sync-status.json'), { version: '1.1' });
  });
  test('extractJson — malformed string -> null (caller falls back)', () => {
    assert.equal(extractJson(bundle, 'shared/bad.json'), null);
  });
  test('extractJson — missing key -> null', () => {
    assert.equal(extractJson(bundle, 'shared/nope.json'), null);
  });
  test('extractJson — null bundle -> null', () => {
    assert.equal(extractJson(null, 'shared/health-status.json'), null);
  });

  test('extractText — raw text passthrough', () => {
    assert.match(extractText(bundle, 'integrity/gate-coverage-ft2.jsonl')!, /"gate":"X"/);
  });
  test('extractText — object stringified', () => {
    assert.equal(extractText(bundle, 'shared/health-status.json'), '{"version":"1.2"}');
  });
  test('extractText — missing key + null bundle -> null', () => {
    assert.equal(extractText(bundle, 'nope'), null);
    assert.equal(extractText(null, 'shared/health-status.json'), null);
  });

  test('extractKeys — prefix filter', () => {
    assert.deepEqual(extractKeys(bundle, 'features/').sort(), ['features/garmin.json', 'features/ucc.json']);
  });
  test('extractKeys — null bundle -> []', () => {
    assert.deepEqual(extractKeys(null, 'features/'), []);
  });
});

describe('async accessors — no blob configured (fallback contract)', () => {
  let saved: string | undefined;
  beforeEach(() => { saved = process.env.FT2_STATE_BLOB_URL; delete process.env.FT2_STATE_BLOB_URL; });
  afterEach(() => { if (saved === undefined) delete process.env.FT2_STATE_BLOB_URL; else process.env.FT2_STATE_BLOB_URL = saved; });

  test('isLiveConfigured -> false without env', () => {
    assert.equal(isLiveConfigured(), false);
  });
  test('getBundleJson -> null (no fetch, no throw)', async () => {
    assert.equal(await getBundleJson('shared/health-status.json'), null);
  });
  test('getBundleText -> null', async () => {
    assert.equal(await getBundleText('integrity/gate-coverage-ft2.jsonl'), null);
  });
  test('listBundleKeys -> []', async () => {
    assert.deepEqual(await listBundleKeys('features/'), []);
  });
  test('getDataOrigin -> snapshot', async () => {
    const origin = await getDataOrigin();
    assert.equal(origin.origin, 'snapshot');
    assert.equal(origin.blobGeneratedAt, null);
  });
});

describe('isLiveConfigured reflects env presence', () => {
  test('true when set', () => {
    const saved = process.env.FT2_STATE_BLOB_URL;
    process.env.FT2_STATE_BLOB_URL = 'https://example.com/bundle.json';
    try {
      assert.equal(isLiveConfigured(), true);
    } finally {
      if (saved === undefined) delete process.env.FT2_STATE_BLOB_URL;
      else process.env.FT2_STATE_BLOB_URL = saved;
    }
  });
});
